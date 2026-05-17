const API_BASE = "/api";

async function fetchAPI(endpoint: string, options: RequestInit = {}) {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...((options.headers as Record<string, string>) || {}),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    if (response.status === 401 && typeof window !== "undefined") {
      localStorage.removeItem("token");
      window.location.href = "/login";
      throw new Error("Session expired");
    }
    const error = await response.json().catch(() => ({ error: "Request failed" }));
    throw new Error(error.error || `HTTP ${response.status}`);
  }

  return response.json();
}

// Auth
export const authAPI = {
  login: (email: string, password: string) =>
    fetchAPI("/auth/login", { method: "POST", body: JSON.stringify({ email, password }) }),
  register: (data: { name: string; email: string; password: string; company?: string }) =>
    fetchAPI("/auth/register", { method: "POST", body: JSON.stringify(data) }),
  me: () => fetchAPI("/auth/me"),
};

// Dashboard
export const dashboardAPI = {
  getStats: () => fetchAPI("/dashboard/stats"),
  getCharts: () => fetchAPI("/dashboard/charts"),
};

// POS
export const posAPI = {
  getProducts: (search?: string, category?: string) =>
    fetchAPI(`/pos/products?search=${search || ""}&category=${category || ""}`),
  getOrders: (page = 1, limit = 20) =>
    fetchAPI(`/pos/orders?page=${page}&limit=${limit}`),
  createOrder: (data: any) =>
    fetchAPI("/pos/orders", { method: "POST", body: JSON.stringify(data) }),
};

// CRM
export const crmAPI = {
  getCustomers: (page = 1, search?: string, status?: string) =>
    fetchAPI(`/crm/customers?page=${page}&search=${search || ""}&status=${status || ""}`),
  createCustomer: (data: any) =>
    fetchAPI("/crm/customers", { method: "POST", body: JSON.stringify(data) }),
  updateCustomer: (data: any) =>
    fetchAPI("/crm/customers", { method: "PUT", body: JSON.stringify(data) }),
  deleteCustomer: (id: string) =>
    fetchAPI(`/crm/customers?id=${id}`, { method: "DELETE" }),
  getDeals: () => fetchAPI("/crm/deals"),
  createDeal: (data: any) =>
    fetchAPI("/crm/deals", { method: "POST", body: JSON.stringify(data) }),
  updateDeal: (data: any) =>
    fetchAPI("/crm/deals", { method: "PUT", body: JSON.stringify(data) }),
  deleteDeal: (id: string) =>
    fetchAPI(`/crm/deals?id=${id}`, { method: "DELETE" }),
};

// Accounting
export const accountingAPI = {
  getJournalEntries: (page = 1) =>
    fetchAPI(`/accounting/journal?page=${page}`),
  createJournalEntry: (data: any) =>
    fetchAPI("/accounting/journal", { method: "POST", body: JSON.stringify(data) }),
  getExpenses: (page = 1, status?: string) =>
    fetchAPI(`/accounting/expenses?page=${page}&status=${status || ""}`),
  createExpense: (data: any) =>
    fetchAPI("/accounting/expenses", { method: "POST", body: JSON.stringify(data) }),
  updateExpense: (data: any) =>
    fetchAPI("/accounting/expenses", { method: "PUT", body: JSON.stringify(data) }),
  deleteExpense: (id: string) =>
    fetchAPI(`/accounting/expenses?id=${id}`, { method: "DELETE" }),
};

// HR
export const hrAPI = {
  getEmployees: (page = 1, search?: string) =>
    fetchAPI(`/hr/employees?page=${page}&search=${search || ""}`),
  createEmployee: (data: any) =>
    fetchAPI("/hr/employees", { method: "POST", body: JSON.stringify(data) }),
  updateEmployee: (data: any) =>
    fetchAPI("/hr/employees", { method: "PUT", body: JSON.stringify(data) }),
  deleteEmployee: (id: string) =>
    fetchAPI(`/hr/employees?id=${id}`, { method: "DELETE" }),
  getAttendance: (date?: string) =>
    fetchAPI(`/hr/attendance?date=${date || ""}`),
  markAttendance: (data: any) =>
    fetchAPI("/hr/attendance", { method: "POST", body: JSON.stringify(data) }),
  getLeaveRequests: () => fetchAPI("/hr/leave"),
  createLeaveRequest: (data: any) =>
    fetchAPI("/hr/leave", { method: "POST", body: JSON.stringify(data) }),
  updateLeaveRequest: (data: any) =>
    fetchAPI("/hr/leave", { method: "PUT", body: JSON.stringify(data) }),
  deleteLeaveRequest: (id: string) =>
    fetchAPI(`/hr/leave?id=${id}`, { method: "DELETE" }),
  getPayroll: () => fetchAPI("/hr/payroll"),
  generatePayroll: (period: string) =>
    fetchAPI("/hr/payroll", { method: "POST", body: JSON.stringify({ period }) }),
  updatePayroll: (data: any) =>
    fetchAPI("/hr/payroll", { method: "PUT", body: JSON.stringify(data) }),
  deletePayroll: (id: string) =>
    fetchAPI(`/hr/payroll?id=${id}`, { method: "DELETE" }),
};

// Projects
export const projectsAPI = {
  getProjects: () => fetchAPI("/projects/projects"),
  createProject: (data: any) =>
    fetchAPI("/projects/projects", { method: "POST", body: JSON.stringify(data) }),
  deleteProject: (id: string) =>
    fetchAPI(`/projects/projects?id=${id}`, { method: "DELETE" }),
  getTasks: (projectId?: string, status?: string) =>
    fetchAPI(`/projects/tasks?projectId=${projectId || ""}&status=${status || ""}`),
  createTask: (data: any) =>
    fetchAPI("/projects/tasks", { method: "POST", body: JSON.stringify(data) }),
  updateTask: (data: any) =>
    fetchAPI("/projects/tasks", { method: "PUT", body: JSON.stringify(data) }),
  deleteTask: (id: string) =>
    fetchAPI(`/projects/tasks?id=${id}`, { method: "DELETE" }),
  getTimeEntries: (taskId?: string, userId?: string) =>
    fetchAPI(`/projects/time-entries?taskId=${taskId || ""}&userId=${userId || ""}`),
  createTimeEntry: (data: any) =>
    fetchAPI("/projects/time-entries", { method: "POST", body: JSON.stringify(data) }),
  deleteTimeEntry: (id: string) =>
    fetchAPI(`/projects/time-entries?id=${id}`, { method: "DELETE" }),
};

// Mailing
export const mailingAPI = {
  getCampaigns: () => fetchAPI("/mailing/campaigns"),
  createCampaign: (data: any) =>
    fetchAPI("/mailing/campaigns", { method: "POST", body: JSON.stringify(data) }),
  deleteCampaign: (id: string) =>
    fetchAPI(`/mailing/campaigns?id=${id}`, { method: "DELETE" }),
  getTemplates: () => fetchAPI("/mailing/templates"),
  createTemplate: (data: any) =>
    fetchAPI("/mailing/templates", { method: "POST", body: JSON.stringify(data) }),
  deleteTemplate: (id: string) =>
    fetchAPI(`/mailing/templates?id=${id}`, { method: "DELETE" }),
};

// Inventory
export const inventoryAPI = {
  getProducts: (search?: string) =>
    fetchAPI(`/inventory/products?search=${search || ""}`),
  createProduct: (data: any) =>
    fetchAPI("/inventory/products", { method: "POST", body: JSON.stringify(data) }),
  updateProduct: (data: any) =>
    fetchAPI("/inventory/products", { method: "PUT", body: JSON.stringify(data) }),
  deleteProduct: (id: string) =>
    fetchAPI(`/inventory/products?id=${id}`, { method: "DELETE" }),
  getSuppliers: () => fetchAPI("/inventory/suppliers"),
  createSupplier: (data: any) =>
    fetchAPI("/inventory/suppliers", { method: "POST", body: JSON.stringify(data) }),
  deleteSupplier: (id: string) =>
    fetchAPI(`/inventory/suppliers?id=${id}`, { method: "DELETE" }),
  getStockMovements: (productId?: string) =>
    fetchAPI(`/inventory/stock?productId=${productId || ""}`),
  addStock: (data: any) =>
    fetchAPI("/inventory/stock", { method: "POST", body: JSON.stringify(data) }),
  getPurchaseOrders: (status?: string) =>
    fetchAPI(`/inventory/purchase-orders?status=${status || ""}`),
  createPurchaseOrder: (data: any) =>
    fetchAPI("/inventory/purchase-orders", { method: "POST", body: JSON.stringify(data) }),
  updatePurchaseOrder: (data: any) =>
    fetchAPI("/inventory/purchase-orders", { method: "PUT", body: JSON.stringify(data) }),
  deletePurchaseOrder: (id: string) =>
    fetchAPI(`/inventory/purchase-orders?id=${id}`, { method: "DELETE" }),
};

// Reports
export const reportsAPI = {
  getFinancial: (period?: string) =>
    fetchAPI(`/reports/financial?period=${period || "month"}`),
};

// Settings
export const settingsAPI = {
  getCompany: () => fetchAPI("/settings/company"),
  updateCompany: (data: any) =>
    fetchAPI("/settings/company", { method: "PUT", body: JSON.stringify(data) }),
  getProfile: () => fetchAPI("/settings/profile"),
  updateProfile: (data: any) =>
    fetchAPI("/settings/profile", { method: "PUT", body: JSON.stringify(data) }),
  getAI: () => fetchAPI("/settings/ai"),
  saveAI: (data: { openaiKey?: string; anthropicKey?: string }) =>
    fetchAPI("/settings/ai", { method: "POST", body: JSON.stringify(data) }),
  uploadAvatar: (avatar: string) =>
    fetchAPI("/settings/avatar", { method: "POST", body: JSON.stringify({ avatar }) }),
  deleteAvatar: () =>
    fetchAPI("/settings/avatar", { method: "DELETE" }),
  googleAuth: () => fetchAPI("/settings/google/auth"),
  googleStatus: () => fetchAPI("/settings/google/status"),
  googleDisconnect: () => fetchAPI("/settings/google/disconnect", { method: "POST" }),
  googleSync: (data: { action: string; module: string; spreadsheetId?: string }) =>
    fetchAPI("/settings/google/sync", { method: "POST", body: JSON.stringify(data) }),
};

export const billingAPI = {
  getStatus: () => fetchAPI("/billing/status"),
  checkout: (plan: string) =>
    fetchAPI("/billing/checkout", { method: "POST", body: JSON.stringify({ plan }) }),
  portal: () =>
    fetchAPI("/billing/portal", { method: "POST" }),
};

// Search
export const searchAPI = {
  search: (query: string) => fetchAPI(`/search?q=${encodeURIComponent(query)}`),
};

// Notifications
export const notificationsAPI = {
  getNotifications: () => fetchAPI("/notifications"),
};
