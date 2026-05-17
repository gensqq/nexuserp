import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { hashPassword } from "@/lib/auth";
import { validate } from "@/lib/validate";
import { checkRateLimit } from "@/lib/rate-limit";

// Step 1: Check if email exists
export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown";
    const { allowed, resetIn } = checkRateLimit(`forgot:${ip}`, 5, 60000);
    if (!allowed) {
      return NextResponse.json({ error: `Too many attempts. Try again in ${Math.ceil(resetIn / 1000)} seconds.` }, { status: 429 });
    }

    const { email } = await req.json();

    const errors = validate({ email }, {
      email: { required: true, type: "string" },
    });
    if (errors.length) return NextResponse.json({ error: errors[0] }, { status: 400 });

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return NextResponse.json({ error: "No account found with this email address" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Email verified" });
  } catch (error) {
    console.error("Forgot password error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// Step 2: Reset password
export async function PUT(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    const errors = validate({ email, password }, {
      email: { required: true, type: "string" },
      password: { required: true, type: "string", minLength: 6, maxLength: 128 },
    });
    if (errors.length) return NextResponse.json({ error: errors[0] }, { status: 400 });

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return NextResponse.json({ error: "No account found with this email address" }, { status: 404 });
    }

    const passwordHash = await hashPassword(password);

    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash },
    });

    return NextResponse.json({ success: true, message: "Password has been reset" });
  } catch (error) {
    console.error("Reset password error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
