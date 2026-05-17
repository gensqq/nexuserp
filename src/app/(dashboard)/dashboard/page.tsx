"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DollarSign,
  Users,
  ShoppingCart,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Plus,
  FileText,
  Send,
  Package,
  MoreHorizontal,
  Clock,
  Zap,
  AlertTriangle,
  CheckCircle,
  Bell,
  RefreshCw,
} from "lucide-react";
import {
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { dashboardAPI } from "@/utils/api";
import { useToast } from "@/components/ui/toast";
import Link from "next/link";
import { Rocket, ArrowRight } from "lucide-react";

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

const COLORS = ["#3b82f6", "#8b5cf6", "#06b6d4", "#f59e0b", "#ef4444"];

const quickActions = [
  { label: "New Invoice", icon: FileText, color: "bg-blue-500", href: "/accounting" },
  { label: "Add Product", icon: Package, color: "bg-violet-500", href: "/inventory" },
  { label: "Send Email", icon: Send, color: "bg-cyan-500", href: "/mailing" },
  { label: "New Order", icon: ShoppingCart, color: "bg-amber-500", href: "/pos" },
];

export default function DashboardPage() {
  const { addToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState<any>(null);
  const [charts, setCharts] = useState<any>(null);
  const [currency, setCurrency] = useState(() => {
    if (typeof window !== "undefined") return localStorage.getItem("dashboardCurrency") || "USD";
    return "USD";
  });

  const currencyInfo = CURRENCIES.find((c) => c.code === currency) || CURRENCIES[0];
  const formatMoney = (amount: number) => {
    const converted = amount * currencyInfo.rate;
    return `${currencyInfo.symbol}${converted?.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
  };

  const handleCurrencyChange = (code: string) => {
    setCurrency(code);
    localStorage.setItem("dashboardCurrency", code);
    addToast({ title: "Currency Changed", message: `Dashboard now shows in ${code}`, type: "success" });
  };

  const fetchData = async () => {
    try {
      const [statsData, chartsData] = await Promise.all([
        dashboardAPI.getStats(),
        dashboardAPI.getCharts(),
      ]);
      setStats(statsData);
      setCharts(chartsData);
    } catch (error) {
      console.error("Dashboard fetch error:", error);
      addToast({ title: "Error", message: "Failed to load dashboard data", type: "error" });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchData();
    addToast({ title: "Refreshing", message: "Dashboard data updated", type: "info" });
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Dashboard</h1>
            <p className="text-muted-foreground">Welcome back! Here&apos;s what&apos;s happening with your business.</p>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse space-y-3">
                  <div className="h-4 bg-muted rounded w-1/2" />
                  <div className="h-8 bg-muted rounded w-3/4" />
                  <div className="h-3 bg-muted rounded w-1/3" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const revenueChange = stats?.revenue?.change || 0;
  const isPositiveRevenue = revenueChange >= 0;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back! Here&apos;s what&apos;s happening with your business.</p>
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
          <Button variant="outline" size="sm" onClick={handleRefresh} disabled={refreshing}>
            <RefreshCw className={`w-4 h-4 mr-1 ${refreshing ? "animate-spin" : ""}`} /> Refresh
          </Button>
          <Button size="sm" asChild>
            <Link href="/pos"><Plus className="w-4 h-4 mr-1" /> Quick Add</Link>
          </Button>
        </div>
      </div>

      {/* Getting Started Wizard - shown when no data */}
      {stats && !stats.revenue?.current && !stats.orders?.current && !stats.totalEmployees && (
        <Card className="border-2 border-dashed border-primary/30 bg-primary/5">
          <CardContent className="p-8">
            <div className="flex items-start gap-6">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center shrink-0">
                <Rocket className="w-7 h-7 text-white" />
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-bold mb-1">Welcome to ADN's Tech!</h2>
                <p className="text-muted-foreground mb-6">Get started by setting up your business. Follow these steps to make the most of your ERP.</p>
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {[
                    { step: 1, title: "Add Products", desc: "Set up your product catalog with prices and stock levels", href: "/inventory", color: "bg-violet-500" },
                    { step: 2, title: "Add Customers", desc: "Import or create your customer database", href: "/crm", color: "bg-blue-500" },
                    { step: 3, title: "Add Employees", desc: "Set up your team with roles and departments", href: "/hr", color: "bg-emerald-500" },
                    { step: 4, title: "Create Your First Order", desc: "Use the POS to process your first sale", href: "/pos", color: "bg-amber-500" },
                  ].map((item) => (
                    <Link key={item.step} href={item.href} className="group">
                      <div className="p-4 rounded-xl border border-border/50 bg-card hover:shadow-lg transition-all hover:border-primary/30">
                        <div className="flex items-center gap-3 mb-2">
                          <div className={`w-8 h-8 rounded-lg ${item.color} flex items-center justify-center text-white text-sm font-bold`}>{item.step}</div>
                          <h3 className="font-semibold text-sm">{item.title}</h3>
                        </div>
                        <p className="text-xs text-muted-foreground mb-3">{item.desc}</p>
                        <div className="flex items-center text-xs font-medium text-primary group-hover:gap-2 transition-all">
                          Get started <ArrowRight className="w-3 h-3 ml-1" />
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="hover:shadow-lg transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-emerald-500" />
              </div>
              <Badge variant={isPositiveRevenue ? "success" : "destructive"} className="text-xs">
                {isPositiveRevenue ? <ArrowUpRight className="w-3 h-3 mr-0.5" /> : <ArrowDownRight className="w-3 h-3 mr-0.5" />}
                {Math.abs(revenueChange).toFixed(1)}%
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">Total Revenue</p>
            <p className="text-2xl font-bold mt-1">{formatMoney(stats?.revenue?.current || 0)}</p>
            <p className="text-xs text-muted-foreground mt-1">vs last month</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <Users className="w-5 h-5 text-blue-500" />
              </div>
              <Badge variant="success" className="text-xs">
                <ArrowUpRight className="w-3 h-3 mr-0.5" /> Active
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">Active Users</p>
            <p className="text-2xl font-bold mt-1">{stats?.activeUsers || 0}</p>
            <p className="text-xs text-muted-foreground mt-1">Total employees: {stats?.totalEmployees || 0}</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 rounded-lg bg-violet-500/10 flex items-center justify-center">
                <ShoppingCart className="w-5 h-5 text-violet-500" />
              </div>
              <Badge variant="info" className="text-xs">
                {stats?.orders?.current || 0} this month
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">Orders</p>
            <p className="text-2xl font-bold mt-1">{stats?.orders?.current || 0}</p>
            <p className="text-xs text-muted-foreground mt-1">Pipeline: {formatMoney(stats?.pipelineValue || 0)}</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-amber-500" />
              </div>
              <Badge variant="success" className="text-xs">
                <ArrowUpRight className="w-3 h-3 mr-0.5" /> {stats?.pendingLeaves || 0} pending
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">Conversion Rate</p>
            <p className="text-2xl font-bold mt-1">{(stats?.conversionRate || 0).toFixed(1)}%</p>
            <p className="text-xs text-muted-foreground mt-1">Deal win rate</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Revenue Chart */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-base">Revenue Overview</CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/reports">View All</Link>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              {charts?.revenueChart && charts.revenueChart.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={charts.revenueChart}>
                    <defs>
                      <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="colorExpenses" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border/50" />
                    <XAxis dataKey="name" className="text-xs" tick={{ fill: "#94a3b8" }} />
                    <YAxis className="text-xs" tick={{ fill: "#94a3b8" }} />
                    <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: "8px", fontSize: "12px" }} />
                    <Legend />
                    <Area type="monotone" dataKey="revenue" stroke="#3b82f6" fill="url(#colorRevenue)" strokeWidth={2} />
                    <Area type="monotone" dataKey="expenses" stroke="#ef4444" fill="url(#colorExpenses)" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-muted-foreground">No data available</div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Sales by Category */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Sales by Category</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[200px]">
              {charts?.salesByCategory && charts.salesByCategory.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={charts.salesByCategory}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {charts.salesByCategory.map((_: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-muted-foreground">No data</div>
              )}
            </div>
            <div className="space-y-2 mt-4">
              {charts?.salesByCategory?.map((item: any, i: number) => (
                <div key={item.name} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i] }} />
                    <span>{item.name}</span>
                  </div>
                  <span className="font-medium">{item.value}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Row */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              {quickActions.map((action) => (
                <Button key={action.label} variant="outline" className="h-auto flex-col gap-2 p-4 hover:bg-accent" asChild>
                  <Link href={action.href}>
                    <div className={`w-10 h-10 rounded-lg ${action.color} flex items-center justify-center`}>
                      <action.icon className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-xs font-medium">{action.label}</span>
                  </Link>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* AI Insights */}
        <Card>
          <CardHeader className="flex flex-row items-center gap-2 pb-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <CardTitle className="text-base">AI Insights</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats?.lowStockProducts && stats.lowStockProducts.length > 0 && (
                <div className="flex items-start gap-3 p-3 rounded-lg bg-amber-500/10">
                  <AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm font-medium">Low Stock Alert</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{stats.lowStockProducts.length} products below minimum stock levels</p>
                  </div>
                </div>
              )}
              {stats?.revenue?.change > 0 && (
                <div className="flex items-start gap-3 p-3 rounded-lg bg-emerald-500/10">
                  <CheckCircle className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm font-medium">Revenue Growth</p>
                    <p className="text-xs text-muted-foreground mt-0.5">Revenue is up {stats.revenue.change.toFixed(1)}% compared to last month</p>
                  </div>
                </div>
              )}
              {stats?.pendingLeaves > 0 && (
                <div className="flex items-start gap-3 p-3 rounded-lg bg-blue-500/10">
                  <Bell className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm font-medium">Pending Leave Requests</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{stats.pendingLeaves} leave requests awaiting approval</p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recent Transactions */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-base">Recent Activity</CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/crm">View All</Link>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {(stats?.activities || []).slice(0, 5).map((activity: any) => (
                <div key={activity.id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-gradient-to-br from-blue-500 to-violet-600 text-white text-xs">
                      {activity.user?.name?.split(" ").map((n: string) => n[0]).join("") || "?"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm">
                      <span className="font-medium">{activity.user?.name}</span>{" "}
                      <span className="text-muted-foreground">{activity.action} a {activity.entity}</span>
                    </p>
                    <p className="text-xs text-muted-foreground">{new Date(activity.createdAt).toLocaleString()}</p>
                  </div>
                </div>
              ))}
              {(!stats?.activities || stats.activities.length === 0) && (
                <p className="text-sm text-muted-foreground text-center py-4">No recent activity</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
