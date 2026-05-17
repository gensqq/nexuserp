import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAuthUser } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const user = await getAuthUser(req);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status") || "";

    const companyId = user.companyId;
    const where: any = {};
    if (companyId) where.supplier = { companyId };
    if (status) where.status = status;

    const purchaseOrders = await prisma.purchaseOrder.findMany({
      where,
      include: { supplier: true, items: true },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ purchaseOrders });
  } catch (error) {
    console.error("Purchase orders error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const authUser = await getAuthUser(req);
    if (!authUser) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const data = await req.json();
    if (!data.supplierId) return NextResponse.json({ error: "Supplier is required" }, { status: 400 });
    if (!data.items || !data.items.length) return NextResponse.json({ error: "At least one item is required" }, { status: 400 });

    const count = await prisma.purchaseOrder.count();
    const orderNumber = `PO-${String(count + 1).padStart(5, "0")}`;

    const total = data.items.reduce((sum: number, item: any) => sum + (item.quantity * item.unitCost), 0);

    const purchaseOrder = await prisma.purchaseOrder.create({
      data: {
        orderNumber,
        supplierId: data.supplierId,
        total,
        expectedDate: data.expectedDate ? new Date(data.expectedDate) : null,
        notes: data.notes || null,
        items: {
          create: data.items.map((item: any) => ({
            productName: item.productName,
            quantity: item.quantity,
            unitCost: item.unitCost,
            total: item.quantity * item.unitCost,
          })),
        },
      },
      include: { supplier: true, items: true },
    });

    return NextResponse.json({ purchaseOrder });
  } catch (error) {
    console.error("Create purchase order error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const authUser = await getAuthUser(req);
    if (!authUser) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const data = await req.json();
    if (!data.id) return NextResponse.json({ error: "ID required" }, { status: 400 });

    const existing = await prisma.purchaseOrder.findUnique({
      where: { id: data.id },
      include: { items: true },
    });
    if (!existing) return NextResponse.json({ error: "Purchase order not found" }, { status: 404 });

    // If receiving order, add stock for each item
    if (data.status === "RECEIVED" && existing.status !== "RECEIVED") {
      for (const item of existing.items) {
        const product = await prisma.product.findFirst({ where: { name: item.productName } });
        if (product) {
          await prisma.product.update({
            where: { id: product.id },
            data: { stock: { increment: item.quantity } },
          });
          await prisma.stockMovement.create({
            data: {
              productId: product.id,
              type: "IN",
              quantity: item.quantity,
              reference: existing.orderNumber,
              notes: `Received from PO ${existing.orderNumber}`,
            },
          });
        }
      }
    }

    const purchaseOrder = await prisma.purchaseOrder.update({
      where: { id: data.id },
      data: {
        status: data.status,
        notes: data.notes,
        expectedDate: data.expectedDate ? new Date(data.expectedDate) : undefined,
      },
      include: { supplier: true, items: true },
    });

    return NextResponse.json({ purchaseOrder });
  } catch (error) {
    console.error("Update purchase order error:", error);
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

    await prisma.purchaseOrderItem.deleteMany({ where: { purchaseOrderId: id } });
    await prisma.purchaseOrder.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete purchase order error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
