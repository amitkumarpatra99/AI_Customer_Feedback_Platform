import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Prisma } from "@prisma/client";
import prisma from "@/lib/db";
import { Channel, Sentiment, Status } from "@/types";

const allowedPeriods = ["7", "30", "90", "ALL"] as const;

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const daysParam = searchParams.get("days") ?? "30";
  const channel = searchParams.get("channel") ?? "ALL";

  if (
    !allowedPeriods.includes(daysParam as (typeof allowedPeriods)[number]) ||
    (channel !== "ALL" && !Object.values(Channel).includes(channel as Channel))
  ) {
    return NextResponse.json({ error: "Invalid dashboard filters" }, { status: 400 });
  }

  const workspaceId = session.user.workspaceId;
  const days = daysParam === "ALL" ? null : Number(daysParam);
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);

  const dateFilter = days
    ? new Date(today.getTime() - (days - 1) * 24 * 60 * 60 * 1000)
    : null;
  const volumeStart = dateFilter ?? new Date(today.getTime() - 29 * 24 * 60 * 60 * 1000);

  const baseWhere: Prisma.FeedbackWhereInput = { workspaceId };
  if (dateFilter) {
    baseWhere.createdAt = { gte: dateFilter };
  }
  if (channel !== "ALL") {
    baseWhere.channel = channel;
  }

  const newThisWeekWhere: Prisma.FeedbackWhereInput = {
    workspaceId,
    createdAt: { gte: new Date(today.getTime() - 6 * 24 * 60 * 60 * 1000) },
  };
  if (channel !== "ALL") {
    newThisWeekWhere.channel = channel;
  }

  try {
    const [
      totalFeedbacks,
      negativeFeedbacks,
      newThisWeek,
      actionedFeedbacks,
      sentimentData,
      volumeRecords,
      themeCounts,
    ] = await Promise.all([
      prisma.feedback.count({ where: baseWhere }),
      prisma.feedback.count({ where: { ...baseWhere, sentiment: Sentiment.NEGATIVE } }),
      prisma.feedback.count({ where: newThisWeekWhere }),
      prisma.feedback.count({ where: { ...baseWhere, status: Status.ACTIONED } }),
      prisma.feedback.groupBy({
        by: ["sentiment"],
        where: baseWhere,
        _count: { sentiment: true },
      }),
      prisma.feedback.findMany({
        where: {
          ...baseWhere,
          createdAt: { gte: volumeStart },
        },
        select: { createdAt: true },
        orderBy: { createdAt: "asc" },
      }),
      prisma.feedbackTheme.groupBy({
        by: ["themeId"],
        where: { feedback: { is: baseWhere } },
        _count: { _all: true },
      }),
    ]);

    const actionRate =
      totalFeedbacks > 0 ? Math.round((actionedFeedbacks / totalFeedbacks) * 100) : 0;

    const volumeByDate = volumeRecords.reduce((counts: Record<string, number>, feedback) => {
      const date = feedback.createdAt.toISOString().slice(0, 10);
      counts[date] = (counts[date] ?? 0) + 1;
      return counts;
    }, {});

    const volumeChartData = [];
    for (let date = new Date(volumeStart); date <= today; date.setUTCDate(date.getUTCDate() + 1)) {
      const dateKey = date.toISOString().slice(0, 10);
      volumeChartData.push({
        date: new Intl.DateTimeFormat("en-US", {
          month: "short",
          day: "numeric",
          timeZone: "UTC",
        }).format(date),
        count: volumeByDate[dateKey] ?? 0,
      });
    }

    const topThemeCounts = themeCounts
      .sort((a, b) => b._count._all - a._count._all)
      .slice(0, 5);
    const themes = await prisma.theme.findMany({
      where: {
        workspaceId,
        id: { in: topThemeCounts.map((theme) => theme.themeId) },
      },
      select: { id: true, name: true, color: true },
    });
    const themesById = new Map(themes.map((theme) => [theme.id, theme]));
    const topThemes = topThemeCounts.flatMap(({ themeId, _count }) => {
      const theme = themesById.get(themeId);
      return theme ? [{ name: theme.name, count: _count._all, color: theme.color }] : [];
    });

    const sentimentResponse = [
      { name: Sentiment.POSITIVE, value: 0 },
      { name: Sentiment.NEUTRAL, value: 0 },
      { name: Sentiment.NEGATIVE, value: 0 },
    ];

    sentimentData.forEach(({ sentiment, _count }) => {
      const entry = sentimentResponse.find((item) => item.name === sentiment);
      if (entry) {
        entry.value = _count.sentiment;
      }
    });

    return NextResponse.json({
      stats: { totalFeedbacks, negativeFeedbacks, newThisWeek, actionRate },
      sentiment: sentimentResponse,
      volume: volumeChartData,
      themes: topThemes,
    });
  } catch (error) {
    console.error("Dashboard stats error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
