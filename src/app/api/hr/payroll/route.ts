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
    const payroll = await prisma.payroll.findMany({
      where,
      include: { employee: true },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ payroll });
  } catch (error) {
    console.error("Payroll error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const authUser = await getAuthUser(req);
    if (!authUser) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { period } = await req.json();
    const errors = validate({ period }, {
      period: { required: true, type: "string", minLength: 1, maxLength: 20 },
    });
    if (errors.length) return NextResponse.json({ error: errors[0] }, { status: 400 });
    const companyId = authUser.companyId;
    const employees = await prisma.employee.findMany({ where: { status: "ACTIVE", ...(companyId ? { user: { companyId } } : {}) } });

    const payrollRecords = await Promise.all(
      employees.map(async (emp) => {
        const grossPay = emp.salary / 12;
        const deductions = grossPay * 0.24;
        const netPay = grossPay - deductions;

        return prisma.payroll.create({
          data: {
            employeeId: emp.id,
            period,
            grossPay,
            deductions,
            netPay,
            status: "DRAFT",
          },
        });
      })
    );

    return NextResponse.json({ payroll: payrollRecords });
  } catch (error) {
    console.error("Generate payroll error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const authUser = await getAuthUser(req);
    if (!authUser) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const data = await req.json();
    if (!data.id) return NextResponse.json({ error: "ID required" }, { status: 400 });

    // Recalculate net pay if gross or deductions changed
    let updateFields: Record<string, unknown> = { status: data.status };
    if (data.grossPay !== undefined || data.deductions !== undefined) {
      const existing = await prisma.payroll.findUnique({ where: { id: data.id } });
      if (existing) {
        const gross = data.grossPay ?? existing.grossPay;
        const ded = data.deductions ?? existing.deductions;
        updateFields = { ...updateFields, grossPay: gross, deductions: ded, netPay: gross - ded };
      }
    }

    const payroll = await prisma.payroll.update({
      where: { id: data.id },
      data: updateFields,
      include: { employee: true },
    });
    return NextResponse.json({ payroll });
  } catch (error) {
    console.error("Update payroll error:", error);
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
    await prisma.payroll.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete payroll error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
