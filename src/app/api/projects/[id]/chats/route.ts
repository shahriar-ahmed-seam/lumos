import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";

const CreateChatSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string().min(1),
  code: z.string().optional(),
});

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    const chats = await prisma.chat.findMany({
      where: { projectId: id },
      orderBy: { createdAt: "asc" },
    });

    return NextResponse.json(chats);
  } catch (error) {
    console.error("Error fetching chats:", error);
    return NextResponse.json(
      { error: "Failed to fetch chats" },
      { status: 500 }
    );
  }
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { role, content, code } = CreateChatSchema.parse(body);

    const messageContent = code ? `${content}\n\n---CODE---\n${code}` : content;

    const chat = await prisma.chat.create({
      data: {
        role,
        content: messageContent,
        projectId: id,
      },
    });

    return NextResponse.json({
      ...chat,
      code: code || undefined,
      content: content,
    }, { status: 201 });
  } catch (error) {
    console.error("Error saving chat:", error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request data", issues: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to save chat" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    await prisma.chat.deleteMany({
      where: { projectId: id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting chats:", error);
    return NextResponse.json(
      { error: "Failed to delete chats" },
      { status: 500 }
    );
  }
}
