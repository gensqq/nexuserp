import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAuthUser } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const user = await getAuthUser(req);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const period = searchParams.get("period") || "month";

    const now = new Date();
    let startDate: Date;

    switch (period) {
      case "week":
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case "month":
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case "quarter":
        startDate = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3, 1);
        break;
      case "year":
        startDate = new Date(now.getFullYear(), 0, 1);
        break;
      default:
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    }

    const companyId = user.companyId;

    // Revenue
    const orderWhere: any = { createdAt: { gte: startDate }, status: "COMPLETED" };
    if (companyId) orderWhere.customer = { companyId };
    const orders = await prisma.order.findMany({ where: orderWhere });
    const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0);

    // Expenses
    const expenseWhere: any = { date: { gte: startDate }, status: "APPROVED" };
    if (companyId) expenseWhere.companyId = companyId;
    const expenses = await prisma.expense.findMany({ where: expenseWhere });
    const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);

    // Income
    const incomeWhere: any = { date: { gte: startDate } };
    if (companyId) incomeWhere.companyId = companyId;
    const income = await prisma.income.findMany({ where: incomeWhere });
    const totalIncome = income.reduce((sum, i) => sum + i.amount, 0);

    // Expense by category
    const expenseByCategory: Record<string, number> = {};
    expenses.forEach((e) => {
      expenseByCategory[e.category] = (expenseByCategory[e.category] || 0) + e.amount;
    });

    // Monthly breakdown
    const monthlyData = [];
    for (let i = 11; i >= 0; i--) {
      const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);

      const monthOrderWhere: any = { createdAt: { gte: monthStart, lte: monthEnd }, status: "COMPLETED" };
      if (companyId) monthOrderWhere.customer = { companyId };
      const monthOrders = await prisma.order.findMany({ where: monthOrderWhere });

      const monthExpenseWhere: any = { date: { gte: monthStart, lte: monthEnd }, status: "APPROVED" };
      if (companyId) monthExpenseWhere.companyId = companyId;
      const monthExpenses = await prisma.expense.findMany({ where: monthExpenseWhere });

      monthlyData.push({
        month: monthStart.toLocaleString("default", { month: "short" }),
        revenue: monthOrders.reduce((sum, o) => sum + o.total, 0),
        expenses: monthExpenses.reduce((sum, e) => sum + e.amount, 0),
      });
    }

    return NextResponse.json({
      totalRevenue,
      totalExpenses,
      netIncome: totalRevenue - totalExpenses,
      profitMargin: totalRevenue > 0 ? ((totalRevenue - totalExpenses) / totalRevenue) * 100 : 0,
      expenseByCategory,
      monthlyData,
      orderCount: orders.length,
    });
  } catch (error) {
    console.error("Financial reports error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
