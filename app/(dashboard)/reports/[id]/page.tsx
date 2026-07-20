"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft, FileText, Download } from "lucide-react";

export default function ReportDetailPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Link
        href="/reports"
        className="glass-button-secondary inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold"
      >
        <ArrowLeft className="h-4 w-4" /> Back to Reports
      </Link>

      <div className="glass-card rounded-2xl p-6 space-y-6">
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Weekly Summary - July W2</h1>
              <p className="text-xs text-zinc-400">Generated Voice of Customer Report</p>
            </div>
          </div>
          <button className="glass-button flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold text-white">
            <Download className="h-4 w-4" /> Export PDF
          </button>
        </div>

        <div className="space-y-4 text-sm text-zinc-300 leading-relaxed">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">Executive Summary</h3>
          <p>
            Customer feedback during the second week of July reflects high satisfaction with performance and interface upgrades.
            However, minor onboarding friction was detected on team invitations.
          </p>
        </div>
      </div>
    </div>
  );
}
