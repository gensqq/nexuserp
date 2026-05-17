import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAuthUser } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const user = await getAuthUser(req);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    if (!user.companyId) return NextResponse.json({ company: null });

    const company = await prisma.company.findUnique({ where: { id: user.companyId } });
    return NextResponse.json({ company });
  } catch (error) {
    console.error("Get company error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const user = await getAuthUser(req);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (!user.companyId) return NextResponse.json({ error: "No company associated" }, { status: 400 });

    const data = await req.json();
    const company = await prisma.company.update({
      where: { id: user.companyId },
      data: {
        name: data.name,
        domain: data.domain,
      },
    });

    return NextResponse.json({ company });
  } catch (error) {
    console.error("Update company error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
