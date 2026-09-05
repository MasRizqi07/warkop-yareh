"use client";

import React, { useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Search,
  SlidersHorizontal,
  Sparkles,
  ShoppingBag,
  Heart,
  Star,
  Clock,
  Coffee,
} from "lucide-react";
import { MOCK_PRODUCTS, MockProduct } from "@/lib/mockData";
import { useAppStore } from "@/store/useAppStore";
import { ProductCustomizerModal } from "@/components/menu/ProductCustomizerModal";

const CATEGORIES = [
  { id: "all", label: "Semua Menu" },
  { id: "coffee", label: "Kopi Specialty" },
  { id: "non-coffee", label: "Non-Coffee & Matcha" },
  { id: "pastry", label: "Artisan Pastry" },
  { id: "food", label: "Makanan & Snack" },
];

export default function MenuPage() {
  const { getActiveBranch, user, updateProfile } = useAppStore();
  const activeBranch = getActiveBranch();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [customizingProduct, setCustomizingProduct] = useState<MockProduct | null>(null);

  // Available tags
  const allTags = ["Signature", "Bestseller", "Cold Brew", "Single Origin", "Plant-Based", "Spicy", "Artisan"];

  // Filtered products
  const filteredProducts = useMemo(() => {
    return MOCK_PRODUCTS.filter((prod) => {
      const matchSearch =
        prod.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        prod.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        prod.ingredients.some((ing) => ing.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchCategory =
        selectedCategory === "all" || prod.category === selectedCategory;

      const matchTag =
        !selectedTag || prod.tags.some((t) => t.toLowerCase() === selectedTag.toLowerCase());

      return matchSearch && matchCategory && matchTag;
    });
  }, [searchQuery, selectedCategory, selectedTag]);

  const toggleFavorite = (prodId: string) => {
    const favs = user.favoriteOrderIds || [];
    const isFav = favs.includes(prodId);
    const updated = isFav ? favs.filter((id) => id !== prodId) : [...favs, prodId];
    updateProfile({ favoriteOrderIds: updated });
  };

  return (
    <div className="min-h-screen bg-[#0a0a0c] text-white pt-8 sm:pt-10 pb-32 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-white/5 pb-6">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-[#f59e0b] uppercase tracking-wider mb-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Menu Resmi • {activeBranch.name}</span>
            </div>
            <h1 className="font-heading font-extrabold text-3xl sm:text-4xl text-white tracking-tight">
              Katalog Specialty & Artisan
            </h1>
            <p className="text-sm text-neutral-400 mt-1 max-w-xl">
              Dipanggang mikro, diracik presisi oleh barista bersertifikasi. Nikmati pengalaman rasa autentik kopi Jawa Timur.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/cart"
              className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-[#18181c] border border-white/10 hover:border-white/20 text-xs font-semibold text-neutral-300 transition-colors"
            >
              <ShoppingBag className="w-4 h-4 text-[#f59e0b]" />
              <span>Lihat Keranjang</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Search Bar & Dietary Filter Pills */}
      <div className="space-y-4 mb-8">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-neutral-500">
              <Search className="w-4 h-4" />
            </div>
            <input
              aria-label="Cari menu"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari kopi, cold brew, aren brulee, v60, makanan..."
              className="w-full pl-11 pr-4 py-3 rounded-2xl bg-[#141418] border border-white/10 text-white placeholder-neutral-500 text-sm focus:outline-none focus:border-[#f59e0b]"
            />
          </div>

          {/* Tag Filter Strip */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            {allTags.map((tag) => {
              const active = selectedTag?.toLowerCase() === tag.toLowerCase();
              return (
                <button
                  key={tag}
                  onClick={() => setSelectedTag(active ? null : tag)}
                  className={`px-3 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
                    active
                      ? "bg-[#f59e0b] text-black font-bold shadow-md"
                      : "bg-[#18181c] border border-white/10 text-neutral-400 hover:text-white"
                  }`}
                >
                  #{tag}
                </button>
              );
            })}
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-white/5 scrollbar-none">
          {CATEGORIES.map((cat) => {
            const active = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  active
                    ? "bg-[#9c6b3a] text-white shadow-[0_4px_12px_rgba(156,107,58,0.4)]"
                    : "bg-[#111114] text-neutral-400 hover:text-white hover:bg-white/5"
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Products Grid */}
      {filteredProducts.length === 0 ? (
        <div className="text-center py-20 p-6 rounded-3xl bg-[#111114] border border-white/5">
          <Coffee className="w-12 h-12 text-neutral-600 mx-auto mb-3" />
          <h3 className="font-heading text-lg font-bold text-white mb-1">
            Menu tidak ditemukan
          </h3>
          <p className="text-xs text-neutral-400 max-w-sm mx-auto mb-4">
            Coba gunakan kata kunci pencarian lain atau hilangkan filter tag yang sedang aktif.
          </p>
          <button
            onClick={() => {
              setSearchQuery("");
              setSelectedCategory("all");
              setSelectedTag(null);
            }}
            className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-xs text-white font-medium"
          >
            Reset Filter
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map((product, index) => {
            const isFav = user.favoriteOrderIds?.includes(product.id);

            return (
              <motion.div
                key={product.id}
                layout
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                className="group relative rounded-3xl bg-[#18181c] border border-white/10 hover:border-[#f59e0b]/40 overflow-hidden flex flex-col transition-all duration-300 hover:shadow-[0_8px_30px_rgba(0,0,0,0.6)] hover:-translate-y-1"
              >
                {/* Product Image */}
                <div className="relative h-48 w-full overflow-hidden bg-[#111114]">
                  <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    loading={index < 4 ? "eager" : "lazy"}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#18181c] via-black/30 to-transparent" />

                  {/* Badges */}
                  <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                    {product.isPopular && (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#f59e0b] text-black shadow-md flex items-center gap-1">
                        <Sparkles className="w-3 h-3" /> BESTSELLER
                      </span>
                    )}
                    {product.isNew && (
                      <span className="rounded-full bg-emerald-700 px-2.5 py-0.5 font-mono text-[10px] font-bold text-white shadow-md">
                        BARU
                      </span>
                    )}
                  </div>

                  {/* Favorite Heart Button */}
                  <button
                    onClick={() => toggleFavorite(product.id)}
                    className="absolute top-3 right-3 p-2 rounded-full bg-black/50 hover:bg-black/80 backdrop-blur-md text-white transition-colors"
                    aria-label="Favorit"
                  >
                    <Heart
                      className={`w-4 h-4 ${
                        isFav ? "fill-rose-500 text-rose-500" : "text-white"
                      }`}
                    />
                  </button>

                  {/* Prep time & rating bottom overlay */}
                  <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-[11px] font-mono text-neutral-300">
                    <span className="flex items-center gap-1 bg-black/60 px-2 py-0.5 rounded-md backdrop-blur-sm">
                      <Star className="w-3.5 h-3.5 text-[#f59e0b] fill-[#f59e0b]" />
                      <span>{product.rating}</span>
                      <span className="text-neutral-400">({product.reviewCount})</span>
                    </span>
                    <span className="flex items-center gap-1 bg-black/60 px-2 py-0.5 rounded-md backdrop-blur-sm">
                      <Clock className="w-3 h-3 text-neutral-400" />
                      <span>{product.preparationTime} mnt</span>
                    </span>
                  </div>
                </div>

                {/* Card Details */}
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-heading font-bold text-base text-white group-hover:text-[#fcd34d] transition-colors line-clamp-1">
                      {product.name}
                    </h3>
                    <p className="text-xs text-neutral-400 mt-1 line-clamp-2 leading-relaxed">
                      {product.description}
                    </p>

                    {/* Ingredients summary */}
                    <div className="flex flex-wrap gap-1 mt-3">
                      {product.ingredients.slice(0, 2).map((ing, i) => (
                        <span
                          key={i}
                          className="px-2 py-0.5 rounded-md bg-white/5 text-[10px] text-neutral-400 font-mono"
                        >
                          {ing}
                        </span>
                      ))}
                      {product.ingredients.length > 2 && (
                        <span className="text-[10px] text-neutral-500 self-center font-mono">
                          +{product.ingredients.length - 2} lagi
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Price & Action Button */}
                  <div className="pt-4 mt-4 border-t border-white/5 flex items-center justify-between">
                    <div>
                      <div className="text-[10px] text-neutral-500 uppercase font-mono">Harga</div>
                      <div className="font-mono font-bold text-base text-[#f59e0b]">
                        Rp {product.price.toLocaleString("id-ID")}
                      </div>
                    </div>

                    <button
                      onClick={() => setCustomizingProduct(product)}
                      className="px-3.5 py-2 rounded-xl bg-[#9c6b3a] hover:bg-[#b07b44] text-white text-xs font-semibold flex items-center gap-1.5 shadow-[0_4px_12px_rgba(156,107,58,0.3)] transition-all active:scale-95"
                    >
                      <span>Custom</span>
                      <SlidersHorizontal className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Product Customizer Slide-over / Modal */}
      <ProductCustomizerModal
        product={customizingProduct}
        isOpen={Boolean(customizingProduct)}
        onClose={() => setCustomizingProduct(null)}
      />
    </div>
  );
}
