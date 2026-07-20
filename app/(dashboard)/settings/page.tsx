"use client";

import React from "react";
import { Settings, Users, Shield, UserPlus } from "lucide-react";

export default function SettingsPage() {
  const mockMembers = [
    { id: "m1", name: "Alice Admin", email: "admin@loop.com", role: "ADMIN" },
    { id: "m2", name: "Bob Analyst", email: "analyst@loop.com", role: "ANALYST" },
    { id: "m3", name: "Charlie Viewer", email: "viewer@loop.com", role: "VIEWER" }
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Workspace Settings */}
      <div className="glass-card rounded-2xl p-6 space-y-5">
        <h3 className="text-xl font-bold text-white flex items-center gap-2.5">
          <Settings className="w-5 h-5 text-blue-400" /> Workspace Details
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5">Workspace Name</label>
            <input
              type="text"
              defaultValue="Acme Corp"
              className="glass-input block w-full rounded-xl px-4 py-2.5 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">Workspace ID</label>
            <input
              type="text"
              readOnly
              value="workspace_ckl94xla00001j3v"
              className="glass-input block w-full rounded-xl px-4 py-2.5 text-sm text-zinc-500 cursor-not-allowed opacity-60 font-mono"
            />
          </div>
        </div>
        <button className="glass-button rounded-xl px-5 py-2.5 text-xs font-bold text-white shadow-md">
          Save Changes
        </button>
      </div>

      {/* Member Management */}
      <div className="glass-card rounded-2xl p-6 space-y-5">
        <div className="flex justify-between items-center">
          <h3 className="text-xl font-bold text-white flex items-center gap-2.5">
            <Users className="w-5 h-5 text-blue-400" /> Team Members & Roles
          </h3>
          <button className="glass-button-secondary flex items-center gap-2 text-xs px-4 py-2 rounded-xl font-semibold">
            <UserPlus className="w-4 h-4 text-blue-400" /> Invite Member
          </button>
        </div>

        <div className="glass-panel rounded-2xl overflow-hidden mt-4">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white/[0.04] text-zinc-300 text-xs font-bold uppercase tracking-wider border-b border-white/10">
                <th className="px-6 py-3.5">Member Name</th>
                <th className="px-6 py-3.5">Email</th>
                <th className="px-6 py-3.5">Role</th>
                <th className="px-6 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-sm text-zinc-300">
              {mockMembers.map((member) => (
                <tr key={member.id} className="hover:bg-white/[0.05] transition-colors">
                  <td className="px-6 py-3.5 font-semibold text-white">{member.name}</td>
                  <td className="px-6 py-3.5 text-zinc-400 font-mono text-xs">{member.email}</td>
                  <td className="px-6 py-3.5">
                    <span className="glass-pill px-3 py-1 rounded-full text-xs font-semibold text-blue-300 inline-flex items-center gap-1.5">
                      <Shield className="w-3.5 h-3.5 text-blue-400" /> {member.role}
                    </span>
                  </td>
                  <td className="px-6 py-3.5 text-right">
                    <button className="text-rose-400 hover:text-rose-300 text-xs font-bold transition-colors">
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
