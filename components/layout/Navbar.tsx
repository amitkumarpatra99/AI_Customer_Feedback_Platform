"use client";

import { signOut } from "next-auth/react";
import { LogOut } from "lucide-react";

interface NavbarProps {
  userName: string | null;
  userEmail: string | null;
}

export default function Navbar({ userName, userEmail }: NavbarProps) {
  return (
    <header className="flex h-16 items-center justify-between border-b border-white/10 bg-zinc-950/40 px-6 backdrop-blur-xl sticky top-0 z-30">
      <div>
        <h2 className="text-base font-semibold text-white tracking-wide">
          Welcome back, <span className="bg-gradient-to-r from-blue-400 to-indigo-300 bg-clip-text text-transparent">{userName}</span>
        </h2>
        <p className="text-xs text-zinc-400 font-mono">{userEmail}</p>
      </div>

      <button
        onClick={() => signOut({ callbackUrl: "/login" })}
        className="glass-button-secondary flex items-center space-x-2 rounded-xl px-4 py-2 text-xs font-semibold shadow-sm hover:border-red-500/30 hover:text-red-400 transition-all"
      >
        <LogOut className="h-3.5 w-3.5" />
        <span>Logout</span>
      </button>
    </header>
  );
}