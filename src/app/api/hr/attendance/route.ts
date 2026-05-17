import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAuthUser } from "@/lib/auth";
import { validate } from "@/lib/validate";

export async function GET(req: NextRequest) {
  try {
    const user = await getAuthUser(req);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const date = searchParams.get("date") || new Date().toISOString().split("T")[0];

    const companyId = user.companyId;
    const where: any = { date: new Date(date) };
    if (companyId) where.employee = { user: { companyId } };

    const attendance = await prisma.attendance.findMany({
      where,
      include: { employee: true },
      orderBy: { checkIn: "asc" },
    });

    return NextResponse.json({ attendance });
  } catch (error) {
    console.error("Attendance error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const authUser = await getAuthUser(req);
    if (!authUser) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { employeeId, date, checkIn, checkOut, status } = await req.json();
    const errors = validate({ employeeId, date }, {
      employeeId: { required: true, type: "string" },
      date: { required: true },
    });
    if (errors.length) return NextResponse.json({ error: errors[0] }, { status: 400 });

    const validStatuses = ["PRESENT", "ABSENT", "LATE", "HALF_DAY", "WORK_FROM_HOME"];
    const attendance = await prisma.attendance.create({
      data: {
        employeeId,
        date: new Date(date),
        checkIn: checkIn ? new Date(checkIn) : null,
        checkOut: checkOut ? new Date(checkOut) : null,
        status: validStatuses.includes(status) ? status : "PRESENT",
      },
    });
    return NextResponse.json({ attendance });
  } catch (error) {
    console.error("Create attendance error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
