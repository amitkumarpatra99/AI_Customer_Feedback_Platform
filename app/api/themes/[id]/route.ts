import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { PrismaClient } from "@prisma/client";
import { z } from "zod";

const prisma = new PrismaClient();

const updateThemeSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  color: z.string().optional()
});

// PATCH: Update a theme tag
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  
  if (!session || session.user.role === "VIEWER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const { id } = await params;
    const body = await request.json();
    const result = updateThemeSchema.safeParse(body);
    
    if (!result.success) {
      return NextResponse.json({ error: "Invalid inputs", details: result.error.format() }, { status: 400 });
    }

    const updatedTheme = await prisma.theme.update({
      where: {
        id,
        workspaceId: session.user.workspaceId
      },
      data: result.data
    });

    return NextResponse.json(updatedTheme);
  } catch (error) {
    console.error("Update theme error:", error);
    return NextResponse.json({ error: "Failed to update theme" }, { status: 500 });
  }
}

// DELETE: Delete a theme tag
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized: Admins only" }, { status: 403 });
  }

  try {
    const { id } = await params;

    await prisma.theme.delete({
      where: {
        id,
        workspaceId: session.user.workspaceId
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete theme error:", error);
    return NextResponse.json({ error: "Failed to delete theme" }, { status: 500 });
  }
}
