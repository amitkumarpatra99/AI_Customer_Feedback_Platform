"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { FileText, Calendar, Plus, X, Loader2, Trash2, ArrowRight } from "lucide-react";

interface Report {
  id: string;
  title: string;
  periodStart: string;
  periodEnd: string;
  contentJson: string; // Stored as JSON string
  createdAt: string;
}

export default function ReportsPage() {
  const { data: session } = useSession();
  const router = useRouter();

  const [reports, setReports] = useState<Report[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    endDate: new Date().toISOString().split("T")[0],
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/reports");
      if (res.ok) {
        const data = await res.json();
        setReports(data);
      }
    } catch (err) {
      console.error("Failed to load reports", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateReport = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      const res = await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: formData.title,
          periodStart: new Date(formData.startDate).toISOString(),
          periodEnd: new Date(formData.endDate).toISOString(),
        }),
      });

      if (res.ok) {
        setIsModalOpen(false);
        setFormData({
          title: "",
          startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
          endDate: new Date().toISOString().split("T")[0],
        });
        fetchReports(); // Refresh
      } else {
        const data = await res.json();
        setError(data.error || "Failed to generate VoC Report");
      }
    } catch (err) {
      setError("Server connection failure");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteReport = async (id: string, event: React.MouseEvent) => {
    event.stopPropagation();
    if (!confirm("Are you sure you want to delete this report?")) return;
    try {
      const res = await fetch(`/api/reports/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        fetchReports();
      } else {
        alert("Failed to delete report");
      }
    } catch (err) {
      console.error("Delete report error", err);
    }
  };

  const getStats = (report: Report) => {
    try {
      const parsed = JSON.parse(report.contentJson);
      return parsed.stats || { totalItems: 0, positive: 0, neutral: 0, negative: 0 };
    } catch (e) {
      return { totalItems: 0, positive: 0, neutral: 0, negative: 0 };
    }
  };

  const isViewer = session?.user?.role === "VIEWER";
  const isAdmin = session?.user?.role === "ADMIN";

  return (
    <div className="space-y-8">
      {/* Generate Report Bar */}
      <div className="flex flex-col md:flex-row gap-4 justify-between glass-card p-6 rounded-2xl items-start md:items-center">
        <div className="space-y-1">
          <h2 className="text-2xl font-extrabold text-white flex items-center gap-2.5">
            <FileText className="w-6 h-6 text-blue-400" /> Voice of the Customer (VoC) Reports
          </h2>
          <p className="text-sm text-zinc-400">
            Generate narrative summaries of customer feedback trends and strategic recommendations.
          </p>
        </div>
        <div>
          {!isViewer && (
            <button
              onClick={() => setIsModalOpen(true)}
              className="glass-button flex items-center gap-2 text-white rounded-xl px-5 py-3 font-bold text-xs shadow-lg"
            >
              <Plus className="w-4 h-4" /> Generate New Report
            </button>
          )}
        </div>
      </div>

      {/* Reports Grid */}
      {isLoading ? (
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="h-7 w-7 animate-spin text-blue-400" />
        </div>
      ) : reports.length === 0 ? (
        <div className="glass-panel p-12 text-center text-zinc-400 rounded-2xl">
          No VoC reports have been generated yet in this workspace.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {reports.map((report) => {
            const stats = getStats(report);
            const periodStr = `${new Date(report.periodStart).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            })} - ${new Date(report.periodEnd).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}`;
            return (
              <div
                key={report.id}
                onClick={() => router.push(`/reports/${report.id}`)}
                className="glass-card rounded-2xl p-6 flex flex-col justify-between h-68 relative overflow-hidden hover:scale-[1.01] transition-all cursor-pointer"
              >
                <div>
                  <div className="flex justify-between items-start gap-4">
                    <h3 className="text-lg font-bold text-white tracking-tight leading-snug">{report.title}</h3>
                    <span className="glass-pill px-3 py-1 rounded-full text-[11px] text-zinc-300 font-mono flex items-center gap-1.5 whitespace-nowrap">
                      <Calendar className="w-3.5 h-3.5 text-blue-400" /> {periodStr}
                    </span>
                  </div>
                  <div className="mt-5 grid grid-cols-3 gap-3 text-center">
                    <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl py-2.5">
                      <p className="text-[11px] font-bold text-zinc-400 uppercase">Positive</p>
                      <p className="text-xl font-black text-emerald-400 mt-0.5">{stats.positive || 0}</p>
                    </div>
                    <div className="bg-white/[0.03] border border-white/10 rounded-xl py-2.5">
                      <p className="text-[11px] font-bold text-zinc-400 uppercase">Neutral</p>
                      <p className="text-xl font-black text-zinc-300 mt-0.5">{stats.neutral || 0}</p>
                    </div>
                    <div className="bg-rose-500/10 border border-rose-500/20 rounded-xl py-2.5">
                      <p className="text-[11px] font-bold text-zinc-400 uppercase">Negative</p>
                      <p className="text-xl font-black text-rose-400 mt-0.5">{stats.negative || 0}</p>
                    </div>
                  </div>
                </div>

                <div className="flex justify-between items-center border-t border-white/10 pt-4 mt-4 text-xs font-mono text-zinc-400">
                  <span>Created: {new Date(report.createdAt).toLocaleDateString()}</span>
                  <div className="flex gap-4 items-center">
                    {isAdmin && (
                      <button
                        onClick={(e) => handleDeleteReport(report.id, e)}
                        className="text-rose-450 hover:text-rose-400 p-1 rounded-lg hover:bg-white/5 transition-colors"
                        title="Delete Report"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                    <span className="text-xs font-bold text-blue-400 flex items-center gap-1">
                      View Report <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Generate Report Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4 animate-fadeIn">
          <div className="glass-panel relative w-full max-w-lg rounded-2xl p-6 shadow-2xl border border-white/15">
            <div className="flex items-center justify-between mb-5 border-b border-white/10 pb-3">
              <h2 className="text-lg font-bold text-white">Generate VoC Report</h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-zinc-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {error && (
              <div className="rounded-xl bg-rose-500/10 border border-rose-500/20 p-3 mb-4 text-xs font-semibold text-rose-400">
                ⚠️ {error}
              </div>
            )}

            <form onSubmit={handleCreateReport} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-300 mb-1.5">
                  Report Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Q3 Customer Satisfaction Overview"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="glass-input w-full rounded-xl p-2.5 text-sm placeholder-zinc-550"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-300 mb-1.5">
                    Start Date
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className="glass-input w-full rounded-xl p-2.5 text-sm text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-300 mb-1.5">
                    End Date
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    className="glass-input w-full rounded-xl p-2.5 text-sm text-white"
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
                  {isSubmitting ? "Analyzing & Generating..." : "Generate VoC Report"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
