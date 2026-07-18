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
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-zinc-900 border-r border-zinc-800 transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 ${
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Logo / Brand */}
        <div className="flex h-16 items-center border-b border-zinc-800 px-6">
          <h1 className="text-xl font-bold text-white tracking-tight">
            LOOP <span className="text-blue-500">AI</span>
          </h1>
        </div>

        {/* Navigation Links */}
        <nav className="mt-6 space-y-1 px-3">
          {links.map((link) => {
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`flex items-center rounded-md px-3 py-2.5 text-sm font-medium transition-colors ${
                  isActive(link.href)
                    ? "bg-blue-600/10 text-blue-500"
                    : "text-zinc-400 hover:bg-zinc-800 hover:text-white"
                }`}
              >
                <Icon className="mr-3 h-5 w-5 flex-shrink-0" />
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* User Role Badge at Bottom */}
        <div className="absolute bottom-0 left-0 right-0 border-t border-zinc-800 p-4">
          <div className="flex items-center space-x-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-800 text-xs font-bold text-white">
              {userName?.charAt(0).toUpperCase() || "U"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="truncate text-sm font-medium text-white">{userName}</p>
              <p className="truncate text-xs text-zinc-500 capitalize">{userRole.toLowerCase()}</p>
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