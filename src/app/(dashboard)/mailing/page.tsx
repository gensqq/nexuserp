"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  Mail,
  Send,
  Eye,
  MousePointerClick,
  Users,
  Calendar,
  MoreHorizontal,
  Trash2,
} from "lucide-react";
import { mailingAPI } from "@/utils/api";
import { useToast } from "@/components/ui/toast";

const statusColors: Record<string, string> = {
  DRAFT: "secondary",
  SCHEDULED: "info",
  SENDING: "warning",
  SENT: "success",
};

export default function MailingPage() {
  const { addToast } = useToast();
  const [activeTab, setActiveTab] = useState<"campaigns" | "templates">("campaigns");
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [templates, setTemplates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddCampaign, setShowAddCampaign] = useState(false);
  const [showAddTemplate, setShowAddTemplate] = useState(false);
  const [newCampaign, setNewCampaign] = useState({ name: "", subject: "", body: "" });
  const [newTemplate, setNewTemplate] = useState({ name: "", subject: "", body: "" });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [campaignsData, templatesData] = await Promise.all([
        mailingAPI.getCampaigns(),
        mailingAPI.getTemplates(),
      ]);
      setCampaigns(campaignsData.campaigns || []);
      setTemplates(templatesData.templates || []);
    } catch (error) {
      console.error("Mailing fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddCampaign = async () => {
    if (!newCampaign.name || !newCampaign.subject) {
      addToast({ title: "Validation Error", message: "Name and subject are required", type: "warning" });
      return;
    }
    try {
      await mailingAPI.createCampaign(newCampaign);
      addToast({ title: "Campaign Created", message: newCampaign.name, type: "success" });
      setNewCampaign({ name: "", subject: "", body: "" });
      setShowAddCampaign(false);
      fetchData();
    } catch (error: any) {
      addToast({ title: "Error", message: error.message, type: "error" });
    }
  };

  const handleAddTemplate = async () => {
    if (!newTemplate.name || !newTemplate.subject) {
      addToast({ title: "Validation Error", message: "Name and subject are required", type: "warning" });
      return;
    }
    try {
      await mailingAPI.createTemplate(newTemplate);
      addToast({ title: "Template Created", message: newTemplate.name, type: "success" });
      setNewTemplate({ name: "", subject: "", body: "" });
      setShowAddTemplate(false);
      fetchData();
    } catch (error: any) {
      addToast({ title: "Error", message: error.message, type: "error" });
    }
  };

  const handleDeleteCampaign = async (id: string, name: string) => {
    if (!confirm(`Delete campaign "${name}"?`)) return;
    try {
      await mailingAPI.deleteCampaign(id);
      addToast({ title: "Deleted", message: `${name} removed`, type: "success" });
      fetchData();
    } catch (error: any) {
      addToast({ title: "Error", message: error.message, type: "error" });
    }
  };

  const handleDeleteTemplate = async (id: string, name: string) => {
    if (!confirm(`Delete template "${name}"?`)) return;
    try {
      await mailingAPI.deleteTemplate(id);
      addToast({ title: "Deleted", message: `${name} removed`, type: "success" });
      fetchData();
    } catch (error: any) {
      addToast({ title: "Error", message: error.message, type: "error" });
    }
  };

  const totalRecipients = campaigns.reduce((sum, c) => sum + (c.recipientCount || 0), 0);
  const totalOpens = campaigns.reduce((sum, c) => sum + (c.openCount || 0), 0);
  const totalClicks = campaigns.reduce((sum, c) => sum + (c.clickCount || 0), 0);
  const openRate = totalRecipients > 0 ? ((totalOpens / totalRecipients) * 100).toFixed(1) : "0";

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Mailing</h1>
          <p className="text-muted-foreground">Manage email campaigns and templates</p>
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" onClick={() => setShowAddCampaign(true)}><Plus className="w-4 h-4 mr-1" /> New Campaign</Button>
          <Button size="sm" variant="outline" onClick={() => setShowAddTemplate(true)}><Plus className="w-4 h-4 mr-1" /> New Template</Button>
        </div>
      </div>

      {/* Add Campaign Form */}
      {showAddCampaign && (
        <Card>
          <CardHeader><CardTitle className="text-base">Create Campaign</CardTitle></CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Campaign Name *</label>
                <Input placeholder="Summer Sale 2026" value={newCampaign.name} onChange={(e) => setNewCampaign({ ...newCampaign, name: e.target.value })} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Subject *</label>
                <Input placeholder="Don't miss our biggest sale!" value={newCampaign.subject} onChange={(e) => setNewCampaign({ ...newCampaign, subject: e.target.value })} />
              </div>
              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-medium">Email Body</label>
                <textarea className="w-full h-32 px-3 py-2 rounded-md border border-input bg-background text-sm" placeholder="Email content..." value={newCampaign.body} onChange={(e) => setNewCampaign({ ...newCampaign, body: e.target.value })} />
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <Button onClick={handleAddCampaign}>Create Campaign</Button>
              <Button variant="outline" onClick={() => setShowAddCampaign(false)}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Add Template Form */}
      {showAddTemplate && (
        <Card>
          <CardHeader><CardTitle className="text-base">Create Template</CardTitle></CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Template Name *</label>
                <Input placeholder="Welcome Email" value={newTemplate.name} onChange={(e) => setNewTemplate({ ...newTemplate, name: e.target.value })} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Subject *</label>
                <Input placeholder="Welcome to {{company}}" value={newTemplate.subject} onChange={(e) => setNewTemplate({ ...newTemplate, subject: e.target.value })} />
              </div>
              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-medium">Template Body</label>
                <textarea className="w-full h-32 px-3 py-2 rounded-md border border-input bg-background text-sm" placeholder="Template content..." value={newTemplate.body} onChange={(e) => setNewTemplate({ ...newTemplate, body: e.target.value })} />
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <Button onClick={handleAddTemplate}>Create Template</Button>
              <Button variant="outline" onClick={() => setShowAddTemplate(false)}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card><CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div><p className="text-sm text-muted-foreground">Total Sent</p><p className="text-2xl font-bold">{totalRecipients.toLocaleString()}</p></div>
            <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center"><Send className="w-5 h-5 text-blue-500" /></div>
          </div>
        </CardContent></Card>
        <Card><CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div><p className="text-sm text-muted-foreground">Total Opens</p><p className="text-2xl font-bold">{totalOpens.toLocaleString()}</p></div>
            <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center"><Eye className="w-5 h-5 text-emerald-500" /></div>
          </div>
        </CardContent></Card>
        <Card><CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div><p className="text-sm text-muted-foreground">Total Clicks</p><p className="text-2xl font-bold">{totalClicks.toLocaleString()}</p></div>
            <div className="w-10 h-10 rounded-lg bg-violet-500/10 flex items-center justify-center"><MousePointerClick className="w-5 h-5 text-violet-500" /></div>
          </div>
        </CardContent></Card>
        <Card><CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div><p className="text-sm text-muted-foreground">Open Rate</p><p className="text-2xl font-bold">{openRate}%</p></div>
            <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center"><Mail className="w-5 h-5 text-amber-500" /></div>
          </div>
        </CardContent></Card>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-border/50 pb-2">
        <Button variant={activeTab === "campaigns" ? "default" : "ghost"} size="sm" onClick={() => setActiveTab("campaigns")}>Campaigns</Button>
        <Button variant={activeTab === "templates" ? "default" : "ghost"} size="sm" onClick={() => setActiveTab("templates")}>Templates</Button>
      </div>

      {activeTab === "campaigns" && (
        <Card><CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border/50">
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Campaign</th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Status</th>
                  <th className="text-right p-4 text-sm font-medium text-muted-foreground">Recipients</th>
                  <th className="text-right p-4 text-sm font-medium text-muted-foreground">Opens</th>
                  <th className="text-right p-4 text-sm font-medium text-muted-foreground">Clicks</th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Date</th>
                  <th className="text-right p-4 text-sm font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={6} className="p-8 text-center text-muted-foreground">Loading...</td></tr>
                ) : campaigns.length === 0 ? (
                  <tr><td colSpan={6} className="p-8 text-center text-muted-foreground">No campaigns yet</td></tr>
                ) : (
                  campaigns.map((campaign) => (
                    <tr key={campaign.id} className="border-b border-border/50 last:border-0 hover:bg-muted/50">
                      <td className="p-4">
                        <p className="text-sm font-medium">{campaign.name}</p>
                        <p className="text-xs text-muted-foreground">{campaign.subject}</p>
                      </td>
                      <td className="p-4"><Badge variant={statusColors[campaign.status] as any}>{campaign.status}</Badge></td>
                      <td className="p-4 text-sm text-right">{(campaign.recipientCount || 0).toLocaleString()}</td>
                      <td className="p-4 text-sm text-right">{(campaign.openCount || 0).toLocaleString()}</td>
                      <td className="p-4 text-sm text-right">{(campaign.clickCount || 0).toLocaleString()}</td>
                      <td className="p-4 text-sm text-muted-foreground">{campaign.sentAt ? new Date(campaign.sentAt).toLocaleDateString() : campaign.scheduledAt ? new Date(campaign.scheduledAt).toLocaleDateString() : "-"}</td>
                      <td className="p-4 text-right">
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:text-red-700" onClick={() => handleDeleteCampaign(campaign.id, campaign.name)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent></Card>
      )}

      {activeTab === "templates" && (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {loading ? (
            [1, 2, 3].map((i) => (
              <Card key={i}><CardContent className="p-6">
                <div className="animate-pulse space-y-3">
                  <div className="h-10 w-10 bg-muted rounded-lg" />
                  <div className="h-4 bg-muted rounded w-3/4" />
                  <div className="h-3 bg-muted rounded w-full" />
                </div>
              </CardContent></Card>
            ))
          ) : templates.length === 0 ? (
            <Card className="col-span-3"><CardContent className="p-8 text-center">
              <Mail className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-30" />
              <p className="text-muted-foreground">No templates yet. Create your first template!</p>
            </CardContent></Card>
          ) : (
            templates.map((template) => (
              <Card key={template.id} className="cursor-pointer hover:shadow-lg transition-all">
                <CardContent className="p-6">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                    <Mail className="w-6 h-6 text-primary" />
                  </div>
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-medium">{template.name}</h3>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-red-500 hover:text-red-700" onClick={() => handleDeleteTemplate(template.id, template.name)}>
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">{template.subject}</p>
                  <p className="text-xs text-muted-foreground line-clamp-2">{template.body}</p>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}
    </div>
  );
}
