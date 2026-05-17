"use client";

import React, { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Zap,
  Check,
  ArrowLeft,
  Shield,
  CreditCard,
  Smartphone,
  Building2,
  Loader2,
} from "lucide-react";

const plans: Record<string, { name: string; price: number; description: string; features: string[] }> = {
  starter: {
    name: "Starter",
    price: 29,
    description: "Perfect for small businesses",
    features: ["Up to 5 users", "Basic modules", "5GB storage", "Email support"],
  },
  professional: {
    name: "Professional",
    price: 79,
    description: "For growing businesses",
    features: ["Up to 25 users", "All modules", "50GB storage", "Priority support", "AI features"],
  },
  enterprise: {
    name: "Enterprise",
    price: 199,
    description: "For large organizations",
    features: ["Unlimited users", "All modules", "Unlimited storage", "24/7 support", "AI features", "Custom integrations"],
  },
};

const paymentMethods = [
  { icon: Smartphone, name: "GCash", color: "text-blue-500" },
  { icon: Smartphone, name: "PayMaya", color: "text-green-500" },
  { icon: Smartphone, name: "GrabPay", color: "text-emerald-500" },
  { icon: CreditCard, name: "Credit/Debit Card", color: "text-violet-500" },
  { icon: Building2, name: "Bank Transfer", color: "text-orange-500" },
];

function CheckoutForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const planSlug = searchParams.get("plan") || "professional";
  const plan = plans[planSlug] || plans.professional;
  const cancelled = searchParams.get("cancelled");

  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");

  async function handleContinue() {
    setProcessing(true);
    setError("");

    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/billing/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ plan: planSlug.toUpperCase() }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to create checkout session");
        setProcessing(false);
        return;
      }

      if (data.url) {
        window.location.href = data.url;
      } else {
        setError("No checkout URL returned. Please try again.");
        setProcessing(false);
      }
    } catch (e) {
      setError("Network error. Please try again.");
      setProcessing(false);
    }
  }

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left: Plan Summary */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-600 to-violet-700 p-12 flex-col justify-between">
        <div>
          <Link href="/" className="flex items-center gap-2 mb-12">
            <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <span className="text-xl font-bold text-white">ADN&apos;s Tech</span>
          </Link>

          <h1 className="text-3xl font-bold text-white mb-2">Complete your order</h1>
          <p className="text-blue-100 mb-8">You&apos;re one step away from transforming your business.</p>

          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-white">{plan.name} Plan</h2>
              <span className="text-2xl font-bold text-white">${plan.price}<span className="text-sm font-normal text-blue-200">/mo</span></span>
            </div>
            <p className="text-sm text-blue-200 mb-4">{plan.description}</p>
            <ul className="space-y-2">
              {plan.features.map((f) => (
                <li key={f} className="flex items-center gap-2 text-sm text-blue-100">
                  <Check className="w-4 h-4 text-green-300 shrink-0" />
                  {f}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="flex items-center gap-2 text-sm text-blue-200">
          <Shield className="w-4 h-4" />
          <span>14-day free trial · Cancel anytime · No setup fees</span>
        </div>
      </div>

      {/* Right: Payment Method Selection */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <Link href="/#pricing" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Back to pricing
          </Link>

          {/* Mobile plan summary */}
          <div className="lg:hidden mb-8 p-4 rounded-xl border border-border/50 bg-muted/30">
            <div className="flex items-center justify-between">
              <span className="font-medium">{plan.name} Plan</span>
              <span className="font-bold">${plan.price}/mo</span>
            </div>
          </div>

          {cancelled && (
            <div className="mb-6 p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20 text-sm text-yellow-600">
              Payment was cancelled. You can try again below.
            </div>
          )}

          <h2 className="text-2xl font-bold mb-1">Choose Payment Method</h2>
          <p className="text-sm text-muted-foreground mb-6">Select how you&apos;d like to pay. All payments are processed securely.</p>

          {/* Payment Methods Preview */}
          <div className="mb-6 p-4 rounded-xl border border-border/50 bg-muted/30">
            <p className="text-xs font-medium text-muted-foreground mb-3 uppercase tracking-wide">Supported Payment Methods</p>
            <div className="flex flex-wrap gap-3">
              {paymentMethods.map((method) => (
                <div key={method.name} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-background border border-border/50">
                  <method.icon className={`w-4 h-4 ${method.color}`} />
                  <span className="text-sm font-medium">{method.name}</span>
                </div>
              ))}
            </div>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-sm text-destructive">
              {error}
            </div>
          )}

          <Button
            onClick={handleContinue}
            className="w-full h-12 text-base"
            disabled={processing}
          >
            {processing ? (
              <span className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                Creating checkout...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <CreditCard className="w-4 h-4" />
                Continue to Payment — ${plan.price}/mo
              </span>
            )}
          </Button>

          <p className="text-xs text-center text-muted-foreground mt-3">
            You&apos;ll be redirected to PayMongo to complete your payment securely.
          </p>

          <div className="mt-8 pt-6 border-t border-border/50">
            <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1"><Shield className="w-3 h-3" /> Secured by PayMongo</span>
              <span className="flex items-center gap-1"><CreditCard className="w-3 h-3" /> PCI Compliant</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    }>
      <CheckoutForm />
    </Suspense>
  );
}
