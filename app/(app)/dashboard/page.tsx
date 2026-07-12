"use client";

import React from "react";
import { MessageSquare, ThumbsUp, AlertCircle, ArrowUpRight } from "lucide-react";

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      {/* Stat Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total Feedback */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-5 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-zinc-400">Total Feedback</p>
            <p className="mt-1 text-3xl font-semibold text-white">1,248</p>
          </div>
          <div className="p-3 bg-blue-500/10 rounded-lg text-blue-500">
            <MessageSquare className="w-6 h-6" />
          </div>
        </div>

        {/* Positive Sentiment */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-5 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-zinc-400">Positive Sentiment</p>
            <p className="mt-1 text-3xl font-semibold text-white">68%</p>
          </div>
          <div className="p-3 bg-green-500/10 rounded-lg text-green-500">
            <ThumbsUp className="w-6 h-6" />
          </div>
        </div>

        {/* Negative Spike Alert */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-5 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-zinc-400">Negative Volume</p>
            <p className="mt-1 text-3xl font-semibold text-white">12%</p>
          </div>
          <div className="p-3 bg-red-500/10 rounded-lg text-red-500">
            <AlertCircle className="w-6 h-6" />
          </div>
        </div>

        {/* Weekly Growth */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-5 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-zinc-400">Weekly Change</p>
            <p className="mt-1 text-3xl font-semibold text-white flex items-baseline gap-1">
              +14.2% <span className="text-xs text-green-500 font-medium">up</span>
            </p>
          </div>
          <div className="p-3 bg-zinc-800 rounded-lg text-zinc-450">
            <ArrowUpRight className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Grid for Charts & Themes */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-zinc-900 border border-zinc-800 rounded-lg p-6 h-96 flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-medium text-white">Feedback Volume & Sentiment</h3>
            <p className="text-sm text-zinc-450">Daily volume of customer feedback ingested</p>
          </div>
          <div className="flex items-center justify-center flex-1 border border-dashed border-zinc-800 rounded-lg mt-4 text-zinc-500 text-sm">
            {/* Recharts chart placeholder */}
            [Recharts Line/Bar Chart - Loading Volume Over Time]
          </div>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-medium text-white">Top Themes</h3>
            <p className="text-sm text-zinc-450">Most active themes this week</p>
          </div>
          <div className="space-y-4 mt-6 flex-1">
            {[
              { name: "Billing Issues", count: 42, percentage: 80, color: "bg-red-500" },
              { name: "Onboarding Flow", count: 31, percentage: 60, color: "bg-blue-500" },
              { name: "UI Bugs", count: 24, percentage: 45, color: "bg-amber-500" },
              { name: "Feature Requests", count: 18, percentage: 35, color: "bg-green-500" }
            ].map((theme) => (
              <div key={theme.name} className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="font-medium text-zinc-350">{theme.name}</span>
                  <span className="text-zinc-500">{theme.count} items</span>
                </div>
                <div className="w-full bg-zinc-800 h-2 rounded-full overflow-hidden">
                  <div className={`h-full ${theme.color}`} style={{ width: `${theme.percentage}%` }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
