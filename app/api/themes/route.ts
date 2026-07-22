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

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (session.user.role === "VIEWER") {
    return NextResponse.json({ error: "Forbidden: Read-only access" }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { name, description, color } = body;

    if (!name || name.trim() === "") {
      return NextResponse.json({ error: "Theme name is required" }, { status: 400 });
    }

    // Same theme name shouldn't exist twice in a workspace
    const existing = await prisma.theme.findFirst({
      where: {
        name: { equals: name.trim() },
        workspaceId: session.user.workspaceId
      }
    });

    if (existing) {
      return NextResponse.json({ error: "A theme tag with this name already exists" }, { status: 400 });
    }

    const theme = await prisma.theme.create({
      data: {
        name: name.trim(),
        description: description || "",
        color: color || "#3b82f6",
        workspaceId: session.user.workspaceId
      }
    });

    return NextResponse.json(theme, { status: 201 });
  } catch (error) {
    console.error("API POST themes error:", error);
    return NextResponse.json({ error: "Failed to create theme tag" }, { status: 500 });
  }
}