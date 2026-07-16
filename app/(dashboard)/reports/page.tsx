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
    <div className="space-y-6">
      {/* Generate Report Bar */}
      <div className="flex flex-col md:flex-row gap-4 justify-between bg-zinc-900 p-6 rounded-lg border border-zinc-800 items-center">
        <div className="space-y-1">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-500" /> Voice of the Customer (VoC) Reports
          </h2>
          <p className="text-sm text-zinc-450">
            Generate narrative summaries of customer feedback trends and recommendations.
          </p>
        </div>
        <div>
          <button
            onClick={handleGenerate}
            disabled={loading}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-750 text-white rounded-md px-4 py-2.5 font-semibold text-sm transition-all disabled:opacity-50"
          >
            <Plus className="w-4 h-4" /> {loading ? "Generating..." : "Generate New Report"}
          </button>
        </div>
      </div>

      {/* Reports Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {mockReports.map((report) => (
          <div key={report.id} className="bg-zinc-900 border border-zinc-800 rounded-lg p-5 flex flex-col justify-between h-56">
            <div>
              <div className="flex justify-between items-start">
                <h3 className="text-lg font-semibold text-white">{report.title}</h3>
                <span className="inline-flex items-center gap-1 text-xs text-zinc-450">
                  <Calendar className="w-3.5 h-3.5" /> {report.period}
                </span>
              </div>
              <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                <div className="bg-green-500/5 border border-green-500/10 rounded py-2">
                  <p className="text-xs text-zinc-450">Positive</p>
                  <p className="text-lg font-bold text-green-400">{report.stats.positive}</p>
                </div>
                <div className="bg-zinc-800/20 border border-zinc-800 rounded py-2">
                  <p className="text-xs text-zinc-450">Neutral</p>
                  <p className="text-lg font-bold text-zinc-450">{report.stats.neutral}</p>
                </div>
                <div className="bg-red-500/5 border border-red-500/10 rounded py-2">
                  <p className="text-xs text-zinc-450">Negative</p>
                  <p className="text-lg font-bold text-red-400">{report.stats.negative}</p>
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center border-t border-zinc-800 pt-3 mt-4">
              <span className="text-xs text-zinc-500">
                Created: {new Date(report.createdAt).toLocaleDateString()}
              </span>
              <div className="flex gap-3">
                <button className="text-xs font-semibold text-zinc-400 hover:text-zinc-300 flex items-center gap-1">
                  <Download className="w-3.5 h-3.5" /> Export PDF
                </button>
                <button className="text-xs font-semibold text-blue-500 hover:text-blue-400 flex items-center gap-1">
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
