"use client";

import React, { useState } from "react";
import { MessageSquare, Users, ShieldAlert, Heart, User, ArrowRight, Trash } from "lucide-react";

interface CommunityGroup {
  id: string;
  name: string;
  membersCount: number;
  postsCount: number;
  category: string;
}

interface ForumPost {
  id: string;
  authorName: string;
  groupName: string;
  content: string;
  likes: number;
  comments: number;
  createdAt: string;
}

export default function CommunityPage() {
  const [activeTab, setActiveTab] = useState<"GROUPS" | "POSTS">("GROUPS");

  const groups: CommunityGroup[] = [
    { id: "GRP-01", name: "Surabaya JS Enthusiasts", membersCount: 142, postsCount: 38, category: "Tech & Coding" },
    { id: "GRP-02", name: "Kopi & Design Guild", membersCount: 88, postsCount: 15, category: "Creative & Design" },
    { id: "GRP-03", name: "Surabaya Writers Guild", membersCount: 65, postsCount: 22, category: "Art & Writing" },
  ];

  const posts: ForumPost[] = [
    { id: "P-301", authorName: "Devon Pratama", groupName: "Surabaya JS Enthusiasts", content: "Anyone up for a co-working sprint session tonight at Darmo branch? Coding & Toraja Drips!", likes: 12, comments: 4, createdAt: "10 mins ago" },
    { id: "P-302", authorName: "Lia Amanda", groupName: "Kopi & Design Guild", content: "Just posted my latte art mockup challenge review! Check out the glassmorphic components.", likes: 8, comments: 2, createdAt: "1 hour ago" },
    { id: "P-303", authorName: "Bagus Setiawan", groupName: "Surabaya Writers Guild", content: "Great read about specialty coffee history. Inspiring session at the cupping lab last weekend.", likes: 5, comments: 0, createdAt: "3 hours ago" },
  ];

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto text-[var(--text-primary)]">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-bold text-[var(--text-primary)]">Community Hub</h1>
          <p className="font-sans text-xs text-[var(--text-secondary)] mt-0.5">Moderate customer discussions, create community groups, and view forum activity</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => alert("Create community group modal")}
            className="bg-[var(--interactive-primary)] text-white hover:bg-[var(--interactive-primary-hover)] font-bold px-4 py-2 rounded-xl text-xs transition-all shadow-md active:scale-95 shrink-0"
          >
            CREATE GROUP
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 border-b border-[var(--border-default)]">
        <button
          onClick={() => setActiveTab("GROUPS")}
          className={`px-4 py-2 text-xs font-semibold uppercase tracking-wider transition-colors border-b-2 ${
            activeTab === "GROUPS"
              ? "border-[var(--color-primary)] text-[var(--text-brand)] font-bold"
              : "border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
          }`}
        >
          Groups ({groups.length})
        </button>
        <button
          onClick={() => setActiveTab("POSTS")}
          className={`px-4 py-2 text-xs font-semibold uppercase tracking-wider transition-colors border-b-2 ${
            activeTab === "POSTS"
              ? "border-[var(--color-primary)] text-[var(--text-brand)] font-bold"
              : "border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
          }`}
        >
          Recent Posts ({posts.length})
        </button>
      </div>

      {/* Conditional Rendering */}
      {activeTab === "GROUPS" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {groups.map((g) => (
            <div key={g.id} className="rounded-2xl border border-[var(--border-default)] bg-[var(--surface-tertiary)] p-6 hover:shadow-lg transition-all duration-300 relative overflow-hidden group">
              <span className="font-mono text-[10px] text-[var(--text-tertiary)] uppercase tracking-wider font-semibold">{g.category}</span>
              <h3 className="font-heading text-lg font-bold text-[var(--text-primary)] group-hover:text-[var(--text-brand)] transition-colors mt-2">{g.name}</h3>

              <div className="mt-6 flex justify-between items-center text-xs text-[var(--text-secondary)] border-t border-[var(--border-default)]/50 pt-4">
                <div className="flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-[var(--text-brand)]" />
                  <span>{g.membersCount} Members</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <MessageSquare className="w-4 h-4 text-[var(--text-brand)]" />
                  <span>{g.postsCount} Posts</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === "POSTS" && (
        <div className="space-y-6">
          {posts.map((p) => (
            <div key={p.id} className="rounded-2xl border border-[var(--border-default)] bg-[var(--surface-tertiary)] p-6 hover:shadow-md transition-all">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[var(--color-primary)]/10 flex items-center justify-center text-[var(--text-brand)]">
                    <User className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-sans text-sm font-bold text-[var(--text-primary)]">{p.authorName}</h4>
                    <p className="text-[10px] font-sans text-[var(--text-secondary)]">in <span className="text-[var(--text-brand)] font-semibold">{p.groupName}</span> • {p.createdAt}</p>
                  </div>
                </div>
                <button 
                  onClick={() => alert(`Moderate/Delete post ${p.id}`)}
                  className="p-1.5 text-red-500/80 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors border border-transparent hover:border-red-500/20"
                >
                  <Trash className="w-4 h-4" />
                </button>
              </div>

              <p className="font-sans text-xs text-[var(--text-secondary)] leading-relaxed">{p.content}</p>

              <div className="mt-4 flex items-center gap-4 text-xs font-mono text-[var(--text-tertiary)] border-t border-[var(--border-default)]/50 pt-3">
                <div className="flex items-center gap-1">
                  <Heart className="w-3.5 h-3.5 fill-red-500/10 text-red-500" />
                  <span>{p.likes}</span>
                </div>
                <div className="flex items-center gap-1">
                  <MessageSquare className="w-3.5 h-3.5 text-[var(--text-brand)]" />
                  <span>{p.comments} comments</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
