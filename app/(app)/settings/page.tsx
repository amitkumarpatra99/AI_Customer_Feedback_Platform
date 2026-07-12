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
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 space-y-4">
        <h3 className="text-lg font-medium text-white flex items-center gap-2">
          <Settings className="w-5 h-5 text-blue-500" /> Workspace Details
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-semibold text-zinc-450 uppercase">Workspace Name</label>
            <input
              type="text"
              defaultValue="Acme Corp"
              className="mt-1 block w-full bg-zinc-950 border border-zinc-800 rounded-md px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-zinc-450 uppercase">Workspace ID</label>
            <input
              type="text"
              readOnly
              value="workspace_ckl94xla00001j3v"
              className="mt-1 block w-full bg-zinc-950/40 border border-zinc-805 rounded-md px-3 py-2 text-sm text-zinc-500 cursor-not-allowed outline-none"
            />
          </div>
        </div>
        <button className="bg-blue-600 hover:bg-blue-750 text-white rounded px-4 py-2 text-sm font-semibold transition-all">
          Save Changes
        </button>
      </div>

      {/* Member Management */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-medium text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-500" /> Team Members & Roles
          </h3>
          <button className="flex items-center gap-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs px-3 py-1.5 rounded font-semibold transition-all">
            <UserPlus className="w-4 h-4" /> Invite Member
          </button>
        </div>

        <div className="border border-zinc-800 rounded-lg overflow-hidden mt-4">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-zinc-800 bg-zinc-900/50 text-zinc-400 text-xs font-semibold uppercase tracking-wider">
                <th className="px-6 py-3">Member Name</th>
                <th className="px-6 py-3">Email</th>
                <th className="px-6 py-3">Role</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800 text-sm text-zinc-350">
              {mockMembers.map((member) => (
                <tr key={member.id} className="hover:bg-zinc-800/30 transition-colors">
                  <td className="px-6 py-3 font-medium text-white">{member.name}</td>
                  <td className="px-6 py-3 text-zinc-400">{member.email}</td>
                  <td className="px-6 py-3">
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-zinc-300">
                      <Shield className="w-3.5 h-3.5 text-blue-500" /> {member.role}
                    </span>
                  </td>
                  <td className="px-6 py-3 text-right">
                    <button className="text-red-500 hover:text-red-400 text-xs font-semibold">
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
