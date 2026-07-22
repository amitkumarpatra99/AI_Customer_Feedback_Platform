"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { TrendingUp, Plus, X, Loader2, Tag, ArrowRight, MessageSquare, Edit3, Trash2 } from "lucide-react";
import { toast } from "sonner";

interface FeedbackThemeJoin {
  feedback: {
    id: string;
    content: string;
    sentiment: string;
    status: string;
  };
}

interface Theme {
  id: string;
  name: string;
  description: string | null;
  color: string;
  feedbacks: FeedbackThemeJoin[];
  _count: {
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
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [createFormData, setCreateFormData] = useState({ name: "", description: "", color: PRESET_COLORS[0] });
  const [isCreating, setIsCreating] = useState(false);

  // Detail & Edit Modal State
  const [selectedTheme, setSelectedTheme] = useState<Theme | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editFormData, setEditFormData] = useState({ name: "", description: "", color: "" });
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

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
    setIsCreating(true);

    try {
      const res = await fetch("/api/themes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(createFormData),
      });

      if (res.ok) {
        setIsCreateOpen(false);
        setCreateFormData({ name: "", description: "", color: PRESET_COLORS[0] });
        toast.success("Theme tag created successfully!");
        fetchThemes(); // Refresh list
      } else {
        const data = await res.json();
        toast.error(data.error || "Failed to create theme tag");
      }
    } catch (err) {
      toast.error("Failed to communicate with server");
    } finally {
      setIsCreating(false);
    }
  };

  const handleUpdateTheme = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTheme) return;
    setIsSaving(true);

    try {
      const res = await fetch(`/api/themes/${selectedTheme.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editFormData),
      });

      if (res.ok) {
        toast.success("Theme updated successfully!");
        setIsEditing(false);
        setSelectedTheme(null);
        fetchThemes();
      } else {
        const data = await res.json();
        toast.error(data.error || "Failed to update theme");
      }
    } catch (err) {
      toast.error("Error updating theme on server");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteTheme = async (id: string) => {
    if (!confirm("Are you sure you want to delete this theme tag? It will detach all feedback logs. This action is permanent.")) return;
    setIsDeleting(true);

    try {
      const res = await fetch(`/api/themes/${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        toast.success("Theme deleted successfully!");
        setSelectedTheme(null);
        fetchThemes();
      } else {
        toast.error("Failed to delete theme");
      }
    } catch (err) {
      toast.error("Error connecting to server");
    } finally {
      setIsDeleting(false);
    }
  };

  const openThemeDetails = (theme: Theme) => {
    setSelectedTheme(theme);
    setIsEditing(false);
    setEditFormData({
      name: theme.name,
      description: theme.description || "",
      color: theme.color
    });
  };

  const getSentimentColor = (sentiment: string) => {
    if (sentiment === "POSITIVE" || sentiment === "POS") return "text-emerald-400 font-semibold";
    if (sentiment === "NEGATIVE" || sentiment === "NEG") return "text-rose-400 font-semibold";
    return "text-zinc-400";
  };

  const isViewer = session?.user?.role === "VIEWER";
  const isAdmin = session?.user?.role === "ADMIN";

  return (
    <div className="space-y-8">
      {/* Header Info */}
      <div className="glass-card rounded-2xl p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border border-white/5">
        <div className="space-y-1">
          <h2 className="text-2xl font-extrabold text-white flex items-center gap-2.5">
            <TrendingUp className="w-6 h-6 text-blue-400 animate-pulse" /> Active Feedback Themes
          </h2>
          <p className="text-sm text-zinc-400">
            Categorized AI-discovered themes and product tag frequencies.
          </p>
        </div>
        
        {!isViewer && (
          <button
            onClick={() => setIsCreateOpen(true)}
            className="glass-button flex items-center gap-2 text-white rounded-xl px-5 py-2.5 font-bold text-xs shadow-lg cursor-pointer"
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
                onClick={() => openThemeDetails(theme)}
                className="glass-card rounded-2xl p-6 flex flex-col justify-between h-72 border hover:shadow-lg transition-all duration-300 relative overflow-hidden group cursor-pointer"
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
                  <p className="text-xs text-zinc-400 mt-3 leading-relaxed line-clamp-4">
                    {theme.description || `Customer feedback logs tagged under ${theme.name}.`}
                  </p>
                </div>

                <div className="flex justify-between items-center border-t border-white/10 pt-4 mt-4">
                  <div>
                    <span className="block text-[10px] font-bold uppercase tracking-wider text-zinc-500">Active Logs</span>
                    <span className="text-sm font-black text-white flex items-center gap-1">
                      <MessageSquare className="w-3.5 h-3.5 text-zinc-400" /> {count} Feedback Items
                    </span>
                  </div>
                  <span 
                    className="text-xs font-bold flex items-center gap-1 group-hover:gap-2 transition-all"
                    style={{ color: theme.color }}
                  >
                    View details <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create Theme Modal */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4 animate-fadeIn">
          <div className="glass-panel relative w-full max-w-md rounded-2xl p-6 shadow-2xl border border-white/15">
            <div className="flex items-center justify-between mb-5 border-b border-white/10 pb-3">
              <h2 className="text-lg font-bold text-white">Create New Theme Tag</h2>
              <button 
                onClick={() => setIsCreateOpen(false)} 
                className="text-zinc-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTheme} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-300 mb-1.5">Theme Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Billing Issues, Security, UI Bugs"
                  value={createFormData.name}
                  onChange={(e) => setCreateFormData({ ...createFormData, name: e.target.value })}
                  className="glass-input w-full rounded-xl p-2.5 text-sm placeholder-zinc-550"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-300 mb-1.5">Description</label>
                <textarea
                  rows={3}
                  placeholder="Describe the topics and keywords matching this feedback theme..."
                  value={createFormData.description}
                  onChange={(e) => setCreateFormData({ ...createFormData, description: e.target.value })}
                  className="glass-input w-full rounded-xl p-2.5 text-sm placeholder-zinc-550"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-350 mb-2">Color Label</label>
                <div className="flex gap-3 items-center">
                  {PRESET_COLORS.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setCreateFormData({ ...createFormData, color: c })}
                      style={{ backgroundColor: c }}
                      className={`h-7 w-7 rounded-full transition-transform border border-black/30 ${
                        createFormData.color === c ? "scale-125 ring-2 ring-white/50" : "hover:scale-110"
                      }`}
                    />
                  ))}
                  <input 
                    type="color" 
                    value={createFormData.color}
                    onChange={(e) => setCreateFormData({ ...createFormData, color: e.target.value })}
                    className="h-8 w-8 bg-transparent border-0 cursor-pointer"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
                <button 
                  type="button" 
                  onClick={() => setIsCreateOpen(false)} 
                  className="glass-button-secondary rounded-xl px-4 py-2 text-xs font-semibold text-zinc-300"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={isCreating} 
                  className="glass-button rounded-xl px-5 py-2 text-xs font-bold text-white shadow-md disabled:opacity-50"
                >
                  {isCreating ? "Saving..." : "Create Theme"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Theme Details / Edit Modal */}
      {selectedTheme && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4 animate-fadeIn">
          <div className="glass-panel relative w-full max-w-2xl rounded-2xl shadow-2xl border border-white/15 overflow-hidden">
            {/* Modal Header */}
            <div 
              className="flex items-center justify-between p-6 border-b border-white/10"
              style={{ backgroundColor: `${selectedTheme.color}15` }}
            >
              <div className="flex items-center gap-3">
                <div className="h-4.5 w-4.5 rounded-full" style={{ backgroundColor: selectedTheme.color }} />
                <div>
                  <h2 className="text-xl font-bold text-white tracking-tight">{selectedTheme.name}</h2>
                  <p className="text-xs text-zinc-400">{selectedTheme._count.feedbacks} total feedbacks in workspace</p>
                </div>
              </div>
              <button 
                onClick={() => setSelectedTheme(null)} 
                className="rounded-lg p-1.5 text-zinc-400 hover:bg-white/10 hover:text-white transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Content */}
            {!isEditing ? (
              /* DETAILS VIEW */
              <div className="p-6 space-y-6">
                <div className="space-y-1.5">
                  <span className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400">Description</span>
                  <p className="text-sm text-zinc-300 leading-relaxed font-light">
                    {selectedTheme.description || "No description provided for this theme."}
                  </p>
                </div>

                <div className="space-y-3">
                  <h4 className="text-[10px] font-bold uppercase tracking-wider text-blue-400 flex items-center gap-1.5">
                    <TrendingUp className="h-4 w-4" /> Preview Recent Feedbacks ({selectedTheme.feedbacks.length})
                  </h4>
                  
                  <div className="space-y-3 max-h-[35vh] overflow-y-auto pr-2 custom-scrollbar">
                    {selectedTheme.feedbacks.length === 0 ? (
                      <p className="text-xs text-zinc-500 italic p-4 text-center">No feedback logs associated with this theme yet.</p>
                    ) : (
                      selectedTheme.feedbacks.map((ft) => (
                        <div key={ft.feedback.id} className="rounded-xl border border-white/5 bg-zinc-950/40 p-4 space-y-2">
                          <p className="text-xs text-zinc-200 leading-relaxed italic">"{ft.feedback.content}"</p>
                          <div className="flex items-center gap-2 pt-1">
                            <span className={`text-[10px] font-mono font-bold border px-2 py-0.5 rounded ${getSentimentColor(ft.feedback.sentiment)}`}>
                              {ft.feedback.sentiment}
                            </span>
                            <span className="text-[10px] text-zinc-400 font-mono capitalize">{ft.feedback.status.toLowerCase()}</span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Footer Controls */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-5 border-t border-white/10">
                  <button 
                    onClick={() => {
                      setSelectedTheme(null);
                      router.push(`/inbox?theme=${selectedTheme.name}`);
                    }}
                    className="text-xs font-bold text-blue-400 flex items-center gap-1 hover:gap-2 transition-all self-start sm:self-center"
                  >
                    View drill-down in Inbox <ArrowRight className="w-4 h-4" />
                  </button>

                  <div className="flex gap-3 justify-end">
                    {!isViewer && (
                      <button
                        onClick={() => setIsEditing(true)}
                        className="glass-button-secondary rounded-xl px-4 py-2 text-xs font-bold flex items-center gap-2"
                      >
                        <Edit3 className="w-3.5 h-3.5 text-blue-400" /> Edit Theme
                      </button>
                    )}
                    {isAdmin && (
                      <button
                        onClick={() => handleDeleteTheme(selectedTheme.id)}
                        disabled={isDeleting}
                        className="bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 hover:text-rose-300 border border-rose-500/20 hover:border-rose-500/40 rounded-xl px-4 py-2 text-xs font-bold flex items-center gap-1.5 transition-all disabled:opacity-50"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Delete Tag
                      </button>
                    )}
                    <button
                      onClick={() => setSelectedTheme(null)}
                      className="glass-button-secondary rounded-xl px-5 py-2 text-xs font-bold text-zinc-300"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              /* EDIT VIEW */
              <form onSubmit={handleUpdateTheme} className="p-6 space-y-5">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-300 mb-1.5">Theme Name</label>
                  <input
                    type="text"
                    required
                    value={editFormData.name}
                    onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                    className="glass-input w-full rounded-xl p-2.5 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-300 mb-1.5">Description</label>
                  <textarea
                    rows={3}
                    value={editFormData.description}
                    onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
                    className="glass-input w-full rounded-xl p-2.5 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-300 mb-2">Color Label</label>
                  <div className="flex gap-3 items-center">
                    {PRESET_COLORS.map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setEditFormData({ ...editFormData, color: c })}
                        style={{ backgroundColor: c }}
                        className={`h-7 w-7 rounded-full transition-transform border border-black/30 ${
                          editFormData.color === c ? "scale-125 ring-2 ring-white/50" : "hover:scale-110"
                        }`}
                      />
                    ))}
                    <input 
                      type="color" 
                      value={editFormData.color}
                      onChange={(e) => setEditFormData({ ...editFormData, color: e.target.value })}
                      className="h-8 w-8 bg-transparent border-0 cursor-pointer"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-5 border-t border-white/10">
                  <button 
                    type="button" 
                    onClick={() => setIsEditing(false)} 
                    className="glass-button-secondary rounded-xl px-4 py-2 text-xs font-semibold text-zinc-300"
                  >
                    Back to Details
                  </button>
                  <button 
                    type="submit" 
                    disabled={isSaving} 
                    className="glass-button rounded-xl px-5 py-2 text-xs font-bold text-white shadow-md disabled:opacity-50"
                  >
                    {isSaving ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}