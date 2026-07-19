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

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("/api/dashboard/stats");
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
    fetchData();
  }, []);

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
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Analytics Dashboard</h1>
        <p className="text-sm text-zinc-400">Overview of your customer feedback intelligence.</p>
      </div>

      {/* 1. Stat Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard 
          title="Total Feedbacks" 
          value={data.stats.totalFeedbacks} 
          icon={<MessageSquare className="h-5 w-5 text-blue-500" />} 
        />
        <StatCard 
          title="Negative Feedbacks" 
          value={data.stats.negativeFeedbacks} 
          subValue={`${data.stats.totalFeedbacks > 0 ? Math.round((data.stats.negativeFeedbacks / data.stats.totalFeedbacks) * 100) : 0}% of total`}
          icon={<TrendingDown className="h-5 w-5 text-red-500" />} 
        />
        <StatCard 
          title="New This Week" 
          value={data.stats.newThisWeek} 
          icon={<Clock className="h-5 w-5 text-yellow-500" />} 
        />
        <StatCard 
          title="Action Rate" 
          value={`${data.stats.actionRate}%`} 
          icon={<CheckCircle2 className="h-5 w-5 text-green-500" />} 
        />
      </div>

      {/* 2. Charts Section */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        
        {/* Volume Over Time Chart */}
        <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-6">
          <h3 className="mb-4 text-sm font-semibold text-zinc-300">Feedback Volume (Last 30 Days)</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.volume}>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                <XAxis dataKey="date" stroke="#71717a" fontSize={12} />
                <YAxis stroke="#71717a" fontSize={12} />
                <Tooltip 
                  contentStyle={{ backgroundColor: "#18181b", borderColor: "#27272a", color: "#f4f4f5" }} 
                />
                <Line type="monotone" dataKey="count" stroke="#3b82f6" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Sentiment Breakdown Chart */}
        <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-6">
          <h3 className="mb-4 text-sm font-semibold text-zinc-300">Sentiment Breakdown</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data.sentiment}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {data.sentiment.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[entry.name as keyof typeof COLORS] || "#a1a1aa"} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: "#18181b", borderColor: "#27272a", color: "#f4f4f5" }} />
              </PieChart>
            </ResponsiveContainer>
            {/* Custom Legend */}
            <div className="mt-4 flex justify-center gap-4 text-xs">
              {data.sentiment.map((s) => (
                <div key={s.name} className="flex items-center gap-1.5">
                  <div className="h-3 w-3 rounded-full" style={{ backgroundColor: COLORS[s.name as keyof typeof COLORS] || "#a1a1aa" }} />
                  <span className="text-zinc-400 capitalize">{s.name}: {s.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Top Themes Chart */}
        <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-6 lg:col-span-2">
          <h3 className="mb-4 text-sm font-semibold text-zinc-300">Top 5 Themes</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.themes} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" horizontal={false} />
                <XAxis type="number" stroke="#71717a" fontSize={12} />
                <YAxis dataKey="name" type="category" stroke="#f4f4f5" fontSize={12} width={100} />
                <Tooltip cursor={{ fill: "#27272a" }} contentStyle={{ backgroundColor: "#18181b", borderColor: "#27272a", color: "#f4f4f5" }} />
                <Bar dataKey="count" radius={[0, 4, 4, 0]}>
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

// Reusable Stat Card Component
function StatCard({ title, value, subValue, icon }: { title: string; value: string | number; subValue?: string; icon: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-5 transition-colors hover:border-zinc-700">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-zinc-400">{title}</p>
        <div className="rounded-full bg-zinc-800 p-2">{icon}</div>
      </div>
      <p className="mt-3 text-3xl font-bold text-white">{value}</p>
      {subValue && <p className="mt-1 text-xs text-zinc-500">{subValue}</p>}
    </div>
  );
}