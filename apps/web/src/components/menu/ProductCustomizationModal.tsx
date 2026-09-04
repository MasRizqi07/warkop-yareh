"use client";

import React, { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import type { Product } from "@warkop-yareh/types";

export interface CustomizationOptions {
  size: "regular" | "large";
  milk: "dairy" | "oat" | "almond";
  sweetness: "0%" | "50%" | "100%";
  ice: "normal" | "less" | "none";
  extraShot: boolean;
  seaSaltCream: boolean;
  notes: string;
  quantity: number;
}

interface ProductCustomizationModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (product: Product, options: CustomizationOptions, finalPrice: number) => void;
}

export function ProductCustomizationModal({
  product,
  isOpen,
  onClose,
  onAddToCart,
}: ProductCustomizationModalProps) {
  const [size, setSize] = useState<"regular" | "large">("regular");
  const [milk, setMilk] = useState<"dairy" | "oat" | "almond">("dairy");
  const [sweetness, setSweetness] = useState<"0%" | "50%" | "100%">("100%");
  const [ice, setIce] = useState<"normal" | "less" | "none">("normal");
  const [extraShot, setExtraShot] = useState(false);
  const [seaSaltCream, setSeaSaltCream] = useState(false);
  const [notes, setNotes] = useState("");
  const [quantity, setQuantity] = useState(1);

  if (!isOpen || !product) return null;

  // Price calculations
  const basePrice = product.price;
  const sizeSurcharge = size === "large" ? 6000 : 0;
  const milkSurcharge = milk === "oat" ? 8000 : milk === "almond" ? 8000 : 0;
  const extraShotSurcharge = extraShot ? 7000 : 0;
  const seaSaltSurcharge = seaSaltCream ? 5000 : 0;
  const unitPrice = basePrice + sizeSurcharge + milkSurcharge + extraShotSurcharge + seaSaltSurcharge;
  const totalPrice = unitPrice * quantity;

  const handleConfirm = () => {
    onAddToCart(
      product,
      {
        size,
        milk,
        sweetness,
        ice,
        extraShot,
        seaSaltCream,
        notes,
        quantity,
      },
      totalPrice
    );
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/80 backdrop-blur-md"
          onClick={onClose}
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="relative w-full max-w-lg max-h-[90vh] bg-[#18181c] border border-white/[0.08] rounded-2xl shadow-2xl overflow-hidden flex flex-col z-10"
        >
          {/* Header with Product Preview */}
          <div className="relative h-44 w-full bg-[#111114] shrink-0 border-b border-white/[0.06]">
            {product.image && (
              <Image
                src={product.image}
                alt={product.name}
                fill
                sizes="(min-width: 640px) 512px, 100vw"
                className="object-cover"
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-[#18181c] via-[#18181c]/40 to-transparent" />
            <button
              onClick={onClose}
              className="absolute top-3 right-3 p-1.5 rounded-full bg-[#0a0a0c]/80 text-[#94a3b8] hover:text-[#f8fafc] transition-colors"
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
            <div className="absolute bottom-3 left-4 right-4">
              <span className="text-[10px] font-mono text-[#f59e0b] uppercase font-bold tracking-wider">
                Craft Customization
              </span>
              <h3 className="text-xl font-bold text-[#f8fafc] leading-tight">{product.name}</h3>
              <p className="text-xs text-[#94a3b8] truncate mt-0.5">{product.description}</p>
            </div>
          </div>

          {/* Scrollable Customization Options */}
          <div className="p-4 sm:p-6 overflow-y-auto space-y-5 text-xs text-[#e5e1e4]">
            {/* 1. Size Selection */}
            <div>
              <label className="font-semibold text-sm text-[#f8fafc] block mb-2">
                1. Cup Size
              </label>
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => setSize("regular")}
                  className={`p-3 rounded-xl border text-left flex items-center justify-between transition-all ${
                    size === "regular"
                      ? "border-[#f59e0b] bg-[#f59e0b]/10 text-[#f8fafc]"
                      : "border-white/[0.06] bg-[#111114] text-[#94a3b8] hover:text-[#f8fafc]"
                  }`}
                >
                  <div>
                    <p className="font-bold text-xs text-[#f8fafc]">Regular (12oz)</p>
                    <p className="text-[10px] text-[#94a3b8]">Standard Extraction</p>
                  </div>
                  <span className="font-mono text-xs text-[#f59e0b]">Included</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSize("large")}
                  className={`p-3 rounded-xl border text-left flex items-center justify-between transition-all ${
                    size === "large"
                      ? "border-[#f59e0b] bg-[#f59e0b]/10 text-[#f8fafc]"
                      : "border-white/[0.06] bg-[#111114] text-[#94a3b8] hover:text-[#f8fafc]"
                  }`}
                >
                  <div>
                    <p className="font-bold text-xs text-[#f8fafc]">Large (16oz)</p>
                    <p className="text-[10px] text-[#94a3b8]">+Double Shot Base</p>
                  </div>
                  <span className="font-mono text-xs text-[#f59e0b]">+Rp 6.000</span>
                </button>
              </div>
            </div>

            {/* 2. Milk Options */}
            <div>
              <label className="font-semibold text-sm text-[#f8fafc] block mb-2">
                2. Milk Formula
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: "dairy", label: "Fresh Milk", surcharge: "Free" },
                  { id: "oat", label: "Oatly Barista", surcharge: "+Rp 8k" },
                  { id: "almond", label: "Almond Milk", surcharge: "+Rp 8k" },
                ].map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setMilk(m.id as "dairy" | "oat" | "almond")}
                    className={`p-2.5 rounded-xl border text-center transition-all ${
                      milk === m.id
                        ? "border-[#f59e0b] bg-[#f59e0b]/10 text-[#f8fafc]"
                        : "border-white/[0.06] bg-[#111114] text-[#94a3b8] hover:text-[#f8fafc]"
                    }`}
                  >
                    <p className="font-bold text-[11px] text-[#f8fafc]">{m.label}</p>
                    <p className="font-mono text-[10px] text-[#f59e0b] mt-0.5">{m.surcharge}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* 3. Sweetness & Ice */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="font-semibold text-xs text-[#f8fafc] block mb-2">
                  3. Sweetness
                </label>
                <div className="flex flex-col gap-1.5">
                  {(["0%", "50%", "100%"] as const).map((lvl) => (
                    <button
                      key={lvl}
                      type="button"
                      onClick={() => setSweetness(lvl)}
                      className={`px-3 py-1.5 rounded-lg border text-left text-xs transition-all ${
                        sweetness === lvl
                          ? "border-[#f7bb82] bg-[#9c6b3a]/20 text-[#f8fafc] font-bold"
                          : "border-white/[0.06] bg-[#111114] text-[#94a3b8]"
                      }`}
                    >
                      {lvl === "0%"
                        ? "0% Unsweetened"
                        : lvl === "50%"
                        ? "50% Less Sweet"
                        : "100% Signature"}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="font-semibold text-xs text-[#f8fafc] block mb-2">
                  4. Ice Volume
                </label>
                <div className="flex flex-col gap-1.5">
                  {(["normal", "less", "none"] as const).map((lvl) => (
                    <button
                      key={lvl}
                      type="button"
                      onClick={() => setIce(lvl)}
                      className={`px-3 py-1.5 rounded-lg border text-left text-xs transition-all ${
                        ice === lvl
                          ? "border-[#f7bb82] bg-[#9c6b3a]/20 text-[#f8fafc] font-bold"
                          : "border-white/[0.06] bg-[#111114] text-[#94a3b8]"
                      }`}
                    >
                      {lvl === "normal" ? "Normal Ice" : lvl === "less" ? "Less Ice" : "No Ice"}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* 4. Add-ons */}
            <div>
              <label className="font-semibold text-sm text-[#f8fafc] block mb-2">
                5. Barista Add-ons
              </label>
              <div className="space-y-2">
                <label className="flex items-center justify-between p-3 rounded-xl bg-[#111114] border border-white/[0.06] cursor-pointer">
                  <div className="flex items-center gap-2.5">
                    <input
                      type="checkbox"
                      checked={extraShot}
                      onChange={(e) => setExtraShot(e.target.checked)}
                      className="rounded accent-[#f59e0b]"
                    />
                    <span className="text-xs text-[#f8fafc]">Extra Espresso Single Shot</span>
                  </div>
                  <span className="font-mono text-xs text-[#f59e0b]">+Rp 7.000</span>
                </label>
                <label className="flex items-center justify-between p-3 rounded-xl bg-[#111114] border border-white/[0.06] cursor-pointer">
                  <div className="flex items-center gap-2.5">
                    <input
                      type="checkbox"
                      checked={seaSaltCream}
                      onChange={(e) => setSeaSaltCream(e.target.checked)}
                      className="rounded accent-[#f59e0b]"
                    />
                    <span className="text-xs text-[#f8fafc]">Artisan Sea Salt Cloud Foam</span>
                  </div>
                  <span className="font-mono text-xs text-[#f59e0b]">+Rp 5.000</span>
                </label>
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="font-semibold text-xs text-[#94a3b8] block mb-1">
                Special Barista Notes (Optional)
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. Extra hot, separate ice, no straw..."
                className="w-full px-3 py-2 rounded-xl bg-[#111114] border border-white/[0.08] text-xs text-[#f8fafc] placeholder-[#94a3b8]/50 focus:outline-none focus:border-[#f59e0b]"
              />
            </div>
          </div>

          {/* Footer Bar with Quantity & Confirm CTA */}
          <div className="p-4 bg-[#111114] border-t border-white/[0.08] flex items-center justify-between gap-4">
            {/* Quantity Stepper */}
            <div className="flex items-center gap-2 bg-[#18181c] border border-white/[0.08] rounded-xl p-1">
              <button
                type="button"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="w-8 h-8 rounded-lg bg-[#201f21] hover:bg-[#2a2a2c] text-[#f8fafc] flex items-center justify-center font-bold"
              >
                -
              </button>
              <span className="w-8 text-center font-mono font-bold text-sm text-[#f8fafc]">
                {quantity}
              </span>
              <button
                type="button"
                onClick={() => setQuantity(quantity + 1)}
                className="w-8 h-8 rounded-lg bg-[#201f21] hover:bg-[#2a2a2c] text-[#f8fafc] flex items-center justify-center font-bold"
              >
                +
              </button>
            </div>

            {/* Total & Submit Button */}
            <button
              type="button"
              onClick={handleConfirm}
              className="flex-1 py-3 px-5 rounded-xl bg-gradient-to-r from-[#9c6b3a] to-[#ee9800] hover:from-[#b57d44] hover:to-[#f59e0b] text-[#f8fafc] font-bold text-sm flex items-center justify-between shadow-lg shadow-[#f59e0b]/20 transition-all"
            >
              <span>Add to Sanctuary Cart</span>
              <span className="font-mono font-bold">
                Rp {totalPrice.toLocaleString("id-ID")}
              </span>
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
