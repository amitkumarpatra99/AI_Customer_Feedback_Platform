// import { NextResponse } from "next/server";
// import { getSession } from "@/lib/auth";
// import prisma from "@/lib/db";
// import { z } from "zod";

// const feedbackSchema = z.object({
//   content: z.string().min(1),
//   channel: z.enum(["Support ticket", "App store review", "NPS survey", "Sales call note", "Community post"]),
//   sourceRef: z.string().optional(),
//   customerLabel: z.string().optional()
// });

// export async function GET(req: Request) {
//   try {
//     const session = await getSession();
//     if (!session) {
//       return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
//     }

//     const { searchParams } = new URL(req.url);
//     const channel = searchParams.get("channel");
//     const sentiment = searchParams.get("sentiment");
//     const status = searchParams.get("status");
//     const search = searchParams.get("search");
//     const page = parseInt(searchParams.get("page") || "1");
//     const limit = parseInt(searchParams.get("limit") || "10");
//     const skip = (page - 1) * limit;

//     // Build filter query
//     const where: any = {
//       workspaceId: session.user.workspaceId
//     };

//     if (channel) where.channel = channel;
//     if (sentiment) where.sentiment = sentiment;
//     if (status) where.status = status;
//     if (search) {
//       where.content = {
//         contains: search,
//         mode: "insensitive"
//       };
//     }

//     const [items, total] = await Promise.all([
//       prisma.feedback.findMany({
//         where,
//         skip,
//         take: limit,
//         orderBy: { createdAt: "desc" },
//         include: {
//           themes: {
//             include: { theme: true }
//           }
//         }
//       }),
//       prisma.feedback.count({ where })
//     ]);

//     return NextResponse.json({
//       items,
//       pagination: {
//         page,
//         limit,
//         total,
//         pages: Math.ceil(total / limit)
//       }
//     });
//   } catch (error: any) {
//     console.error("API GET feedback error:", error);
//     return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
//   }
// }

// export async function POST(req: Request) {
//   try {
//     const session = await getSession();
//     if (!session) {
//       return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
//     }

//     if (session.user.role === "VIEWER") {
//       return NextResponse.json({ error: "Forbidden: Read-only access" }, { status: 403 });
//     }

//     const body = await req.json();
//     const result = feedbackSchema.safeParse(body);
//     if (!result.success) {
//       return NextResponse.json({ error: "Invalid Input", details: result.error.format() }, { status: 400 });
//     }

//     const feedback = await prisma.feedback.create({
//       data: {
//         ...result.data,
//         sentiment: "NEU",
//         sentimentScore: 0,
//         status: "NEW",
//         workspaceId: session.user.workspaceId
//       }
//     });

//     // TODO: Enqueue for AI classification (AI1)

//     return NextResponse.json(feedback, { status: 201 });
//   } catch (error: any) {
//     console.error("API POST feedback error:", error);
//     return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
//   }
// }




import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// GET: Feedbacks ko fetch aur filter karo
export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const workspaceId = session.user.workspaceId;
  const { searchParams } = new URL(request.url);
  
  const search = searchParams.get("search") || "";
  const sentiment = searchParams.get("sentiment") || "";
  const status = searchParams.get("status") || "";

  // Dynamic WHERE clause banana (Multi-tenant safe)
  const whereClause: any = { workspaceId };

  if (search) {
    whereClause.content = { contains: search, mode: "insensitive" };
  }
  if (sentiment && sentiment !== "ALL") {
    whereClause.sentiment = sentiment;
  }
  if (status && status !== "ALL") {
    whereClause.status = status;
  }

  try {
    const feedbacks = await prisma.feedback.findMany({
      where: whereClause,
      include: {
        themes: {
          include: { theme: true }
        }
      },
      orderBy: { createdAt: "desc" },
      take: 50 // Pagination ke liye (abhi 50 dikhayenge)
    });

    // Data ko clean format mein bhejo
    const formattedFeedbacks = feedbacks.map(f => ({
      id: f.id,
      content: f.content,
      channel: f.channel,
      sentiment: f.sentiment,
      status: f.status,
      createdAt: f.createdAt,
      themes: f.themes.map(ft => ft.theme.name)
    }));

    return NextResponse.json(formattedFeedbacks);

  } catch (error) {
    console.error("Feedback fetch error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST: Manually create feedback with local AI sentiment scoring
export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  
  if (!session || session.user.role === "VIEWER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { content, channel, customerLabel } = body;

    if (!content) {
      return NextResponse.json({ error: "Content is required" }, { status: 400 });
    }

    // Heuristics for local AI sentiment score mapping
    const negativeWords = ["bad", "crash", "issue", "problem", "hate", "slow", "broken", "worst", "terrible", "bug", "fail"];
    const positiveWords = ["good", "love", "awesome", "great", "excellent", "fast", "gorgeous", "saved", "recommend", "solved"];
    
    let sentiment = "NEUTRAL";
    let sentimentScore = 0.0;

    const lowerContent = content.toLowerCase();
    const isNegative = negativeWords.some(word => lowerContent.includes(word));
    const isPositive = positiveWords.some(word => lowerContent.includes(word));

    if (isNegative && !isPositive) {
      sentiment = "NEGATIVE";
      sentimentScore = -0.7;
    } else if (isPositive && !isNegative) {
      sentiment = "POSITIVE";
      sentimentScore = 0.8;
    }

    const feedback = await prisma.feedback.create({
      data: {
        content,
        channel,
        customerLabel: customerLabel || null,
        sentiment: sentiment as any,
        sentimentScore,
        status: "NEW",
        workspaceId: session.user.workspaceId,
      },
    });

    return NextResponse.json(feedback, { status: 201 });
  } catch (error) {
    console.error("Feedback create error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}