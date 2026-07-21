"use client";

import React from "react";
import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="relative flex min-h-screen flex-col bg-zinc-950 text-zinc-50 font-sans overflow-hidden">
      {/* Ambient Radial Background Glows */}
      <div className="pointer-events-none absolute top-0 left-1/4 h-[500px] w-[500px] rounded-full bg-blue-600/15 blur-[140px]" />
      <div className="pointer-events-none absolute top-1/3 right-1/4 h-[500px] w-[500px] rounded-full bg-indigo-600/15 blur-[140px]" />
      <div className="pointer-events-none absolute bottom-10 left-1/3 h-[400px] w-[400px] rounded-full bg-purple-600/10 blur-[130px]" />

      {/* Header */}
      <header className="sticky top-0 z-50 h-20 flex items-center justify-between px-8 border-b border-white/10 bg-zinc-950/50 backdrop-blur-xl">
        <span className="text-xl font-bold tracking-wider text-white flex items-center gap-2.5">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white font-black text-base shadow-[0_0_20px_rgba(59,130,246,0.5)]">
            🔄
          </div>
          Project <span className="bg-gradient-to-r from-blue-400 to-indigo-300 bg-clip-text text-transparent">LOOP</span>
        </span>
        <div className="flex gap-4">
          <Link
            href="/login"
            className="px-5 py-2.5 text-sm font-semibold text-zinc-300 hover:text-white glass-button-secondary rounded-xl transition-all"
          >
            Login
          </Link>
          <Link
            href="/signup"
            className="px-5 py-2.5 text-sm font-semibold glass-button text-white rounded-xl transition-all shadow-lg shadow-blue-500/20"
          >
            Get Started
          </Link>
        </div>
      </header>

      {/* Hero */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center text-center px-4 max-w-5xl mx-auto space-y-10 py-20">
        <div className="space-y-6">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 glass-pill rounded-full text-xs font-bold uppercase tracking-wider text-blue-400 border-blue-500/30 shadow-[0_0_15px_rgba(59,130,246,0.2)]">
            <span className="h-2 w-2 rounded-full bg-blue-400 animate-pulse" /> Zidio Internship Project Brief
          </span>
          <h1 className="text-4xl sm:text-7xl font-black text-white leading-tight tracking-tight">
            Close the loop on <br />
            <span className="bg-gradient-to-r from-blue-400 via-indigo-300 to-violet-400 bg-clip-text text-transparent">
              customer feedback
            </span>
          </h1>
          <p className="text-lg sm:text-xl text-zinc-300 max-w-3xl mx-auto leading-relaxed font-light">
            Ingest customer tickets, reviews, survey results, and sales notes. LOOP automatically classifies themes, maps sentiments, and answers plain-English queries grounded in your data.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center w-full max-w-md">
          <Link
            href="/signup"
            className="px-8 py-4 glass-button text-white font-bold rounded-2xl text-base transition-all shadow-xl shadow-blue-600/30 flex items-center justify-center gap-2"
          >
            Initialize Workspace ➔
          </Link>
          <Link
            href="/login"
            className="px-8 py-4 glass-button-secondary font-bold rounded-2xl text-base transition-all flex items-center justify-center"
          >
            Sign in as Demo User
          </Link>
        </div>

        {/* Feature Highlights (Glass Cards) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-16 text-left w-full">
          <div className="glass-card rounded-2xl p-6 space-y-3 relative overflow-hidden group">
            <div className="h-12 w-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
              ⚡
            </div>
            <h3 className="text-lg font-bold text-white">AI Classification</h3>
            <p className="text-sm text-zinc-400 leading-relaxed">
              Automatic sentiment scoring (-1 to 1) and tagging of key product themes in real-time.
            </p>
          </div>

          <div className="glass-card rounded-2xl p-6 space-y-3 relative overflow-hidden group">
            <div className="h-12 w-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
              🔍
            </div>
            <h3 className="text-lg font-bold text-white">Grounded Q&A</h3>
            <p className="text-sm text-zinc-400 leading-relaxed">
              Ask plain-English questions directly and receive answers cited from verified feedback logs.
            </p>
          </div>

          <div className="glass-card rounded-2xl p-6 space-y-3 relative overflow-hidden group">
            <div className="h-12 w-12 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
              📈
            </div>
            <h3 className="text-lg font-bold text-white">Spike Trends</h3>
            <p className="text-sm text-zinc-400 leading-relaxed">
              Monitor active customer issues and detect volume spikes week-over-week automatically.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="h-16 flex items-center justify-center border-t border-white/10 bg-zinc-950/40 backdrop-blur-md text-zinc-400 text-xs tracking-wider">
        &copy; 2026 Project LOOP. Enrolled Interns Workspace.
      </footer>
    </div>
  );
}
