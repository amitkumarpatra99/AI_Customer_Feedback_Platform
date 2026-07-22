"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Save, Loader2, Building2, AlertTriangle } from "lucide-react";

export default function WorkspaceSettingsPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [workspaceName, setWorkspaceName] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (session?.user?.workspaceName) {
      setWorkspaceName(session.user.workspaceName);
    }
  }, [session]);

  // Redirect if not Admin
  useEffect(() => {
    if (session && session.user.role !== "ADMIN") {
      router.push("/dashboard");
      toast.error("Access denied. Admins only.");
    }
  }, [session, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await fetch("/api/settings/workspace", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ workspaceName }),
      });

      if (res.ok) {
        toast.success("Workspace name updated successfully!");
      } else {
        const data = await res.json();
        toast.error(data.error || "Failed to update workspace.");
      }
    } catch (error) {
      toast.error("Network error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (session?.user?.role !== "ADMIN") {
    return null; // Redirect handle ho jayega
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Workspace Settings</h1>
        <p className="text-sm text-zinc-400">Manage your company or organization settings.</p>
      </div>

      <form onSubmit={handleSubmit} className="rounded-lg border border-zinc-800 bg-zinc-900 p-6 space-y-6">
        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-1">Workspace Name</label>
          <div className="relative">
            <Building2 className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
            <input
              type="text"
              value={workspaceName}
              onChange={(e) => setWorkspaceName(e.target.value)}
              className="w-full rounded-md border border-zinc-800 bg-zinc-950 py-2 pl-10 pr-4 text-sm text-zinc-100 focus:border-blue-500 focus:outline-none"
              placeholder="e.g., Acme Corp"
            />
          </div>
          <p className="mt-1 text-xs text-zinc-500">This name will be displayed on the dashboard and in reports.</p>
        </div>

        <div className="rounded-md border border-red-900/50 bg-red-900/10 p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5" />
            <div>
              <h3 className="text-sm font-medium text-red-400">Danger Zone</h3>
              <p className="mt-1 text-xs text-red-300/80">
                Deleting a workspace will permanently remove all associated users, feedbacks, and themes. This action cannot be undone.
              </p>
              <button
                type="button"
                disabled
                className="mt-3 rounded-md border border-red-800 bg-red-950/50 px-3 py-1.5 text-xs font-medium text-red-400 cursor-not-allowed opacity-75"
              >
                Delete Workspace (Disabled in Demo)
              </button>
            </div>
          </div>
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