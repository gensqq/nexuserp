import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAuthUser } from "@/lib/auth";
import { createCheckoutSession, PLANS, PlanType } from "@/lib/paymongo";

export async function POST(req: NextRequest) {
  try {
    const user = await getAuthUser(req);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (!user.companyId) return NextResponse.json({ error: "No company" }, { status: 400 });

    const { plan } = await req.json();
    if (!plan || !PLANS[plan as PlanType]) {
      return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
    }
    if (plan === "FREE") {
      return NextResponse.json({ error: "Cannot checkout free plan" }, { status: 400 });
    }

    const url = await createCheckoutSession(user.companyId, user.email, plan as PlanType);
    if (!url) {
      return NextResponse.json({ error: "PayMongo not configured. Add PAYMONGO_SECRET_KEY to .env" }, { status: 500 });
    }

    return NextResponse.json({ url });
  } catch (error) {
    console.error("Checkout error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
