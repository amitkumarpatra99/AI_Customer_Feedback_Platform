


// import { NextResponse } from "next/server";
// import { getServerSession } from "next-auth";
// import { authOptions } from "@/lib/auth";
// import { PrismaClient } from "@prisma/client";

// const prisma = new PrismaClient();

// // GET: Feedbacks ko fetch aur filter karo
// export async function GET(request: Request) {
//   const session = await getServerSession(authOptions);
  
//   if (!session) {
//     return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
//   }

//   const workspaceId = session.user.workspaceId;
//   const { searchParams } = new URL(request.url);
  
//   const search = searchParams.get("search") || "";
//   const sentiment = searchParams.get("sentiment") || "";
//   const status = searchParams.get("status") || "";

//   // Dynamic WHERE clause banana (Multi-tenant safe)
//   const whereClause: any = { workspaceId };

//   if (search) {
//     whereClause.content = { contains: search, mode: "insensitive" };
//   }
//   if (sentiment && sentiment !== "ALL") {
//     whereClause.sentiment = sentiment;
//   }
//   if (status && status !== "ALL") {
//     whereClause.status = status;
//   }

//   try {
//     const feedbacks = await prisma.feedback.findMany({
//       where: whereClause,
//       include: {
//         themes: {
//           include: { theme: true }
//         }
//       },
//       orderBy: { createdAt: "desc" },
//       take: 50 // Pagination ke liye (abhi 50 dikhayenge)
//     });

//     // Data ko clean format mein bhejo
//     const formattedFeedbacks = feedbacks.map(f => ({
//       id: f.id,
//       content: f.content,
//       channel: f.channel,
//       sentiment: f.sentiment,
//       status: f.status,
//       createdAt: f.createdAt,
//       themes: f.themes.map(ft => ft.theme.name)
//     }));

//     return NextResponse.json(formattedFeedbacks);

//   } catch (error) {
//     console.error("Feedback fetch error:", error);
//     return NextResponse.json({ error: "Internal server error" }, { status: 500 });
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
  const theme = searchParams.get("theme") || "";

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
  if (theme && theme !== "ALL") {
    whereClause.themes = {
      some: {
        theme: {
          name: theme
        }
      }
    };
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
      take: 100 // 👈 50 se badha kar 100 kar diya taaki zyada data dikhe
    });

    // Data ko clean format mein bhejo (Safe mapping with optional chaining)
    const formattedFeedbacks = feedbacks.map(f => ({
      id: f.id,
      content: f.content,
      channel: f.channel,
      sentiment: f.sentiment,
      status: f.status,
      createdAt: f.createdAt,
      themes: f.themes?.map(ft => ft.theme.name) || [] // 👈 Yahan safe mapping kiya (Crash nahi hoga)
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