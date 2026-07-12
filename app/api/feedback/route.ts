import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import prisma from "@/lib/db";
import { z } from "zod";

const feedbackSchema = z.object({
  content: z.string().min(1),
  channel: z.enum(["Support ticket", "App store review", "NPS survey", "Sales call note", "Community post"]),
  sourceRef: z.string().optional(),
  customerLabel: z.string().optional()
});

export async function GET(req: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const channel = searchParams.get("channel");
    const sentiment = searchParams.get("sentiment");
    const status = searchParams.get("status");
    const search = searchParams.get("search");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const skip = (page - 1) * limit;

    // Build filter query
    const where: any = {
      workspaceId: session.user.workspaceId
    };

    if (channel) where.channel = channel;
    if (sentiment) where.sentiment = sentiment;
    if (status) where.status = status;
    if (search) {
      where.content = {
        contains: search,
        mode: "insensitive"
      };
    }

    const [items, total] = await Promise.all([
      prisma.feedback.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          themes: {
            include: { theme: true }
          }
        }
      }),
      prisma.feedback.count({ where })
    ]);

    return NextResponse.json({
      items,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error: any) {
    console.error("API GET feedback error:", error);
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
    const result = feedbackSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json({ error: "Invalid Input", details: result.error.format() }, { status: 400 });
    }

    const feedback = await prisma.feedback.create({
      data: {
        ...result.data,
        sentiment: "NEU",
        sentimentScore: 0,
        status: "NEW",
        workspaceId: session.user.workspaceId
      }
    });

    // TODO: Enqueue for AI classification (AI1)

    return NextResponse.json(feedback, { status: 201 });
  } catch (error: any) {
    console.error("API POST feedback error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
