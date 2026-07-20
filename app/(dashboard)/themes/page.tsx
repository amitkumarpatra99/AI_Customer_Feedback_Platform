"use client";

import React from "react";
import { TrendingUp, ArrowUp, ArrowDown, ExternalLink } from "lucide-react";

export default function TrendsPage() {
  const mockThemes = [
    {
      id: "t1",
      name: "Billing Issues",
      count: 42,
      growth: "+65%",
      isSpiking: true,
      lastFeedback: "Billing page keeps timing out when I try to download an invoice.",
      description: "Concerns regarding billing processes, invoice failures, and currency support."
    },
    {
      id: "t2",
      name: "Onboarding Flow",
      count: 31,
      growth: "+15%",
      isSpiking: false,
      lastFeedback: "Onboarding took forever — I couldn't figure out how to invite my team.",
      description: "Issues related to user setup, registration, and initial team invites."
    },
    {
      id: "t3",
      name: "UI Bugs",
      count: 24,
      growth: "-8%",
      isSpiking: false,
      lastFeedback: "The new dashboard is gorgeous and finally fast. Huge improvement.",
      description: "Visual bugs, latency, and layout issues across client pages."
    }
  ];

  return (
    <div className="space-y-8">
      {/* Header Info */}
      <div className="glass-card rounded-2xl p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h2 className="text-2xl font-extrabold text-white flex items-center gap-2.5">
            <TrendingUp className="w-6 h-6 text-blue-400" /> Active Themes & Spike Detection
          </h2>
          <p className="text-sm text-zinc-400">
            Compare customer interest levels and volume spikes week-over-week.
          </p>
        </div>
        <div>
          <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold bg-rose-500/15 border border-rose-500/30 text-rose-400 shadow-[0_0_15px_rgba(244,63,94,0.3)]">
            <span className="h-2 w-2 rounded-full bg-rose-400 animate-ping" /> 🚨 1 Theme Spiking Today
          </span>
        </div>
      </div>

      {/* Themes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {mockThemes.map((theme) => (
          <div
            key={theme.id}
            className={`glass-card rounded-2xl p-6 flex flex-col justify-between h-80 relative overflow-hidden transition-all duration-300 ${
              theme.isSpiking ? "border-rose-500/50 shadow-[0_0_30px_rgba(244,63,94,0.2)] bg-rose-950/10" : ""
            }`}
          >
            <div>
              <div className="flex justify-between items-start">
                <h3 className="text-lg font-bold text-white tracking-tight">{theme.name}</h3>
                <span
                  className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${
                    theme.isSpiking
                      ? "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                      : theme.growth.startsWith("+")
                      ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                      : "bg-zinc-800 text-zinc-400"
                  }`}
                >
                  {theme.growth.startsWith("+") ? (
                    <ArrowUp className="w-3 h-3" />
                  ) : (
                    <ArrowDown className="w-3 h-3" />
                  )}
                  {theme.growth}
                </span>
              </div>
              <p className="text-xs text-zinc-400 mt-2 leading-relaxed">{theme.description}</p>
              
              <div className="mt-4 bg-white/[0.03] rounded-xl p-3.5 border border-white/10">
                <p className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">Representative Verbatim</p>
                <p className="text-xs text-zinc-200 mt-1 italic font-light">"{theme.lastFeedback}"</p>
              </div>
            </div>

            <div className="flex justify-between items-center border-t border-white/10 pt-4 mt-4">
              <span className="text-xs font-bold text-white tracking-wide">{theme.count} Feedback Items</span>
              <button className="text-xs font-bold text-blue-400 hover:text-blue-300 flex items-center gap-1.5 transition-colors">
                View Drill-down <ExternalLink className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
