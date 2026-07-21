import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const days = parseInt(searchParams.get("days") || "30"); // Default 30 days
  
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  try {
    const workspaceId = session.user.workspaceId;

    // 1. Sentiment Trend (Daily breakdown)
    const feedbacks = await prisma.feedback.findMany({
      where: { 
        workspaceId,
        createdAt: { gte: startDate }
      },
      select: {
        sentiment: true,
        channel: true,
        status: true,
        createdAt: true,
        themes: {
          include: { theme: { select: { name: true } } }
        }
      }
    });

    const totalItems = feedbacks.length;
    const positive = feedbacks.filter(f => f.sentiment === "POSITIVE").length;
    const neutral = feedbacks.filter(f => f.sentiment === "NEUTRAL").length;
    const negative = feedbacks.filter(f => f.sentiment === "NEGATIVE").length;

    // 3. Top Themes
    const themeCounts: Record<string, number> = {};
    feedbacks.forEach(f => {
      f.themes.forEach(ft => {
        const name = ft.theme.name;
        themeCounts[name] = (themeCounts[name] || 0) + 1;
      });
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

  } catch (error) {
    console.error("Reports error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}