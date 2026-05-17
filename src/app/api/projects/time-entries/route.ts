import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAuthUser } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const user = await getAuthUser(req);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const taskId = searchParams.get("taskId") || "";
    const userId = searchParams.get("userId") || "";

    const where: any = {};
    if (taskId) where.taskId = taskId;
    if (userId) where.userId = userId;

    const timeEntries = await prisma.timeEntry.findMany({
      where,
      include: { task: { include: { project: true } }, user: { select: { id: true, name: true } } },
      orderBy: { date: "desc" },
    });

    const totalHours = timeEntries.reduce((sum, e) => sum + e.hours, 0);

    return NextResponse.json({ timeEntries, totalHours });
  } catch (error) {
    console.error("Time entries error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const authUser = await getAuthUser(req);
    if (!authUser) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const data = await req.json();
    if (!data.taskId) return NextResponse.json({ error: "Task is required" }, { status: 400 });
    if (!data.hours || data.hours <= 0) return NextResponse.json({ error: "Hours must be greater than 0" }, { status: 400 });

    const timeEntry = await prisma.timeEntry.create({
      data: {
        taskId: data.taskId,
        userId: authUser.id,
        hours: parseFloat(data.hours),
        description: data.description || null,
        date: data.date ? new Date(data.date) : new Date(),
      },
      include: { task: { include: { project: true } }, user: { select: { id: true, name: true } } },
    });

    return NextResponse.json({ timeEntry });
  } catch (error) {
    console.error("Create time entry error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const authUser = await getAuthUser(req);
    if (!authUser) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

    await prisma.timeEntry.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete time entry error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
