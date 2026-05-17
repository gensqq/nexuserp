"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useThemeStore, useSidebarStore, useNotificationStore, useAuthStore } from "@/store";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Sun,
  Moon,
  Menu,
  Search,
  Bell,
  X,
  Check,
  MessageSquare,
  AlertTriangle,
  Info,
  CheckCircle,
  Package,
  Users,
  ShoppingCart,
  User,
  FolderKanban,
} from "lucide-react";
import { searchAPI } from "@/utils/api";

const typeIcons: Record<string, React.ReactNode> = {
  product: <Package className="w-4 h-4 text-blue-500" />,
  customer: <Users className="w-4 h-4 text-emerald-500" />,
  order: <ShoppingCart className="w-4 h-4 text-violet-500" />,
  employee: <User className="w-4 h-4 text-amber-500" />,
  project: <FolderKanban className="w-4 h-4 text-pink-500" />,
};

export default function Header() {
  const { theme, toggleTheme } = useThemeStore();
  const { setMobileOpen } = useSidebarStore();
  const { notifications, markAsRead, markAllAsRead, unreadCount } = useNotificationStore();
  const { user } = useAuthStore();
  const router = useRouter();
  const [showNotifications, setShowNotifications] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [showSearch, setShowSearch] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<NodeJS.Timeout>(undefined);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setShowSearch(false);
      return;
    }

    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      setSearchLoading(true);
      try {
        const data = await searchAPI.search(searchQuery);
        setSearchResults(data.results || []);
        setShowSearch(true);
      } catch {
        setSearchResults([]);
      } finally {
        setSearchLoading(false);
      }
    }, 300);

    return () => clearTimeout(debounceRef.current);
  }, [searchQuery]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowSearch(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleResultClick = (href: string) => {
    setShowSearch(false);
    setSearchQuery("");
    router.push(href);
  };

  const notifIcon = (type: string) => {
    switch (type) {
      case "success": return <CheckCircle className="w-4 h-4 text-emerald-500" />;
      case "warning": return <AlertTriangle className="w-4 h-4 text-amber-500" />;
      case "error": return <X className="w-4 h-4 text-red-500" />;
      default: return <Info className="w-4 h-4 text-blue-500" />;
    }
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border/50 bg-card/95 backdrop-blur-xl px-4 lg:px-6">
      {/* Left section */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden"
          onClick={() => setMobileOpen(true)}
        >
          <Menu className="w-5 h-5" />
        </Button>

        {/* Search */}
        <div className="relative hidden md:block" ref={searchRef}>
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search anything..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => searchResults.length > 0 && setShowSearch(true)}
            className="w-[300px] pl-9 bg-muted/50 border-0 focus-visible:ring-1"
          />
          <kbd className="absolute right-3 top-1/2 -translate-y-1/2 hidden sm:inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
            <span className="text-xs">&#8984;</span>K
          </kbd>

          {/* Search dropdown */}
          {showSearch && (
            <div className="absolute top-full left-0 mt-1 w-[380px] bg-card border border-border/50 rounded-xl shadow-xl z-50 overflow-hidden">
              {searchLoading ? (
                <div className="p-4 text-center text-muted-foreground text-sm">Searching...</div>
              ) : searchResults.length === 0 ? (
                <div className="p-4 text-center text-muted-foreground text-sm">No results found</div>
              ) : (
                <div className="max-h-[400px] overflow-y-auto">
                  {searchResults.map((result) => (
                    <button
                      key={`${result.type}-${result.id}`}
                      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-accent/50 transition-colors text-left"
                      onClick={() => handleResultClick(result.href)}
                    >
                      <div className="shrink-0">{typeIcons[result.type] || <Info className="w-4 h-4" />}</div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{result.title}</p>
                        <p className="text-xs text-muted-foreground truncate">{result.subtitle}</p>
                      </div>
                      <span className="text-[10px] text-muted-foreground uppercase bg-muted px-1.5 py-0.5 rounded">{result.type}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Right section */}
      <div className="flex items-center gap-2">
        {/* Theme toggle */}
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleTheme}
          className="text-muted-foreground"
        >
          {theme === "dark" ? (
            <Sun className="w-5 h-5" />
          ) : (
            <Moon className="w-5 h-5" />
          )}
        </Button>

        {/* Notifications */}
        <div className="relative">
          <Button
            variant="ghost"
            size="icon"
            className="text-muted-foreground relative"
            onClick={() => setShowNotifications(!showNotifications)}
          >
            <Bell className="w-5 h-5" />
            {unreadCount() > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                {unreadCount()}
              </span>
            )}
          </Button>

          {/* Notification dropdown */}
          {showNotifications && (
            <>
              <div
                className="fixed inset-0 z-40 pointer-events-none"
                onClick={() => setShowNotifications(false)}
              />
              <div className="absolute right-0 top-full mt-2 w-[380px] bg-card border border-border/50 rounded-xl shadow-xl z-50 overflow-hidden pointer-events-auto">
                <div className="flex items-center justify-between p-4 border-b border-border/50">
                  <h3 className="font-semibold">Notifications</h3>
                  <button
                    onClick={markAllAsRead}
                    className="text-xs text-primary hover:underline"
                  >
                    Mark all read
                  </button>
                </div>
                <div className="max-h-[400px] overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="p-8 text-center text-muted-foreground">
                      <Bell className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <p>No notifications</p>
                    </div>
                  ) : (
                    notifications.map((notif) => (
                      <div
                        key={notif.id}
                        className={cn(
                          "flex items-start gap-3 p-4 border-b border-border/50 last:border-0 hover:bg-accent/50 transition-colors cursor-pointer",
                          !notif.read && "bg-primary/5"
                        )}
                        onClick={() => markAsRead(notif.id)}
                      >
                        <div className="mt-0.5">{notifIcon(notif.type)}</div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium">{notif.title}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">{notif.message}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {new Date(notif.createdAt).toLocaleTimeString()}
                          </p>
                        </div>
                        {!notif.read && (
                          <div className="w-2 h-2 rounded-full bg-primary mt-2 shrink-0" />
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            </>
          )}
        </div>

        {/* User avatar */}
        <Avatar className="h-8 w-8 cursor-pointer">
          {user?.avatar ? (
            <img src={user.avatar} alt="Avatar" className="h-full w-full object-cover rounded-full" />
          ) : (
            <AvatarFallback className="bg-gradient-to-br from-blue-500 to-violet-600 text-white text-xs">
              {user?.name?.charAt(0) || "U"}
            </AvatarFallback>
          )}
        </Avatar>
      </div>
    </header>
  );
}
