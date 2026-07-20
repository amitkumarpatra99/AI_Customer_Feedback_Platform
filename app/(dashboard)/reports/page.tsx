"use client";

import React, { useState } from "react";
import { FileText, Calendar, Plus, ExternalLink, Download } from "lucide-react";

export default function ReportsPage() {
  const [loading, setLoading] = useState(false);

  const mockReports = [
    {
      id: "r1",
      title: "Weekly Summary - July W2",
      period: "Jul 5, 2026 - Jul 12, 2026",
      createdAt: "2026-07-12T18:00:00Z",
      stats: { total: 148, positive: 100, neutral: 30, negative: 18 }
    },
    {
      id: "r2",
      title: "Onboarding Flow Focus Report",
      period: "Jun 1, 2026 - Jun 30, 2026",
      createdAt: "2026-07-01T10:00:00Z",
      stats: { total: 840, positive: 520, neutral: 180, negative: 140 }
    }
  ];

  const handleGenerate = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
    }, 1500);
  };

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
          <button
            onClick={handleGenerate}
            disabled={loading}
            className="glass-button flex items-center gap-2 text-white rounded-xl px-5 py-3 font-bold text-xs shadow-lg disabled:opacity-50"
          >
            <Plus className="w-4 h-4" /> {loading ? "Generating..." : "Generate New Report"}
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
        ))}
      </div>
    </div>
  );
}
