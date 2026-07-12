import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import prisma from "@/lib/db";
import { z } from "zod";

const themeSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  color: z.string().default("#3b82f6")
});

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const themes = await prisma.theme.findMany({
      where: { workspaceId: session.user.workspaceId },
      include: {
        _count: {
          select: { feedbacks: true }
        }
      }
    });

    return NextResponse.json(themes);
  } catch (error: any) {
    console.error("API GET themes error:", error);
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
    const result = themeSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json({ error: "Invalid Input", details: result.error.format() }, { status: 400 });
    }

    const theme = await prisma.theme.create({
      data: {
        ...result.data,
        workspaceId: session.user.workspaceId
      }
    });

    return NextResponse.json(theme, { status: 201 });
  } catch (error: any) {
    console.error("API POST themes error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
