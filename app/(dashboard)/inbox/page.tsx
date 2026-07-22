"use client";

import { useEffect, useState, Suspense } from "react";
import { useSession } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { Search, Plus, X, Loader2, Trash2, CheckSquare, Square, Download, CheckCircle, Info } from "lucide-react";
import { toast } from "sonner";

interface Feedback {
  id: string;
  content: string;
  channel: string;
  sentiment: string;
  status: string;
  createdAt: string;
  customerLabel?: string;
  sentimentScore?: number;
  featureArea?: string;
  aiRationale?: string;
  themes: string[];
}

export default function InboxPage() {
  return (
    <Suspense fallback={
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        <span className="ml-2 text-zinc-400 font-medium">Loading inbox logs...</span>
      </div>
    }>
      <InboxContent />
    </Suspense>
  );
}

function InboxContent() {
  const { data: session } = useSession(); // User role check
  
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Theme parameter from URL
  const searchParams = useSearchParams();
  const themeParam = searchParams.get("theme") || "ALL";

  const [themesList, setThemesList] = useState<string[]>([]);
  const [filters, setFilters] = useState({ 
    search: "", 
    sentiment: "ALL", 
    status: "ALL",
    theme: themeParam
  });
  
  // Selection and Bulk Actions state
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isBulkProcessing, setIsBulkProcessing] = useState(false);

  // Add Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ content: "", channel: "SUPPORT_TICKET", customerLabel: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Detail Modal States
  const [selectedFeedback, setSelectedFeedback] = useState<Feedback | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch themes for dropdown filter
  useEffect(() => {
    const fetchThemes = async () => {
      try {
        const res = await fetch("/api/themes");
        if (res.ok) {
          const themesData = await res.json();
          setThemesList(themesData.map((t: any) => t.name));
        }
      } catch (err) {
        console.error("Failed to load themes for filtering", err);
      }
    };
    fetchThemes();
  }, []);

  // Update theme filter if URL param changes
  useEffect(() => {
    if (themeParam) {
      setFilters(prev => ({ ...prev, theme: themeParam }));
    }
  }, [themeParam]);

  // Fetch feedbacks list based on filters
  useEffect(() => {
    fetchFeedbacks();
    setSelectedIds([]); // Clear selection when filters change
  }, [filters]);

  const fetchFeedbacks = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        search: filters.search,
        sentiment: filters.sentiment,
        status: filters.status,
        theme: filters.theme,
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

  // Manual Add Feedback Handler
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
        toast.success("Feedback log added and AI-analyzed!");
        fetchFeedbacks();
      } else {
        toast.error("Failed to add feedback");
      }
    } catch (error) {
      console.error("Error adding feedback", error);
      toast.error("Server connection failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Change Status of Feedback log
  const handleUpdateStatus = async (status: string) => {
    if (!selectedFeedback) return;
    setIsUpdatingStatus(true);
    try {
      const res = await fetch(`/api/feedback/${selectedFeedback.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        const updated = await res.json();
        setSelectedFeedback(prev => prev ? { ...prev, status: updated.status } : null);
        toast.success(`Workflow status updated to ${status}`);
        fetchFeedbacks();
      } else {
        toast.error("Failed to update status");
      }
    } catch (err) {
      console.error("Error updating status", err);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  // Delete Feedback log
  const handleDeleteFeedback = async () => {
    if (!selectedFeedback) return;
    if (!confirm("Are you sure you want to delete this feedback log? This action is permanent.")) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/feedback/${selectedFeedback.id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setIsDetailOpen(false);
        setSelectedFeedback(null);
        toast.success("Feedback log deleted successfully.");
        fetchFeedbacks();
      } else {
        toast.error("Failed to delete feedback log");
      }
    } catch (err) {
      console.error("Error deleting feedback log", err);
    } finally {
      setIsDeleting(false);
    }
  };

  // Bulk Actions Handlers
  const handleBulkStatusUpdate = async (status: string) => {
    setIsBulkProcessing(true);
    try {
      const res = await fetch("/api/feedback/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: selectedIds, status })
      });
      if (res.ok) {
        toast.success(`Successfully updated ${selectedIds.length} logs to ${status}`);
        setSelectedIds([]);
        fetchFeedbacks();
      } else {
        toast.error("Failed to perform bulk status update");
      }
    } catch (err) {
      toast.error("Network error during bulk action");
    } finally {
      setIsBulkProcessing(false);
    }
  };

  const handleBulkDelete = async () => {
    if (!confirm(`Are you sure you want to delete ${selectedIds.length} logs? This action is permanent.`)) return;
    setIsBulkProcessing(true);
    try {
      const res = await fetch("/api/feedback/bulk", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: selectedIds })
      });
      if (res.ok) {
        toast.success(`Successfully deleted ${selectedIds.length} feedback logs`);
        setSelectedIds([]);
        fetchFeedbacks();
      } else {
        toast.error("Failed to perform bulk deletion");
      }
    } catch (err) {
      toast.error("Network error during bulk deletion");
    } finally {
      setIsBulkProcessing(false);
    }
  };

  // CSV Export Handler
  const handleExportCSV = () => {
    if (feedbacks.length === 0) {
      toast.error("No feedback items to export.");
      return;
    }

    const headers = ["ID", "Status", "Content", "Sentiment", "Channel", "Date"];
    const rows = feedbacks.map(f => [
      f.id,
      f.status,
      `"${f.content.replace(/"/g, '""')}"`,
      f.sentiment,
      f.channel,
      new Date(f.createdAt).toLocaleDateString()
    ]);

    const csvContent = "\ufeff" + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `loop_feedback_export_${Date.now()}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("CSV file downloaded successfully!");
  };

  // Search highlighting helper
  const highlightText = (text: string, search: string) => {
    if (!search.trim()) return text;
    const regex = new RegExp(`(${search.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')})`, "gi");
    const parts = text.split(regex);
    return (
      <>
        {parts.map((part, i) => 
          regex.test(part) ? (
            <mark key={i} className="bg-blue-500/30 text-blue-300 px-0.5 rounded font-bold">
              {part}
            </mark>
          ) : (
            part
          )
        )}
      </>
    );
  };

  const getStatusColor = (status: string) => {
    if (status === "NEW") return "bg-blue-500/15 text-blue-400 border-blue-500/30 shadow-[0_0_10px_rgba(59,130,246,0.2)]";
    if (status === "REVIEWED") return "bg-amber-500/15 text-amber-400 border-amber-500/30 shadow-[0_0_10px_rgba(245,158,11,0.2)]";
    return "bg-emerald-500/15 text-emerald-400 border-emerald-500/30 shadow-[0_0_10px_rgba(16,185,129,0.2)]"; // ACTIONED
  };

  const getSentimentColor = (sentiment: string) => {
    if (sentiment === "POSITIVE" || sentiment === "POS") return "text-emerald-400 font-semibold";
    if (sentiment === "NEGATIVE" || sentiment === "NEG") return "text-rose-400 font-semibold";
    return "text-zinc-400";
  };

  // View detail handler
  const handleViewDetail = async (feedback: Feedback) => {
    setSelectedFeedback(feedback);
    setIsDetailOpen(true);
    try {
      const res = await fetch(`/api/feedback/${feedback.id}`);
      if (res.ok) {
        const fullDetail = await res.json();
        setSelectedFeedback(prev => prev && prev.id === fullDetail.id ? {
          ...prev,
          customerLabel: fullDetail.customerLabel,
          sentimentScore: fullDetail.sentimentScore,
          featureArea: fullDetail.featureArea,
          aiRationale: fullDetail.aiRationale
        } : prev);
      }
    } catch (err) {
      console.error("Failed to load details for feedback", err);
    }
  };

  const handleSelectAll = () => {
    if (selectedIds.length === feedbacks.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(feedbacks.map(f => f.id));
    }
  };

  const handleSelectRow = (id: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Stop opening the detail modal
    if (selectedIds.includes(id)) {
      setSelectedIds(prev => prev.filter(item => item !== id));
    } else {
      setSelectedIds(prev => [...prev, id]);
    }
  };

  const isViewer = session?.user?.role === "VIEWER";
  const isAdmin = session?.user?.role === "ADMIN";

  return (
    <div className="space-y-8 pb-24 relative">
      {/* Header & Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-5">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Feedback Inbox</h1>
          <p className="text-sm text-zinc-400">Manage, triage, and review customer feedback in real-time.</p>
        </div>
        
        <div className="flex gap-3">
          <button
            onClick={handleExportCSV}
            className="glass-button-secondary flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-semibold hover:text-white transition-colors"
          >
            <Download className="h-4 w-4" /> Export CSV
          </button>

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
                    toast.success(data.message || "CSV Imported successfully!");
                    fetchFeedbacks();
                  } else {
                    toast.error("Failed to import CSV");
                  }
                }}
              />
              <label
                htmlFor="csv-upload"
                className="glass-button-secondary flex cursor-pointer items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-semibold hover:text-white"
              >
                📥 Import CSV
              </label>

              <button
                onClick={() => setIsModalOpen(true)}
                className="glass-button flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold text-white shadow-md"
              >
                <Plus className="h-4 w-4" /> Add Feedback
              </button>
            </>
          )}
        </div>
      </div>

      {/* Filters Section */}
      <div className="flex flex-col gap-4 md:flex-row">
        {/* Search */}
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
        
        {/* Sentiment */}
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

        {/* Status */}
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

        {/* Theme Filter */}
        <select
          value={filters.theme}
          onChange={(e) => setFilters({ ...filters, theme: e.target.value })}
          className="glass-input rounded-xl px-4 py-2.5 text-sm"
        >
          <option value="ALL" className="bg-zinc-900">All Themes</option>
          {themesList.map((t) => (
            <option key={t} value={t} className="bg-zinc-900">{t}</option>
          ))}
        </select>
      </div>

      {/* Feedback Table */}
      <div className="glass-panel rounded-2xl overflow-hidden">
        {isLoading ? (
          <div className="flex h-64 items-center justify-center">
            <Loader2 className="h-7 w-7 animate-spin text-blue-400" />
          </div>
        ) : feedbacks.length === 0 ? (
          <div className="p-12 text-center text-zinc-400">No feedback logs found matching your filters.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-white/[0.04] text-zinc-350 border-b border-white/10 uppercase text-[11px] font-bold tracking-wider">
                <tr>
                  {!isViewer && (
                    <th className="w-12 px-6 py-3.5">
                      <button 
                        onClick={handleSelectAll}
                        className="text-zinc-450 hover:text-white transition-colors"
                      >
                        {selectedIds.length === feedbacks.length ? <CheckSquare className="h-4.5 w-4.5 text-blue-450" /> : <Square className="h-4.5 w-4.5" />}
                      </button>
                    </th>
                  )}
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
                  <tr 
                    key={feedback.id} 
                    onClick={() => handleViewDetail(feedback)}
                    className="hover:bg-white/[0.06] transition-colors cursor-pointer"
                  >
                    {!isViewer && (
                      <td className="px-6 py-4" onClick={(e) => handleSelectRow(feedback.id, e)}>
                        <button className="text-zinc-550 hover:text-white transition-colors">
                          {selectedIds.includes(feedback.id) ? <CheckSquare className="h-4.5 w-4.5 text-blue-400" /> : <Square className="h-4.5 w-4.5" />}
                        </button>
                      </td>
                    )}
                    <td className="px-6 py-4">
                      <span className={`inline-flex rounded-full border px-3 py-1 text-[11px] font-bold tracking-wide ${getStatusColor(feedback.status)}`}>
                        {feedback.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 max-w-md truncate text-zinc-150 font-medium" title={feedback.content}>
                      {highlightText(feedback.content, filters.search)}
                    </td>
                    <td className={`px-6 py-4 ${getSentimentColor(feedback.sentiment)}`}>
                      {feedback.sentiment}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1.5 animate-fadeIn">
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

      {/* Floating Bulk Actions Bar */}
      {selectedIds.length > 0 && !isViewer && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-zinc-950/85 backdrop-blur-xl border border-white/15 px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-6 animate-slideUp">
          <div className="text-xs text-zinc-300 font-medium whitespace-nowrap">
            Selected: <strong className="text-white text-sm font-black">{selectedIds.length}</strong> logs
          </div>
          
          <div className="h-6 w-px bg-white/10" />

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleBulkStatusUpdate("NEW")}
              disabled={isBulkProcessing}
              className="glass-button-secondary rounded-xl px-3 py-2 text-[10px] font-bold hover:text-white transition-all disabled:opacity-50"
            >
              New
            </button>
            <button
              onClick={() => handleBulkStatusUpdate("REVIEWED")}
              disabled={isBulkProcessing}
              className="glass-button-secondary rounded-xl px-3 py-2 text-[10px] font-bold hover:text-white transition-all disabled:opacity-50"
            >
              Reviewed
            </button>
            <button
              onClick={() => handleBulkStatusUpdate("ACTIONED")}
              disabled={isBulkProcessing}
              className="glass-button-secondary rounded-xl px-3 py-2 text-[10px] font-bold hover:text-white transition-all disabled:opacity-50"
            >
              Actioned
            </button>
          </div>

          {isAdmin && (
            <>
              <div className="h-6 w-px bg-white/10" />
              <button
                onClick={handleBulkDelete}
                disabled={isBulkProcessing}
                className="bg-rose-500/10 hover:bg-rose-500/20 text-rose-455 border border-rose-500/20 rounded-xl px-4 py-2 text-[10px] font-bold flex items-center gap-1.5 transition-all disabled:opacity-50"
              >
                <Trash2 className="h-3.5 w-3.5" /> Delete
              </button>
            </>
          )}

          <button
            onClick={() => setSelectedIds([])}
            className="text-zinc-550 hover:text-white text-xs font-semibold p-1"
          >
            Clear
          </button>
        </div>
      )}

      {/* Add Feedback Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4 animate-fadeIn">
          <div className="glass-panel relative w-full max-w-lg rounded-2xl p-6 shadow-2xl border border-white/15">
            <div className="flex items-center justify-between mb-5 border-b border-white/10 pb-3">
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

      {/* Feedback Details Modal */}
      {isDetailOpen && selectedFeedback && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4 animate-fadeIn">
          <div className="glass-panel relative w-full max-w-2xl rounded-2xl p-6 shadow-2xl border border-white/15">
            <div className="flex items-center justify-between mb-5 border-b border-white/10 pb-3">
              <div>
                <h2 className="text-lg font-bold text-white">Feedback Log Details</h2>
                <p className="text-xs text-zinc-500 font-mono">ID: {selectedFeedback.id}</p>
              </div>
              <button 
                onClick={() => {
                  setIsDetailOpen(false);
                  setSelectedFeedback(null);
                }} 
                className="text-zinc-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-5">
              {/* Content Card */}
              <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
                <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-2">Customer Verbatim</label>
                <p className="text-zinc-100 text-sm leading-relaxed font-light whitespace-pre-wrap">
                  "{selectedFeedback.content}"
                </p>
              </div>

              {/* Grid Metadata */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/[0.02] border border-white/5 rounded-xl p-3">
                  <span className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-1">Channel</span>
                  <span className="text-xs font-mono text-zinc-200 capitalize">{selectedFeedback.channel.replace("_", " ")}</span>
                </div>
                <div className="bg-white/[0.02] border border-white/5 rounded-xl p-3">
                  <span className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-1">Customer Group</span>
                  <span className="text-xs font-semibold text-zinc-200">{selectedFeedback.customerLabel || "Unknown"}</span>
                </div>
              </div>

              {/* AI Analysis */}
              <div className="bg-blue-500/[0.02] border border-blue-500/10 rounded-xl p-4 space-y-4">
                <h4 className="text-[10px] font-bold uppercase tracking-wider text-blue-400">AI Intelligence Insights</h4>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="block text-[10px] font-semibold text-zinc-400 mb-1">Sentiment Score</span>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-bold ${getSentimentColor(selectedFeedback.sentiment)}`}>
                        {selectedFeedback.sentiment}
                      </span>
                      <span className="text-xs text-zinc-400 font-mono">({selectedFeedback.sentimentScore !== undefined ? selectedFeedback.sentimentScore.toFixed(1) : "0.0"})</span>
                    </div>
                  </div>
                  <div>
                    <span className="block text-[10px] font-semibold text-zinc-400 mb-1">Feature Tag</span>
                    <span className="glass-pill px-2.5 py-0.5 rounded text-xs text-blue-300 font-medium">{selectedFeedback.featureArea || "General"}</span>
                  </div>
                </div>

                {/* Score Slider Indicator */}
                <div>
                  <span className="block text-[10px] font-semibold text-zinc-400 mb-1.5">Score Mapping Scale</span>
                  <div className="relative h-2 w-full bg-zinc-800 rounded-full overflow-hidden">
                    <div className="absolute top-0 bottom-0 left-0 right-0 bg-gradient-to-r from-red-500 via-zinc-600 to-green-500 opacity-60" />
                    <div 
                      className="absolute top-0 bottom-0 w-1.5 bg-white border border-black shadow-[0_0_8px_rgba(255,255,255,1)]" 
                      style={{ left: `${((selectedFeedback.sentimentScore || 0) + 1) * 50}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[9px] text-zinc-500 font-mono mt-1">
                    <span>Negative (-1.0)</span>
                    <span>Neutral (0.0)</span>
                    <span>Positive (+1.0)</span>
                  </div>
                </div>

                {selectedFeedback.aiRationale && (
                  <div className="border-t border-white/5 pt-3">
                    <span className="block text-[10px] font-semibold text-zinc-400 mb-1">AI Rationale Explanation</span>
                    <p className="text-xs text-zinc-300 leading-relaxed italic">"{selectedFeedback.aiRationale}"</p>
                  </div>
                )}
              </div>

              {/* Status Update Actions */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-white/10">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Workflow Status:</span>
                  <select
                    value={selectedFeedback.status}
                    disabled={isUpdatingStatus || isViewer}
                    onChange={(e) => handleUpdateStatus(e.target.value)}
                    className="glass-input rounded-xl px-3 py-1.5 text-xs font-bold"
                  >
                    <option value="NEW" className="bg-zinc-900">NEW</option>
                    <option value="REVIEWED" className="bg-zinc-900">REVIEWED</option>
                    <option value="ACTIONED" className="bg-zinc-900">ACTIONED</option>
                  </select>
                  {isUpdatingStatus && <Loader2 className="h-4 w-4 animate-spin text-blue-400" />}
                </div>

                <div className="flex gap-3">
                  {isAdmin && (
                    <button
                      onClick={handleDeleteFeedback}
                      disabled={isDeleting}
                      className="bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 hover:text-rose-300 border border-rose-500/20 hover:border-rose-500/40 rounded-xl px-4 py-2 text-xs font-bold flex items-center gap-2 transition-all"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      {isDeleting ? "Deleting..." : "Delete Log"}
                    </button>
                  )}
                  <button
                    onClick={() => {
                      setIsDetailOpen(false);
                      setSelectedFeedback(null);
                    }}
                    className="glass-button-secondary rounded-xl px-5 py-2 text-xs font-bold text-zinc-300"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}