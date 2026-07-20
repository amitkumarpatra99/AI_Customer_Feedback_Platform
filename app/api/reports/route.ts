import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import prisma from "@/lib/db";
import { generateVoCReport } from "@/lib/ai";
import { z } from "zod";

const reportSchema = z.object({
  title: z.string().min(1),
  periodStart: z.string().datetime(),
  periodEnd: z.string().datetime()
});

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const reports = await prisma.report.findMany({
      where: { workspaceId: session.user.workspaceId },
      orderBy: { createdAt: "desc" }
    });

    return NextResponse.json(reports);
  } catch (error: any) {
    console.error("API GET reports error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role === "VIEWER") {
      return NextResponse.json({ error: "Forbidden: Read-only access" }, { status: 403 });
    }

    const body = await req.json();
    const result = reportSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json({ error: "Invalid Input", details: result.error.format() }, { status: 400 });
    }

    const { title, periodStart, periodEnd } = result.data;
    const startDate = new Date(periodStart);
    const endDate = new Date(periodEnd);

    // 1. Pre-compute period statistics
    const feedbacks = await prisma.feedback.findMany({
      where: {
        workspaceId: session.user.workspaceId,
        createdAt: {
          gte: startDate,
          lte: endDate
        }
      }
    });

    const totalItems = feedbacks.length;
    const positive = feedbacks.filter(f => f.sentiment === "POSITIVE").length;
    const neutral = feedbacks.filter(f => f.sentiment === "NEUTRAL").length;
    const negative = feedbacks.filter(f => f.sentiment === "NEGATIVE").length;

    // Get mock themes and representative quotes for the stub
    const reportNarrative = await generateVoCReport(title, {
      totalItems,
      sentimentBreakdown: { positive, neutral, negative },
      topThemes: [{ name: "General Feedback", count: totalItems }],
      representativeQuotes: feedbacks.slice(0, 3).map(f => f.content)
    });

    // 2. Save the report to the database
    const report = await prisma.report.create({
      data: {
        title,
        periodStart: startDate,
        periodEnd: endDate,
        contentJson: JSON.stringify({
          narrative: reportNarrative,
          stats: {
            totalItems,
            positive,
            neutral,
            negative
          }
        }),
        workspaceId: session.user.workspaceId,
        generatedById: session.user.id
      }
    });

    return NextResponse.json(report, { status: 201 });
  } catch (error: any) {
    console.error("API POST reports error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
