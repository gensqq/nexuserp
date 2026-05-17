import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAuthUser } from "@/lib/auth";
import { validate } from "@/lib/validate";

export async function GET(req: NextRequest) {
  try {
    const user = await getAuthUser(req);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const companyId = user.companyId;
    const where = companyId ? { companyId } : {};
    const suppliers = await prisma.supplier.findMany({
      where,
      include: { purchaseOrders: true },
      orderBy: { name: "asc" },
    });
    return NextResponse.json({ suppliers });
  } catch (error) {
    console.error("Suppliers error:", error);
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

    const supplier = await prisma.supplier.create({
      data: {
        companyId,
        name: data.name,
        email: data.email || null,
        phone: data.phone || null,
        address: data.address || null,
        notes: data.notes || null,
      },
    });
    return NextResponse.json({ supplier });
  } catch (error) {
    console.error("Create supplier error:", error);
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
    await prisma.supplier.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete supplier error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
