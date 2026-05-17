import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAuthUser } from "@/lib/auth";
import { validate } from "@/lib/validate";

export async function GET(req: NextRequest) {
  try {
    const user = await getAuthUser(req);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const companyId = user.companyId;
    const where: any = {};
    if (companyId) where.owner = { companyId };
    const projects = await prisma.project.findMany({
      where,
      include: {
        owner: { select: { id: true, name: true } },
        tasks: true,
      },
      orderBy: { createdAt: "desc" },
    });

    const projectsWithStats = projects.map((p) => ({
      ...p,
      taskCount: p.tasks.length,
      completedTasks: p.tasks.filter((t) => t.status === "DONE").length,
      progress: p.tasks.length > 0 ? Math.round((p.tasks.filter((t) => t.status === "DONE").length / p.tasks.length) * 100) : 0,
    }));

    return NextResponse.json({ projects: projectsWithStats });
  } catch (error) {
    console.error("Projects error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const authUser = await getAuthUser(req);
    if (!authUser) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const data = await req.json();
    const errors = validate(data, {
      name: { required: true, type: "string", minLength: 1, maxLength: 200 },
    });
    if (errors.length) return NextResponse.json({ error: errors[0] }, { status: 400 });

    const validStatuses = ["PLANNING", "IN_PROGRESS", "ON_HOLD", "COMPLETED", "CANCELLED"];
    const project = await prisma.project.create({
      data: {
        name: data.name,
        description: data.description || null,
        ownerId: authUser.id,
        status: validStatuses.includes(data.status) ? data.status : "PLANNING",
        startDate: data.startDate ? new Date(data.startDate) : null,
        endDate: data.endDate ? new Date(data.endDate) : null,
        budget: data.budget || null,
      },
    });
    return NextResponse.json({ project });
  } catch (error) {
    console.error("Create project error:", error);
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
    await prisma.task.deleteMany({ where: { projectId: id } });
    await prisma.project.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete project error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
