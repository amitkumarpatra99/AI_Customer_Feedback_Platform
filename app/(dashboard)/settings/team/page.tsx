"use client";

import { useState, useEffect } from "react";
import { UserPlus, Shield, User, Eye } from "lucide-react";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
}

export default function TeamManagementPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [formData, setFormData] = useState({ name: "", email: "", role: "ANALYST", password: "Temp@123" });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Page load hone par users fetch karo
  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await fetch("/api/users");
      if (res.ok) {
        const data = await res.json();
        setUsers(data);
      }
    } catch (err) {
      console.error("Failed to fetch users");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    const res = await fetch("/api/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.error || "Failed to invite user");
    } else {
      setSuccess(`${data.name} has been added as ${data.role}!`);
      setFormData({ name: "", email: "", role: "ANALYST", password: "Temp@123" });
      fetchUsers(); // List refresh karo
    }
  };

  const getRoleIcon = (role: string) => {
    if (role === "ADMIN") return <Shield className="h-4 w-4 text-amber-400" />;
    if (role === "ANALYST") return <User className="h-4 w-4 text-blue-400" />;
    return <Eye className="h-4 w-4 text-zinc-400" />;
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">Team Management</h1>
        <p className="mt-1 text-sm text-zinc-400">Invite team members and manage workspace roles.</p>
      </div>

      {/* Invite Form */}
      <div className="glass-card rounded-2xl p-6 space-y-4">
        <h2 className="text-lg font-bold text-white flex items-center gap-2.5">
          <UserPlus className="h-5 w-5 text-blue-400" /> Invite New Member
        </h2>
        
        {error && <div className="rounded-xl bg-rose-500/10 border border-rose-500/20 p-3.5 text-xs font-semibold text-rose-400">{error}</div>}
        {success && <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-3.5 text-xs font-semibold text-emerald-400">{success}</div>}

        <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 md:grid-cols-4 items-center">
          <input
            type="text"
            placeholder="Full Name (Optional)"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="glass-input rounded-xl px-4 py-2.5 text-sm"
          />
          <input
            type="email"
            placeholder="Email Address"
            required
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="glass-input rounded-xl px-4 py-2.5 text-sm"
          />
          <select
            value={formData.role}
            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
            className="glass-input rounded-xl px-4 py-2.5 text-sm"
          >
            <option value="ADMIN" className="bg-zinc-900">Admin</option>
            <option value="ANALYST" className="bg-zinc-900">Analyst</option>
            <option value="VIEWER" className="bg-zinc-900">Viewer</option>
          </select>

          <button
            type="submit"
            className="glass-button flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold text-white shadow-md"
          >
            <UserPlus className="h-4 w-4" /> Invite
          </button>
        </form>
      </div>

      {/* Team Members List */}
      <div className="glass-panel rounded-2xl overflow-hidden">
        <div className="border-b border-white/10 px-6 py-4 bg-white/[0.03]">
          <h2 className="text-base font-bold text-white">Current Members ({users.length})</h2>
        </div>
        
        {isLoading ? (
          <div className="p-8 text-center text-zinc-400 text-sm">Loading members...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-white/[0.04] text-zinc-300 border-b border-white/10 uppercase text-[11px] font-bold tracking-wider">
                <tr>
                  <th className="px-6 py-3.5">Name</th>
                  <th className="px-6 py-3.5">Email</th>
                  <th className="px-6 py-3.5">Role</th>
                  <th className="px-6 py-3.5">Joined</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-white/[0.05] transition-colors">
                    <td className="px-6 py-4 font-semibold text-white">{user.name}</td>
                    <td className="px-6 py-4 text-zinc-400 font-mono text-xs">{user.email}</td>
                    <td className="px-6 py-4">
                      <span className="glass-pill px-3 py-1 rounded-full text-xs font-semibold text-zinc-200 capitalize inline-flex items-center gap-2">
                        {getRoleIcon(user.role)}
                        {user.role.toLowerCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-zinc-400 text-xs font-mono">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}