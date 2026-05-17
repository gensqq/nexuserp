import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAuthUser } from "@/lib/auth";
import { getPlan, PLANS } from "@/lib/paymongo";

export async function GET(req: NextRequest) {
  try {
    const user = await getAuthUser(req);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (!user.companyId) return NextResponse.json({ error: "No company" }, { status: 400 });

    const company = await prisma.company.findUnique({ where: { id: user.companyId } });
    if (!company) return NextResponse.json({ error: "Company not found" }, { status: 404 });

    const plan = getPlan(company.plan);
    const allPlans = Object.entries(PLANS).map(([key, value]) => ({
      id: key,
      ...value,
      isCurrent: key === company.plan,
    }));

    return NextResponse.json({
      currentPlan: company.plan,
      plan,
      hasPaymongo: !!company.paymongoCustomerId,
      paymongoSubscriptionId: company.paymongoSubscriptionId,
      plans: allPlans,
    });
  } catch (error) {
    console.error("Billing status error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
