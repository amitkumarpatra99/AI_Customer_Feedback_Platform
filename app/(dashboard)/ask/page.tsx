"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Loader2, Bot, User, MessageSquare } from "lucide-react";

interface Message {
  id: string;
  role: "user" | "ai";
  text: string;
  feedbacks?: { id: string; content: string; sentiment: string; status: string }[];
}

export default function AskLoopPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "ai",
      text: "Hello! I'm LOOP AI. You can ask me things like:\n• 'Show me negative feedback about billing'\n• 'What are users saying about the new UI?'\n• 'Find all login issues'",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { id: Date.now().toString(), role: "user", text: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: input }),
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
        { id: (Date.now() + 1).toString(), role: "ai", text: "Sorry, I encountered an error. Please try again." },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const getSentimentColor = (sentiment: string) => {
    if (sentiment === "POSITIVE") return "text-green-400 bg-green-500/10 border-green-500/20";
    if (sentiment === "NEGATIVE") return "text-red-400 bg-red-500/10 border-red-500/20";
    return "text-zinc-400 bg-zinc-500/10 border-zinc-500/20";
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <Bot className="h-6 w-6 text-blue-500" /> Ask LOOP
        </h1>
        <p className="text-sm text-zinc-400">Ask natural language questions about your customer feedback.</p>
      </div>

      {/* Chat Messages Area */}
      <div className="flex-1 overflow-y-auto space-y-6 pr-2 mb-4 custom-scrollbar">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex gap-4 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
            <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${msg.role === "user" ? "bg-blue-600" : "bg-zinc-800"}`}>
              {msg.role === "user" ? <User className="h-4 w-4 text-white" /> : <Bot className="h-4 w-4 text-blue-400" />}
            </div>
            
            <div className={`max-w-[80%] space-y-3`}>
              <div className={`rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${
                msg.role === "user" 
                  ? "bg-blue-600 text-white rounded-tr-none" 
                  : "bg-zinc-900 border border-zinc-800 text-zinc-200 rounded-tl-none"
              }`}>
                {msg.text}
              </div>

              {/* Attached Feedbacks Cards */}
              {msg.feedbacks && msg.feedbacks.length > 0 && (
                <div className="space-y-2 mt-2">
                  {msg.feedbacks.map((fb) => (
                    <div key={fb.id} className="rounded-lg border border-zinc-800 bg-zinc-950 p-3">
                      <p className="text-sm text-zinc-300 mb-2">"{fb.content}"</p>
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded text-xs font-medium border ${getSentimentColor(fb.sentiment)}`}>
                          {fb.sentiment}
                        </span>
                        <span className="text-xs text-zinc-500 capitalize">• {fb.status.toLowerCase()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="flex gap-4">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center">
              <Bot className="h-4 w-4 text-blue-400" />
            </div>
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl rounded-tl-none px-4 py-3 flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
              <span className="text-sm text-zinc-400">Analyzing feedback data...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="relative">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          placeholder="Ask a question about your feedback..."
          disabled={isLoading}
          className="w-full rounded-xl border border-zinc-800 bg-zinc-900 py-4 pl-4 pr-14 text-sm text-zinc-100 placeholder-zinc-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:opacity-50"
        />
        <button
          onClick={handleSend}
          disabled={isLoading || !input.trim()}
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg bg-blue-600 p-2 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <Send className="h-4 w-4" />
        </button>
      </div>
      
      <p className="text-center text-xs text-zinc-600 mt-3">
        LOOP AI can make mistakes. Verify important insights in the Inbox.
      </p>
    </div>
  );
}