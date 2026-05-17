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
    const status = searchParams.get("status") || "";

    const companyId = user.companyId;
    const where: any = companyId ? { companyId } : {};
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { email: { contains: search } },
      ];
    }
    if (status) where.status = status;

    const [customers, total] = await Promise.all([
      prisma.customer.findMany({
        where,
        include: { deals: true, orders: true },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.customer.count({ where }),
    ]);

    return NextResponse.json({ customers, total, page, totalPages: Math.ceil(total / limit) });
  } catch (error) {
    console.error("Customers error:", error);
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

    const companyId = authUser.companyId;
    if (!companyId) return NextResponse.json({ error: "No company associated" }, { status: 400 });

    const customer = await prisma.customer.create({
      data: {
        companyId,
        name: data.name,
        email: data.email || null,
        phone: data.phone || null,
        address: data.address || null,
        city: data.city || null,
        country: data.country || null,
        status: data.status || "LEAD",
        source: data.source || null,
        tags: data.tags || null,
        notes: data.notes || null,
      },
    });
    return NextResponse.json({ customer });
  } catch (error) {
    console.error("Create customer error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const authUser = await getAuthUser(req);
    if (!authUser) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const data = await req.json();
    if (!data.id) return NextResponse.json({ error: "ID required" }, { status: 400 });

    const customer = await prisma.customer.update({
      where: { id: data.id },
      data: {
        name: data.name,
        email: data.email,
        phone: data.phone,
        address: data.address,
        city: data.city,
        country: data.country,
        status: data.status,
        source: data.source,
        tags: data.tags,
        notes: data.notes,
      },
    });
    return NextResponse.json({ customer });
  } catch (error) {
    console.error("Update customer error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const authUser = await getAuthUser(req);
    if (!authUser) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }
    // Delete related records first
    await prisma.crmActivity.deleteMany({ where: { customerId: id } });
    await prisma.deal.deleteMany({ where: { customerId: id } });
    await prisma.orderItem.deleteMany({ where: { order: { customerId: id } } });
    await prisma.order.deleteMany({ where: { customerId: id } });
    await prisma.customer.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete customer error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
