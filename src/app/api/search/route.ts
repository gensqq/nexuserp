import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAuthUser } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const user = await getAuthUser(req);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const query = searchParams.get("q") || "";

    if (!query) {
      return NextResponse.json({ results: [] });
    }

    const companyId = user.companyId;

    const productWhere: any = { OR: [{ name: { contains: query } }, { sku: { contains: query } }] };
    if (companyId) productWhere.companyId = companyId;

    const customerWhere: any = { OR: [{ name: { contains: query } }, { email: { contains: query } }] };
    if (companyId) customerWhere.companyId = companyId;

    const orderWhere: any = { orderNumber: { contains: query } };
    if (companyId) orderWhere.customer = { companyId };

    const empWhere: any = { OR: [{ firstName: { contains: query } }, { lastName: { contains: query } }] };
    if (companyId) empWhere.user = { companyId };

    const projWhere: any = { name: { contains: query } };
    if (companyId) projWhere.owner = { companyId };

    const [products, customers, orders, employees, projects] = await Promise.all([
      prisma.product.findMany({ where: productWhere, take: 5 }),
      prisma.customer.findMany({ where: customerWhere, take: 5 }),
      prisma.order.findMany({ where: orderWhere, take: 5 }),
      prisma.employee.findMany({ where: empWhere, take: 5 }),
      prisma.project.findMany({ where: projWhere, take: 5 }),
    ]);

    const results = [
      ...products.map((p) => ({ type: "product", id: p.id, title: p.name, subtitle: p.sku, href: "/inventory" })),
      ...customers.map((c) => ({ type: "customer", id: c.id, title: c.name, subtitle: c.email, href: "/crm" })),
      ...orders.map((o) => ({ type: "order", id: o.id, title: o.orderNumber, subtitle: `$${o.total}`, href: "/pos" })),
      ...employees.map((e) => ({ type: "employee", id: e.id, title: `${e.firstName} ${e.lastName}`, subtitle: e.department, href: "/hr" })),
      ...projects.map((p) => ({ type: "project", id: p.id, title: p.name, subtitle: p.status, href: "/projects" })),
    ];

    return NextResponse.json({ results });
  } catch (error) {
    console.error("Search error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
