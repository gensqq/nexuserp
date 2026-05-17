import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAuthUser } from "@/lib/auth";
import { validate } from "@/lib/validate";

export async function GET(req: NextRequest) {
  try {
    const user = await getAuthUser(req);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const search = searchParams.get("search") || "";
    const department = searchParams.get("department") || "";

    const companyId = user.companyId;
    const where: any = {};
    if (companyId) where.companyId = companyId;
    if (search) {
      where.OR = [
        { firstName: { contains: search } },
        { lastName: { contains: search } },
        { email: { contains: search } },
      ];
    }
    if (department) where.department = department;

    const [employees, total] = await Promise.all([
      prisma.employee.findMany({
        where,
        orderBy: { firstName: "asc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.employee.count({ where }),
    ]);

    return NextResponse.json({ employees, total, page, totalPages: Math.ceil(total / limit) });
  } catch (error) {
    console.error("Employees error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const authUser = await getAuthUser(req);
    if (!authUser) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const data = await req.json();
    const errors = validate(data, {
      firstName: { required: true, type: "string", minLength: 1, maxLength: 100 },
      lastName: { required: true, type: "string", minLength: 1, maxLength: 100 },
      email: { required: true, type: "string", maxLength: 255 },
      department: { required: true, type: "string", minLength: 1, maxLength: 100 },
    });
    if (errors.length) return NextResponse.json({ error: errors[0] }, { status: 400 });

    // Auto-generate unique employeeId if not provided
    let employeeId = data.employeeId;
    if (!employeeId) {
      const count = await prisma.employee.count();
      employeeId = `EMP${String(count + 1).padStart(3, "0")}`;
      // Ensure uniqueness by incrementing if needed
      let attempt = 0;
      while (await prisma.employee.findUnique({ where: { employeeId } })) {
        attempt++;
        employeeId = `EMP${String(count + 1 + attempt).padStart(3, "0")}`;
      }
    }

    const employee = await prisma.employee.create({
      data: {
        companyId: authUser.companyId || "",
        employeeId,
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone || null,
        department: data.department,
        position: data.position || "",
        hireDate: data.hireDate ? new Date(data.hireDate) : new Date(),
        salary: data.salary || 0,
        status: "ACTIVE",
      },
    });
    return NextResponse.json({ employee });
  } catch (error: any) {
    if (error.code === "P2002") {
      return NextResponse.json({ error: "An employee with this ID or email already exists" }, { status: 409 });
    }
    console.error("Create employee error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const authUser = await getAuthUser(req);
    if (!authUser) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const data = await req.json();
    if (!data.id) return NextResponse.json({ error: "ID required" }, { status: 400 });

    const employee = await prisma.employee.update({
      where: { id: data.id },
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone,
        department: data.department,
        position: data.position,
        hireDate: data.hireDate ? new Date(data.hireDate) : undefined,
        salary: data.salary,
        status: data.status,
      },
    });
    return NextResponse.json({ employee });
  } catch (error) {
    console.error("Update employee error:", error);
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

    // Delete related records first
    await prisma.payroll.deleteMany({ where: { employeeId: id } });
    await prisma.leaveRequest.deleteMany({ where: { employeeId: id } });
    await prisma.attendance.deleteMany({ where: { employeeId: id } });
    await prisma.employee.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete employee error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
