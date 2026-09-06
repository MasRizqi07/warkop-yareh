"use client";

import React, { useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Minus, Plus, ShoppingBag, Trash2, X } from "lucide-react";
import { useCartStore } from "@/stores";

export function CartDrawer() {
  const router = useRouter();
  const items = useCartStore((state) => state.items);
  const isOpen = useCartStore((state) => state.isOpen);
  const setCartOpen = useCartStore((state) => state.setCartOpen);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const removeItem = useCartStore((state) => state.removeItem);
  const subtotal = useCartStore((state) => state.total());

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setCartOpen(false);
    };
    if (isOpen) window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [isOpen, setCartOpen]);

  const totalCount = items.reduce((count, item) => count + item.quantity, 0);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex justify-end">
          {/* Backdrop */}
          <motion.button
            type="button"
            aria-label="Tutup keranjang"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setCartOpen(false)}
            className="fixed inset-0 cursor-default bg-black/75 backdrop-blur-sm"
          />

          {/* Slide-over Aside Panel */}
          <motion.aside
            role="dialog"
            aria-modal="true"
            aria-labelledby="cart-drawer-title"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 26, stiffness: 280 }}
            className="relative z-10 flex h-full w-full max-w-md flex-col border-l border-border-subtle bg-surface-card shadow-2xl text-text-primary transition-colors"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-border-subtle p-5 bg-surface-secondary/50">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-accent-amber/10 border border-accent-amber/20 p-2 text-accent-amber">
                  <ShoppingBag className="h-5 w-5" />
                </div>
                <div>
                  <h2 id="cart-drawer-title" className="font-heading text-base font-bold text-text-primary">
                    Keranjang Pesanan
                  </h2>
                  <p className="font-mono text-xs text-text-muted">
                    {totalCount} item dipilih
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setCartOpen(false)}
                className="rounded-full p-2 text-text-muted hover:bg-surface-secondary hover:text-text-primary transition-colors cursor-pointer"
                aria-label="Tutup"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Item List */}
            <div className="flex-1 space-y-3.5 overflow-y-auto p-5">
              {items.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center p-6 text-center text-text-muted">
                  <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-surface-secondary border border-border-subtle text-text-muted">
                    <ShoppingBag className="h-8 w-8" />
                  </div>
                  <h3 className="font-heading text-lg font-bold text-text-primary">
                    Keranjang masih kosong
                  </h3>
                  <p className="mb-6 mt-1 max-w-xs text-xs text-text-muted">
                    Pilih kopi specialty atau artisan toast favoritmu untuk memulai pesanan.
                  </p>
                  <Link
                    href="/menu"
                    onClick={() => setCartOpen(false)}
                    className="rounded-xl bg-primary hover:bg-primary-hover px-5 py-2.5 text-xs font-semibold text-white shadow-sm transition-all"
                  >
                    Jelajahi Menu
                  </Link>
                </div>
              ) : (
                items.map((item) => (
                  <article
                    key={`${item.product.id}-${JSON.stringify(item.customizations)}-${item.notes ?? ""}`}
                    className="flex gap-3.5 rounded-2xl border border-border-subtle bg-surface-secondary p-3.5 hover:border-border-strong transition-all shadow-sm"
                  >
                    <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-surface-card border border-border-subtle">
                      <Image
                        src={item.product.image}
                        alt={item.product.name}
                        fill
                        className="object-cover"
                        sizes="64px"
                      />
                    </div>
                    <div className="min-w-0 flex-1 flex flex-col justify-between">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="line-clamp-1 font-heading text-xs font-bold text-text-primary">
                          {item.product.name}
                        </h3>
                        <button
                          type="button"
                          onClick={() => removeItem(item.product.id, item.customizations, item.notes)}
                          className="p-1 text-text-muted hover:text-rose-500 transition-colors cursor-pointer"
                          aria-label={`Hapus ${item.product.name}`}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>

                      {item.customizations && (
                        <p className="mt-0.5 line-clamp-2 font-mono text-[10px] text-cream-beige">
                          {Object.values(item.customizations).join(" • ")}
                        </p>
                      )}

                      {item.notes && (
                        <p className="mt-0.5 line-clamp-1 text-[10px] italic text-text-muted">
                          &ldquo;{item.notes}&rdquo;
                        </p>
                      )}

                      <div className="mt-2.5 flex items-center justify-between">
                        <span className="font-mono text-xs font-extrabold text-accent-amber">
                          Rp {(item.unitPrice * item.quantity).toLocaleString("id-ID")}
                        </span>

                        <div className="flex items-center gap-1.5 rounded-xl border border-border-subtle bg-surface-card p-1">
                          <button
                            type="button"
                            onClick={() =>
                              updateQuantity(
                                item.product.id,
                                item.quantity - 1,
                                item.customizations,
                                item.notes
                              )
                            }
                            className="flex h-5 w-5 items-center justify-center rounded-lg text-text-muted hover:text-text-primary hover:bg-surface-secondary transition-colors cursor-pointer"
                            aria-label="Kurangi jumlah"
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="w-5 text-center font-mono text-xs font-bold text-text-primary">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() =>
                              updateQuantity(
                                item.product.id,
                                item.quantity + 1,
                                item.customizations,
                                item.notes
                              )
                            }
                            className="flex h-5 w-5 items-center justify-center rounded-lg text-text-muted hover:text-text-primary hover:bg-surface-secondary transition-colors cursor-pointer"
                            aria-label="Tambah jumlah"
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </article>
                ))
              )}
            </div>

            {/* Footer Summary & Checkout CTA */}
            {items.length > 0 && (
              <div className="space-y-3 border-t border-border-subtle bg-surface-secondary/60 p-5">
                <div className="flex justify-between items-baseline text-sm">
                  <span className="text-text-muted font-medium">Estimasi Subtotal</span>
                  <span className="font-mono font-extrabold text-lg text-accent-amber">
                    Rp {subtotal.toLocaleString("id-ID")}
                  </span>
                </div>
                <p className="text-[10px] text-text-muted">
                  Pajak dan harga final dihitung ulang oleh server saat pesanan dibuat.
                </p>
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setCartOpen(false);
                      router.push("/cart");
                    }}
                    className="rounded-xl border border-border-subtle bg-surface-card hover:bg-surface-container px-4 py-3 text-center text-xs font-bold text-text-primary transition-colors cursor-pointer"
                  >
                    Detail Keranjang
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setCartOpen(false);
                      router.push("/checkout");
                    }}
                    className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-primary-container via-secondary-container to-accent-amber text-canvas-obsidian px-4 py-3 text-xs font-bold shadow-md hover:brightness-110 active:scale-95 transition-all cursor-pointer"
                  >
                    <span>Checkout</span>
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}
          </motion.aside>
        </div>
      )}
    </AnimatePresence>
  );
}
