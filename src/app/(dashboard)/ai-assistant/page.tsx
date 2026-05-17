"use client";

import React, { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Bot, User, Sparkles, TrendingUp, Package, Users, Lightbulb, RefreshCw, ThumbsUp, ThumbsDown, Copy, Check } from "lucide-react";
import { dashboardAPI } from "@/utils/api";
import { useToast } from "@/components/ui/toast";

const quickActions = [
  { label: "📊 Business Summary", message: "Give me a business summary" },
  { label: "💰 Revenue Report", message: "How's our revenue looking?" },
  { label: "💸 Expense Analysis", message: "Show me the expense breakdown" },
  { label: "👥 Team Overview", message: "Tell me about our team" },
  { label: "📦 Inventory Check", message: "What products are low on stock?" },
  { label: "🎯 Sales Pipeline", message: "Show me the sales pipeline" },
  { label: "📋 Task Status", message: "What tasks need attention?" },
  { label: "📈 Profit Analysis", message: "What's our profit margin?" },
];

export default function AIAssistantPage() {
  const { addToast } = useToast();
  const [messages, setMessages] = useState<Array<{
    role: "assistant" | "user";
    content: string;
    timestamp: Date;
    liked?: boolean;
  }>>([
    {
      role: "assistant",
      content: "Hey there! 👋 I'm your AI business assistant, connected live to your dashboard data.\n\nI can help you understand your business numbers, check on your team, analyze expenses, and much more. Just ask me anything in plain English!\n\nTry clicking one of the quick actions below, or just type a question. I'm here to help! 🚀",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [stats, setStats] = useState<any>(null);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchStats();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const fetchStats = async () => {
    try {
      const data = await dashboardAPI.getStats();
      setStats(data);
    } catch (error) {
      console.error("Fetch stats error:", error);
    }
  };

  const simulateTyping = (text: string): Promise<void> => {
    return new Promise((resolve) => {
      const delay = Math.min(text.length * 10, 2000);
      setTimeout(resolve, delay);
    });
  };

  const handleSend = async (message?: string) => {
    const userMessage = message || input.trim();
    if (!userMessage || isTyping) return;

    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: userMessage, timestamp: new Date() }]);
    setIsTyping(true);

    try {
      const response = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMessage }),
      });

      const data = await response.json();

      // Simulate natural typing delay
      await simulateTyping(data.response || "");

      setMessages((prev) => [...prev, {
        role: "assistant",
        content: data.response || "Sorry, I couldn't process that. Could you try rephrasing?",
        timestamp: new Date(),
      }]);
    } catch (error) {
      setMessages((prev) => [...prev, {
        role: "assistant",
        content: "Oops! Something went wrong. Mind trying again? I'm still here! 😊",
        timestamp: new Date(),
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleLike = (index: number) => {
    setMessages((prev) => prev.map((m, i) => i === index ? { ...m, liked: true } : m));
    addToast({ title: "Thanks!", message: "Glad that was helpful!", type: "success" });
  };

  const handleDislike = (index: number) => {
    setMessages((prev) => prev.map((m, i) => i === index ? { ...m, liked: false } : m));
    addToast({ title: "Feedback noted", message: "I'll try to do better next time!", type: "info" });
  };

  const handleCopy = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
    addToast({ title: "Copied!", message: "Message copied to clipboard", type: "success" });
  };

  const handleClearChat = () => {
    setMessages([{
      role: "assistant",
      content: "Chat cleared! How can I help you today? 😊",
      timestamp: new Date(),
    }]);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            AI Assistant
          </h1>
          <p className="text-muted-foreground">Your intelligent business companion - ask me anything!</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => { fetchStats(); addToast({ title: "Refreshed", message: "Data updated", type: "success" }); }}>
            <RefreshCw className="w-4 h-4 mr-1" /> Refresh
          </Button>
          <Button variant="outline" size="sm" onClick={handleClearChat}>Clear Chat</Button>
        </div>
      </div>

      <div className="grid lg:grid-cols-4 gap-6">
        {/* Chat Area */}
        <div className="lg:col-span-3">
          <Card className="h-[calc(100vh-280px)] flex flex-col">
            {/* Messages */}
            <CardContent className="flex-1 overflow-y-auto p-6 space-y-4">
              {messages.map((msg, i) => (
                <div key={i} className={`flex gap-3 ${msg.role === "user" ? "justify-end" : ""}`}>
                  {msg.role === "assistant" && (
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center shrink-0 shadow-md">
                      <Bot className="w-5 h-5 text-white" />
                    </div>
                  )}
                  <div className={`max-w-[80%] ${msg.role === "user" ? "order-1" : ""}`}>
                    <div className={`p-4 rounded-2xl ${
                      msg.role === "user"
                        ? "bg-primary text-primary-foreground rounded-tr-sm"
                        : "bg-muted rounded-tl-sm"
                    }`}>
                      <pre className="text-sm whitespace-pre-wrap font-sans leading-relaxed">{msg.content}</pre>
                    </div>
                    <div className={`flex items-center gap-2 mt-1 ${msg.role === "user" ? "justify-end" : ""}`}>
                      <span className="text-xs text-muted-foreground">
                        {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      {msg.role === "assistant" && (
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleLike(i)}
                            className={`p-1 rounded hover:bg-accent transition-colors ${msg.liked === true ? "text-green-500" : "text-muted-foreground"}`}
                          >
                            <ThumbsUp className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => handleDislike(i)}
                            className={`p-1 rounded hover:bg-accent transition-colors ${msg.liked === false ? "text-red-500" : "text-muted-foreground"}`}
                          >
                            <ThumbsDown className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => handleCopy(msg.content, i)}
                            className="p-1 rounded hover:bg-accent transition-colors text-muted-foreground"
                          >
                            {copiedIndex === i ? <Check className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3" />}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                  {msg.role === "user" && (
                    <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center shrink-0 shadow-md order-2">
                      <User className="w-5 h-5 text-primary-foreground" />
                    </div>
                  )}
                </div>
              ))}
              {isTyping && (
                <div className="flex gap-3">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center shrink-0 shadow-md">
                    <Bot className="w-5 h-5 text-white" />
                  </div>
                  <div className="bg-muted p-4 rounded-2xl rounded-tl-sm">
                    <div className="flex gap-1.5">
                      <div className="w-2.5 h-2.5 rounded-full bg-muted-foreground animate-bounce" />
                      <div className="w-2.5 h-2.5 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: "0.15s" }} />
                      <div className="w-2.5 h-2.5 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: "0.3s" }} />
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </CardContent>

            {/* Quick Actions */}
            <div className="px-4 py-3 border-t border-border/50 overflow-x-auto">
              <div className="flex gap-2 min-w-max">
                {quickActions.map((action) => (
                  <Button
                    key={action.label}
                    variant="outline"
                    size="sm"
                    className="whitespace-nowrap text-xs"
                    onClick={() => handleSend(action.message)}
                    disabled={isTyping}
                  >
                    {action.label}
                  </Button>
                ))}
              </div>
            </div>

            {/* Input */}
            <div className="p-4 border-t border-border/50">
              <div className="flex gap-2">
                <Input
                  placeholder="Ask me anything about your business..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSend()}
                  className="flex-1"
                  disabled={isTyping}
                />
                <Button onClick={() => handleSend()} disabled={!input.trim() || isTyping}>
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Lightbulb className="w-4 h-4 text-amber-500" /> What I Can Do
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="p-3 rounded-lg bg-blue-500/10">
                <p className="font-medium text-blue-500">📊 Analytics</p>
                <p className="text-xs text-muted-foreground mt-1">Revenue, expenses, profits, margins</p>
              </div>
              <div className="p-3 rounded-lg bg-green-500/10">
                <p className="font-medium text-green-500">👥 Team</p>
                <p className="text-xs text-muted-foreground mt-1">Employees, departments, payroll</p>
              </div>
              <div className="p-3 rounded-lg bg-purple-500/10">
                <p className="font-medium text-purple-500">📦 Operations</p>
                <p className="text-xs text-muted-foreground mt-1">Products, inventory, stock levels</p>
              </div>
              <div className="p-3 rounded-lg bg-orange-500/10">
                <p className="font-medium text-orange-500">🎯 Sales</p>
                <p className="text-xs text-muted-foreground mt-1">Deals, pipeline, customers</p>
              </div>
              <div className="p-3 rounded-lg bg-red-500/10">
                <p className="font-medium text-red-500">📋 Projects</p>
                <p className="text-xs text-muted-foreground mt-1">Tasks, deadlines, progress</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Live Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-emerald-500/10">
                <TrendingUp className="w-4 h-4 text-emerald-500" />
                <div>
                  <p className="text-xs font-medium">Revenue</p>
                  <p className="text-sm font-bold">${(stats?.revenue?.current || 0).toLocaleString()}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-blue-500/10">
                <Users className="w-4 h-4 text-blue-500" />
                <div>
                  <p className="text-xs font-medium">Team</p>
                  <p className="text-sm font-bold">{stats?.totalEmployees || 0} members</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-amber-500/10">
                <Package className="w-4 h-4 text-amber-500" />
                <div>
                  <p className="text-xs font-medium">Low Stock</p>
                  <p className="text-sm font-bold">{stats?.lowStockProducts?.length || 0} alerts</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
