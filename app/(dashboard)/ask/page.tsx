"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Loader2, Bot, User, HelpCircle, Sparkles } from "lucide-react";

interface Message {
  id: string;
  role: "user" | "ai";
  text: string;
  feedbacks?: { id: string; content: string; sentiment: string; status: string }[];
}

const PRESETS = [
  { label: "💳 Billing friction & timeout issues", query: "Show billing friction and timeout issues" },
  { label: "🚀 Onboarding & team invites", query: "What are the onboarding and team invite issues?" },
  { label: "📱 Mobile experience & app crashes", query: "Show mobile experience issues and app crashes" },
  { label: "🌙 Requests for dark mode setting", query: "Is anyone asking for a dark mode?" }
];

export default function AskLoopPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "ai",
      text: "Hello! I'm LOOP AI. Ask me any plain-English question about your customer feedback logs, and I'll analyze it for you grounded in the database.",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (queryToSend?: string) => {
    const textToSend = queryToSend || input;
    if (!textToSend.trim() || isLoading) return;

    const userMessage: Message = { id: Date.now().toString(), role: "user", text: textToSend };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: textToSend }),
      });

      const data = await res.json();

      if (res.ok) {
        const aiMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: "ai",
          text: data.response,
          feedbacks: data.feedbacks,
        };
        setMessages((prev) => [...prev, aiMessage]);
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        { 
          id: (Date.now() + 1).toString(), 
          role: "ai", 
          text: "I encountered an error connecting to LOOP AI services. Please verify your query and try again." 
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const getSentimentColor = (sentiment: string) => {
    if (sentiment === "POSITIVE" || sentiment === "POS") return "text-emerald-400 bg-emerald-500/10 border-emerald-500/20";
    if (sentiment === "NEGATIVE" || sentiment === "NEG") return "text-rose-400 bg-rose-500/10 border-rose-500/20";
    return "text-zinc-400 bg-zinc-500/10 border-zinc-500/20";
  };

  return (
    <div className="flex flex-col h-[calc(100vh-10rem)] max-w-4xl mx-auto space-y-4">
      {/* Page Header */}
      <div className="flex items-center justify-between border-b border-white/10 pb-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.2)]">
            <Bot className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Ask LOOP AI</h1>
            <p className="text-xs text-zinc-400">Ask natural language questions grounded in your feedback database.</p>
          </div>
        </div>
      </div>

      {/* Messages Thread Container */}
      <div className="flex-1 overflow-y-auto space-y-6 pr-2 py-2 scrollbar-thin">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex gap-4 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"} animate-fadeIn`}>
            <div className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center shadow-md ${
              msg.role === "user" 
                ? "bg-gradient-to-tr from-blue-600 to-indigo-500 text-white" 
                : "bg-white/[0.05] border border-white/10 text-blue-400"
            }`}>
              {msg.role === "user" ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
            </div>
            
            <div className="max-w-[80%] space-y-3">
              <div className={`rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap shadow-inner ${
                msg.role === "user" 
                  ? "bg-blue-600 text-white rounded-tr-none" 
                  : "glass-card text-zinc-200 rounded-tl-none border border-white/5"
              }`}>
                {msg.text}
              </div>

              {/* Feedbacks references cards */}
              {msg.feedbacks && msg.feedbacks.length > 0 && (
                <div className="space-y-2 mt-3 pl-2 border-l-2 border-blue-500/30">
                  <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5 mb-2">
                    <Sparkles className="w-3.5 h-3.5 text-blue-400" /> Cited Feedback Sources ({msg.feedbacks.length})
                  </p>
                  <div className="grid grid-cols-1 gap-2.5">
                    {msg.feedbacks.map((fb) => (
                      <div key={fb.id} className="glass-card rounded-xl p-3.5 border border-white/5 bg-zinc-950/40">
                        <p className="text-xs text-zinc-300 italic leading-relaxed">"{fb.content}"</p>
                        <div className="flex items-center gap-2 mt-2">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${getSentimentColor(fb.sentiment)}`}>
                            {fb.sentiment}
                          </span>
                          <span className="text-[10px] text-zinc-400 font-mono capitalize">{fb.status.toLowerCase()}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="flex gap-4">
            <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-white/[0.05] border border-white/10 flex items-center justify-center">
              <Bot className="h-4 w-4 text-blue-400 animate-pulse" />
            </div>
            <div className="glass-card rounded-2xl rounded-tl-none px-4 py-3 flex items-center gap-3 border border-white/5">
              <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
              <span className="text-sm text-zinc-400 font-medium">Analyzing feedback logs...</span>
            </div>
          </div>
        )}

        {/* Quick Start Presets (only shown when conversation starts) */}
        {messages.length === 1 && !isLoading && (
          <div className="pt-8 space-y-3 max-w-2xl mx-auto">
            <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider text-center flex items-center justify-center gap-2">
              <HelpCircle className="w-4 h-4 text-blue-400" /> Quick-start suggestions
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {PRESETS.map((preset, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSend(preset.query)}
                  className="text-left glass-card hover:bg-white/[0.08] p-3.5 rounded-xl border border-white/5 hover:border-blue-500/30 text-xs font-medium text-zinc-300 hover:text-white transition-all flex items-center justify-between group cursor-pointer"
                >
                  <span>{preset.label}</span>
                  <span className="opacity-0 group-hover:opacity-100 text-blue-400 transition-opacity font-bold ml-2">➔</span>
                </button>
              ))}
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input box */}
      <div className="relative">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          placeholder="Ask a question about your feedback..."
          disabled={isLoading}
          className="w-full rounded-2xl border border-white/10 bg-zinc-900/50 py-4 pl-4 pr-14 text-sm text-zinc-100 placeholder-zinc-500 focus:border-blue-500/50 focus:outline-none focus:ring-1 focus:ring-blue-500/50 disabled:opacity-50 glass-input"
        />
        <button
          onClick={() => handleSend()}
          disabled={isLoading || !input.trim()}
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded-xl bg-blue-600 p-2.5 text-white hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md shadow-blue-500/20"
        >
          <Send className="h-4 w-4" />
        </button>
      </div>
      
      <p className="text-center text-[10px] text-zinc-500 uppercase tracking-wider">
        LOOP AI processes matching database records. Verify important details in the Inbox.
      </p>
    </div>
  );
}