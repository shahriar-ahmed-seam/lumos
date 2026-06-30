import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";

// Schema validation
const CreateProjectSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
});

/**
 * GET /api/projects - List all projects
 */
export async function GET() {
  try {
    const projects = await prisma.project.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        _count: {
          select: {
            components: true,
            chats: true,
          },
        },
      },
    });

    return NextResponse.json(projects);
  } catch (error) {
    console.error("Error fetching projects:", error);
    return NextResponse.json(
      { error: "Failed to fetch projects" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/projects - Create a new project
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { title, description } = CreateProjectSchema.parse(body);

    const project = await prisma.project.create({
      data: {
        title,
        description,
      },
    });

    return NextResponse.json(project, { status: 201 });
  } catch (error) {
    console.error("Error creating project:", error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request data", issues: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to create project" },
      { status: 500 }
    );
  }
}
//      { status: 500 }
