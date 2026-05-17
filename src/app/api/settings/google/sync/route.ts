import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAuthUser } from "@/lib/auth";
import { createSpreadsheet, writeRows, readRows, SHEET_CONFIGS } from "@/lib/google";

export async function POST(req: NextRequest) {
  try {
    const user = await getAuthUser(req);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const accessToken = req.cookies.get("google_access_token")?.value;
    if (!accessToken) return NextResponse.json({ error: "Google Sheets not connected" }, { status: 400 });

    const { action, module: moduleKey, spreadsheetId } = await req.json();

    if (!SHEET_CONFIGS[moduleKey]) {
      return NextResponse.json({ error: "Invalid module" }, { status: 400 });
    }

    const config = SHEET_CONFIGS[moduleKey];

    if (action === "export") {
      const data = await getModuleData(moduleKey, user.companyId);
      const rows = data.map((item) => moduleToRow(moduleKey, item));

      let sheetId = spreadsheetId;
      let sheetUrl = "";

      if (!sheetId) {
        // Create new spreadsheet with sheet named after the module
        const result = await createSpreadsheet(accessToken, `ADN ERP - ${config.title}`, config.headers, config.title);
        sheetId = result.spreadsheetId;
        sheetUrl = result.url;
      }

      await writeRows(accessToken, sheetId, config.title, [config.headers, ...rows]);

      return NextResponse.json({
        success: true,
        action: "export",
        spreadsheetId: sheetId,
        url: sheetUrl || `https://docs.google.com/spreadsheets/d/${sheetId}`,
        rowsExported: rows.length,
      });
    }

    if (action === "import") {
      if (!spreadsheetId) return NextResponse.json({ error: "Spreadsheet ID required for import" }, { status: 400 });

      const rows = await readRows(accessToken, spreadsheetId, config.title);
      if (rows.length < 2) return NextResponse.json({ error: "Sheet is empty or has no data rows" }, { status: 400 });

      const headers = rows[0];
      const dataRows = rows.slice(1);
      const imported = await importModuleData(moduleKey, headers, dataRows, user.companyId);

      return NextResponse.json({
        success: true,
        action: "import",
        rowsImported: imported,
      });
    }

    return NextResponse.json({ error: "Invalid action. Use 'export' or 'import'" }, { status: 400 });
  } catch (error: any) {
    console.error("Google sync error:", error);
    return NextResponse.json({ error: error.message || "Sync failed" }, { status: 500 });
  }
}

async function getModuleData(module: string, companyId?: string | null) {
  const cp = companyId ? { companyId } : {};

  switch (module) {
    case "products":
      return prisma.product.findMany({ where: cp, orderBy: { name: "asc" } });
    case "customers":
      return prisma.customer.findMany({ where: cp, orderBy: { name: "asc" } });
    case "employees":
      return prisma.employee.findMany({
        where: companyId ? { user: { companyId } } as any : {},
        orderBy: { firstName: "asc" },
      });
    case "suppliers":
      return prisma.supplier.findMany({ where: cp, orderBy: { name: "asc" } });
    case "expenses":
      return prisma.expense.findMany({ orderBy: { date: "desc" } });
    case "orders":
      return prisma.order.findMany({
        include: { customer: true },
        orderBy: { createdAt: "desc" },
      });
    default:
      return [];
  }
}

function moduleToRow(module: string, item: any): any[] {
  switch (module) {
    case "products":
      return [item.id, item.name, item.sku, item.category || "", item.price, item.cost || 0, item.stock, item.minStock || 0, item.isActive ? "Yes" : "No"];
    case "customers":
      return [item.id, item.name, item.email || "", item.phone || "", item.city || "", item.country || "", item.status, item.source || ""];
    case "employees":
      return [item.id, item.employeeId, item.firstName, item.lastName, item.email, item.department || "", item.position || "", item.salary, item.status];
    case "suppliers":
      return [item.id, item.name, item.email || "", item.phone || "", item.address || "", item.isActive ? "Yes" : "No"];
    case "expenses":
      return [item.id, new Date(item.date).toLocaleDateString(), item.category, item.description || "", item.amount, item.vendor || "", item.status];
    case "orders":
      return [item.id, item.orderNumber, item.customer?.name || "", item.status, item.subtotal, item.tax, item.total, item.paymentMethod || "", new Date(item.createdAt).toLocaleDateString()];
    default:
      return [];
  }
}

async function importModuleData(module: string, headers: string[], rows: any[][], companyId?: string | null) {
  let imported = 0;

  for (const row of rows) {
    const data: Record<string, any> = {};
    headers.forEach((h, i) => {
      data[h.toLowerCase().replace(/\s+/g, "")] = row[i] || "";
    });

    try {
      switch (module) {
        case "products": {
          const sku = data.sku || `SKU-${Date.now()}-${imported}`;
          const existing = await prisma.product.findFirst({ where: { sku } });
          if (existing) {
            await prisma.product.update({
              where: { id: existing.id },
              data: {
                name: data.name || "Imported Product",
                category: data.category || null,
                price: parseFloat(data.price) || 0,
                cost: parseFloat(data.cost) || 0,
                stock: parseInt(data.stock) || 0,
                minStock: parseInt(data.minstock) || 0,
              },
            });
          } else {
            await prisma.product.create({
              data: {
                name: data.name || "Imported Product",
                sku,
                category: data.category || null,
                price: parseFloat(data.price) || 0,
                cost: parseFloat(data.cost) || 0,
                stock: parseInt(data.stock) || 0,
                minStock: parseInt(data.minstock) || 0,
                company: companyId ? { connect: { id: companyId } } : undefined,
              } as any,
            });
          }
          imported++;
          break;
        }

        case "customers": {
          if (!data.name) continue;
          const existingCust = data.email ? await prisma.customer.findFirst({ where: { email: data.email } }) : null;
          if (existingCust) {
            await prisma.customer.update({
              where: { id: existingCust.id },
              data: {
                name: data.name,
                phone: data.phone || null,
                city: data.city || null,
                country: data.country || null,
                status: data.status || "LEAD",
                source: data.source || null,
              },
            });
          } else {
            await prisma.customer.create({
              data: {
                name: data.name,
                email: data.email || null,
                phone: data.phone || null,
                city: data.city || null,
                country: data.country || null,
                status: data.status || "LEAD",
                source: data.source || null,
                company: companyId ? { connect: { id: companyId } } : undefined,
              } as any,
            });
          }
          imported++;
          break;
        }

        case "suppliers": {
          if (!data.name) continue;
          const existingSup = data.email ? await prisma.supplier.findFirst({ where: { email: data.email } }) : null;
          if (existingSup) {
            await prisma.supplier.update({
              where: { id: existingSup.id },
              data: {
                name: data.name,
                phone: data.phone || null,
                address: data.address || null,
              },
            });
          } else {
            await prisma.supplier.create({
              data: {
                name: data.name,
                email: data.email || null,
                phone: data.phone || null,
                address: data.address || null,
                company: companyId ? { connect: { id: companyId } } : undefined,
              } as any,
            });
          }
          imported++;
          break;
        }

        case "expenses":
          if (!data.description && !data.category) continue;
          await prisma.expense.create({
            data: {
              category: data.category || "General",
              description: data.description || "",
              amount: parseFloat(data.amount) || 0,
              vendor: data.vendor || null,
              status: data.status || "PENDING",
              date: new Date(),
            },
          });
          imported++;
          break;
      }
    } catch (e) {
      console.error(`Import row ${imported} failed:`, e);
    }
  }

  return imported;
}
