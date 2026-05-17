import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAuthUser } from "@/lib/auth";
import { validate } from "@/lib/validate";

export async function GET(req: NextRequest) {
  try {
    const user = await getAuthUser(req);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";
    const category = searchParams.get("category") || "";

    const companyId = user.companyId;
    const where: any = companyId ? { companyId } : {};
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { sku: { contains: search } },
      ];
    }
    if (category) where.category = category;

    const products = await prisma.product.findMany({
      where,
      orderBy: { name: "asc" },
    });

    return NextResponse.json({ products });
  } catch (error) {
    console.error("Inventory products error:", error);
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
      sku: { required: true, type: "string", minLength: 1, maxLength: 100 },
      price: { required: true, type: "number", min: 0 },
    });
    if (errors.length) return NextResponse.json({ error: errors[0] }, { status: 400 });

    const companyId = authUser.companyId;
    if (!companyId) return NextResponse.json({ error: "No company associated" }, { status: 400 });

    const product = await prisma.product.create({
      data: {
        companyId,
        name: data.name,
        sku: data.sku,
        barcode: data.barcode || null,
        price: data.price,
        cost: data.cost || 0,
        stock: data.stock || 0,
        minStock: data.minStock || 0,
        category: data.category || null,
        description: data.description || null,
      },
    });
    return NextResponse.json({ product });
  } catch (error) {
    console.error("Create product error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const authUser = await getAuthUser(req);
    if (!authUser) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const data = await req.json();
    if (!data.id) return NextResponse.json({ error: "ID required" }, { status: 400 });

    const product = await prisma.product.update({
      where: { id: data.id },
      data: {
        name: data.name,
        sku: data.sku,
        barcode: data.barcode,
        price: data.price,
        cost: data.cost,
        stock: data.stock,
        minStock: data.minStock,
        category: data.category,
        description: data.description,
        isActive: data.isActive,
      },
    });
    return NextResponse.json({ product });
  } catch (error) {
    console.error("Update product error:", error);
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
    await prisma.orderItem.deleteMany({ where: { productId: id } });
    await prisma.stockMovement.deleteMany({ where: { productId: id } });
    await prisma.product.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete product error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
