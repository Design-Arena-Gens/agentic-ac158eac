"use client";

import { FormEvent, useState } from "react";
import { MessageCircle, ThumbsUp, SendHorizonal } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useDriverStore } from "@/store/driver-store";

export default function CommunityPage() {
  const { community, addCommunityPost, profile, isReady } = useDriverStore((state) => ({
    community: state.community,
    addCommunityPost: state.addCommunityPost,
    profile: state.profile,
    isReady: state.isReady,
  }));
  const [message, setMessage] = useState("");

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!message.trim()) return;
    await addCommunityPost(message.trim());
    setMessage("");
  };

  if (!isReady) {
    return <div className="card">Loading community feed…</div>;
  }

  return (
    <div className="space-y-6">
      <section className="card bg-gradient-to-r from-amber-500 to-orange-500 text-white">
        <div className="flex flex-col gap-3">
          <span className="badge bg-black/15 text-white/85">Driver Community</span>
          <h1 className="text-2xl font-semibold">
            Namaste {profile?.name?.split(" ")[0] ?? "driver"}! Share updates with the road family.
          </h1>
          <p className="text-sm text-white/85">
            Report jams, checkpoints, fuel prices or job leads. Works offline and syncs when you’re back online.
          </p>
        </div>
      </section>

      <form onSubmit={handleSubmit} className="card space-y-3">
        <label className="text-sm font-semibold text-slate-600">Post an update</label>
        <textarea
          className="min-h-[120px] rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-400"
          placeholder="Share traffic update, rate hike news, new booking or support message for fellow drivers…"
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          maxLength={320}
        />
        <div className="flex items-center justify-between text-xs text-slate-500">
          <span>{320 - message.length} characters left</span>
          <button
            className="button-primary justify-center bg-white text-amber-600 hover:bg-slate-100"
            type="submit"
          >
            <SendHorizonal size={18} />
            Post
          </button>
        </div>
      </form>

      <section className="card space-y-4">
        <div className="section-title">
          <h2>Live Feed</h2>
          <span>{community.length} updates</span>
        </div>
        <div className="grid gap-3">
          {community.map((post) => (
            <article
              key={post.id}
              className="rounded-2xl border border-slate-200/80 p-4 transition hover:border-amber-200"
            >
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span className="font-semibold text-slate-700">{post.author}</span>
                <span>{formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}</span>
              </div>
              <p className="mt-3 whitespace-pre-line text-sm text-slate-700">{post.message}</p>
              <div className="mt-4 flex items-center gap-4 text-xs text-slate-500">
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-3 py-1 font-medium text-amber-600">
                  <ThumbsUp size={14} />
                  {post.reactions ?? 0} kudos
                </span>
                {post.location && (
                  <span className="inline-flex items-center gap-1">
                    <MessageCircle size={14} />
                    {post.location}
                  </span>
                )}
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
