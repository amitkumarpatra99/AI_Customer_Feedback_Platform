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

    // Sentiment by date
    const sentimentByDate: Record<string, { POSITIVE: number; NEGATIVE: number; NEUTRAL: number }> = {};
    feedbacks.forEach(f => {
      const date = f.createdAt.toISOString().split("T")[0];
      if (!sentimentByDate[date]) {
        sentimentByDate[date] = { POSITIVE: 0, NEGATIVE: 0, NEUTRAL: 0 };
      }
      sentimentByDate[date][f.sentiment]++;
    });

    const sentimentTrend = Object.entries(sentimentByDate)
      .map(([date, counts]) => ({
        date: new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        ...counts
      }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    // 2. Channel Performance
    const channelCounts: Record<string, number> = {};
    feedbacks.forEach(f => {
      channelCounts[f.channel] = (channelCounts[f.channel] || 0) + 1;
    });

    const channelReport = Object.entries(channelCounts).map(([channel, count]) => ({
      channel: channel.replace("_", " "),
      count
    })).sort((a, b) => b.count - a.count);

    // 3. Top Themes
    const themeCounts: Record<string, number> = {};
    feedbacks.forEach(f => {
      f.themes.forEach(ft => {
        const name = ft.theme.name;
        themeCounts[name] = (themeCounts[name] || 0) + 1;
      });
    });

    const topThemes = Object.entries(themeCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // 4. Action Rate
    const totalFeedbacks = feedbacks.length;
    const actionedFeedbacks = feedbacks.filter(f => f.status === "ACTIONED").length;
    const actionRate = totalFeedbacks > 0 ? Math.round((actionedFeedbacks / totalFeedbacks) * 100) : 0;

    return NextResponse.json({
      sentimentTrend,
      channelReport,
      topThemes,
      summary: {
        totalFeedbacks,
        actionedFeedbacks,
        actionRate,
        period: `Last ${days} days`
      }
    });

  } catch (error) {
    console.error("Reports error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}