import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";

const CreateComponentSchema = z.object({
  code: z.string().min(1),
  prompt: z.string().min(1),
  provider: z.string(),
  version: z.number().optional().default(1),
});

/**
 * POST /api/projects/[id]/components - Save a generated component
 */
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { code, prompt, provider, version } = CreateComponentSchema.parse(body);

    const component = await prisma.component.create({
      data: {
        code,
        prompt,
        provider,
        version,
        projectId: id,
      },
    });

    return NextResponse.json(component, { status: 201 });
  } catch (error) {
    console.error("Error saving component:", error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request data", issues: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to save component" },
      { status: 500 }
    );
  }
}
