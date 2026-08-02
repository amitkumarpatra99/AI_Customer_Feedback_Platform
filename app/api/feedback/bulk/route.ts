import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// POST: Bulk update status of multiple feedback logs
export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  
  if (!session || session.user.role === "VIEWER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { ids, status } = body;

    if (!ids || !Array.isArray(ids) || ids.length === 0 || !status) {
      return NextResponse.json({ error: "Invalid parameters" }, { status: 400 });
    }

    const updated = await prisma.feedback.updateMany({
      where: {
        id: { in: ids },
        workspaceId: session.user.workspaceId
      },
      data: { status }
    });

    return NextResponse.json({ success: true, count: updated.count });
  } catch (error) {
    console.error("Bulk update error:", error);
    return NextResponse.json({ error: "Failed to perform bulk update" }, { status: 500 });
  }
}

// DELETE: Bulk delete multiple feedback logs
export async function DELETE(request: Request) {
  const session = await getServerSession(authOptions);
  
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { ids } = body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ error: "Invalid parameters" }, { status: 400 });
    }

    const deleted = await prisma.feedback.deleteMany({
      where: {
        id: { in: ids },
        workspaceId: session.user.workspaceId
      }
    });

    return NextResponse.json({ success: true, count: deleted.count });
  } catch (error) {
    console.error("Bulk delete error:", error);
    return NextResponse.json({ error: "Failed to perform bulk deletion" }, { status: 500 });
  }
}
