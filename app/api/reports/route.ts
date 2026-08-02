import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { PrismaClient } from "@prisma/client";
import { generateVoCReport } from "@/lib/ai";
import { z } from "zod";

const prisma = new PrismaClient();

const reportSchema = z.object({
  title: z.string().min(1),
  periodStart: z.string().datetime(),
  periodEnd: z.string().datetime()
});

// GET: Returns list of VoC reports OR reports analytics charts data
export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const isCharts = searchParams.get("charts") === "true";
  const workspaceId = session.user.workspaceId;

  // Case 1: Return Charts Analytics Data (origin/main behavior)
  if (isCharts) {
    const days = parseInt(searchParams.get("days") || "30"); // Default 30 days
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    try {
      // 1. Fetch all feedbacks for the given period
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

      // 2. Aggregate: Sentiment Trend (Daily breakdown)
      const sentimentByDate: Record<string, { POSITIVE: number; NEGATIVE: number; NEUTRAL: number }> = {};
      feedbacks.forEach(f => {
        const date = f.createdAt.toISOString().split("T")[0];
        if (!sentimentByDate[date]) {
          sentimentByDate[date] = { POSITIVE: 0, NEGATIVE: 0, NEUTRAL: 0 };
        }
        sentimentByDate[date][f.sentiment as "POSITIVE" | "NEGATIVE" | "NEUTRAL"]++;
      });

      const sentimentTrend = Object.entries(sentimentByDate)
        .map(([date, counts]) => ({
          date: new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
          ...counts
        }))
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

      // 3. Aggregate: Channel Performance
      const channelCounts: Record<string, number> = {};
      feedbacks.forEach(f => {
        channelCounts[f.channel] = (channelCounts[f.channel] || 0) + 1;
      });

      const channelReport = Object.entries(channelCounts).map(([channel, count]) => ({
        channel: channel.replace("_", " "),
        count
      })).sort((a, b) => b.count - a.count);

      // 4. Aggregate: Top Themes
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

      // 5. Aggregate: Summary Stats
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
      console.error("Charts reports API error:", error);
      return NextResponse.json({ error: "Failed to generate charts" }, { status: 500 });
    }
  }

  // Case 2: Return List of Generated VoC Reports (HEAD behavior)
  try {
    const reports = await prisma.report.findMany({
      where: { workspaceId },
      orderBy: { createdAt: "desc" },
      include: {
        generatedBy: {
          select: { name: true }
        }
      }
    });

    return NextResponse.json(reports);
  } catch (error) {
    console.error("API GET reports error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// POST: Generate a new AI VoC narrative report and save to DB (HEAD behavior)
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  
  if (!session || session.user.role === "VIEWER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const body = await req.json();
    const result = reportSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json({ error: "Invalid Input", details: result.error.format() }, { status: 400 });
    }

    const { title, periodStart, periodEnd } = result.data;
    const startDate = new Date(periodStart);
    const endDate = new Date(periodEnd);

    // 1. Fetch feedbacks for the selected range
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

    // Generate narrative
    const reportNarrative = await generateVoCReport(title, {
      totalItems,
      sentimentBreakdown: { positive, neutral, negative },
      topThemes: [{ name: "General Feedback", count: totalItems }],
      representativeQuotes: feedbacks.slice(0, 3).map(f => f.content)
    });

    // 2. Save the report to database
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
  } catch (error) {
    console.error("API POST reports error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}