"use client";

import { signOut } from "next-auth/react";
import { LogOut } from "lucide-react";

interface NavbarProps {
  userName: string | null;
  userEmail: string | null;
}

export default function Navbar({ userName, userEmail }: NavbarProps) {
  return (
    <header className="flex h-16 items-center justify-between border-b border-zinc-800 bg-zinc-900/50 px-6 backdrop-blur-sm">
      <div>
        <h2 className="text-lg font-semibold text-white">Welcome back, {userName}</h2>
        <p className="text-xs text-zinc-500">{userEmail}</p>
      </div>

      <button
        onClick={() => signOut({ callbackUrl: "/login" })}
        className="flex items-center space-x-2 rounded-md border border-zinc-800 bg-zinc-900 px-4 py-2 text-sm font-medium text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-white"
      >
        <LogOut className="h-4 w-4" />
        <span>Logout</span>
      </button>
    </header>
  );
}