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
    return "bg-green-500/10 text-green-500 border-green-500/20";
  };

  const getSentimentColor = (sentiment: string) => {
    if (sentiment === "POSITIVE") return "text-green-400";
    if (sentiment === "NEGATIVE") return "text-red-400";
    return "text-zinc-400";
  };

  const isViewer = session?.user?.role === "VIEWER";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Feedback Inbox</h1>
          <p className="text-sm text-zinc-400">Manage and review customer feedback.</p>
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
                className="flex cursor-pointer items-center gap-2 rounded-md border border-zinc-700 bg-zinc-800 px-4 py-2 text-sm font-medium text-zinc-200 hover:bg-zinc-700 transition-colors"
              >
                📥 Import CSV
              </label>
            </>
          )}

          {!isViewer && (
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
            >
              <Plus className="h-4 w-4" /> Add Feedback
            </button>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-4 md:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
          <input
            type="text"
            placeholder="Search feedbacks..."
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            className="w-full rounded-md border border-zinc-800 bg-zinc-900 py-2 pl-10 pr-4 text-sm text-zinc-100 placeholder-zinc-500 focus:border-blue-500 focus:outline-none"
          />
        </div>
        
        <select
          value={filters.sentiment}
          onChange={(e) => setFilters({ ...filters, sentiment: e.target.value })}
          className="rounded-md border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 focus:border-blue-500 focus:outline-none"
        >
          <option value="ALL">All Sentiments</option>
          <option value="POSITIVE">Positive</option>
          <option value="NEUTRAL">Neutral</option>
          <option value="NEGATIVE">Negative</option>
        </select>

        <select
          value={filters.status}
          onChange={(e) => setFilters({ ...filters, status: e.target.value })}
          className="rounded-md border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 focus:border-blue-500 focus:outline-none"
        >
          <option value="ALL">All Statuses</option>
          <option value="NEW">New</option>
          <option value="REVIEWED">Reviewed</option>
          <option value="ACTIONED">Actioned</option>
        </select>
      </div>

      <div className="rounded-lg border border-zinc-800 bg-zinc-900 overflow-hidden">
        {isLoading ? (
          <div className="flex h-64 items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
          </div>
        ) : feedbacks.length === 0 ? (
          <div className="p-12 text-center text-zinc-500">No feedbacks found matching your filters.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-zinc-950/50 text-zinc-400">
                <tr>
                  <th className="px-6 py-3 font-medium">Status</th>
                  <th className="px-6 py-3 font-medium">Feedback Content</th>
                  <th className="px-6 py-3 font-medium">Sentiment</th>
                  <th className="px-6 py-3 font-medium">Themes</th>
                  <th className="px-6 py-3 font-medium">Channel</th>
                  <th className="px-6 py-3 font-medium">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800">
                {feedbacks.map((feedback) => (
                  <tr 
                    key={feedback.id} 
                    onClick={() => router.push(`/inbox/${feedback.id}`)}
                    className="hover:bg-zinc-800/50 transition-colors cursor-pointer"
                  >
                    <td className="px-6 py-4">
                      <span className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-medium ${getStatusColor(feedback.status)}`}>
                        {feedback.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 max-w-md truncate text-zinc-200" title={feedback.content}>
                      {feedback.content}
                    </td>
                    <td className={`px-6 py-4 font-medium ${getSentimentColor(feedback.sentiment)}`}>
                      {feedback.sentiment}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {feedback.themes && feedback.themes.slice(0, 2).map((theme, i) => (
                          <span key={i} className="rounded bg-zinc-800 px-2 py-0.5 text-xs text-zinc-300">
                            {theme}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-zinc-400">{feedback.channel.replace("_", " ")}</td>
                    <td className="px-6 py-4 text-zinc-500">
                      {new Date(feedback.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-lg border border-zinc-800 bg-zinc-900 p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-white">Add New Feedback</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-zinc-400 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <form onSubmit={handleAddFeedback} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-1">Feedback Content</label>
                <textarea
                  required
                  rows={4}
                  placeholder="e.g., The app crashes when I try to upload a photo..."
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  className="w-full rounded-md border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 placeholder-zinc-500 focus:border-blue-500 focus:outline-none"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-1">Channel</label>
                  <select
                    value={formData.channel}
                    onChange={(e) => setFormData({ ...formData, channel: e.target.value })}
                    className="w-full rounded-md border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 focus:border-blue-500 focus:outline-none"
                  >
                    <option value="SUPPORT_TICKET">Support Ticket</option>
                    <option value="APP_STORE">App Store</option>
                    <option value="NPS_SURVEY">NPS Survey</option>
                    <option value="SALES_CALL">Sales Call</option>
                    <option value="COMMUNITY">Community</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-1">Customer Label (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g., Enterprise"
                    value={formData.customerLabel}
                    onChange={(e) => setFormData({ ...formData, customerLabel: e.target.value })}
                    className="w-full rounded-md border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 placeholder-zinc-500 focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)} 
                  className="rounded-md border border-zinc-800 px-4 py-2 text-sm text-zinc-300 hover:bg-zinc-800"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={isSubmitting} 
                  className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
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