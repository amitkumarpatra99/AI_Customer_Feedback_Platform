"use client";

import { useEffect, useState } from "react";
import { Tag, MessageSquare, X, Loader2, TrendingUp } from "lucide-react";

interface ThemeData {
  id: string;
  name: string;
  description: string | null;
  color: string;
  _count: { feedbacks: number };
  feedbacks: { feedback: { id: string; content: string; sentiment: string; status: string } }[];
}

export default function ThemesPage() {
  const [themes, setThemes] = useState<ThemeData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTheme, setSelectedTheme] = useState<ThemeData | null>(null);

  useEffect(() => {
    const fetchThemes = async () => {
      try {
        const res = await fetch("/api/themes");
        if (res.ok) {
          setThemes(await res.json());
        }
      } catch (error) {
        console.error("Failed to fetch themes", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchThemes();
  }, []);

  const getSentimentColor = (sentiment: string) => {
    if (sentiment === "POSITIVE") return "text-green-400";
    if (sentiment === "NEGATIVE") return "text-red-400";
    return "text-zinc-400";
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">AI Themes</h1>
        <p className="text-sm text-zinc-400">Discover trending topics and categories in your customer feedback.</p>
      </div>

      {isLoading ? (
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        </div>
      ) : themes.length === 0 ? (
        <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-12 text-center text-zinc-500">
          <Tag className="mx-auto h-12 w-12 mb-4 opacity-50" />
          <p>No themes discovered yet. Add more feedback to see AI insights.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {themes.map((theme) => (
            <button
              key={theme.id}
              onClick={() => setSelectedTheme(theme)}
              className="group relative flex flex-col items-start rounded-lg border border-zinc-800 bg-zinc-900 p-5 text-left transition-all hover:border-zinc-600 hover:bg-zinc-800/50"
            >
              {/* Color Indicator */}
              <div 
                className="absolute left-0 top-0 bottom-0 w-1 rounded-l-lg" 
                style={{ backgroundColor: theme.color }} 
              />
              
              <div className="flex w-full items-start justify-between mb-3 pl-3">
                <h3 className="text-lg font-semibold text-white group-hover:text-blue-400 transition-colors">
                  {theme.name}
                </h3>
                <span className="flex items-center gap-1 rounded-full bg-zinc-800 px-2.5 py-1 text-xs font-medium text-zinc-300">
                  <MessageSquare className="h-3 w-3" />
                  {theme._count.feedbacks}
                </span>
              </div>

              <p className="pl-3 text-sm text-zinc-400 line-clamp-2">
                {theme.description || "No description available."}
              </p>

              <div className="mt-4 flex w-full items-center justify-between pl-3">
                <span className="text-xs font-medium text-zinc-500 group-hover:text-zinc-300 transition-colors">
                  View Feedbacks →
                </span>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Theme Detail Modal */}
      {selectedTheme && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-2xl rounded-lg border border-zinc-800 bg-zinc-900 shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div 
              className="flex items-center justify-between p-6 border-b border-zinc-800"
              style={{ backgroundColor: `${selectedTheme.color}15` }} // 15 is hex opacity
            >
              <div className="flex items-center gap-3">
                <div className="h-4 w-4 rounded-full" style={{ backgroundColor: selectedTheme.color }} />
                <div>
                  <h2 className="text-xl font-bold text-white">{selectedTheme.name}</h2>
                  <p className="text-sm text-zinc-400">{selectedTheme._count.feedbacks} total feedbacks</p>
                </div>
              </div>
              <button 
                onClick={() => setSelectedTheme(null)} 
                className="rounded-md p-2 text-zinc-400 hover:bg-zinc-800 hover:text-white transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 max-h-[60vh] overflow-y-auto">
              <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                <TrendingUp className="h-4 w-4" /> Recent Feedbacks
              </h3>
              
              <div className="space-y-3">
                {selectedTheme.feedbacks.map((ft) => (
                  <div key={ft.feedback.id} className="rounded-md border border-zinc-800 bg-zinc-950 p-4">
                    <p className="text-sm text-zinc-200 mb-3 leading-relaxed">"{ft.feedback.content}"</p>
                    <div className="flex items-center gap-3 text-xs">
                      <span className={`font-medium ${getSentimentColor(ft.feedback.sentiment)}`}>
                        {ft.feedback.sentiment}
                      </span>
                      <span className="text-zinc-600">•</span>
                      <span className="text-zinc-500 capitalize">{ft.feedback.status.toLowerCase()}</span>
                    </div>
                  </div>
                ))}
              </div>

              {selectedTheme._count.feedbacks > 5 && (
                <p className="mt-4 text-center text-xs text-zinc-500">
                  Showing 5 of {selectedTheme._count.feedbacks} feedbacks. 
                  <span className="text-blue-400 cursor-pointer ml-1">View all in Inbox</span>
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}