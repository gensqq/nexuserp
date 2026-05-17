import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAuthUser } from "@/lib/auth";
import { validate } from "@/lib/validate";

export async function GET(req: NextRequest) {
  try {
    const user = await getAuthUser(req);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const projectId = searchParams.get("projectId") || "";
    const status = searchParams.get("status") || "";

    const companyId = user.companyId;
    const where: any = {};
    if (companyId) where.project = { owner: { companyId } };
    if (projectId) where.projectId = projectId;
    if (status) where.status = status;

    const tasks = await prisma.task.findMany({
      where,
      include: {
        assignee: { select: { id: true, name: true } },
        project: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ tasks });
  } catch (error) {
    console.error("Tasks error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const authUser = await getAuthUser(req);
    if (!authUser) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const data = await req.json();
    const errors = validate(data, {
      projectId: { required: true, type: "string" },
      title: { required: true, type: "string", minLength: 1, maxLength: 200 },
    });
    if (errors.length) return NextResponse.json({ error: errors[0] }, { status: 400 });

    const validStatuses = ["TODO", "IN_PROGRESS", "IN_REVIEW", "DONE"];
    const validPriorities = ["LOW", "MEDIUM", "HIGH", "URGENT"];
    const task = await prisma.task.create({
      data: {
        projectId: data.projectId,
        assigneeId: data.assigneeId || null,
        title: data.title,
        description: data.description || null,
        status: validStatuses.includes(data.status) ? data.status : "TODO",
        priority: validPriorities.includes(data.priority) ? data.priority : "MEDIUM",
        dueDate: data.dueDate ? new Date(data.dueDate) : null,
        estimatedHours: data.estimatedHours || null,
      },
      include: {
        assignee: { select: { id: true, name: true } },
        project: { select: { id: true, name: true } },
      },
    });
    return NextResponse.json({ task });
  } catch (error) {
    console.error("Create task error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const authUser = await getAuthUser(req);
    if (!authUser) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const data = await req.json();
    if (!data.id) return NextResponse.json({ error: "ID required" }, { status: 400 });

    const validStatuses = ["TODO", "IN_PROGRESS", "IN_REVIEW", "DONE"];
    const validPriorities = ["LOW", "MEDIUM", "HIGH", "URGENT"];
    const task = await prisma.task.update({
      where: { id: data.id },
      data: {
        title: data.title,
        description: data.description,
        status: data.status && validStatuses.includes(data.status) ? data.status : undefined,
        priority: data.priority && validPriorities.includes(data.priority) ? data.priority : undefined,
        assigneeId: data.assigneeId,
        dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
        estimatedHours: data.estimatedHours,
      },
      include: {
        assignee: { select: { id: true, name: true } },
        project: { select: { id: true, name: true } },
      },
    });
    return NextResponse.json({ task });
  } catch (error) {
    console.error("Update task error:", error);
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
    await prisma.task.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete task error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
