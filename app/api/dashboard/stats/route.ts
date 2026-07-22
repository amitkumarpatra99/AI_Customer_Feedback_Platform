import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { PrismaClient } from "@prisma/client";
import { Sentiment, Status } from "@/types";

const prisma = new PrismaClient();

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const daysParam = searchParams.get("days"); // "7", "30", "90", "ALL"
  const channel = searchParams.get("channel") || "ALL";

  const workspaceId = session.user.workspaceId;

  // Calculate dynamic date filter
  let dateFilter: Date | null = null;
  if (daysParam && daysParam !== "ALL") {
    const days = parseInt(daysParam);
    if (!isNaN(days)) {
      dateFilter = new Date();
      dateFilter.setDate(dateFilter.getDate() - days);
    }
  } else if (!daysParam) {
    // Default to last 30 days if not specified (legacy behavior)
    dateFilter = new Date();
    dateFilter.setDate(dateFilter.getDate() - 30);
  }

  // Common filters
  const baseWhere: any = { workspaceId };
  if (dateFilter) {
    baseWhere.createdAt = { gte: dateFilter };
  }
  if (channel && channel !== "ALL") {
    baseWhere.channel = channel;
  }

  try {
    // 1. Basic Stats
    const totalFeedbacks = await prisma.feedback.count({ where: baseWhere });
    
    const negativeWhere = { ...baseWhere, sentiment: Sentiment.NEGATIVE };
    const negativeFeedbacks = await prisma.feedback.count({ where: negativeWhere });
    
    const newThisWeekWhere: any = {
      workspaceId,
      createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
    };
    if (channel && channel !== "ALL") {
      newThisWeekWhere.channel = channel;
    }
    const newThisWeek = await prisma.feedback.count({ where: newThisWeekWhere });
    
    const actionedWhere = { ...baseWhere, status: Status.ACTIONED };
    const actionedFeedbacks = await prisma.feedback.count({ where: actionedWhere });
    const actionRate = totalFeedbacks > 0 ? Math.round((actionedFeedbacks / totalFeedbacks) * 100) : 0;

    // 2. Sentiment Breakdown
    const sentimentData = await prisma.feedback.groupBy({
      by: ["sentiment"],
      where: baseWhere,
      _count: { sentiment: true }
    });

    // 3. Volume Over Time
    const recentFeedbacks = await prisma.feedback.findMany({
      where: baseWhere,
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

    // 4. Top Themes (Filtered dynamically by date & channel)
    const themeData = await prisma.theme.findMany({
      where: { workspaceId },
      include: {
        feedbacks: {
          include: {
            feedback: true
          }
        }
      }
    });

    const topThemes = themeData.map(t => {
      const filteredFeedbacks = t.feedbacks.filter(ft => {
        if (!ft.feedback) return false;
        const matchesDate = dateFilter ? ft.feedback.createdAt >= dateFilter : true;
        const matchesChannel = (channel && channel !== "ALL") ? ft.feedback.channel === channel : true;
        return matchesDate && matchesChannel;
      });
      return {
        name: t.name,
        count: filteredFeedbacks.length,
        color: t.color
      };
    })
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

    // Format sentiment data to include missing types if zero
    const sentimentResponse = [
      { name: "POSITIVE", value: 0 },
      { name: "NEUTRAL", value: 0 },
      { name: "NEGATIVE", value: 0 }
    ];

    sentimentData.forEach(s => {
      const idx = sentimentResponse.findIndex(r => r.name === s.sentiment);
      if (idx !== -1) {
        sentimentResponse[idx].value = s._count.sentiment;
      }
    });

    return NextResponse.json({
      stats: { totalFeedbacks, negativeFeedbacks, newThisWeek, actionRate },
      sentiment: sentimentResponse,
      volume: volumeChartData,
      themes: topThemes
    });

  } catch (error) {
    console.error("Dashboard stats error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}