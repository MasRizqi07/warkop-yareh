"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, ShoppingBag, Star, Sparkles, Flame, Coffee } from "lucide-react";
import { products } from "@/data/mock";
import { useCartStore } from "@/stores";
import {
  fadeInUp,
  staggerContainer,
  staggerItem,
  SPRING,
  VIEWPORT,
} from "@/lib/animations";

const CATEGORIES = [
  { id: "all", name: "Semua" },
  { id: "coffee", name: "Coffee" },
  { id: "non-coffee", name: "Non-Coffee" },
  { id: "food", name: "Food" },
  { id: "snacks", name: "Snacks" },
];

function ProductImage({ src, alt }: { src: string; alt: string }) {
  const [status, setStatus] = useState<"loading" | "loaded" | "error">("loading");

  return (
    <>
      {/* Skeleton shimmer while loading */}
      {status === "loading" && (
        <div className="absolute inset-0 skeleton" aria-hidden="true" />
      )}
      {/* Branded fallback on error */}
      {status === "error" && (
        <div
          className="absolute inset-0 flex flex-col items-center justify-center bg-[var(--bg-surface-raised)] border border-[var(--border-default)]"
          aria-label={`Image unavailable for ${alt}`}
        >
          <Coffee size={32} className="text-[var(--accent-fill)] mb-2" />
          <span className="text-xs text-[var(--accent-fill)] font-medium">
            Warkop Ya&apos;reh
          </span>
        </div>
      )}
      {status !== "error" && (
        <Image
          alt={alt}
          src={src}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          className="object-cover group-hover:scale-105 transition-transform duration-500"
          onLoad={() => setStatus("loaded")}
          onError={() => setStatus("error")}
        />
      )}
    </>
  );
}

export function FeaturedProducts() {
  const [activeCategory, setActiveCategory] = useState("all");
  const addItem = useCartStore((s) => s.addItem);

  const filtered =
    activeCategory === "all"
      ? products.slice(0, 8)
      : products.filter((p) => p.category === activeCategory).slice(0, 8);

  return (
    <section className="py-[var(--section-md)] relative" id="featured-products">
      <div className="max-w-[var(--container-xl)] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          variants={fadeInUp}
          initial="hidden"
          whileInView="visible"
          viewport={VIEWPORT.once}
          className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-10"
        >
          <div>
            <span className="label-caps text-[var(--text-brand)] mb-2 block">
              Our Menu
            </span>
            <h2 className="text-[var(--text-h2)] font-[var(--weight-bold)] tracking-[var(--tracking-heading)] text-[var(--text-primary)]">
              Specialty Picks
            </h2>
            <p className="text-sm text-[var(--text-secondary)] mt-2 max-w-md">
              Menu pilihan terbaik dari barista kami, dari single origin hingga signature drinks.
            </p>
          </div>
          <Link
            href="/menu"
            className="text-sm font-medium text-[var(--text-brand)] flex items-center gap-1 group shrink-0"
          >
            Lihat Semua
            <ArrowRight
              size={16}
              className="group-hover:translate-x-1 transition-transform"
            />
          </Link>
        </motion.div>

        {/* Category Tabs */}
        <motion.div
          variants={fadeInUp}
          initial="hidden"
          whileInView="visible"
          viewport={VIEWPORT.once}
          className="flex gap-2 mb-8 overflow-x-auto no-scrollbar pb-2"
        >
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className="relative px-5 py-2.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors duration-200"
              style={{
                color:
                  activeCategory === cat.id
                    ? "var(--text-inverse)"
                    : "var(--text-secondary)",
              }}
            >
              {activeCategory === cat.id && (
                <motion.div
                  layoutId="category-pill"
                  className="absolute inset-0 rounded-full bg-[var(--color-primary-500)]"
                  transition={SPRING.snappy}
                />
              )}
              <span className="relative z-10">{cat.name}</span>
            </button>
          ))}
        </motion.div>

        {/* Product Grid */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeCategory}
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5"
          >
            {filtered.map((product) => (
              <motion.div
                key={product.id}
                variants={staggerItem}
                className="group flex flex-col bg-[var(--surface-raised)] rounded-[var(--radius-2xl)] overflow-hidden border border-[var(--border-default)] hover:border-[var(--color-primary-500)]/20 transition-all duration-300 card-hover"
              >
                {/* Image — fixed aspect-ratio, badges absolutely positioned inside */}
                <div className="relative w-full overflow-hidden" style={{ aspectRatio: "4 / 3" }}>
                  <ProductImage src={product.image} alt={product.name} />
                  {/* Gradient overlay on hover */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-[1]" />

                  {/* Badges */}
                  {product.isPopular && (
                    <div className="absolute top-3 left-3 z-[2] px-3 py-1 rounded-full bg-[var(--color-primary-500)] text-white text-[10px] font-semibold flex items-center gap-1 shadow-md">
                      <Flame size={10} />
                      Popular
                    </div>
                  )}
                  {product.isNew && !product.isPopular && (
                    <div className="absolute top-3 left-3 z-[2] px-3 py-1 rounded-full bg-[var(--color-accent-500)] text-[var(--color-neutral-900)] text-[10px] font-semibold flex items-center gap-1 shadow-md">
                      <Sparkles size={10} />
                      New
                    </div>
                  )}

                  {/* Add to cart — slides up on hover */}
                  <motion.button
                    initial={{ y: 16, opacity: 0 }}
                    whileHover={{ scale: 1.05 }}
                    className="absolute bottom-3 right-3 z-[2] w-10 h-10 rounded-full bg-white text-[var(--color-primary-500)] flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 group-hover:translate-y-0 translate-y-4 transition-all duration-300"
                    onClick={(e) => {
                      e.stopPropagation();
                      addItem(product);
                    }}
                    aria-label={`Add ${product.name} to cart`}
                  >
                    <ShoppingBag size={18} />
                  </motion.button>
                </div>

                {/* Content — separate flex column below image, never overlaps */}
                <div className="p-4 space-y-2 flex-1 flex flex-col">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-sm font-semibold text-[var(--text-primary)] leading-tight line-clamp-1">
                      {product.name}
                    </h3>
                    <span className="text-sm font-bold text-[var(--text-brand)] whitespace-nowrap">
                      {new Intl.NumberFormat("id-ID", {
                        style: "currency",
                        currency: "IDR",
                        minimumFractionDigits: 0,
                      }).format(product.price)}
                    </span>
                  </div>
                  <p className="text-xs text-[var(--text-tertiary)] line-clamp-2 leading-relaxed flex-1">
                    {product.description}
                  </p>
                  <div className="flex items-center gap-2 pt-1">
                    <div className="flex items-center gap-1">
                      <Star
                        size={12}
                        className="text-[var(--color-accent-500)] fill-[var(--color-accent-500)]"
                      />
                      <span className="text-xs font-medium text-[var(--text-secondary)]">
                        {product.rating}
                      </span>
                    </div>
                    <span className="text-[var(--border-default)]">·</span>
                    <span className="text-xs text-[var(--text-tertiary)]">
                      {product.reviewCount} reviews
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}
