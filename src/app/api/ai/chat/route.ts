import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAuthUser } from "@/lib/auth";

async function getBusinessContext(companyId?: string | null) {
  const cp = companyId || undefined;

  const [customers, orders, products, employees, deals, expenses, projects, tasks, payroll] = await Promise.all([
    prisma.customer.findMany({ where: cp ? { companyId: cp } : {}, include: { deals: true } }),
    prisma.order.findMany({ where: { status: "COMPLETED" as const, ...(cp ? { customer: { companyId: cp } } : {}) }, select: { total: true, createdAt: true, orderNumber: true } }),
    prisma.product.findMany({ where: cp ? { companyId: cp } : {}, select: { name: true, stock: true, minStock: true, price: true, category: true } }),
    prisma.employee.findMany({ where: cp ? { user: { companyId: cp } } as any : {}, select: { firstName: true, lastName: true, department: true, salary: true, status: true } }),
    prisma.deal.findMany({ where: cp ? { customer: { companyId: cp } } as any : {}, include: { customer: { select: { name: true } } } }),
    prisma.expense.findMany({ where: { status: "APPROVED" as const, ...(cp ? { companyId: cp } : {}) }, select: { amount: true, category: true, description: true } }),
    prisma.project.findMany({ where: cp ? { owner: { companyId: cp } } as any : {}, include: { tasks: true } }),
    prisma.task.findMany({ where: cp ? { project: { owner: { companyId: cp } } } as any : {}, select: { title: true, status: true, priority: true } }),
    prisma.payroll.findMany({ where: cp ? { employee: { user: { companyId: cp } } } as any : {}, include: { employee: { select: { firstName: true, lastName: true } } } }),
  ]);

  const totalRevenue = orders.reduce((s, o) => s + o.total, 0);
  const totalExpenses = expenses.reduce((s, e) => s + e.amount, 0);
  const netIncome = totalRevenue - totalExpenses;
  const lowStockProducts = products.filter((p) => p.stock < p.minStock);
  const activeEmployees = employees.filter((e) => e.status === "ACTIVE");
  const pipelineValue = deals.filter((d) => !["CLOSED_WON", "CLOSED_LOST"].includes(d.stage)).reduce((s, d) => s + d.value, 0);
  const pendingTasks = tasks.filter((t) => t.status !== "DONE");
  const urgentTasks = tasks.filter((t) => t.priority === "URGENT" && t.status !== "DONE");

  const expenseBreakdown = expenses.reduce((acc: Record<string, number>, e) => {
    acc[e.category] = (acc[e.category] || 0) + e.amount;
    return acc;
  }, {});

  const departments = activeEmployees.reduce((acc: Record<string, number>, e) => {
    acc[e.department] = (acc[e.department] || 0) + 1;
    return acc;
  }, {});

  return `
BUSINESS DATA CONTEXT:
=====================
FINANCIALS:
- Total Revenue: $${totalRevenue.toLocaleString()}
- Total Expenses: $${totalExpenses.toLocaleString()}
- Net Income: $${netIncome.toLocaleString()}
- Profit Margin: ${totalRevenue > 0 ? ((netIncome / totalRevenue) * 100).toFixed(1) : 0}%
- Expense Breakdown: ${JSON.stringify(expenseBreakdown)}

TEAM (${activeEmployees.length} active employees):
- Departments: ${JSON.stringify(departments)}
- Employees: ${activeEmployees.map((e) => `${e.firstName} ${e.lastName} (${e.department})`).join(", ")}

PRODUCTS (${products.length} total):
- All Products: ${products.map((p) => `${p.name} - $${p.price} (stock: ${p.stock})`).join(", ")}
- Low Stock: ${lowStockProducts.map((p) => `${p.name} (${p.stock}/${p.minStock})`).join(", ") || "None"}

CRM:
- Total Customers: ${customers.length}
- Pipeline Value: $${pipelineValue.toLocaleString()}
- Won Deals: ${deals.filter((d) => d.stage === "CLOSED_WON").length}
- Active Deals: ${deals.filter((d) => !["CLOSED_WON", "CLOSED_LOST"].includes(d.stage)).map((d) => `${d.title}: $${d.value} (${d.stage}) - ${d.customer?.name || "No customer"}`).join("; ")}

PROJECTS (${projects.length} active):
- Projects: ${projects.map((p) => `${p.name} (${p.status}) - ${p.tasks.length} tasks`).join(", ")}
- Pending Tasks: ${pendingTasks.length}
- Urgent Tasks: ${urgentTasks.map((t) => `${t.title} [${t.priority}]`).join(", ") || "None"}

PAYROLL:
- Records: ${payroll.length}
- Total Paid: $${payroll.filter((p) => p.status === "PAID").reduce((s, p) => s + p.netPay, 0).toLocaleString()}
=====================
`.trim();
}

async function callOpenAI(message: string, context: string, history: Array<{ role: string; content: string }>, apiKey: string): Promise<string> {
  if (!apiKey) throw new Error("OPENAI_API_KEY not set");

  const messages = [
    {
      role: "system",
      content: `You are a friendly, helpful AI business assistant for an ERP system called "ADN's Tech". You have access to live business data. Be conversational, use emojis, and provide actionable insights. Keep responses concise but informative. Always reference specific numbers from the data when answering.

${context}`
    },
    ...history.slice(-10).map((h) => ({ role: h.role, content: h.content })),
    { role: "user", content: message }
  ];

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages,
      temperature: 0.7,
      max_tokens: 1000,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`OpenAI error: ${error.error?.message || response.statusText}`);
  }

  const data = await response.json();
  return data.choices[0].message.content;
}

async function callAnthropic(message: string, context: string, history: Array<{ role: string; content: string }>, apiKey: string): Promise<string> {
  if (!apiKey) throw new Error("ANTHROPIC_API_KEY not set");

  const messages = [
    ...history.slice(-10).map((h) => ({ role: h.role, content: h.content })),
    { role: "user", content: message }
  ];

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 1000,
      system: `You are a friendly, helpful AI business assistant for an ERP system called "ADN's Tech". You have access to live business data. Be conversational, use emojis, and provide actionable insights. Keep responses concise but informative. Always reference specific numbers from the data when answering.

${context}`,
      messages,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Anthropic error: ${error.error?.message || response.statusText}`);
  }

  const data = await response.json();
  return data.content[0].text;
}

function getFallbackResponse(message: string, context: string): string {
  const q = message.toLowerCase();

  // Parse all context data
  const revenueMatch = context.match(/Total Revenue: \$(\d[\d,]*)/);
  const revenue = revenueMatch ? revenueMatch[1] : "0";
  const expensesMatch = context.match(/Total Expenses: \$(\d[\d,]*)/);
  const expenses = expensesMatch ? expensesMatch[1] : "0";
  const netMatch = context.match(/Net Income: \$([-\d,]*)/);
  const netIncome = netMatch ? netMatch[1] : "0";
  const marginMatch = context.match(/Profit Margin: ([\d.]+)%/);
  const margin = marginMatch ? marginMatch[1] : "0";
  const employeesMatch = context.match(/(\d+) active employees/);
  const employees = employeesMatch ? employeesMatch[1] : "0";
  const customersMatch = context.match(/Total Customers: (\d+)/);
  const customers = customersMatch ? customersMatch[1] : "0";
  const productsMatch = context.match(/\((\d+) total\)/);
  const products = productsMatch ? productsMatch[1] : "0";
  const pipelineMatch = context.match(/Pipeline Value: \$(\d[\d,]*)/);
  const pipeline = pipelineMatch ? pipelineMatch[1] : "0";
  const lowStockMatch = context.match(/Low Stock: (.+)/);
  const lowStock = lowStockMatch ? lowStockMatch[1].trim() : "None";
  const pendingMatch = context.match(/Pending Tasks: (\d+)/);
  const pendingTasks = pendingMatch ? pendingMatch[1] : "0";
  const urgentMatch = context.match(/Urgent Tasks: (.+)/);
  const urgentTasks = urgentMatch ? urgentMatch[1].trim() : "None";
  const projectsMatch = context.match(/\((\d+) active\)/);
  const projects = projectsMatch ? projectsMatch[1] : "0";
  const wonMatch = context.match(/Won Deals: (\d+)/);
  const wonDeals = wonMatch ? wonMatch[1] : "0";
  const deptsMatch = context.match(/Departments: ({[^}]+})/);
  let depts = "{}";
  if (deptsMatch) depts = deptsMatch[1];
  const expenseMatch = context.match(/Expense Breakdown: ({[^}]+})/);
  let expenseBreakdown = "{}";
  if (expenseMatch) expenseBreakdown = expenseMatch[1];

  // Greetings
  if (q.includes("hello") || q.includes("hi") || q.includes("hey") || q.includes("good morning") || q.includes("good afternoon")) {
    return `Hey there! 👋 Welcome to ADN's Tech AI Assistant!\n\nHere's a quick snapshot:\n• Revenue: $${revenue}\n• Team: ${employees} employees\n• Customers: ${customers}\n\nAsk me anything about your business!`;
  }

  // Revenue / Sales
  if (q.includes("revenue") || q.includes("sales") || q.includes("income") || q.includes("earning")) {
    return `💰 **Revenue Overview**\n\n• Total Revenue: $${revenue}\n• Total Expenses: $${expenses}\n• Net Income: $${netIncome}\n• Profit Margin: ${margin}%\n\n${Number(revenue.replace(/,/g, '')) > 0 ? "Your business is generating revenue!" : "No revenue recorded yet. Start by creating orders in the POS module."}`;
  }

  // Expenses
  if (q.includes("expense") || q.includes("cost") || q.includes("spend")) {
    let breakdown = "";
    try {
      const parsed = JSON.parse(expenseBreakdown);
      breakdown = Object.entries(parsed).map(([cat, amt]) => `• ${cat}: $${(amt as number).toLocaleString()}`).join("\n");
    } catch { breakdown = "No expense data available"; }
    return `💸 **Expense Overview**\n\n• Total Expenses: $${expenses}\n\n**By Category:**\n${breakdown}\n\nWant to add a new expense? Go to Accounting > Expenses.`;
  }

  // Employees / Team
  if (q.includes("employee") || q.includes("team") || q.includes("staff") || q.includes("worker") || q.includes("hire")) {
    let deptBreakdown = "";
    try {
      const parsed = JSON.parse(depts);
      deptBreakdown = Object.entries(parsed).map(([dept, count]) => `• ${dept}: ${count} people`).join("\n");
    } catch { deptBreakdown = "No department data"; }
    return `👥 **Team Overview**\n\n• Active Employees: ${employees}\n\n**By Department:**\n${deptBreakdown}\n\nManage your team in the HR & Payroll module.`;
  }

  // Customers / CRM
  if (q.includes("customer") || q.includes("client") || q.includes("crm") || q.includes("lead") || q.includes("contact")) {
    return `🤝 **CRM Overview**\n\n• Total Customers: ${customers}\n• Pipeline Value: $${pipeline}\n• Won Deals: ${wonDeals}\n\nManage your contacts and deals in the CRM module.`;
  }

  // Products / Inventory / Stock
  if (q.includes("product") || q.includes("inventory") || q.includes("stock") || q.includes("item") || q.includes("sku")) {
    return `📦 **Inventory Overview**\n\n• Total Products: ${products}\n• Low Stock Items: ${lowStock}\n\n${lowStock !== "None" ? "⚠️ Some products need restocking!" : "Stock levels look healthy."}\n\nManage products in the Inventory module.`;
  }

  // Projects / Tasks
  if (q.includes("project") || q.includes("task") || q.includes("todo") || q.includes("kanban")) {
    return `📋 **Projects Overview**\n\n• Active Projects: ${projects}\n• Pending Tasks: ${pendingTasks}\n• Urgent Tasks: ${urgentTasks}\n\nManage your projects in the Projects module.`;
  }

  // Deals / Pipeline
  if (q.includes("deal") || q.includes("pipeline") || q.includes("proposal") || q.includes("negotiation")) {
    return `🎯 **Sales Pipeline**\n\n• Pipeline Value: $${pipeline}\n• Won Deals: ${wonDeals}\n\nTrack your deals in the CRM > Pipeline tab.`;
  }

  // Payroll / Salary
  if (q.includes("payroll") || q.includes("salary") || q.includes("pay") || q.includes("wage")) {
    return `💳 **Payroll Overview**\n\n• Team Size: ${employees} employees\n• Payroll records available in HR & Payroll module.\n\nGenerate payroll from the HR module to calculate salaries.`;
  }

  // Summary / Overview
  if (q.includes("summary") || q.includes("overview") || q.includes("dashboard") || q.includes("report") || q.includes("how is my business") || q.includes("how are things")) {
    return `📊 **Business Summary**\n\n**Financials:**\n• Revenue: $${revenue}\n• Expenses: $${expenses}\n• Net Income: $${netIncome}\n• Profit Margin: ${margin}%\n\n**Operations:**\n• Employees: ${employees}\n• Customers: ${customers}\n• Products: ${products}\n• Active Projects: ${projects}\n\n**Sales:**\n• Pipeline: $${pipeline}\n• Won Deals: ${wonDeals}\n\n**Tasks:**\n• Pending: ${pendingTasks}\n• Urgent: ${urgentTasks !== "None" ? urgentTasks : "None"}\n\nWhat would you like to dive deeper into?`;
  }

  // Help
  if (q.includes("help") || q.includes("what can you") || q.includes("how to") || q.includes("how do")) {
    return `🤖 **I can help you with:**\n\n• "How's my revenue?" — Financial overview\n• "Show my team" — Employee details\n• "What products are low stock?" — Inventory alerts\n• "Customer summary" — CRM overview\n• "Project status" — Tasks & projects\n• "Business summary" — Full dashboard overview\n• "Expenses breakdown" — Spending analysis\n\nJust ask in plain English!`;
  }

  // Thank you
  if (q.includes("thank") || q.includes("thanks") || q.includes("awesome") || q.includes("great")) {
    return `You're welcome! 😊 Let me know if you need anything else about your business data.`;
  }

  // Default
  return `I'm here to help with your business data! Try asking:\n\n• "How's my revenue?"\n• "Show me my team"\n• "What products are low stock?"\n• "Business summary"\n• "Help"\n\nWhat would you like to know?`;
}

export async function POST(req: NextRequest) {
  try {
    const user = await getAuthUser(req);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { message, history = [] } = await req.json();
    if (!message) return NextResponse.json({ error: "Message required" }, { status: 400 });

    const context = await getBusinessContext(user.companyId);
    let response: string;

    // Per-request conversation history from client (no shared server state)
    const conversationHistory = Array.isArray(history) ? history.slice(-10) : [];

    // Load API keys from company
    let openaiKey = process.env.OPENAI_API_KEY || "";
    let anthropicKey = process.env.ANTHROPIC_API_KEY || "";
    if (user.companyId) {
      const company = await prisma.company.findUnique({
        where: { id: user.companyId },
        select: { openaiKey: true, anthropicKey: true },
      });
      if (company?.openaiKey) openaiKey = company.openaiKey;
      if (company?.anthropicKey) anthropicKey = company.anthropicKey;
    }

    // Try AI models in order: OpenAI -> Anthropic -> Fallback
    try {
      if (openaiKey) {
        response = await callOpenAI(message, context, conversationHistory, openaiKey);
      } else if (anthropicKey) {
        response = await callAnthropic(message, context, conversationHistory, anthropicKey);
      } else {
        response = getFallbackResponse(message, context);
      }
    } catch (error) {
      console.error("AI model error:", error);
      response = getFallbackResponse(message, context);
    }

    return NextResponse.json({ response, model: openaiKey ? "openai" : anthropicKey ? "anthropic" : "builtin" });
  } catch (error) {
    console.error("AI chat error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
