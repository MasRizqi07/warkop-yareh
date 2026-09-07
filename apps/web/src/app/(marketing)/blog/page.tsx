'use client';

import React, { useState, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, ArrowRight, Search, Sparkles } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { SectionHeader } from '@/components/shared/section-header';
import { blogPosts } from '@/data/mock';
import { formatDate } from '@/lib/utils';
import { staggerContainer, staggerItem } from '@/lib/animations';

// Local category artwork avoids third-party tracking and screenshot/network drift.
const categoryImages: Record<string, string> = {
  'Coffee Guide': '/images/cold-brew-aren-brulee.png',
  'Behind the Scenes': '/images/darmo-interior.png',
  Community: '/images/artisan-toasted-sourdough.png',
  default: '/images/hero/hero-coffee.png',
};

export default function BlogPage() {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');

  const categories = [
    { id: 'all', label: 'All Posts' },
    { id: 'Coffee Guide', label: 'Coffee Guide' },
    { id: 'Community', label: 'Community' },
    { id: 'Behind the Scenes', label: 'Behind the Scenes' },
  ];

  // Filter posts dynamically
  const filteredPosts = useMemo(() => {
    return blogPosts.filter((post) => {
      const matchSearch =
        post.title.toLowerCase().includes(search.toLowerCase()) ||
        post.excerpt.toLowerCase().includes(search.toLowerCase());
      const matchCategory =
        activeCategory === 'all' || post.category === activeCategory;
      return matchSearch && matchCategory;
    });
  }, [search, activeCategory]);

  // Highlight first post as featured if no active filters
  const featured =
    search === '' && activeCategory === 'all' ? filteredPosts[0] : null;
  const listPosts = featured ? filteredPosts.slice(1) : filteredPosts;

  return (
    <div className="relative min-h-screen bg-canvas-obsidian pb-16 font-body text-on-surface">
      {/* Noise Overlay */}
      <div className="pointer-events-none fixed inset-0 z-0 bg-grid opacity-20" />

      {/* Hero with Radial Mesh background */}
      <section className="relative overflow-hidden border-b border-border-subtle bg-surface-secondary pb-12 pt-24">
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
              className="w-full rounded-2xl border border-border-subtle bg-surface-container-high/40 py-3 pl-11 pr-4 text-xs text-on-surface outline-none backdrop-blur-md transition-colors placeholder:text-text-muted focus:border-primary focus:ring-1 focus:ring-primary"
              placeholder="Search stories, brewing guides, meetups..."
              type="text"
            />
          </div>
        </div>
      </section>

      {/* Main Content grid container */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-10">
        {/* Category Tabs Nav */}
        <nav className="custom-scroll no-scrollbar flex justify-start gap-2.5 overflow-x-auto border-b border-border-subtle pb-2 md:justify-center">
          {categories.map((cat) => {
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`flex-shrink-0 rounded-full px-5 py-2 font-heading text-xs font-semibold uppercase tracking-wider transition-all [transition-duration:var(--duration-normal)] active:scale-95 ${
                  isActive
                    ? 'bg-primary-container text-on-primary-container shadow-md'
                    : 'bg-surface-container-highest/30 text-on-surface-variant hover:bg-surface-container-high/50'
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
              className="delight-card group relative overflow-hidden rounded-2xl border border-border-subtle bg-surface-card"
            >
              <div className="grid md:grid-cols-2">
                {/* Image */}
                <div className="relative h-64 md:h-auto min-h-[300px] overflow-hidden">
                  <Image
                    alt={featured.title}
                    fill
                    sizes="(max-w-768px) 100vw, 50vw"
                    className="object-cover opacity-80 transition-transform [transition-duration:var(--duration-slow)] group-hover:scale-[1.02]"
                    src={
                      categoryImages[featured.category] ||
                      categoryImages.default
                    }
                    loading="eager"
                  />
                  <div className="absolute top-4 left-4">
                    <Badge
                      variant="gold"
                      className="uppercase tracking-widest px-2.5 py-0.5 text-[9px]"
                    >
                      Featured
                    </Badge>
                  </div>
                </div>
                {/* Content */}
                <div className="p-8 flex flex-col justify-center space-y-4">
                  <div className="flex items-center gap-3">
                    <Badge
                      size="sm"
                      className="bg-primary/20 text-primary border border-primary/25 rounded-md uppercase text-[9px] tracking-wider font-bold"
                    >
                      {featured.category}
                    </Badge>
                    <span className="flex items-center gap-1 font-mono text-[10px] font-semibold uppercase text-text-muted">
                      <Clock className="w-3.5 h-3.5" />
                      {featured.readTime} min read
                    </span>
                  </div>
                  <h2 className="text-xl font-extrabold leading-tight text-text-primary transition-colors group-hover:text-primary md:text-2xl">
                    {featured.title}
                  </h2>
                  <p className="font-body text-xs leading-relaxed text-on-surface-variant">
                    {featured.excerpt}
                  </p>
                  <div className="flex items-center justify-between border-t border-border-subtle pt-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-container text-xs font-bold text-on-primary-container shadow-md">
                        {featured.author.name
                          .split(' ')
                          .map((n: string) => n[0])
                          .join('')}
                      </div>
                      <div>
                        <div className="text-xs font-bold text-text-primary">
                          {featured.author.name}
                        </div>
                        <div className="font-mono text-[9px] uppercase text-text-muted">
                          {formatDate(featured.publishedAt)}
                        </div>
                      </div>
                    </div>
                    <Link
                      href={`/blog/${featured.slug}`}
                      className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-primary transition-all [transition-duration:var(--duration-normal)] hover:text-primary-fixed-dim group-hover:translate-x-1"
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
                  className="delight-card group flex flex-col justify-between overflow-hidden rounded-2xl border border-border-subtle bg-surface-card"
                >
                  <div className="space-y-4">
                    {/* Cover graphic */}
                    <div className="relative h-48 w-full overflow-hidden">
                      <Image
                        alt={post.title}
                        fill
                        sizes="(max-w-768px) 100vw, 33vw"
                        className="object-cover opacity-75 transition-transform [transition-duration:var(--duration-slow)] group-hover:scale-[1.02]"
                        src={
                          categoryImages[post.category] ||
                          categoryImages.default
                        }
                        loading={index < 3 ? 'eager' : 'lazy'}
                      />
                      <div className="absolute top-3 left-3">
                        <Badge
                          size="sm"
                          className="bg-primary-container text-on-primary-container uppercase text-[9px] tracking-wider rounded-md font-bold"
                        >
                          {post.category}
                        </Badge>
                      </div>
                    </div>

                    <div className="px-6 space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="flex items-center gap-1 font-mono text-[10px] uppercase text-text-muted">
                          <Clock className="w-3.5 h-3.5" />
                          {post.readTime} min read
                        </span>
                      </div>
                      <h3 className="line-clamp-2 text-base font-bold leading-tight text-text-primary transition-colors group-hover:text-primary">
                        <Link href={`/blog/${post.slug}`}>{post.title}</Link>
                      </h3>
                      <p className="line-clamp-2 font-body text-xs leading-relaxed text-on-surface-variant">
                        {post.excerpt}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center gap-3 border-t border-border-subtle px-6 pb-6 pt-4">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-container text-[10px] font-bold text-on-primary-container shadow-sm">
                      {post.author.name
                        .split(' ')
                        .map((n: string) => n[0])
                        .join('')}
                    </div>
                    <div className="text-[10px]">
                      <span className="font-bold text-text-primary">
                        {post.author.name}
                      </span>
                      <span className="font-mono font-semibold uppercase text-text-muted">
                        {' '}
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
              className="rounded-2xl border border-border-subtle bg-surface-card py-20 text-center"
            >
              <Sparkles className="w-12 h-12 text-on-surface-variant/40 mx-auto mb-3 animate-pulse" />
              <h3 className="text-sm font-bold text-text-primary">
                No posts match your filters
              </h3>
              <p className="mt-1 text-xs text-on-surface-variant">
                Try resetting search or picking another category.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
