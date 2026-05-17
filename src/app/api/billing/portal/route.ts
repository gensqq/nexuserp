import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const user = await getAuthUser(req);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // PayMongo doesn't have a customer portal like Stripe
    // Redirect to settings billing tab
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3001";
    return NextResponse.json({ url: `${appUrl}/settings?tab=billing` });
  } catch (error) {
    console.error("Portal error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
