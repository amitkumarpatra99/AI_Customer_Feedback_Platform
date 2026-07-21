"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { TrendingUp, Plus, X, Loader2, Tag, ArrowRight } from "lucide-react";

interface Theme {
  id: string;
  name: string;
  description: string | null;
  color: string;
  _count?: {
    feedbacks: number;
  };
}

const PRESET_COLORS = [
  "#3b82f6", // Blue
  "#ef4444", // Red
  "#10b981", // Emerald
  "#f59e0b", // Amber
  "#8b5cf6", // Purple
  "#ec4899", // Pink
];

export default function TrendsPage() {
  const { data: session } = useSession();
  const router = useRouter();
  
  const [themes, setThemes] = useState<Theme[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Create Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ name: "", description: "", color: PRESET_COLORS[0] });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchThemes();
  }, []);

  const fetchThemes = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/themes");
      if (res.ok) {
        const data = await res.json();
        setThemes(data);
      }
    } catch (err) {
      console.error("Failed to fetch themes", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateTheme = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      const res = await fetch("/api/themes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setIsModalOpen(false);
        setFormData({ name: "", description: "", color: PRESET_COLORS[0] });
        fetchThemes(); // Refresh list
      } else {
        const data = await res.json();
        setError(data.error || "Failed to create theme tag");
      }
    } catch (err) {
      setError("Failed to communicate with server");
    } finally {
      setIsSubmitting(false);
    }
  };

  const isViewer = session?.user?.role === "VIEWER";

  return (
    <div className="space-y-8">
      {/* Header Info */}
      <div className="glass-card rounded-2xl p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h2 className="text-2xl font-extrabold text-white flex items-center gap-2.5">
            <TrendingUp className="w-6 h-6 text-blue-400" /> Active Feedback Themes
          </h2>
          <p className="text-sm text-zinc-400">
            Categorized AI-discovered themes and product tag frequencies.
          </p>
        </div>
        
        {!isViewer && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="glass-button flex items-center gap-2 text-white rounded-xl px-5 py-2.5 font-bold text-xs shadow-lg"
          >
            <Plus className="w-4 h-4" /> Add Theme Tag
          </button>
        )}
      </div>

      {/* Loader */}
      {isLoading ? (
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="h-7 w-7 animate-spin text-blue-400" />
        </div>
      ) : themes.length === 0 ? (
        <div className="glass-panel p-12 text-center text-zinc-400 rounded-2xl">
          No feedback themes configured in this workspace yet.
        </div>
      ) : (
        /* Themes Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {themes.map((theme) => {
            const count = theme._count?.feedbacks || 0;
            return (
              <div
                key={theme.id}
                style={{ borderColor: `${theme.color}30` }}
                className="glass-card rounded-2xl p-6 flex flex-col justify-between h-72 border hover:shadow-lg transition-all duration-300 relative overflow-hidden group"
              >
                {/* Glowing subtle top color strip */}
                <div 
                  className="absolute top-0 left-0 right-0 h-1.5 opacity-80" 
                  style={{ backgroundColor: theme.color }}
                />
                
                <div>
                  <div className="flex justify-between items-start">
                    <h3 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
                      <Tag className="w-4 h-4" style={{ color: theme.color }} />
                      {theme.name}
                    </h3>
                  </div>
                  <p className="text-xs text-zinc-400 mt-3 leading-relaxed">
                    {theme.description || `Customer feedback logs tagged under ${theme.name}.`}
                  </p>
                </div>

                <div className="flex justify-between items-center border-t border-white/10 pt-4 mt-4">
                  <div>
                    <span className="block text-[10px] font-bold uppercase tracking-wider text-zinc-450">Active Logs</span>
                    <span className="text-lg font-black text-white">{count} Feedback Items</span>
                  </div>
                  <button 
                    onClick={() => router.push(`/inbox?theme=${theme.name}`)}
                    className="text-xs font-bold flex items-center gap-1 hover:gap-2 transition-all"
                    style={{ color: theme.color }}
                  >
                    View Drill-down <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Theme Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4 animate-fadeIn">
          <div className="glass-panel relative w-full max-w-md rounded-2xl p-6 shadow-2xl border border-white/15">
            <div className="flex items-center justify-between mb-5 border-b border-white/10 pb-3">
              <h2 className="text-lg font-bold text-white">Create New Theme Tag</h2>
              <button 
                onClick={() => setIsModalOpen(false)} 
                className="text-zinc-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            {error && (
              <div className="rounded-xl bg-rose-500/10 border border-rose-500/20 p-3 mb-4 text-xs font-semibold text-rose-450">
                ⚠️ {error}
              </div>
            )}

            <form onSubmit={handleCreateTheme} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-300 mb-1.5">Theme Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Billing Issues, Security, UI Bugs"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="glass-input w-full rounded-xl p-2.5 text-sm placeholder-zinc-550"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-300 mb-1.5">Description</label>
                <textarea
                  rows={3}
                  placeholder="Describe the topics and keywords matching this feedback theme..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="glass-input w-full rounded-xl p-2.5 text-sm placeholder-zinc-550"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-300 mb-2">Color Label</label>
                <div className="flex gap-3 items-center">
                  {PRESET_COLORS.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setFormData({ ...formData, color: c })}
                      style={{ backgroundColor: c }}
                      className={`h-7 w-7 rounded-full transition-transform border border-black/30 ${
                        formData.color === c ? "scale-125 ring-2 ring-white/50" : "hover:scale-110"
                      }`}
                    />
                  ))}
                  <input 
                    type="color" 
                    value={formData.color}
                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                    className="h-8 w-8 bg-transparent border-0 cursor-pointer"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)} 
                  className="glass-button-secondary rounded-xl px-4 py-2 text-xs font-semibold text-zinc-300"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={isSubmitting} 
                  className="glass-button rounded-xl px-5 py-2 text-xs font-bold text-white shadow-md disabled:opacity-50"
                >
                  {isSubmitting ? "Saving..." : "Create Theme"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
