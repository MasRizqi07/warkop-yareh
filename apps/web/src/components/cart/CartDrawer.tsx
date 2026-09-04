"use client";

import React, { useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { X, Plus, Minus, Trash2, ShoppingBag, ArrowRight, Tag } from "lucide-react";
import { useAppStore } from "@/store/useAppStore";

export function CartDrawer() {
  const router = useRouter();
  const {
    cartItems,
    isCartDrawerOpen,
    setCartDrawerOpen,
    updateCartQuantity,
    removeCartItem,
    getCartSubtotal,
    getCartTotal,
    appliedVoucher,
    redeemedPoints,
  } = useAppStore();

  // Disable body scroll when drawer is open
  useEffect(() => {
    if (isCartDrawerOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isCartDrawerOpen]);

  const subtotal = getCartSubtotal();
  const total = getCartTotal();

  return (
    <AnimatePresence>
      {isCartDrawerOpen && (
        <div className="fixed inset-0 z-[100] flex justify-end">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setCartDrawerOpen(false)}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm"
          />

          {/* Drawer Container */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 26, stiffness: 280 }}
            className="relative w-full max-w-md h-full bg-[#111114] border-l border-white/10 shadow-2xl flex flex-col z-10"
          >
            {/* Header */}
            <div className="p-5 border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-[#9c6b3a]/20 text-[#f59e0b]">
                  <ShoppingBag className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="font-heading font-bold text-base text-white">
                    Keranjang Pesanan
                  </h2>
                  <p className="text-xs text-neutral-400 font-mono">
                    {cartItems.length} menu dipilih
                  </p>
                </div>
              </div>
              <button
                onClick={() => setCartDrawerOpen(false)}
                className="p-2 rounded-full hover:bg-white/5 text-neutral-400 hover:text-white transition-colors"
                aria-label="Tutup"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Cart Items List */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {cartItems.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-6 text-neutral-400">
                  <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
                    <ShoppingBag className="w-8 h-8 text-neutral-500" />
                  </div>
                  <h3 className="font-heading text-lg font-bold text-white mb-1">
                    Keranjang masih kosong
                  </h3>
                  <p className="text-xs text-neutral-400 mb-6 max-w-xs">
                    Yuk pilih kopi specialty atau artisan snack favoritmu untuk memulai pesanan.
                  </p>
                  <Link
                    href="/menu"
                    onClick={() => setCartDrawerOpen(false)}
                    className="px-5 py-2.5 rounded-full bg-[#9c6b3a] hover:bg-[#b07b44] text-white text-xs font-semibold shadow-lg transition-colors"
                  >
                    Jelajahi Menu Ya&apos;reh
                  </Link>
                </div>
              ) : (
                cartItems.map((item) => (
                  <div
                    key={item.id}
                    className="p-3.5 rounded-2xl bg-[#18181c] border border-white/5 flex gap-3 group hover:border-white/10 transition-colors"
                  >
                    <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-[#111114] flex-shrink-0">
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        className="object-cover"
                        sizes="64px"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="font-medium text-white text-xs leading-snug line-clamp-1">
                          {item.name}
                        </h4>
                        <button
                          onClick={() => removeCartItem(item.id)}
                          className="text-neutral-500 hover:text-rose-400 transition-colors p-1"
                          aria-label="Hapus item"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Customization Pills */}
                      <div className="text-[10px] text-neutral-400 mt-1 space-y-0.5">
                        <div>{item.customizations.sweetness} • {item.customizations.iceLevel}</div>
                        {item.customizations.milkType !== "None" && item.customizations.milkType !== "Fresh Milk" && (
                          <div className="text-[#f59e0b]">{item.customizations.milkType}</div>
                        )}
                        {item.customizations.notes && (
                          <div className="italic text-neutral-400">&ldquo;{item.customizations.notes}&rdquo;</div>
                        )}
                      </div>

                      <div className="flex items-center justify-between mt-3">
                        <span className="font-mono font-bold text-xs text-white">
                          Rp {item.subtotal.toLocaleString("id-ID")}
                        </span>

                        <div className="flex items-center gap-2 bg-[#111114] border border-white/10 rounded-lg p-1">
                          <button
                            onClick={() => updateCartQuantity(item.id, -1)}
                            className="w-5 h-5 rounded flex items-center justify-center text-neutral-300 hover:text-white hover:bg-white/10"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="font-mono font-bold text-xs w-4 text-center text-white">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateCartQuantity(item.id, 1)}
                            className="w-5 h-5 rounded flex items-center justify-center text-neutral-300 hover:text-white hover:bg-white/10"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer Summary & Checkout Trigger */}
            {cartItems.length > 0 && (
              <div className="p-5 bg-[#141418] border-t border-white/10 space-y-3">
                {/* Promo Applied Chip if any */}
                {appliedVoucher && (
                  <div className="flex items-center justify-between text-xs px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                    <span className="flex items-center gap-1.5">
                      <Tag className="w-3.5 h-3.5" /> Voucher: {appliedVoucher.code}
                    </span>
                    <span>Aktif</span>
                  </div>
                )}

                {/* Subtotal & Total Breakdown */}
                <div className="space-y-1.5 text-xs text-neutral-400">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span className="font-mono text-white">
                      Rp {subtotal.toLocaleString("id-ID")}
                    </span>
                  </div>
                  {redeemedPoints > 0 && (
                    <div className="flex justify-between text-[#f59e0b]">
                      <span>Diskon Poin ({redeemedPoints} pts)</span>
                      <span className="font-mono">-Rp {(redeemedPoints * 10).toLocaleString("id-ID")}</span>
                    </div>
                  )}
                  <div className="flex justify-between pt-2 border-t border-white/5 font-bold text-sm text-white">
                    <span>Estimasi Total</span>
                    <span className="font-mono text-[#f59e0b]">
                      Rp {total.toLocaleString("id-ID")}
                    </span>
                  </div>
                </div>

                {/* Buttons: Detail Keranjang & Langsung Checkout */}
                <div className="grid grid-cols-2 gap-2 pt-2">
                  <button
                    onClick={() => {
                      setCartDrawerOpen(false);
                      router.push("/cart");
                    }}
                    className="py-3 px-4 rounded-xl border border-white/10 hover:bg-white/5 text-xs font-semibold text-neutral-200 text-center transition-colors"
                  >
                    Split-Bill & Promo
                  </button>
                  <button
                    onClick={() => {
                      setCartDrawerOpen(false);
                      router.push("/checkout");
                    }}
                    className="py-3 px-4 rounded-xl bg-gradient-to-r from-[#9c6b3a] to-[#d4b488] hover:opacity-95 text-xs font-bold text-white flex items-center justify-center gap-1.5 shadow-[0_4px_16px_rgba(156,107,58,0.4)] transition-all"
                  >
                    <span>Bayar Sekarang</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
