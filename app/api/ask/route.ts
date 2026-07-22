import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { query } = body;

  if (!query || query.trim() === "") {
    return NextResponse.json({ error: "Query is required" }, { status: 400 });
  }

  try {
    const lowerQuery = query.toLowerCase();
    
    // 1. Smart Keyword Extraction (Mock AI Logic)
    const isNegative = lowerQuery.includes("negative") || lowerQuery.includes("bad") || lowerQuery.includes("complaint");
    const isPositive = lowerQuery.includes("positive") || lowerQuery.includes("good") || lowerQuery.includes("love");
    
    let sentimentFilter: any = undefined;
    if (isNegative) sentimentFilter = "NEGATIVE";
    else if (isPositive) sentimentFilter = "POSITIVE";

    // Extract potential theme keywords
    const themeKeywords = ["billing", "price", "login", "onboarding", "crash", "slow", "bug", "ui", "design", "feature", "support"];
    const matchedThemes = themeKeywords.filter(keyword => lowerQuery.includes(keyword));

    // 2. Database Search
    const whereClause: any = { workspaceId: session.user.workspaceId };
    
    if (sentimentFilter) {
      whereClause.sentiment = sentimentFilter;
    }
    
    if (matchedThemes.length > 0) {
      whereClause.OR = matchedThemes.map((theme: string) => ({
        content: { contains: theme }
      }));
    } else {
      // Agar koi specific keyword nahi mila, toh pure query se search karo
      whereClause.content = { contains: query };
    }

    const matchingFeedbacks = await prisma.feedback.findMany({
      where: whereClause,
      take: 5, // Top 5 relevant feedbacks dikhayenge
      orderBy: { createdAt: "desc" },
      select: { id: true, content: true, sentiment: true, status: true }
    });

    // 3. Generate "AI" Response
    let aiResponse = "";
    if (matchingFeedbacks.length === 0) {
      aiResponse = `I couldn't find any specific feedback matching "${query}". Try asking about "billing issues", "login problems", or "feature requests".`;
    } else {
      const sentimentText = sentimentFilter === "NEGATIVE" ? "negative " : sentimentFilter === "POSITIVE" ? "positive " : "";
      const themeText = matchedThemes.length > 0 ? `related to ${matchedThemes.join(", ")} ` : "";
      
      aiResponse = `I found ${matchingFeedbacks.length} ${sentimentText}feedbacks ${themeText}matching your query. Here are the most recent ones:\n\n`;
    }

    return NextResponse.json({
      response: aiResponse,
      feedbacks: matchingFeedbacks
    });

  } catch (error) {
    console.error("Ask LOOP error:", error);
    return NextResponse.json({ error: "Failed to process query" }, { status: 500 });
  }
}