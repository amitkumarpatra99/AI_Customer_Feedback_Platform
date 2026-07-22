"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Search, Plus, X, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner"; // 👈 Sonner import kiya

interface Feedback {
  id: string;
  content: string;
  channel: string;
  sentiment: string;
  status: string;
  createdAt: string;
  themes: string[];
}

export default function InboxPage() {
  const router = useRouter();
  const { data: session } = useSession(); 
  
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState({ search: "", sentiment: "ALL", status: "ALL" });
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ content: "", channel: "SUPPORT_TICKET", customerLabel: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchFeedbacks();
  }, [filters]);

  const fetchFeedbacks = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        search: filters.search,
        sentiment: filters.sentiment,
        status: filters.status,
      });
      
      const res = await fetch(`/api/feedback?${params}`);
      if (res.ok) {
        const data = await res.json();
        setFeedbacks(data);
      }
    } catch (error) {
      console.error("Failed to fetch feedbacks", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddFeedback = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setIsModalOpen(false);
        setFormData({ content: "", channel: "SUPPORT_TICKET", customerLabel: "" });
        fetchFeedbacks();
        toast.success("Feedback added successfully!"); // 👈 Alert ki jagah Toast
      } else {
        toast.error("Failed to add feedback. Please try again."); // 👈 Alert ki jagah Toast
      }
    } catch (error) {
      console.error("Error adding feedback", error);
      toast.error("Network error. Please check your connection.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusColor = (status: string) => {
    if (status === "NEW") return "bg-blue-500/10 text-blue-500 border-blue-500/20";
    if (status === "REVIEWED") return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20";
    return "bg-green-500/10 text-green-500 border-green-500/20"; // ACTIONED
  };

  const getSentimentColor = (sentiment: string) => {
    if (sentiment === "POSITIVE") return "text-emerald-400 font-semibold";
    if (sentiment === "NEGATIVE") return "text-rose-400 font-semibold";
    return "text-zinc-400";
  };

  const isViewer = session?.user?.role === "VIEWER";

  return (
    <div className="space-y-6">
      {/* Header & Action Buttons */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Feedback Inbox</h1>
          <p className="text-sm text-zinc-400">Manage and review customer feedback in real-time.</p>
        </div>
        
        <div className="flex gap-3">
          {!isViewer && (
            <>
              <input
                type="file"
                id="csv-upload"
                accept=".csv"
                className="hidden"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  
                  const formDataUpload = new FormData();
                  formDataUpload.append("file", file);
                  
                  const res = await fetch("/api/feedback/import", {
                    method: "POST",
                    body: formDataUpload,
                  });
                  
                  if (res.ok) {
                    const data = await res.json();
                    toast.success(data.message); // 👈 Alert ki jagah Toast
                    fetchFeedbacks();
                  } else {
                    toast.error("Failed to import CSV. Check file format."); // 👈 Alert ki jagah Toast
                  }
                }}
              />
              <label
                htmlFor="csv-upload"
                className="glass-button-secondary flex cursor-pointer items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-semibold"
              >
                📥 Import CSV
              </label>
            </>
          )}

          {!isViewer && (
            <button
              onClick={() => setIsModalOpen(true)}
              className="glass-button flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold text-white shadow-md"
            >
              <Plus className="h-4 w-4" /> Add Feedback
            </button>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-4 md:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            placeholder="Search feedback logs..."
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            className="glass-input w-full rounded-xl py-2.5 pl-10 pr-4 text-sm"
          />
        </div>
        
        <select
          value={filters.sentiment}
          onChange={(e) => setFilters({ ...filters, sentiment: e.target.value })}
          className="glass-input rounded-xl px-4 py-2.5 text-sm"
        >
          <option value="ALL" className="bg-zinc-900">All Sentiments</option>
          <option value="POSITIVE" className="bg-zinc-900">Positive</option>
          <option value="NEUTRAL" className="bg-zinc-900">Neutral</option>
          <option value="NEGATIVE" className="bg-zinc-900">Negative</option>
        </select>

        <select
          value={filters.status}
          onChange={(e) => setFilters({ ...filters, status: e.target.value })}
          className="glass-input rounded-xl px-4 py-2.5 text-sm"
        >
          <option value="ALL" className="bg-zinc-900">All Statuses</option>
          <option value="NEW" className="bg-zinc-900">New</option>
          <option value="REVIEWED" className="bg-zinc-900">Reviewed</option>
          <option value="ACTIONED" className="bg-zinc-900">Actioned</option>
        </select>
      </div>

      {/* Feedback Table */}
      <div className="rounded-lg border border-zinc-800 bg-zinc-900 overflow-hidden">
        {isLoading ? (
          <div className="flex h-64 items-center justify-center">
            <Loader2 className="h-7 w-7 animate-spin text-blue-400" />
          </div>
        ) : feedbacks.length === 0 ? (
          <div className="p-12 text-center text-zinc-400">No feedback logs found matching your filters.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-white/[0.04] text-zinc-300 border-b border-white/10 uppercase text-[11px] font-bold tracking-wider">
                <tr>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5">Feedback Content</th>
                  <th className="px-6 py-3.5">Sentiment</th>
                  <th className="px-6 py-3.5">Themes</th>
                  <th className="px-6 py-3.5">Channel</th>
                  <th className="px-6 py-3.5">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {feedbacks.map((feedback) => (
                  // ✅ Yahan onClick add kiya hai taaki row par click karne se detail page khule
                  <tr 
                    key={feedback.id} 
                    onClick={() => router.push(`/inbox/${feedback.id}`)}
                    className="hover:bg-zinc-800/50 transition-colors cursor-pointer"
                  >
                    <td className="px-6 py-4">
                      <span className={`inline-flex rounded-full border px-3 py-1 text-[11px] font-bold tracking-wide ${getStatusColor(feedback.status)}`}>
                        {feedback.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 max-w-md truncate text-zinc-100 font-medium" title={feedback.content}>
                      {feedback.content}
                    </td>
                    <td className={`px-6 py-4 ${getSentimentColor(feedback.sentiment)}`}>
                      {feedback.sentiment}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1.5">
                        {feedback.themes && feedback.themes.slice(0, 2).map((theme, i) => (
                          <span key={i} className="glass-pill rounded-md px-2 py-0.5 text-xs text-blue-300/90 font-medium">
                            {theme}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-zinc-400 font-mono text-xs">{feedback.channel.replace("_", " ")}</td>
                    <td className="px-6 py-4 text-zinc-400 text-xs font-mono">
                      {new Date(feedback.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Feedback Modal (Popup) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4">
          <div className="glass-panel relative w-full max-w-lg rounded-2xl p-6 shadow-2xl border border-white/15">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-white">Add New Feedback</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-zinc-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <form onSubmit={handleAddFeedback} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-300 mb-1.5">Feedback Content</label>
                <textarea
                  required
                  rows={4}
                  placeholder="e.g., The app crashes when I try to upload a photo..."
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  className="glass-input w-full rounded-xl p-3 text-sm placeholder-zinc-500"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-300 mb-1.5">Channel</label>
                  <select
                    value={formData.channel}
                    onChange={(e) => setFormData({ ...formData, channel: e.target.value })}
                    className="glass-input w-full rounded-xl p-2.5 text-sm"
                  >
                    <option value="SUPPORT_TICKET" className="bg-zinc-900">Support Ticket</option>
                    <option value="APP_STORE" className="bg-zinc-900">App Store</option>
                    <option value="NPS_SURVEY" className="bg-zinc-900">NPS Survey</option>
                    <option value="SALES_CALL" className="bg-zinc-900">Sales Call</option>
                    <option value="COMMUNITY" className="bg-zinc-900">Community</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-300 mb-1.5">Customer Label (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g., Enterprise"
                    value={formData.customerLabel}
                    onChange={(e) => setFormData({ ...formData, customerLabel: e.target.value })}
                    className="glass-input w-full rounded-xl p-2.5 text-sm placeholder-zinc-500"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)} 
                  className="glass-button-secondary rounded-xl px-4 py-2 text-xs font-semibold text-zinc-300"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={isSubmitting} 
                  className="glass-button rounded-xl px-5 py-2 text-xs font-bold text-white shadow-md disabled:opacity-50"
                >
                  {isSubmitting ? "Processing..." : "Add Feedback"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}