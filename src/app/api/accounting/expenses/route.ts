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
    const status = searchParams.get("status") || "";

    const companyId = user.companyId;
    const where: any = {};
    if (companyId) where.companyId = companyId;
    if (status) where.status = status;

    const [expenses, total] = await Promise.all([
      prisma.expense.findMany({
        where,
        orderBy: { date: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.expense.count({ where }),
    ]);

    return NextResponse.json({ expenses, total, page, totalPages: Math.ceil(total / limit) });
  } catch (error) {
    console.error("Expenses error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const authUser = await getAuthUser(req);
    if (!authUser) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const data = await req.json();
    const errors = validate(data, {
      date: { required: true },
      category: { required: true, type: "string", minLength: 1, maxLength: 100 },
      description: { required: true, type: "string", minLength: 1, maxLength: 500 },
      amount: { required: true, type: "number", min: 0.01 },
    });
    if (errors.length) return NextResponse.json({ error: errors[0] }, { status: 400 });

    const expense = await prisma.expense.create({
      data: {
        companyId: authUser.companyId || undefined,
        date: new Date(data.date),
        category: data.category,
        description: data.description,
        amount: data.amount,
        vendor: data.vendor || null,
        status: "PENDING",
      },
    });
    return NextResponse.json({ expense });
  } catch (error) {
    console.error("Create expense error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const authUser = await getAuthUser(req);
    if (!authUser) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const data = await req.json();
    if (!data.id) return NextResponse.json({ error: "ID required" }, { status: 400 });

    const expense = await prisma.expense.update({
      where: { id: data.id },
      data: {
        date: data.date ? new Date(data.date) : undefined,
        category: data.category,
        description: data.description,
        amount: data.amount,
        vendor: data.vendor,
        status: data.status,
      },
    });
    return NextResponse.json({ expense });
  } catch (error) {
    console.error("Update expense error:", error);
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
    await prisma.expense.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete expense error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
