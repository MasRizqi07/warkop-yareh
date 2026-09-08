"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useParams } from "next/navigation";
import {
  Users,
  Terminal,
  Coffee,
  CheckCircle2,
  UserPlus,
  DoorOpen,
  Search,
  Pin,
  Calendar,
  Check,
  Armchair,
  Send,
  MapPin,
  BookmarkCheck,
  Bookmark,
  ArrowUp,
  MessageSquare,
  Award,
  Percent,
  Clock,
  Wifi,
  CalendarCheck,
  MessageCircle,
  ExternalLink,
} from "lucide-react";

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
      avatarBg: "bg-brand-coffee",
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
      avatarBg: "bg-brand-coffee/80",
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
      avatarBg: "bg-surface-container",
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
        avatarBg: "bg-accent-amber",
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
    <div className="min-h-screen bg-canvas-obsidian text-text-primary">
      {/* ══════════════════════════════════════════════════════════════
          ATMOSPHERIC GUILD HERO & BANNER
          ══════════════════════════════════════════════════════════════ */}
      <section className="relative w-full overflow-hidden bg-canvas-obsidian border-b border-border-subtle">
        {/* Ambient background with dark scrim */}
        <div className="absolute inset-0 z-0 opacity-25 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-brand-coffee/40 via-canvas-obsidian to-canvas-obsidian" />
        <div className="absolute -right-20 -top-20 w-96 h-96 rounded-full bg-accent-amber/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-10 flex flex-col gap-6">
          {/* Breadcrumb & Metadata Badges */}
          <div className="flex flex-wrap items-center justify-between gap-3 font-mono text-xs text-text-muted">
            <div className="flex items-center gap-2">
              <Link href="/community" className="flex items-center gap-1 hover:text-primary transition-colors">
                <Users className="w-4 h-4" />
                Circles &amp; Guilds
              </Link>
              <span className="text-primary font-medium capitalize">
                {groupId.replace(/-/g, " ")}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-surface-container text-accent-amber font-mono text-[11px] shadow-[0_0_12px_rgba(245,158,11,0.2)]">
                Official Ya&apos;reh Guild (Verified)
              </span>
              <span className="px-2 py-0.5 rounded bg-surface-card text-tertiary font-mono text-[11px]">
                Weekly Fri &amp; Sat Nights
              </span>
            </div>
          </div>

          {/* Identity Header Split */}
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
            <div className="flex items-start gap-4">
              {/* Guild Logo Emblem */}
              <div className="relative flex-shrink-0 w-20 h-20 rounded-2xl bg-surface-card border border-border-subtle flex items-center justify-center shadow-2xl shadow-black/60 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-brand-coffee/40 via-transparent to-accent-amber/20" />
                <Terminal className="w-10 h-10 text-primary relative z-10" />
                <div className="absolute bottom-1 right-1 w-3.5 h-3.5 rounded-full bg-accent-amber ring-2 ring-surface-card" />
              </div>

              <div className="flex flex-col gap-1.5">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-text-primary tracking-tight">
                  Surabaya Tech &amp; Startup Coffee Circle
                </h1>
                <div className="flex flex-wrap items-center gap-2 text-text-muted text-xs">
                  <span className="flex items-center gap-1 text-text-primary">
                    <Users className="w-3.5 h-3.5 text-accent-amber" />
                    <strong className="text-text-primary">340</strong> Active Builders
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Coffee className="w-3.5 h-3.5 text-primary" />
                    Sanctuary Hub: <strong className="text-primary">Gubeng 24H Co-Lab</strong>
                  </span>
                  <span>•</span>
                  <span className="font-mono text-[11px]">Est. Oct 2023</span>
                  <span>•</span>
                  <span className="text-accent-amber font-mono text-[11px] flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-accent-amber" />
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
                    ? "bg-surface-card border border-accent-amber/30 text-primary hover:bg-surface-container"
                    : "bg-accent-amber text-canvas-obsidian hover:bg-secondary"
                }`}
              >
                {isJoined ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                ) : (
                  <UserPlus className="w-4 h-4 text-canvas-obsidian" />
                )}
                {isJoined ? "Joined (Active Member)" : "Join Circle"}
              </button>

              <Link
                href="/booking"
                className="px-4 py-2 rounded-xl bg-brand-coffee hover:bg-primary-container text-text-primary text-xs font-bold flex items-center gap-1.5 shadow-[0_4px_16px_rgba(156,107,58,0.35)] transition-all"
              >
                <DoorOpen className="w-4 h-4" />
                Host a Meetup Here
              </Link>
            </div>
          </div>

          {/* Sub-Navigation Tabs */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-border-subtle">
            <div className="flex items-center gap-1 overflow-x-auto">
              {[
                { id: "discussions", label: "Discussions & Code" },
                { id: "meetups", label: "Scheduled Meetups" },
                { id: "perks", label: "Exclusive Circle Perks" },
                { id: "directory", label: "Patron Directory" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as typeof activeTab)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                    activeTab === tab.id
                      ? "bg-surface-card text-accent-amber border border-border-subtle shadow-sm"
                      : "text-text-muted hover:text-text-primary hover:bg-surface-secondary"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Live Search */}
            <div className="relative w-full md:w-64">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-text-muted pointer-events-none" />
              <input
                aria-label="Search group threads"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search threads or tags..."
                className="w-full pl-9 pr-3 py-1.5 bg-surface-secondary border border-border-subtle text-text-primary placeholder:text-text-muted text-xs rounded-xl outline-none focus:border-accent-amber transition-all"
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
            <div className="rounded-2xl bg-surface-card border border-border-subtle p-6 relative overflow-hidden shadow-xl shadow-black/40">
              <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-accent-amber" />
              <div className="flex flex-col gap-3 pl-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="font-mono text-xs text-accent-amber flex items-center gap-1 font-semibold">
                    <Pin className="w-4 h-4 text-accent-amber" />
                    PINNED BY ORGANIZER • 2 HOURS AGO
                  </span>
                  <span className="px-2 py-0.5 rounded bg-surface-container font-mono text-[11px] text-primary">
                    VIP-TABLE 1 • GUBENG 24H
                  </span>
                </div>

                <h2 className="text-xl font-bold text-text-primary tracking-tight">
                  Weekly Saturday Night Coding Session &amp; Mini Pitch — Table VIP-1
                </h2>

                <p className="text-sm text-text-muted leading-relaxed">
                  Surabaya founders &amp; senior devs: bring your current repo or sprint board. 1 Gbps dedicated Wi-Fi
                  bridge active on SSID <span className="font-mono text-accent-amber font-semibold">#YAREH-DEV-PRIORITY</span>{" "}
                  with complimentary French Press Arabica refills for all confirmed seats.
                </p>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2 border-t border-border-subtle">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1.5 font-mono text-xs text-text-muted">
                      <Calendar className="w-4 h-4 text-accent-amber" />
                      <span>Sat, 20:00 - 02:00 WIB</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex -space-x-2">
                        <div className="w-7 h-7 rounded-full bg-brand-coffee flex items-center justify-center font-mono text-[10px] text-text-primary font-bold ring-2 ring-surface-card">
                          RA
                        </div>
                        <div className="w-7 h-7 rounded-full bg-brand-coffee/80 flex items-center justify-center font-mono text-[10px] text-text-primary font-bold ring-2 ring-surface-card">
                          NK
                        </div>
                        <div className="w-7 h-7 rounded-full bg-surface-container flex items-center justify-center font-mono text-[10px] text-text-primary font-bold ring-2 ring-surface-card">
                          DK
                        </div>
                      </div>
                      <span className="font-mono text-xs text-accent-amber font-semibold">
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
                        : "bg-accent-amber hover:bg-secondary text-canvas-obsidian"
                    }`}
                  >
                    {pinnedRsvpd ? (
                      <Check className="w-4 h-4" />
                    ) : (
                      <Armchair className="w-4 h-4" />
                    )}
                    {pinnedRsvpd ? "RSVP Confirmed ✓" : "RSVP My Seat [Free]"}
                  </button>
                </div>
              </div>
            </div>

            {/* TAG QUICK FILTER STRIP */}
            <div className="flex items-center gap-2 overflow-x-auto py-1">
              <span className="font-mono text-xs text-text-muted uppercase tracking-wider pl-1">Tags:</span>
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
                      ? "bg-accent-amber text-canvas-obsidian font-bold shadow-[0_0_10px_rgba(245,158,11,0.25)]"
                      : "bg-surface-card border border-border-subtle text-text-muted hover:text-text-primary hover:border-accent-amber/40"
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>

            {/* INLINE THREAD COMPOSER */}
            <form
              onSubmit={handleCreatePost}
              className="rounded-2xl bg-surface-card border border-border-subtle p-5 shadow-lg flex flex-col gap-4"
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-brand-coffee flex-shrink-0 flex items-center justify-center font-bold text-text-primary text-xs">
                  ME
                </div>
                <div className="flex-1 flex flex-col gap-2">
                  <input
                    aria-label="Thread title"
                    type="text"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="Topic headline (e.g., Scaling Postgres on Ya'reh late-night Wi-Fi...)"
                    className="w-full bg-transparent font-bold text-base text-text-primary placeholder:text-text-muted outline-none"
                  />
                  <textarea
                    aria-label="Thread content"
                    rows={2}
                    value={newContent}
                    onChange={(e) => setNewContent(e.target.value)}
                    placeholder="Start a conversation with fellow builders in Surabaya... Share architecture hurdles, hiring needs, or brewing observations."
                    className="w-full bg-transparent text-sm text-text-muted placeholder:text-text-muted/60 resize-none outline-none"
                  />
                </div>
              </div>

              {showComposerSuccess && (
                <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Thread broadcasted to Surabaya Tech Circle!</span>
                </div>
              )}

              <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-border-subtle">
                <div className="flex items-center gap-2 text-xs">
                  <span className="font-mono text-[11px] text-text-muted">Tag:</span>
                  <select
                    aria-label="Thread tag"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    className="bg-surface-secondary border border-border-subtle text-primary text-xs rounded-lg px-2 py-1 outline-none"
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
                  className="px-4 py-2 rounded-xl bg-accent-amber hover:bg-secondary text-canvas-obsidian text-xs font-bold flex items-center gap-1.5 transition-colors shadow-sm"
                >
                  <span>Post to Circle</span>
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </form>

            {/* THREAD STREAM */}
            <div className="flex flex-col gap-6">
              {filteredThreads.map((thread) => (
                <article
                  key={thread.id}
                  className="rounded-2xl bg-surface-card border border-border-subtle p-6 shadow-xl flex flex-col gap-4 hover:border-white/[0.14] transition-all"
                >
                  {/* Author Header */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 rounded-full ${thread.author.avatarBg} flex items-center justify-center font-bold text-text-primary text-xs shadow-sm`}
                      >
                        {thread.author.initials}
                      </div>
                      <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-text-primary">{thread.author.name}</span>
                          <span className="px-2 py-0.5 rounded bg-surface-container text-accent-amber font-mono text-[10px]">
                            {thread.author.tier}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 font-mono text-[11px] text-text-muted">
                          <span>{thread.author.role}</span>
                          <span>•</span>
                          <span>{thread.timeAgo}</span>
                          <span>•</span>
                          <span className="text-primary flex items-center gap-0.5">
                            <MapPin className="w-3.5 h-3.5" />
                            {thread.author.location}
                          </span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => handleBookmark(thread.id)}
                      className={`p-1.5 rounded-lg border border-transparent transition-colors ${
                        thread.isBookmarked
                          ? "text-accent-amber bg-accent-amber/10 border-accent-amber/20"
                          : "text-text-muted hover:text-text-primary hover:bg-surface-container"
                      }`}
                      title="Bookmark thread"
                    >
                      {thread.isBookmarked ? (
                        <BookmarkCheck className="w-4 h-4 text-accent-amber" />
                      ) : (
                        <Bookmark className="w-4 h-4" />
                      )}
                    </button>
                  </div>

                  {/* Thread Body */}
                  <div className="flex flex-col gap-3">
                    <h3 className="text-lg font-bold text-text-primary leading-snug">{thread.title}</h3>
                    <p className="text-sm text-text-muted leading-relaxed">{thread.content}</p>

                    {/* Code Block if any */}
                    {thread.codeSnippet && (
                      <div className="rounded-xl bg-canvas-obsidian border border-border-subtle p-4 font-mono text-xs overflow-x-auto shadow-inner text-text-muted">
                        <div className="flex items-center justify-between pb-2 mb-2 border-b border-border-subtle text-text-muted">
                          <div className="flex items-center gap-2">
                            <span className="inline-block w-2.5 h-2.5 rounded-full bg-red-500/80" />
                            <span className="inline-block w-2.5 h-2.5 rounded-full bg-amber-500/80" />
                            <span className="inline-block w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
                            <span className="ml-1 text-text-primary font-medium">{thread.codeSnippet.filename}</span>
                          </div>
                          <span className="text-accent-amber">{thread.codeSnippet.runtime}</span>
                        </div>
                        <pre className="font-mono text-xs leading-relaxed text-text-primary overflow-x-auto">
                          {thread.codeSnippet.code}
                        </pre>
                      </div>
                    )}

                    {/* Metrics Grid if any */}
                    {thread.metrics && (
                      <div className="grid grid-cols-3 gap-2 bg-surface-secondary p-2 rounded-xl border border-border-subtle">
                        <div className="flex flex-col items-center justify-center p-2.5 bg-surface-card rounded-lg text-center">
                          <span className="font-mono text-[10px] text-text-muted">Server Action p95</span>
                          <span className="font-bold text-sm text-primary">{thread.metrics.serverActionP95}</span>
                        </div>
                        <div className="flex flex-col items-center justify-center p-2.5 bg-surface-card rounded-lg text-center">
                          <span className="font-mono text-[10px] text-text-muted">NestJS REST p95</span>
                          <span className="font-bold text-sm text-accent-amber">{thread.metrics.nestJsP95}</span>
                        </div>
                        <div className="flex flex-col items-center justify-center p-2.5 bg-surface-card rounded-lg text-center">
                          <span className="font-mono text-[10px] text-text-muted">Local Mesh Ping</span>
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
                            className="relative rounded-xl overflow-hidden h-44 bg-surface-secondary border border-border-subtle shadow group"
                          >
                            <Image
                              src={img.src}
                              alt={img.caption}
                              fill
                              sizes="(min-width: 1024px) 22vw, (min-width: 640px) 44vw, 100vw"
                              className="object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                            <div className="absolute bottom-2 left-2 px-2 py-1 rounded bg-surface-card/90 backdrop-blur font-mono text-[11px] text-primary">
                              {img.caption}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Barista pairing recommendation */}
                    {thread.baristaTip && (
                      <div className="p-3 rounded-xl bg-surface-container/70 border border-accent-amber/20 text-xs text-text-muted flex items-center gap-2">
                        <Coffee className="w-4 h-4 text-accent-amber" />
                        <span>
                          <strong className="text-text-primary">Barista Pairing:</strong> {thread.baristaTip}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Tags & Social Metrics */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-border-subtle">
                    <div className="flex flex-wrap items-center gap-1.5">
                      {thread.tags.map((tg) => (
                        <span
                          key={tg}
                          onClick={() => setSelectedTag(tg)}
                          className="px-2 py-0.5 rounded bg-surface-secondary text-text-muted font-mono text-[10px] hover:text-accent-amber cursor-pointer"
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
                            ? "bg-accent-amber text-canvas-obsidian"
                            : "bg-surface-container hover:bg-surface-container-high text-primary"
                        }`}
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                        <span>{thread.upvotes} Upvotes</span>
                      </button>

                      <div className="flex items-center gap-1 text-text-muted font-mono text-xs">
                        <MessageSquare className="w-3.5 h-3.5" />
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
            <div className="rounded-2xl bg-surface-card border border-border-subtle p-6 shadow-xl flex flex-col gap-3 relative overflow-hidden">
              <div className="absolute -right-8 -top-8 w-28 h-28 rounded-full bg-brand-coffee/20 blur-xl pointer-events-none" />
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-text-primary flex items-center gap-1.5">
                  <Award className="w-5 h-5 text-accent-amber" />
                  Active Circle Perks
                </h3>
                <span className="px-2 py-0.5 rounded bg-surface-container text-accent-amber font-mono text-[10px]">
                  TIER 2
                </span>
              </div>
              <p className="text-xs text-text-muted">
                Automatically applied to your Warkop Ya&apos;reh POS order barcode when checked-in to this circle.
              </p>

              <div className="flex flex-col gap-2 pt-1">
                <div className="p-3 rounded-xl bg-surface-secondary border border-border-subtle flex items-start gap-3">
                  <Percent className="w-5 h-5 text-accent-amber flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-bold text-text-primary">15% Off All Pour-Over Brews</h4>
                    <p className="font-mono text-[10px] text-text-muted mt-0.5">
                      Valid during any registered meetup hours
                    </p>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-surface-secondary border border-border-subtle flex items-start gap-3">
                  <Clock className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-bold text-text-primary">VIP Meeting Room Priority</h4>
                    <p className="font-mono text-[10px] text-text-muted mt-0.5">
                      Zero deposit for 4+ person dev squads
                    </p>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-surface-secondary border border-border-subtle flex items-start gap-3">
                  <Wifi className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-bold text-text-primary">Low-Latency SSID Bypass</h4>
                    <p className="font-mono text-[10px] text-text-muted mt-0.5">
                      Direct fiber routing to SG/ID AWS clusters
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* MODULE 2: UPCOMING MEETUPS */}
            <div className="rounded-2xl bg-surface-card border border-border-subtle p-6 shadow-xl flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-text-primary flex items-center gap-1.5">
                  <CalendarCheck className="w-5 h-5 text-accent-amber" />
                  Upcoming Gatherings
                </h3>
                <Link href="/community" className="font-mono text-[11px] text-primary hover:underline">
                  All Events →
                </Link>
              </div>

              <div className="flex flex-col gap-3">
                <div className="p-3.5 rounded-xl bg-surface-secondary border border-border-subtle flex flex-col gap-1.5">
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded bg-brand-coffee/30 text-primary font-mono text-[10px]">
                      TOMORROW
                    </span>
                    <span className="font-mono text-[11px] text-text-muted">20:00 WIB</span>
                  </div>
                  <h4 className="text-xs font-bold text-text-primary">Late Night Code Sprint &amp; Show</h4>
                  <p className="text-[11px] text-text-muted">Gubeng 24H Sanctuary • Table VIP-1</p>
                  <div className="flex items-center justify-between pt-1">
                    <span className="font-mono text-[10px] text-accent-amber">28 / 30 RSVP&apos;d</span>
                    <span className="text-primary text-xs font-semibold">Seat Open</span>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-surface-secondary border border-border-subtle flex flex-col gap-1.5">
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded bg-surface-container text-text-muted font-mono text-[10px]">
                      WED, 12 NOV
                    </span>
                    <span className="font-mono text-[11px] text-text-muted">19:30 WIB</span>
                  </div>
                  <h4 className="text-xs font-bold text-text-primary">AI Agents &amp; Single-Origin Cupping</h4>
                  <p className="text-[11px] text-text-muted">Darmo Flagship • Tasting Lab #2</p>
                  <div className="flex items-center justify-between pt-1">
                    <span className="font-mono text-[10px] text-accent-amber">14 / 20 RSVP&apos;d</span>
                    <span className="text-primary text-xs font-semibold">Waitlist</span>
                  </div>
                </div>
              </div>
            </div>

            {/* MODULE 3: CIRCLE MENTORS & LEADS */}
            <div className="rounded-2xl bg-surface-card border border-border-subtle p-6 shadow-xl flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-text-primary flex items-center gap-1.5">
                  <Users className="w-5 h-5 text-tertiary" />
                  Circle Mentors &amp; Leads
                </h3>
                <span className="font-mono text-[11px] text-text-muted">3 Active</span>
              </div>

              <div className="flex flex-col gap-3">
                {[
                  {
                    name: "Rayhan Al-Farisi",
                    role: "Founder • Systems Architect",
                    initials: "RA",
                    bg: "bg-brand-coffee",
                  },
                  {
                    name: "Nadia Kusuma",
                    role: "Product & UX Director",
                    initials: "NK",
                    bg: "bg-brand-coffee/80",
                  },
                  {
                    name: "Budi Santoso",
                    role: "Head Barista & Tech Host",
                    initials: "BS",
                    bg: "bg-surface-container",
                  },
                ].map((m, idx) => (
                  <div key={idx} className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`w-9 h-9 rounded-full ${m.bg} flex items-center justify-center font-mono text-[11px] text-text-primary font-bold`}
                      >
                        {m.initials}
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-text-primary">{m.name}</h4>
                        <p className="font-mono text-[10px] text-text-muted">{m.role}</p>
                      </div>
                    </div>
                    <a
                      href="https://wa.me/6281234567890"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 rounded-lg bg-surface-secondary hover:bg-surface-container text-text-muted hover:text-accent-amber transition-colors"
                      title="Contact on WhatsApp"
                    >
                      <MessageCircle className="w-4 h-4" />
                    </a>
                  </div>
                ))}
              </div>
            </div>

            {/* MODULE 4: HUB LOCATION WIDGET */}
            <div className="rounded-2xl bg-surface-card border border-border-subtle p-6 shadow-xl flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[11px] text-text-muted uppercase">Home Base</span>
                <span className="font-mono text-[10px] text-emerald-400 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  Open 24 Hours
                </span>
              </div>

              <div className="relative w-full h-32 rounded-xl overflow-hidden bg-surface-secondary border border-border-subtle">
                <Image
                  src="/images/darmo-interior.png"
                  alt="Warkop Ya'reh Gubeng Sanctuary"
                  fill
                  sizes="(min-width: 1024px) 28vw, 100vw"
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-canvas-obsidian via-transparent to-transparent" />
                <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between">
                  <span className="text-xs font-bold text-text-primary">Warkop Ya&apos;reh Gubeng</span>
                  <a
                    href="https://maps.google.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-2 py-0.5 rounded bg-brand-coffee text-text-primary font-mono text-[10px] flex items-center gap-0.5 hover:bg-primary-container"
                  >
                    Maps <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>

              <p className="font-mono text-[11px] text-text-muted leading-relaxed">
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
