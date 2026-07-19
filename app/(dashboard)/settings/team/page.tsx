"use client";

import { useState, useEffect } from "react";
import { UserPlus, Shield, User, Eye } from "lucide-react"; // Icons ke liye

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
      setFormData({ name: "", email: "", role: "ANALYST" });
      fetchUsers(); // List refresh karo
    }
  };

  const getRoleIcon = (role: string) => {
    if (role === "ADMIN") return <Shield className="h-4 w-4 text-yellow-500" />;
    if (role === "ANALYST") return <User className="h-4 w-4 text-blue-500" />;
    return <Eye className="h-4 w-4 text-zinc-500" />;
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">Team Management</h1>
        <p className="mt-1 text-sm text-zinc-400">Invite team members and manage their roles.</p>
      </div>

      {/* Invite Form */}
      <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-6">
        <h2 className="mb-4 text-lg font-semibold text-white flex items-center gap-2">
          <UserPlus className="h-5 w-5 text-blue-500" /> Invite New Member
        </h2>
        
        {error && <div className="mb-4 rounded bg-red-900/50 border border-red-800 p-3 text-sm text-red-200">{error}</div>}
        {success && <div className="mb-4 rounded bg-green-900/50 border border-green-800 p-3 text-sm text-green-200">{success}</div>}

        <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 md:grid-cols-4">
          <input
            type="text"
            placeholder="Full Name (Optional)"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="rounded-md border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 placeholder-zinc-500 focus:border-blue-500 focus:outline-none"
          />
          <input
            type="email"
            placeholder="Email Address"
            required
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="rounded-md border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 placeholder-zinc-500 focus:border-blue-500 focus:outline-none"
          />
          <select
  value={formData.role}
  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
  className="rounded-md border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 focus:border-blue-500 focus:outline-none"
>
  <option value="ADMIN">Admin</option>
  <option value="ANALYST">Analyst</option>
  <option value="VIEWER">Viewer</option>
</select>

<input
  type="text"
  placeholder="Temp Password (e.g., Temp@123)"
  value={formData.password}
  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
  className="rounded-md border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 placeholder-zinc-500 focus:border-blue-500 focus:outline-none"
/>
 {success && (
  <div className="mb-4 rounded bg-green-900/50 border border-green-800 p-3 text-sm text-green-200">
    {success} <br/>
    <span className="font-mono text-green-400">Share this password with them: {formData.password}</span>
  </div>
)}         
          
          <button
            type="submit"
            className="flex items-center justify-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
          >
            <UserPlus className="h-4 w-4" /> Invite
          </button>
        </form>
      </div>

      {/* Team Members List */}
      <div className="rounded-lg border border-zinc-800 bg-zinc-900 overflow-hidden">
        <div className="border-b border-zinc-800 px-6 py-4">
          <h2 className="text-lg font-semibold text-white">Current Members ({users.length})</h2>
        </div>
        
        {isLoading ? (
          <div className="p-6 text-center text-zinc-500">Loading members...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-zinc-950/50 text-zinc-400">
                <tr>
                  <th className="px-6 py-3 font-medium">Name</th>
                  <th className="px-6 py-3 font-medium">Email</th>
                  <th className="px-6 py-3 font-medium">Role</th>
                  <th className="px-6 py-3 font-medium">Joined</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-zinc-800/50 transition-colors">
                    <td className="px-6 py-4 font-medium text-white">{user.name}</td>
                    <td className="px-6 py-4 text-zinc-400">{user.email}</td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-2 rounded-full bg-zinc-800 px-2.5 py-0.5 text-xs font-medium text-zinc-300 capitalize">
                        {getRoleIcon(user.role)}
                        {user.role.toLowerCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-zinc-500">
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