"use client";

import React from "react";
import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-zinc-950 text-zinc-50 font-sans">
      {/* Header */}
      <header className="h-20 flex items-center justify-between px-8 border-b border-zinc-800 bg-zinc-900/50">
        <span className="text-xl font-bold tracking-wider text-white flex items-center gap-2">
          <span className="text-blue-500">🔄</span> Project LOOP
        </span>
        <div className="flex gap-4">
          <Link
            href="/login"
            className="px-4 py-2 text-sm font-semibold text-zinc-350 hover:text-white transition-colors"
          >
            Login
          </Link>
          <Link
            href="/signup"
            className="px-4 py-2 text-sm font-semibold bg-blue-600 hover:bg-blue-750 text-white rounded-md transition-all"
          >
            Get Started
          </Link>
        </div>
      </header>

      {/* Hero */}
      <main className="flex-1 flex flex-col items-center justify-center text-center px-4 max-w-4xl mx-auto space-y-8 py-20">
        <div className="space-y-4">
          <span className="inline-flex px-3 py-1 bg-blue-650/10 border border-blue-600/30 text-blue-400 rounded-full text-xs font-semibold uppercase tracking-wider">
            Zidio Internship Project Brief
          </span>
          <h1 className="text-4xl sm:text-6xl font-extrabold text-white leading-tight">
            Close the loop on <span className="text-blue-500">customer feedback</span>
          </h1>
          <p className="text-lg sm:text-xl text-zinc-400 max-w-2xl mx-auto">
            Ingest customer tickets, reviews, survey results, and sales notes. LOOP automatically classifies themes, maps sentiments, and answers plain-English queries grounded in your data.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/signup"
            className="px-8 py-3.5 bg-blue-600 hover:bg-blue-750 text-white font-bold rounded-lg transition-all shadow-lg shadow-blue-900/25"
          >
            Initialize Workspace
          </Link>
          <Link
            href="/login"
            className="px-8 py-3.5 border border-zinc-800 bg-zinc-900 hover:bg-zinc-800 text-zinc-100 font-bold rounded-lg transition-all"
          >
            Sign in as Demo User
          </Link>
        </div>

        {/* Feature Highlights */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-16 text-left">
          <div className="bg-zinc-900 border border-zinc-805 rounded-xl p-6 space-y-2">
            <span className="text-2xl">⚡</span>
            <h3 className="text-base font-bold text-white">AI Classification</h3>
            <p className="text-sm text-zinc-450">
              Automatic sentiment scoring (-1 to 1) and tagging of key product themes.
            </p>
          </div>
          <div className="bg-zinc-900 border border-zinc-805 rounded-xl p-6 space-y-2">
            <span className="text-2xl">🔍</span>
            <h3 className="text-base font-bold text-white">Grounded Q&A</h3>
            <p className="text-sm text-zinc-450">
              Ask questions directly and receive answers cited from verified feedback logs.
            </p>
          </div>
          <div className="bg-zinc-900 border border-zinc-805 rounded-xl p-6 space-y-2">
            <span className="text-2xl">📈</span>
            <h3 className="text-base font-bold text-white">Spike Trends</h3>
            <p className="text-sm text-zinc-450">
              Monitor active customer issues and detect volume spikes week-over-week.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="h-16 flex items-center justify-center border-t border-zinc-800 text-zinc-500 text-xs">
        &copy; 2026 Project LOOP. Enrolled Interns Workspace.
      </footer>
    </div>
  );
}
