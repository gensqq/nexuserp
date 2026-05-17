"use client";

import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Zap,
  BarChart3,
  ArrowRight,
  Check,
  Star,
  Users,
  ShoppingCart,
  Calculator,
  Package,
  Bot,
  ChevronRight,
  FolderKanban,
  Mail,
  FileText,
  Settings,
  Shield,
  Globe,
} from "lucide-react";

const features = [
  { icon: BarChart3, title: "Real-time Analytics", description: "Live dashboards with AI-powered insights and predictive analytics for smarter decisions." },
  { icon: ShoppingCart, title: "POS & Sales", description: "Complete point-of-sale system with barcode support, inventory sync, and receipt printing." },
  { icon: Users, title: "CRM & Pipeline", description: "Manage leads, customers, and deals with visual pipelines and automated follow-ups." },
  { icon: Calculator, title: "Accounting", description: "Full double-entry accounting with journal entries, ledgers, and financial reports." },
  { icon: Package, title: "Inventory Management", description: "Track stock levels, manage suppliers, and automate purchase orders." },
  { icon: Bot, title: "AI Assistant", description: "Natural language search, smart recommendations, and predictive business insights." },
];

const modules = [
  { icon: BarChart3, name: "Dashboard", description: "Real-time business overview" },
  { icon: ShoppingCart, name: "POS System", description: "Point-of-sale with receipt printing" },
  { icon: Users, name: "CRM", description: "Customer relationship management" },
  { icon: Calculator, name: "Accounting", description: "Double-entry bookkeeping" },
  { icon: Users, name: "HR & Payroll", description: "Employee management & payroll" },
  { icon: Package, name: "Inventory", description: "Stock tracking & purchase orders" },
  { icon: FolderKanban, name: "Projects", description: "Task & project management" },
  { icon: Mail, name: "Mailing", description: "Email campaigns & templates" },
  { icon: FileText, name: "Reports", description: "Custom report generation" },
  { icon: Bot, name: "AI Assistant", description: "Smart business insights" },
  { icon: Settings, name: "Settings", description: "Company & integration settings" },
];

const testimonials = [
  { name: "Maria Santos", role: "CEO, RetailPlus PH", content: "NexusERP streamlined our multi-branch operations. The POS and inventory sync is seamless.", rating: 5 },
  { name: "James Lim", role: "CFO, SG Trading", content: "The accounting module handles multi-currency transactions perfectly. Exactly what we needed for ASEAN operations.", rating: 5 },
  { name: "Ana Reyes", role: "Operations Lead, MetroSupply", content: "Best ERP for Philippine businesses. GCash and PayMaya payments built-in, no third-party integrations needed.", rating: 5 },
];

const pricingPlans = [
  { slug: "starter", name: "Starter", price: 29, description: "Perfect for small businesses", features: ["Up to 25 users", "All modules", "1,000 products", "5,000 customers", "AI assistant", "Google Sheets integration"], popular: false },
  { slug: "enterprise", name: "Enterprise", price: 99, description: "For growing organizations", features: ["Unlimited users", "All modules", "Unlimited products", "Unlimited customers", "AI assistant", "Google Sheets integration", "Priority support"], popular: true },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center">
                <Zap className="w-4 h-4 text-white" />
              </div>
              <span className="text-xl font-bold gradient-text">NexusERP</span>
            </Link>
            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Features</a>
              <a href="#pricing" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Pricing</a>
              <a href="#testimonials" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Testimonials</a>
              <Link href="/login"><Button variant="ghost" size="sm">Sign In</Button></Link>
              <Link href="/register"><Button size="sm">Get Started <ArrowRight className="w-4 h-4 ml-1" /></Button></Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-violet-500/5 to-transparent" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-gradient-to-b from-blue-500/20 to-transparent rounded-full blur-3xl" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
              <Zap className="w-4 h-4" /> AI-Powered Business Management
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
              The Future of <span className="gradient-text">Enterprise</span><br />Resource Planning
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
              NexusERP combines powerful business modules with AI intelligence to streamline your operations, boost productivity, and drive growth.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/checkout?plan=starter"><Button size="lg" className="text-base px-8">Start Free Trial <ArrowRight className="w-5 h-5 ml-2" /></Button></Link>
              <Link href="/register"><Button variant="outline" size="lg" className="text-base px-8">Get Started Free <ChevronRight className="w-5 h-5 ml-1" /></Button></Link>
            </div>
            <p className="text-sm text-muted-foreground mt-4">No credit card required · 14-day free trial</p>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Everything Your Business Needs</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">Modular architecture means you can start with what you need and add more as you grow.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature) => (
              <div key={feature.title} className="group p-6 rounded-xl border border-border/50 bg-card hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Modules */}
      <section className="py-24 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">11 Integrated Modules</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">Every tool your business needs in one platform. No more juggling multiple apps.</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {modules.map((mod) => (
              <div key={mod.name} className="flex items-center gap-3 p-4 rounded-xl border border-border/50 bg-card hover:shadow-md transition-all duration-200">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <mod.icon className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-sm">{mod.name}</p>
                  <p className="text-xs text-muted-foreground">{mod.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-24 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Loved by Businesses</h2>
            <p className="text-muted-foreground">See what our customers have to say</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t) => (
              <div key={t.name} className="p-6 rounded-xl border border-border/50 bg-card">
                <div className="flex items-center gap-1 mb-4">
                  {Array.from({ length: t.rating }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-sm text-muted-foreground mb-4">{t.content}</p>
                <div>
                  <p className="font-medium">{t.name}</p>
                  <p className="text-sm text-muted-foreground">{t.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Simple, Transparent Pricing</h2>
            <p className="text-muted-foreground">Choose the plan that fits your business</p>
          </div>
          <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
            {pricingPlans.map((plan) => (
              <div key={plan.name} className={`relative p-6 rounded-xl border ${plan.popular ? "border-primary shadow-lg md:scale-105" : "border-border/50"} bg-card`}>
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-primary text-primary-foreground text-xs font-medium rounded-full">Most Popular</div>
                )}
                <div className="text-center mb-6">
                  <h3 className="text-lg font-semibold">{plan.name}</h3>
                  <p className="text-sm text-muted-foreground mb-4">{plan.description}</p>
                  <div className="flex items-baseline justify-center gap-1">
                    <span className="text-4xl font-bold">${plan.price}</span>
                    <span className="text-muted-foreground">/month</span>
                  </div>
                </div>
                <ul className="space-y-3 mb-6">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm"><Check className="w-4 h-4 text-primary shrink-0" />{f}</li>
                  ))}
                </ul>
                <Link href={`/checkout?plan=${plan.slug}`}><Button className="w-full" variant={plan.popular ? "default" : "outline"}>Get Started</Button></Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-gradient-to-br from-blue-600 to-violet-700">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Ready to Transform Your Business?</h2>
          <p className="text-blue-100 mb-8 max-w-2xl mx-auto">Start streamlining your operations today with NexusERP — no credit card required.</p>
          <Link href="/register"><Button size="lg" variant="secondary" className="text-base px-8">Start Your Free Trial <ArrowRight className="w-5 h-5 ml-2" /></Button></Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <Link href="/" className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center"><Zap className="w-4 h-4 text-white" /></div>
                <span className="text-xl font-bold gradient-text">NexusERP</span>
              </Link>
              <p className="text-sm text-muted-foreground">AI-powered enterprise management platform for modern businesses.</p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#features" className="hover:text-foreground">Features</a></li>
                <li><a href="#pricing" className="hover:text-foreground">Pricing</a></li>
                <li><a href="#" className="hover:text-foreground">Integrations</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground">About</a></li>
                <li><a href="#" className="hover:text-foreground">Blog</a></li>
                <li><a href="#" className="hover:text-foreground">Contact</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/privacy" className="hover:text-foreground">Privacy Policy</Link></li>
                <li><Link href="/terms" className="hover:text-foreground">Terms of Service</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-border/50 mt-8 pt-8 text-center text-sm text-muted-foreground">&copy; {new Date().getFullYear()} NexusERP. All rights reserved.</div>
        </div>
      </footer>
    </div>
  );
}
