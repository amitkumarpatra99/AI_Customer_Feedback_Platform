"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  LineChart, Line, Legend, PieChart, Pie, Cell 
} from "recharts";
import { 
  FileText, Calendar, Plus, X, Loader2, Trash2, ArrowRight, TrendingUp, BarChart3, Download
} from "lucide-react";
import { toast } from "sonner";

interface Report {
  id: string;
  title: string;
  periodStart: string;
  periodEnd: string;
  contentJson: string; // Stored as JSON string
  createdAt: string;
  generatedBy?: {
    name: string;
  };
}

interface ReportData {
  sentimentTrend: { date: string; POSITIVE: number; NEGATIVE: number; NEUTRAL: number }[];
  channelReport: { channel: string; count: number }[];
  topThemes: { name: string; count: number }[];
  summary: {
    totalFeedbacks: number;
    actionedFeedbacks: number;
    actionRate: number;
    period: string;
  };
}

const COLORS = ["#3b82f6", "#10b981", "#ef4444", "#f59e0b", "#8b5cf6"];

export default function ReportsPage() {
  const { data: session } = useSession();
  const router = useRouter();

  // Active Tab state: "VOC" or "ANALYTICS"
  const [activeTab, setActiveTab] = useState<"VOC" | "ANALYTICS">("VOC");

  // VOC Tab States
  const [reports, setReports] = useState<Report[]>([]);
  const [isLoadingVoc, setIsLoadingVoc] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    endDate: new Date().toISOString().split("T")[0],
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [vocError, setVocError] = useState("");

  // ANALYTICS Tab States
  const [analyticsData, setAnalyticsData] = useState<ReportData | null>(null);
  const [isLoadingAnalytics, setIsLoadingAnalytics] = useState(true);
  const [days, setDays] = useState(30);

  // Fetch VOC Reports
  const fetchVocReports = async () => {
    setIsLoadingVoc(true);
    try {
      const res = await fetch("/api/reports");
      if (res.ok) {
        const data = await res.json();
        setReports(data);
      }
    } catch (err) {
      console.error("Failed to load VoC reports", err);
    } finally {
      setIsLoadingVoc(false);
    }
  };

  // Fetch Analytics Charts Data
  const fetchAnalyticsData = async () => {
    setIsLoadingAnalytics(true);
    try {
      const res = await fetch(`/api/reports?charts=true&days=${days}`);
      if (res.ok) {
        const data = await res.json();
        setAnalyticsData(data);
      }
    } catch (err) {
      console.error("Failed to fetch reports analytics charts", err);
    } finally {
      setIsLoadingAnalytics(false);
    }
  };

  useEffect(() => {
    if (activeTab === "VOC") {
      fetchVocReports();
    } else {
      fetchAnalyticsData();
    }
  }, [activeTab, days]);

  const handleCreateReport = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setVocError("");

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
        toast.success("VoC narrative report generated successfully!");
        fetchVocReports(); // Refresh
      } else {
        const data = await res.json();
        setVocError(data.error || "Failed to generate VoC Report");
      }
    } catch (err) {
      setVocError("Server connection failure");
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
        toast.success("Report deleted successfully");
        fetchVocReports();
      } else {
        toast.error("Failed to delete report");
      }
    } catch (err) {
      console.error("Delete report error", err);
    }
  };

  const handleExportCSV = () => {
    if (!analyticsData) return;
    
    // Create CSV content
    const csvContent = [
      ["Report Type", "Metric", "Value"],
      ["Summary", "Total Feedbacks", analyticsData.summary.totalFeedbacks],
      ["Summary", "Actioned Feedbacks", analyticsData.summary.actionedFeedbacks],
      ["Summary", "Action Rate", `${analyticsData.summary.actionRate}%`],
      [""],
      ["Channel Performance"],
      ...analyticsData.channelReport.map(c => ["Channel", c.channel, c.count]),
      [""],
      ["Top Themes"],
      ...analyticsData.topThemes.map(t => ["Theme", t.name, t.count])
    ].map(row => row.join(",")).join("\n");

    // Download CSV
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `loop-analytics-report-${days}days.csv`;
    a.click();
    toast.success("CSV report downloaded successfully!");
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
      {/* Top Banner and Navigation Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-5">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <FileText className="h-7 w-7 text-blue-450" /> Intelligence Reports
          </h1>
          <p className="text-sm text-zinc-400">Generate narrative AI reports or analyze general customer feedback trends.</p>
        </div>

        {/* Tab Selector Buttons */}
        <div className="flex bg-white/[0.04] p-1 rounded-xl border border-white/5 self-start sm:self-center">
          <button
            onClick={() => setActiveTab("VOC")}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-lg transition-all ${
              activeTab === "VOC"
                ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            <FileText className="w-3.5 h-3.5" /> VoC AI Reports
          </button>
          <button
            onClick={() => setActiveTab("ANALYTICS")}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-lg transition-all ${
              activeTab === "ANALYTICS"
                ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" /> Analytics Trends
          </button>
        </div>
      </div>

      {/* Tab Content 1: VoC AI Reports */}
      {activeTab === "VOC" && (
        <div className="space-y-6">
          <div className="flex justify-between items-center bg-white/[0.02] border border-white/5 rounded-2xl p-5">
            <div>
              <h3 className="text-base font-bold text-white">Narrative Executive Summaries</h3>
              <p className="text-xs text-zinc-400 mt-0.5">Create narrative Voice of Customer report documents grounded in feedback logs.</p>
            </div>
            {!isViewer && (
              <button
                onClick={() => setIsModalOpen(true)}
                className="glass-button flex items-center gap-2 text-white rounded-xl px-4 py-2.5 font-bold text-xs shadow-lg"
              >
                <Plus className="w-4 h-4" /> Generate Report
              </button>
            )}
          </div>

          {isLoadingVoc ? (
            <div className="flex h-64 items-center justify-center">
              <Loader2 className="h-7 w-7 animate-spin text-blue-450" />
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
                    className="glass-card rounded-2xl p-6 flex flex-col justify-between h-68 relative overflow-hidden hover:scale-[1.01] transition-all cursor-pointer border border-white/5"
                  >
                    {/* Glow strip */}
                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-indigo-500" />
                    
                    <div>
                      <div className="flex justify-between items-start gap-4">
                        <h3 className="text-lg font-bold text-white tracking-tight leading-snug">{report.title}</h3>
                        <span className="glass-pill px-3 py-1 rounded-full text-[11px] text-zinc-300 font-mono flex items-center gap-1.5 whitespace-nowrap">
                          <Calendar className="w-3.5 h-3.5 text-blue-450" /> {periodStr}
                        </span>
                      </div>
                      
                      <div className="mt-5 grid grid-cols-3 gap-3 text-center">
                        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl py-2.5">
                          <p className="text-[11px] font-bold text-zinc-400 uppercase">Positive</p>
                          <p className="text-xl font-black text-emerald-400 mt-0.5">{stats.positive || 0}</p>
                        </div>
                        <div className="bg-white/[0.03] border border-white/10 rounded-xl py-2.5">
                          <p className="text-[11px] font-bold text-zinc-400 uppercase">Neutral</p>
                          <p className="text-xl font-black text-zinc-350 mt-0.5">{stats.neutral || 0}</p>
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
                            className="text-rose-450 hover:text-rose-400 p-1.5 rounded-lg hover:bg-white/5 transition-colors"
                            title="Delete Report"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                        <span className="text-xs font-bold text-blue-400 flex items-center gap-1">
                          View details <ArrowRight className="w-3.5 h-3.5" />
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Generate VoC Report Modal */}
          {isModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4 animate-fadeIn">
              <div className="glass-panel relative w-full max-w-lg rounded-2xl p-6 shadow-2xl border border-white/15">
                <div className="flex items-center justify-between mb-5 border-b border-white/10 pb-3">
                  <h2 className="text-lg font-bold text-white">Generate VoC Report</h2>
                  <button onClick={() => setIsModalOpen(false)} className="text-zinc-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors">
                    <X className="h-5 w-5" />
                  </button>
                </div>

                {vocError && (
                  <div className="rounded-xl bg-rose-500/10 border border-rose-500/20 p-3.5 mb-4 text-xs font-semibold text-rose-400">
                    ⚠️ {vocError}
                  </div>
                )}

                <form onSubmit={handleCreateReport} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-300 mb-1.5">Report Title</label>
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
                      <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-300 mb-1.5">Start Date</label>
                      <input
                        type="date"
                        required
                        value={formData.startDate}
                        onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                        className="glass-input w-full rounded-xl p-2.5 text-sm text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-300 mb-1.5">End Date</label>
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
                      {isSubmitting ? "Processing..." : "Generate VoC Report"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab Content 2: Analytics & Trends (origin/main behavior) */}
      {activeTab === "ANALYTICS" && (
        <div className="space-y-6 animate-fadeIn">
          {/* Controls bar */}
          <div className="flex justify-between items-center bg-white/[0.02] border border-white/5 rounded-2xl p-5">
            <div>
              <h3 className="text-base font-bold text-white">Feedback Analytics Trends</h3>
              <p className="text-xs text-zinc-400 mt-0.5">Visualize channel distributions and weekly sentiment trends.</p>
            </div>
            
            <div className="flex items-center gap-3">
              <select
                value={days}
                onChange={(e) => setDays(parseInt(e.target.value))}
                className="glass-input rounded-xl px-3.5 py-2 text-xs font-bold"
              >
                <option value={7} className="bg-zinc-900">Last 7 days</option>
                <option value={30} className="bg-zinc-900">Last 30 days</option>
                <option value={90} className="bg-zinc-900">Last 90 days</option>
              </select>

              <button
                onClick={handleExportCSV}
                className="glass-button flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold text-white shadow-md cursor-pointer"
              >
                <Download className="h-4 w-4" /> Export CSV
              </button>
            </div>
          </div>

          {isLoadingAnalytics ? (
            <div className="flex h-64 items-center justify-center">
              <Loader2 className="h-7 w-7 animate-spin text-blue-450" />
            </div>
          ) : !analyticsData ? (
            <div className="text-red-500 p-6 text-center">Failed to load reports analytics data.</div>
          ) : (
            <div className="space-y-6">
              {/* Summary Cards */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div className="glass-card rounded-2xl p-5 border border-white/5">
                  <p className="text-xs font-bold uppercase tracking-wider text-zinc-400">Total Feedbacks</p>
                  <p className="mt-2 text-3xl font-black text-white">{analyticsData.summary.totalFeedbacks}</p>
                  <p className="mt-1 text-[10px] text-zinc-500 font-mono">{analyticsData.summary.period}</p>
                </div>
                <div className="glass-card rounded-2xl p-5 border border-white/5">
                  <p className="text-xs font-bold uppercase tracking-wider text-zinc-400">Actioned Logs</p>
                  <p className="mt-2 text-3xl font-black text-emerald-400">{analyticsData.summary.actionedFeedbacks}</p>
                  <p className="mt-1 text-[10px] text-zinc-500 font-mono">Resolved tickets</p>
                </div>
                <div className="glass-card rounded-2xl p-5 border border-white/5">
                  <p className="text-xs font-bold uppercase tracking-wider text-zinc-400">Action Rate</p>
                  <p className="mt-2 text-3xl font-black text-blue-400">{analyticsData.summary.actionRate}%</p>
                  <p className="mt-1 text-[10px] text-zinc-500 font-mono">Resolution efficiency</p>
                </div>
              </div>

              {/* Charts grid */}
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                {/* Sentiment Trend */}
                <div className="glass-card rounded-2xl p-6 lg:col-span-2 border border-white/5">
                  <h3 className="mb-4 text-sm font-bold text-zinc-200 tracking-wide flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-blue-400" /> Sentiment Trend Over Time
                  </h3>
                  <div className="h-80 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={analyticsData.sentimentTrend}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                        <XAxis dataKey="date" stroke="#a1a1aa" fontSize={12} tickLine={false} />
                        <YAxis stroke="#a1a1aa" fontSize={12} tickLine={false} />
                        <Tooltip contentStyle={{ backgroundColor: "rgba(18, 18, 24, 0.85)", backdropFilter: "blur(12px)", borderColor: "rgba(255,255,255,0.15)", borderRadius: "12px", color: "#ffffff" }} />
                        <Legend />
                        <Line type="monotone" dataKey="POSITIVE" stroke="#22c55e" strokeWidth={3} dot={{ r: 4 }} />
                        <Line type="monotone" dataKey="NEGATIVE" stroke="#ef4444" strokeWidth={3} dot={{ r: 4 }} />
                        <Line type="monotone" dataKey="NEUTRAL" stroke="#a1a1aa" strokeWidth={3} dot={{ r: 4 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Channel Performance */}
                <div className="glass-card rounded-2xl p-6 border border-white/5">
                  <h3 className="mb-4 text-sm font-bold text-zinc-200 tracking-wide">Channel Performance</h3>
                  <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={analyticsData.channelReport} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" horizontal={false} />
                        <XAxis type="number" stroke="#a1a1aa" fontSize={12} tickLine={false} />
                        <YAxis dataKey="channel" type="category" stroke="#f4f4f5" fontSize={12} width={120} tickLine={false} />
                        <Tooltip contentStyle={{ backgroundColor: "rgba(18, 18, 24, 0.85)", backdropFilter: "blur(12px)", borderColor: "rgba(255,255,255,0.15)", borderRadius: "12px", color: "#ffffff" }} />
                        <Bar dataKey="count" fill="#3b82f6" radius={[0, 6, 6, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Top Themes */}
                <div className="glass-card rounded-2xl p-6 border border-white/5">
                  <h3 className="mb-4 text-sm font-bold text-zinc-200 tracking-wide">Top 5 Themes</h3>
                  <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={analyticsData.topThemes}
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          dataKey="count"
                          label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                          labelLine={false}
                        >
                          {analyticsData.topThemes.map((_, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip contentStyle={{ backgroundColor: "rgba(18, 18, 24, 0.85)", backdropFilter: "blur(12px)", borderColor: "rgba(255,255,255,0.15)", borderRadius: "12px", color: "#ffffff" }} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}