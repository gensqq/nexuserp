"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useThemeStore, useAuthStore } from "@/store";
import { settingsAPI, billingAPI } from "@/utils/api";
import { useToast } from "@/components/ui/toast";
import {
  User,
  Building2,
  Shield,
  Bell,
  Palette,
  Save,
  Moon,
  Sun,
  Sparkles,
  FileSpreadsheet,
  Upload,
  Download,
  RefreshCw,
  ExternalLink,
  Unlink,
  CreditCard,
  Check,
  Crown,
} from "lucide-react";

export default function SettingsPage() {
  const { theme, toggleTheme } = useThemeStore();
  const { user, updateUser } = useAuthStore();
  const { addToast } = useToast();
  const [activeTab, setActiveTab] = useState<"profile" | "company" | "ai" | "billing" | "security" | "notifications" | "appearance" | "sheets">("profile");
  const [loading, setLoading] = useState(false);
  const [companyLoading, setCompanyLoading] = useState(false);

  const [profile, setProfile] = useState({
    name: user?.name || "Admin User",
    email: user?.email || "admin@nexus.com",
    phone: "+1 555-0100",
  });

  const [company, setCompany] = useState({
    name: "",
    domain: "",
    industry: "Technology",
    size: "50-100",
    address: "123 Business Ave, Suite 100, San Francisco, CA 94105",
  });

  const [password, setPassword] = useState({ current: "", new: "", confirm: "" });
  const [aiSettings, setAiSettings] = useState({ openaiKey: "", anthropicKey: "" });
  const [aiStatus, setAiStatus] = useState({ hasOpenai: false, hasAnthropic: false });
  const [aiLoading, setAiLoading] = useState(false);
  const [showOpenaiKey, setShowOpenaiKey] = useState(false);
  const [showAnthropicKey, setShowAnthropicKey] = useState(false);
  const [sheetsConnected, setSheetsConnected] = useState(false);
  const [sheetsLoading, setSheetsLoading] = useState(false);
  const [syncModule, setSyncModule] = useState("products");
  const [syncSpreadsheetId, setSyncSpreadsheetId] = useState("");
  const [syncResult, setSyncResult] = useState<any>(null);
  const [billingPlan, setBillingPlan] = useState("FREE");
  const [billingFeatures, setBillingFeatures] = useState<any>({});
  const [billingPlans, setBillingPlans] = useState<any[]>([]);
  const [billingLoading, setBillingLoading] = useState(false);

  const tabs = [
    { id: "profile", label: "Profile", icon: User },
    { id: "company", label: "Company", icon: Building2 },
    { id: "billing", label: "Billing", icon: CreditCard },
    { id: "ai", label: "AI Assistant", icon: Sparkles },
    { id: "sheets", label: "Google Sheets", icon: FileSpreadsheet },
    { id: "security", label: "Security", icon: Shield },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "appearance", label: "Appearance", icon: Palette },
  ];

  useEffect(() => {
    fetchCompany();
    fetchAISettings();
    // Check Google Sheets connection
    settingsAPI.googleStatus().then(d => setSheetsConnected(d.connected)).catch(() => {});
    // Load billing
    billingAPI.getStatus().then(d => {
      setBillingPlan(d.currentPlan);
      setBillingFeatures(d.plan?.features || {});
      setBillingPlans(d.plans || []);
    }).catch(() => {});
    // Check URL params for Google callback
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (params.get("google") === "connected") {
        setSheetsConnected(true);
        addToast({ title: "Google Connected", message: "Your Google account is now linked", type: "success" });
      } else if (params.get("google") === "error") {
        addToast({ title: "Google Auth Failed", message: params.get("msg") || "Connection failed", type: "error" });
      }
    }
  }, []);

  const fetchAISettings = async () => {
    try {
      const data = await settingsAPI.getAI();
      setAiStatus({ hasOpenai: data.hasOpenai, hasAnthropic: data.hasAnthropic });
    } catch (error) {
      console.error("Fetch AI settings error:", error);
    }
  };

  const fetchCompany = async () => {
    try {
      const data = await settingsAPI.getCompany();
      if (data.company) {
        setCompany({
          name: data.company.name || "",
          domain: data.company.domain || "",
          industry: "Technology",
          size: "50-100",
          address: "123 Business Ave, Suite 100, San Francisco, CA 94105",
        });
      }
    } catch (error) {
      console.error("Fetch company error:", error);
    }
  };

  const handleSaveProfile = async () => {
    setLoading(true);
    try {
      const data = await settingsAPI.updateProfile({ name: profile.name, email: profile.email, phone: profile.phone });
      if (data.user) {
        updateUser({ name: data.user.name, email: data.user.email });
      }
      addToast({ title: "Profile Updated", message: "Your profile has been saved", type: "success" });
    } catch (error: any) {
      addToast({ title: "Error", message: error.message, type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveCompany = async () => {
    setCompanyLoading(true);
    try {
      await settingsAPI.updateCompany({ name: company.name, domain: company.domain });
      addToast({ title: "Company Updated", message: "Company settings saved", type: "success" });
    } catch (error: any) {
      addToast({ title: "Error", message: error.message, type: "error" });
    } finally {
      setCompanyLoading(false);
    }
  };

  const handleUpdatePassword = async () => {
    if (!password.current || !password.new || !password.confirm) {
      addToast({ title: "Validation Error", message: "Fill in all password fields", type: "warning" });
      return;
    }
    if (password.new !== password.confirm) {
      addToast({ title: "Validation Error", message: "Passwords do not match", type: "warning" });
      return;
    }
    if (password.new.length < 6) {
      addToast({ title: "Validation Error", message: "Password must be at least 6 characters", type: "warning" });
      return;
    }
    setLoading(true);
    try {
      await settingsAPI.updateProfile({ currentPassword: password.current, password: password.new });
      addToast({ title: "Password Updated", message: "Your password has been changed", type: "success" });
      setPassword({ current: "", new: "", confirm: "" });
    } catch (error: any) {
      addToast({ title: "Error", message: error.message, type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveAI = async () => {
    setAiLoading(true);
    try {
      await settingsAPI.saveAI({
        openaiKey: aiSettings.openaiKey,
        anthropicKey: aiSettings.anthropicKey,
      });
      addToast({ title: "AI Settings Saved", message: "API keys saved and activated! No restart needed.", type: "success" });
      setAiSettings({ openaiKey: "", anthropicKey: "" });
      fetchAISettings();
    } catch (error: any) {
      addToast({ title: "Error", message: error.message, type: "error" });
    } finally {
      setAiLoading(false);
    }
  };

  const handleRemoveAIKey = async (key: "openaiKey" | "anthropicKey") => {
    if (!confirm(`Remove ${key === "openaiKey" ? "OpenAI" : "Anthropic"} API key?`)) return;
    setAiLoading(true);
    try {
      await settingsAPI.saveAI({ [key]: "" });
      addToast({ title: "Key Removed", message: `${key === "openaiKey" ? "OpenAI" : "Anthropic"} key removed`, type: "success" });
      fetchAISettings();
    } catch (error: any) {
      addToast({ title: "Error", message: error.message, type: "error" });
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-muted-foreground">Manage your account and application settings</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar */}
        <div className="lg:w-64">
          <Card>
            <CardContent className="p-2">
              <nav className="space-y-1">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm transition-colors ${
                      activeTab === tab.id ? "bg-primary text-primary-foreground" : "hover:bg-accent text-muted-foreground"
                    }`}
                  >
                    <tab.icon className="w-4 h-4" />
                    {tab.label}
                  </button>
                ))}
              </nav>
            </CardContent>
          </Card>
        </div>

        {/* Content */}
        <div className="flex-1 space-y-6">
          {activeTab === "profile" && (
            <Card>
              <CardHeader>
                <CardTitle>Profile Settings</CardTitle>
                <CardDescription>Manage your personal information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center gap-4">
                  <Avatar className="h-20 w-20">
                    {user?.avatar ? (
                      <img src={user.avatar} alt="Avatar" className="h-full w-full object-cover rounded-full" />
                    ) : (
                      <AvatarFallback className="bg-gradient-to-br from-blue-500 to-violet-600 text-white text-2xl">
                        {profile.name.split(" ").map((n) => n[0]).join("").toUpperCase()}
                      </AvatarFallback>
                    )}
                  </Avatar>
                  <div className="flex gap-2">
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      id="avatar-upload"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        if (file.size > 2 * 1024 * 1024) {
                          addToast({ title: "Too Large", message: "Image must be under 2MB", type: "error" });
                          return;
                        }
                        const reader = new FileReader();
                        reader.onload = async () => {
                          try {
                            const data = await settingsAPI.uploadAvatar(reader.result as string);
                            updateUser({ avatar: data.user.avatar });
                            addToast({ title: "Avatar Updated", message: "Your profile picture has been changed", type: "success" });
                          } catch (err: any) {
                            addToast({ title: "Error", message: err.message, type: "error" });
                          }
                        };
                        reader.readAsDataURL(file);
                      }}
                    />
                    <Button variant="outline" size="sm" onClick={() => document.getElementById("avatar-upload")?.click()}>Change Avatar</Button>
                    {user?.avatar && (
                      <Button variant="outline" size="sm" className="text-red-500" onClick={async () => {
                        try {
                          const data = await settingsAPI.deleteAvatar();
                          updateUser({ avatar: data.user.avatar });
                          addToast({ title: "Avatar Removed", message: "Profile picture removed", type: "success" });
                        } catch (err: any) {
                          addToast({ title: "Error", message: err.message, type: "error" });
                        }
                      }}>Remove</Button>
                    )}
                  </div>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Full Name</label>
                    <Input value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Email</label>
                    <Input type="email" value={profile.email} onChange={(e) => setProfile({ ...profile, email: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Phone</label>
                    <Input value={profile.phone} onChange={(e) => setProfile({ ...profile, phone: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Role</label>
                    <Input value={user?.role || "admin"} disabled />
                  </div>
                </div>
                <Button onClick={handleSaveProfile} disabled={loading}>
                  <Save className="w-4 h-4 mr-1" /> {loading ? "Saving..." : "Save Changes"}
                </Button>
              </CardContent>
            </Card>
          )}

          {activeTab === "company" && (
            <Card>
              <CardHeader>
                <CardTitle>Company Settings</CardTitle>
                <CardDescription>Manage your organization details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Company Name</label>
                    <Input value={company.name} onChange={(e) => setCompany({ ...company, name: e.target.value })} placeholder="Your Company" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Domain</label>
                    <Input value={company.domain} onChange={(e) => setCompany({ ...company, domain: e.target.value })} placeholder="yourcompany.com" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Industry</label>
                    <Input value={company.industry} onChange={(e) => setCompany({ ...company, industry: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Company Size</label>
                    <Input value={company.size} onChange={(e) => setCompany({ ...company, size: e.target.value })} />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-sm font-medium">Address</label>
                    <Input value={company.address} onChange={(e) => setCompany({ ...company, address: e.target.value })} />
                  </div>
                </div>
                <Button onClick={handleSaveCompany} disabled={companyLoading}>
                  <Save className="w-4 h-4 mr-1" /> {companyLoading ? "Saving..." : "Save Changes"}
                </Button>
              </CardContent>
            </Card>
          )}

          {activeTab === "ai" && (
            <Card>
              <CardHeader>
                <CardTitle>AI Assistant Configuration</CardTitle>
                <CardDescription>Connect to an AI model for smarter, human-like responses</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Status */}
                <div className="p-4 rounded-lg bg-muted/50 border border-border/50">
                  <h3 className="text-sm font-medium mb-3">Current Status</h3>
                  <div className="grid md:grid-cols-2 gap-3">
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-background">
                      <div className={`w-3 h-3 rounded-full ${aiStatus.hasOpenai ? "bg-emerald-500" : "bg-gray-400"}`} />
                      <div>
                        <p className="text-sm font-medium">OpenAI (GPT-4)</p>
                        <p className="text-xs text-muted-foreground">{aiStatus.hasOpenai ? "Connected" : "Not configured"}</p>
                      </div>
                      {aiStatus.hasOpenai && (
                        <Button variant="ghost" size="sm" className="ml-auto text-red-500" onClick={() => handleRemoveAIKey("openaiKey")}>Remove</Button>
                      )}
                    </div>
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-background">
                      <div className={`w-3 h-3 rounded-full ${aiStatus.hasAnthropic ? "bg-emerald-500" : "bg-gray-400"}`} />
                      <div>
                        <p className="text-sm font-medium">Anthropic (Claude)</p>
                        <p className="text-xs text-muted-foreground">{aiStatus.hasAnthropic ? "Connected" : "Not configured"}</p>
                      </div>
                      {aiStatus.hasAnthropic && (
                        <Button variant="ghost" size="sm" className="ml-auto text-red-500" onClick={() => handleRemoveAIKey("anthropicKey")}>Remove</Button>
                      )}
                    </div>
                  </div>
                  {!aiStatus.hasOpenai && !aiStatus.hasAnthropic && (
                    <p className="text-xs text-amber-500 mt-2">Using built-in responses. Add an API key below for AI-powered conversations.</p>
                  )}
                  {(aiStatus.hasOpenai || aiStatus.hasAnthropic) && (
                    <p className="text-xs text-emerald-500 mt-2">AI model connected! The assistant will use {aiStatus.hasOpenai ? "GPT-4" : "Claude"} for responses.</p>
                  )}
                </div>

                {/* OpenAI Section */}
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                      <Sparkles className="w-5 h-5 text-emerald-500" />
                    </div>
                    <div>
                      <h4 className="text-sm font-medium">OpenAI API Key</h4>
                      <p className="text-xs text-muted-foreground">GPT-4o-mini - Best for business analysis</p>
                    </div>
                    <Badge variant="info" className="ml-auto">Recommended</Badge>
                  </div>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Input
                        type={showOpenaiKey ? "text" : "password"}
                        placeholder="sk-..."
                        value={aiSettings.openaiKey}
                        onChange={(e) => setAiSettings({ ...aiSettings, openaiKey: e.target.value })}
                      />
                    </div>
                    <Button variant="outline" size="sm" onClick={() => setShowOpenaiKey(!showOpenaiKey)}>
                      {showOpenaiKey ? "Hide" : "Show"}
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">Get your key at <a href="https://platform.openai.com/api-keys" target="_blank" className="text-primary hover:underline">platform.openai.com/api-keys</a></p>
                </div>

                {/* Anthropic Section */}
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-violet-500/10 flex items-center justify-center">
                      <Sparkles className="w-5 h-5 text-violet-500" />
                    </div>
                    <div>
                      <h4 className="text-sm font-medium">Anthropic API Key</h4>
                      <p className="text-xs text-muted-foreground">Claude 3.5 Sonnet - Great for detailed analysis</p>
                    </div>
                    <Badge variant="secondary" className="ml-auto">Alternative</Badge>
                  </div>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Input
                        type={showAnthropicKey ? "text" : "password"}
                        placeholder="sk-ant-..."
                        value={aiSettings.anthropicKey}
                        onChange={(e) => setAiSettings({ ...aiSettings, anthropicKey: e.target.value })}
                      />
                    </div>
                    <Button variant="outline" size="sm" onClick={() => setShowAnthropicKey(!showAnthropicKey)}>
                      {showAnthropicKey ? "Hide" : "Show"}
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">Get your key at <a href="https://console.anthropic.com/" target="_blank" className="text-primary hover:underline">console.anthropic.com</a></p>
                </div>

                {/* Save Button */}
                <div className="flex gap-3">
                  <Button onClick={handleSaveAI} disabled={aiLoading || (!aiSettings.openaiKey && !aiSettings.anthropicKey)}>
                    <Save className="w-4 h-4 mr-1" /> {aiLoading ? "Saving..." : "Save & Activate"}
                  </Button>
                  <Button variant="outline" onClick={() => setAiSettings({ openaiKey: "", anthropicKey: "" })}>Clear</Button>
                </div>

                {/* Info */}
                <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
                  <h4 className="text-sm font-medium text-blue-500 mb-2">How it works</h4>
                  <ul className="text-xs text-muted-foreground space-y-1.5">
                    <li>1. Enter your API key above and click "Save & Activate"</li>
                    <li>2. The key is saved to <code className="bg-muted px-1 rounded">.env.local</code> and activated immediately</li>
                    <li>3. No server restart needed - changes take effect instantly</li>
                    <li>4. The AI assistant will use the model for all conversations</li>
                    <li>5. If both keys are set, OpenAI takes priority</li>
                  </ul>
                </div>

                {/* Pricing Info */}
                <div className="p-4 rounded-lg bg-muted/50 border border-border/50">
                  <h4 className="text-sm font-medium mb-2">API Pricing (approximate)</h4>
                  <div className="grid md:grid-cols-2 gap-3 text-xs text-muted-foreground">
                    <div>
                      <p className="font-medium text-foreground">OpenAI GPT-4o-mini</p>
                      <p>~$0.15 per 1M input tokens</p>
                      <p>~$0.60 per 1M output tokens</p>
                    </div>
                    <div>
                      <p className="font-medium text-foreground">Claude 3.5 Sonnet</p>
                      <p>~$3.00 per 1M input tokens</p>
                      <p>~$15.00 per 1M output tokens</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === "security" && (
            <Card>
              <CardHeader>
                <CardTitle>Security Settings</CardTitle>
                <CardDescription>Manage your password and security preferences</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-sm font-medium">Change Password</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm text-muted-foreground">Current Password</label>
                      <Input type="password" value={password.current} onChange={(e) => setPassword({ ...password, current: e.target.value })} />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm text-muted-foreground">New Password</label>
                      <Input type="password" value={password.new} onChange={(e) => setPassword({ ...password, new: e.target.value })} />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm text-muted-foreground">Confirm Password</label>
                      <Input type="password" value={password.confirm} onChange={(e) => setPassword({ ...password, confirm: e.target.value })} />
                    </div>
                  </div>
                  <Button onClick={handleUpdatePassword} disabled={loading}>
                    <Save className="w-4 h-4 mr-1" /> {loading ? "Updating..." : "Update Password"}
                  </Button>
                </div>
                <div className="border-t border-border/50 pt-6">
                  <h3 className="text-sm font-medium mb-4">Two-Factor Authentication</h3>
                  <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                    <div>
                      <p className="text-sm font-medium">2FA is disabled</p>
                      <p className="text-xs text-muted-foreground">Add an extra layer of security to your account</p>
                    </div>
                    <Button variant="outline" onClick={() => addToast({ title: "Coming Soon", message: "2FA setup", type: "info" })}>Enable</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === "notifications" && (
            <Card>
              <CardHeader>
                <CardTitle>Notification Preferences</CardTitle>
                <CardDescription>Choose what notifications you receive</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { label: "Email notifications", description: "Receive email updates about your account activity", key: "email" },
                  { label: "Push notifications", description: "Receive push notifications in your browser", key: "push" },
                  { label: "Marketing emails", description: "Receive emails about new features and updates", key: "marketing" },
                  { label: "Security alerts", description: "Get notified about security events", key: "security" },
                ].map((item) => (
                  <div key={item.key} className="flex items-center justify-between p-4 rounded-lg border border-border/50">
                    <div>
                      <p className="text-sm font-medium">{item.label}</p>
                      <p className="text-xs text-muted-foreground">{item.description}</p>
                    </div>
                    <button
                      className="w-11 h-6 rounded-full bg-primary relative cursor-pointer"
                      onClick={() => addToast({ title: "Updated", message: `${item.label} toggled`, type: "success" })}
                    >
                      <div className="absolute right-0.5 top-0.5 w-5 h-5 rounded-full bg-white transition-transform" />
                    </button>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {activeTab === "appearance" && (
            <Card>
              <CardHeader>
                <CardTitle>Appearance</CardTitle>
                <CardDescription>Customize the look and feel</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="text-sm font-medium mb-4">Theme</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      onClick={() => { if (theme === "dark") toggleTheme(); addToast({ title: "Theme Changed", message: "Light mode", type: "success" }); }}
                      className={`p-4 rounded-xl border-2 transition-all ${theme === "light" ? "border-primary" : "border-border"}`}
                    >
                      <div className="w-full h-24 rounded-lg bg-white border mb-3 flex items-center justify-center">
                        <Sun className="w-8 h-8 text-amber-500" />
                      </div>
                      <p className="text-sm font-medium text-center">Light</p>
                    </button>
                    <button
                      onClick={() => { if (theme === "light") toggleTheme(); addToast({ title: "Theme Changed", message: "Dark mode", type: "success" }); }}
                      className={`p-4 rounded-xl border-2 transition-all ${theme === "dark" ? "border-primary" : "border-border"}`}
                    >
                      <div className="w-full h-24 rounded-lg bg-gray-900 border border-gray-700 mb-3 flex items-center justify-center">
                        <Moon className="w-8 h-8 text-blue-400" />
                      </div>
                      <p className="text-sm font-medium text-center">Dark</p>
                    </button>
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-medium mb-4">Accent Color</h3>
                  <div className="flex gap-3">
                    {["#3b82f6", "#8b5cf6", "#06b6d4", "#10b981", "#f59e0b", "#ef4444"].map((color) => (
                      <button
                        key={color}
                        className="w-8 h-8 rounded-full border-2 border-transparent hover:border-foreground transition-all"
                        style={{ backgroundColor: color }}
                        onClick={() => addToast({ title: "Color Changed", message: "Accent color updated", type: "success" })}
                      />
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === "billing" && (
            <Card>
              <CardHeader>
                <CardTitle>Billing & Subscription</CardTitle>
                <CardDescription>Manage your plan and subscription</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Current Plan */}
                <div className="p-4 rounded-xl border border-border/50 bg-muted/30">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center">
                        <Crown className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="font-semibold">{billingFeatures.name || billingPlan} Plan</p>
                        <p className="text-sm text-muted-foreground">
                          {billingPlan === "FREE" ? "Free forever" : `$${billingFeatures.price || 0}/month`}
                        </p>
                      </div>
                    </div>
                    {billingPlan !== "FREE" && (
                      <Button variant="outline" size="sm" onClick={async () => {
                        try {
                          const data = await billingAPI.portal();
                          if (data.url) window.open(data.url, "_blank");
                        } catch (e: any) {
                          addToast({ title: "Error", message: e.message, type: "error" });
                        }
                      }}>Manage Subscription</Button>
                    )}
                  </div>
                </div>

                {/* Plan Features */}
                {billingFeatures && (
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-500" />
                      <span>{billingFeatures.maxUsers === -1 ? "Unlimited" : billingFeatures.maxUsers} users</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-500" />
                      <span>{billingFeatures.maxProducts === -1 ? "Unlimited" : billingFeatures.maxProducts} products</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-500" />
                      <span>{billingFeatures.maxCustomers === -1 ? "Unlimited" : billingFeatures.maxCustomers} customers</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {billingFeatures.aiAssistant ? <Check className="w-4 h-4 text-emerald-500" /> : <span className="w-4 h-4 text-muted-foreground">-</span>}
                      <span>AI Assistant</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {billingFeatures.googleSheets ? <Check className="w-4 h-4 text-emerald-500" /> : <span className="w-4 h-4 text-muted-foreground">-</span>}
                      <span>Google Sheets</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {billingFeatures.prioritySupport ? <Check className="w-4 h-4 text-emerald-500" /> : <span className="w-4 h-4 text-muted-foreground">-</span>}
                      <span>Priority Support</span>
                    </div>
                  </div>
                )}

                {/* Available Plans */}
                <div>
                  <h3 className="text-sm font-medium mb-4">Available Plans</h3>
                  <div className="grid md:grid-cols-3 gap-4">
                    {[
                      { id: "FREE", name: "Free", price: 0, desc: "Get started", features: ["3 users", "50 products", "100 customers"] },
                      { id: "PRO", name: "Pro", price: 29, desc: "For growing teams", features: ["25 users", "1,000 products", "AI Assistant", "Google Sheets"] },
                      { id: "ENTERPRISE", name: "Enterprise", price: 99, desc: "Unlimited power", features: ["Unlimited everything", "AI Assistant", "Google Sheets", "Priority Support"] },
                    ].map((plan) => (
                      <div key={plan.id} className={`p-5 rounded-xl border transition-all ${billingPlan === plan.id ? "border-primary bg-primary/5 shadow-md" : "border-border/50 hover:border-border"}`}>
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <h4 className="font-semibold">{plan.name}</h4>
                            <p className="text-xs text-muted-foreground">{plan.desc}</p>
                          </div>
                          {billingPlan === plan.id && <Badge variant="default">Current</Badge>}
                        </div>
                        <p className="text-2xl font-bold mb-4">
                          ${plan.price}<span className="text-sm font-normal text-muted-foreground">/mo</span>
                        </p>
                        <ul className="space-y-2 mb-4">
                          {plan.features.map((f) => (
                            <li key={f} className="flex items-center gap-2 text-sm">
                              <Check className="w-3 h-3 text-emerald-500" /> {f}
                            </li>
                          ))}
                        </ul>
                        {billingPlan !== plan.id && (
                          <Button
                            className="w-full"
                            variant={plan.id === "FREE" ? "outline" : "default"}
                            size="sm"
                            disabled={billingLoading}
                            onClick={async () => {
                              if (plan.id === "FREE") {
                                addToast({ title: "Info", message: "Contact support to downgrade", type: "info" });
                                return;
                              }
                              setBillingLoading(true);
                              try {
                                const data = await billingAPI.checkout(plan.id);
                                if (data.url) {
                                  window.open(data.url, "_blank");
                                } else {
                                  addToast({ title: "Error", message: "PayMongo not configured yet. Add PAYMONGO_SECRET_KEY to .env", type: "error" });
                                }
                              } catch (e: any) {
                                addToast({ title: "Error", message: e.message, type: "error" });
                              } finally {
                                setBillingLoading(false);
                              }
                            }}
                          >
                            {plan.id === "FREE" ? "Current Plan" : `Upgrade to ${plan.name}`}
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* PayMongo Setup Notice */}
                <div className="p-4 rounded-xl border border-dashed border-border/50 text-sm text-muted-foreground">
                  <p className="font-medium text-foreground mb-1">PayMongo Setup Required</p>
                  <p>To enable payments (GCash, PayMaya, GrabPay, Cards, Bank Transfer), add these to your <code className="text-xs bg-muted px-1 rounded">.env</code>:</p>
                  <ul className="mt-2 space-y-1 text-xs font-mono">
                    <li>PAYMONGO_SECRET_KEY=sk_...</li>
                    <li>PAYMONGO_PUBLIC_KEY=pk_...</li>
                    <li>PAYMONGO_WEBHOOK_SECRET=whsec_...</li>
                    <li>NEXT_PUBLIC_APP_URL=https://yourdomain.com</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === "sheets" && (
            <Card>
              <CardHeader>
                <CardTitle>Google Sheets Integration</CardTitle>
                <CardDescription>Connect your Google account to export and import data between your ERP and Google Sheets</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Connection Status */}
                <div className="flex items-center justify-between p-4 rounded-xl border border-border/50 bg-muted/30">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${sheetsConnected ? "bg-emerald-500" : "bg-gray-400"}`} />
                    <div>
                      <p className="text-sm font-medium">{sheetsConnected ? "Connected to Google Sheets" : "Not Connected"}</p>
                      <p className="text-xs text-muted-foreground">
                        {sheetsConnected ? "You can export and import data" : "Connect your Google account to start syncing"}
                      </p>
                    </div>
                  </div>
                  {sheetsConnected ? (
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={async () => {
                        await settingsAPI.googleDisconnect();
                        setSheetsConnected(false);
                        addToast({ title: "Disconnected", message: "Google Sheets disconnected", type: "success" });
                      }}>
                        <Unlink className="w-4 h-4 mr-1" /> Disconnect
                      </Button>
                    </div>
                  ) : (
                    <Button size="sm" onClick={async () => {
                      try {
                        const data = await settingsAPI.googleAuth();
                        if (data.url) {
                          window.open(data.url, "_blank", "width=600,height=700");
                          addToast({ title: "Authorization", message: "Complete the Google login in the popup window", type: "info" });
                        } else {
                          addToast({ title: "Error", message: data.error || "Failed to start auth flow", type: "error" });
                        }
                      } catch (e: any) {
                        addToast({ title: "Error", message: e.message, type: "error" });
                      }
                    }}>
                      <ExternalLink className="w-4 h-4 mr-1" /> Connect Google
                    </Button>
                  )}
                </div>

                {/* Setup Instructions */}
                {!sheetsConnected && (
                  <div className="p-4 rounded-xl border border-dashed border-border/50 space-y-3">
                    <h3 className="text-sm font-medium">Setup Instructions</h3>
                    <ol className="text-sm text-muted-foreground space-y-2 list-decimal list-inside">
                      <li>Go to <a href="https://console.cloud.google.com" target="_blank" rel="noreferrer" className="text-primary underline">Google Cloud Console</a></li>
                      <li>Create a project and enable the <strong>Google Sheets API</strong></li>
                      <li>Create OAuth 2.0 credentials (Web application type)</li>
                      <li>Add <code className="text-xs bg-muted px-1 rounded">http://localhost:3001/api/settings/google/callback</code> as an authorized redirect URI</li>
                      <li>Add your Client ID and Secret to <code className="text-xs bg-muted px-1 rounded">.env</code> as <code className="text-xs bg-muted px-1 rounded">GOOGLE_CLIENT_ID</code> and <code className="text-xs bg-muted px-1 rounded">GOOGLE_CLIENT_SECRET</code></li>
                      <li>Click "Connect Google" above</li>
                    </ol>
                  </div>
                )}

                {/* Export / Import */}
                {sheetsConnected && (
                  <div className="space-y-4">
                    <div className="grid md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Module</label>
                        <select
                          className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                          value={syncModule}
                          onChange={(e) => setSyncModule(e.target.value)}
                        >
                          <option value="products">Products</option>
                          <option value="customers">Customers</option>
                          <option value="employees">Employees</option>
                          <option value="suppliers">Suppliers</option>
                          <option value="expenses">Expenses</option>
                          <option value="orders">Orders</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Spreadsheet ID (optional for export)</label>
                        <Input
                          placeholder="Leave empty to create new"
                          value={syncSpreadsheetId}
                          onChange={(e) => setSyncSpreadsheetId(e.target.value)}
                        />
                      </div>
                      <div className="flex items-end gap-2">
                        <Button
                          className="flex-1"
                          onClick={async () => {
                            setSheetsLoading(true);
                            setSyncResult(null);
                            try {
                              const data = await settingsAPI.googleSync({
                                action: "export",
                                module: syncModule,
                                spreadsheetId: syncSpreadsheetId || undefined,
                              });
                              if (data.success) {
                                setSyncResult(data);
                                setSyncSpreadsheetId(data.spreadsheetId);
                                addToast({ title: "Export Complete", message: `${data.rowsExported} rows exported to Google Sheets`, type: "success" });
                              } else {
                                addToast({ title: "Export Failed", message: data.error, type: "error" });
                              }
                            } catch (e: any) {
                              addToast({ title: "Error", message: e.message, type: "error" });
                            } finally {
                              setSheetsLoading(false);
                            }
                          }}
                          disabled={sheetsLoading}
                        >
                          {sheetsLoading ? <RefreshCw className="w-4 h-4 mr-1 animate-spin" /> : <Upload className="w-4 h-4 mr-1" />}
                          Export to Sheets
                        </Button>
                        <Button
                          variant="outline"
                          className="flex-1"
                          onClick={async () => {
                            if (!syncSpreadsheetId) {
                              addToast({ title: "Missing ID", message: "Enter a Spreadsheet ID to import from", type: "warning" });
                              return;
                            }
                            setSheetsLoading(true);
                            setSyncResult(null);
                            try {
                              const data = await settingsAPI.googleSync({
                                action: "import",
                                module: syncModule,
                                spreadsheetId: syncSpreadsheetId,
                              });
                              if (data.success) {
                                setSyncResult(data);
                                addToast({ title: "Import Complete", message: `${data.rowsImported} rows imported from Google Sheets`, type: "success" });
                              } else {
                                addToast({ title: "Import Failed", message: data.error, type: "error" });
                              }
                            } catch (e: any) {
                              addToast({ title: "Error", message: e.message, type: "error" });
                            } finally {
                              setSheetsLoading(false);
                            }
                          }}
                          disabled={sheetsLoading}
                        >
                          {sheetsLoading ? <RefreshCw className="w-4 h-4 mr-1 animate-spin" /> : <Download className="w-4 h-4 mr-1" />}
                          Import from Sheets
                        </Button>
                      </div>
                    </div>

                    {/* Sync Result */}
                    {syncResult && (
                      <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
                              {syncResult.action === "export" ? "Export Successful" : "Import Successful"}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {syncResult.action === "export"
                                ? `${syncResult.rowsExported} rows exported to ${syncModule}`
                                : `${syncResult.rowsImported} rows imported from ${syncModule}`
                              }
                            </p>
                          </div>
                          {syncResult.url && (
                            <Button variant="outline" size="sm" onClick={() => window.open(syncResult.url, "_blank")}>
                              <ExternalLink className="w-4 h-4 mr-1" /> Open Sheet
                            </Button>
                          )}
                        </div>
                        {syncResult.spreadsheetId && (
                          <p className="text-xs text-muted-foreground mt-2">
                            Spreadsheet ID: <code className="bg-muted px-1 rounded">{syncResult.spreadsheetId}</code> — save this for future syncs
                          </p>
                        )}
                      </div>
                    )}

                    {/* Module Info */}
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { key: "products", label: "Products", desc: "Name, SKU, price, stock" },
                        { key: "customers", label: "Customers", desc: "Name, email, phone, status" },
                        { key: "employees", label: "Employees", desc: "Name, department, salary" },
                        { key: "suppliers", label: "Suppliers", desc: "Name, email, phone" },
                        { key: "expenses", label: "Expenses", desc: "Category, amount, vendor" },
                        { key: "orders", label: "Orders", desc: "Order #, customer, total" },
                      ].map((mod) => (
                        <button
                          key={mod.key}
                          onClick={() => setSyncModule(mod.key)}
                          className={`p-3 rounded-lg border text-left transition-all ${syncModule === mod.key ? "border-primary bg-primary/5" : "border-border/50 hover:border-border"}`}
                        >
                          <p className="text-sm font-medium">{mod.label}</p>
                          <p className="text-xs text-muted-foreground">{mod.desc}</p>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
