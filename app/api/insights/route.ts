import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { findSimilarFeedback } from "@/lib/search";
import { generateAnswer } from "@/lib/ai";
import { z } from "zod";

const askSchema = z.object({
  question: z.string().min(1)
});

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const result = askSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json({ error: "Invalid Input", details: result.error.format() }, { status: 400 });
    }

    const { question } = result.data;

    // 1. Retrieve similar feedback records (RAG / Grounding context)
    const contextItems = await findSimilarFeedback(question, session.user.workspaceId, 5);

    // 2. Format context items for Claude
    const formattedContext = contextItems.map((item, idx) => ({
      index: idx,
      content: item.content,
      channel: item.channel
    }));

    // 3. Ask Claude for the grounded answer
    const answerResult = await generateAnswer(question, formattedContext);

    return NextResponse.json({
      answer: answerResult.answer,
      contextUsed: contextItems.map(item => ({
        id: item.id,
        content: item.content,
        channel: item.channel,
        sentiment: item.sentiment
      }))
    });
  } catch (error: any) {
    console.error("API POST insights error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
