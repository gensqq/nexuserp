import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const user = await getAuthUser(req);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const accessToken = req.cookies.get("google_access_token")?.value;
    const connected = !!accessToken;

    return NextResponse.json({ connected });
  } catch (error) {
    return NextResponse.json({ connected: false });
  }
}
