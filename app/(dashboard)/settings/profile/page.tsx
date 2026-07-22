"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { Save, Loader2, User } from "lucide-react";

export default function ProfileSettingsPage() {
  const { data: session, update } = useSession();
  const [name, setName] = useState(session?.user?.name || "");
  const [newPassword, setNewPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await fetch("/api/settings/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, newPassword: newPassword || undefined }),
      });

      if (res.ok) {
        toast.success("Profile updated successfully!");
        setNewPassword(""); // Clear password field after success
        await update(); // Update NextAuth session
      } else {
        toast.error("Failed to update profile.");
      }
    } catch (error) {
      toast.error("Network error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Profile Settings</h1>
        <p className="text-sm text-zinc-400">Manage your personal account information.</p>
      </div>

      <form onSubmit={handleSubmit} className="rounded-lg border border-zinc-800 bg-zinc-900 p-6 space-y-6">
        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-1">Full Name</label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-md border border-zinc-800 bg-zinc-950 py-2 pl-10 pr-4 text-sm text-zinc-100 focus:border-blue-500 focus:outline-none"
              placeholder="Your name"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-1">Email Address</label>
          <input
            type="email"
            value={session?.user?.email || ""}
            disabled
            className="w-full rounded-md border border-zinc-800 bg-zinc-950/50 py-2 px-4 text-sm text-zinc-500 cursor-not-allowed"
          />
          <p className="mt-1 text-xs text-zinc-500">Email cannot be changed.</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-1">New Password (Leave blank to keep current)</label>
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="w-full rounded-md border border-zinc-800 bg-zinc-950 py-2 px-4 text-sm text-zinc-100 focus:border-blue-500 focus:outline-none"
            placeholder="••••••••"
          />
        </div>

        <div className="flex justify-end pt-4 border-t border-zinc-800">
          <button
            type="submit"
            disabled={isLoading}
            className="flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Save Changes
          </button>
        </div>
      </form>
    </div>
  );
}