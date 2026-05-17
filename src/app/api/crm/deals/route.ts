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
    if (companyId) where.customer = { companyId };
    const deals = await prisma.deal.findMany({
      where,
      include: { customer: true },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ deals });
  } catch (error) {
    console.error("Deals error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const authUser = await getAuthUser(req);
    if (!authUser) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const data = await req.json();
    const errors = validate(data, {
      customerId: { required: true, type: "string" },
      title: { required: true, type: "string", minLength: 1, maxLength: 200 },
      value: { required: true, type: "number", min: 0 },
    });
    if (errors.length) return NextResponse.json({ error: errors[0] }, { status: 400 });

    const validStages = ["NEW", "QUALIFIED", "PROPOSAL", "NEGOTIATION", "WON", "LOST"];
    const stage = validStages.includes(data.stage) ? data.stage : "NEW";

    const deal = await prisma.deal.create({
      data: {
        customerId: data.customerId,
        title: data.title,
        value: data.value,
        stage,
        probability: Math.min(100, Math.max(0, data.probability || 0)),
        expectedClose: data.expectedClose ? new Date(data.expectedClose) : null,
        notes: data.notes || null,
      },
      include: { customer: true },
    });
    return NextResponse.json({ deal });
  } catch (error) {
    console.error("Create deal error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const authUser = await getAuthUser(req);
    if (!authUser) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const data = await req.json();
    if (!data.id) return NextResponse.json({ error: "ID required" }, { status: 400 });

    const validStages = ["NEW", "QUALIFIED", "PROPOSAL", "NEGOTIATION", "WON", "LOST"];

    const deal = await prisma.deal.update({
      where: { id: data.id },
      data: {
        title: data.title,
        value: data.value,
        stage: data.stage && validStages.includes(data.stage) ? data.stage : undefined,
        probability: data.probability !== undefined ? Math.min(100, Math.max(0, data.probability)) : undefined,
        expectedClose: data.expectedClose ? new Date(data.expectedClose) : undefined,
        notes: data.notes,
      },
      include: { customer: true },
    });
    return NextResponse.json({ deal });
  } catch (error) {
    console.error("Update deal error:", error);
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
    await prisma.deal.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete deal error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
