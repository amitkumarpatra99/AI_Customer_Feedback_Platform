import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const workspaceId = session.user.workspaceId;
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  try {
    // 1. Basic Stats
    const totalFeedbacks = await prisma.feedback.count({ where: { workspaceId } });
    const negativeFeedbacks = await prisma.feedback.count({ 
      where: { workspaceId, sentiment: "NEGATIVE" } 
    });
    const newThisWeek = await prisma.feedback.count({
      where: { 
        workspaceId, 
        createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } 
      }
    });
    const actionedFeedbacks = await prisma.feedback.count({
      where: { workspaceId, status: "ACTIONED" }
    });
    const actionRate = totalFeedbacks > 0 ? Math.round((actionedFeedbacks / totalFeedbacks) * 100) : 0;

    // 2. Sentiment Breakdown
    const sentimentData = await prisma.feedback.groupBy({
      by: ["sentiment"],
      where: { workspaceId },
      _count: { sentiment: true }
    });

    // 3. Volume Over Time (Last 30 Days)
    const recentFeedbacks = await prisma.feedback.findMany({
      where: { workspaceId, createdAt: { gte: thirtyDaysAgo } },
      select: { createdAt: true },
      orderBy: { createdAt: "asc" }
    });

    // Group by date for chart
    const volumeByDate = recentFeedbacks.reduce((acc: Record<string, number>, curr) => {
      const date = curr.createdAt.toISOString().split("T")[0];
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {});

    const volumeChartData = Object.entries(volumeByDate).map(([date, count]) => ({
      date: new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      count
    }));

    // 4. Top Themes
    const themeData = await prisma.theme.findMany({
      where: { workspaceId },
      include: {
        _count: { select: { feedbacks: true } }
      },
      orderBy: {
        feedbacks: { _count: "desc" }
      },
      take: 5
    });

    const topThemes = themeData.map(t => ({
      name: t.name,
      count: t._count.feedbacks,
      color: t.color
    }));

    return NextResponse.json({
      stats: { totalFeedbacks, negativeFeedbacks, newThisWeek, actionRate },
      sentiment: sentimentData.map(s => ({ name: s.sentiment, value: s._count.sentiment })),
      volume: volumeChartData,
      themes: topThemes
    });

  } catch (error) {
    console.error("Dashboard stats error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 }); // 👈 Bas "9." hata diya
  }
}