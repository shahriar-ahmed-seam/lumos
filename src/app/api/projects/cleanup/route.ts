import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

/**
 * DELETE /api/projects/cleanup - Delete all projects with no components AND no chats
 */
export async function DELETE() {
  try {
    // Find all projects with no components AND no chats
    const emptyProjects = await prisma.project.findMany({
      where: {
        AND: [
          { components: { none: {} } },
          { chats: { none: {} } },
        ],
      },
      select: {
        id: true,
      },
    });

    if (emptyProjects.length === 0) {
      return NextResponse.json({ 
        message: "No empty projects to clean up",
        deleted: 0 
      });
    }

    // Delete all empty projects
    const result = await prisma.project.deleteMany({
      where: {
        id: {
          in: emptyProjects.map(p => p.id),
        },
      },
    });

    return NextResponse.json({ 
      message: `Cleaned up ${result.count} empty projects`,
      deleted: result.count 
    });
  } catch (error) {
    console.error("Error cleaning up projects:", error);
    return NextResponse.json(
      { error: "Failed to clean up projects" },
      { status: 500 }
    );
  }
}
