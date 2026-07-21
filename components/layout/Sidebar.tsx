"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { 
  LayoutDashboard, 
  Inbox, 
  Sparkles, 
  MessageSquare, 
  FileText, 
  Settings, 
  Users, 
  Menu, 
  X 
} from "lucide-react"; // Note: Install lucide-react if not installed: npm install lucide-react

interface SidebarProps {
  userRole: string;
  userName: string | null;
}

export default function Sidebar({ userRole, userName }: SidebarProps) {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Common links (Sabke liye)
  const commonLinks = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/inbox", label: "Inbox", icon: Inbox },
    { href: "/themes", label: "Themes", icon: Sparkles },
    { href: "/ask", label: "Ask LOOP", icon: MessageSquare },
    { href: "/reports", label: "Reports", icon: FileText },
  ];

  // Admin only links
  const adminLinks = [
    { href: "/settings", label: "Settings", icon: Settings },
    { href: "/settings/team", label: "Team Management", icon: Users },
  ];

  // Role ke hisaab se final links decide karo
  const links = userRole === "ADMIN" ? [...commonLinks, ...adminLinks] : commonLinks;

  const isActive = (path: string) => pathname === path || pathname.startsWith(path + "/");

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="fixed top-4 left-4 z-50 md:hidden bg-zinc-800 p-2 rounded-md text-zinc-400 hover:text-white"
      >
        {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar Container */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-zinc-950/70 backdrop-blur-2xl border-r border-white/10 transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 ${
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Logo / Brand */}
        <div className="flex h-16 items-center border-b border-white/10 px-6">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white font-black text-sm shadow-[0_0_15px_rgba(59,130,246,0.5)]">
              🔄
            </div>
            <h1 className="text-xl font-bold text-white tracking-tight">
              LOOP <span className="bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">AI</span>
            </h1>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="mt-6 space-y-1.5 px-3">
          {links.map((link) => {
            const Icon = link.icon;
            const active = isActive(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`flex items-center rounded-xl px-3.5 py-2.5 text-sm font-medium transition-all duration-200 ${
                  active
                    ? "bg-gradient-to-r from-blue-600/25 to-indigo-600/15 text-blue-400 border border-blue-500/30 shadow-[0_4px_20px_rgba(59,130,246,0.15)]"
                    : "text-zinc-400 hover:bg-white/[0.06] hover:text-white border border-transparent"
                }`}
              >
                <Icon className={`mr-3 h-5 w-5 flex-shrink-0 transition-colors ${active ? "text-blue-400" : "text-zinc-400"}`} />
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* User Role Badge at Bottom */}
        <div className="absolute bottom-0 left-0 right-0 border-t border-white/10 p-4 bg-zinc-900/40 backdrop-blur-md">
          <div className="flex items-center space-x-3 rounded-xl p-2 bg-white/[0.03] border border-white/5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-tr from-blue-600 to-violet-600 text-xs font-bold text-white shadow-inner">
              {userName?.charAt(0).toUpperCase() || "U"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="truncate text-sm font-semibold text-white">{userName}</p>
              <p className="truncate text-xs text-blue-400/80 capitalize font-medium">{userRole.toLowerCase()}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </>
  );
}