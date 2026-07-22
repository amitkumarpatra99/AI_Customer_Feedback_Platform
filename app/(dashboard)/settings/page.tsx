"use client";

import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Settings, Users, Shield, UserPlus, Loader2 } from "lucide-react";

interface Member {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
}

export default function SettingsPage() {
  const { data: session } = useSession();
  const [members, setMembers] = useState<Member[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const res = await fetch("/api/users");
        if (res.ok) {
          const data = await res.json();
          setMembers(data);
        }
      } catch (err) {
        console.error("Failed to load workspace members in settings", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchMembers();
  }, []);

  const workspaceName = (session?.user as any)?.workspaceName || "Acme Corp Demo";
  const workspaceId = (session?.user as any)?.workspaceId || "workspace_loading...";

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Workspace Settings */}
      <div className="glass-card rounded-2xl p-6 space-y-5 relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-indigo-500" />
        <h3 className="text-xl font-bold text-white flex items-center gap-2.5">
          <Settings className="w-5 h-5 text-blue-400" /> Workspace Details
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5">Workspace Name</label>
            <input
              type="text"
              readOnly
              value={workspaceName}
              className="glass-input block w-full rounded-xl px-4 py-2.5 text-sm text-zinc-300 cursor-not-allowed opacity-80"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">Workspace ID</label>
            <input
              type="text"
              readOnly
              value={workspaceId}
              className="glass-input block w-full rounded-xl px-4 py-2.5 text-sm text-zinc-500 cursor-not-allowed opacity-60 font-mono"
            />
          </div>
        </div>
      </div>

      {/* Member Management */}
      <div className="glass-card rounded-2xl p-6 space-y-5 relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 to-purple-500" />
        <div className="flex justify-between items-center gap-4">
          <h3 className="text-xl font-bold text-white flex items-center gap-2.5">
            <Users className="w-5 h-5 text-blue-400" /> Team Members & Roles
          </h3>
          <Link
            href="/settings/team"
            className="glass-button-secondary flex items-center gap-2 text-xs px-4 py-2.5 rounded-xl font-semibold hover:text-white"
          >
            <UserPlus className="w-4 h-4 text-blue-400" /> Manage Team
          </Link>
        </div>

        <div className="glass-panel rounded-2xl overflow-hidden mt-4">
          {isLoading ? (
            <div className="flex h-32 items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-blue-400" />
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white/[0.04] text-zinc-300 text-xs font-bold uppercase tracking-wider border-b border-white/10">
                  <th className="px-6 py-3.5">Member Name</th>
                  <th className="px-6 py-3.5">Email</th>
                  <th className="px-6 py-3.5">Role</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-sm text-zinc-300">
                {members.map((member) => (
                  <tr key={member.id} className="hover:bg-white/[0.05] transition-colors">
                    <td className="px-6 py-3.5 font-semibold text-white">{member.name}</td>
                    <td className="px-6 py-3.5 text-zinc-400 font-mono text-xs">{member.email}</td>
                    <td className="px-6 py-3.5">
                      <span className="glass-pill px-3 py-1 rounded-full text-xs font-semibold text-blue-300 inline-flex items-center gap-1.5">
                        <Shield className="w-3.5 h-3.5 text-blue-400" /> {member.role}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
