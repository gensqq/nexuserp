import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAuthUser } from "@/lib/auth";
import { validate } from "@/lib/validate";

export async function POST(req: NextRequest) {
  try {
    const authUser = await getAuthUser(req);
    if (!authUser) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { productId, quantity, type, reference, notes } = await req.json();
    const errors = validate({ productId, quantity, type }, {
      productId: { required: true, type: "string" },
      quantity: { required: true, type: "number", min: 1 },
      type: { required: true, type: "string", enum: ["IN", "OUT"] },
    });
    if (errors.length) return NextResponse.json({ error: errors[0] }, { status: 400 });

    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    const newStock = type === "IN" ? product.stock + quantity : product.stock - quantity;
    if (newStock < 0) {
      return NextResponse.json({ error: "Insufficient stock" }, { status: 400 });
    }

    await prisma.product.update({
      where: { id: productId },
      data: { stock: newStock },
    });

    const movement = await prisma.stockMovement.create({
      data: {
        productId,
        type,
        quantity,
        reference,
        notes,
      },
    });

    return NextResponse.json({ movement, newStock });
  } catch (error) {
    console.error("Stock movement error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const user = await getAuthUser(req);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const productId = searchParams.get("productId") || "";

    const where: any = {};
    if (productId) where.productId = productId;

    const movements = await prisma.stockMovement.findMany({
      where,
      include: { product: true },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    return NextResponse.json({ movements });
  } catch (error) {
    console.error("Stock movements error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
