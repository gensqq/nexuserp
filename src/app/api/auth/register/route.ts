import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { hashPassword, signToken } from "@/lib/auth";
import { validate } from "@/lib/validate";
import { checkRateLimit } from "@/lib/rate-limit";

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown";
    const { allowed, resetIn } = checkRateLimit(`register:${ip}`, 5, 60000);
    if (!allowed) {
      return NextResponse.json({ error: `Too many attempts. Try again in ${Math.ceil(resetIn / 1000)} seconds.` }, { status: 429 });
    }

    const { name, email, password, company: companyName } = await req.json();

    const errors = validate({ name, email, password }, {
      name: { required: true, type: "string", minLength: 1, maxLength: 100 },
      email: { required: true, type: "string", maxLength: 255 },
      password: { required: true, type: "string", minLength: 6, maxLength: 128 },
    });
    if (errors.length) return NextResponse.json({ error: errors[0] }, { status: 400 });

    // Check if user exists
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: "Email already registered" }, { status: 409 });
    }

    // Create company if provided
    let company = null;
    if (companyName) {
      company = await prisma.company.create({
        data: { name: companyName, plan: "FREE" },
      });
    }

    // Create user
    const passwordHash = await hashPassword(password);
    const user = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
        role: "ADMIN",
        companyId: company?.id,
      },
    });

    // Generate token
    const token = await signToken({ userId: user.id, email: user.email, role: user.role });

    return NextResponse.json({
      user: { id: user.id, email: user.email, name: user.name, role: user.role },
      token,
    });
  } catch (error) {
    console.error("Register error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
