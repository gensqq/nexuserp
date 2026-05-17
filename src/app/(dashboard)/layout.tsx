"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useThemeStore, useSidebarStore, useAuthStore } from "@/store";
import { cn } from "@/lib/utils";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import { ToastProvider } from "@/components/ui/toast";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { theme } = useThemeStore();
  const { isCollapsed } = useSidebarStore();
  const { isAuthenticated, login } = useAuthStore();
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  // Redirect on logout
  useEffect(() => {
    if (!isAuthenticated && !loading) {
      router.push("/login");
    }
  }, [isAuthenticated, loading]);

  // Check auth on mount
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      fetch("/api/auth/me", {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.user) {
            login(data.user, token);
          } else {
            localStorage.removeItem("token");
            router.push("/login");
          }
        })
        .catch(() => {
          localStorage.removeItem("token");
          router.push("/login");
        })
        .finally(() => setLoading(false));
    } else {
      router.push("/login");
      setLoading(false);
    }
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <ToastProvider>
      <div className={cn("min-h-screen bg-background", theme)}>
        <Sidebar />
        <div
          className={cn(
            "transition-all duration-300",
            isCollapsed ? "lg:pl-[72px]" : "lg:pl-[260px]"
          )}
        >
          <Header />
          <main className="p-4 lg:p-6">{children}</main>
        </div>
      </div>
    </ToastProvider>
  );
}
