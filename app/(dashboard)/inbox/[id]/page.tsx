"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Loader2, MessageSquare, Tag, Calendar, User, CheckCircle2 } from "lucide-react";

export default function FeedbackDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [feedback, setFeedback] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    const fetchFeedback = async () => {
      try {
        const res = await fetch(`/api/feedback/${params.id}`);
        if (res.ok) {
          setFeedback(await res.json());
        } else {
          router.push("/inbox");
        }
      } catch (error) {
        console.error("Failed to fetch", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchFeedback();
  }, [params.id, router]);

  const handleStatusChange = async (newStatus: string) => {
    setIsUpdating(true);
    try {
      const res = await fetch(`/api/feedback/${params.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        setFeedback(await res.json());
      }
    } catch (error) {
      console.error("Failed to update", error);
    } finally {
      setIsUpdating(false);
    }
  };

  if (isLoading) return <div className="flex h-[60vh] items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-blue-500" /></div>;
  if (!feedback) return <div className="p-8 text-white">Feedback not found</div>;

  return (
    <div className="space-y-6 max-w-5xl mx-auto p-4">
      <button onClick={() => router.push("/inbox")} className="flex items-center gap-2 text-zinc-400 hover:text-white mb-4">
        <ArrowLeft className="h-4 w-4" /> Back to Inbox
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Content */}
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-6">
            <h2 className="text-sm font-semibold text-zinc-400 uppercase mb-4 flex items-center gap-2">
              <MessageSquare className="h-4 w-4" /> Feedback Content
            </h2>
            <p className="text-lg text-zinc-100 leading-relaxed whitespace-pre-wrap">{feedback.content}</p>
          </div>
        </div>

        {/* Right: Sidebar */}
        <div className="space-y-6">
          <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-6">
            <h2 className="text-sm font-semibold text-zinc-400 uppercase mb-4 flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4" /> Workflow Status
            </h2>
            <select
              value={feedback.status}
              onChange={(e) => handleStatusChange(e.target.value)}
              disabled={isUpdating}
              className="w-full rounded-md border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 focus:border-blue-500 focus:outline-none"
            >
              <option value="NEW">🔵 NEW</option>
              <option value="REVIEWED">🟡 REVIEWED</option>
              <option value="ACTIONED">🟢 ACTIONED</option>
            </select>
          </div>

          <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-6 space-y-4">
            <div className="flex items-center gap-3">
              <User className="h-4 w-4 text-zinc-500" />
              <div>
                <p className="text-xs text-zinc-500">Customer</p>
                <p className="text-sm text-zinc-200">{feedback.customerLabel || "Anonymous"}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Tag className="h-4 w-4 text-zinc-500" />
              <div>
                <p className="text-xs text-zinc-500">Channel</p>
                <p className="text-sm text-zinc-200">{feedback.channel?.replace("_", " ")}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}