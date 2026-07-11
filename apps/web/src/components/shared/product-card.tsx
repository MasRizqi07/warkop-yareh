"use client";

import React from "react";
import { motion } from "framer-motion";
import { Star, Clock, Plus, Heart } from "lucide-react";
import { cn, formatCurrency } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { useCartStore } from "@/stores";
import type { Product } from "@warkop-yareh/types";

interface ProductCardProps {
  product: Product;
  index?: number;
}

export function ProductCard({ product, index = 0 }: ProductCardProps) {
  const addItem = useCartStore((s) => s.addItem);
  const [isLiked, setIsLiked] = React.useState(false);

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{
        duration: 0.5,
        delay: index * 0.05,
        ease: [0.22, 1, 0.36, 1],
      }}
      className="group relative bg-[var(--surface-elevated)] rounded-2xl border border-[var(--border-subtle)] overflow-hidden card-hover"
    >
      {/* Image */}
      <div className="relative aspect-[4/3] overflow-hidden bg-[var(--surface-tertiary)]">
        {/* Placeholder gradient since we don't have real images */}
        <div
          className={cn(
            "absolute inset-0 bg-gradient-to-br",
            product.category === "coffee"
              ? "from-primary-800 to-primary-950"
              : product.category === "food"
                ? "from-amber-700 to-orange-900"
                : product.category === "tea"
                  ? "from-emerald-700 to-emerald-900"
                  : product.category === "desserts"
                    ? "from-pink-700 to-rose-900"
                    : "from-neutral-700 to-neutral-900",
          )}
        >
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-5xl opacity-60">
              {product.category === "coffee"
                ? "☕"
                : product.category === "food"
                  ? "🍽️"
                  : product.category === "tea"
                    ? "🍵"
                    : product.category === "desserts"
                      ? "🍰"
                      : "🍪"}
            </span>
          </div>
        </div>

        {/* Badges */}
        <div className="absolute top-3 left-3 flex gap-1.5">
          {product.isPopular && (
            <Badge variant="gold" size="sm">
              Popular
            </Badge>
          )}
          {product.isNew && (
            <Badge variant="success" size="sm">
              New
            </Badge>
          )}
        </div>

        {/* Like button */}
        <button
          onClick={() => setIsLiked(!isLiked)}
          className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/80 dark:bg-black/50 backdrop-blur-sm flex items-center justify-center transition-all hover:scale-110"
          aria-label={isLiked ? "Remove from favorites" : "Add to favorites"}
        >
          <Heart
            className={cn(
              "w-4 h-4 transition-colors",
              isLiked ? "text-error-500 fill-error-500" : "text-neutral-600",
            )}
          />
        </button>

        {/* Quick Add */}
        <motion.button
          initial={{ opacity: 0, y: 10 }}
          whileHover={{ scale: 1.05 }}
          className="absolute bottom-3 right-3 w-10 h-10 rounded-xl bg-primary-500 text-white flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200"
          onClick={() => addItem(product)}
          aria-label={`Add ${product.name} to cart`}
        >
          <Plus className="w-5 h-5" />
        </motion.button>
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="flex items-center gap-2 mb-1.5">
          <div className="flex items-center gap-0.5">
            <Star className="w-3.5 h-3.5 text-accent-500 fill-accent-500" />
            <span className="text-xs font-semibold text-[var(--text-primary)]">
              {product.rating}
            </span>
          </div>
          <span className="text-xs text-[var(--text-tertiary)]">
            ({product.reviewCount})
          </span>
          <span className="text-[var(--text-tertiary)]">·</span>
          <span className="flex items-center gap-1 text-xs text-[var(--text-tertiary)]">
            <Clock className="w-3 h-3" />
            {product.preparationTime} min
          </span>
        </div>

        <h3 className="font-semibold text-sm text-[var(--text-primary)] mb-1 line-clamp-1 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
          {product.name}
        </h3>

        <p className="text-xs text-[var(--text-tertiary)] mb-3 line-clamp-2 leading-relaxed">
          {product.description}
        </p>

        <div className="flex items-center justify-between">
          <span
            className="text-base font-bold text-[var(--text-brand)]"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            {formatCurrency(product.price)}
          </span>
          <button
            onClick={() => addItem(product)}
            className="text-xs font-semibold text-primary-500 hover:text-primary-600 transition-colors"
            aria-label={`Add ${product.name} to cart`}
          >
            + Add
          </button>
        </div>
      </div>
    </motion.article>
  );
}
