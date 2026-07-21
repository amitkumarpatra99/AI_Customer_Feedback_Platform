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
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
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
            onClick={handleExport}
            className="flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
          >
            <Download className="h-4 w-4" /> Export CSV
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-5">
          <p className="text-sm text-zinc-400">Total Feedbacks</p>
          <p className="mt-2 text-3xl font-bold text-white">{data.summary.totalFeedbacks}</p>
          <p className="mt-1 text-xs text-zinc-500">{data.summary.period}</p>
        </div>
        <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-5">
          <p className="text-sm text-zinc-400">Actioned</p>
          <p className="mt-2 text-3xl font-bold text-green-400">{data.summary.actionedFeedbacks}</p>
          <p className="mt-1 text-xs text-zinc-500">Resolved issues</p>
        </div>
        <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-5">
          <p className="text-sm text-zinc-400">Action Rate</p>
          <p className="mt-2 text-3xl font-bold text-blue-400">{data.summary.actionRate}%</p>
          <p className="mt-1 text-xs text-zinc-500">Resolution efficiency</p>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        
        {/* Sentiment Trend */}
        <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-6 lg:col-span-2">
          <h3 className="mb-4 text-sm font-semibold text-zinc-300 flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-blue-500" /> Sentiment Trend Over Time
          </h3>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.sentimentTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                <XAxis dataKey="date" stroke="#71717a" fontSize={12} />
                <YAxis stroke="#71717a" fontSize={12} />
                <Tooltip contentStyle={{ backgroundColor: "#18181b", borderColor: "#27272a", color: "#f4f4f5" }} />
                <Legend />
                <Line type="monotone" dataKey="POSITIVE" stroke="#22c55e" strokeWidth={2} />
                <Line type="monotone" dataKey="NEGATIVE" stroke="#ef4444" strokeWidth={2} />
                <Line type="monotone" dataKey="NEUTRAL" stroke="#a1a1aa" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Channel Performance */}
        <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-6">
          <h3 className="mb-4 text-sm font-semibold text-zinc-300">Channel Performance</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.channelReport} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" horizontal={false} />
                <XAxis type="number" stroke="#71717a" fontSize={12} />
                <YAxis dataKey="channel" type="category" stroke="#f4f4f5" fontSize={12} width={120} />
                <Tooltip contentStyle={{ backgroundColor: "#18181b", borderColor: "#27272a", color: "#f4f4f5" }} />
                <Bar dataKey="count" fill="#3b82f6" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Themes */}
        <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-6">
          <h3 className="mb-4 text-sm font-semibold text-zinc-300">Top 5 Themes</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data.topThemes}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="count"
                  label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                  labelLine={false}
                >
                  {data.topThemes.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: "#18181b", borderColor: "#27272a", color: "#f4f4f5" }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
    </div>
  );
}