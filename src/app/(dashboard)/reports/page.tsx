"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Download,
  TrendingUp,
  TrendingDown,
  DollarSign,
  BarChart3,
} from "lucide-react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
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
import { reportsAPI } from "@/utils/api";
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

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899"];

export default function ReportsPage() {
  const { addToast } = useToast();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState("year");
  const [currency, setCurrency] = useState(() => {
    if (typeof window !== "undefined") return localStorage.getItem("reportsCurrency") || "USD";
    return "USD";
  });

  const currencyInfo = CURRENCIES.find((c) => c.code === currency) || CURRENCIES[0];
  const formatMoney = (amount: number) => {
    const converted = amount * currencyInfo.rate;
    return `${currencyInfo.symbol}${converted?.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
  };

  const handleCurrencyChange = (code: string) => {
    setCurrency(code);
    localStorage.setItem("reportsCurrency", code);
    addToast({ title: "Currency Changed", message: `Reports now shows in ${code}`, type: "success" });
  };

  useEffect(() => {
    fetchReport();
  }, [period]);

  const fetchReport = async () => {
    try {
      setLoading(true);
      const result = await reportsAPI.getFinancial(period);
      setData(result);
    } catch (error) {
      console.error("Report fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading && !data) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center justify-between">
          <div><div className="h-8 w-48 bg-muted rounded animate-pulse" /><div className="h-4 w-64 bg-muted rounded animate-pulse mt-2" /></div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}><CardContent className="p-6"><div className="animate-pulse space-y-3"><div className="h-4 bg-muted rounded w-1/2" /><div className="h-8 bg-muted rounded w-3/4" /></div></CardContent></Card>
          ))}
        </div>
      </div>
    );
  }

  const expenseByCategoryData = data?.expenseByCategory
    ? Object.entries(data.expenseByCategory).map(([name, value]) => ({ name, value }))
    : [];

  const monthlyProfit = data?.monthlyData?.map((m: any) => ({
    ...m,
    profit: m.revenue - m.expenses,
  })) || [];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Financial Reports</h1>
          <p className="text-muted-foreground">Comprehensive financial analytics and reporting</p>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-sm text-muted-foreground">Currency:</label>
          <select
            className="h-9 rounded-md border border-input bg-background px-2 text-sm"
            value={currency}
            onChange={(e) => handleCurrencyChange(e.target.value)}
          >
            {CURRENCIES.map((c) => (
              <option key={c.code} value={c.code}>{c.symbol} {c.code}</option>
            ))}
          </select>
          {(["week", "month", "quarter", "year"] as const).map((p) => (
            <Button key={p} variant={period === p ? "default" : "outline"} size="sm" onClick={() => setPeriod(p)}>
              {p.charAt(0).toUpperCase() + p.slice(1)}
            </Button>
          ))}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card><CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div><p className="text-sm text-muted-foreground">Total Revenue</p><p className="text-2xl font-bold">{formatMoney(data?.totalRevenue || 0)}</p></div>
            <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center"><TrendingUp className="w-5 h-5 text-emerald-500" /></div>
          </div>
          <p className="text-xs text-muted-foreground mt-2">{data?.orderCount || 0} orders</p>
        </CardContent></Card>
        <Card><CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div><p className="text-sm text-muted-foreground">Total Expenses</p><p className="text-2xl font-bold">{formatMoney(data?.totalExpenses || 0)}</p></div>
            <div className="w-10 h-10 rounded-lg bg-red-500/10 flex items-center justify-center"><TrendingDown className="w-5 h-5 text-red-500" /></div>
          </div>
          <p className="text-xs text-muted-foreground mt-2">{expenseByCategoryData.length} categories</p>
        </CardContent></Card>
        <Card><CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div><p className="text-sm text-muted-foreground">Net Profit</p><p className={`text-2xl font-bold ${(data?.netIncome || 0) >= 0 ? "text-emerald-500" : "text-red-500"}`}>{formatMoney(data?.netIncome || 0)}</p></div>
            <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center"><DollarSign className="w-5 h-5 text-blue-500" /></div>
          </div>
        </CardContent></Card>
        <Card><CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div><p className="text-sm text-muted-foreground">Profit Margin</p><p className="text-2xl font-bold">{(data?.profitMargin || 0).toFixed(1)}%</p></div>
            <div className="w-10 h-10 rounded-lg bg-violet-500/10 flex items-center justify-center"><BarChart3 className="w-5 h-5 text-violet-500" /></div>
          </div>
        </CardContent></Card>
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-base">Revenue vs Expenses</CardTitle></CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyProfit}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border/50" />
                  <XAxis dataKey="month" tick={{ fill: "#94a3b8" }} />
                  <YAxis tick={{ fill: "#94a3b8" }} />
                  <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: "8px", fontSize: "12px" }} />
                  <Legend />
                  <Bar dataKey="revenue" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Revenue" />
                  <Bar dataKey="expenses" fill="#ef4444" radius={[4, 4, 0, 0]} name="Expenses" />
                  <Bar dataKey="profit" fill="#10b981" radius={[4, 4, 0, 0]} name="Profit" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-base">Expense Breakdown</CardTitle></CardHeader>
          <CardContent>
            {expenseByCategoryData.length === 0 ? (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">No expense data</div>
            ) : (
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={expenseByCategoryData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={4} dataKey="value" label={({ name, percent }: { name?: string; percent?: number }) => `${name || ""} ${((percent || 0) * 100).toFixed(0)}%`}>
                      {expenseByCategoryData.map((_, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(v: any) => formatMoney(Number(v))} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Monthly Trend */}
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-base">Monthly Trend</CardTitle></CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyProfit}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border/50" />
                <XAxis dataKey="month" tick={{ fill: "#94a3b8" }} />
                <YAxis tick={{ fill: "#94a3b8" }} />
                <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: "8px", fontSize: "12px" }} />
                <Legend />
                <Line type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={2} name="Revenue" />
                <Line type="monotone" dataKey="expenses" stroke="#ef4444" strokeWidth={2} name="Expenses" />
                <Line type="monotone" dataKey="profit" stroke="#10b981" strokeWidth={2} name="Profit" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
