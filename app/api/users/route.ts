import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { PrismaClient, Role } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const users = await prisma.user.findMany({
    where: { workspaceId: session.user.workspaceId },
    select: { id: true, name: true, email: true, role: true, createdAt: true },
    orderBy: { createdAt: "desc" }
  });

  return NextResponse.json(users);
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const body = await request.json();
  const { email, role, name, password } = body;

  if (!email || !role) {
    return NextResponse.json({ error: "Email and role are required" }, { status: 400 });
  }

  const existingUser = await prisma.user.findFirst({
    where: { email, workspaceId: session.user.workspaceId }
  });

  if (existingUser) {
    return NextResponse.json({ error: "User already exists in this workspace" }, { status: 400 });
  }

  const newUser = await prisma.user.create({
    data: {
      name: name || email.split('@')[0],
      email,
      role: role as Role,
      // ✅ FIX: Admin jo password dega wo set hoga, warna default "Temp@123"
      passwordHash: password || "Temp@123", 
      workspaceId: session.user.workspaceId
    }
  });

  return NextResponse.json({ ...newUser, tempPassword: newUser.passwordHash }, { status: 201 });
}