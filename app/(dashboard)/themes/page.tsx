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
      description: "Visual bugs, latency, and layout layout issues across client pages."
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-blue-500" /> Active Themes & Spike Detection
          </h2>
          <p className="text-sm text-zinc-450">
            Compare customer interest levels and volume spikes week-over-week.
          </p>
        </div>
        <div className="text-right">
          <span className="inline-flex px-3 py-1 bg-red-500/10 border border-red-500/20 text-red-400 rounded-full text-xs font-semibold">
            🚨 1 Theme Spiking Today
          </span>
        </div>
      </div>

      {/* Themes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {mockThemes.map((theme) => (
          <div
            key={theme.id}
            className={`bg-zinc-900 border ${
              theme.isSpiking ? "border-red-500/50 shadow-md shadow-red-950/20" : "border-zinc-800"
            } rounded-lg p-5 flex flex-col justify-between h-72`}
          >
            <div>
              <div className="flex justify-between items-start">
                <h3 className="text-lg font-semibold text-white">{theme.name}</h3>
                <span
                  className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded text-xs font-semibold ${
                    theme.isSpiking
                      ? "bg-red-500/10 text-red-400"
                      : theme.growth.startsWith("+")
                      ? "bg-green-500/10 text-green-400"
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
              <p className="text-xs text-zinc-450 mt-1">{theme.description}</p>
              <div className="mt-4 bg-zinc-950/60 rounded p-3 border border-zinc-800/50">
                <p className="text-xs font-medium text-zinc-400">Representative Verbatim:</p>
                <p className="text-xs text-zinc-350 mt-1 italic">"{theme.lastFeedback}"</p>
              </div>
            </div>

            <div className="flex justify-between items-center border-t border-zinc-800 pt-3 mt-4">
              <span className="text-sm font-semibold text-white">{theme.count} Feedback Items</span>
              <button className="text-xs font-semibold text-blue-500 hover:text-blue-400 flex items-center gap-1">
                View Drill-down <ExternalLink className="w-3 h-3" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
