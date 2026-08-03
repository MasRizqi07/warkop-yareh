"use client";

import React, { useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { useCartStore, getCartItemId } from "@/stores";
import { IconClose, IconMinus, IconPlus, IconTrash } from "@/lib/icons";
import { useRouter } from "next/navigation";

export function CartDrawer() {
  const { items, isOpen, toggleCart, updateQuantity, removeItem, total } =
    useCartStore();
  const router = useRouter();

  // Prevent scrolling when the drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  const handleCheckout = () => {
    toggleCart();
    router.push("/checkout");
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={toggleCart}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 h-full w-full max-w-md bg-surface border-l border-white/10 z-[101] shadow-2xl flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-white/10">
              <h2 className="font-display-sm text-headline-md text-on-surface">
                Your Cart
              </h2>
              <button
                onClick={toggleCart}
                className="p-2 rounded-full hover:bg-surface-container-highest transition-colors text-on-surface-variant"
                aria-label="Close cart"
              >
                <IconClose size={24} />
              </button>
            </div>

            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6 custom-scroll">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center opacity-70">
                  <div className="w-24 h-24 bg-surface-container-highest rounded-full flex items-center justify-center mb-4">
                    <IconTrash size={40} className="text-outline" />
                  </div>
                  <h3 className="font-headline-md text-lg text-on-surface">
                    Your cart is empty
                  </h3>
                  <p className="text-sm text-on-surface-variant mt-2">
                    Looks like you haven&apos;t added anything to your cart yet.
                  </p>
                  <button
                    onClick={toggleCart}
                    className="mt-6 px-6 py-2 bg-primary text-on-primary rounded-full font-headline-md text-sm hover:bg-primary/90 transition-colors"
                  >
                    Start Ordering
                  </button>
                </div>
              ) : (
                items.map((item) => {
                  const itemKey = getCartItemId(
                    item.product.id,
                    item.customizations,
                    item.notes,
                  );
                  return (
                    <div
                      key={itemKey}
                      className="flex gap-4 p-4 rounded-xl bg-surface-container-highest/30 border border-white/5"
                    >
                      <div className="relative w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
                        <Image
                          src={
                            item.product.image ||
                            "https://lh3.googleusercontent.com/aida-public/AB6AXuA12GYBUOApK8TOhl-_xJHF8c3O63XZJBaY0Cl4Qxtb169bQUm9MscI9B3ucDNRRsva-KUYw6j2JBvsRIyfvIv7QYDpRyL0uKW8lcQcQGo_Yw-KjJtvFjQD4egaXMpVR9sO06SmoR8BDAyFDY1iSGTBFxSmKIUk3c9f0W9cdeDY_yHgZPwlvVWOvSSs2oWxINGdismkZlB6cCJioCbb5c2VCYj-48eJ16SGSQU_jX72kpaiVIM6UMP7N-pTYJRIlCWz3Bjx58XNrCA"
                          }
                          alt={item.product.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="flex flex-col flex-1 justify-between py-1">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-headline-md text-on-surface line-clamp-1">
                              {item.product.name}
                            </h4>
                            {item.customizations &&
                              Object.keys(item.customizations).length > 0 && (
                                <p className="text-xs text-on-surface-variant/80 mt-0.5">
                                  {Object.entries(item.customizations)
                                    .map(([k, v]) => `${k}: ${v}`)
                                    .join(", ")}
                                </p>
                              )}
                            {item.notes && (
                              <p className="text-xs italic text-on-surface-variant/60 mt-0.5">
                                Notes: &quot;{item.notes}&quot;
                              </p>
                            )}
                            <p className="text-sm text-primary-fixed mt-1">
                              Rp {(item.product.price / 1000).toFixed(0)}k
                            </p>
                          </div>
                          <button
                            onClick={() =>
                              removeItem(
                                item.product.id,
                                item.customizations,
                                item.notes,
                              )
                            }
                            className="p-1.5 text-on-surface-variant hover:text-error hover:bg-error/10 rounded-md transition-colors"
                            aria-label="Remove item"
                          >
                            <IconTrash size={16} />
                          </button>
                        </div>
                        <div className="flex items-center gap-3 mt-3">
                          <div className="flex items-center bg-surface border border-white/10 rounded-full px-1 py-1">
                            <button
                              onClick={() =>
                                updateQuantity(
                                  item.product.id,
                                  item.quantity - 1,
                                  item.customizations,
                                  item.notes,
                                )
                              }
                              className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-surface-container-highest transition-colors text-on-surface"
                              disabled={item.quantity <= 1}
                              title="Decrease quantity"
                              aria-label="Decrease quantity"
                            >
                              <IconMinus size={14} />
                            </button>
                            <span className="w-8 text-center font-receipt-label text-sm text-on-surface">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() =>
                                updateQuantity(
                                  item.product.id,
                                  item.quantity + 1,
                                  item.customizations,
                                  item.notes,
                                )
                              }
                              className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-surface-container-highest transition-colors text-on-surface"
                              title="Increase quantity"
                              aria-label="Increase quantity"
                            >
                              <IconPlus size={14} />
                            </button>
                          </div>
                          <span className="ml-auto font-code-sm text-sm text-on-surface">
                            Rp{" "}
                            {(
                              (item.product.price * item.quantity) /
                              1000
                            ).toFixed(0)}
                            k
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="p-6 border-t border-white/10 bg-surface/50 backdrop-blur-md">
                <div className="flex justify-between items-center mb-6">
                  <span className="text-on-surface-variant font-receipt-label">
                    Subtotal
                  </span>
                  <span className="font-display-sm text-xl text-primary-fixed">
                    Rp {(total() / 1000).toFixed(0)}k
                  </span>
                </div>
                <button
                  onClick={handleCheckout}
                  className="w-full py-4 bg-primary text-on-primary rounded-xl font-headline-md text-lg hover:bg-primary/90 hover:scale-[1.02] active:scale-95 transition-all shadow-lg shadow-primary/20"
                >
                  Proceed to Checkout
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
