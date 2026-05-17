"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Search, Plus, Users, Clock, Calendar, DollarSign, Download, Pencil, Trash2, RotateCcw } from "lucide-react";
import { hrAPI } from "@/utils/api";
import { useToast } from "@/components/ui/toast";

const CURRENCIES = [
  { code: "USD", symbol: "$", name: "US Dollar", rate: 1 },
  { code: "PHP", symbol: "₱", name: "Philippine Peso", rate: 56.50 },
  { code: "SGD", symbol: "S$", name: "Singapore Dollar", rate: 1.35 },
  { code: "HKD", symbol: "HK$", name: "Hong Kong Dollar", rate: 7.82 },
  { code: "EUR", symbol: "€", name: "Euro", rate: 0.92 },
  { code: "GBP", symbol: "£", name: "British Pound", rate: 0.79 },
  { code: "JPY", symbol: "¥", name: "Japanese Yen", rate: 155.0 },
  { code: "AUD", symbol: "A$", name: "Australian Dollar", rate: 1.53 },
  { code: "CAD", symbol: "C$", name: "Canadian Dollar", rate: 1.37 },
  { code: "INR", symbol: "₹", name: "Indian Rupee", rate: 83.50 },
  { code: "CNY", symbol: "¥", name: "Chinese Yuan", rate: 7.25 },
];

const statusColors: Record<string, string> = {
  ACTIVE: "success", ON_LEAVE: "warning", TERMINATED: "destructive",
  PENDING: "warning", APPROVED: "success", REJECTED: "destructive",
  PAID: "success", DRAFT: "secondary", PRESENT: "success", ABSENT: "destructive", LATE: "warning",
};

export default function HRPage() {
  const { addToast } = useToast();
  const [activeTab, setActiveTab] = useState<"employees" | "attendance" | "leave" | "payroll">("employees");
  const [searchQuery, setSearchQuery] = useState("");
  const [employees, setEmployees] = useState<any[]>([]);
  const [attendance, setAttendance] = useState<any[]>([]);
  const [leaveRequests, setLeaveRequests] = useState<any[]>([]);
  const [payroll, setPayroll] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [currency, setCurrency] = useState(() => {
    if (typeof window !== "undefined") return localStorage.getItem("payrollCurrency") || "USD";
    return "USD";
  });

  const currencyInfo = CURRENCIES.find((c) => c.code === currency) || CURRENCIES[0];
  const formatMoney = (amount: number) => {
    const converted = amount * currencyInfo.rate;
    return `${currencyInfo.symbol}${converted?.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
  };

  const handleCurrencyChange = (code: string) => {
    setCurrency(code);
    localStorage.setItem("payrollCurrency", code);
    addToast({ title: "Currency Changed", message: `Payroll now shows in ${code}`, type: "success" });
  };
  const [form, setForm] = useState({
    employeeId: "", firstName: "", lastName: "", email: "", phone: "",
    department: "", position: "", hireDate: "", salary: "",
  });

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const [empData, attData, leaveData, payData] = await Promise.all([
        hrAPI.getEmployees(1, searchQuery), hrAPI.getAttendance(),
        hrAPI.getLeaveRequests(), hrAPI.getPayroll(),
      ]);
      setEmployees(empData.employees || []);
      setAttendance(attData.attendance || []);
      setLeaveRequests(leaveData.leaveRequests || []);
      setPayroll(payData.payroll || []);
    } catch (error) {
      console.error("HR fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredEmployees = employees.filter((e) => {
    const q = searchQuery.toLowerCase();
    return e.firstName?.toLowerCase().includes(q) || e.lastName?.toLowerCase().includes(q) ||
      e.department?.toLowerCase().includes(q) || e.email?.toLowerCase().includes(q);
  });

  const resetForm = () => {
    setForm({ employeeId: "", firstName: "", lastName: "", email: "", phone: "", department: "", position: "", hireDate: "", salary: "" });
    setEditingId(null);
    setShowForm(false);
  };

  const handleEdit = (emp: any) => {
    setForm({
      employeeId: emp.employeeId, firstName: emp.firstName, lastName: emp.lastName,
      email: emp.email, phone: emp.phone || "", department: emp.department,
      position: emp.position, hireDate: emp.hireDate?.split("T")[0] || "", salary: String(emp.salary),
    });
    setEditingId(emp.id);
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.firstName || !form.email || !form.department) {
      addToast({ title: "Validation Error", message: "First name, email, and department are required", type: "warning" });
      return;
    }
    try {
      const payload = {
        ...form,
        salary: parseFloat(form.salary) || 0,
        // Remove employeeId from payload - backend auto-generates unique IDs
        ...(editingId ? {} : { employeeId: undefined }),
      };

      if (editingId) {
        await hrAPI.updateEmployee({ id: editingId, ...payload });
        addToast({ title: "Employee Updated", message: `${form.firstName} ${form.lastName}`, type: "success" });
      } else {
        await hrAPI.createEmployee(payload);
        addToast({ title: "Employee Added", message: `${form.firstName} ${form.lastName}`, type: "success" });
      }
      resetForm();
      fetchData();
    } catch (error: any) {
      addToast({ title: "Error", message: error.message, type: "error" });
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete employee "${name}"? This cannot be undone.`)) return;
    try {
      await hrAPI.deleteEmployee(id);
      addToast({ title: "Deleted", message: `${name} removed`, type: "success" });
      fetchData();
    } catch (error: any) {
      addToast({ title: "Error", message: error.message, type: "error" });
    }
  };

  const handleLeaveAction = async (id: string, status: string) => {
    try {
      await hrAPI.updateLeaveRequest({ id, status });
      addToast({ title: status === "APPROVED" ? "Approved" : "Rejected", message: "Leave request updated", type: "success" });
      fetchData();
    } catch (error: any) {
      addToast({ title: "Error", message: error.message, type: "error" });
    }
  };

  const handleGeneratePayroll = async () => {
    try {
      const period = new Date().toISOString().slice(0, 7);
      await hrAPI.generatePayroll(period);
      addToast({ title: "Payroll Generated", message: `Period: ${period}`, type: "success" });
      fetchData();
    } catch (error: any) {
      addToast({ title: "Error", message: error.message, type: "error" });
    }
  };

  const handleDeletePayroll = async (id: string) => {
    if (!confirm("Delete this payroll record?")) return;
    try {
      await hrAPI.deletePayroll(id);
      addToast({ title: "Deleted", message: "Payroll record removed", type: "success" });
      fetchData();
    } catch (error: any) {
      addToast({ title: "Error", message: error.message, type: "error" });
    }
  };

  const handleResetPayroll = async () => {
    if (!confirm("Delete ALL payroll records? This cannot be undone.")) return;
    try {
      for (const p of payroll) {
        await hrAPI.deletePayroll(p.id);
      }
      addToast({ title: "Reset Complete", message: "All payroll records deleted", type: "success" });
      fetchData();
    } catch (error: any) {
      addToast({ title: "Error", message: error.message, type: "error" });
    }
  };

  const SkeletonRow = () => (
    <tr className="border-b border-border/50">
      {[1, 2, 3, 4, 5, 6].map((i) => <td key={i} className="p-4"><div className="h-4 bg-muted rounded animate-pulse w-3/4" /></td>)}
    </tr>
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">HR & Payroll</h1>
          <p className="text-muted-foreground">Manage employees, attendance, and payroll</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => { addToast({ title: "Export", message: "Data exported", type: "success" }); }}>
            <Download className="w-4 h-4 mr-1" /> Export
          </Button>
          <Button size="sm" onClick={() => { resetForm(); setShowForm(true); }}>
            <Plus className="w-4 h-4 mr-1" /> Add Employee
          </Button>
        </div>
      </div>

      {/* Add/Edit Employee Form */}
      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{editingId ? "Edit Employee" : "Add Employee"}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Employee ID</label>
                <Input placeholder="Auto-generated" value={form.employeeId} onChange={(e) => setForm({ ...form, employeeId: e.target.value })} disabled={!!editingId} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">First Name *</label>
                <Input placeholder="John" value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Last Name *</label>
                <Input placeholder="Doe" value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Email *</label>
                <Input type="email" placeholder="john@company.com" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Phone</label>
                <Input placeholder="+1 555-0100" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Department *</label>
                <Input placeholder="Engineering" value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Position</label>
                <Input placeholder="Software Engineer" value={form.position} onChange={(e) => setForm({ ...form, position: e.target.value })} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Hire Date</label>
                <Input type="date" value={form.hireDate} onChange={(e) => setForm({ ...form, hireDate: e.target.value })} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Annual Salary</label>
                <Input type="number" placeholder="75000" value={form.salary} onChange={(e) => setForm({ ...form, salary: e.target.value })} />
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <Button onClick={handleSave}>{editingId ? "Update Employee" : "Save Employee"}</Button>
              <Button variant="outline" onClick={resetForm}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card><CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div><p className="text-sm text-muted-foreground">Total Employees</p><p className="text-2xl font-bold">{employees.length}</p></div>
            <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center"><Users className="w-5 h-5 text-blue-500" /></div>
          </div>
        </CardContent></Card>
        <Card><CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div><p className="text-sm text-muted-foreground">Present Today</p><p className="text-2xl font-bold">{attendance.filter((a) => a.status === "PRESENT").length}</p></div>
            <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center"><Clock className="w-5 h-5 text-emerald-500" /></div>
          </div>
        </CardContent></Card>
        <Card><CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div><p className="text-sm text-muted-foreground">Pending Leaves</p><p className="text-2xl font-bold">{leaveRequests.filter((l) => l.status === "PENDING").length}</p></div>
            <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center"><Calendar className="w-5 h-5 text-amber-500" /></div>
          </div>
        </CardContent></Card>
        <Card><CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div><p className="text-sm text-muted-foreground">Monthly Payroll</p><p className="text-2xl font-bold">{formatMoney(payroll.reduce((s, p) => s + (p.netPay || 0), 0))}</p></div>
            <div className="w-10 h-10 rounded-lg bg-violet-500/10 flex items-center justify-center"><DollarSign className="w-5 h-5 text-violet-500" /></div>
          </div>
        </CardContent></Card>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-border/50 pb-2">
        {(["employees", "attendance", "leave", "payroll"] as const).map((tab) => (
          <Button key={tab} variant={activeTab === tab ? "default" : "ghost"} size="sm" onClick={() => setActiveTab(tab)}>
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </Button>
        ))}
      </div>

      {/* Employees Tab */}
      {activeTab === "employees" && (
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Search employees..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9" />
          </div>
          <Card><CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead><tr className="border-b border-border/50">
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Employee</th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Department</th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Position</th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Status</th>
                  <th className="text-right p-4 text-sm font-medium text-muted-foreground">Salary</th>
                  <th className="text-right p-4 text-sm font-medium text-muted-foreground">Actions</th>
                </tr></thead>
                <tbody>
                  {loading ? [1, 2, 3].map((i) => <SkeletonRow key={i} />) : filteredEmployees.length === 0 ? (
                    <tr><td colSpan={6} className="p-8 text-center text-muted-foreground">No employees found</td></tr>
                  ) : filteredEmployees.map((emp) => (
                    <tr key={emp.id} className="border-b border-border/50 last:border-0 hover:bg-muted/50">
                      <td className="p-4"><div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8"><AvatarFallback className="bg-primary/10 text-primary text-xs">{emp.firstName?.[0]}{emp.lastName?.[0]}</AvatarFallback></Avatar>
                        <div><p className="text-sm font-medium">{emp.firstName} {emp.lastName}</p><p className="text-xs text-muted-foreground">{emp.email}</p></div>
                      </div></td>
                      <td className="p-4 text-sm">{emp.department}</td>
                      <td className="p-4 text-sm">{emp.position}</td>
                      <td className="p-4"><Badge variant={statusColors[emp.status] as any}>{emp.status}</Badge></td>
                      <td className="p-4 text-sm font-medium text-right">{formatMoney(emp.salary)}</td>
                      <td className="p-4 text-right">
                        <div className="flex justify-end gap-1">
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEdit(emp)}>
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:text-red-700" onClick={() => handleDelete(emp.id, `${emp.firstName} ${emp.lastName}`)}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent></Card>
        </div>
      )}

      {/* Attendance Tab */}
      {activeTab === "attendance" && (
        <Card><CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead><tr className="border-b border-border/50">
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Employee</th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Date</th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Check In</th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Check Out</th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Status</th>
              </tr></thead>
              <tbody>
                {loading ? [1, 2].map((i) => <SkeletonRow key={i} />) : attendance.length === 0 ? (
                  <tr><td colSpan={5} className="p-8 text-center text-muted-foreground">No attendance records</td></tr>
                ) : attendance.map((a) => (
                  <tr key={a.id} className="border-b border-border/50 last:border-0 hover:bg-muted/50">
                    <td className="p-4 text-sm font-medium">{a.employee?.firstName} {a.employee?.lastName}</td>
                    <td className="p-4 text-sm">{new Date(a.date).toLocaleDateString()}</td>
                    <td className="p-4 text-sm">{a.checkIn ? new Date(a.checkIn).toLocaleTimeString() : "-"}</td>
                    <td className="p-4 text-sm">{a.checkOut ? new Date(a.checkOut).toLocaleTimeString() : "-"}</td>
                    <td className="p-4"><Badge variant={statusColors[a.status] as any}>{a.status}</Badge></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent></Card>
      )}

      {/* Leave Tab */}
      {activeTab === "leave" && (
        <Card><CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead><tr className="border-b border-border/50">
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Employee</th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Type</th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Dates</th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Reason</th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Status</th>
                <th className="text-right p-4 text-sm font-medium text-muted-foreground">Actions</th>
              </tr></thead>
              <tbody>
                {loading ? [1, 2].map((i) => <SkeletonRow key={i} />) : leaveRequests.length === 0 ? (
                  <tr><td colSpan={6} className="p-8 text-center text-muted-foreground">No leave requests</td></tr>
                ) : leaveRequests.map((req) => (
                  <tr key={req.id} className="border-b border-border/50 last:border-0 hover:bg-muted/50">
                    <td className="p-4 text-sm font-medium">{req.employee?.firstName} {req.employee?.lastName}</td>
                    <td className="p-4"><Badge variant="secondary">{req.type}</Badge></td>
                    <td className="p-4 text-sm">{new Date(req.startDate).toLocaleDateString()} - {new Date(req.endDate).toLocaleDateString()}</td>
                    <td className="p-4 text-sm text-muted-foreground">{req.reason || "-"}</td>
                    <td className="p-4"><Badge variant={statusColors[req.status] as any}>{req.status}</Badge></td>
                    <td className="p-4 text-right">
                      {req.status === "PENDING" ? (
                        <div className="flex justify-end gap-2">
                          <Button size="sm" variant="outline" onClick={() => handleLeaveAction(req.id, "REJECTED")}>Reject</Button>
                          <Button size="sm" onClick={() => handleLeaveAction(req.id, "APPROVED")}>Approve</Button>
                        </div>
                      ) : (
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500" onClick={async () => {
                          if (confirm("Delete this leave request?")) {
                            await hrAPI.deleteLeaveRequest(req.id);
                            addToast({ title: "Deleted", type: "success" });
                            fetchData();
                          }
                        }}><Trash2 className="w-4 h-4" /></Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent></Card>
      )}

      {/* Payroll Tab */}
      {activeTab === "payroll" && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <h3 className="text-sm font-medium text-muted-foreground">Payroll Records ({payroll.length})</h3>
            <div className="flex flex-wrap gap-2 items-center">
              <div className="flex items-center gap-2">
                <label className="text-sm text-muted-foreground">Currency:</label>
                <select
                  className="text-sm px-3 py-1.5 rounded-md border border-input bg-background"
                  value={currency}
                  onChange={(e) => handleCurrencyChange(e.target.value)}
                >
                  {CURRENCIES.map((c) => (
                    <option key={c.code} value={c.code}>{c.code} ({c.symbol})</option>
                  ))}
                </select>
              </div>
              {payroll.length > 0 && (
                <Button variant="outline" size="sm" onClick={handleResetPayroll}>
                  <RotateCcw className="w-4 h-4 mr-1" /> Reset All
                </Button>
              )}
              <Button size="sm" onClick={handleGeneratePayroll}>
                <DollarSign className="w-4 h-4 mr-1" /> Generate Payroll
              </Button>
            </div>
          </div>
          <Card><CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead><tr className="border-b border-border/50">
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Employee</th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Period</th>
                  <th className="text-right p-4 text-sm font-medium text-muted-foreground">Gross Pay</th>
                  <th className="text-right p-4 text-sm font-medium text-muted-foreground">Deductions</th>
                  <th className="text-right p-4 text-sm font-medium text-muted-foreground">Net Pay</th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Status</th>
                  <th className="text-right p-4 text-sm font-medium text-muted-foreground">Actions</th>
                </tr></thead>
                <tbody>
                  {loading ? [1, 2].map((i) => <SkeletonRow key={i} />) : payroll.length === 0 ? (
                    <tr><td colSpan={7} className="p-8 text-center text-muted-foreground">No payroll records. Click "Generate Payroll" to create.</td></tr>
                  ) : payroll.map((p) => (
                    <tr key={p.id} className="border-b border-border/50 last:border-0 hover:bg-muted/50">
                      <td className="p-4 text-sm font-medium">{p.employee?.firstName} {p.employee?.lastName}</td>
                      <td className="p-4 text-sm">{p.period}</td>
                      <td className="p-4 text-sm text-right">{formatMoney(p.grossPay)}</td>
                      <td className="p-4 text-sm text-right text-red-500">-{formatMoney(p.deductions)}</td>
                      <td className="p-4 text-sm font-medium text-right">{formatMoney(p.netPay)}</td>
                      <td className="p-4">
                        <select
                          className="text-xs px-2 py-1 rounded border bg-background"
                          value={p.status}
                          onChange={async (e) => {
                            try {
                              await hrAPI.updatePayroll({ id: p.id, status: e.target.value });
                              addToast({ title: "Updated", message: `Status: ${e.target.value}`, type: "success" });
                              fetchData();
                            } catch (err: any) {
                              addToast({ title: "Error", message: err.message, type: "error" });
                            }
                          }}
                        >
                          <option value="DRAFT">Draft</option>
                          <option value="APPROVED">Approved</option>
                          <option value="PAID">Paid</option>
                        </select>
                      </td>
                      <td className="p-4 text-right">
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500" onClick={() => handleDeletePayroll(p.id)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent></Card>
        </div>
      )}
    </div>
  );
}
