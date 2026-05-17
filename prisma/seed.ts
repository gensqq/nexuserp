import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // Clean existing data
  await prisma.auditLog.deleteMany();
  await prisma.timeEntry.deleteMany();
  await prisma.task.deleteMany();
  await prisma.project.deleteMany();
  await prisma.payroll.deleteMany();
  await prisma.leaveRequest.deleteMany();
  await prisma.attendance.deleteMany();
  await prisma.employee.deleteMany();
  await prisma.stockMovement.deleteMany();
  await prisma.purchaseOrderItem.deleteMany();
  await prisma.purchaseOrder.deleteMany();
  await prisma.supplier.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.deal.deleteMany();
  await prisma.crmActivity.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.product.deleteMany();
  await prisma.emailCampaign.deleteMany();
  await prisma.emailTemplate.deleteMany();
  await prisma.journalLine.deleteMany();
  await prisma.journalEntry.deleteMany();
  await prisma.expense.deleteMany();
  await prisma.income.deleteMany();
  await prisma.activity.deleteMany();
  await prisma.user.deleteMany();
  await prisma.company.deleteMany();

  // Create company
  const company = await prisma.company.create({
    data: {
      name: "NexusERP Inc",
      domain: "nexuserp.com",
      plan: "PROFESSIONAL",
    },
  });

  // Create users
  const passwordHash = await bcrypt.hash("admin123", 12);
  const admin = await prisma.user.create({
    data: {
      email: "admin@nexus.com",
      passwordHash,
      name: "Admin User",
      role: "ADMIN",
      companyId: company.id,
    },
  });

  const manager = await prisma.user.create({
    data: {
      email: "manager@nexus.com",
      passwordHash,
      name: "Sarah Chen",
      role: "MANAGER",
      companyId: company.id,
    },
  });

  const employee = await prisma.user.create({
    data: {
      email: "employee@nexus.com",
      passwordHash,
      name: "Mike Ross",
      role: "EMPLOYEE",
      companyId: company.id,
    },
  });

  // Create products
  const products = await Promise.all([
    prisma.product.create({
      data: { companyId: company.id, name: "Wireless Mouse", sku: "WM001", barcode: "123456789", price: 29.99, cost: 15, stock: 150, minStock: 50, category: "Electronics" },
    }),
    prisma.product.create({
      data: { companyId: company.id, name: "Mechanical Keyboard", sku: "MK001", barcode: "123456790", price: 89.99, cost: 45, stock: 75, minStock: 30, category: "Electronics" },
    }),
    prisma.product.create({
      data: { companyId: company.id, name: "USB-C Hub", sku: "UH001", barcode: "123456791", price: 49.99, cost: 25, stock: 200, minStock: 40, category: "Electronics" },
    }),
    prisma.product.create({
      data: { companyId: company.id, name: "Monitor Stand", sku: "MS001", barcode: "123456792", price: 34.99, cost: 18, stock: 120, minStock: 25, category: "Accessories" },
    }),
    prisma.product.create({
      data: { companyId: company.id, name: "Desk Lamp", sku: "DL001", barcode: "123456793", price: 24.99, cost: 12, stock: 90, minStock: 20, category: "Office" },
    }),
    prisma.product.create({
      data: { companyId: company.id, name: "Webcam HD", sku: "WC001", barcode: "123456794", price: 59.99, cost: 30, stock: 8, minStock: 15, category: "Electronics" },
    }),
    prisma.product.create({
      data: { companyId: company.id, name: "Headphones", sku: "HP001", barcode: "123456795", price: 79.99, cost: 40, stock: 45, minStock: 20, category: "Electronics" },
    }),
    prisma.product.create({
      data: { companyId: company.id, name: "Notebook Set", sku: "NS001", barcode: "123456796", price: 12.99, cost: 5, stock: 300, minStock: 50, category: "Office" },
    }),
  ]);

  // Create customers
  const customers = await Promise.all([
    prisma.customer.create({
      data: { companyId: company.id, name: "John Smith", email: "john@acme.com", phone: "+1 555-0101", status: "LEAD", source: "Website", tags: "enterprise,vip" },
    }),
    prisma.customer.create({
      data: { companyId: company.id, name: "Jane Doe", email: "jane@techstart.io", status: "PROSPECT", source: "Referral", tags: "startup" },
    }),
    prisma.customer.create({
      data: { companyId: company.id, name: "Bob Wilson", email: "bob@globalco.com", phone: "+1 555-0103", status: "ACTIVE", source: "LinkedIn", tags: "enterprise" },
    }),
    prisma.customer.create({
      data: { companyId: company.id, name: "Alice Brown", email: "alice@startup.dev", status: "ACTIVE", source: "Conference", tags: "startup,growth" },
    }),
    prisma.customer.create({
      data: { companyId: company.id, name: "Charlie Davis", email: "charlie@megacorp.com", phone: "+1 555-0105", status: "ACTIVE", source: "Cold Call", tags: "enterprise,vip" },
    }),
  ]);

  // Create deals
  await Promise.all([
    prisma.deal.create({ data: { customerId: customers[0].id, title: "Enterprise License", value: 85000, stage: "NEW", probability: 20, expectedClose: new Date("2026-03-15") } }),
    prisma.deal.create({ data: { customerId: customers[1].id, title: "Cloud Migration", value: 42000, stage: "QUALIFIED", probability: 40, expectedClose: new Date("2026-02-28") } }),
    prisma.deal.create({ data: { customerId: customers[2].id, title: "Custom Integration", value: 65000, stage: "PROPOSAL", probability: 60, expectedClose: new Date("2026-02-15") } }),
    prisma.deal.create({ data: { customerId: customers[4].id, title: "Annual Subscription", value: 120000, stage: "NEGOTIATION", probability: 80, expectedClose: new Date("2026-01-31") } }),
    prisma.deal.create({ data: { customerId: customers[3].id, title: "Support Package", value: 28000, stage: "NEW", probability: 15, expectedClose: new Date("2026-04-01") } }),
  ]);

  // Create orders
  const orders = await Promise.all([
    prisma.order.create({
      data: { orderNumber: "ORD-001", customerId: customers[2].id, status: "COMPLETED", subtotal: 4500, tax: 360, total: 4860, paymentMethod: "card" },
    }),
    prisma.order.create({
      data: { orderNumber: "ORD-002", customerId: customers[4].id, status: "PENDING", subtotal: 2800, tax: 224, total: 3024, paymentMethod: "cash" },
    }),
    prisma.order.create({
      data: { orderNumber: "ORD-003", customerId: customers[0].id, status: "COMPLETED", subtotal: 12500, tax: 1000, total: 13500, paymentMethod: "card" },
    }),
  ]);

  // Create order items
  await Promise.all([
    prisma.orderItem.create({ data: { orderId: orders[0].id, productId: products[0].id, quantity: 10, price: 29.99, total: 299.9 } }),
    prisma.orderItem.create({ data: { orderId: orders[0].id, productId: products[1].id, quantity: 5, price: 89.99, total: 449.95 } }),
    prisma.orderItem.create({ data: { orderId: orders[1].id, productId: products[2].id, quantity: 20, price: 49.99, total: 999.8 } }),
    prisma.orderItem.create({ data: { orderId: orders[2].id, productId: products[6].id, quantity: 50, price: 79.99, total: 3999.5 } }),
  ]);

  // Create journal entries
  const je1 = await prisma.journalEntry.create({
    data: { date: new Date(), reference: "JE-001", description: "Monthly rent payment", total: 5000, status: "POSTED" },
  });
  await prisma.journalLine.createMany({
    data: [
      { journalEntryId: je1.id, accountCode: "5000", accountName: "Rent Expense", debit: 5000, credit: 0 },
      { journalEntryId: je1.id, accountCode: "1000", accountName: "Cash", debit: 0, credit: 5000 },
    ],
  });

  const je2 = await prisma.journalEntry.create({
    data: { date: new Date(), reference: "JE-002", description: "Client payment received", total: 15000, status: "POSTED" },
  });
  await prisma.journalLine.createMany({
    data: [
      { journalEntryId: je2.id, accountCode: "1000", accountName: "Cash", debit: 15000, credit: 0 },
      { journalEntryId: je2.id, accountCode: "4000", accountName: "Revenue", debit: 0, credit: 15000 },
    ],
  });

  // Create expenses
  await prisma.expense.createMany({
    data: [
      { date: new Date(), category: "Rent", description: "Office rent - January", amount: 5000, vendor: "Property Co", status: "APPROVED" },
      { date: new Date(), category: "Utilities", description: "Electricity bill", amount: 320, vendor: "Power Corp", status: "APPROVED" },
      { date: new Date(), category: "Supplies", description: "Office supplies", amount: 850, vendor: "Office Depot", status: "PENDING" },
      { date: new Date(), category: "Travel", description: "Client meeting travel", amount: 450, vendor: "Airlines", status: "PENDING" },
      { date: new Date(), category: "Software", description: "SaaS subscriptions", amount: 1200, vendor: "Various", status: "APPROVED" },
    ],
  });

  // Create income
  await prisma.income.createMany({
    data: [
      { date: new Date(), source: "Sales", description: "Product sales", amount: 45000, reference: "INV-001" },
      { date: new Date(), source: "Services", description: "Consulting services", amount: 15000, reference: "INV-002" },
      { date: new Date(), source: "Subscriptions", description: "Monthly subscriptions", amount: 8500, reference: "INV-003" },
    ],
  });

  // Create employees
  const employees = await Promise.all([
    prisma.employee.create({
      data: { employeeId: "EMP001", userId: admin.id, firstName: "Admin", lastName: "User", email: "admin@nexus.com", department: "Management", position: "CEO", hireDate: new Date("2022-01-01"), salary: 150000, status: "ACTIVE" },
    }),
    prisma.employee.create({
      data: { employeeId: "EMP002", userId: manager.id, firstName: "Sarah", lastName: "Chen", email: "sarah@company.com", phone: "+1 555-1001", department: "Engineering", position: "Senior Developer", hireDate: new Date("2022-03-15"), salary: 125000, status: "ACTIVE" },
    }),
    prisma.employee.create({
      data: { employeeId: "EMP003", firstName: "Mike", lastName: "Ross", email: "mike@company.com", phone: "+1 555-1002", department: "Sales", position: "Sales Manager", hireDate: new Date("2021-06-20"), salary: 95000, status: "ACTIVE" },
    }),
    prisma.employee.create({
      data: { employeeId: "EMP004", firstName: "Emily", lastName: "Davis", email: "emily@company.com", phone: "+1 555-1003", department: "Finance", position: "Financial Analyst", hireDate: new Date("2023-01-10"), salary: 88000, status: "ACTIVE" },
    }),
    prisma.employee.create({
      data: { employeeId: "EMP005", firstName: "Alex", lastName: "Kim", email: "alex@company.com", department: "Design", position: "UI/UX Designer", hireDate: new Date("2022-09-05"), salary: 92000, status: "ACTIVE" },
    }),
    prisma.employee.create({
      data: { employeeId: "EMP006", firstName: "Jordan", lastName: "Lee", email: "jordan@company.com", department: "Marketing", position: "Marketing Lead", hireDate: new Date("2023-04-18"), salary: 85000, status: "ON_LEAVE" },
    }),
  ]);

  // Create attendance
  const today = new Date();
  await prisma.attendance.createMany({
    data: employees.slice(0, 5).map((emp) => ({
      employeeId: emp.id,
      date: today,
      checkIn: new Date(today.setHours(9, 0, 0, 0)),
      status: "PRESENT",
    })),
  });

  // Create leave requests
  await prisma.leaveRequest.createMany({
    data: [
      { employeeId: employees[5].id, type: "ANNUAL", startDate: new Date("2026-01-20"), endDate: new Date("2026-01-25"), reason: "Family vacation", status: "PENDING" },
      { employeeId: employees[1].id, type: "SICK", startDate: new Date("2026-01-18"), endDate: new Date("2026-01-18"), reason: "Doctor appointment", status: "APPROVED" },
    ],
  });

  // Create payroll
  await prisma.payroll.createMany({
    data: employees.slice(0, 4).map((emp) => ({
      employeeId: emp.id,
      period: "2026-01",
      grossPay: emp.salary / 12,
      deductions: emp.salary / 12 * 0.24,
      netPay: emp.salary / 12 * 0.76,
      status: "PAID",
      paidAt: new Date(),
    })),
  });

  // Create projects
  const project1 = await prisma.project.create({
    data: { name: "Website Redesign", description: "Complete overhaul of the company website", ownerId: admin.id, status: "ACTIVE", startDate: new Date(), endDate: new Date("2026-03-01"), budget: 50000 },
  });
  const project2 = await prisma.project.create({
    data: { name: "Mobile App", description: "Build cross-platform mobile app", ownerId: manager.id, status: "ACTIVE", startDate: new Date(), endDate: new Date("2026-06-01"), budget: 120000 },
  });

  // Create tasks
  await prisma.task.createMany({
    data: [
      { projectId: project1.id, assigneeId: admin.id, title: "Design new landing page", status: "TODO", priority: "HIGH", dueDate: new Date("2026-02-15"), estimatedHours: 16 },
      { projectId: project1.id, assigneeId: manager.id, title: "Implement user authentication", status: "IN_PROGRESS", priority: "URGENT", dueDate: new Date("2026-02-10"), estimatedHours: 24 },
      { projectId: project1.id, assigneeId: employee.id, title: "Write API documentation", status: "IN_PROGRESS", priority: "MEDIUM", dueDate: new Date("2026-02-20"), estimatedHours: 8 },
      { projectId: project1.id, assigneeId: admin.id, title: "Set up CI/CD pipeline", status: "TODO", priority: "HIGH", dueDate: new Date("2026-02-12"), estimatedHours: 12 },
      { projectId: project1.id, title: "Create email templates", status: "IN_REVIEW", priority: "LOW", dueDate: new Date("2026-02-18"), estimatedHours: 6 },
      { projectId: project1.id, assigneeId: manager.id, title: "Database optimization", status: "DONE", priority: "HIGH", dueDate: new Date("2026-02-08"), estimatedHours: 10 },
      { projectId: project2.id, assigneeId: admin.id, title: "Design mobile UI", status: "TODO", priority: "HIGH", dueDate: new Date("2026-03-01"), estimatedHours: 32 },
      { projectId: project2.id, assigneeId: manager.id, title: "Build React Native app", status: "TODO", priority: "URGENT", dueDate: new Date("2026-04-01"), estimatedHours: 80 },
    ],
  });

  // Create suppliers
  const suppliers = await Promise.all([
    prisma.supplier.create({ data: { companyId: company.id, name: "TechSupply Co", email: "orders@techsupply.com", phone: "+1 555-9001" } }),
    prisma.supplier.create({ data: { companyId: company.id, name: "GadgetWorld", email: "sales@gadgetworld.com", phone: "+1 555-9002" } }),
    prisma.supplier.create({ data: { companyId: company.id, name: "ErgoPlus", email: "info@ergoplus.com", phone: "+1 555-9003" } }),
  ]);

  // Create email campaigns
  await prisma.emailCampaign.createMany({
    data: [
      { name: "Summer Sale 2026", subject: "Don't miss our biggest sale!", body: "<h1>Summer Sale</h1><p>Up to 50% off!</p>", status: "SENT", recipientCount: 12500, openCount: 4200, clickCount: 890, sentAt: new Date() },
      { name: "Product Launch", subject: "Introducing Widget Pro X", body: "<h1>New Product</h1><p>Check out our latest product!</p>", status: "SENT", recipientCount: 8300, openCount: 3100, clickCount: 620, sentAt: new Date() },
      { name: "Newsletter", subject: "Your monthly update", body: "<h1>Newsletter</h1><p>Monthly updates...</p>", status: "SCHEDULED", recipientCount: 15000, scheduledAt: new Date("2026-02-01") },
    ],
  });

  // Create email templates
  await prisma.emailTemplate.createMany({
    data: [
      { name: "Welcome Email", subject: "Welcome to NexusERP!", body: "<h1>Welcome {{name}}!</h1><p>Thank you for joining us.</p>", variables: "name,email" },
      { name: "Invoice", subject: "Invoice #{{invoiceNumber}}", body: "<h1>Invoice</h1><p>Amount: {{amount}}</p>", variables: "invoiceNumber,amount,dueDate" },
      { name: "Follow Up", subject: "Following up on our conversation", body: "<h1>Hi {{name}}</h1><p>Just following up...</p>", variables: "name" },
    ],
  });

  // Create activities
  await prisma.activity.createMany({
    data: [
      { userId: admin.id, action: "created", entity: "order", entityId: orders[0].id, details: '{"orderNumber":"ORD-001"}' },
      { userId: manager.id, action: "updated", entity: "customer", entityId: customers[0].id, details: '{"field":"status","value":"ACTIVE"}' },
      { userId: admin.id, action: "approved", entity: "expense", details: '{"amount":5000}' },
    ],
  });

  console.log("Database seeded successfully!");
  console.log(`  Users: 3`);
  console.log(`  Products: ${products.length}`);
  console.log(`  Customers: ${customers.length}`);
  console.log(`  Orders: ${orders.length}`);
  console.log(`  Employees: ${employees.length}`);
  console.log(`  Projects: 2`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
