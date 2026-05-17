import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAuthUser } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const user = await getAuthUser(req);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";
    const category = searchParams.get("category") || "";

    const companyId = user.companyId;
    const where: any = { isActive: true, ...(companyId ? { companyId } : {}) };
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { sku: { contains: search } },
        { barcode: { contains: search } },
      ];
    }
    if (category && category !== "All") {
      where.category = category;
    }

    const products = await prisma.product.findMany({
      where,
      orderBy: { name: "asc" },
    });

    const categories = await prisma.product.findMany({
      where: { isActive: true, ...(companyId ? { companyId } : {}) },
      select: { category: true },
      distinct: ["category"],
    });

    return NextResponse.json({
      products,
      categories: categories.map((c) => c.category).filter(Boolean),
    });
  } catch (error) {
    console.error("POS products error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
