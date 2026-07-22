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
  Users, 
  User, 
  Building, 
  Menu, 
  X 
} from "lucide-react";

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

  // Admin only links (Naye Profile aur Workspace links add kiye)
  const adminLinks = [
    { href: "/settings/team", label: "Team Management", icon: Users },
    { href: "/settings/profile", label: "Profile Settings", icon: User },
    { href: "/settings/workspace", label: "Workspace Settings", icon: Building },
  ];

  const isActive = (path: string) => pathname === path || pathname.startsWith(path + "/");

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="fixed top-4 left-4 z-50 md:hidden bg-zinc-800 p-2 rounded-md text-zinc-400 hover:text-white transition-colors"
      >
        {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar Container */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-zinc-950 border-r border-zinc-800 transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 flex flex-col ${
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Logo / Brand */}
        <div className="flex h-16 items-center border-b border-zinc-800 px-6 flex-shrink-0">
          <h1 className="text-xl font-bold text-white tracking-tight">
            LOOP <span className="text-blue-500">AI</span>
          </h1>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 overflow-y-auto py-6 px-3 space-y-1 custom-scrollbar">
          {/* Common Links */}
          {commonLinks.map((link) => {
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`flex items-center rounded-md px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
                  isActive(link.href)
                    ? "bg-blue-600/10 text-blue-500 border-l-2 border-blue-500"
                    : "text-zinc-400 hover:bg-zinc-900 hover:text-white border-l-2 border-transparent"
                }`}
              >
                <Icon className="mr-3 h-5 w-5 flex-shrink-0" />
                {link.label}
              </Link>
            );
          })}

          {/* Admin Section Divider (Sirf Admin ko dikhega) */}
          {userRole === "ADMIN" && (
            <>
              <div className="my-4 border-t border-zinc-800"></div>
              <p className="px-3 text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">
                Administration
              </p>
              
              {/* Admin Links */}
              {adminLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center rounded-md px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
                      isActive(link.href)
                        ? "bg-blue-600/10 text-blue-500 border-l-2 border-blue-500"
                        : "text-zinc-400 hover:bg-zinc-900 hover:text-white border-l-2 border-transparent"
                    }`}
                  >
                    <Icon className="mr-3 h-5 w-5 flex-shrink-0" />
                    {link.label}
                  </Link>
                );
              })}
            </>
          )}
        </nav>

        {/* User Role Badge at Bottom */}
        <div className="flex-shrink-0 border-t border-zinc-800 p-4 bg-zinc-950">
          <div className="flex items-center space-x-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-600/20 text-sm font-bold text-blue-500 border border-blue-600/30">
              {userName?.charAt(0).toUpperCase() || "U"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="truncate text-sm font-medium text-white">{userName || "User"}</p>
              <p className="truncate text-xs text-zinc-500 capitalize flex items-center gap-1">
                <span className={`h-1.5 w-1.5 rounded-full ${userRole === 'ADMIN' ? 'bg-green-500' : 'bg-zinc-500'}`}></span>
                {userRole.toLowerCase()}
              </p>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/60 backdrop-blur-sm md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </>
  );
}