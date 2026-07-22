"use client";

import { useEffect, useState } from "react";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, LineChart, Line 
} from "recharts";
import { MessageSquare, TrendingDown, Clock, CheckCircle2, Loader2 } from "lucide-react";

interface DashboardData {
  stats: { totalFeedbacks: number; negativeFeedbacks: number; newThisWeek: number; actionRate: number };
  sentiment: { name: string; value: number }[];
  volume: { date: string; count: number }[];
  themes: { name: string; count: number; color: string }[];
}

const COLORS = { POSITIVE: "#22c55e", NEUTRAL: "#a1a1aa", NEGATIVE: "#ef4444" };

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [timePeriod, setTimePeriod] = useState("30");
  const [channel, setChannel] = useState("ALL");

  const fetchData = async () => {
    try {
      const res = await fetch(`/api/dashboard/stats?days=${timePeriod}&channel=${channel}`);
      if (res.ok) {
        const jsonData = await res.json();
        setData(jsonData);
      }
    } catch (error) {
      console.error("Failed to fetch dashboard data", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [timePeriod, channel]);

  if (isLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        <span className="ml-2 text-zinc-400">Loading analytics...</span>
      </div>
    );
  }

  if (!data) return <div className="text-red-500">Failed to load data.</div>;

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-5">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Analytics Dashboard</h1>
          <p className="text-sm text-zinc-400">Overview of your customer feedback intelligence.</p>
        </div>
        
        <div className="flex gap-3">
          <div>
            <select
              aria-label="Filter by time period"
              value={timePeriod}
              onChange={(e) => {
                setIsLoading(true);
                setTimePeriod(e.target.value);
              }}
              className="glass-input rounded-xl px-4 py-2.5 text-xs font-semibold"
            >
              <option value="7" className="bg-zinc-900">Last 7 Days</option>
              <option value="30" className="bg-zinc-900">Last 30 Days</option>
              <option value="90" className="bg-zinc-900">Last 90 Days</option>
              <option value="ALL" className="bg-zinc-900">All Time</option>
            </select>
          </div>

          <div>
            <select
              aria-label="Filter by feedback channel"
              value={channel}
              onChange={(e) => {
                setIsLoading(true);
                setChannel(e.target.value);
              }}
              className="glass-input rounded-xl px-4 py-2.5 text-xs font-semibold"
            >
              <option value="ALL" className="bg-zinc-900">All Channels</option>
              <option value="SUPPORT_TICKET" className="bg-zinc-900">Support Ticket</option>
              <option value="APP_STORE" className="bg-zinc-900">App Store Review</option>
              <option value="NPS_SURVEY" className="bg-zinc-900">NPS Survey</option>
              <option value="SALES_CALL" className="bg-zinc-900">Sales Call Note</option>
              <option value="COMMUNITY" className="bg-zinc-900">Community Post</option>
              <option value="OTHER" className="bg-zinc-900">Other</option>
            </select>
          </div>
        </div>
      </div>

      {/* 1. Stat Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard 
          title="Total Feedbacks" 
          value={data.stats.totalFeedbacks} 
          icon={<MessageSquare className="h-5 w-5 text-blue-400" />} 
          glowColor="from-blue-500/20 to-blue-600/5"
        />
        <StatCard 
          title="Negative Feedbacks" 
          value={data.stats.negativeFeedbacks} 
          subValue={`${data.stats.totalFeedbacks > 0 ? Math.round((data.stats.negativeFeedbacks / data.stats.totalFeedbacks) * 100) : 0}% of total`}
          icon={<TrendingDown className="h-5 w-5 text-rose-400" />} 
          glowColor="from-rose-500/20 to-rose-600/5"
        />
        <StatCard 
          title="New This Week" 
          value={data.stats.newThisWeek} 
          icon={<Clock className="h-5 w-5 text-amber-400" />} 
          glowColor="from-amber-500/20 to-amber-600/5"
        />
        <StatCard 
          title="Action Rate" 
          value={`${data.stats.actionRate}%`} 
          icon={<CheckCircle2 className="h-5 w-5 text-emerald-400" />} 
          glowColor="from-emerald-500/20 to-emerald-600/5"
        />
      </div>

      {/* 2. Charts Section */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        
        {/* Volume Over Time Chart */}
        <div className="glass-card rounded-2xl p-6 relative overflow-hidden">
          <h3 className="mb-4 text-sm font-bold text-zinc-200 tracking-wide">Feedback Volume (Last 30 Days)</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.volume}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                <XAxis dataKey="date" stroke="#a1a1aa" fontSize={12} tickLine={false} />
                <YAxis stroke="#a1a1aa" fontSize={12} tickLine={false} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: "rgba(18, 18, 24, 0.85)", 
                    backdropFilter: "blur(12px)", 
                    borderColor: "rgba(255,255,255,0.15)", 
                    borderRadius: "12px", 
                    color: "#ffffff" 
                  }} 
                />
                <Line type="monotone" dataKey="count" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4, fill: "#60a5fa" }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Sentiment Breakdown Chart */}
        <div className="glass-card rounded-2xl p-6 relative overflow-hidden">
          <h3 className="mb-4 text-sm font-bold text-zinc-200 tracking-wide">Sentiment Breakdown</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data.sentiment}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={6}
                  dataKey="value"
                >
                  {data.sentiment.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[entry.name as keyof typeof COLORS] || "#a1a1aa"} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: "rgba(18, 18, 24, 0.85)", 
                    backdropFilter: "blur(12px)", 
                    borderColor: "rgba(255,255,255,0.15)", 
                    borderRadius: "12px", 
                    color: "#ffffff" 
                  }} 
                />
              </PieChart>
            </ResponsiveContainer>
            {/* Custom Legend */}
            <div className="mt-4 flex justify-center gap-4 text-xs font-medium">
              {data.sentiment.map((s) => (
                <div key={s.name} className="flex items-center gap-2 glass-pill px-3 py-1 rounded-full">
                  <div className="h-2.5 w-2.5 rounded-full shadow-[0_0_8px_currentColor]" style={{ backgroundColor: COLORS[s.name as keyof typeof COLORS] || "#a1a1aa" }} />
                  <span className="text-zinc-300 capitalize">{s.name}: <strong className="text-white">{s.value}</strong></span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Top Themes Chart */}
        <div className="glass-card rounded-2xl p-6 lg:col-span-2 relative overflow-hidden">
          <h3 className="mb-4 text-sm font-bold text-zinc-200 tracking-wide">Top 5 Themes</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.themes} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" horizontal={false} />
                <XAxis type="number" stroke="#a1a1aa" fontSize={12} tickLine={false} />
                <YAxis dataKey="name" type="category" stroke="#f4f4f5" fontSize={12} width={110} tickLine={false} />
                <Tooltip 
                  cursor={{ fill: "rgba(255,255,255,0.05)" }} 
                  contentStyle={{ 
                    backgroundColor: "rgba(18, 18, 24, 0.85)", 
                    backdropFilter: "blur(12px)", 
                    borderColor: "rgba(255,255,255,0.15)", 
                    borderRadius: "12px", 
                    color: "#ffffff" 
                  }} 
                />
                <Bar dataKey="count" radius={[0, 6, 6, 0]}>
                  {data.themes.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
    </div>
  );
}

// Reusable Stat Card Component with Glass Aesthetic
function StatCard({ title, value, subValue, icon, glowColor }: { title: string; value: string | number; subValue?: string; icon: React.ReactNode; glowColor: string }) {
  return (
    <div className="glass-card rounded-2xl p-5 relative overflow-hidden group">
      <div className={`pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full bg-gradient-to-br ${glowColor} blur-xl group-hover:scale-150 transition-transform`} />
      <div className="flex items-center justify-between relative z-10">
        <p className="text-xs font-bold uppercase tracking-wider text-zinc-400">{title}</p>
        <div className="rounded-xl bg-white/[0.08] border border-white/10 p-2.5 shadow-inner">{icon}</div>
      </div>
      <p className="mt-4 text-3xl font-black text-white tracking-tight relative z-10">{value}</p>
      {subValue && <p className="mt-1.5 text-xs font-semibold text-rose-400/90 relative z-10">{subValue}</p>}
    </div>
  );
}