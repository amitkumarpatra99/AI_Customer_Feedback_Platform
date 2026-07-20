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

  try {
    // Themes ko unke feedback count ke hisaab se sort karo (sabse zyada wale upar)
    const themes = await prisma.theme.findMany({
      where: { workspaceId: session.user.workspaceId },
      include: {
        _count: { select: { feedbacks: true } },
        feedbacks: {
          take: 5, // Preview ke liye sirf top 5 feedbacks lao
          include: {
            feedback: {
              select: { id: true, content: true, sentiment: true, status: true }
            }
          },
          orderBy: { feedback: { createdAt: "desc" } }
        }
      },
      orderBy: {
        feedbacks: { _count: "desc" }
      }
    });

    return NextResponse.json(themes);
  } catch (error) {
    console.error("Themes fetch error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}