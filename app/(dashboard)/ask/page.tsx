"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Loader2, Bot, User, Sparkles, ThumbsUp, ThumbsDown, Minus } from "lucide-react";
import { toast } from "sonner";

interface Feedback {
  id: string;
  content: string;
  sentiment: string;
  status: string;
}

interface Message {
  id: string;
  role: "user" | "ai";
  text: string;
  feedbacks?: Feedback[];
}

const SUGGESTED_PROMPTS = [
  "Show me negative feedback about billing",
  "What are users saying about the new UI?",
  "Find all login issues",
  "Summarize feature requests from last week",
];

export default function AskLoopPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "ai",
      text: "Hello! I'm LOOP AI. I can help you analyze customer feedback. Try asking me something like:",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [input]);

  const handleSend = async (textToSend?: string) => {
    const query = textToSend || input;
    if (!query.trim() || isLoading) return;

    const userMessage: Message = { id: Date.now().toString(), role: "user", text: query };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    // Reset textarea height after sending
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }

    try {
      const res = await fetch("/api/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query }),
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
        throw new Error(data.error || "Unknown error");
      }
    } catch (error) {
      toast.error("AI failed to process query. Please try again.");
      setMessages((prev) => [
        ...prev,
        { id: (Date.now() + 1).toString(), role: "ai", text: "Sorry, I encountered an error while processing your request. Please try again." },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const getSentimentIcon = (sentiment: string) => {
    if (sentiment === "POSITIVE") return <ThumbsUp className="h-3.5 w-3.5" />;
    if (sentiment === "NEGATIVE") return <ThumbsDown className="h-3.5 w-3.5" />;
    return <Minus className="h-3.5 w-3.5" />;
  };

  const getSentimentColor = (sentiment: string) => {
    if (sentiment === "POSITIVE") return "text-emerald-400 bg-emerald-500/10 border-emerald-500/20";
    if (sentiment === "NEGATIVE") return "text-rose-400 bg-rose-500/10 border-rose-500/20";
    return "text-zinc-400 bg-zinc-500/10 border-zinc-500/20";
  };

  const isInitialMessage = messages.length === 1 && messages[0].role === "ai";

  return (
    <div className="flex flex-col h-[calc(100vh-6rem)] max-w-3xl mx-auto w-full px-4">
      {/* Header */}
      <div className="mb-6 text-center sm:text-left">
        <h1 className="text-2xl font-bold text-white flex items-center justify-center sm:justify-start gap-2">
          <Sparkles className="h-6 w-6 text-blue-500" /> Ask LOOP AI
        </h1>
        <p className="text-sm text-zinc-400 mt-1">Ask natural language questions about your customer feedback.</p>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto space-y-6 pr-2 mb-4 scrollbar-thin scrollbar-thumb-zinc-700 scrollbar-track-transparent">
        {messages.map((msg) => (
          <div 
            key={msg.id} 
            className={`flex gap-4 transition-all duration-300 ease-out ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}
          >
            {/* Avatar */}
            <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ring-2 ring-offset-2 ring-offset-zinc-950 ${
              msg.role === "user" 
                ? "bg-blue-600 ring-blue-600/30" 
                : "bg-zinc-800 ring-zinc-800/50"
            }`}>
              {msg.role === "user" ? (
                <User className="h-4 w-4 text-white" />
              ) : (
                <Bot className="h-4 w-4 text-blue-400" />
              )}
            </div>
            
            <div className="max-w-[85%] space-y-3">
              {/* Message Bubble */}
              <div className={`rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap shadow-sm ${
                msg.role === "user" 
                  ? "bg-blue-600 text-white rounded-tr-sm" 
                  : "bg-zinc-900/80 border border-zinc-800 text-zinc-200 rounded-tl-sm backdrop-blur-sm"
              }`}>
                {msg.text}
              </div>

              {/* Feedback Cards */}
              {msg.feedbacks && msg.feedbacks.length > 0 && (
                <div className="space-y-3 mt-3">
                  {msg.feedbacks.map((fb) => (
                    <div 
                      key={fb.id} 
                      className="group rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 hover:border-zinc-700 transition-colors duration-200"
                    >
                      <p className="text-sm text-zinc-200 mb-3 leading-relaxed">"{fb.content}"</p>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium border ${getSentimentColor(fb.sentiment)}`}>
                          {getSentimentIcon(fb.sentiment)}
                          {fb.sentiment}
                        </span>
                        <span className="text-xs text-zinc-500 flex items-center gap-1.5">
                          <span className="w-1 h-1 rounded-full bg-zinc-600" />
                          {fb.status.charAt(0).toUpperCase() + fb.status.slice(1).toLowerCase()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
        
        {/* Loading State */}
        {isLoading && (
          <div className="flex gap-4 transition-all duration-300">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-zinc-800 ring-2 ring-offset-2 ring-offset-zinc-950 ring-zinc-800/50 flex items-center justify-center">
              <Bot className="h-4 w-4 text-blue-400" />
            </div>
            <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-3 backdrop-blur-sm">
              <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
              <span className="text-sm text-zinc-400">Analyzing feedback data...</span>
            </div>
          </div>
        )}
        
        {/* Suggested Prompts (Only show on initial state) */}
        {isInitialMessage && !isLoading && (
          <div className="flex flex-wrap gap-2 mt-4 pl-12">
            {SUGGESTED_PROMPTS.map((prompt, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(prompt)}
                className="text-xs sm:text-sm px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-300 hover:bg-zinc-800 hover:border-zinc-700 hover:text-white transition-all duration-200 text-left"
              >
                {prompt}
              </button>
            ))}
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="relative group">
        {/* Glowing border effect on focus */}
        <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-2xl opacity-0 group-focus-within:opacity-100 transition duration-300 blur-sm" />
        <div className="relative flex items-end gap-2 bg-zinc-900 border border-zinc-800 rounded-xl p-2 focus-within:border-zinc-700 transition-colors">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder="Ask a question about your feedback..."
            disabled={isLoading}
            rows={1}
            className="w-full bg-transparent py-3 pl-3 pr-12 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none resize-none max-h-32 scrollbar-thin scrollbar-thumb-zinc-700"
          />
          <button
            onClick={() => handleSend()}
            disabled={isLoading || !input.trim()}
            className="absolute right-2 bottom-2 rounded-lg bg-blue-600 p-2.5 text-white hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-blue-600 transition-all duration-200 shadow-lg shadow-blue-900/20"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </button>
        </div>
      </div>
      
      <p className="text-center text-xs text-zinc-600 mt-4 flex items-center justify-center gap-1.5">
        <Sparkles className="h-3 w-3" />
        LOOP AI can make mistakes. Verify important insights in the Inbox.
      </p>
    </div>
  );
}