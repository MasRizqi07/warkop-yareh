'use client';

import React, { useMemo, useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  SlidersHorizontal,
  Heart,
  Clock,
  Zap,
  Coffee,
  ShoppingBag,
  Flame,
  CheckCircle2,
  X,
  ArrowRight,
  Sparkles,
  MapPin,
  ChevronDown,
} from 'lucide-react';
import type { Product } from '@warkop-yareh/types';
import { ProductCustomizerModal } from '@/components/menu/ProductCustomizerModal';
import { useActiveBranch, useCatalog } from '@/features/catalog/catalog.hooks';
import { useCartStore, useCheckoutStore, type FulfillmentType } from '@/stores';
import { DataState, LoadingState } from '@/components/data-state';
import { soundEffects } from '@/lib/audioAlerts';

const QUICK_TAGS = [
  'Bestseller',
  'Less Sugar Friendly',
  'Plant-Based Milk',
  'Single Origin',
  'Warm Kitchen',
  'High Caffeine',
];

export default function MenuPage() {
  const branches = useActiveBranch();
  const { activeBranch } = branches;
  const catalog = useCatalog(activeBranch?.id);
  const cartItems = useCartStore((state) => state.items);
  const cartTotal = useCartStore((state) => state.total());
  const setCartOpen = useCartStore((state) => state.setCartOpen);
  const addItem = useCartStore((state) => state.addItem);

  const fulfillmentType = useCheckoutStore((state) => state.fulfillmentType);
  const setFulfillmentType = useCheckoutStore((state) => state.setFulfillmentType);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'popular' | 'prep' | 'price-asc' | 'price-desc'>('popular');
  const [favorites, setFavorites] = useState<Set<string>>(() => new Set<string>());
  const [customizingProduct, setCustomizingProduct] = useState<Product | null>(null);

  const allProducts = useMemo(() => catalog.data?.products ?? [], [catalog.data?.products]);

  const categories = [
    { id: 'all', label: 'All Creations', count: allProducts.length },
    ...(catalog.data?.categories ?? []).map((category) => ({
      id: category.slug,
      label: category.name,
      count: allProducts.filter((product) => product.category === category.slug).length,
    })),
  ];

  const filteredProducts = useMemo(() => {
    return allProducts
      .filter((product) => {
        const matchesCategory =
          selectedCategory === 'all' || product.category === selectedCategory;
        const matchesSearch =
          searchQuery === '' ||
          product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          product.description.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesTag = !selectedTag || (product.tags ?? []).includes(selectedTag);
        return matchesCategory && matchesSearch && matchesTag;
      })
      .sort((a, b) => {
        if (sortBy === 'price-asc') return a.price - b.price;
        if (sortBy === 'price-desc') return b.price - a.price;
        if (sortBy === 'prep') return a.preparationTime - b.preparationTime;
        return (b.isPopular ? 1 : 0) - (a.isPopular ? 1 : 0);
      });
  }, [allProducts, selectedCategory, searchQuery, selectedTag, sortBy]);

  const toggleFavorite = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setFavorites((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
        soundEffects.playSuccessChime();
      }
      return next;
    });
  };

  const handleQuickAdd = (product: Product, e: React.MouseEvent) => {
    e.stopPropagation();
    addItem(product);
    soundEffects.playSuccessChime();
    setCartOpen(true);
  };

  return (
    <div className="min-h-screen bg-canvas-obsidian text-on-surface pb-32">
      {/* Dynamic Roast Notification Bar */}
      <div className="bg-surface-secondary/90 border-b border-border-subtle py-2.5 px-4 sm:px-6 lg:px-8 backdrop-blur-md">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-surface-card text-accent-amber font-mono text-[10px] font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-accent-amber animate-pulse" />
              ROAST BATCH #842
            </span>
            <span className="text-text-muted text-[11px]">
              Fresh Flores Bajawa beans arriving at 02:00 AM WIB. Midnight Barista special brews active.
            </span>
          </div>
          <div className="flex items-center gap-1.5 font-mono text-[11px] text-primary">
            <Zap className="w-3.5 h-3.5 text-accent-amber" />
            <span>Average Barista Queue: 4.2 mins</span>
          </div>
        </div>
      </div>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8">
        {/* Branch & Omnichannel Order Mode Header */}
        <section className="p-6 rounded-2xl bg-surface-secondary border border-border-subtle shadow-lg flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-brand-coffee/20 border border-brand-coffee/30 flex items-center justify-center text-primary">
              <Coffee className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-[11px] text-text-muted uppercase tracking-wider">
                  Ordering Destination
                </span>
                <span className="w-1 h-1 rounded-full bg-outline-variant" />
                <span className="font-mono text-[10px] text-cream-beige bg-surface-card px-2 py-0.5 rounded">
                  {activeBranch?.name ?? 'Surabaya Flagship'}
                </span>
              </div>
              <h2 className="font-heading text-xl font-bold text-text-primary tracking-tight mt-0.5">
                {activeBranch ? `${activeBranch.name}, Surabaya` : 'Darmo Flagship, Surabaya'}
              </h2>
              <div className="flex items-center gap-2 mt-1 text-xs">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <span className="font-mono text-[11px] text-emerald-400">Open 24 Hours • Baristas Online</span>
                <span className="text-text-muted text-[11px]">• Fast WiFi 350 Mbps</span>
              </div>
            </div>
          </div>

          {/* Omnichannel Switch Pills */}
          <div className="flex flex-wrap items-center gap-1.5 p-1.5 rounded-xl bg-canvas-obsidian border border-border-subtle">
            <button
              onClick={() => setFulfillmentType('dine-in')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all ${
                fulfillmentType === 'dine-in'
                  ? 'bg-primary-container text-on-primary-container shadow-sm'
                  : 'text-text-muted hover:text-text-primary'
              }`}
            >
              <span>Dine-In QR (Meja #14)</span>
            </button>
            <button
              onClick={() => setFulfillmentType('pickup')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all ${
                fulfillmentType === 'pickup'
                  ? 'bg-primary-container text-on-primary-container shadow-sm'
                  : 'text-text-muted hover:text-text-primary'
              }`}
            >
              <span>Takeaway Pickup</span>
            </button>
            <button
              onClick={() => setFulfillmentType('drive-thru')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all ${
                fulfillmentType === 'drive-thru'
                  ? 'bg-primary-container text-on-primary-container shadow-sm'
                  : 'text-text-muted hover:text-text-primary'
              }`}
            >
              <span>Drive-Thru Slot</span>
            </button>
            <button
              onClick={() => setFulfillmentType('delivery')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all ${
                fulfillmentType === 'delivery'
                  ? 'bg-primary-container text-on-primary-container shadow-sm'
                  : 'text-text-muted hover:text-text-primary'
              }`}
            >
              <span>Priority Delivery</span>
            </button>
          </div>
        </section>

        {/* Search & Global Command Bar */}
        <div className="flex flex-col md:flex-row gap-4 items-stretch">
          <div className="relative flex-1">
            <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari 42+ artisanal brews, sourdough toast, beans..."
              className="w-full pl-12 pr-28 py-3.5 rounded-xl bg-surface-secondary border border-border-subtle text-text-primary placeholder:text-text-muted text-xs sm:text-sm focus:outline-none focus:border-accent-amber/50 shadow-sm"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-12 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-surface-card flex items-center justify-center text-text-muted hover:text-text-primary"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
            <span className="absolute right-3.5 top-1/2 -translate-y-1/2 px-2 py-0.5 rounded bg-canvas-obsidian font-mono text-[10px] text-text-muted border border-border-subtle">
              ⌘K
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative min-w-[200px]">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                aria-label="Urutkan menu berdasarkan"
                className="w-full appearance-none px-4 py-3.5 rounded-xl bg-surface-secondary border border-border-subtle text-text-primary text-xs font-medium focus:outline-none focus:border-accent-amber/50 cursor-pointer pr-10 shadow-sm"
              >
                <option value="popular">Popularitas / Rekomendasi</option>
                <option value="prep">Waktu Racik (Tercepat)</option>
                <option value="price-asc">Harga: Rendah ke Tinggi</option>
                <option value="price-desc">Harga: Tinggi ke Rendah</option>
              </select>
              <ChevronDown className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-text-muted" />
            </div>
          </div>
        </div>

        {/* Sticky Category Bar with Badges */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                selectedCategory === cat.id
                  ? 'bg-accent-amber text-canvas-obsidian shadow-md'
                  : 'bg-surface-secondary text-text-muted hover:text-text-primary hover:bg-surface-card border border-border-subtle'
              }`}
            >
              <span>{cat.label}</span>
              <span className="px-1.5 py-0.5 rounded-full bg-canvas-obsidian/20 font-mono text-[10px]">
                {cat.count}
              </span>
            </button>
          ))}
        </div>

        {/* Quick Tag Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none text-xs">
          <span className="text-text-muted font-mono text-[11px] uppercase tracking-wider">Filter:</span>
          {QUICK_TAGS.map((tag) => (
            <button
              key={tag}
              onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
              className={`px-3 py-1 rounded-full text-xs transition-all ${
                selectedTag === tag
                  ? 'bg-primary text-on-primary font-semibold'
                  : 'bg-surface-card border border-border-subtle text-text-muted hover:text-text-primary'
              }`}
            >
              {tag}
            </button>
          ))}
          {selectedTag && (
            <button
              onClick={() => setSelectedTag(null)}
              className="text-xs text-rose-400 hover:underline ml-2"
            >
              Reset filter
            </button>
          )}
        </div>

        {/* Products Grid */}
        {catalog.isPending ? (
          <LoadingState label="Memuat katalog digital..." />
        ) : catalog.isError ? (
          <DataState title="Katalog gagal dimuat" retry={() => void catalog.refetch()} />
        ) : filteredProducts.length === 0 ? (
          <DataState
            title="Tidak ada menu yang sesuai"
            detail="Coba kata kunci lain atau reset filter kategori."
            retry={() => {
              setSearchQuery('');
              setSelectedCategory('all');
              setSelectedTag(null);
            }}
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredProducts.map((product) => {
              const isFav = favorites.has(product.id);
              return (
                <motion.article
                  key={product.id}
                  whileHover={{ y: -6 }}
                  onClick={() => setCustomizingProduct(product)}
                  className="group cursor-pointer rounded-2xl border border-border-subtle bg-surface-card overflow-hidden flex flex-col justify-between shadow-xl transition-all hover:border-accent-amber/40 hover:shadow-2xl"
                >
                  <div className="relative aspect-[4/3] w-full bg-surface-secondary overflow-hidden">
                    <Image
                      src={product.image}
                      alt={product.name}
                      fill
                      sizes="(max-width: 768px) 100vw, 300px"
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-canvas-obsidian via-transparent to-transparent opacity-60" />

                    {/* Heart Favorite Button */}
                    <button
                      onClick={(e) => toggleFavorite(product.id, e)}
                      aria-label="Simpan ke favorit"
                      className="absolute top-3 right-3 w-8 h-8 rounded-full bg-canvas-obsidian/80 backdrop-blur-md flex items-center justify-center text-text-muted hover:text-rose-400 transition-colors border border-border-subtle"
                    >
                      <Heart className={`w-4 h-4 ${isFav ? 'fill-rose-500 text-rose-500' : ''}`} />
                    </button>

                    {/* Status Badges */}
                    {(product.isPopular || product.isNew) && (
                      <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-[10px] font-mono font-bold uppercase bg-canvas-obsidian/85 text-accent-amber border border-border-subtle backdrop-blur-md">
                        {product.isPopular ? 'Popular' : 'Baru'}
                      </span>
                    )}

                    <span className="absolute bottom-3 left-3 font-mono text-[11px] text-text-muted bg-canvas-obsidian/80 px-2 py-0.5 rounded backdrop-blur-sm">
                      ~{product.preparationTime} menit
                    </span>
                  </div>

                  <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                    <div>
                      <h3 className="font-heading font-bold text-base text-text-primary group-hover:text-primary transition-colors">
                        {product.name}
                      </h3>
                      <p className="text-xs text-text-muted mt-1 leading-relaxed line-clamp-2">
                        {product.description}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-border-subtle flex items-center justify-between">
                      <div>
                        <span className="font-mono text-sm font-bold text-accent-amber">
                          Rp {product.price.toLocaleString('id-ID')}
                        </span>
                        <span className="block font-mono text-[10px] text-text-muted capitalize">
                          {product.category}
                        </span>
                      </div>
                      <button
                        onClick={(e) => handleQuickAdd(product, e)}
                        className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-brand-coffee to-secondary-container text-text-primary text-xs font-semibold hover:opacity-90 transition-all flex items-center gap-1.5 shadow-sm"
                      >
                        <span>+ Tambah</span>
                      </button>
                    </div>
                  </div>
                </motion.article>
              );
            })}
          </div>
        )}
      </div>

      {/* Product Customizer Modal */}
      <ProductCustomizerModal
        product={customizingProduct}
        isOpen={Boolean(customizingProduct)}
        onClose={() => setCustomizingProduct(null)}
      />
    </div>
  );
}
