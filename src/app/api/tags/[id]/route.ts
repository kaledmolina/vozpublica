import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// DELETE /api/tags/[id] — delete tag (ADMIN only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;

    const existing = await db.tag.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Tag not found" }, { status: 404 });
    }

    // Delete related ArticleTags first (cascade should handle this, but be explicit)
    await db.articleTag.deleteMany({ where: { tagId: id } });
    await db.tag.delete({ where: { id } });

    return NextResponse.json({ message: "Tag deleted successfully" });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to delete tag" },
      { status: 500 }
    );
  }
}
