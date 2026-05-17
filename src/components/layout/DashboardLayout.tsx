"use client";

import React, { useEffect } from "react";
import { useThemeStore, useSidebarStore } from "@/store";
import { cn } from "@/lib/utils";
import Sidebar from "./Sidebar";
import Header from "./Header";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { theme } = useThemeStore();
  const { isCollapsed } = useSidebarStore();

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  return (
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
  );
}
