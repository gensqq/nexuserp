import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAuthUser } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const user = await getAuthUser(req);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { avatar } = await req.json();
    if (!avatar) return NextResponse.json({ error: "No image provided" }, { status: 400 });

    // Validate it's a reasonable base64 image (max ~2MB)
    if (avatar.length > 2_800_000) {
      return NextResponse.json({ error: "Image too large (max 2MB)" }, { status: 400 });
    }

    // Validate it's a data URL with image type
    if (!avatar.startsWith("data:image/")) {
      return NextResponse.json({ error: "Invalid image format" }, { status: 400 });
    }

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: { avatar },
      select: { id: true, name: true, email: true, avatar: true, role: true },
    });

    return NextResponse.json({ user: updatedUser });
  } catch (error) {
    console.error("Avatar upload error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const user = await getAuthUser(req);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: { avatar: null },
      select: { id: true, name: true, email: true, avatar: true, role: true },
    });

    return NextResponse.json({ user: updatedUser });
  } catch (error) {
    console.error("Avatar delete error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
