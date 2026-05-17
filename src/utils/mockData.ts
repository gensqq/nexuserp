import { KPI, ActivityLog, CRMLead, CRMDeal, EmployeeType, TaskType, Campaign } from "@/types";

export const mockKPIs: KPI[] = [
  {
    title: "Total Revenue",
    value: "$284,520",
    change: 12.5,
    changeLabel: "vs last month",
    icon: "dollar-sign",
    color: "emerald",
  },
  {
    title: "Active Users",
    value: "14,832",
    change: 8.2,
    changeLabel: "vs last month",
    icon: "users",
    color: "blue",
  },
  {
    title: "Orders",
    value: "3,642",
    change: -2.4,
    changeLabel: "vs last month",
    icon: "shopping-cart",
    color: "violet",
  },
  {
    title: "Conversion Rate",
    value: "3.24%",
    change: 4.1,
    changeLabel: "vs last month",
    icon: "trending-up",
    color: "amber",
  },
];

export const mockRevenueData = [
  { name: "Jan", revenue: 18500, expenses: 12400, profit: 6100 },
  { name: "Feb", revenue: 22300, expenses: 13800, profit: 8500 },
  { name: "Mar", revenue: 19800, expenses: 11900, profit: 7900 },
  { name: "Apr", revenue: 26400, expenses: 15200, profit: 11200 },
  { name: "May", revenue: 32100, expenses: 16800, profit: 15300 },
  { name: "Jun", revenue: 28700, expenses: 14500, profit: 14200 },
  { name: "Jul", revenue: 35200, expenses: 17200, profit: 18000 },
  { name: "Aug", revenue: 31800, expenses: 15900, profit: 15900 },
  { name: "Sep", revenue: 38400, expenses: 18300, profit: 20100 },
  { name: "Oct", revenue: 42100, expenses: 19800, profit: 22300 },
  { name: "Nov", revenue: 39600, expenses: 18100, profit: 21500 },
  { name: "Dec", revenue: 45200, expenses: 20500, profit: 24700 },
];

export const mockSalesByCategory = [
  { name: "Electronics", value: 35 },
  { name: "Clothing", value: 25 },
  { name: "Food & Bev", value: 20 },
  { name: "Services", value: 15 },
  { name: "Other", value: 5 },
];

export const mockActivityLogs: ActivityLog[] = [
  { id: "1", user: "Sarah Chen", action: "created a new order", entity: "Order #1234", timestamp: "2 min ago", avatar: "SC" },
  { id: "2", user: "Mike Ross", action: "updated customer record", entity: "Acme Corp", timestamp: "15 min ago", avatar: "MR" },
  { id: "3", user: "Emily Davis", action: "approved expense report", entity: "EXP-2024-089", timestamp: "1 hour ago", avatar: "ED" },
  { id: "4", user: "Alex Kim", action: "completed task", entity: "UI Redesign", timestamp: "2 hours ago", avatar: "AK" },
  { id: "5", user: "Jordan Lee", action: "sent email campaign", entity: "Summer Sale", timestamp: "3 hours ago", avatar: "JL" },
  { id: "6", user: "Taylor Swift", action: "added new product", entity: "Widget Pro X", timestamp: "4 hours ago", avatar: "TS" },
  { id: "7", user: "Chris Martin", action: "processed payroll", entity: "May 2024", timestamp: "5 hours ago", avatar: "CM" },
  { id: "8", user: "Lisa Wang", action: "closed a deal", entity: "Enterprise Plan", timestamp: "6 hours ago", avatar: "LW" },
];

export const mockLeads: CRMLead[] = [
  { id: "1", name: "John Smith", email: "john@acme.com", phone: "+1 555-0101", company: "Acme Inc", status: "new", source: "Website", value: 15000, createdAt: "2024-01-15" },
  { id: "2", name: "Jane Doe", email: "jane@techstart.io", company: "TechStart", status: "contacted", source: "Referral", value: 28000, createdAt: "2024-01-14" },
  { id: "3", name: "Bob Wilson", email: "bob@globalco.com", phone: "+1 555-0103", company: "Global Co", status: "qualified", source: "LinkedIn", value: 42000, createdAt: "2024-01-13" },
  { id: "4", name: "Alice Brown", email: "alice@startup.dev", company: "StartupDev", status: "proposal", source: "Conference", value: 65000, createdAt: "2024-01-12" },
  { id: "5", name: "Charlie Davis", email: "charlie@megacorp.com", phone: "+1 555-0105", company: "MegaCorp", status: "negotiation", source: "Cold Call", value: 120000, createdAt: "2024-01-11" },
  { id: "6", name: "Diana Prince", email: "diana@wayne.com", company: "Wayne Enterprises", status: "won", source: "Website", value: 95000, createdAt: "2024-01-10" },
  { id: "7", name: "Edward Norton", email: "ed@fightclub.com", status: "lost", source: "Email", value: 18000, createdAt: "2024-01-09" },
];

export const mockDeals: CRMDeal[] = [
  { id: "1", title: "Enterprise License", customer: "Acme Inc", value: 85000, stage: "new", probability: 20, expectedClose: "2024-03-15" },
  { id: "2", title: "Cloud Migration", customer: "TechStart", value: 42000, stage: "qualified", probability: 40, expectedClose: "2024-02-28" },
  { id: "3", title: "Custom Integration", customer: "Global Co", value: 65000, stage: "proposal", probability: 60, expectedClose: "2024-02-15" },
  { id: "4", title: "Annual Subscription", customer: "MegaCorp", value: 120000, stage: "negotiation", probability: 80, expectedClose: "2024-01-31" },
  { id: "5", title: "Support Package", customer: "Wayne Enterprises", value: 28000, stage: "new", probability: 15, expectedClose: "2024-04-01" },
];

export const mockEmployees: EmployeeType[] = [
  { id: "1", employeeId: "EMP001", firstName: "Sarah", lastName: "Chen", email: "sarah@company.com", phone: "+1 555-1001", department: "Engineering", position: "Senior Developer", hireDate: "2022-03-15", salary: 125000, status: "active" },
  { id: "2", employeeId: "EMP002", firstName: "Mike", lastName: "Ross", email: "mike@company.com", phone: "+1 555-1002", department: "Sales", position: "Sales Manager", hireDate: "2021-06-20", salary: 95000, status: "active" },
  { id: "3", employeeId: "EMP003", firstName: "Emily", lastName: "Davis", email: "emily@company.com", phone: "+1 555-1003", department: "Finance", position: "Financial Analyst", hireDate: "2023-01-10", salary: 88000, status: "active" },
  { id: "4", employeeId: "EMP004", firstName: "Alex", lastName: "Kim", email: "alex@company.com", phone: "+1 555-1004", department: "Design", position: "UI/UX Designer", hireDate: "2022-09-05", salary: 92000, status: "active" },
  { id: "5", employeeId: "EMP005", firstName: "Jordan", lastName: "Lee", email: "jordan@company.com", phone: "+1 555-1005", department: "Marketing", position: "Marketing Lead", hireDate: "2023-04-18", salary: 85000, status: "on_leave" },
  { id: "6", employeeId: "EMP006", firstName: "Taylor", lastName: "Swift", email: "taylor@company.com", department: "Engineering", position: "Frontend Developer", hireDate: "2023-07-22", salary: 105000, status: "active" },
  { id: "7", employeeId: "EMP007", firstName: "Chris", lastName: "Martin", email: "chris@company.com", phone: "+1 555-1007", department: "HR", position: "HR Manager", hireDate: "2021-11-30", salary: 90000, status: "active" },
  { id: "8", employeeId: "EMP008", firstName: "Lisa", lastName: "Wang", email: "lisa@company.com", department: "Operations", position: "Operations Manager", hireDate: "2022-05-12", salary: 98000, status: "active" },
];

export const mockTasks: TaskType[] = [
  { id: "1", projectId: "p1", title: "Design new landing page", status: "todo", priority: "high", assignee: "Alex Kim", dueDate: "2024-02-15", estimatedHours: 16 },
  { id: "2", projectId: "p1", title: "Implement user authentication", status: "in_progress", priority: "urgent", assignee: "Sarah Chen", dueDate: "2024-02-10", estimatedHours: 24 },
  { id: "3", projectId: "p1", title: "Write API documentation", status: "in_progress", priority: "medium", assignee: "Mike Ross", dueDate: "2024-02-20", estimatedHours: 8 },
  { id: "4", projectId: "p1", title: "Set up CI/CD pipeline", status: "todo", priority: "high", assignee: "Sarah Chen", dueDate: "2024-02-12", estimatedHours: 12 },
  { id: "5", projectId: "p1", title: "Create email templates", status: "in_review", priority: "low", assignee: "Jordan Lee", dueDate: "2024-02-18", estimatedHours: 6 },
  { id: "6", projectId: "p1", title: "Database optimization", status: "done", priority: "high", assignee: "Sarah Chen", dueDate: "2024-02-08", estimatedHours: 10 },
  { id: "7", projectId: "p1", title: "Mobile responsive fixes", status: "todo", priority: "medium", assignee: "Alex Kim", dueDate: "2024-02-22", estimatedHours: 14 },
  { id: "8", projectId: "p1", title: "Security audit", status: "in_progress", priority: "urgent", assignee: "Emily Davis", dueDate: "2024-02-09", estimatedHours: 20 },
];

export const mockCampaigns: Campaign[] = [
  { id: "1", name: "Summer Sale 2024", subject: "Don't miss our biggest sale!", status: "sent", recipientCount: 12500, openCount: 4200, clickCount: 890, sentAt: "2024-01-15" },
  { id: "2", name: "Product Launch", subject: "Introducing Widget Pro X", status: "sent", recipientCount: 8300, openCount: 3100, clickCount: 620, sentAt: "2024-01-10" },
  { id: "3", name: "Newsletter January", subject: "Your monthly update", status: "scheduled", recipientCount: 15000, openCount: 0, clickCount: 0, scheduledAt: "2024-02-01" },
  { id: "4", name: "Customer Feedback", subject: "We'd love your feedback", status: "draft", recipientCount: 0, openCount: 0, clickCount: 0 },
];

export const mockPOSProducts = [
  { id: "1", name: "Wireless Mouse", sku: "WM001", barcode: "123456789", price: 29.99, stock: 150, category: "Electronics" },
  { id: "2", name: "Mechanical Keyboard", sku: "MK001", barcode: "123456790", price: 89.99, stock: 75, category: "Electronics" },
  { id: "3", name: "USB-C Hub", sku: "UH001", barcode: "123456791", price: 49.99, stock: 200, category: "Electronics" },
  { id: "4", name: "Monitor Stand", sku: "MS001", barcode: "123456792", price: 34.99, stock: 120, category: "Accessories" },
  { id: "5", name: "Desk Lamp", sku: "DL001", barcode: "123456793", price: 24.99, stock: 90, category: "Office" },
  { id: "6", name: "Webcam HD", sku: "WC001", barcode: "123456794", price: 59.99, stock: 60, category: "Electronics" },
  { id: "7", name: "Headphones", sku: "HP001", barcode: "123456795", price: 79.99, stock: 45, category: "Electronics" },
  { id: "8", name: "Notebook Set", sku: "NS001", barcode: "123456796", price: 12.99, stock: 300, category: "Office" },
];

export const mockJournalEntries = [
  { id: "1", date: "2024-01-15", reference: "JE-001", description: "Monthly rent payment", total: 5000, status: "posted" as const, lines: [{ accountCode: "5000", accountName: "Rent Expense", debit: 5000, credit: 0 }, { accountCode: "1000", accountName: "Cash", debit: 0, credit: 5000 }] },
  { id: "2", date: "2024-01-14", reference: "JE-002", description: "Client payment received", total: 15000, status: "posted" as const, lines: [{ accountCode: "1000", accountName: "Cash", debit: 15000, credit: 0 }, { accountCode: "4000", accountName: "Revenue", debit: 0, credit: 15000 }] },
  { id: "3", date: "2024-01-13", reference: "JE-003", description: "Office supplies purchase", total: 850, status: "draft" as const, lines: [{ accountCode: "5100", accountName: "Office Supplies", debit: 850, credit: 0 }, { accountCode: "1000", accountName: "Cash", debit: 0, credit: 850 }] },
];

export const mockExpenses = [
  { id: "1", date: "2024-01-15", category: "Rent", description: "Office rent - January", amount: 5000, vendor: "Property Co", status: "approved" as const },
  { id: "2", date: "2024-01-14", category: "Utilities", description: "Electricity bill", amount: 320, vendor: "Power Corp", status: "approved" as const },
  { id: "3", date: "2024-01-13", category: "Supplies", description: "Office supplies", amount: 850, vendor: "Office Depot", status: "pending" as const },
  { id: "4", date: "2024-01-12", category: "Travel", description: "Client meeting travel", amount: 450, vendor: "Airlines", status: "pending" as const },
  { id: "5", date: "2024-01-11", category: "Software", description: "SaaS subscriptions", amount: 1200, vendor: "Various", status: "approved" as const },
];

export const mockInventoryProducts = [
  { id: "1", name: "Wireless Mouse", sku: "WM001", stock: 150, minStock: 50, category: "Electronics", supplier: "TechSupply Co", lastRestocked: "2024-01-10" },
  { id: "2", name: "Mechanical Keyboard", sku: "MK001", stock: 75, minStock: 30, category: "Electronics", supplier: "TechSupply Co", lastRestocked: "2024-01-08" },
  { id: "3", name: "USB-C Hub", sku: "UH001", stock: 200, minStock: 40, category: "Electronics", supplier: "GadgetWorld", lastRestocked: "2024-01-12" },
  { id: "4", name: "Monitor Stand", sku: "MS001", stock: 15, minStock: 25, category: "Accessories", supplier: "ErgoPlus", lastRestocked: "2023-12-20" },
  { id: "5", name: "Desk Lamp", sku: "DL001", stock: 90, minStock: 20, category: "Office", supplier: "LightCo", lastRestocked: "2024-01-05" },
  { id: "6", name: "Webcam HD", sku: "WC001", stock: 8, minStock: 15, category: "Electronics", supplier: "TechSupply Co", lastRestocked: "2023-12-15" },
];

export const mockSuppliers = [
  { id: "1", name: "TechSupply Co", email: "orders@techsupply.com", phone: "+1 555-9001", products: 12, status: "active" as const },
  { id: "2", name: "GadgetWorld", email: "sales@gadgetworld.com", phone: "+1 555-9002", products: 8, status: "active" as const },
  { id: "3", name: "ErgoPlus", email: "info@ergoplus.com", phone: "+1 555-9003", products: 5, status: "active" as const },
  { id: "4", name: "LightCo", email: "wholesale@lightco.com", products: 3, status: "inactive" as const },
];
