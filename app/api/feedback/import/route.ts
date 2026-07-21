import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { PrismaClient, Sentiment, Channel, Status } from "@prisma/client";
import Papa from "papaparse";

const prisma = new PrismaClient();

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  
  // Security: Sirf Admin aur Analyst upload kar sakte hain
  if (!session || session.user.role === "VIEWER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    // 1. File ko text mein convert karo
    const text = await file.text();
    
    // 2. PapaParse se CSV ko JSON mein badlo
    const parsed = Papa.parse(text, { 
      header: true, 
      skipEmptyLines: true 
    });
    
    const rows = parsed.data as any[];

    if (rows.length === 0) {
      return NextResponse.json({ error: "CSV file is empty" }, { status: 400 });
    }

    // Valid Prisma Enum channels
    const validChannels = ["SUPPORT_TICKET", "APP_STORE", "NPS_SURVEY", "SALES_CALL", "COMMUNITY", "OTHER"];

    // 3. Har row ko process karo aur AI sentiment lagao
    const feedbacksToCreate = rows.map(row => {
      const content = row.content || row.feedback || row.text; // Flexible column names
      const rawChannel = (row.channel || "OTHER").toUpperCase();
      const customerLabel = row.customerLabel || row.customer || "Unknown";

      // Simple AI Logic
      const negativeWords = ["bad", "crash", "issue", "problem", "hate", "slow", "broken", "worst", "terrible", "frustrating", "confusing"];
      const isNegative = negativeWords.some(word => content.toLowerCase().includes(word));

      const validChannel = Object.values(Channel).includes(rawChannel as Channel) 
        ? (rawChannel as Channel) 
        : Channel.OTHER;

      return {
        content: content,
        channel: validChannel,
        customerLabel: customerLabel,
        sentiment: isNegative ? Sentiment.NEGATIVE : Sentiment.POSITIVE,
        sentimentScore: isNegative ? -0.8 : 0.8,
        status: Status.NEW,
        workspaceId: session.user.workspaceId,
      };
    });

    // 4. Database mein bulk insert karo
    await prisma.feedback.createMany({
      data: feedbacksToCreate,
    });

    return NextResponse.json({ 
      success: true, 
      message: `Successfully imported ${feedbacksToCreate.length} feedbacks!` 
    }, { status: 201 });

  } catch (error) {
    console.error("CSV Import error:", error);
    return NextResponse.json({ error: "Failed to process CSV file" }, { status: 500 });
  }
}