"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft, MessageSquare } from "lucide-react";

export default function FeedbackDetailPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Link
        href="/inbox"
        className="glass-button-secondary inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold"
      >
        <ArrowLeft className="h-4 w-4" /> Back to Inbox
      </Link>

      <div className="glass-card rounded-2xl p-6 space-y-6">
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
              <MessageSquare className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Feedback Details</h1>
              <p className="text-xs text-zinc-400">Customer voice log detail entry</p>
            </div>
          </div>
          <span className="glass-pill px-3 py-1 rounded-full text-xs font-bold text-blue-400 border-blue-500/30">
            SUPPORT TICKET
          </span>
        </div>

        <div className="space-y-2">
          <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Content</h3>
          <div className="bg-white/[0.03] rounded-xl p-4 border border-white/10 text-sm text-zinc-200 leading-relaxed">
            "The app experience has improved significantly with the new glass interface. However, exports still take a few seconds."
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
          <div className="glass-panel p-4 rounded-xl space-y-1">
            <span className="text-xs text-zinc-400 font-medium">Sentiment</span>
            <p className="text-sm font-bold text-emerald-400">POSITIVE (0.82)</p>
          </div>
          <div className="glass-panel p-4 rounded-xl space-y-1">
            <span className="text-xs text-zinc-400 font-medium">Status</span>
            <p className="text-sm font-bold text-blue-400">REVIEWED</p>
          </div>
          <div className="glass-panel p-4 rounded-xl space-y-1">
            <span className="text-xs text-zinc-400 font-medium">Logged Date</span>
            <p className="text-sm font-bold text-zinc-200 font-mono">2026-07-20</p>
          </div>
        </div>
      </div>
    </div>
  );
}
