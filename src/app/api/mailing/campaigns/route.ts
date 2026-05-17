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
    if (companyId) where.companyId = companyId;
    const campaigns = await prisma.emailCampaign.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ campaigns });
  } catch (error) {
    console.error("Campaigns error:", error);
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
      subject: { required: true, type: "string", minLength: 1, maxLength: 500 },
      body: { required: true, type: "string", minLength: 1 },
    });
    if (errors.length) return NextResponse.json({ error: errors[0] }, { status: 400 });

    const campaign = await prisma.emailCampaign.create({
      data: {
        companyId: authUser.companyId || undefined,
        name: data.name,
        subject: data.subject,
        body: data.body,
        status: data.scheduledAt ? "SCHEDULED" : "DRAFT",
        scheduledAt: data.scheduledAt ? new Date(data.scheduledAt) : null,
      },
    });
    return NextResponse.json({ campaign });
  } catch (error) {
    console.error("Create campaign error:", error);
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
    await prisma.emailCampaign.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete campaign error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
