"use client";

import React, { useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Clock, ArrowRight, Search, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { SectionHeader } from "@/components/shared/section-header";
import { blogPosts } from "@/data/mock";
import { formatDate } from "@/lib/utils";
import { staggerContainer, staggerItem } from "@/lib/animations";

// Mapping category titles to whitelisted placeholder images for beautiful, premium graphics
const categoryImages: Record<string, string> = {
  "Coffee Guide":
    "https://lh3.googleusercontent.com/aida-public/AB6AXuDYw602AtnbJJESMy_bdiuZotsmjhWjgb1zYnkFm8Jv7mcz0mhNhUzQbEM8MiZDyIoORvjmKYYUFqP-tLrTv3ForjZjgbs157Mgdp3wlCzk2sd99lc2Q0eBZYE1JqZOTW9VG54gUA5e9eYZA_3rzhKIySMKzCFu_K4mwlkk0_oBjtxOGVPAiUT5Axje5CkB-v2drmsLa_NA2fxTtc1LaAI2UOHz8Ub4kDAfRGdY7Y2s7F-kIJEiuFG92Os5BLrVRZ80k7mTWW_20uM",
  "Behind the Scenes":
    "https://lh3.googleusercontent.com/aida-public/AB6AXuBuGOQLHldozLrjCTOkApDD6xUWmUIos9NXqPf0zrd3NqgrVlZRXf-DxSm7H4-gDawdrjYOEU8l75r0xtYwPGtVm3e6uWYhjVuTMcW_NqAaLwJcy4eDDHlzT4uLXjcoAq2lYyQouMtc7dtlObxC9ejW6aSYJmusAHbJgCGj_ZNi9Pl2DrYg7u7n_Tf9kopyw4XPArjJ_WJPTOBjfUSdo86Xka2TuKEl1L1oCia00TfKUDE2SUr2FRAAf_rG7j7XdZEK6rfeqn1Tia4",
  "Community":
    "https://lh3.googleusercontent.com/aida-public/AB6AXuC3cQNDVWLj_cT3txxifaPrCIWzVAUUYrTiVjdr-wXGQpAs1PYe8SSH-ygr1F6CqvYO6hMujsROHNZNgh2wffdbQ2HxTRg0N_1ds9DS-6h4ejv5Vj_Ha5soMY2M3QcdDiYkvpAGNWKhXVbNB2jeftsxXJPcbkZ_7vLA7dRvgjqsuCc2o-4uLmtuoDyDEZoLwugDdl--4ibTTGC_Vok4pzYYCddVWhoXZ1sly7_MumLSdB9jjYiJexbQ6ekytbZT09fkRzXcidQGP74",
  "default":
    "https://lh3.googleusercontent.com/aida-public/AB6AXuDhLJIk6lrVYtMEIRb3biYCadHukC3TaaK36VSik-cCNy7V8N1KdACPbMsr1swFmFXFwAGAgHdlD9Gcn3PCNflumIc0MDo4gHazdPgI_hP-YpUo0QesLZ993nPSHjWAFUucj0n4P_EmwydnD3gv6uT2VvcGLeKFXW3dfVMxd5lH5R5iJsIBEAHAoAiFVYH6o88MZPPPxhHRjCuzh856-CJ-Ej0UNtyDXlxPHvgYlUSWpiAqNn2bJl247f3-lLjd4IoT8PAwo_Z6gKQ",
};

export default function BlogPage() {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");

  const categories = [
    { id: "all", label: "All Posts" },
    { id: "Coffee Guide", label: "Coffee Guide" },
    { id: "Community", label: "Community" },
    { id: "Behind the Scenes", label: "Behind the Scenes" },
  ];

  // Filter posts dynamically
  const filteredPosts = useMemo(() => {
    return blogPosts.filter((post) => {
      const matchSearch =
        post.title.toLowerCase().includes(search.toLowerCase()) ||
        post.excerpt.toLowerCase().includes(search.toLowerCase());
      const matchCategory =
        activeCategory === "all" || post.category === activeCategory;
      return matchSearch && matchCategory;
    });
  }, [search, activeCategory]);

  // Highlight first post as featured if no active filters
  const featured = search === "" && activeCategory === "all" ? filteredPosts[0] : null;
  const listPosts = featured ? filteredPosts.slice(1) : filteredPosts;

  return (
    <div className="relative min-h-screen bg-background pb-16">
      {/* Noise Overlay */}
      <div className="fixed inset-0 organic-noise pointer-events-none z-0"></div>

      {/* Hero with Radial Mesh background */}
      <section className="relative pt-24 pb-12 overflow-hidden border-b border-white/5 bg-surface-container/10">
        <div className="absolute inset-0 bg-mesh z-0" />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
          <SectionHeader
            badge="Journal"
            title="Stories &amp; Insights"
            description="Tips brewing, cerita di balik layar, dan insight hangat langsung dari komunitas Warkop Ya'reh."
          />

          {/* Interactive Search Bar */}
          <div className="max-w-md mx-auto relative mt-6">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant/60" />
            <input
              aria-label="Search blog posts"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-surface-container-high/40 border border-white/5 rounded-2xl py-3 pl-11 pr-4 text-xs text-on-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none backdrop-blur-md transition-all placeholder:text-[var(--text-ter)]"
              placeholder="Search stories, brewing guides, meetups..."
              type="text"
            />
          </div>
        </div>
      </section>

      {/* Main Content grid container */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-10">
        
        {/* Category Tabs Nav */}
        <nav className="flex gap-2.5 overflow-x-auto pb-2 custom-scroll no-scrollbar justify-start md:justify-center border-b border-white/5">
          {categories.map((cat) => {
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`flex-shrink-0 px-5 py-2 rounded-full font-headline-md text-xs font-semibold uppercase tracking-wider transition-all duration-300 active:scale-95 ${
                  isActive
                    ? "bg-primary-container text-on-primary-container shadow-md"
                    : "bg-surface-container-highest/30 text-on-surface-variant hover:bg-surface-container-high/50"
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </nav>

        {/* Featured Post Block */}
        <AnimatePresence mode="wait">
          {featured && (
            <motion.article
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="relative rounded-2xl overflow-hidden glass-card border border-white/5 bg-surface-container/20 group card-hover"
            >
              <div className="grid md:grid-cols-2">
                {/* Image */}
                <div className="relative h-64 md:h-auto min-h-[300px] overflow-hidden">
                  <Image
                    alt={featured.title}
                    fill
                    sizes="(max-w-768px) 100vw, 50vw"
                    className="object-cover group-hover:scale-102 transition-transform duration-1000 opacity-80"
                    src={categoryImages[featured.category] || categoryImages.default}
                    loading="eager"
                  />
                  <div className="absolute top-4 left-4">
                    <Badge variant="gold" className="uppercase tracking-widest px-2.5 py-0.5 text-[9px]">Featured</Badge>
                  </div>
                </div>
                {/* Content */}
                <div className="p-8 flex flex-col justify-center space-y-4">
                  <div className="flex items-center gap-3">
                    <Badge size="sm" className="bg-primary/20 text-primary border border-primary/25 rounded-md uppercase text-[9px] tracking-wider font-bold">
                      {featured.category}
                    </Badge>
                    <span className="flex items-center gap-1 text-[10px] text-[var(--text-tertiary)] uppercase font-receipt-label font-semibold">
                      <Clock className="w-3.5 h-3.5" />
                      {featured.readTime} min read
                    </span>
                  </div>
                  <h2 className="text-xl md:text-2xl font-extrabold text-[var(--text-primary)] leading-tight group-hover:text-primary transition-colors">
                    {featured.title}
                  </h2>
                  <p className="text-xs text-[var(--text-secondary)] leading-relaxed font-body">
                    {featured.excerpt}
                  </p>
                  <div className="flex items-center justify-between pt-4 border-t border-white/5">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white text-xs font-bold shadow-md shadow-primary-500/10">
                        {featured.author.name
                          .split(" ")
                          .map((n: string) => n[0])
                          .join("")}
                      </div>
                      <div>
                        <div className="text-xs font-bold text-[var(--text-primary)]">
                          {featured.author.name}
                        </div>
                        <div className="text-[9px] text-[var(--text-tertiary)] uppercase font-receipt-label">
                          {formatDate(featured.publishedAt)}
                        </div>
                      </div>
                    </div>
                    <Link
                      href={`/blog/${featured.slug}`}
                      className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-primary hover:text-primary-fixed-dim transition-colors group-hover:translate-x-1 duration-300"
                    >
                      Read Story <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              </div>
            </motion.article>
          )}
        </AnimatePresence>

        {/* Regular Blog Posts Grid */}
        <AnimatePresence mode="wait">
          {listPosts.length > 0 ? (
            <motion.div
              key={activeCategory + search}
              variants={staggerContainer}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
            {listPosts.map((post, index) => (
                <motion.article
                  key={post.id}
                  variants={staggerItem}
                  className="group rounded-2xl overflow-hidden glass-card border border-white/5 bg-surface-container/20 flex flex-col justify-between card-hover"
                >
                  <div className="space-y-4">
                    {/* Cover graphic */}
                    <div className="relative h-48 w-full overflow-hidden">
                      <Image
                        alt={post.title}
                        fill
                        sizes="(max-w-768px) 100vw, 33vw"
                        className="object-cover opacity-75 group-hover:scale-102 transition-transform duration-1000"
                        src={categoryImages[post.category] || categoryImages.default}
                        loading={index < 3 ? "eager" : "lazy"}
                      />
                      <div className="absolute top-3 left-3">
                        <Badge size="sm" className="bg-primary-container text-on-primary-container uppercase text-[9px] tracking-wider rounded-md font-bold">
                          {post.category}
                        </Badge>
                      </div>
                    </div>

                    <div className="px-6 space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-[var(--text-tertiary)] uppercase font-receipt-label flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          {post.readTime} min read
                        </span>
                      </div>
                      <h3 className="text-base font-bold text-[var(--text-primary)] group-hover:text-primary transition-colors leading-tight line-clamp-2">
                        <Link href={`/blog/${post.slug}`}>{post.title}</Link>
                      </h3>
                      <p className="text-xs text-[var(--text-secondary)] leading-relaxed font-body line-clamp-2">
                        {post.excerpt}
                      </p>
                    </div>
                  </div>

                  <div className="px-6 pb-6 pt-4 mt-4 border-t border-white/5 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white text-[10px] font-bold shadow-sm">
                      {post.author.name
                        .split(" ")
                        .map((n: string) => n[0])
                        .join("")}
                    </div>
                    <div className="text-[10px]">
                      <span className="font-bold text-[var(--text-primary)]">
                        {post.author.name}
                      </span>
                      <span className="text-[var(--text-tertiary)] uppercase font-receipt-label font-semibold">
                        {" "}
                        &bull; {formatDate(post.publishedAt)}
                      </span>
                    </div>
                  </div>
                </motion.article>
              ))}
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-20 glass-card rounded-2xl border border-white/5 bg-surface-container/20"
            >
              <Sparkles className="w-12 h-12 text-on-surface-variant/40 mx-auto mb-3 animate-pulse" />
              <h3 className="text-sm font-bold text-[var(--text-primary)]">No posts match your filters</h3>
              <p className="text-xs text-[var(--text-secondary)] mt-1">Try resetting search or picking another category.</p>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
