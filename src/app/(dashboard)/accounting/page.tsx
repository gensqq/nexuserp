"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  DollarSign,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
  FileText,
  Download,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { accountingAPI } from "@/utils/api";
import { useToast } from "@/components/ui/toast";

const COLORS = ["#3b82f6", "#8b5cf6", "#06b6d4", "#f59e0b", "#ef4444"];

const statusColors: Record<string, string> = {
  POSTED: "success",
  DRAFT: "warning",
  VOIDED: "destructive",
  APPROVED: "success",
  PENDING: "warning",
  REJECTED: "destructive",
};

export default function AccountingPage() {
  const { addToast } = useToast();
  const [activeTab, setActiveTab] = useState<"overview" | "journal" | "expenses">("overview");
  const [journalEntries, setJournalEntries] = useState<any[]>([]);
  const [expenses, setExpenses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showExpenseForm, setShowExpenseForm] = useState(false);
  const [newExpense, setNewExpense] = useState({ category: "", description: "", amount: "", vendor: "", date: new Date().toISOString().split("T")[0] });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [journalData, expensesData] = await Promise.all([
        accountingAPI.getJournalEntries(),
        accountingAPI.getExpenses(),
      ]);
      setJournalEntries(journalData.entries || []);
      setExpenses(expensesData.expenses || []);
    } catch (error) {
      console.error("Accounting fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddExpense = async () => {
    if (!newExpense.category || !newExpense.description || !newExpense.amount) {
      addToast({ title: "Validation Error", message: "Fill in all required fields", type: "warning" });
      return;
    }
    try {
      await accountingAPI.createExpense({
        ...newExpense,
        amount: parseFloat(newExpense.amount),
      });
      addToast({ title: "Expense Added", message: "Expense recorded successfully", type: "success" });
      setNewExpense({ category: "", description: "", amount: "", vendor: "", date: new Date().toISOString().split("T")[0] });
      setShowExpenseForm(false);
      fetchData();
    } catch (error: any) {
      addToast({ title: "Error", message: error.message, type: "error" });
    }
  };

  const handleApproveExpense = async (id: string) => {
    try {
      await accountingAPI.updateExpense({ id, status: "APPROVED" });
      addToast({ title: "Approved", message: "Expense approved", type: "success" });
      fetchData();
    } catch (error: any) {
      addToast({ title: "Error", message: error.message, type: "error" });
    }
  };

  const totalIncome = expenses.filter((e) => e.status === "APPROVED").reduce((sum, e) => sum + e.amount, 0);
  const totalExpenses = expenses.filter((e) => e.status === "APPROVED").reduce((sum, e) => sum + e.amount, 0);

  // Expense by category
  const expenseByCategory: Record<string, number> = {};
  expenses.forEach((e) => {
    expenseByCategory[e.category] = (expenseByCategory[e.category] || 0) + e.amount;
  });
  const categoryData = Object.entries(expenseByCategory).map(([name, value]) => ({ name, value }));

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Accounting</h1>
          <p className="text-muted-foreground">Manage your financial records and reports</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => addToast({ title: "Export", message: "Report exported", type: "success" })}>
            <Download className="w-4 h-4 mr-1" /> Export
          </Button>
          <Button size="sm" onClick={() => setShowExpenseForm(true)}>
            <Plus className="w-4 h-4 mr-1" /> New Expense
          </Button>
        </div>
      </div>

      {/* Add Expense Form */}
      {showExpenseForm && (
        <Card>
          <CardHeader><CardTitle className="text-base">Add Expense</CardTitle></CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Category *</label>
                <Input placeholder="Rent, Utilities, etc." value={newExpense.category} onChange={(e) => setNewExpense({ ...newExpense, category: e.target.value })} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Description *</label>
                <Input placeholder="Expense description" value={newExpense.description} onChange={(e) => setNewExpense({ ...newExpense, description: e.target.value })} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Amount *</label>
                <Input type="number" placeholder="0.00" value={newExpense.amount} onChange={(e) => setNewExpense({ ...newExpense, amount: e.target.value })} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Vendor</label>
                <Input placeholder="Vendor name" value={newExpense.vendor} onChange={(e) => setNewExpense({ ...newExpense, vendor: e.target.value })} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Date</label>
                <Input type="date" value={newExpense.date} onChange={(e) => setNewExpense({ ...newExpense, date: e.target.value })} />
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <Button onClick={handleAddExpense}>Save Expense</Button>
              <Button variant="outline" onClick={() => setShowExpenseForm(false)}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card><CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div><p className="text-sm text-muted-foreground">Total Expenses</p><p className="text-2xl font-bold">${totalExpenses.toLocaleString()}</p></div>
            <div className="w-10 h-10 rounded-lg bg-red-500/10 flex items-center justify-center"><TrendingDown className="w-5 h-5 text-red-500" /></div>
          </div>
        </CardContent></Card>
        <Card><CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div><p className="text-sm text-muted-foreground">Journal Entries</p><p className="text-2xl font-bold">{journalEntries.length}</p></div>
            <div className="w-10 h-10 rounded-lg bg-violet-500/10 flex items-center justify-center"><FileText className="w-5 h-5 text-violet-500" /></div>
          </div>
        </CardContent></Card>
        <Card><CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div><p className="text-sm text-muted-foreground">Pending Expenses</p><p className="text-2xl font-bold">{expenses.filter((e) => e.status === "PENDING").length}</p></div>
            <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center"><DollarSign className="w-5 h-5 text-amber-500" /></div>
          </div>
        </CardContent></Card>
        <Card><CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div><p className="text-sm text-muted-foreground">Categories</p><p className="text-2xl font-bold">{Object.keys(expenseByCategory).length}</p></div>
            <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center"><TrendingUp className="w-5 h-5 text-blue-500" /></div>
          </div>
        </CardContent></Card>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-border/50 pb-2">
        {(["overview", "journal", "expenses"] as const).map((tab) => (
          <Button key={tab} variant={activeTab === tab ? "default" : "ghost"} size="sm" onClick={() => setActiveTab(tab)}>
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </Button>
        ))}
      </div>

      {activeTab === "overview" && (
        <div className="grid lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-base">Expense Breakdown</CardTitle></CardHeader>
            <CardContent>
              <div className="h-[300px]">
                {categoryData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={categoryData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                        {categoryData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-muted-foreground">No data</div>
                )}
              </div>
              <div className="space-y-2 mt-4">
                {categoryData.map((item, i) => (
                  <div key={item.name} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i] }} />
                      <span>{item.name}</span>
                    </div>
                    <span className="font-medium">${item.value.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-base">Recent Expenses</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-3">
                {expenses.slice(0, 5).map((exp) => (
                  <div key={exp.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <div>
                      <p className="text-sm font-medium">{exp.description}</p>
                      <p className="text-xs text-muted-foreground">{exp.category} • {exp.vendor}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">${exp.amount.toLocaleString()}</p>
                      <Badge variant={statusColors[exp.status] as any} className="text-xs">{exp.status}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === "journal" && (
        <Card><CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border/50">
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Date</th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Reference</th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Description</th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Status</th>
                  <th className="text-right p-4 text-sm font-medium text-muted-foreground">Total</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={5} className="p-8 text-center text-muted-foreground">Loading...</td></tr>
                ) : journalEntries.length === 0 ? (
                  <tr><td colSpan={5} className="p-8 text-center text-muted-foreground">No journal entries</td></tr>
                ) : (
                  journalEntries.map((entry) => (
                    <tr key={entry.id} className="border-b border-border/50 last:border-0 hover:bg-muted/50">
                      <td className="p-4 text-sm">{new Date(entry.date).toLocaleDateString()}</td>
                      <td className="p-4 text-sm font-mono">{entry.reference}</td>
                      <td className="p-4 text-sm">{entry.description}</td>
                      <td className="p-4"><Badge variant={statusColors[entry.status] as any}>{entry.status}</Badge></td>
                      <td className="p-4 text-sm font-medium text-right">${entry.total.toLocaleString()}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent></Card>
      )}

      {activeTab === "expenses" && (
        <Card><CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border/50">
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Date</th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Category</th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Description</th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Vendor</th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Status</th>
                  <th className="text-right p-4 text-sm font-medium text-muted-foreground">Amount</th>
                  <th className="text-right p-4 text-sm font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={7} className="p-8 text-center text-muted-foreground">Loading...</td></tr>
                ) : expenses.length === 0 ? (
                  <tr><td colSpan={7} className="p-8 text-center text-muted-foreground">No expenses</td></tr>
                ) : (
                  expenses.map((exp) => (
                    <tr key={exp.id} className="border-b border-border/50 last:border-0 hover:bg-muted/50">
                      <td className="p-4 text-sm">{new Date(exp.date).toLocaleDateString()}</td>
                      <td className="p-4"><Badge variant="secondary">{exp.category}</Badge></td>
                      <td className="p-4 text-sm">{exp.description}</td>
                      <td className="p-4 text-sm text-muted-foreground">{exp.vendor || "-"}</td>
                      <td className="p-4"><Badge variant={statusColors[exp.status] as any}>{exp.status}</Badge></td>
                      <td className="p-4 text-sm font-medium text-right">${exp.amount.toLocaleString()}</td>
                      <td className="p-4 text-right">
                        {exp.status === "PENDING" && (
                          <Button size="sm" onClick={() => handleApproveExpense(exp.id)}>Approve</Button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent></Card>
      )}
    </div>
  );
}
