import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// GET: Specific feedback ki detail lao
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> } // 👈 Type ko Promise banaya
) {
  // 👈 Yahan params ko await kiya
  const { id } = await params; 
  const session = await getServerSession(authOptions);
  
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const feedback = await prisma.feedback.findFirst({
    where: { 
      id: id, // 👈 Ab 'id' variable use kar rahe hain
      workspaceId: session.user.workspaceId 
    },
    include: { 
      themes: { include: { theme: true } } 
    }
  });

  if (!feedback) {
    return NextResponse.json({ error: "Feedback not found" }, { status: 404 });
  }

  return NextResponse.json(feedback);
}

// PATCH: Feedback ka status update karo
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> } // 👈 Type ko Promise banaya
) {
  // 👈 Yahan params ko await kiya
  const { id } = await params;
  const session = await getServerSession(authOptions);
  
  // Security: Viewer status change nahi kar sakta
  if (!session || session.user.role === "VIEWER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const body = await request.json();
  const { status } = body;

  if (!status) {
    return NextResponse.json({ error: "Status is required" }, { status: 400 });
  }

  const updatedFeedback = await prisma.feedback.update({
    where: { id: id }, // 👈 Ab 'id' variable use kar rahe hain
    data: { status }
  });

  return NextResponse.json(updatedFeedback);
}