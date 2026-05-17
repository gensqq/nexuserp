"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Search, Plus, Filter, Phone, Mail, MoreHorizontal, DollarSign,
  Users, TrendingUp, ArrowUpRight, UserPlus, Pencil, Trash2,
  Building2, MapPin, Tag, Calendar, MessageSquare, X, Save,
  ChevronDown, Eye, ExternalLink, Settings
} from "lucide-react";
import { crmAPI } from "@/utils/api";
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

const PIPELINE_STAGES = [
  { id: "NEW", name: "New", color: "bg-blue-500", textColor: "text-blue-500" },
  { id: "QUALIFIED", name: "Qualified", color: "bg-violet-500", textColor: "text-violet-500" },
  { id: "PROPOSAL", name: "Proposal", color: "bg-amber-500", textColor: "text-amber-500" },
  { id: "NEGOTIATION", name: "Negotiation", color: "bg-orange-500", textColor: "text-orange-500" },
  { id: "CLOSED_WON", name: "Won", color: "bg-emerald-500", textColor: "text-emerald-500" },
  { id: "CLOSED_LOST", name: "Lost", color: "bg-red-500", textColor: "text-red-500" },
];

const CUSTOMER_STATUSES = [
  { id: "LEAD", name: "Lead", color: "info" },
  { id: "PROSPECT", name: "Prospect", color: "warning" },
  { id: "ACTIVE", name: "Active", color: "success" },
  { id: "INACTIVE", name: "Inactive", color: "secondary" },
];

const statusColors: Record<string, string> = {
  LEAD: "info", PROSPECT: "warning", ACTIVE: "success", INACTIVE: "destructive",
  NEW: "info", QUALIFIED: "warning", PROPOSAL: "warning", NEGOTIATION: "warning",
  CLOSED_WON: "success", CLOSED_LOST: "destructive",
};

export default function CRMPage() {
  const { addToast } = useToast();
  const [activeTab, setActiveTab] = useState<"contacts" | "pipeline" | "activities">("contacts");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [customers, setCustomers] = useState<any[]>([]);
  const [deals, setDeals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCurrencySettings, setShowCurrencySettings] = useState(false);
  const [currency, setCurrency] = useState(() => {
    if (typeof window !== "undefined") return localStorage.getItem("crmCurrency") || "USD";
    return "USD";
  });

  const currencyInfo = CURRENCIES.find((c) => c.code === currency) || CURRENCIES[0];
  const formatMoney = (amount: number) => {
    const converted = amount * currencyInfo.rate;
    return `${currencyInfo.symbol}${converted?.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
  };

  const handleCurrencyChange = (code: string) => {
    setCurrency(code);
    localStorage.setItem("crmCurrency", code);
    addToast({ title: "Currency Changed", message: `CRM now shows in ${code}`, type: "success" });
  };

  // Forms
  const [showCustomerForm, setShowCustomerForm] = useState(false);
  const [showDealForm, setShowDealForm] = useState(false);
  const [showCustomerDetail, setShowCustomerDetail] = useState<any>(null);
  const [editingCustomer, setEditingCustomer] = useState<string | null>(null);
  const [editingDeal, setEditingDeal] = useState<string | null>(null);

  const [customerForm, setCustomerForm] = useState({
    name: "", email: "", phone: "", company: "", status: "LEAD",
    source: "", address: "", city: "", country: "", notes: "", tags: "",
  });

  const [dealForm, setDealForm] = useState({
    title: "", customerId: "", value: "", stage: "NEW", probability: "20", notes: "",
  });

  useEffect(() => { fetchData(); }, [searchQuery, statusFilter]);

  const fetchData = async () => {
    try {
      const [custData, dealData] = await Promise.all([
        crmAPI.getCustomers(1, searchQuery, statusFilter),
        crmAPI.getDeals(),
      ]);
      setCustomers(custData.customers || []);
      setDeals(dealData.deals || []);
    } catch (error) {
      console.error("CRM fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  const resetCustomerForm = () => {
    setCustomerForm({ name: "", email: "", phone: "", company: "", status: "LEAD", source: "", address: "", city: "", country: "", notes: "", tags: "" });
    setEditingCustomer(null);
    setShowCustomerForm(false);
  };

  const resetDealForm = () => {
    setDealForm({ title: "", customerId: "", value: "", stage: "NEW", probability: "20", notes: "" });
    setEditingDeal(null);
    setShowDealForm(false);
  };

  const handleEditCustomer = (customer: any) => {
    setCustomerForm({
      name: customer.name || "", email: customer.email || "", phone: customer.phone || "",
      company: customer.company || "", status: customer.status || "LEAD",
      source: customer.source || "", address: customer.address || "",
      city: customer.city || "", country: customer.country || "",
      notes: customer.notes || "", tags: customer.tags || "",
    });
    setEditingCustomer(customer.id);
    setShowCustomerForm(true);
  };

  const handleSaveCustomer = async () => {
    if (!customerForm.name || !customerForm.email) {
      addToast({ title: "Validation Error", message: "Name and email are required", type: "warning" });
      return;
    }
    try {
      if (editingCustomer) {
        await crmAPI.updateCustomer({ id: editingCustomer, ...customerForm });
        addToast({ title: "Customer Updated", message: customerForm.name, type: "success" });
      } else {
        await crmAPI.createCustomer(customerForm);
        addToast({ title: "Customer Added", message: customerForm.name, type: "success" });
      }
      resetCustomerForm();
      fetchData();
    } catch (error: any) {
      addToast({ title: "Error", message: error.message, type: "error" });
    }
  };

  const handleDeleteCustomer = async (id: string, name: string) => {
    if (!confirm(`Delete "${name}" and all related data? This cannot be undone.`)) return;
    try {
      await crmAPI.deleteCustomer(id);
      addToast({ title: "Deleted", message: `${name} removed`, type: "success" });
      if (showCustomerDetail?.id === id) setShowCustomerDetail(null);
      fetchData();
    } catch (error: any) {
      addToast({ title: "Error", message: error.message, type: "error" });
    }
  };

  const handleEditDeal = (deal: any) => {
    setDealForm({
      title: deal.title || "", customerId: deal.customerId || "",
      value: String(deal.value || ""), stage: deal.stage || "NEW",
      probability: String(deal.probability || 20), notes: deal.notes || "",
    });
    setEditingDeal(deal.id);
    setShowDealForm(true);
  };

  const handleSaveDeal = async () => {
    if (!dealForm.title || !dealForm.customerId || !dealForm.value) {
      addToast({ title: "Validation Error", message: "Title, customer, and value are required", type: "warning" });
      return;
    }
    try {
      if (editingDeal) {
        await crmAPI.updateDeal({ id: editingDeal, ...dealForm, value: parseFloat(dealForm.value), probability: parseInt(dealForm.probability) });
        addToast({ title: "Deal Updated", message: dealForm.title, type: "success" });
      } else {
        await crmAPI.createDeal({ ...dealForm, value: parseFloat(dealForm.value), probability: parseInt(dealForm.probability) });
        addToast({ title: "Deal Created", message: dealForm.title, type: "success" });
      }
      resetDealForm();
      fetchData();
    } catch (error: any) {
      addToast({ title: "Error", message: error.message, type: "error" });
    }
  };

  const handleDeleteDeal = async (id: string, title: string) => {
    if (!confirm(`Delete deal "${title}"?`)) return;
    try {
      await crmAPI.deleteDeal(id);
      addToast({ title: "Deleted", message: `${title} removed`, type: "success" });
      fetchData();
    } catch (error: any) {
      addToast({ title: "Error", message: error.message, type: "error" });
    }
  };

  const handleMoveDeal = async (dealId: string, newStage: string) => {
    try {
      await crmAPI.updateDeal({ id: dealId, stage: newStage });
      addToast({ title: "Deal Moved", message: `Stage updated to ${newStage}`, type: "success" });
      fetchData();
    } catch (error: any) {
      addToast({ title: "Error", message: error.message, type: "error" });
    }
  };

  const pipelineValue = deals.reduce((sum, d) => sum + (d.value || 0), 0);
  const wonDeals = deals.filter((d) => d.stage === "CLOSED_WON");
  const wonValue = wonDeals.reduce((sum, d) => sum + (d.value || 0), 0);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">CRM</h1>
          <p className="text-muted-foreground">Manage contacts, deals, and customer relationships</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 mr-2">
            <label className="text-sm text-muted-foreground">Currency:</label>
            <select
              className="text-sm px-2 py-1.5 rounded-md border border-input bg-background"
              value={currency}
              onChange={(e) => handleCurrencyChange(e.target.value)}
            >
              {CURRENCIES.map((c) => (
                <option key={c.code} value={c.code}>{c.code} ({c.symbol})</option>
              ))}
            </select>
          </div>
          <Button variant="outline" size="sm" onClick={() => fetchData()}>
            <Filter className="w-4 h-4 mr-1" /> Refresh
          </Button>
          <Button size="sm" onClick={() => { resetDealForm(); setShowDealForm(true); }}>
            <DollarSign className="w-4 h-4 mr-1" /> New Deal
          </Button>
          <Button size="sm" onClick={() => { resetCustomerForm(); setShowCustomerForm(true); }}>
            <UserPlus className="w-4 h-4 mr-1" /> Add Contact
          </Button>
        </div>
      </div>

      {/* Customer Form Modal */}
      {showCustomerForm && (
        <Card className="border-primary/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-base">{editingCustomer ? "Edit Contact" : "Add New Contact"}</CardTitle>
            <Button variant="ghost" size="icon" onClick={resetCustomerForm}><X className="w-4 h-4" /></Button>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Full Name *</label>
                <Input placeholder="John Doe" value={customerForm.name} onChange={(e) => setCustomerForm({ ...customerForm, name: e.target.value })} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Email *</label>
                <Input type="email" placeholder="john@company.com" value={customerForm.email} onChange={(e) => setCustomerForm({ ...customerForm, email: e.target.value })} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Phone</label>
                <Input placeholder="+1 555-0100" value={customerForm.phone} onChange={(e) => setCustomerForm({ ...customerForm, phone: e.target.value })} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Company</label>
                <Input placeholder="Acme Inc" value={customerForm.company} onChange={(e) => setCustomerForm({ ...customerForm, company: e.target.value })} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Status</label>
                <select className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm" value={customerForm.status} onChange={(e) => setCustomerForm({ ...customerForm, status: e.target.value })}>
                  {CUSTOMER_STATUSES.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Source</label>
                <select className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm" value={customerForm.source} onChange={(e) => setCustomerForm({ ...customerForm, source: e.target.value })}>
                  <option value="">Select source</option>
                  <option value="Website">Website</option>
                  <option value="Referral">Referral</option>
                  <option value="LinkedIn">LinkedIn</option>
                  <option value="Cold Call">Cold Call</option>
                  <option value="Conference">Conference</option>
                  <option value="Social Media">Social Media</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Address</label>
                <Input placeholder="123 Main St" value={customerForm.address} onChange={(e) => setCustomerForm({ ...customerForm, address: e.target.value })} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">City</label>
                <Input placeholder="New York" value={customerForm.city} onChange={(e) => setCustomerForm({ ...customerForm, city: e.target.value })} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Country</label>
                <Input placeholder="USA" value={customerForm.country} onChange={(e) => setCustomerForm({ ...customerForm, country: e.target.value })} />
              </div>
              <div className="space-y-2 md:col-span-3">
                <label className="text-sm font-medium">Notes</label>
                <textarea className="w-full h-20 px-3 py-2 rounded-md border border-input bg-background text-sm" placeholder="Additional notes..." value={customerForm.notes} onChange={(e) => setCustomerForm({ ...customerForm, notes: e.target.value })} />
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <Button onClick={handleSaveCustomer}>
                <Save className="w-4 h-4 mr-1" /> {editingCustomer ? "Update Contact" : "Save Contact"}
              </Button>
              <Button variant="outline" onClick={resetCustomerForm}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Deal Form Modal */}
      {showDealForm && (
        <Card className="border-primary/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-base">{editingDeal ? "Edit Deal" : "Create New Deal"}</CardTitle>
            <Button variant="ghost" size="icon" onClick={resetDealForm}><X className="w-4 h-4" /></Button>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Deal Title *</label>
                <Input placeholder="Enterprise License" value={dealForm.title} onChange={(e) => setDealForm({ ...dealForm, title: e.target.value })} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Customer *</label>
                <select className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm" value={dealForm.customerId} onChange={(e) => setDealForm({ ...dealForm, customerId: e.target.value })}>
                  <option value="">Select customer</option>
                  {customers.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Value *</label>
                <Input type="number" placeholder="50000" value={dealForm.value} onChange={(e) => setDealForm({ ...dealForm, value: e.target.value })} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Stage</label>
                <select className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm" value={dealForm.stage} onChange={(e) => setDealForm({ ...dealForm, stage: e.target.value })}>
                  {PIPELINE_STAGES.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Probability (%)</label>
                <Input type="number" placeholder="20" value={dealForm.probability} onChange={(e) => setDealForm({ ...dealForm, probability: e.target.value })} />
              </div>
              <div className="space-y-2 md:col-span-3">
                <label className="text-sm font-medium">Notes</label>
                <textarea className="w-full h-20 px-3 py-2 rounded-md border border-input bg-background text-sm" placeholder="Deal notes..." value={dealForm.notes} onChange={(e) => setDealForm({ ...dealForm, notes: e.target.value })} />
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <Button onClick={handleSaveDeal}>
                <Save className="w-4 h-4 mr-1" /> {editingDeal ? "Update Deal" : "Create Deal"}
              </Button>
              <Button variant="outline" onClick={resetDealForm}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Customer Detail Panel */}
      {showCustomerDetail && (
        <Card className="border-primary/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div className="flex items-center gap-3">
              <Avatar className="h-12 w-12">
                <AvatarFallback className="bg-primary/10 text-primary text-lg">
                  {showCustomerDetail.name?.split(" ").map((n: string) => n[0]).join("")}
                </AvatarFallback>
              </Avatar>
              <div>
                <CardTitle>{showCustomerDetail.name}</CardTitle>
                <p className="text-sm text-muted-foreground">{showCustomerDetail.email}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => handleEditCustomer(showCustomerDetail)}>
                <Pencil className="w-4 h-4 mr-1" /> Edit
              </Button>
              <Button variant="outline" size="sm" className="text-red-500" onClick={() => handleDeleteCustomer(showCustomerDetail.id, showCustomerDetail.name)}>
                <Trash2 className="w-4 h-4 mr-1" /> Delete
              </Button>
              <Button variant="ghost" size="icon" onClick={() => setShowCustomerDetail(null)}>
                <X className="w-4 h-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-4 gap-6">
              <div className="space-y-4">
                <h4 className="text-sm font-medium text-muted-foreground">Contact Info</h4>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="w-4 h-4 text-muted-foreground" />
                    <span>{showCustomerDetail.email || "-"}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="w-4 h-4 text-muted-foreground" />
                    <span>{showCustomerDetail.phone || "-"}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Building2 className="w-4 h-4 text-muted-foreground" />
                    <span>{showCustomerDetail.company || "-"}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="w-4 h-4 text-muted-foreground" />
                    <span>{[showCustomerDetail.address, showCustomerDetail.city, showCustomerDetail.country].filter(Boolean).join(", ") || "-"}</span>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <h4 className="text-sm font-medium text-muted-foreground">Details</h4>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Tag className="w-4 h-4 text-muted-foreground" />
                    <Badge variant={statusColors[showCustomerDetail.status] as any}>{showCustomerDetail.status}</Badge>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <ExternalLink className="w-4 h-4 text-muted-foreground" />
                    <span>{showCustomerDetail.source || "Unknown"}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <span>Added {new Date(showCustomerDetail.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <h4 className="text-sm font-medium text-muted-foreground">Deals ({showCustomerDetail.deals?.length || 0})</h4>
                <div className="space-y-2">
                  {(showCustomerDetail.deals || []).map((deal: any) => (
                    <div key={deal.id} className="flex items-center justify-between p-2 rounded bg-muted/50">
                      <span className="text-sm">{deal.title}</span>
                      <Badge variant={statusColors[deal.stage] as any}>{formatMoney(deal.value)}</Badge>
                    </div>
                  ))}
                  {(!showCustomerDetail.deals || showCustomerDetail.deals.length === 0) && (
                    <p className="text-sm text-muted-foreground">No deals yet</p>
                  )}
                </div>
              </div>
              <div className="space-y-4">
                <h4 className="text-sm font-medium text-muted-foreground">Notes</h4>
                <p className="text-sm text-muted-foreground">{showCustomerDetail.notes || "No notes"}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card><CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div><p className="text-sm text-muted-foreground">Total Contacts</p><p className="text-2xl font-bold">{customers.length}</p></div>
            <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center"><Users className="w-5 h-5 text-blue-500" /></div>
          </div>
        </CardContent></Card>
        <Card><CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div><p className="text-sm text-muted-foreground">Pipeline Value</p><p className="text-2xl font-bold">{formatMoney(pipelineValue)}</p></div>
            <div className="w-10 h-10 rounded-lg bg-violet-500/10 flex items-center justify-center"><DollarSign className="w-5 h-5 text-violet-500" /></div>
          </div>
        </CardContent></Card>
        <Card><CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div><p className="text-sm text-muted-foreground">Won Deals</p><p className="text-2xl font-bold">{wonDeals.length}</p></div>
            <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center"><TrendingUp className="w-5 h-5 text-emerald-500" /></div>
          </div>
        </CardContent></Card>
        <Card><CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div><p className="text-sm text-muted-foreground">Won Value</p><p className="text-2xl font-bold">{formatMoney(wonValue)}</p></div>
            <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center"><ArrowUpRight className="w-5 h-5 text-amber-500" /></div>
          </div>
        </CardContent></Card>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-border/50 pb-2">
        <Button variant={activeTab === "contacts" ? "default" : "ghost"} size="sm" onClick={() => setActiveTab("contacts")}>
          <Users className="w-4 h-4 mr-1" /> Contacts
        </Button>
        <Button variant={activeTab === "pipeline" ? "default" : "ghost"} size="sm" onClick={() => setActiveTab("pipeline")}>
          <DollarSign className="w-4 h-4 mr-1" /> Pipeline
        </Button>
      </div>

      {/* Contacts Tab */}
      {activeTab === "contacts" && (
        <div className="space-y-4">
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Search contacts..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9" />
            </div>
            <select className="h-10 px-3 rounded-md border border-input bg-background text-sm" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="">All Status</option>
              {CUSTOMER_STATUSES.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>

          <Card><CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border/50">
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground">Contact</th>
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground">Company</th>
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground">Status</th>
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground">Source</th>
                    <th className="text-right p-4 text-sm font-medium text-muted-foreground">Deals</th>
                    <th className="text-right p-4 text-sm font-medium text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr><td colSpan={6} className="p-8 text-center text-muted-foreground">Loading...</td></tr>
                  ) : customers.length === 0 ? (
                    <tr><td colSpan={6} className="p-8 text-center text-muted-foreground">No contacts found. Add your first contact!</td></tr>
                  ) : customers.map((customer) => {
                    const customerDeals = deals.filter((d) => d.customerId === customer.id);
                    return (
                      <tr key={customer.id} className="border-b border-border/50 last:border-0 hover:bg-muted/50 transition-colors">
                        <td className="p-4">
                          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setShowCustomerDetail(customer)}>
                            <Avatar className="h-9 w-9">
                              <AvatarFallback className="bg-primary/10 text-primary text-xs">
                                {customer.name?.split(" ").map((n: string) => n[0]).join("")}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="text-sm font-medium hover:text-primary">{customer.name}</p>
                              <p className="text-xs text-muted-foreground">{customer.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="p-4 text-sm">{customer.company || "-"}</td>
                        <td className="p-4">
                          <Badge variant={statusColors[customer.status] as any}>{customer.status}</Badge>
                        </td>
                        <td className="p-4 text-sm text-muted-foreground">{customer.source || "-"}</td>
                        <td className="p-4 text-sm text-right">{customerDeals.length}</td>
                        <td className="p-4 text-right">
                          <div className="flex justify-end gap-1">
                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setShowCustomerDetail(customer)}>
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEditCustomer(customer)}>
                              <Pencil className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => addToast({ title: "Email", message: `Opening ${customer.email}`, type: "info" })}>
                              <Mail className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:text-red-700" onClick={() => handleDeleteCustomer(customer.id, customer.name)}>
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent></Card>
        </div>
      )}

      {/* Pipeline Tab */}
      {activeTab === "pipeline" && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {PIPELINE_STAGES.map((stage) => {
              const stageDeals = deals.filter((d) => d.stage === stage.id);
              const stageTotal = stageDeals.reduce((sum, d) => sum + (d.value || 0), 0);
              return (
                <div key={stage.id} className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${stage.color}`} />
                      <span className="text-sm font-medium">{stage.name}</span>
                    </div>
                    <Badge variant="secondary" className="text-xs">{stageDeals.length}</Badge>
                  </div>
                  <div className={`text-sm font-medium ${stage.textColor}`}>{formatMoney(stageTotal)}</div>
                  <div className="space-y-2">
                    {stageDeals.map((deal) => (
                      <Card key={deal.id} className="cursor-pointer hover:shadow-md transition-all">
                        <CardContent className="p-3 space-y-2">
                          <div className="flex items-start justify-between">
                            <p className="text-sm font-medium">{deal.title}</p>
                            <div className="flex gap-1">
                              <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleEditDeal(deal)}>
                                <Pencil className="w-3 h-3" />
                              </Button>
                              <Button variant="ghost" size="icon" className="h-6 w-6 text-red-500" onClick={() => handleDeleteDeal(deal.id, deal.title)}>
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            </div>
                          </div>
                          <p className="text-xs text-muted-foreground">{deal.customer?.name || "No customer"}</p>
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-bold">{formatMoney(deal.value)}</span>
                            <span className="text-xs text-muted-foreground">{deal.probability}%</span>
                          </div>
                          <select
                            className="w-full text-xs py-1 px-2 rounded border bg-background"
                            value={deal.stage}
                            onChange={(e) => handleMoveDeal(deal.id, e.target.value)}
                          >
                            {PIPELINE_STAGES.map((s) => (
                              <option key={s.id} value={s.id}>{s.name}</option>
                            ))}
                          </select>
                        </CardContent>
                      </Card>
                    ))}
                    {stageDeals.length === 0 && (
                      <div className="p-4 rounded-lg border border-dashed border-border/50 text-center">
                        <p className="text-xs text-muted-foreground">No deals</p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
