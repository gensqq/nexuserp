import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAuthUser } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const user = await getAuthUser(req);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const activities = await prisma.activity.findMany({
      take: 20,
      orderBy: { createdAt: "desc" },
      include: { user: { select: { name: true, avatar: true } } },
    });

    // Generate notifications from activities
    const notifications = activities.map((a) => ({
      id: a.id,
      title: `${a.action.charAt(0).toUpperCase() + a.action.slice(1)} ${a.entity}`,
      message: `${a.user.name} ${a.action} a ${a.entity}`,
      type: a.action === "created" ? "success" : a.action === "approved" ? "info" : "info",
      read: false,
      createdAt: a.createdAt,
    }));

    return NextResponse.json({ notifications });
  } catch (error) {
    console.error("Notifications error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
