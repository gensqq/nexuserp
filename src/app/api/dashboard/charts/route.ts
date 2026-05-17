import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAuthUser } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const user = await getAuthUser(req);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const companyId = user.companyId;

    // Monthly revenue data (last 12 months)
    const months = [];
    const now = new Date();
    for (let i = 11; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0);

      const orderWhere: any = { createdAt: { gte: date, lte: endOfMonth }, status: "COMPLETED" };
      if (companyId) orderWhere.customer = { companyId };
      const orders = await prisma.order.findMany({ where: orderWhere });

      const expenses = await prisma.expense.findMany({
        where: { date: { gte: date, lte: endOfMonth }, status: "APPROVED" },
      });

      const revenue = orders.reduce((sum, o) => sum + o.total, 0);
      const expenseTotal = expenses.reduce((sum, e) => sum + e.amount, 0);

      months.push({
        name: date.toLocaleString("default", { month: "short" }),
        revenue,
        expenses: expenseTotal,
        profit: revenue - expenseTotal,
      });
    }

    // Sales by category
    const productWhere: any = {};
    if (companyId) productWhere.companyId = companyId;
    const products = await prisma.product.findMany({ where: productWhere });
    const categories: Record<string, number> = {};
    products.forEach((p) => {
      const cat = p.category || "Other";
      categories[cat] = (categories[cat] || 0) + p.stock;
    });
    const totalStock = Object.values(categories).reduce((a, b) => a + b, 0);
    const salesByCategory = Object.entries(categories).map(([name, value]) => ({
      name,
      value: totalStock > 0 ? Math.round((value / totalStock) * 100) : 0,
    }));

    // Deal stages distribution
    const dealWhere: any = {};
    if (companyId) dealWhere.customer = { companyId };
    const deals = await prisma.deal.findMany({ where: dealWhere });
    const dealStages: Record<string, { count: number; value: number }> = {};
    deals.forEach((d) => {
      if (!dealStages[d.stage]) dealStages[d.stage] = { count: 0, value: 0 };
      dealStages[d.stage].count++;
      dealStages[d.stage].value += d.value;
    });

    return NextResponse.json({
      revenueChart: months,
      salesByCategory,
      dealStages,
    });
  } catch (error) {
    console.error("Dashboard charts error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
