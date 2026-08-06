import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { Role } from "@/types";
import bcrypt from "bcrypt";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, password, workspaceName } = body;

    // 1. Basic Validation
    if (!name || !email || !password || !workspaceName) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 });
    }

    // 2. Check if user already exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json({ error: "User with this email already exists" }, { status: 400 });
    }

    // 3. Create Workspace (Multi-tenant requirement)
    const workspace = await prisma.workspace.create({
      data: { name: workspaceName },
    });

    // 4. Create User with ADMIN role and securely hashed password
    const hashedPassword = await bcrypt.hash(password, 10);
    await prisma.user.create({
      data: {
        name,
        email,
        passwordHash: hashedPassword,
        role: Role.ADMIN,
        workspaceId: workspace.id,
      },
    });

    return NextResponse.json({ success: true, message: "Signup successful! Please login." }, { status: 201 });
    
  } catch (error) {
    console.error("Signup error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}