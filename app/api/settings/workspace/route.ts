import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function PATCH(request: Request) {
  const session = await getServerSession(authOptions);
  
  // Security: Sirf Admin workspace settings change kar sakta hai
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized. Admin access required." }, { status: 403 });
  }

  const body = await request.json();
  const { workspaceName } = body;

  if (!workspaceName || workspaceName.trim().length < 3) {
    return NextResponse.json({ error: "Workspace name must be at least 3 characters." }, { status: 400 });
  }

  try {
    const updatedWorkspace = await prisma.workspace.update({
      where: { id: session.user.workspaceId },
      data: { name: workspaceName.trim() },
    });

    return NextResponse.json({ message: "Workspace updated successfully", workspace: updatedWorkspace });
  } catch (error) {
    console.error("Workspace update error:", error);
    return NextResponse.json({ error: "Failed to update workspace" }, { status: 500 });
  }
}