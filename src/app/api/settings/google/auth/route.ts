import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { getAuthUrl } from "@/lib/google";

export async function GET(req: NextRequest) {
  try {
    const user = await getAuthUser(req);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const url = getAuthUrl();
    return NextResponse.json({ url });
  } catch (error) {
    console.error("Google auth error:", error);
    return NextResponse.json({ error: "Failed to generate auth URL. Make sure GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET are set in .env" }, { status: 500 });
  }
}
