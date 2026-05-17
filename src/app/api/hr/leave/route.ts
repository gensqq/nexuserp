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
    if (companyId) where.employee = { user: { companyId } };
    const leaveRequests = await prisma.leaveRequest.findMany({
      where,
      include: { employee: true },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ leaveRequests });
  } catch (error) {
    console.error("Leave requests error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const authUser = await getAuthUser(req);
    if (!authUser) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const data = await req.json();
    const errors = validate(data, {
      employeeId: { required: true, type: "string" },
      type: { required: true, type: "string" },
      startDate: { required: true },
      endDate: { required: true },
    });
    if (errors.length) return NextResponse.json({ error: errors[0] }, { status: 400 });

    const validTypes = ["ANNUAL", "SICK", "PERSONAL", "MATERNITY", "PATERNITY", "UNPAID"];
    const leaveRequest = await prisma.leaveRequest.create({
      data: {
        employeeId: data.employeeId,
        type: validTypes.includes(data.type) ? data.type : "ANNUAL",
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
        reason: data.reason || null,
        status: "PENDING",
      },
    });
    return NextResponse.json({ leaveRequest });
  } catch (error) {
    console.error("Create leave request error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const authUser = await getAuthUser(req);
    if (!authUser) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id, status } = await req.json();
    if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

    const validStatuses = ["PENDING", "APPROVED", "REJECTED", "CANCELLED"];
    const leaveRequest = await prisma.leaveRequest.update({
      where: { id },
      data: { status: validStatuses.includes(status) ? status : "PENDING" },
    });
    return NextResponse.json({ leaveRequest });
  } catch (error) {
    console.error("Update leave request error:", error);
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
    await prisma.leaveRequest.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete leave request error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
