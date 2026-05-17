import { NextRequest, NextResponse } from "next/server";
import { getTokensFromCode } from "@/lib/google";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const code = searchParams.get("code");

    if (!code) {
      return NextResponse.redirect(new URL("/settings?google=error&msg=No+code+provided", req.url));
    }

    const tokens = await getTokensFromCode(code);

    // Store tokens in a cookie for the session (in production, store in DB)
    const response = NextResponse.redirect(new URL("/settings?google=connected", req.url));
    response.cookies.set("google_access_token", tokens.access_token || "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30, // 30 days
    });
    if (tokens.refresh_token) {
      response.cookies.set("google_refresh_token", tokens.refresh_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 30,
      });
    }

    return response;
  } catch (error) {
    console.error("Google callback error:", error);
    return NextResponse.redirect(new URL("/settings?google=error&msg=Auth+failed", req.url));
  }
}
