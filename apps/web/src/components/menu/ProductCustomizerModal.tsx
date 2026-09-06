"use client";

import React, { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import {
  Coffee,
  Minus,
  Plus,
  SlidersHorizontal,
  X,
  Heart,
  Flame,
  Snowflake,
  Check,
  Sparkles,
} from "lucide-react";
import type { Product, ProductCustomization } from "@warkop-yareh/types";
import { useCartStore } from "@/stores";

interface ProductCustomizerModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
}

function ProductCustomizerModalContent({
  product,
  onClose,
}: {
  product: Product;
  onClose: () => void;
}) {
  const addItem = useCartStore((state) => state.addItem);
  const setCartOpen = useCartStore((state) => state.setCartOpen);

  const isColdBrew =
    product.name.toLowerCase().includes("cold brew") ||
    product.name.toLowerCase().includes("iced");

  // Customization Options initialized cleanly
  const [temperature, setTemperature] = useState<"hot" | "iced">(
    isColdBrew ? "iced" : "hot"
  );
  const [size, setSize] = useState<"regular" | "large">("large");
  const [sweetness, setSweetness] = useState<string>("Less (70%)");
  const [iceDensity, setIceDensity] = useState<string>(
    isColdBrew ? "Less Ice" : "Normal Ice"
  );
  const [milkBase, setMilkBase] = useState<string>("oat");
  const [extraBoost, setExtraBoost] = useState<string>("standard");
  const [notes, setNotes] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [isFavorite, setIsFavorite] = useState(false);

  // Dynamic backend-defined customizations (if present)
  const [backendSelections, setBackendSelections] = useState<Record<string, string>>(() => {
    if (!product.customizations || product.customizations.length === 0) return {};
    return Object.fromEntries(
      product.customizations.flatMap((def: ProductCustomization) => {
        const first = def.options[0];
        return first ? [[def.name, first.label]] : [];
      })
    );
  });

  const isBeverage = useMemo(() => {
    const cat = product.category.toLowerCase();
    return (
      cat.includes("coffee") ||
      cat.includes("tea") ||
      cat.includes("beverage") ||
      cat.includes("drink")
    );
  }, [product]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  // Price calculations
  const sizePrice = size === "large" ? 6000 : 0;
  const milkPrice = milkBase === "oat" ? 8000 : milkBase === "almond" ? 8000 : 0;
  const boostPrice = extraBoost === "ristretto" ? 5000 : extraBoost === "decaf" ? 3000 : 0;

  const backendPrice = useMemo(() => {
    if (!product || !product.customizations) return 0;
    return product.customizations.reduce((total: number, def: ProductCustomization) => {
      const selectedLabel = backendSelections[def.name];
      const opt = def.options.find((o) => o.label === selectedLabel);
      return total + (opt?.price ?? 0);
    }, 0);
  }, [product, backendSelections]);

  if (!product) return null;

  const basePrice = product.price;
  const additionalPrice = isBeverage
    ? sizePrice + milkPrice + boostPrice + backendPrice
    : backendPrice;
  const unitPrice = basePrice + additionalPrice;
  const totalPrice = unitPrice * quantity;
  const earnedPoints = Math.round(totalPrice / 1000);

  const handleAddToCart = () => {
    const finalCustomizations: Record<string, string> = {};

    if (isBeverage) {
      finalCustomizations["Temperature"] = temperature === "hot" ? "Hot Serving" : "Signature Iced";
      finalCustomizations["Size"] = size === "large" ? "Large Cup (16oz)" : "Regular (12oz)";
      finalCustomizations["Sweetness"] = sweetness;
      if (temperature === "iced") {
        finalCustomizations["Ice Density"] = iceDensity;
      }
      finalCustomizations["Milk"] =
        milkBase === "oat"
          ? "Oatly® Barista Oat Milk"
          : milkBase === "almond"
          ? "Roasted Almond Milk"
          : "Fresh Whole Milk";
      if (extraBoost !== "standard") {
        finalCustomizations["Extra"] = extraBoost === "ristretto" ? "+Extra Ristretto" : "Decaf";
      }
    }

    // Merge any backend definitions
    Object.assign(finalCustomizations, backendSelections);

    addItem(
      product,
      quantity,
      Object.keys(finalCustomizations).length ? finalCustomizations : undefined,
      notes.trim() || undefined,
      unitPrice
    );

    onClose();
    setCartOpen(true);
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center overflow-y-auto p-3 sm:p-6">
          {/* Backdrop */}
          <motion.button
            type="button"
            aria-label="Tutup modal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 cursor-default bg-black/80 backdrop-blur-md"
          />

          {/* Dialog Container */}
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="customizer-modal-title"
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative z-10 flex max-h-[92vh] w-full max-w-2xl flex-col overflow-hidden rounded-3xl border border-border-subtle bg-surface-card shadow-2xl transition-colors"
          >
            {/* 1. MODAL HEADER BAR */}
            <div className="relative p-5 sm:p-6 bg-surface-secondary border-b border-border-subtle flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="relative w-20 h-20 rounded-2xl overflow-hidden bg-surface-card flex-shrink-0 shadow-md border border-border-subtle">
                  <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    className="object-cover"
                    sizes="80px"
                  />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    {product.isPopular && (
                      <span className="px-2 py-0.5 rounded-md bg-accent-amber/15 text-accent-amber font-mono text-[10px] font-bold uppercase border border-accent-amber/30 flex items-center gap-1">
                        <Sparkles className="w-3 h-3" />
                        Bestseller
                      </span>
                    )}
                    <span className="font-mono text-[10px] text-text-muted">
                      Darmo Recipe #{product.id.slice(-2)}
                    </span>
                  </div>
                  <h3
                    id="customizer-modal-title"
                    className="font-heading text-xl sm:text-2xl font-bold text-text-primary tracking-tight mt-1"
                  >
                    {product.name}
                  </h3>
                  <div className="flex flex-wrap items-center gap-2 mt-1 text-xs">
                    <span className="font-mono font-bold text-accent-amber">
                      Base: Rp {product.price.toLocaleString("id-ID")}
                    </span>
                    <span className="text-border-subtle">•</span>
                    <span className="font-mono text-text-muted">
                      {product.preparationTime} mins prep
                    </span>
                    <span className="text-border-subtle">•</span>
                    <span className="font-mono text-cream-beige">
                      {product.calories ? `${product.calories} kcal` : "195mg Caffeine"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Icons */}
              <div className="flex items-center gap-2 self-end sm:self-start">
                <button
                  type="button"
                  onClick={() => setIsFavorite(!isFavorite)}
                  className={`w-9 h-9 rounded-full bg-surface-card border border-border-subtle flex items-center justify-center transition-all cursor-pointer ${
                    isFavorite ? "text-rose-500 scale-105" : "text-text-muted hover:text-accent-amber"
                  }`}
                  aria-label="Simpan ke favorit"
                >
                  <Heart className={`w-4 h-4 ${isFavorite ? "fill-rose-500" : ""}`} />
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="w-9 h-9 rounded-full bg-surface-card border border-border-subtle text-text-muted hover:text-text-primary flex items-center justify-center transition-colors cursor-pointer"
                  aria-label="Tutup"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* 2. MODAL BODY (Scrollable customization options) */}
            <div className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1 text-text-primary">
              {/* Product description */}
              <p className="text-xs leading-relaxed text-text-muted">{product.description}</p>

              {isBeverage ? (
                <>
                  {/* SECTION 1: TEMPERATURE & SERVING SIZE */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="font-heading text-xs font-bold uppercase tracking-wider text-text-primary">
                        1. Temperature &amp; Serving Size
                      </h4>
                      <span className="font-mono text-[10px] text-accent-amber bg-accent-amber/10 px-2 py-0.5 rounded border border-accent-amber/20">
                        Required
                      </span>
                    </div>

                    {/* Temperature switch */}
                    <div className="grid grid-cols-2 gap-2.5">
                      <button
                        type="button"
                        onClick={() => setTemperature("hot")}
                        className={`flex items-center justify-center gap-2 py-2.5 rounded-xl border font-heading text-xs transition-all cursor-pointer ${
                          temperature === "hot"
                            ? "bg-surface-secondary border-accent-amber text-text-primary font-bold shadow-sm"
                            : "bg-surface-secondary/50 border-border-subtle text-text-muted hover:text-text-primary"
                        }`}
                      >
                        <Flame className="w-4 h-4 text-orange-500" />
                        <span>Hot Serving</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setTemperature("iced")}
                        className={`flex items-center justify-center gap-2 py-2.5 rounded-xl border font-heading text-xs transition-all cursor-pointer ${
                          temperature === "iced"
                            ? "bg-surface-secondary border-accent-amber text-accent-amber font-bold shadow-sm"
                            : "bg-surface-secondary/50 border-border-subtle text-text-muted hover:text-text-primary"
                        }`}
                      >
                        <Snowflake className="w-4 h-4 text-sky-400" />
                        <span>Signature Iced ❄️</span>
                      </button>
                    </div>

                    {/* Cup size */}
                    <div className="grid grid-cols-2 gap-2.5 pt-1">
                      <div
                        onClick={() => setSize("regular")}
                        className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                          size === "regular"
                            ? "bg-surface-secondary border-accent-amber shadow-sm"
                            : "bg-surface-secondary/50 border-border-subtle hover:border-border-strong"
                        }`}
                      >
                        <div>
                          <span className="font-heading text-xs text-text-primary block font-medium">
                            Regular (12oz)
                          </span>
                          <span className="font-mono text-[11px] text-text-muted">+Rp 0</span>
                        </div>
                        <div
                          className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                            size === "regular"
                              ? "border-accent-amber bg-accent-amber"
                              : "border-border-subtle bg-surface-card"
                          }`}
                        >
                          {size === "regular" && <Check className="w-2.5 h-2.5 text-black stroke-[3]" />}
                        </div>
                      </div>

                      <div
                        onClick={() => setSize("large")}
                        className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                          size === "large"
                            ? "bg-surface-secondary border-accent-amber shadow-sm"
                            : "bg-surface-secondary/50 border-border-subtle hover:border-border-strong"
                        }`}
                      >
                        <div>
                          <span className="font-heading text-xs text-text-primary block font-bold">
                            Large Cup (16oz)
                          </span>
                          <span className="font-mono text-[11px] text-accent-amber font-bold">
                            +Rp 6.000
                          </span>
                        </div>
                        <div
                          className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                            size === "large"
                              ? "border-accent-amber bg-accent-amber"
                              : "border-border-subtle bg-surface-card"
                          }`}
                        >
                          {size === "large" && <Check className="w-2.5 h-2.5 text-black stroke-[3]" />}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* SECTION 2: SWEETNESS LEVEL */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="font-heading text-xs font-bold uppercase tracking-wider text-text-primary">
                        2. Aren Palm Sweetness
                      </h4>
                      <span className="font-mono text-[10px] text-text-muted">Wild Organic Palm Syrup</span>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {["Regular (100%)", "Less (70%)", "Mild (50%)", "Unsweet (0%)"].map((lvl) => {
                        const isSelected = sweetness === lvl;
                        return (
                          <button
                            key={lvl}
                            type="button"
                            onClick={() => setSweetness(lvl)}
                            className={`py-2 px-3 rounded-xl border font-mono text-xs text-center transition-all cursor-pointer ${
                              isSelected
                                ? "bg-surface-secondary border-accent-amber text-accent-amber font-bold shadow-sm"
                                : "bg-surface-secondary/40 border-border-subtle text-text-muted hover:text-text-primary"
                            }`}
                          >
                            {lvl}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* SECTION 3: ICE VOLUME (Only if Iced) */}
                  {temperature === "iced" && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="font-heading text-xs font-bold uppercase tracking-wider text-text-primary">
                          3. Artisanal Ice Cube Density
                        </h4>
                        <span className="font-mono text-[10px] text-text-muted">Slow-melt clear cubes</span>
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        {["Normal Ice", "Less Ice", "No Ice (Chilled)"].map((ice) => {
                          const isSelected = iceDensity === ice;
                          return (
                            <button
                              key={ice}
                              type="button"
                              onClick={() => setIceDensity(ice)}
                              className={`py-2 px-3 rounded-xl border font-mono text-xs text-center transition-all cursor-pointer ${
                                isSelected
                                  ? "bg-surface-secondary border-accent-amber text-accent-amber font-bold shadow-sm"
                                  : "bg-surface-secondary/40 border-border-subtle text-text-muted hover:text-text-primary"
                              }`}
                            >
                              {ice}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* SECTION 4: ARTISANAL MILK BASE */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="font-heading text-xs font-bold uppercase tracking-wider text-text-primary">
                        4. Artisanal Milk Base
                      </h4>
                      <span className="font-mono text-[10px] text-text-muted">Select 1 option</span>
                    </div>
                    <div className="space-y-2">
                      <label
                        onClick={() => setMilkBase("whole")}
                        className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${
                          milkBase === "whole"
                            ? "bg-surface-secondary border-accent-amber shadow-sm"
                            : "bg-surface-secondary/40 border-border-subtle hover:border-border-strong"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                              milkBase === "whole"
                                ? "border-accent-amber bg-accent-amber"
                                : "border-border-subtle bg-surface-card"
                            }`}
                          >
                            {milkBase === "whole" && <span className="w-1.5 h-1.5 rounded-full bg-black" />}
                          </div>
                          <div>
                            <span className="font-heading text-xs font-medium text-text-primary block">
                              Fresh Grass-fed Whole Milk
                            </span>
                            <span className="text-[11px] text-text-muted">
                              Creamy classic body from Batu dairy farms
                            </span>
                          </div>
                        </div>
                        <span className="font-mono text-xs text-text-muted">+Rp 0</span>
                      </label>

                      <label
                        onClick={() => setMilkBase("oat")}
                        className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${
                          milkBase === "oat"
                            ? "bg-surface-secondary border-accent-amber shadow-sm"
                            : "bg-surface-secondary/40 border-border-subtle hover:border-border-strong"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                              milkBase === "oat"
                                ? "border-accent-amber bg-accent-amber"
                                : "border-border-subtle bg-surface-card"
                            }`}
                          >
                            {milkBase === "oat" && <span className="w-1.5 h-1.5 rounded-full bg-black" />}
                          </div>
                          <div>
                            <span className="font-heading text-xs font-bold text-text-primary block">
                              Oatly® Barista Edition Oat Milk
                            </span>
                            <span className="text-[11px] text-cream-beige">
                              Smooth velvet microfoam, naturally sweet &amp; dairy-free
                            </span>
                          </div>
                        </div>
                        <span className="font-mono text-xs font-bold text-accent-amber">+Rp 8.000</span>
                      </label>

                      <label
                        onClick={() => setMilkBase("almond")}
                        className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${
                          milkBase === "almond"
                            ? "bg-surface-secondary border-accent-amber shadow-sm"
                            : "bg-surface-secondary/40 border-border-subtle hover:border-border-strong"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                              milkBase === "almond"
                                ? "border-accent-amber bg-accent-amber"
                                : "border-border-subtle bg-surface-card"
                            }`}
                          >
                            {milkBase === "almond" && <span className="w-1.5 h-1.5 rounded-full bg-black" />}
                          </div>
                          <div>
                            <span className="font-heading text-xs font-medium text-text-primary block">
                              Roasted California Almond Milk
                            </span>
                            <span className="text-[11px] text-text-muted">
                              Nutty notes complementing torch-fired aren
                            </span>
                          </div>
                        </div>
                        <span className="font-mono text-xs font-bold text-accent-amber">+Rp 8.000</span>
                      </label>
                    </div>
                  </div>

                  {/* SECTION 5: EXTRACTION BOOST */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="font-heading text-xs font-bold uppercase tracking-wider text-text-primary">
                        5. Espresso Extraction Boost
                      </h4>
                      <span className="font-mono text-[10px] text-cream-beige">Flores Bajawa Blend</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      {[
                        { id: "standard", label: "Standard Extraction", price: 0, desc: "Original recipe" },
                        { id: "ristretto", label: "+Extra Ristretto", price: 5000, desc: "+45mg caffeine" },
                        { id: "decaf", label: "Swiss Water Decaf", price: 3000, desc: "Gentle on sleep" },
                      ].map((b) => {
                        const isSelected = extraBoost === b.id;
                        return (
                          <div
                            key={b.id}
                            onClick={() => setExtraBoost(b.id)}
                            className={`p-3 rounded-xl border cursor-pointer transition-all ${
                              isSelected
                                ? "bg-surface-secondary border-accent-amber shadow-sm"
                                : "bg-surface-secondary/40 border-border-subtle hover:border-border-strong"
                            }`}
                          >
                            <span className="font-heading text-xs font-bold text-text-primary block">
                              {b.label}
                            </span>
                            <span className="font-mono text-[10px] text-text-muted block mt-0.5">
                              {b.desc}
                            </span>
                            <span className="font-mono text-xs font-bold text-accent-amber block mt-1">
                              {b.price > 0 ? `+Rp ${b.price.toLocaleString("id-ID")}` : "+Rp 0"}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </>
              ) : (
                /* FOOD / PASTRY STANDARD PREPARATION */
                <div className="space-y-3">
                  <div className="flex items-center gap-2 font-heading text-xs font-bold uppercase tracking-wider text-text-primary">
                    <SlidersHorizontal className="w-4 h-4 text-accent-amber" />
                    <span>Serving Preparation</span>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-surface-secondary border border-border-subtle flex items-center gap-3 text-xs text-text-muted">
                    <Coffee className="w-5 h-5 text-accent-amber flex-shrink-0" />
                    <span>
                      Sajian dipanggang hangat langsung dari kitchen warkop sesuai pesanan.
                    </span>
                  </div>
                </div>
              )}

              {/* Dynamic backend custom options if defined */}
              {(product.customizations ?? []).length > 0 && (
                <div className="space-y-4 pt-2 border-t border-border-subtle">
                  <h4 className="font-heading text-xs font-bold uppercase tracking-wider text-text-primary">
                    Pilihan Tambahan Menu
                  </h4>
                  {(product.customizations ?? []).map((definition: ProductCustomization) => (
                    <fieldset key={definition.id} className="space-y-2">
                      <legend className="text-xs font-semibold text-text-primary mb-1">
                        {definition.name}
                      </legend>
                      <div className="grid grid-cols-2 gap-2">
                        {definition.options.map((option) => {
                          const isSelected = backendSelections[definition.name] === option.label;
                          return (
                            <button
                              key={option.label}
                              type="button"
                              onClick={() =>
                                setBackendSelections((curr) => ({
                                  ...curr,
                                  [definition.name]: option.label,
                                }))
                              }
                              className={`rounded-xl border p-2.5 text-left text-xs font-medium transition-all cursor-pointer ${
                                isSelected
                                  ? "border-accent-amber bg-surface-secondary text-text-primary font-bold shadow-sm"
                                  : "border-border-subtle bg-surface-secondary/40 text-text-muted hover:text-text-primary"
                              }`}
                            >
                              <span className="block">{option.label}</span>
                              {option.price > 0 && (
                                <span className="mt-0.5 block font-mono text-[10px] text-accent-amber">
                                  +Rp {option.price.toLocaleString("id-ID")}
                                </span>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </fieldset>
                  ))}
                </div>
              )}

              {/* SECTION: BARISTA INSTRUCTIONS */}
              <div className="space-y-2 pt-2 border-t border-border-subtle">
                <div className="flex items-center justify-between">
                  <label htmlFor="product-notes" className="font-heading text-xs font-bold uppercase tracking-wider text-text-primary">
                    Special Barista Instruction
                  </label>
                  <span className="font-mono text-[10px] text-text-muted">
                    {notes.length} / 120 chars
                  </span>
                </div>
                <textarea
                  id="product-notes"
                  value={notes}
                  maxLength={120}
                  onChange={(event) => setNotes(event.target.value)}
                  placeholder="e.g., Pisahkan gula aren, extra cup sleeves, tolong torch brulee extra garing..."
                  className="h-20 w-full rounded-2xl border border-border-subtle bg-surface-secondary p-3 text-xs text-text-primary placeholder:text-text-muted focus:border-accent-amber focus:outline-none resize-none transition-colors"
                />
              </div>
            </div>

            {/* 3. STICKY BOTTOM ACTION BAR */}
            <div className="p-4 sm:p-5 bg-surface-secondary border-t border-border-subtle flex flex-col sm:flex-row items-center justify-between gap-4">
              {/* Quantity Stepper */}
              <div className="flex items-center gap-3 bg-surface-card p-1.5 rounded-2xl border border-border-subtle">
                <button
                  type="button"
                  onClick={() => setQuantity((curr) => Math.max(1, curr - 1))}
                  className="w-8 h-8 rounded-xl bg-surface-secondary text-text-muted hover:text-text-primary flex items-center justify-center transition-colors cursor-pointer"
                  aria-label="Kurangi jumlah"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-8 text-center font-mono text-sm font-bold text-text-primary">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() => setQuantity((curr) => Math.min(50, curr + 1))}
                  className="w-8 h-8 rounded-xl bg-surface-secondary text-text-muted hover:text-text-primary flex items-center justify-center transition-colors cursor-pointer"
                  aria-label="Tambah jumlah"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              {/* Dynamic Calculation CTA Button */}
              <div className="w-full sm:w-auto flex-1 flex flex-col sm:items-end gap-1">
                <button
                  type="button"
                  onClick={handleAddToCart}
                  className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-gradient-to-r from-primary-container via-secondary-container to-accent-amber text-canvas-obsidian font-heading font-bold text-xs shadow-[0_4px_20px_rgba(245,158,11,0.3)] hover:brightness-110 active:scale-[0.99] transition-all flex items-center justify-center gap-3 cursor-pointer"
                >
                  <span>Add Customized Item</span>
                  <span className="font-mono text-xs bg-canvas-obsidian/15 px-2 py-0.5 rounded text-canvas-obsidian font-extrabold">
                    Rp {totalPrice.toLocaleString("id-ID")}
                  </span>
                </button>
                <span className="font-mono text-[10px] text-text-muted text-center sm:text-right">
                  Earns <strong className="text-accent-amber">+{earnedPoints} Ya&apos;reh Points</strong> (Silver Tier 1.25x Active)
                </span>
              </div>
            </div>
          </motion.div>
    </div>
  );
}

export function ProductCustomizerModal({
  product,
  isOpen,
  onClose,
}: ProductCustomizerModalProps) {
  if (!product) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <ProductCustomizerModalContent
          key={product.id}
          product={product}
          onClose={onClose}
        />
      )}
    </AnimatePresence>
  );
}
