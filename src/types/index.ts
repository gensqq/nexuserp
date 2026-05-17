// ─── Dashboard ────────────────────────────────────────────────
export interface KPI {
  title: string;
  value: string;
  change: number;
  changeLabel: string;
  icon: string;
  color: string;
}

export interface ChartDataPoint {
  name: string;
  value: number;
  previous?: number;
}

export interface ActivityLog {
  id: string;
  user: string;
  action: string;
  entity: string;
  timestamp: string;
  avatar?: string;
}

// ─── POS ──────────────────────────────────────────────────────
export interface POSProduct {
  id: string;
  name: string;
  sku: string;
  barcode?: string;
  price: number;
  stock: number;
  category: string;
  image?: string;
}

export interface CartItem {
  product: POSProduct;
  quantity: number;
  total: number;
}

export interface POSOrder {
  id: string;
  orderNumber: string;
  items: CartItem[];
  subtotal: number;
  tax: number;
  total: number;
  paymentMethod: string;
  createdAt: string;
}

// ─── CRM ──────────────────────────────────────────────────────
export interface CRMLead {
  id: string;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  status: "new" | "contacted" | "qualified" | "proposal" | "negotiation" | "won" | "lost";
  source: string;
  value: number;
  createdAt: string;
}

export interface CRMDeal {
  id: string;
  title: string;
  customer: string;
  value: number;
  stage: string;
  probability: number;
  expectedClose: string;
}

export interface PipelineStage {
  id: string;
  name: string;
  deals: CRMDeal[];
  totalValue: number;
}

// ─── Accounting ───────────────────────────────────────────────
export interface JournalEntryType {
  id: string;
  date: string;
  reference: string;
  description: string;
  total: number;
  status: "draft" | "posted" | "voided";
  lines: JournalLineType[];
}

export interface JournalLineType {
  accountCode: string;
  accountName: string;
  debit: number;
  credit: number;
}

export interface ExpenseType {
  id: string;
  date: string;
  category: string;
  description: string;
  amount: number;
  vendor?: string;
  status: "pending" | "approved" | "rejected";
}

export interface FinancialSummary {
  totalRevenue: number;
  totalExpenses: number;
  netIncome: number;
  cashFlow: number;
}

// ─── HR ───────────────────────────────────────────────────────
export interface EmployeeType {
  id: string;
  employeeId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  department: string;
  position: string;
  hireDate: string;
  salary: number;
  status: "active" | "on_leave" | "terminated";
  avatar?: string;
}

export interface AttendanceRecord {
  id: string;
  employeeId: string;
  date: string;
  checkIn?: string;
  checkOut?: string;
  status: "present" | "absent" | "late" | "half_day" | "on_leave";
}

export interface LeaveRequestType {
  id: string;
  employeeName: string;
  type: "annual" | "sick" | "personal" | "maternity" | "paternity" | "unpaid";
  startDate: string;
  endDate: string;
  reason?: string;
  status: "pending" | "approved" | "rejected";
}

export interface PayrollRecord {
  id: string;
  employeeName: string;
  period: string;
  grossPay: number;
  deductions: number;
  netPay: number;
  status: "draft" | "approved" | "paid";
}

// ─── Projects ─────────────────────────────────────────────────
export interface ProjectType {
  id: string;
  name: string;
  description?: string;
  status: "planning" | "active" | "on_hold" | "completed";
  progress: number;
  startDate?: string;
  endDate?: string;
  teamSize: number;
  taskCount: number;
}

export interface TaskType {
  id: string;
  projectId: string;
  title: string;
  description?: string;
  status: "todo" | "in_progress" | "in_review" | "done";
  priority: "low" | "medium" | "high" | "urgent";
  assignee?: string;
  dueDate?: string;
  estimatedHours?: number;
}

export interface KanbanColumn {
  id: string;
  title: string;
  tasks: TaskType[];
}

// ─── Inventory ────────────────────────────────────────────────
export interface InventoryProduct {
  id: string;
  name: string;
  sku: string;
  stock: number;
  minStock: number;
  category: string;
  supplier?: string;
  lastRestocked?: string;
}

export interface SupplierType {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  products: number;
  status: "active" | "inactive";
}

export interface PurchaseOrderType {
  id: string;
  orderNumber: string;
  supplier: string;
  status: "draft" | "sent" | "received" | "cancelled";
  total: number;
  expectedDate?: string;
  createdAt: string;
}

// ─── Mailing ──────────────────────────────────────────────────
export interface Campaign {
  id: string;
  name: string;
  subject: string;
  status: "draft" | "scheduled" | "sending" | "sent";
  recipientCount: number;
  openCount: number;
  clickCount: number;
  scheduledAt?: string;
  sentAt?: string;
}

export interface EmailTemplateType {
  id: string;
  name: string;
  subject: string;
  body: string;
  variables: string[];
}

// ─── Reports ──────────────────────────────────────────────────
export interface ReportData {
  revenue: ChartDataPoint[];
  expenses: ChartDataPoint[];
  profit: ChartDataPoint[];
  cashFlow: ChartDataPoint[];
}

// ─── Navigation ───────────────────────────────────────────────
export interface NavItem {
  label: string;
  href: string;
  icon: string;
  badge?: number;
  children?: NavItem[];
}

export interface QuickAction {
  id: string;
  label: string;
  icon: string;
  href: string;
  color: string;
}
