import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAuthUser } from "@/lib/auth";
import { validate } from "@/lib/validate";

export async function GET(req: NextRequest) {
  try {
    const user = await getAuthUser(req);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");

    const companyId = user.companyId;
    const where: any = {};
    if (companyId) where.companyId = companyId;

    const [entries, total] = await Promise.all([
      prisma.journalEntry.findMany({
        where,
        include: { lines: true },
        orderBy: { date: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.journalEntry.count({ where }),
    ]);

    return NextResponse.json({ entries, total, page, totalPages: Math.ceil(total / limit) });
  } catch (error) {
    console.error("Journal entries error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const authUser = await getAuthUser(req);
    if (!authUser) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { date, reference, description, lines } = await req.json();

    const errors = validate({ date, description, lines }, {
      date: { required: true },
      description: { required: true, type: "string", minLength: 1, maxLength: 500 },
      lines: { required: true, type: "array" },
    });
    if (errors.length) return NextResponse.json({ error: errors[0] }, { status: 400 });

    if (lines.length === 0) {
      return NextResponse.json({ error: "Journal entry must have lines" }, { status: 400 });
    }

    // Validate debits = credits
    const totalDebit = lines.reduce((sum: number, l: any) => sum + (l.debit || 0), 0);
    const totalCredit = lines.reduce((sum: number, l: any) => sum + (l.credit || 0), 0);
    if (Math.abs(totalDebit - totalCredit) > 0.01) {
      return NextResponse.json({ error: "Debits must equal credits" }, { status: 400 });
    }

    const entry = await prisma.journalEntry.create({
      data: {
        companyId: authUser.companyId || undefined,
        date: new Date(date),
        reference,
        description,
        total: totalDebit,
        status: "DRAFT",
        lines: {
          create: lines.map((l: any) => ({
            accountCode: l.accountCode,
            accountName: l.accountName,
            debit: l.debit || 0,
            credit: l.credit || 0,
          })),
        },
      },
      include: { lines: true },
    });

    return NextResponse.json({ entry });
  } catch (error) {
    console.error("Create journal entry error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
