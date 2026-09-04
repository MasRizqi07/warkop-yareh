"use client";

import React, { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users,
  Calendar,
  MessageSquare,
  Heart,
  Plus,
  MapPin,
  Clock,
  Ticket,
  Send,
  UserCheck,
} from "lucide-react";
import { useAppStore } from "@/store/useAppStore";
import { soundEffects } from "@/lib/audioAlerts";

export default function CommunityPage() {
  const {
    events,
    forumPosts,
    toggleEventRsvp,
    togglePostLike,
    addForumPost,
    addForumReply,
    getActiveBranch,
  } = useAppStore();

  const activeBranch = getActiveBranch();
  const [activeTab, setActiveTab] = useState<"events" | "forum">("events");
  const [isPostComposerOpen, setIsPostComposerOpen] = useState(false);
  const [newPostTitle, setNewPostTitle] = useState("");
  const [newPostContent, setNewPostContent] = useState("");
  const [newPostTag, setNewPostTag] = useState("CoworkingTips");

  // Replying state per post
  const [replyInput, setReplyInput] = useState<Record<string, string>>({});

  const handleCreatePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPostTitle.trim() || !newPostContent.trim()) return;

    addForumPost(newPostTitle.trim(), newPostContent.trim(), [newPostTag]);
    setNewPostTitle("");
    setNewPostContent("");
    setIsPostComposerOpen(false);
    soundEffects.playSuccessChime();
  };

  const handleSendReply = (postId: string) => {
    const text = replyInput[postId]?.trim();
    if (!text) return;
    addForumReply(postId, text);
    setReplyInput((prev) => ({ ...prev, [postId]: "" }));
    soundEffects.playSuccessChime();
  };

  return (
    <div className="min-h-screen bg-[#0a0a0c] text-white pt-8 sm:pt-10 pb-32 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8 border-b border-white/5 pb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-[#f59e0b] uppercase tracking-wider mb-2">
            <Users className="w-4 h-4 text-[#f59e0b]" />
            <span>Third-Space Community Hub Surabaya</span>
          </div>
          <h1 className="font-heading font-extrabold text-3xl sm:text-4xl text-white">
            Ruang Temu Kreator & Komunitas
          </h1>
          <p className="text-xs sm:text-sm text-neutral-400 mt-1 max-w-xl">
            Dari sesi cupping sensory, tech meetup, hingga diskusi santai meja warkop. Terhubung dengan 2.800+ kreator, developer, dan nomad di Surabaya.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-2 bg-[#141418] p-1.5 rounded-2xl border border-white/5 self-start md:self-auto">
          <button
            onClick={() => setActiveTab("events")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeTab === "events"
                ? "bg-[#9c6b3a] text-white shadow-md"
                : "text-neutral-400 hover:text-white"
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>Agenda Workshop & Event</span>
          </button>
          <button
            onClick={() => setActiveTab("forum")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeTab === "forum"
                ? "bg-[#9c6b3a] text-white shadow-md"
                : "text-neutral-400 hover:text-white"
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span>Forum Diskusi Surabaya</span>
          </button>
        </div>
      </div>

      {/* Tab 1: Events & Ticketing */}
      {activeTab === "events" ? (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="font-heading font-bold text-lg text-white">
              Event & Workshop Terdekat ({events.length})
            </h2>
            <span className="text-xs font-mono text-neutral-400">
              Lokasi Aktif: <span className="text-white font-semibold">{activeBranch.name}</span>
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((ev) => (
              <div
                key={ev.id}
                className="rounded-3xl bg-[#18181c] border border-white/10 overflow-hidden flex flex-col justify-between hover:border-[#f59e0b]/40 transition-all shadow-xl"
              >
                {/* Image */}
                <div className="relative h-48 w-full bg-[#111114]">
                  <Image
                    src={ev.image}
                    alt={ev.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 400px"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#18181c] via-black/40 to-transparent" />
                  <span className="absolute top-3 left-3 px-3 py-1 rounded-full text-[10px] font-mono font-bold uppercase bg-black/70 text-[#fcd34d] border border-white/10 backdrop-blur-md">
                    {ev.category}
                  </span>
                  <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-[11px] font-mono text-neutral-300">
                    <span className="bg-black/60 px-2 py-0.5 rounded backdrop-blur-sm">
                      {ev.spotsLeft} Kursi Tersisa
                    </span>
                    <span className="bg-black/60 px-2 py-0.5 rounded backdrop-blur-sm text-[#f59e0b] font-bold">
                      {ev.price === 0 ? "GRATIS" : `Rp ${ev.price.toLocaleString("id-ID")}`}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                  <div>
                    <h3 className="font-heading font-bold text-base text-white line-clamp-2">
                      {ev.title}
                    </h3>
                    <div className="text-xs text-[#f59e0b] mt-1 font-medium">
                      Pembicara: {ev.speaker}
                    </div>
                    <div className="text-[11px] text-neutral-400">{ev.speakerRole}</div>

                    <div className="mt-4 pt-3 border-t border-white/5 space-y-1.5 text-xs text-neutral-300 font-mono">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-3.5 h-3.5 text-neutral-500" />
                        <span>{ev.date}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-3.5 h-3.5 text-neutral-500" />
                        <span>{ev.time}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-3.5 h-3.5 text-neutral-500" />
                        <span>{ev.branchName}</span>
                      </div>
                    </div>
                  </div>

                  {/* RSVP Button */}
                  <button
                    onClick={() => {
                      toggleEventRsvp(ev.id);
                      soundEffects.playSuccessChime();
                    }}
                    className={`w-full py-3 px-4 rounded-2xl text-xs font-heading font-bold flex items-center justify-center gap-2 transition-all ${
                      ev.isAttending
                        ? "bg-emerald-600 text-white shadow-[0_0_15px_rgba(16,185,129,0.4)]"
                        : "bg-gradient-to-r from-[#9c6b3a] to-[#d4b488] hover:opacity-95 text-white shadow-[0_4px_16px_rgba(156,107,58,0.4)] active:scale-[0.98]"
                    }`}
                  >
                    {ev.isAttending ? (
                      <>
                        <UserCheck className="w-4 h-4" />
                        <span>Kamu Terdaftar (RSVP Aktif)</span>
                      </>
                    ) : (
                      <>
                        <Ticket className="w-4 h-4" />
                        <span>Amankan Tiket Masuk</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* Tab 2: Creator Forum */
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="font-heading font-bold text-lg text-white">
                Diskusi Hangat Komunitas ({forumPosts.length})
              </h2>
              <p className="text-xs text-neutral-400">
                Tanya spot meja, rekomendasi menu, atau ajak co-working bareng di Surabaya.
              </p>
            </div>

            <button
              onClick={() => setIsPostComposerOpen(true)}
              className="px-4 py-2.5 rounded-2xl bg-[#9c6b3a] hover:bg-[#b07b44] text-white text-xs font-bold flex items-center gap-2 shadow-md self-start sm:self-auto"
            >
              <Plus className="w-4 h-4" />
              <span>Buat Thread Baru</span>
            </button>
          </div>

          {/* Post Composer Modal */}
          <AnimatePresence>
            {isPostComposerOpen && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
                <motion.form
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  onSubmit={handleCreatePost}
                  className="w-full max-w-lg rounded-3xl bg-[#18181c] border border-white/10 p-6 space-y-4 shadow-2xl"
                >
                  <div className="flex items-center justify-between border-b border-white/10 pb-3">
                    <h3 className="font-heading font-bold text-base text-white">
                      Mulai Diskusi Baru
                    </h3>
                    <button
                      type="button"
                      onClick={() => setIsPostComposerOpen(false)}
                      className="text-neutral-400 hover:text-white text-xs"
                    >
                      Batal
                    </button>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-neutral-300 mb-1">
                      Kategori Tag
                    </label>
                    <select
                      value={newPostTag}
                      onChange={(e) => setNewPostTag(e.target.value)}
                      className="w-full p-2.5 rounded-xl bg-[#111114] border border-white/10 text-white text-xs"
                    >
                      <option value="CoworkingTips">#CoworkingTips</option>
                      <option value="MenuFavorite">#MenuFavorite</option>
                      <option value="DarmoHub">#DarmoHub</option>
                      <option value="Gubeng24H">#Gubeng24H</option>
                      <option value="CollabProject">#CollabProject</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-neutral-300 mb-1">
                      Judul Topik
                    </label>
                    <input
                      type="text"
                      required
                      value={newPostTitle}
                      onChange={(e) => setNewPostTitle(e.target.value)}
                      placeholder="Apa yang ingin kamu diskusikan?"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#111114] border border-white/10 text-white text-xs focus:outline-none focus:border-[#f59e0b]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-neutral-300 mb-1">
                      Isi Pembahasan
                    </label>
                    <textarea
                      rows={4}
                      required
                      value={newPostContent}
                      onChange={(e) => setNewPostContent(e.target.value)}
                      placeholder="Tuliskan pertanyaan atau cerita pengalamanmu di Warkop Ya'reh..."
                      className="w-full p-3 rounded-xl bg-[#111114] border border-white/10 text-white text-xs placeholder-neutral-500 focus:outline-none focus:border-[#f59e0b]"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-[#9c6b3a] to-[#d4b488] text-white font-bold text-xs shadow-md"
                  >
                    Publikasikan ke Komunitas
                  </button>
                </motion.form>
              </div>
            )}
          </AnimatePresence>

          {/* Posts Feed */}
          <div className="space-y-4">
            {forumPosts.map((post) => (
              <div
                key={post.id}
                className="p-6 rounded-3xl bg-[#18181c] border border-white/10 space-y-4"
              >
                {/* Author Info */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="relative w-10 h-10 rounded-full overflow-hidden bg-neutral-800 border border-white/10">
                      <Image
                        src={post.authorAvatar}
                        alt={post.authorName}
                        fill
                        className="object-cover"
                        sizes="40px"
                      />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-heading font-bold text-sm text-white">
                          {post.authorName}
                        </span>
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-[#f59e0b]/20 text-[#fcd34d] border border-[#f59e0b]/30">
                          {post.authorTier}
                        </span>
                      </div>
                      <div className="text-[11px] text-neutral-400 font-mono">
                        {post.authorRole} • {post.timestamp}
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-1.5">
                    {post.tags.map((t) => (
                      <span
                        key={t}
                        className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-white/5 text-neutral-400"
                      >
                        #{t}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Content */}
                <div>
                  <h3 className="font-heading font-bold text-base text-white">
                    {post.title}
                  </h3>
                  <p className="text-xs text-neutral-300 mt-1.5 leading-relaxed">
                    {post.content}
                  </p>
                </div>

                {/* Like & Reply Bar */}
                <div className="flex items-center gap-4 pt-2 border-t border-white/5 text-xs text-neutral-400">
                  <button
                    onClick={() => {
                      togglePostLike(post.id);
                      soundEffects.playSuccessChime();
                    }}
                    className={`flex items-center gap-1.5 transition-colors ${
                      post.isLiked ? "text-rose-400 font-bold" : "hover:text-white"
                    }`}
                  >
                    <Heart className={`w-4 h-4 ${post.isLiked ? "fill-rose-400" : ""}`} />
                    <span>{post.likesCount} Suka</span>
                  </button>

                  <div className="flex items-center gap-1.5">
                    <MessageSquare className="w-4 h-4" />
                    <span>{post.repliesCount} Komentar</span>
                  </div>
                </div>

                {/* Thread Replies */}
                {post.replies && post.replies.length > 0 && (
                  <div className="pl-4 sm:pl-8 space-y-2.5 pt-2 border-l-2 border-white/10">
                    {post.replies.map((rep) => (
                      <div key={rep.id} className="p-3 rounded-2xl bg-[#111114] border border-white/5 text-xs">
                        <div className="flex items-center justify-between text-[11px] text-neutral-400 mb-1">
                          <span className="font-semibold text-white">{rep.authorName}</span>
                          <span className="font-mono">{rep.timestamp}</span>
                        </div>
                        <p className="text-neutral-300 leading-normal">{rep.content}</p>
                      </div>
                    ))}
                  </div>
                )}

                {/* Add Reply Input */}
                <div className="flex gap-2 pt-1">
                  <input
                    type="text"
                    value={replyInput[post.id] || ""}
                    onChange={(e) =>
                      setReplyInput((prev) => ({ ...prev, [post.id]: e.target.value }))
                    }
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleSendReply(post.id);
                    }}
                    placeholder="Tulis balasan untuk thread ini..."
                    className="flex-1 px-4 py-2 rounded-xl bg-[#111114] border border-white/10 text-white text-xs placeholder-neutral-500 focus:outline-none focus:border-[#f59e0b]"
                  />
                  <button
                    onClick={() => handleSendReply(post.id)}
                    className="p-2.5 rounded-xl bg-[#9c6b3a] hover:bg-[#b07b44] text-white transition-colors"
                  >
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
