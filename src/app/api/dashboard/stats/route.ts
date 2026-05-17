import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAuthUser } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const user = await getAuthUser(req);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

    const companyId = user.companyId;

    // Current month stats
    const currentOrderWhere: any = { createdAt: { gte: startOfMonth }, status: "COMPLETED" };
    if (companyId) currentOrderWhere.customer = { companyId };
    const currentOrders = await prisma.order.findMany({ where: currentOrderWhere });
    const currentRevenue = currentOrders.reduce((sum, o) => sum + o.total, 0);

    // Last month stats
    const lastOrderWhere: any = { createdAt: { gte: startOfLastMonth, lte: endOfLastMonth }, status: "COMPLETED" };
    if (companyId) lastOrderWhere.customer = { companyId };
    const lastOrders = await prisma.order.findMany({ where: lastOrderWhere });
    const lastRevenue = lastOrders.reduce((sum, o) => sum + o.total, 0);

    // Active users in company
    const activeUsers = await prisma.user.count({ where: { isActive: true, ...(companyId ? { companyId } : {}) } });

    // Conversion rate (won deals / total deals)
    const dealWhere: any = {};
    if (companyId) dealWhere.customer = { companyId };
    const totalDeals = await prisma.deal.count({ where: dealWhere });
    const wonDeals = await prisma.deal.count({ where: { stage: "CLOSED_WON", ...dealWhere } });
    const conversionRate = totalDeals > 0 ? (wonDeals / totalDeals) * 100 : 0;

    // Revenue change
    const revenueChange = lastRevenue > 0 ? ((currentRevenue - lastRevenue) / lastRevenue) * 100 : 0;

    // Recent activities
    const activityWhere: any = {};
    if (companyId) activityWhere.user = { companyId };
    const activities = await prisma.activity.findMany({
      take: 10,
      orderBy: { createdAt: "desc" },
      include: { user: { select: { name: true, avatar: true } } },
      where: activityWhere,
    });

    // Low stock products
    const productWhere: any = { stock: { lte: 10 } };
    if (companyId) productWhere.companyId = companyId;
    const lowStockProducts = await prisma.product.findMany({ where: productWhere, take: 5 });

    // Pending leave requests
    const leaveWhere: any = { status: "PENDING" };
    if (companyId) leaveWhere.employee = { user: { companyId } };
    const pendingLeaves = await prisma.leaveRequest.count({ where: leaveWhere });

    // Total employees
    const empWhere: any = { status: "ACTIVE" };
    if (companyId) empWhere.user = { companyId };
    const totalEmployees = await prisma.employee.count({ where: empWhere });

    // Open deals value
    const openDealWhere: any = { stage: { notIn: ["CLOSED_WON", "CLOSED_LOST"] } };
    if (companyId) openDealWhere.customer = { companyId };
    const openDeals = await prisma.deal.findMany({ where: openDealWhere });
    const pipelineValue = openDeals.reduce((sum, d) => sum + d.value, 0);

    return NextResponse.json({
      revenue: { current: currentRevenue, previous: lastRevenue, change: revenueChange },
      orders: { current: currentOrders.length, previous: lastOrders.length },
      activeUsers,
      conversionRate,
      activities,
      lowStockProducts,
      pendingLeaves,
      totalEmployees,
      pipelineValue,
    });
  } catch (error) {
    console.error("Dashboard stats error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
