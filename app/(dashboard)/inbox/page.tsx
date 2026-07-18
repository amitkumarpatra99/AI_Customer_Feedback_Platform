// "use client";

// import React, { useState } from "react";
// import { Search, Filter, RefreshCw, Plus } from "lucide-react";

// export default function InboxPage() {
//   const [searchQuery, setSearchQuery] = useState("");
//   const [statusFilter, setStatusFilter] = useState("ALL");
//   const [sentimentFilter, setSentimentFilter] = useState("ALL");

//   const mockFeedback = [
//     {
//       id: "1",
//       content: "The sign up flow gets stuck on verification. Had to refresh three times.",
//       channel: "Support ticket",
//       sentiment: "NEG",
//       status: "NEW",
//       createdAt: "2026-07-12T14:32:00Z",
//       themes: ["Onboarding", "Bugs"]
//     },
//     {
//       id: "2",
//       content: "Excellent performance, dashboard loads super fast now! Love the new UI.",
//       channel: "App store review",
//       sentiment: "POS",
//       status: "REVIEWED",
//       createdAt: "2026-07-12T10:15:00Z",
//       themes: ["Performance", "UX/UI"]
//     },
//     {
//       id: "3",
//       content: "SSO support is essential for our security compliance. Do you have a timeline?",
//       channel: "Sales call note",
//       sentiment: "NEU",
//       status: "ACTIONED",
//       createdAt: "2026-07-11T16:45:00Z",
//       themes: ["Feature Requests", "SSO"]
//     }
//   ];

//   return (
//     <div className="space-y-6">
//       {/* Search and Filters Bar */}
//       <div className="flex flex-col md:flex-row gap-4 justify-between bg-zinc-900 p-4 rounded-lg border border-zinc-800">
//         <div className="relative flex-1">
//           <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
//           <input
//             type="text"
//             placeholder="Search feedback..."
//             value={searchQuery}
//             onChange={(e) => setSearchQuery(e.target.value)}
//             className="w-full bg-zinc-950 border border-zinc-800 rounded-md pl-10 pr-4 py-2 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
//           />
//         </div>
//         <div className="flex flex-wrap gap-3">
//           <select
//             value={statusFilter}
//             onChange={(e) => setStatusFilter(e.target.value)}
//             className="bg-zinc-950 border border-zinc-800 rounded-md px-3 py-2 text-sm text-zinc-300 focus:outline-none focus:border-blue-500"
//           >
//             <option value="ALL">All Statuses</option>
//             <option value="NEW">New</option>
//             <option value="REVIEWED">Reviewed</option>
//             <option value="ACTIONED">Actioned</option>
//           </select>

//           <select
//             value={sentimentFilter}
//             onChange={(e) => setSentimentFilter(e.target.value)}
//             className="bg-zinc-950 border border-zinc-800 rounded-md px-3 py-2 text-sm text-zinc-300 focus:outline-none focus:border-blue-500"
//           >
//             <option value="ALL">All Sentiments</option>
//             <option value="POS">Positive</option>
//             <option value="NEU">Neutral</option>
//             <option value="NEG">Negative</option>
//           </select>

//           <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-750 text-white text-sm px-4 py-2 rounded-md font-medium transition-all">
//             <Plus className="w-4 h-4" /> Add Feedback
//           </button>
//         </div>
//       </div>

//       {/* Feedback List Table */}
//       <div className="bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden">
//         <table className="w-full text-left border-collapse">
//           <thead>
//             <tr className="border-b border-zinc-800 bg-zinc-900/50 text-zinc-400 text-xs font-semibold uppercase tracking-wider">
//               <th className="px-6 py-4">Feedback Content</th>
//               <th className="px-6 py-4">Channel</th>
//               <th className="px-6 py-4">Sentiment</th>
//               <th className="px-6 py-4">Themes</th>
//               <th className="px-6 py-4">Status</th>
//               <th className="px-6 py-4 text-right">Actions</th>
//             </tr>
//           </thead>
//           <tbody className="divide-y divide-zinc-800 text-sm text-zinc-350">
//             {mockFeedback.map((item) => (
//               <tr key={item.id} className="hover:bg-zinc-800/30 transition-colors">
//                 <td className="px-6 py-4 max-w-lg font-medium text-white truncate-2-lines">
//                   {item.content}
//                 </td>
//                 <td className="px-6 py-4 whitespace-nowrap text-zinc-400">
//                   {item.channel}
//                 </td>
//                 <td className="px-6 py-4 whitespace-nowrap">
//                   <span
//                     className={`inline-flex px-2 py-1 rounded text-xs font-semibold ${
//                       item.sentiment === "POS"
//                         ? "bg-green-500/10 text-green-400 border border-green-500/20"
//                         : item.sentiment === "NEG"
//                         ? "bg-red-500/10 text-red-400 border border-red-500/20"
//                         : "bg-zinc-550/10 text-zinc-400 border border-zinc-500/20"
//                     }`}
//                   >
//                     {item.sentiment}
//                   </span>
//                 </td>
//                 <td className="px-6 py-4">
//                   <div className="flex flex-wrap gap-1.5">
//                     {item.themes.map((t) => (
//                       <span
//                         key={t}
//                         className="text-xs px-2 py-0.5 rounded-full bg-zinc-800 border border-zinc-700 text-zinc-350"
//                       >
//                         {t}
//                       </span>
//                     ))}
//                   </div>
//                 </td>
//                 <td className="px-6 py-4 whitespace-nowrap">
//                   <select
//                     defaultValue={item.status}
//                     className="bg-zinc-950 border border-zinc-800 rounded px-2 py-1 text-xs text-zinc-300 focus:outline-none focus:border-blue-500"
//                   >
//                     <option value="NEW">NEW</option>
//                     <option value="REVIEWED">REVIEWED</option>
//                     <option value="ACTIONED">ACTIONED</option>
//                   </select>
//                 </td>
//                 <td className="px-6 py-4 text-right whitespace-nowrap">
//                   <button className="text-blue-500 hover:text-blue-400 text-xs font-semibold flex items-center gap-1 ml-auto">
//                     <RefreshCw className="w-3.5 h-3.5" /> Re-classify
//                   </button>
//                 </td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       </div>
//     </div>
//   );
// }




"use client";

import { useEffect, useState } from "react";
import { Search, Filter, Loader2 } from "lucide-react";

interface Feedback {
  id: string;
  content: string;
  channel: string;
  sentiment: string;
  status: string;
  createdAt: string;
  themes: string[];
}

export default function InboxPage() {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState({ search: "", sentiment: "ALL", status: "ALL" });

  // Page load hone par data fetch karo
  useEffect(() => {
    fetchFeedbacks();
  }, [filters]); // Jab filters change honge, data dobara fetch hoga

  const fetchFeedbacks = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        search: filters.search,
        sentiment: filters.sentiment,
        status: filters.status,
      });
      
      const res = await fetch(`/api/feedback?${params}`);
      if (res.ok) {
        const data = await res.json();
        setFeedbacks(data);
      }
    } catch (error) {
      console.error("Failed to fetch feedbacks", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    if (status === "NEW") return "bg-blue-500/10 text-blue-500 border-blue-500/20";
    if (status === "REVIEWED") return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20";
    return "bg-green-500/10 text-green-500 border-green-500/20"; // ACTIONED
  };

  const getSentimentColor = (sentiment: string) => {
    if (sentiment === "POSITIVE") return "text-green-400";
    if (sentiment === "NEGATIVE") return "text-red-400";
    return "text-zinc-400";
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Feedback Inbox</h1>
        <p className="text-sm text-zinc-400">Manage and review customer feedback.</p>
      </div>

      {/* Filters Section */}
      <div className="flex flex-col gap-4 md:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
          <input
            type="text"
            placeholder="Search feedbacks..."
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            className="w-full rounded-md border border-zinc-800 bg-zinc-900 py-2 pl-10 pr-4 text-sm text-zinc-100 placeholder-zinc-500 focus:border-blue-500 focus:outline-none"
          />
        </div>
        
        <select
          value={filters.sentiment}
          onChange={(e) => setFilters({ ...filters, sentiment: e.target.value })}
          className="rounded-md border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 focus:border-blue-500 focus:outline-none"
        >
          <option value="ALL">All Sentiments</option>
          <option value="POSITIVE">Positive</option>
          <option value="NEUTRAL">Neutral</option>
          <option value="NEGATIVE">Negative</option>
        </select>

        <select
          value={filters.status}
          onChange={(e) => setFilters({ ...filters, status: e.target.value })}
          className="rounded-md border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 focus:border-blue-500 focus:outline-none"
        >
          <option value="ALL">All Statuses</option>
          <option value="NEW">New</option>
          <option value="REVIEWED">Reviewed</option>
          <option value="ACTIONED">Actioned</option>
        </select>
      </div>

      {/* Feedback Table */}
      <div className="rounded-lg border border-zinc-800 bg-zinc-900 overflow-hidden">
        {isLoading ? (
          <div className="flex h-64 items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
          </div>
        ) : feedbacks.length === 0 ? (
          <div className="p-12 text-center text-zinc-500">No feedbacks found matching your filters.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-zinc-950/50 text-zinc-400">
                <tr>
                  <th className="px-6 py-3 font-medium">Status</th>
                  <th className="px-6 py-3 font-medium">Feedback Content</th>
                  <th className="px-6 py-3 font-medium">Sentiment</th>
                  <th className="px-6 py-3 font-medium">Themes</th>
                  <th className="px-6 py-3 font-medium">Channel</th>
                  <th className="px-6 py-3 font-medium">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800">
                {feedbacks.map((feedback) => (
                  <tr key={feedback.id} className="hover:bg-zinc-800/50 transition-colors cursor-pointer">
                    <td className="px-6 py-4">
                      <span className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-medium ${getStatusColor(feedback.status)}`}>
                        {feedback.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 max-w-md truncate text-zinc-200" title={feedback.content}>
                      {feedback.content}
                    </td>
                    <td className={`px-6 py-4 font-medium ${getSentimentColor(feedback.sentiment)}`}>
                      {feedback.sentiment}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {feedback.themes.slice(0, 2).map((theme, i) => (
                          <span key={i} className="rounded bg-zinc-800 px-2 py-0.5 text-xs text-zinc-300">
                            {theme}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-zinc-400">{feedback.channel.replace("_", " ")}</td>
                    <td className="px-6 py-4 text-zinc-500">
                      {new Date(feedback.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}