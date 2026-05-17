import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAuthUser, hashPassword, verifyPassword } from "@/lib/auth";
import { validate } from "@/lib/validate";

export async function GET(req: NextRequest) {
  try {
    const user = await getAuthUser(req);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const profile = await prisma.user.findUnique({
      where: { id: user.id },
      select: { id: true, name: true, email: true, phone: true, role: true, avatar: true },
    });
    return NextResponse.json({ user: profile });
  } catch (error) {
    console.error("Get profile error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const authUser = await getAuthUser(req);
    if (!authUser) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const data = await req.json();
    if (data.email) {
      const errors = validate({ email: data.email }, {
        email: { type: "string", maxLength: 255 },
      });
      if (errors.length) return NextResponse.json({ error: errors[0] }, { status: 400 });
    }
    if (data.password) {
      if (!data.currentPassword) {
        return NextResponse.json({ error: "Current password is required" }, { status: 400 });
      }
      const errors = validate({ password: data.password }, {
        password: { type: "string", minLength: 6, maxLength: 128 },
      });
      if (errors.length) return NextResponse.json({ error: errors[0] }, { status: 400 });

      const user = await prisma.user.findUnique({ where: { id: authUser.id } });
      if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

      const valid = await verifyPassword(data.currentPassword, user.passwordHash);
      if (!valid) return NextResponse.json({ error: "Current password is incorrect" }, { status: 400 });
    }

    // Check if email is already taken by another user
    if (data.email && data.email !== authUser.email) {
      const existing = await prisma.user.findUnique({ where: { email: data.email } });
      if (existing) {
        return NextResponse.json({ error: "This email is already in use by another account" }, { status: 400 });
      }
    }

    const updateData: Record<string, unknown> = {};
    if (data.name) updateData.name = data.name;
    if (data.email) updateData.email = data.email;
    if (data.phone !== undefined) updateData.phone = data.phone;
    if (data.avatar) updateData.avatar = data.avatar;
    if (data.password) {
      updateData.passwordHash = await hashPassword(data.password);
    }

    const updatedUser = await prisma.user.update({
      where: { id: authUser.id },
      data: updateData,
      select: { id: true, name: true, email: true, phone: true, role: true, avatar: true },
    });

    return NextResponse.json({ user: updatedUser });
  } catch (error: any) {
    console.error("Update profile error:", error);
    if (error?.code === "P2002") {
      return NextResponse.json({ error: "This email is already in use" }, { status: 400 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
