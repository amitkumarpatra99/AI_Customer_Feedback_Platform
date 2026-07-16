"use client";

import React, { useState } from "react";
import { Search, Filter, RefreshCw, Plus } from "lucide-react";

export default function InboxPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [sentimentFilter, setSentimentFilter] = useState("ALL");

  const mockFeedback = [
    {
      id: "1",
      content: "The sign up flow gets stuck on verification. Had to refresh three times.",
      channel: "Support ticket",
      sentiment: "NEG",
      status: "NEW",
      createdAt: "2026-07-12T14:32:00Z",
      themes: ["Onboarding", "Bugs"]
    },
    {
      id: "2",
      content: "Excellent performance, dashboard loads super fast now! Love the new UI.",
      channel: "App store review",
      sentiment: "POS",
      status: "REVIEWED",
      createdAt: "2026-07-12T10:15:00Z",
      themes: ["Performance", "UX/UI"]
    },
    {
      id: "3",
      content: "SSO support is essential for our security compliance. Do you have a timeline?",
      channel: "Sales call note",
      sentiment: "NEU",
      status: "ACTIONED",
      createdAt: "2026-07-11T16:45:00Z",
      themes: ["Feature Requests", "SSO"]
    }
  ];

  return (
    <div className="space-y-6">
      {/* Search and Filters Bar */}
      <div className="flex flex-col md:flex-row gap-4 justify-between bg-zinc-900 p-4 rounded-lg border border-zinc-800">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
          <input
            type="text"
            placeholder="Search feedback..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-zinc-950 border border-zinc-800 rounded-md pl-10 pr-4 py-2 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          />
        </div>
        <div className="flex flex-wrap gap-3">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-zinc-950 border border-zinc-800 rounded-md px-3 py-2 text-sm text-zinc-300 focus:outline-none focus:border-blue-500"
          >
            <option value="ALL">All Statuses</option>
            <option value="NEW">New</option>
            <option value="REVIEWED">Reviewed</option>
            <option value="ACTIONED">Actioned</option>
          </select>

          <select
            value={sentimentFilter}
            onChange={(e) => setSentimentFilter(e.target.value)}
            className="bg-zinc-950 border border-zinc-800 rounded-md px-3 py-2 text-sm text-zinc-300 focus:outline-none focus:border-blue-500"
          >
            <option value="ALL">All Sentiments</option>
            <option value="POS">Positive</option>
            <option value="NEU">Neutral</option>
            <option value="NEG">Negative</option>
          </select>

          <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-750 text-white text-sm px-4 py-2 rounded-md font-medium transition-all">
            <Plus className="w-4 h-4" /> Add Feedback
          </button>
        </div>
      </div>

      {/* Feedback List Table */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-zinc-800 bg-zinc-900/50 text-zinc-400 text-xs font-semibold uppercase tracking-wider">
              <th className="px-6 py-4">Feedback Content</th>
              <th className="px-6 py-4">Channel</th>
              <th className="px-6 py-4">Sentiment</th>
              <th className="px-6 py-4">Themes</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800 text-sm text-zinc-350">
            {mockFeedback.map((item) => (
              <tr key={item.id} className="hover:bg-zinc-800/30 transition-colors">
                <td className="px-6 py-4 max-w-lg font-medium text-white truncate-2-lines">
                  {item.content}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-zinc-400">
                  {item.channel}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`inline-flex px-2 py-1 rounded text-xs font-semibold ${
                      item.sentiment === "POS"
                        ? "bg-green-500/10 text-green-400 border border-green-500/20"
                        : item.sentiment === "NEG"
                        ? "bg-red-500/10 text-red-400 border border-red-500/20"
                        : "bg-zinc-550/10 text-zinc-400 border border-zinc-500/20"
                    }`}
                  >
                    {item.sentiment}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-wrap gap-1.5">
                    {item.themes.map((t) => (
                      <span
                        key={t}
                        className="text-xs px-2 py-0.5 rounded-full bg-zinc-800 border border-zinc-700 text-zinc-350"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <select
                    defaultValue={item.status}
                    className="bg-zinc-950 border border-zinc-800 rounded px-2 py-1 text-xs text-zinc-300 focus:outline-none focus:border-blue-500"
                  >
                    <option value="NEW">NEW</option>
                    <option value="REVIEWED">REVIEWED</option>
                    <option value="ACTIONED">ACTIONED</option>
                  </select>
                </td>
                <td className="px-6 py-4 text-right whitespace-nowrap">
                  <button className="text-blue-500 hover:text-blue-400 text-xs font-semibold flex items-center gap-1 ml-auto">
                    <RefreshCw className="w-3.5 h-3.5" /> Re-classify
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
