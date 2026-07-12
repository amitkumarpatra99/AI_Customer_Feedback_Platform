"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Inbox,
  TrendingUp,
  HelpCircle,
  FileText,
  Settings,
  LogOut,
  User
} from "lucide-react";

const navItems = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Feedback Inbox", href: "/inbox", icon: Inbox },
  { name: "Theme Trends", href: "/trends", icon: TrendingUp },
  { name: "Ask LOOP (Q&A)", href: "/ask", icon: HelpCircle },
  { name: "VoC Reports", href: "/reports", icon: FileText },
  { name: "Settings", href: "/settings", icon: Settings }
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="flex h-screen bg-zinc-950 text-zinc-50 overflow-hidden font-sans">
      {/* Sidebar */}
      <aside className="w-64 border-r border-zinc-800 bg-zinc-900 flex flex-col justify-between">
        <div>
          {/* Logo */}
          <div className="h-16 flex items-center px-6 border-b border-zinc-800">
            <span className="text-xl font-bold tracking-wider text-white flex items-center gap-2">
              <span className="text-blue-500">🔄</span> Project LOOP
            </span>
          </div>

          {/* Navigation Links */}
          <nav className="mt-6 px-4 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-all ${
                    isActive
                      ? "bg-blue-600/10 text-blue-400 border border-blue-600/30"
                      : "text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100 border border-transparent"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* User profile & logout */}
        <div className="p-4 border-t border-zinc-800 space-y-2">
          <div className="flex items-center gap-3 px-3 py-2">
            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold">
              U
            </div>
            <div>
              <p className="text-sm font-medium text-white truncate">Demo User</p>
              <p className="text-xs text-zinc-550 truncate">Workspace Admin</p>
            </div>
          </div>
          <button
            onClick={() => {
              // Sign out logic
              console.log("Signout clicked");
            }}
            className="flex w-full items-center gap-3 px-3 py-2 rounded-md text-sm font-medium text-zinc-400 hover:bg-red-950/20 hover:text-red-400 transition-all"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-y-auto bg-zinc-950">
        <header className="h-16 border-b border-zinc-800 flex items-center justify-between px-8 bg-zinc-900/50">
          <h1 className="text-lg font-semibold text-white">
            {navItems.find((n) => pathname === n.href)?.name || "Project LOOP"}
          </h1>
          <div className="flex items-center gap-4">
            <div className="text-xs px-2.5 py-1 rounded-full bg-zinc-800 border border-zinc-700 text-zinc-350">
              Company Workspace: <span className="font-semibold text-white">Acme Corp</span>
            </div>
          </div>
        </header>
        <div className="p-8 flex-1">
          {children}
        </div>
      </main>
    </div>
  );
}
