"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, FileText, Download, Loader2, Calendar, User } from "lucide-react";

interface ReportDetail {
  id: string;
  title: string;
  periodStart: string;
  periodEnd: string;
  contentJson: string;
  createdAt: string;
  generatedBy?: {
    name: string;
  };
}

export default function ReportDetailPage() {
  const params = useParams();
  const id = params.id as string;

  const [report, setReport] = useState<ReportDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (id) {
      fetchReportDetails();
    }
  }, [id]);

  const fetchReportDetails = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/reports/${id}`);
      if (res.ok) {
        const data = await res.json();
        setReport(data);
      } else {
        setError("Report not found or has been deleted.");
      }
    } catch (err) {
      console.error("Failed to load report detail", err);
      setError("Failed to fetch report from server.");
    } finally {
      setIsLoading(false);
    }
  };

  const getStats = (contentJson: string) => {
    try {
      const parsed = JSON.parse(contentJson);
      return parsed.stats || { totalItems: 0, positive: 0, neutral: 0, negative: 0 };
    } catch (e) {
      return { totalItems: 0, positive: 0, neutral: 0, negative: 0 };
    }
  };

  const getNarrative = (contentJson: string) => {
    try {
      const parsed = JSON.parse(contentJson);
      return parsed.narrative || "";
    } catch (e) {
      return "";
    }
  };

  // Custom renderer for markdown content returned by AI model
  const renderNarrative = (text: string) => {
    if (!text) return null;
    return text.split("\n").map((line, idx) => {
      const trimmed = line.trim();
      if (trimmed.startsWith("## ")) {
        return <h2 key={idx} className="text-xl font-extrabold text-white mt-8 mb-4 border-b border-white/10 pb-1.5 tracking-tight">{trimmed.replace("## ", "")}</h2>;
      }
      if (trimmed.startsWith("### ")) {
        return <h3 key={idx} className="text-base font-bold text-blue-400 mt-5 mb-2.5 tracking-wide">{trimmed.replace("### ", "")}</h3>;
      }
      if (trimmed.startsWith("- ")) {
        return <li key={idx} className="text-sm text-zinc-350 list-disc ml-5 mb-1.5 leading-relaxed">{trimmed.replace("- ", "")}</li>;
      }
      if (trimmed.startsWith("> ")) {
        return <blockquote key={idx} className="border-l-4 border-blue-500/50 pl-4 py-2 my-4 italic text-zinc-200 bg-white/[0.01] rounded-r-lg">{trimmed.replace("> ", "")}</blockquote>;
      }
      if (trimmed === "") return <div key={idx} className="h-2" />;
      return <p key={idx} className="text-sm text-zinc-300 leading-relaxed mb-4 font-light">{trimmed}</p>;
    });
  };

  if (isLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        <span className="ml-2 text-zinc-400 font-medium">Loading report analysis...</span>
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <Link
          href="/reports"
          className="glass-button-secondary inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Reports
        </Link>
        <div className="glass-panel p-8 text-center text-rose-455 font-bold rounded-2xl">
          ⚠️ {error || "Report details not available."}
        </div>
      </div>
    );
  }

  const stats = getStats(report.contentJson);
  const narrative = getNarrative(report.contentJson);
  const periodStr = `${new Date(report.periodStart).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  })} to ${new Date(report.periodEnd).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  })}`;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Link
        href="/reports"
        className="glass-button-secondary inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold"
      >
        <ArrowLeft className="h-4 w-4" /> Back to Reports
      </Link>

      <div className="glass-card rounded-2xl p-6 space-y-6 relative overflow-hidden">
        {/* Glow Strip */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500" />

        {/* Top Report Info */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-white/10 pb-5 gap-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white tracking-tight">{report.title}</h1>
              <p className="text-xs text-zinc-400 mt-0.5 flex items-center gap-2">
                <span>Voice of Customer Report</span>
                <span className="h-1.5 w-1.5 rounded-full bg-zinc-650" />
                <span className="font-mono">Created: {new Date(report.createdAt).toLocaleDateString()}</span>
              </p>
            </div>
          </div>
          <button 
            onClick={() => window.print()}
            className="glass-button flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold text-white self-start sm:self-center"
          >
            <Download className="h-4 w-4" /> Print / Export PDF
          </button>
        </div>

        {/* Details Metadata */}
        <div className="flex flex-wrap gap-4 text-xs font-medium text-zinc-400 font-mono">
          <div className="flex items-center gap-1.5 bg-white/[0.03] px-3 py-1.5 rounded-lg border border-white/5">
            <Calendar className="w-3.5 h-3.5 text-blue-400" /> Period: <strong className="text-zinc-250 font-sans">{periodStr}</strong>
          </div>
          <div className="flex items-center gap-1.5 bg-white/[0.03] px-3 py-1.5 rounded-lg border border-white/5">
            <User className="w-3.5 h-3.5 text-blue-400" /> Generated by: <strong className="text-zinc-250 font-sans">{report.generatedBy?.name || "Workspace Analyst"}</strong>
          </div>
        </div>

        {/* Sentiment Grid summary */}
        <div className="grid grid-cols-3 gap-4 text-center mt-6">
          <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl py-3">
            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Positive Sentiment</p>
            <p className="text-2xl font-black text-emerald-400 mt-0.5">{stats.positive || 0}</p>
          </div>
          <div className="bg-white/[0.03] border border-white/10 rounded-xl py-3">
            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Neutral Sentiment</p>
            <p className="text-2xl font-black text-zinc-300 mt-0.5">{stats.neutral || 0}</p>
          </div>
          <div className="bg-rose-500/10 border border-rose-500/20 rounded-xl py-3">
            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Negative Sentiment</p>
            <p className="text-2xl font-black text-rose-400 mt-0.5">{stats.negative || 0}</p>
          </div>
        </div>

        {/* Narrative report container */}
        <div className="border-t border-white/10 pt-6 mt-6">
          <div className="text-sm text-zinc-200 bg-white/[0.01] rounded-2xl p-6 border border-white/5 shadow-inner">
            {renderNarrative(narrative)}
          </div>
        </div>
      </div>
    </div>
  );
}
