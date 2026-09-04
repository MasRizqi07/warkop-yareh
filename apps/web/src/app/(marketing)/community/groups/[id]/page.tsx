"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useParams } from "next/navigation";

interface Thread {
  id: string;
  author: {
    name: string;
    initials: string;
    tier: string;
    role: string;
    avatarBg: string;
    location: string;
  };
  timeAgo: string;
  title: string;
  content: string;
  codeSnippet?: {
    filename: string;
    runtime: string;
    code: string;
  };
  metrics?: {
    serverActionP95: string;
    nestJsP95: string;
    localMeshPing: string;
  };
  baristaTip?: string;
  mockupImages?: {
    src: string;
    caption: string;
  }[];
  tags: string[];
  upvotes: number;
  replies: number;
  isUpvoted?: boolean;
  isBookmarked?: boolean;
}

const INITIAL_THREADS: Thread[] = [
  {
    id: "th-1",
    author: {
      name: "Rayhan Al-Farisi",
      initials: "RA",
      tier: "Platinum Guild Lead",
      role: "Founder @ Tech Guild SBY",
      avatarBg: "bg-[#9c6b3a]",
      location: "Darmo Central Pod #14",
    },
    timeAgo: "Today 21:15 WIB",
    title: "Benchmarking Next.js 15 Server Actions vs NestJS Microservices over 100Mbps Warkop WiFi",
    content:
      "Ran a live stress-test tonight at Pod #14 comparing payload roundtrips over Ya'reh's dedicated fiber node. With edge function warmups, cold starts are negligible if you configure streaming suspense boundaries properly on Next.js 15. Here is our stripped RPC benchmark payload:",
    codeSnippet: {
      filename: "actions/stream-order-v60.ts",
      runtime: "TypeScript • Turbopack",
      code: `export async function dispatchBaristaOrder(tableId: string, brewId: string) {
  // Authenticated through Ya'reh Local Gateway Mesh
  const session = await auth();
  if (!session?.user) throw new Error("UNAUTHORIZED_POD_GUEST");

  return await db.order.create({
    data: { tableId, brew: "COLD_BREW_AREN_BRULEE", priority: 1 },
  });
}`,
    },
    metrics: {
      serverActionP95: "48ms",
      nestJsP95: "59ms",
      localMeshPing: "2ms",
    },
    baristaTip: "Match this debugging flow with the Cold Brew Aren Brûlée—high caffeine kick without the jitter!",
    tags: ["#WebDev", "#NextJS", "#Architecture", "#LateNightCoding"],
    upvotes: 42,
    replies: 18,
  },
  {
    id: "th-2",
    author: {
      name: "Nadia Kusuma",
      initials: "NK",
      tier: "Gold Tier",
      role: "Senior Product Designer",
      avatarBg: "bg-[#8e7130]",
      location: "Gubeng 24H Sanctuary",
    },
    timeAgo: "Yesterday 19:40 WIB",
    title: "Looking for 3 beta testers for our Surabaya local artisan supply-chain app tonight at Gubeng!",
    content:
      "Hey circle! We are prototyping an offline-first inventory tracker built specifically for traditional roasteries and micro-cafés in East Java. If you are sitting on Table B4 through B9, drop by—I’ll buy you a pour-over of your choice from the Ya’reh Single Origin menu in exchange for 15 minutes of UI usability testing.",
    mockupImages: [
      {
        src: "/images/cold-brew-aren-brulee.png",
        caption: "Mobile Wireframe v0.9 • Offline-First",
      },
      {
        src: "/images/darmo-interior.png",
        caption: "Testing Station @ Table B-06",
      },
    ],
    tags: ["#ProductHunt", "#UserTesting", "#SurabayaStartup", "#FreeBrewVoucher"],
    upvotes: 31,
    replies: 12,
  },
  {
    id: "th-3",
    author: {
      name: "Dimas Kurniawan",
      initials: "DK",
      tier: "Gold Tier",
      role: "Fullstack Engineer",
      avatarBg: "bg-[#201f21]",
      location: "Dharmahusada Hub (Quiet Zone)",
    },
    timeAgo: "2 days ago",
    title: "The acoustic paneling at Dharmahusada Hub 2nd floor is a game-changer for deep focus sprints",
    content:
      "Shoutout to the Ya'reh sound design team. Clocked 6 uninterrupted hours of refactoring without hearing the espresso grinders below. What is everyone’s favorite late-night pour-over bean this week? Looking for something high in floral notes to get through midnight sprint goals.",
    baristaTip: "Try the Ijen Honey Anaerob—delicate jasmine finish with zero astringency.",
    tags: ["#QuietZone", "#V60Specialty", "#SurabayaDev"],
    upvotes: 19,
    replies: 7,
  },
];

export default function CommunityGroupDetailPage() {
  const params = useParams();
  const groupId = (params?.id as string) || "tech-circle";

  const [threads, setThreads] = useState<Thread[]>(INITIAL_THREADS);
  const [activeTab, setActiveTab] = useState<"discussions" | "meetups" | "perks" | "directory">("discussions");
  const [selectedTag, setSelectedTag] = useState<string>("#All Threads");
  const [searchQuery, setSearchQuery] = useState("");
  const [isJoined, setIsJoined] = useState(true);
  const [pinnedRsvpd, setPinnedRsvpd] = useState(false);
  const [pinnedSeats, setPinnedSeats] = useState(28);

  // New thread composer state
  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");
  const [newTag, setNewTag] = useState("#TechStack");
  const [showComposerSuccess, setShowComposerSuccess] = useState(false);

  const handleUpvote = (id: string) => {
    setThreads((prev) =>
      prev.map((t) => {
        if (t.id === id) {
          const upvoted = !t.isUpvoted;
          return {
            ...t,
            isUpvoted: upvoted,
            upvotes: upvoted ? t.upvotes + 1 : t.upvotes - 1,
          };
        }
        return t;
      })
    );
  };

  const handleBookmark = (id: string) => {
    setThreads((prev) =>
      prev.map((t) => (t.id === id ? { ...t, isBookmarked: !t.isBookmarked } : t))
    );
  };

  const handleCreatePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) return;

    const newPost: Thread = {
      id: `th-${Date.now()}`,
      author: {
        name: "You (Patron)",
        initials: "ME",
        tier: "Gold Tier",
        role: "Software Craftsman",
        avatarBg: "bg-[#f59e0b]",
        location: "Gubeng 24H Co-Lab",
      },
      timeAgo: "Just now",
      title: newTitle,
      content: newContent,
      tags: [newTag, "#Community"],
      upvotes: 1,
      replies: 0,
      isUpvoted: true,
    };

    setThreads([newPost, ...threads]);
    setNewTitle("");
    setNewContent("");
    setShowComposerSuccess(true);
    setTimeout(() => setShowComposerSuccess(false), 4000);
  };

  const filteredThreads = threads.filter((t) => {
    const matchTag = selectedTag === "#All Threads" || t.tags.includes(selectedTag);
    const matchQuery =
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.content.toLowerCase().includes(searchQuery.toLowerCase());
    return matchTag && matchQuery;
  });

  return (
    <div className="min-h-screen bg-[#0a0a0c] text-[#f8fafc]">
      {/* ══════════════════════════════════════════════════════════════
          ATMOSPHERIC GUILD HERO & BANNER
          ══════════════════════════════════════════════════════════════ */}
      <section className="relative w-full overflow-hidden bg-[#0e0e10] border-b border-white/[0.08]">
        {/* Ambient background with dark scrim */}
        <div className="absolute inset-0 z-0 opacity-25 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#9c6b3a]/40 via-[#0a0a0c] to-[#0a0a0c]" />
        <div className="absolute -right-20 -top-20 w-96 h-96 rounded-full bg-[#f59e0b]/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-10 flex flex-col gap-6">
          {/* Breadcrumb & Metadata Badges */}
          <div className="flex flex-wrap items-center justify-between gap-3 font-mono text-xs text-[#94a3b8]">
            <div className="flex items-center gap-2">
              <Link href="/community" className="flex items-center gap-1 hover:text-[#f7bb82] transition-colors">
                <span className="material-symbols-outlined text-[16px]">groups</span>
                Circles &amp; Guilds
              </Link>
              <span className="text-[#f7bb82] font-medium capitalize">
                {groupId.replace(/-/g, " ")}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-[#201f21] text-[#f59e0b] font-mono text-[11px] shadow-[0_0_12px_rgba(245,158,11,0.2)]">
                Official Ya&apos;reh Guild (Verified)
              </span>
              <span className="px-2 py-0.5 rounded bg-[#18181c] text-[#e8c47a] font-mono text-[11px]">
                Weekly Fri &amp; Sat Nights
              </span>
            </div>
          </div>

          {/* Identity Header Split */}
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
            <div className="flex items-start gap-4">
              {/* Guild Logo Emblem */}
              <div className="relative flex-shrink-0 w-20 h-20 rounded-2xl bg-[#18181c] border border-white/[0.08] flex items-center justify-center shadow-2xl shadow-black/60 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-[#9c6b3a]/40 via-transparent to-[#f59e0b]/20" />
                <span className="material-symbols-outlined text-[40px] text-[#f7bb82] relative z-10">terminal</span>
                <div className="absolute bottom-1 right-1 w-3.5 h-3.5 rounded-full bg-[#f59e0b] ring-2 ring-[#18181c]" />
              </div>

              <div className="flex flex-col gap-1.5">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-[#f8fafc] tracking-tight">
                  Surabaya Tech &amp; Startup Coffee Circle
                </h1>
                <div className="flex flex-wrap items-center gap-2 text-[#94a3b8] text-xs">
                  <span className="flex items-center gap-1 text-[#f8fafc]">
                    <span className="material-symbols-outlined text-[15px] text-[#f59e0b]">group</span>
                    <strong className="text-white">340</strong> Active Builders
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-[15px] text-[#f7bb82]">local_cafe</span>
                    Sanctuary Hub: <strong className="text-[#f7bb82]">Gubeng 24H Co-Lab</strong>
                  </span>
                  <span>•</span>
                  <span className="font-mono text-[11px]">Est. Oct 2023</span>
                  <span>•</span>
                  <span className="text-[#f59e0b] font-mono text-[11px] flex items-center gap-1">
                    <span className="material-symbols-outlined text-[13px]">verified</span>
                    Lead: Rayhan Al-Farisi (Platinum)
                  </span>
                </div>
              </div>
            </div>

            {/* Action Bar */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => setIsJoined(!isJoined)}
                className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                  isJoined
                    ? "bg-[#18181c] border border-[#f59e0b]/30 text-[#f7bb82] hover:bg-[#201f21]"
                    : "bg-[#f59e0b] text-[#0a0a0c] hover:bg-[#ffb95f]"
                }`}
              >
                <span className="material-symbols-outlined text-[16px]">
                  {isJoined ? "check_circle" : "person_add"}
                </span>
                {isJoined ? "Joined (Active Member)" : "Join Circle"}
              </button>

              <Link
                href="/booking"
                className="px-4 py-2 rounded-xl bg-[#9c6b3a] hover:bg-[#825426] text-white text-xs font-bold flex items-center gap-1.5 shadow-[0_4px_16px_rgba(156,107,58,0.35)] transition-all"
              >
                <span className="material-symbols-outlined text-[16px]">meeting_room</span>
                Host a Meetup Here
              </Link>
            </div>
          </div>

          {/* Navigation Tabs & Search Row */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-2 border-t border-white/[0.06]">
            <div className="flex items-center gap-1 overflow-x-auto pb-1 md:pb-0">
              <button
                onClick={() => setActiveTab("discussions")}
                className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  activeTab === "discussions"
                    ? "bg-[#201f21] text-[#f7bb82] shadow-sm border border-white/[0.08]"
                    : "text-[#94a3b8] hover:text-white hover:bg-[#18181c]"
                }`}
              >
                Discussions (Active)
              </button>
              <button
                onClick={() => setActiveTab("meetups")}
                className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                  activeTab === "meetups"
                    ? "bg-[#201f21] text-[#f7bb82] shadow-sm border border-white/[0.08]"
                    : "text-[#94a3b8] hover:text-white hover:bg-[#18181c]"
                }`}
              >
                Upcoming Meetups{" "}
                <span className="px-1.5 py-0.2 rounded-full bg-[#18181c] text-[#f59e0b] font-mono text-[10px]">
                  3
                </span>
              </button>
              <button
                onClick={() => setActiveTab("perks")}
                className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                  activeTab === "perks"
                    ? "bg-[#201f21] text-[#f7bb82] shadow-sm border border-white/[0.08]"
                    : "text-[#94a3b8] hover:text-white hover:bg-[#18181c]"
                }`}
              >
                Shared Perks{" "}
                <span className="px-1.5 py-0.2 rounded-full bg-[#18181c] text-[#ffb95f] font-mono text-[10px]">
                  3
                </span>
              </button>
              <button
                onClick={() => setActiveTab("directory")}
                className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                  activeTab === "directory"
                    ? "bg-[#201f21] text-[#f7bb82] shadow-sm border border-white/[0.08]"
                    : "text-[#94a3b8] hover:text-white hover:bg-[#18181c]"
                }`}
              >
                Builder Directory{" "}
                <span className="px-1.5 py-0.2 rounded-full bg-[#18181c] text-[#94a3b8] font-mono text-[10px]">
                  340
                </span>
              </button>
            </div>

            {/* Live Search */}
            <div className="relative w-full md:w-64">
              <span className="material-symbols-outlined absolute left-3 top-2.5 text-[18px] text-[#94a3b8] pointer-events-none">
                search
              </span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search threads or tags..."
                className="w-full pl-9 pr-3 py-1.5 bg-[#111114] border border-white/[0.08] text-white placeholder:text-[#94a3b8] text-xs rounded-xl outline-none focus:border-[#f59e0b] transition-all"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          WORKSPACE GRID (70% feed / 30% contextual sidebar)
          ══════════════════════════════════════════════════════════════ */}
      <main className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* LEFT COLUMN: THREADS & COMPOSER (8 cols) */}
          <div className="lg:col-span-8 flex flex-col gap-6">
            {/* PINNED ANNOUNCEMENT BANNER */}
            <div className="rounded-2xl bg-[#18181c] border border-white/[0.08] p-6 relative overflow-hidden shadow-xl shadow-black/40">
              <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-[#f59e0b]" />
              <div className="flex flex-col gap-3 pl-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="font-mono text-xs text-[#f59e0b] flex items-center gap-1 font-semibold">
                    <span className="material-symbols-outlined text-[16px]">push_pin</span>
                    PINNED BY ORGANIZER • 2 HOURS AGO
                  </span>
                  <span className="px-2 py-0.5 rounded bg-[#201f21] font-mono text-[11px] text-[#ffb95f]">
                    VIP-TABLE 1 • GUBENG 24H
                  </span>
                </div>

                <h2 className="text-xl font-bold text-[#f8fafc] tracking-tight">
                  Weekly Saturday Night Coding Session &amp; Mini Pitch — Table VIP-1
                </h2>

                <p className="text-sm text-[#94a3b8] leading-relaxed">
                  Surabaya founders &amp; senior devs: bring your current repo or sprint board. 1 Gbps dedicated Wi-Fi
                  bridge active on SSID <span className="font-mono text-[#f59e0b] font-semibold">#YAREH-DEV-PRIORITY</span>{" "}
                  with complimentary French Press Arabica refills for all confirmed seats.
                </p>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2 border-t border-white/[0.06]">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1.5 font-mono text-xs text-[#94a3b8]">
                      <span className="material-symbols-outlined text-[16px] text-[#f59e0b]">calendar_clock</span>
                      <span>Sat, 20:00 - 02:00 WIB</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex -space-x-2">
                        <div className="w-7 h-7 rounded-full bg-[#9c6b3a] flex items-center justify-center font-mono text-[10px] text-white font-bold ring-2 ring-[#18181c]">
                          RA
                        </div>
                        <div className="w-7 h-7 rounded-full bg-[#8e7130] flex items-center justify-center font-mono text-[10px] text-white font-bold ring-2 ring-[#18181c]">
                          NK
                        </div>
                        <div className="w-7 h-7 rounded-full bg-[#201f21] flex items-center justify-center font-mono text-[10px] text-white font-bold ring-2 ring-[#18181c]">
                          DK
                        </div>
                      </div>
                      <span className="font-mono text-xs text-[#f59e0b] font-semibold">
                        {pinnedSeats} / 30 Seats Claimed
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      if (!pinnedRsvpd) {
                        setPinnedRsvpd(true);
                        setPinnedSeats((s) => s + 1);
                      } else {
                        setPinnedRsvpd(false);
                        setPinnedSeats((s) => s - 1);
                      }
                    }}
                    className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-md ${
                      pinnedRsvpd
                        ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                        : "bg-[#f59e0b] hover:bg-[#ffb95f] text-[#0a0a0c]"
                    }`}
                  >
                    <span className="material-symbols-outlined text-[16px]">
                      {pinnedRsvpd ? "check" : "airline_seat_recline_normal"}
                    </span>
                    {pinnedRsvpd ? "RSVP Confirmed ✓" : "RSVP My Seat [Free]"}
                  </button>
                </div>
              </div>
            </div>

            {/* TAG QUICK FILTER STRIP */}
            <div className="flex items-center gap-2 overflow-x-auto py-1">
              <span className="font-mono text-xs text-[#94a3b8] uppercase tracking-wider pl-1">Tags:</span>
              {[
                "#All Threads",
                "#TechStack",
                "#CareerHiring",
                "#CoffeeCupping",
                "#ProductShowcase",
                "#LateNightCoding",
              ].map((tag) => (
                <button
                  key={tag}
                  onClick={() => setSelectedTag(tag)}
                  className={`px-3 py-1 rounded-full font-mono text-[11px] transition-all whitespace-nowrap ${
                    selectedTag === tag
                      ? "bg-[#f59e0b] text-[#0a0a0c] font-bold shadow-[0_0_10px_rgba(245,158,11,0.25)]"
                      : "bg-[#18181c] border border-white/[0.08] text-[#94a3b8] hover:text-white hover:border-[#f59e0b]/40"
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>

            {/* INLINE THREAD COMPOSER */}
            <form
              onSubmit={handleCreatePost}
              className="rounded-2xl bg-[#18181c] border border-white/[0.08] p-5 shadow-lg flex flex-col gap-4"
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-[#9c6b3a] flex-shrink-0 flex items-center justify-center font-bold text-white text-xs">
                  ME
                </div>
                <div className="flex-1 flex flex-col gap-2">
                  <input
                    type="text"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="Topic headline (e.g., Scaling Postgres on Ya'reh late-night Wi-Fi...)"
                    className="w-full bg-transparent font-bold text-base text-white placeholder:text-[#94a3b8] outline-none"
                  />
                  <textarea
                    rows={2}
                    value={newContent}
                    onChange={(e) => setNewContent(e.target.value)}
                    placeholder="Start a conversation with fellow builders in Surabaya... Share architecture hurdles, hiring needs, or brewing observations."
                    className="w-full bg-transparent text-sm text-[#94a3b8] placeholder:text-[#94a3b8]/60 resize-none outline-none"
                  />
                </div>
              </div>

              {showComposerSuccess && (
                <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-center gap-2">
                  <span className="material-symbols-outlined text-[16px]">check_circle</span>
                  <span>Thread broadcasted to Surabaya Tech Circle!</span>
                </div>
              )}

              <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-white/[0.06]">
                <div className="flex items-center gap-2 text-xs">
                  <span className="font-mono text-[11px] text-[#94a3b8]">Tag:</span>
                  <select
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    className="bg-[#111114] border border-white/[0.08] text-[#f7bb82] text-xs rounded-lg px-2 py-1 outline-none"
                  >
                    <option value="#TechStack">#TechStack</option>
                    <option value="#CareerHiring">#CareerHiring</option>
                    <option value="#CoffeeCupping">#CoffeeCupping</option>
                    <option value="#ProductShowcase">#ProductShowcase</option>
                    <option value="#LateNightCoding">#LateNightCoding</option>
                  </select>
                </div>

                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#f59e0b] hover:bg-[#ffb95f] text-[#0a0a0c] text-xs font-bold flex items-center gap-1.5 transition-colors shadow-sm"
                >
                  <span>Post to Circle</span>
                  <span className="material-symbols-outlined text-[16px]">send</span>
                </button>
              </div>
            </form>

            {/* THREAD STREAM */}
            <div className="flex flex-col gap-6">
              {filteredThreads.map((thread) => (
                <article
                  key={thread.id}
                  className="rounded-2xl bg-[#18181c] border border-white/[0.08] p-6 shadow-xl flex flex-col gap-4 hover:border-white/[0.14] transition-all"
                >
                  {/* Author Header */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 rounded-full ${thread.author.avatarBg} flex items-center justify-center font-bold text-white text-xs shadow-sm`}
                      >
                        {thread.author.initials}
                      </div>
                      <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-white">{thread.author.name}</span>
                          <span className="px-2 py-0.2 rounded bg-[#201f21] text-[#f59e0b] font-mono text-[10px]">
                            {thread.author.tier}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 font-mono text-[11px] text-[#94a3b8]">
                          <span>{thread.author.role}</span>
                          <span>•</span>
                          <span>{thread.timeAgo}</span>
                          <span>•</span>
                          <span className="text-[#f7bb82] flex items-center gap-0.5">
                            <span className="material-symbols-outlined text-[13px]">location_on</span>
                            {thread.author.location}
                          </span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => handleBookmark(thread.id)}
                      className={`p-1.5 rounded-lg border border-transparent transition-colors ${
                        thread.isBookmarked
                          ? "text-[#f59e0b] bg-[#f59e0b]/10 border-[#f59e0b]/20"
                          : "text-[#94a3b8] hover:text-white hover:bg-[#201f21]"
                      }`}
                      title="Bookmark thread"
                    >
                      <span className="material-symbols-outlined text-[18px]">
                        {thread.isBookmarked ? "bookmark_added" : "bookmark"}
                      </span>
                    </button>
                  </div>

                  {/* Thread Body */}
                  <div className="flex flex-col gap-3">
                    <h3 className="text-lg font-bold text-[#f8fafc] leading-snug">{thread.title}</h3>
                    <p className="text-sm text-[#94a3b8] leading-relaxed">{thread.content}</p>

                    {/* Code Block if any */}
                    {thread.codeSnippet && (
                      <div className="rounded-xl bg-[#0a0a0c] border border-white/[0.08] p-4 font-mono text-xs overflow-x-auto shadow-inner text-[#94a3b8]">
                        <div className="flex items-center justify-between pb-2 mb-2 border-b border-white/[0.06] text-[#94a3b8]">
                          <div className="flex items-center gap-2">
                            <span className="inline-block w-2.5 h-2.5 rounded-full bg-red-500/80" />
                            <span className="inline-block w-2.5 h-2.5 rounded-full bg-amber-500/80" />
                            <span className="inline-block w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
                            <span className="ml-1 text-white font-medium">{thread.codeSnippet.filename}</span>
                          </div>
                          <span className="text-[#f59e0b]">{thread.codeSnippet.runtime}</span>
                        </div>
                        <pre className="font-mono text-xs leading-relaxed text-[#f8fafc] overflow-x-auto">
                          {thread.codeSnippet.code}
                        </pre>
                      </div>
                    )}

                    {/* Metrics Grid if any */}
                    {thread.metrics && (
                      <div className="grid grid-cols-3 gap-2 bg-[#111114] p-2 rounded-xl border border-white/[0.06]">
                        <div className="flex flex-col items-center justify-center p-2.5 bg-[#18181c] rounded-lg text-center">
                          <span className="font-mono text-[10px] text-[#94a3b8]">Server Action p95</span>
                          <span className="font-bold text-sm text-[#f7bb82]">{thread.metrics.serverActionP95}</span>
                        </div>
                        <div className="flex flex-col items-center justify-center p-2.5 bg-[#18181c] rounded-lg text-center">
                          <span className="font-mono text-[10px] text-[#94a3b8]">NestJS REST p95</span>
                          <span className="font-bold text-sm text-[#f59e0b]">{thread.metrics.nestJsP95}</span>
                        </div>
                        <div className="flex flex-col items-center justify-center p-2.5 bg-[#18181c] rounded-lg text-center">
                          <span className="font-mono text-[10px] text-[#94a3b8]">Local Mesh Ping</span>
                          <span className="font-bold text-sm text-emerald-400">{thread.metrics.localMeshPing}</span>
                        </div>
                      </div>
                    )}

                    {/* Mockup Preview Images if any */}
                    {thread.mockupImages && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                        {thread.mockupImages.map((img, idx) => (
                          <div
                            key={idx}
                            className="relative rounded-xl overflow-hidden h-44 bg-[#111114] border border-white/[0.08] shadow group"
                          >
                            <Image
                              src={img.src}
                              alt={img.caption}
                              fill
                              className="object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                            <div className="absolute bottom-2 left-2 px-2 py-1 rounded bg-[#18181c]/90 backdrop-blur font-mono text-[11px] text-[#f7bb82]">
                              {img.caption}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Barista pairing recommendation */}
                    {thread.baristaTip && (
                      <div className="p-3 rounded-xl bg-[#201f21]/70 border border-[#f59e0b]/20 text-xs text-[#94a3b8] flex items-center gap-2">
                        <span className="material-symbols-outlined text-[18px] text-[#f59e0b]">coffee</span>
                        <span>
                          <strong className="text-white">Barista Pairing:</strong> {thread.baristaTip}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Tags & Social Metrics */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-white/[0.06]">
                    <div className="flex flex-wrap items-center gap-1.5">
                      {thread.tags.map((tg) => (
                        <span
                          key={tg}
                          onClick={() => setSelectedTag(tg)}
                          className="px-2 py-0.5 rounded bg-[#111114] text-[#94a3b8] font-mono text-[10px] hover:text-[#f59e0b] cursor-pointer"
                        >
                          {tg}
                        </span>
                      ))}
                    </div>

                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => handleUpvote(thread.id)}
                        className={`flex items-center gap-1.5 px-3 py-1 rounded-full font-mono text-xs font-semibold transition-colors ${
                          thread.isUpvoted
                            ? "bg-[#f59e0b] text-[#0a0a0c]"
                            : "bg-[#201f21] hover:bg-[#2a2a2c] text-[#f7bb82]"
                        }`}
                      >
                        <span className="material-symbols-outlined text-[15px]">arrow_upward</span>
                        <span>{thread.upvotes} Upvotes</span>
                      </button>

                      <div className="flex items-center gap-1 text-[#94a3b8] font-mono text-xs">
                        <span className="material-symbols-outlined text-[15px]">chat_bubble</span>
                        <span>{thread.replies} Replies</span>
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>

          {/* RIGHT COLUMN: GUILD META & PERKS (4 cols) */}
          <aside className="lg:col-span-4 flex flex-col gap-6">
            {/* MODULE 1: ACTIVE CIRCLE PERKS */}
            <div className="rounded-2xl bg-[#18181c] border border-white/[0.08] p-6 shadow-xl flex flex-col gap-3 relative overflow-hidden">
              <div className="absolute -right-8 -top-8 w-28 h-28 rounded-full bg-[#9c6b3a]/20 blur-xl pointer-events-none" />
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-white flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[20px] text-[#f59e0b]">workspace_premium</span>
                  Active Circle Perks
                </h3>
                <span className="px-2 py-0.5 rounded bg-[#201f21] text-[#f59e0b] font-mono text-[10px]">
                  TIER 2
                </span>
              </div>
              <p className="text-xs text-[#94a3b8]">
                Automatically applied to your Warkop Ya&apos;reh POS order barcode when checked-in to this circle.
              </p>

              <div className="flex flex-col gap-2 pt-1">
                <div className="p-3 rounded-xl bg-[#111114] border border-white/[0.04] flex items-start gap-3">
                  <span className="material-symbols-outlined text-[20px] text-[#f59e0b] flex-shrink-0 mt-0.5">
                    percent
                  </span>
                  <div>
                    <h4 className="text-xs font-bold text-white">15% Off All Pour-Over Brews</h4>
                    <p className="font-mono text-[10px] text-[#94a3b8] mt-0.5">
                      Valid during any registered meetup hours
                    </p>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-[#111114] border border-white/[0.04] flex items-start gap-3">
                  <span className="material-symbols-outlined text-[20px] text-[#f7bb82] flex-shrink-0 mt-0.5">
                    lock_clock
                  </span>
                  <div>
                    <h4 className="text-xs font-bold text-white">VIP Meeting Room Priority</h4>
                    <p className="font-mono text-[10px] text-[#94a3b8] mt-0.5">
                      Zero deposit for 4+ person dev squads
                    </p>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-[#111114] border border-white/[0.04] flex items-start gap-3">
                  <span className="material-symbols-outlined text-[20px] text-emerald-400 flex-shrink-0 mt-0.5">
                    wifi
                  </span>
                  <div>
                    <h4 className="text-xs font-bold text-white">Low-Latency SSID Bypass</h4>
                    <p className="font-mono text-[10px] text-[#94a3b8] mt-0.5">
                      Direct fiber routing to SG/ID AWS clusters
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* MODULE 2: UPCOMING MEETUPS */}
            <div className="rounded-2xl bg-[#18181c] border border-white/[0.08] p-6 shadow-xl flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-white flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[20px] text-[#f59e0b]">event_available</span>
                  Upcoming Gatherings
                </h3>
                <Link href="/community" className="font-mono text-[11px] text-[#f7bb82] hover:underline">
                  All Events →
                </Link>
              </div>

              <div className="flex flex-col gap-3">
                <div className="p-3.5 rounded-xl bg-[#111114] border border-white/[0.04] flex flex-col gap-1.5">
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.2 rounded bg-[#9c6b3a]/30 text-[#f7bb82] font-mono text-[10px]">
                      TOMORROW
                    </span>
                    <span className="font-mono text-[11px] text-[#94a3b8]">20:00 WIB</span>
                  </div>
                  <h4 className="text-xs font-bold text-white">Late Night Code Sprint &amp; Show</h4>
                  <p className="text-[11px] text-[#94a3b8]">Gubeng 24H Sanctuary • Table VIP-1</p>
                  <div className="flex items-center justify-between pt-1">
                    <span className="font-mono text-[10px] text-[#f59e0b]">28 / 30 RSVP&apos;d</span>
                    <span className="text-[#f7bb82] text-xs font-semibold">Seat Open</span>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-[#111114] border border-white/[0.04] flex flex-col gap-1.5">
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.2 rounded bg-[#201f21] text-[#94a3b8] font-mono text-[10px]">
                      WED, 12 NOV
                    </span>
                    <span className="font-mono text-[11px] text-[#94a3b8]">19:30 WIB</span>
                  </div>
                  <h4 className="text-xs font-bold text-white">AI Agents &amp; Single-Origin Cupping</h4>
                  <p className="text-[11px] text-[#94a3b8]">Darmo Flagship • Tasting Lab #2</p>
                  <div className="flex items-center justify-between pt-1">
                    <span className="font-mono text-[10px] text-[#f59e0b]">14 / 20 RSVP&apos;d</span>
                    <span className="text-[#f7bb82] text-xs font-semibold">Waitlist</span>
                  </div>
                </div>
              </div>
            </div>

            {/* MODULE 3: CIRCLE MENTORS & LEADS */}
            <div className="rounded-2xl bg-[#18181c] border border-white/[0.08] p-6 shadow-xl flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-white flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[20px] text-[#e8c47a]">supervisor_account</span>
                  Circle Mentors &amp; Leads
                </h3>
                <span className="font-mono text-[11px] text-[#94a3b8]">3 Active</span>
              </div>

              <div className="flex flex-col gap-3">
                {[
                  {
                    name: "Rayhan Al-Farisi",
                    role: "Founder • Systems Architect",
                    initials: "RA",
                    bg: "bg-[#9c6b3a]",
                  },
                  {
                    name: "Nadia Kusuma",
                    role: "Product & UX Director",
                    initials: "NK",
                    bg: "bg-[#8e7130]",
                  },
                  {
                    name: "Budi Santoso",
                    role: "Head Barista & Tech Host",
                    initials: "BS",
                    bg: "bg-[#201f21]",
                  },
                ].map((m, idx) => (
                  <div key={idx} className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`w-9 h-9 rounded-full ${m.bg} flex items-center justify-center font-mono text-[11px] text-white font-bold`}
                      >
                        {m.initials}
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-white">{m.name}</h4>
                        <p className="font-mono text-[10px] text-[#94a3b8]">{m.role}</p>
                      </div>
                    </div>
                    <a
                      href="https://wa.me/6281234567890"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 rounded-lg bg-[#111114] hover:bg-[#201f21] text-[#94a3b8] hover:text-[#f59e0b] transition-colors"
                      title="Contact on WhatsApp"
                    >
                      <span className="material-symbols-outlined text-[16px]">chat</span>
                    </a>
                  </div>
                ))}
              </div>
            </div>

            {/* MODULE 4: HUB LOCATION WIDGET */}
            <div className="rounded-2xl bg-[#18181c] border border-white/[0.08] p-6 shadow-xl flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[11px] text-[#94a3b8] uppercase">Home Base</span>
                <span className="font-mono text-[10px] text-emerald-400 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  Open 24 Hours
                </span>
              </div>

              <div className="relative w-full h-32 rounded-xl overflow-hidden bg-[#111114] border border-white/[0.08]">
                <Image
                  src="/images/darmo-interior.png"
                  alt="Warkop Ya'reh Gubeng Sanctuary"
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0c] via-transparent to-transparent" />
                <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between">
                  <span className="text-xs font-bold text-white">Warkop Ya&apos;reh Gubeng</span>
                  <a
                    href="https://maps.google.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-2 py-0.5 rounded bg-[#9c6b3a] text-white font-mono text-[10px] flex items-center gap-0.5 hover:bg-[#825426]"
                  >
                    Maps <span className="material-symbols-outlined text-[11px]">open_in_new</span>
                  </a>
                </div>
              </div>

              <p className="font-mono text-[11px] text-[#94a3b8] leading-relaxed">
                Jl. Raya Gubeng No. 44, Surabaya • Power sockets available at 100% of tables with dedicated low-latency
                uplink.
              </p>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}
