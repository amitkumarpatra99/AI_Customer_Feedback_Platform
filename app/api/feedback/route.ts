


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