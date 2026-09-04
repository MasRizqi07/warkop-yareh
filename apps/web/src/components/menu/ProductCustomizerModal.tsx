"use client";

import React, { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { X, Plus, Minus, Sparkles, Flame, Coffee, Droplets } from "lucide-react";
import { MockProduct } from "@/lib/mockData";
import { useAppStore, CartCustomization } from "@/store/useAppStore";

interface ProductCustomizerModalProps {
  product: MockProduct | null;
  isOpen: boolean;
  onClose: () => void;
}

export function ProductCustomizerModal({
  product,
  isOpen,
  onClose,
}: ProductCustomizerModalProps) {
  const { addToCart } = useAppStore();

  const [sweetness, setSweetness] = useState<CartCustomization["sweetness"]>("Less Sweet (50%)");
  const [iceLevel, setIceLevel] = useState<CartCustomization["iceLevel"]>("Normal Ice");
  const [milkType, setMilkType] = useState<CartCustomization["milkType"]>("Fresh Milk");
  const [beanRoast, setBeanRoast] = useState<CartCustomization["beanRoast"]>("Signature House Blend");
  const [notes, setNotes] = useState("");
  const [quantity, setQuantity] = useState(1);

  if (!product) return null;

  // Calculate live total price
  let unitPrice = product.price;
  if (milkType.includes("Oat Milk")) unitPrice += 6000;
  if (milkType.includes("Almond Milk")) unitPrice += 8000;
  if (beanRoast.includes("Single Origin")) unitPrice += 4000;
  const totalPrice = unitPrice * quantity;

  const handleAddToCart = () => {
    addToCart(product, quantity, {
      sweetness,
      iceLevel,
      milkType,
      beanRoast,
      notes: notes.trim() || undefined,
    });
    onClose();
  };

  const sweetnessOptions: CartCustomization["sweetness"][] = [
    "Normal (100%)",
    "Less Sweet (50%)",
    "Quarter (25%)",
    "No Sugar (0%)",
  ];

  const iceOptions: CartCustomization["iceLevel"][] = [
    "Normal Ice",
    "Less Ice",
    "No Ice",
    "Hot",
  ];

  const milkOptions: { label: CartCustomization["milkType"]; extra: string }[] = [
    { label: "Fresh Milk", extra: "+Rp 0" },
    { label: "Oat Milk (+Rp 6.000)", extra: "+Rp 6.000" },
    { label: "Almond Milk (+Rp 8.000)", extra: "+Rp 8.000" },
    { label: "None", extra: "+Rp 0" },
  ];

  const beanOptions: { label: CartCustomization["beanRoast"]; extra: string }[] = [
    { label: "Signature House Blend", extra: "+Rp 0" },
    { label: "Single Origin Ijen (+Rp 4.000)", extra: "+Rp 4.000" },
    { label: "Dampit Robusta Dark", extra: "+Rp 0" },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/75 backdrop-blur-md"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative w-full max-w-lg rounded-3xl bg-[#18181c] border border-white/10 shadow-2xl overflow-hidden z-10 flex flex-col max-h-[90vh]"
          >
            {/* Header / Media */}
            <div className="relative h-48 w-full bg-[#111114]">
              <Image
                src={product.image}
                alt={product.name}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 500px"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#18181c] via-black/40 to-transparent" />
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-2 rounded-full bg-black/60 hover:bg-black text-white backdrop-blur-md transition-colors"
                aria-label="Tutup"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="absolute bottom-4 left-6 right-6">
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-semibold uppercase bg-[#f59e0b]/20 text-[#fcd34d] border border-[#f59e0b]/30">
                    {product.category}
                  </span>
                  <span className="text-xs text-neutral-300 font-mono">
                    ★ {product.rating} ({product.reviewCount})
                  </span>
                </div>
                <h3 className="font-heading text-xl font-bold text-white leading-tight">
                  {product.name}
                </h3>
              </div>
            </div>

            {/* Scrollable Customization Options */}
            <div className="p-6 overflow-y-auto space-y-6 text-sm text-neutral-300">
              <p className="text-xs text-neutral-400 leading-relaxed">
                {product.description}
              </p>

              {/* Sweetness Level */}
              <div>
                <label className="flex items-center gap-1.5 font-semibold text-white mb-2.5">
                  <Droplets className="w-4 h-4 text-[#f59e0b]" /> Tingkat Kemanisan (Gula Aren)
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {sweetnessOptions.map((opt) => (
                    <button
                      key={opt}
                      onClick={() => setSweetness(opt)}
                      className={`p-2.5 rounded-xl border text-xs text-left font-medium transition-all ${
                        sweetness === opt
                          ? "bg-[#9c6b3a]/20 border-[#9c6b3a] text-white"
                          : "border-white/5 bg-[#111114] text-neutral-400 hover:border-white/20"
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>

              {/* Ice Level */}
              <div>
                <label className="flex items-center gap-1.5 font-semibold text-white mb-2.5">
                  <Flame className="w-4 h-4 text-sky-400" /> Suhu & Es
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {iceOptions.map((opt) => (
                    <button
                      key={opt}
                      onClick={() => setIceLevel(opt)}
                      className={`p-2.5 rounded-xl border text-xs text-left font-medium transition-all ${
                        iceLevel === opt
                          ? "bg-sky-500/20 border-sky-400 text-white"
                          : "border-white/5 bg-[#111114] text-neutral-400 hover:border-white/20"
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>

              {/* Milk Option */}
              <div>
                <label className="flex items-center gap-1.5 font-semibold text-white mb-2.5">
                  <Sparkles className="w-4 h-4 text-amber-400" /> Pilihan Susu
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {milkOptions.map((item) => (
                    <button
                      key={item.label}
                      onClick={() => setMilkType(item.label)}
                      className={`p-2.5 rounded-xl border text-xs text-left font-medium transition-all ${
                        milkType === item.label
                          ? "bg-[#f59e0b]/20 border-[#f59e0b] text-white"
                          : "border-white/5 bg-[#111114] text-neutral-400 hover:border-white/20"
                      }`}
                    >
                      <div className="font-semibold">{item.label}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Bean Roast */}
              <div>
                <label className="flex items-center gap-1.5 font-semibold text-white mb-2.5">
                  <Coffee className="w-4 h-4 text-[#9c6b3a]" /> Karakter Biji Kopi
                </label>
                <div className="space-y-2">
                  {beanOptions.map((item) => (
                    <button
                      key={item.label}
                      onClick={() => setBeanRoast(item.label)}
                      className={`w-full p-2.5 rounded-xl border text-xs text-left font-medium flex items-center justify-between transition-all ${
                        beanRoast === item.label
                          ? "bg-[#9c6b3a]/20 border-[#9c6b3a] text-white"
                          : "border-white/5 bg-[#111114] text-neutral-400 hover:border-white/20"
                      }`}
                    >
                      <span>{item.label}</span>
                      <span className="font-mono text-neutral-400">{item.extra}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Special Barista Notes */}
              <div>
                <label className="font-semibold text-white mb-2 block">
                  Catatan untuk Barista
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Contoh: Tolong foam brulee-nya tebal dan pisah sedotan ramah lingkungan..."
                  className="w-full h-20 p-3 rounded-2xl bg-[#111114] border border-white/10 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-[#f59e0b]"
                />
              </div>
            </div>

            {/* Bottom Bar: Quantity & Add Button */}
            <div className="p-4 sm:p-6 bg-[#111114] border-t border-white/10 flex items-center justify-between gap-4">
              {/* Quantity Counter */}
              <div className="flex items-center gap-3 bg-[#18181c] border border-white/10 p-1.5 rounded-2xl">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-8 h-8 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center text-white transition-colors"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="font-mono font-bold text-white text-sm w-6 text-center">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-8 h-8 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center text-white transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              {/* Add Button */}
              <button
                onClick={handleAddToCart}
                className="flex-1 py-3 px-5 rounded-2xl bg-gradient-to-r from-[#9c6b3a] to-[#d4b488] hover:opacity-95 text-white font-heading font-bold text-sm flex items-center justify-between shadow-[0_4px_20px_rgba(156,107,58,0.4)] transition-all active:scale-[0.98]"
              >
                <span>Tambahkan ke Pesanan</span>
                <span className="font-mono font-bold">
                  Rp {totalPrice.toLocaleString("id-ID")}
                </span>
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
