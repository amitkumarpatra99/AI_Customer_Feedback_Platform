"use client";

import { useEffect, useState } from "react";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  LineChart, Line, Legend, PieChart, Pie, Cell 
} from "recharts";
import { FileText, Download, Calendar, TrendingUp, Loader2 } from "lucide-react";

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

const COLORS = ["#3b82f6", "#22c55e", "#ef4444", "#f59e0b", "#8b5cf6"];

export default function ReportsPage() {
  const [data, setData] = useState<ReportData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [days, setDays] = useState(30);

  useEffect(() => {
    fetchReports();
  }, [days]);

  const fetchReports = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/reports?days=${days}`);
      if (res.ok) {
        setData(await res.json());
      }
    } catch (error) {
      console.error("Failed to fetch reports", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExport = () => {
    if (!data) return;
    
    // Create CSV content
    const csvContent = [
      ["Report Type", "Metric", "Value"],
      ["Summary", "Total Feedbacks", data.summary.totalFeedbacks],
      ["Summary", "Actioned Feedbacks", data.summary.actionedFeedbacks],
      ["Summary", "Action Rate", `${data.summary.actionRate}%`],
      [""],
      ["Channel Performance"],
      ...data.channelReport.map(c => ["Channel", c.channel, c.count]),
      [""],
      ["Top Themes"],
      ...data.topThemes.map(t => ["Theme", t.name, t.count])
    ].map(row => row.join(",")).join("\n");

    // Download CSV
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `loop-report-${days}days.csv`;
    a.click();
  };

  if (isLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (!data) return <div className="text-red-500">Failed to load reports.</div>;

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
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <FileText className="h-6 w-6 text-blue-500" /> Reports
          </h1>
          <p className="text-sm text-zinc-400">Comprehensive analysis of your customer feedback.</p>
        </div>
        
        <div className="flex gap-3">
          <select
            value={days}
            onChange={(e) => setDays(parseInt(e.target.value))}
            className="rounded-md border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 focus:border-blue-500 focus:outline-none"
          >
            <option value={7}>Last 7 days</option>
            <option value={30}>Last 30 days</option>
            <option value={90}>Last 90 days</option>
          </select>
          
          <button
            onClick={handleGenerate}
            disabled={loading}
            className="glass-button flex items-center gap-2 text-white rounded-xl px-5 py-3 font-bold text-xs shadow-lg disabled:opacity-50"
          >
            <Download className="h-4 w-4" /> Export CSV
          </button>
        </div>
      </div>

      {/* Reports Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {mockReports.map((report) => (
          <div key={report.id} className="glass-card rounded-2xl p-6 flex flex-col justify-between h-64 relative overflow-hidden">
            <div>
              <div className="flex justify-between items-start">
                <h3 className="text-lg font-bold text-white tracking-tight">{report.title}</h3>
                <span className="glass-pill px-3 py-1 rounded-full text-xs text-zinc-300 font-mono flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-blue-400" /> {report.period}
                </span>
              </div>
              <div className="mt-5 grid grid-cols-3 gap-3 text-center">
                <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl py-2.5">
                  <p className="text-[11px] font-bold text-zinc-400 uppercase">Positive</p>
                  <p className="text-xl font-black text-emerald-400 mt-0.5">{report.stats.positive}</p>
                </div>
                <div className="bg-white/[0.03] border border-white/10 rounded-xl py-2.5">
                  <p className="text-[11px] font-bold text-zinc-400 uppercase">Neutral</p>
                  <p className="text-xl font-black text-zinc-300 mt-0.5">{report.stats.neutral}</p>
                </div>
                <div className="bg-rose-500/10 border border-rose-500/20 rounded-xl py-2.5">
                  <p className="text-[11px] font-bold text-zinc-400 uppercase">Negative</p>
                  <p className="text-xl font-black text-rose-400 mt-0.5">{report.stats.negative}</p>
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center border-t border-white/10 pt-4 mt-4">
              <span className="text-xs text-zinc-400 font-mono">
                Created: {new Date(report.createdAt).toLocaleDateString()}
              </span>
              <div className="flex gap-4">
                <button className="text-xs font-bold text-zinc-400 hover:text-white flex items-center gap-1.5 transition-colors">
                  <Download className="w-3.5 h-3.5" /> Export PDF
                </button>
                <button className="text-xs font-bold text-blue-400 hover:text-blue-300 flex items-center gap-1.5 transition-colors">
                  View Report <ExternalLink className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}