'use client';

import React, { useMemo, useState } from 'react';

import Image from 'next/image';

import Link from 'next/link';

import { motion } from 'framer-motion';

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
  Store,
  Utensils,
  Car,
  Bike,
} from 'lucide-react';

import type { Product } from '@warkop-yareh/types';
import { DURATION, EASE, STAGGER } from '@warkop-yareh/ui';

import { ProductCustomizerModal } from '@/components/menu/ProductCustomizerModal';

import { useActiveBranch, useCatalog } from '@/features/catalog/catalog.hooks';

import { useCartStore, useCheckoutStore, FulfillmentType } from '@/stores';

import { DataState, LoadingState } from '@/components/data-state';

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

  const fulfillmentType = useCheckoutStore((state) => state.fulfillmentType);

  const setFulfillmentType = useCheckoutStore(
    (state) => state.setFulfillmentType
  );

  const tableLabel = useCheckoutStore((state) => state.tableLabel);

  const [searchQuery, setSearchQuery] = useState('');

  const [selectedCategory, setSelectedCategory] = useState('all');

  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  const [favorites, setFavorites] = useState<Set<string>>(
    () => new Set<string>()
  );

  const [customizingProduct, setCustomizingProduct] = useState<Product | null>(
    null
  );

  const allProducts = useMemo(
    () => catalog.data?.products ?? [],
    [catalog.data?.products]
  );

  const categories = [
    { id: 'all', label: 'All Creations', count: allProducts.length },

    ...(catalog.data?.categories ?? []).map((category) => ({
      id: category.slug,
      label: category.name,
      count: allProducts.filter((product) => product.category === category.slug)
        .length,
    })),
  ];

  const filteredProducts = useMemo(() => {
    const search = searchQuery.trim().toLowerCase();

    return allProducts.filter((product) => {
      const matchesSearch =
        !search ||
        product.name.toLowerCase().includes(search) ||
        product.description.toLowerCase().includes(search) ||
        (product.ingredients ?? []).some((i) =>
          i.toLowerCase().includes(search)
        );

      const matchesCategory =
        selectedCategory === 'all' ||
        product.category === selectedCategory ||
        (selectedCategory === 'manual-brew' &&
          product.tags.includes('Manual Brew'));

      const matchesTag = !selectedTag || product.tags.includes(selectedTag);

      return matchesSearch && matchesCategory && matchesTag;
    });
  }, [allProducts, searchQuery, selectedCategory, selectedTag]);

  const toggleFavorite = (productId: string) => {
    setFavorites((current) => {
      const next = new Set(current);

      if (next.has(productId)) next.delete(productId);
      else next.add(productId);

      return next;
    });
  };

  const totalCartCount = cartItems.reduce(
    (acc, item) => acc + item.quantity,
    0
  );

  const fulfillmentModes: Array<{
    type: FulfillmentType;
    label: string;
    icon: React.ElementType;
    sub?: string;
  }> = [
    {
      type: 'dine-in',
      label: 'Dine-In QR',
      icon: Utensils,
      sub: tableLabel || 'Pindai QR meja',
    },

    { type: 'pickup', label: 'Takeaway Pickup', icon: ShoppingBag },

    { type: 'drive-thru', label: 'Drive-Thru Slot', icon: Car },

    { type: 'delivery', label: 'Priority Delivery', icon: Bike },
  ];

  return (
    <main className="min-h-screen bg-canvas-obsidian text-text-primary pt-4 pb-32 transition-colors">
      {/* 1. DYNAMIC NOTIFICATION BAR */}

      <div className="w-full bg-surface-secondary/90 backdrop-blur-md border-b border-border-subtle py-2.5 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-surface-card text-accent-amber font-mono text-[11px] border border-border-subtle">
              <span className="w-1.5 h-1.5 rounded-full bg-accent-amber animate-pulse" />
              WARKOP YA’REH
            </span>

            <span className="text-xs text-text-muted hidden md:inline">
              Pilih sajian yang tersedia di cabang tujuan Anda.
            </span>
          </div>

          <div className="flex items-center gap-1.5 font-mono text-xs text-accent-amber">
            <Zap className="w-3.5 h-3.5" />

            <span>Harga mengikuti cabang pilihan</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-6">
        {/* 2. BRANCH & OMNICHANNEL ORDER MODE HEADER */}

        <section className="p-6 rounded-3xl bg-surface-card border border-border-subtle shadow-lg space-y-5">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            {/* Location Indicator */}

            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-accent-amber/10 border border-accent-amber/20 flex items-center justify-center text-accent-amber flex-shrink-0">
                <Store className="w-6 h-6" />
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[11px] text-text-muted uppercase tracking-wider">
                    Ordering Destination
                  </span>

                  <span className="w-1 h-1 rounded-full bg-border-subtle" />

                  <span className="font-mono text-[10px] text-cream-beige bg-surface-secondary px-2 py-0.5 rounded border border-border-subtle">
                    {activeBranch?.name || 'Memuat cabang...'}
                  </span>
                </div>

                <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-text-primary tracking-tight mt-0.5">
                  Katalog Specialty &amp; Artisan Roast
                </h1>

                <div className="flex items-center gap-2 mt-1">
                  <Clock className="h-3.5 w-3.5 text-accent-amber" />

                  <span className="font-mono text-xs text-text-muted">
                    {activeBranch
                      ? `Hari kerja ${activeBranch.weekdayHours}`
                      : 'Memuat jam operasional…'}
                  </span>

                  {activeBranch && (
                    <span className="hidden text-xs text-text-muted sm:inline">
                      • {activeBranch.city}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Omnichannel Switch Pills */}

            <div className="flex flex-wrap items-center gap-1.5 p-1.5 rounded-2xl bg-surface-secondary border border-border-subtle">
              {fulfillmentModes.map((mode) => {
                const isSelected = fulfillmentType === mode.type;

                const ModeIcon = mode.icon;

                return (
                  <button
                    key={mode.type}

                    type="button"

                    onClick={() => setFulfillmentType(mode.type)}

                    className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-primary hover:bg-primary-hover text-white shadow-sm'
                        : 'text-text-muted hover:text-text-primary hover:bg-surface-card'
                    }`}
                  >
                    <ModeIcon className="w-4 h-4" />

                    <span>{mode.label}</span>

                    {mode.sub && isSelected && (
                      <span className="font-mono text-[10px] opacity-80">
                        ({mode.sub})
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        {/* 3. SEARCH & GLOBAL COMMAND BAR */}

        <div className="flex flex-col md:flex-row gap-3 items-stretch">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted w-5 h-5 pointer-events-none" />

            <input
              type="search"

              aria-label="Cari menu"

              value={searchQuery}

              onChange={(e) => setSearchQuery(e.target.value)}

              placeholder="Cari specialty coffee, cold brew aren, brioche toast, single origin..."

              className="w-full pl-12 pr-24 py-3.5 rounded-2xl bg-surface-card border border-border-subtle text-text-primary placeholder:text-text-muted font-body text-sm focus:outline-none focus:border-accent-amber shadow-sm transition-colors"
            />

            {searchQuery && (
              <button
                type="button"

                onClick={() => setSearchQuery('')}

                className="absolute right-12 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary p-1 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            )}

            <span className="absolute right-4 top-1/2 -translate-y-1/2 px-2 py-0.5 rounded bg-surface-secondary border border-border-subtle font-mono text-[10px] text-text-muted pointer-events-none">
              ⌘K
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/cart"

              className="relative flex items-center gap-2 px-5 py-3.5 rounded-2xl bg-surface-card hover:bg-surface-secondary border border-border-subtle text-xs font-semibold text-text-primary transition-all shadow-sm"
            >
              <ShoppingBag className="w-4 h-4 text-accent-amber" />

              <span>Keranjang</span>

              {totalCartCount > 0 && (
                <span className="font-mono text-[10px] font-bold bg-accent-amber text-black px-2 py-0.5 rounded-full">
                  {totalCartCount}
                </span>
              )}
            </Link>
          </div>
        </div>

        {/* 4. STICKY CATEGORY BAR WITH BADGE COUNTS */}

        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat.id;

            return (
              <button
                key={cat.id}

                type="button"

                onClick={() => setSelectedCategory(cat.id)}

                className={`px-4 py-2.5 rounded-xl font-heading text-xs font-semibold flex items-center gap-2 whitespace-nowrap transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-accent-amber text-black shadow-md font-bold'
                    : 'bg-surface-card border border-border-subtle text-text-muted hover:text-text-primary hover:border-border-strong'
                }`}
              >
                <span>{cat.label}</span>

                <span
                  className={`px-1.5 py-0.2 rounded-full font-mono text-[10px] ${
                    isSelected
                      ? 'bg-black/20 text-black font-bold'
                      : 'bg-surface-secondary text-text-muted'
                  }`}
                >
                  {cat.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* 5. QUICK FILTER TAG CHIPS */}

        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-mono text-[11px] text-text-muted uppercase tracking-wider mr-1">
            Quick Tags:
          </span>

          {QUICK_TAGS.map((tag) => {
            const isSelected = selectedTag === tag;

            return (
              <button
                key={tag}

                type="button"

                onClick={() => setSelectedTag(isSelected ? null : tag)}

                className={`px-3 py-1 rounded-full font-mono text-xs flex items-center gap-1.5 transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-accent-amber/20 border border-accent-amber text-accent-amber font-bold'
                    : 'bg-surface-card border border-border-subtle text-text-muted hover:text-text-primary'
                }`}
              >
                <span>{tag}</span>

                {tag === 'Bestseller' && (
                  <Flame className="w-3 h-3 text-accent-amber" />
                )}

                {tag === 'High Caffeine' && (
                  <Zap className="w-3 h-3 text-accent-amber" />
                )}
              </button>
            );
          })}

          {selectedTag && (
            <button
              type="button"

              onClick={() => setSelectedTag(null)}

              className="text-[11px] text-accent-amber hover:underline ml-1 cursor-pointer font-mono"
            >
              Reset Tag
            </button>
          )}
        </div>

        {/* 6. PRODUCT CATALOG GRID HEADER */}

        <div className="flex items-baseline justify-between pt-4 border-t border-border-subtle">
          <div className="flex items-baseline gap-2">
            <h2 className="font-heading font-bold text-xl text-text-primary">
              Curated Midnight Roasts &amp; Kitchen
            </h2>

            <span className="font-mono text-xs text-text-muted">
              ({filteredProducts.length} Items)
            </span>
          </div>

          <div className="hidden sm:flex items-center gap-1.5 font-mono text-xs text-cream-beige">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />

            <span>Fresh Extraction Guarantee</span>
          </div>
        </div>

        {/* 7. 4-COLUMN RESPONSIVE GRID */}

        {branches.isError || catalog.isError ? (
          <DataState
            title="Katalog belum dapat dimuat"
            retry={() => {
              void branches.refetch();
              void catalog.refetch();
            }}
          />
        ) : branches.isPending || (activeBranch && catalog.isPending) ? (
          <LoadingState label="Memuat menu cabang..." />
        ) : filteredProducts.length === 0 ? (
          <section className="rounded-3xl border border-border-subtle bg-surface-card p-12 text-center space-y-4">
            <Coffee className="w-12 h-12 text-text-muted mx-auto" />

            <h3 className="font-heading text-lg font-bold text-text-primary">
              Menu tidak ditemukan
            </h3>

            <p className="text-xs text-text-muted max-w-sm mx-auto">
              Tidak ada sajian yang sesuai dengan filter yang dipilih. Coba cari
              dengan kata kunci lain.
            </p>

            <button
              type="button"

              onClick={() => {
                setSearchQuery('');

                setSelectedCategory('all');

                setSelectedTag(null);
              }}

              className="px-5 py-2.5 rounded-xl bg-surface-secondary border border-border-subtle text-xs font-semibold text-text-primary hover:border-accent-amber transition-colors cursor-pointer"
            >
              Reset Semua Filter
            </button>
          </section>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredProducts.map((product, index) => {
              const isFav = favorites.has(product.id);

              const isSoldOut = product.tags.includes('Sold Out Today');

              return (
                <motion.article
                  key={product.id}

                  initial={{ opacity: 0, y: 15 }}

                  whileInView={{ opacity: 1, y: 0 }}

                  whileHover={{
                    y: -4,
                    transition: {
                      delay: 0,
                      duration: DURATION.fast,
                      ease: EASE.spring,
                    },
                  }}

                  viewport={{ once: true, amount: 0.15 }}

                  transition={{
                    delay: (index % 4) * STAGGER.normal.staggerChildren,
                    duration: DURATION.normal,
                    ease: EASE.outExpo,
                  }}

                  className={`delight-card group flex flex-col overflow-hidden rounded-3xl border border-border-subtle bg-surface-card shadow-md ${
                    isSoldOut ? 'opacity-60' : ''
                  }`}
                >
                  {/* Thumbnail Container */}

                  <div className="relative w-full h-52 bg-surface-secondary overflow-hidden">
                    <Image
                      src={product.image}

                      alt={product.name}

                      fill

                      className="object-cover transition-transform [transition-duration:var(--duration-smooth)] group-hover:scale-105"

                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"

                      priority={index < 4}
                    />

                    <div className="absolute inset-0 bg-gradient-to-t from-surface-card via-transparent to-transparent" />

                    {/* Top Badges */}

                    <div className="absolute top-3 left-3 flex items-center gap-1.5">
                      {product.isPopular && (
                        <span className="px-2.5 py-0.5 rounded-full bg-black/80 backdrop-blur-md font-mono text-[10px] text-accent-amber font-semibold flex items-center gap-1 border border-accent-amber/20">
                          <Flame className="w-3 h-3" />
                          Bestseller
                        </span>
                      )}

                      {product.isNew && (
                        <span className="px-2.5 py-0.5 rounded-full bg-emerald-950/80 backdrop-blur-md font-mono text-[10px] text-emerald-400 font-semibold border border-emerald-500/20">
                          New
                        </span>
                      )}

                      {isSoldOut && (
                        <span className="px-2.5 py-0.5 rounded-full bg-neutral-900/90 font-mono text-[10px] text-neutral-300 font-bold border border-neutral-700">
                          Sold Out
                        </span>
                      )}
                    </div>

                    {/* Favorite Heart Button */}

                    <button
                      type="button"

                      onClick={() => toggleFavorite(product.id)}

                      className={`absolute top-3 right-3 w-8 h-8 rounded-full bg-black/70 backdrop-blur-md flex items-center justify-center transition-transform hover:scale-110 cursor-pointer ${
                        isFav
                          ? 'text-rose-500'
                          : 'text-neutral-400 hover:text-white'
                      }`}

                      aria-label="Simpan ke favorit"
                    >
                      <Heart
                        className={`w-4 h-4 ${isFav ? 'fill-rose-500' : ''}`}
                      />
                    </button>

                    {/* Bottom Metadata Badges */}

                    <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs">
                      <span className="font-mono text-[11px] px-2 py-0.5 rounded bg-black/80 backdrop-blur-md text-text-muted flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {product.preparationTime} mins
                      </span>

                      <span className="font-mono text-[11px] px-2 py-0.5 rounded bg-black/80 backdrop-blur-md text-cream-beige">
                        {product.calories
                          ? `${product.calories} kcal`
                          : '195mg Caf'}
                      </span>
                    </div>
                  </div>

                  {/* Card Content */}

                  <div className="p-5 flex-1 flex flex-col justify-between gap-4">
                    <div>
                      <div className="flex items-start justify-between gap-1 mb-1">
                        <h3 className="font-heading font-bold text-base text-text-primary group-hover:text-accent-amber transition-colors line-clamp-1">
                          {product.name}
                        </h3>
                      </div>

                      <p className="text-xs text-text-muted line-clamp-2 leading-relaxed">
                        {product.description}
                      </p>

                      {(product.ingredients ?? []).length > 0 && (
                        <div className="mt-2.5 flex flex-wrap gap-1">
                          {(product.ingredients ?? [])
                            .slice(0, 2)
                            .map((ing) => (
                              <span
                                key={ing}

                                className="font-mono text-[10px] text-text-muted bg-surface-secondary px-2 py-0.5 rounded border border-border-subtle"
                              >
                                {ing}
                              </span>
                            ))}
                        </div>
                      )}
                    </div>

                    {/* Price & Customize CTA */}

                    <div className="flex items-center justify-between pt-3 border-t border-border-subtle">
                      <div>
                        <span className="font-mono text-[10px] uppercase text-text-muted block">
                          Base Price
                        </span>

                        <span className="font-mono font-extrabold text-base text-accent-amber">
                          Rp {product.price.toLocaleString('id-ID')}
                        </span>
                      </div>

                      {isSoldOut ? (
                        <button
                          type="button"

                          disabled

                          className="px-3.5 py-2 rounded-xl bg-surface-secondary text-text-muted font-heading text-xs font-semibold cursor-not-allowed border border-border-subtle"
                        >
                          Restocking
                        </button>
                      ) : (
                        <button
                          type="button"

                          onClick={() => setCustomizingProduct(product)}

                          className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-primary-container via-secondary-container to-accent-amber text-canvas-obsidian font-heading text-xs font-bold shadow-md hover:brightness-110 active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer"
                        >
                          <span>Customize</span>

                          <SlidersHorizontal className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                </motion.article>
              );
            })}
          </div>
        )}
      </div>

      {/* 8. FLOATING OMNICHANNEL BOTTOM BAR SUMMARY */}

      {totalCartCount > 0 && (
        <div className="fixed bottom-6 right-6 z-40 animate-in fade-in slide-in-from-bottom-5">
          <div className="flex items-center gap-4 p-2 pl-4 rounded-2xl bg-surface-card/95 border border-border-subtle backdrop-blur-xl shadow-2xl">
            <div className="flex items-center gap-3">
              <div className="relative w-10 h-10 rounded-xl bg-accent-amber/10 border border-accent-amber/20 flex items-center justify-center text-accent-amber">
                <Coffee className="w-5 h-5" />

                <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-accent-amber text-black font-mono text-[10px] font-extrabold flex items-center justify-center shadow-md">
                  {totalCartCount}
                </span>
              </div>

              <div className="hidden sm:block">
                <span className="font-mono text-[10px] text-text-muted block">
                  {tableLabel || 'Pindai QR meja'} • {totalCartCount} Items
                </span>

                <span className="font-mono font-bold text-sm text-accent-amber">
                  Rp {cartTotal.toLocaleString('id-ID')}
                </span>
              </div>
            </div>

            <button
              type="button"

              onClick={() => setCartOpen(true)}

              className="px-4 py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-white font-heading text-xs font-bold transition-all flex items-center gap-1.5 shadow-md cursor-pointer whitespace-nowrap"
            >
              <span>Review Order</span>

              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* 9. ARTISAN CUSTOMIZER MODAL */}

      <ProductCustomizerModal
        product={customizingProduct}

        isOpen={Boolean(customizingProduct)}

        onClose={() => setCustomizingProduct(null)}
      />
    </main>
  );
}
