"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/stores";
import Image from "next/image";
import { IconLocation, IconCoffee, IconArrowRight } from "@/lib/icons";

export default function CheckoutPage() {
  const router = useRouter();
  const { items, total, clearCart } = useCartStore();
  const [orderType, setOrderType] = useState<"dine_in" | "take_away">("dine_in");
  const [tableNumber, setTableNumber] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("gopay");

  // Redirect if cart is empty
  if (items.length === 0) {
    if (typeof window !== "undefined") {
      router.push("/menu");
    }
    return null;
  }

  const subtotal = total();
  const tax = subtotal * 0.1; // PB1 10%
  const grandTotal = subtotal + tax;

  const handlePlaceOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (orderType === "dine_in" && !tableNumber) {
      alert("Please enter a table number for Dine In.");
      return;
    }
    
    // Simulate API call
    setTimeout(() => {
      clearCart();
      router.push("/checkout/success");
    }, 1000);
  };

  return (
    <div className="bg-background text-on-background font-body-md min-h-screen pt-24 pb-32">
      <div className="fixed inset-0 organic-noise pointer-events-none z-[-1]"></div>
      
      <main className="max-w-4xl mx-auto px-margin-mobile">
        <h1 className="font-display-lg text-4xl text-primary mb-8">Checkout</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form Section */}
          <div className="lg:col-span-2 space-y-8">
            <form id="checkout-form" onSubmit={handlePlaceOrder} className="space-y-8">
              
              {/* Order Type */}
              <section className="glass-card p-6 rounded-2xl border border-white/5">
                <h2 className="font-display-sm text-2xl mb-6">Order Details</h2>
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <label className={`cursor-pointer rounded-xl border p-4 flex flex-col items-center gap-3 transition-all ${orderType === "dine_in" ? "border-primary bg-primary/10 text-primary" : "border-white/10 text-on-surface-variant hover:border-white/20"}`}>
                    <input type="radio" name="orderType" value="dine_in" checked={orderType === "dine_in"} onChange={() => setOrderType("dine_in")} className="hidden" />
                    <IconCoffee size={28} />
                    <span className="font-headline-md">Dine In</span>
                  </label>
                  <label className={`cursor-pointer rounded-xl border p-4 flex flex-col items-center gap-3 transition-all ${orderType === "take_away" ? "border-primary bg-primary/10 text-primary" : "border-white/10 text-on-surface-variant hover:border-white/20"}`}>
                    <input type="radio" name="orderType" value="take_away" checked={orderType === "take_away"} onChange={() => setOrderType("take_away")} className="hidden" />
                    <IconLocation size={28} />
                    <span className="font-headline-md">Take Away</span>
                  </label>
                </div>

                {orderType === "dine_in" && (
                  <div className="animate-in fade-in slide-in-from-top-4 duration-300">
                    <label className="block text-sm text-on-surface-variant mb-2">Table Number</label>
                    <input
                      type="number"
                      placeholder="e.g. 12"
                      value={tableNumber}
                      onChange={(e) => setTableNumber(e.target.value)}
                      className="w-full bg-surface-container-highest/50 border border-white/10 rounded-xl px-4 py-3 text-on-surface outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                      required
                    />
                  </div>
                )}
              </section>

              {/* Payment Method */}
              <section className="glass-card p-6 rounded-2xl border border-white/5">
                <h2 className="font-display-sm text-2xl mb-6">Payment Method</h2>
                <div className="space-y-3">
                  {["gopay", "qris", "cash"].map((method) => (
                    <label key={method} className={`cursor-pointer flex items-center justify-between p-4 rounded-xl border transition-all ${paymentMethod === method ? "border-primary bg-primary/5" : "border-white/10 hover:border-white/20"}`}>
                      <div className="flex items-center gap-3">
                        <input
                          type="radio"
                          name="paymentMethod"
                          value={method}
                          checked={paymentMethod === method}
                          onChange={() => setPaymentMethod(method)}
                          className="accent-primary"
                        />
                        <span className="font-headline-md capitalize">{method === "qris" ? "QRIS" : method}</span>
                      </div>
                    </label>
                  ))}
                </div>
              </section>
            </form>
          </div>

          {/* Order Summary Section */}
          <div className="lg:col-span-1">
            <div className="glass-card p-6 rounded-2xl border border-white/5 sticky top-28">
              <h2 className="font-display-sm text-2xl mb-6">Order Summary</h2>
              
              <div className="space-y-4 mb-6 max-h-64 overflow-y-auto custom-scroll pr-2">
                {items.map((item) => (
                  <div key={item.product.id} className="flex justify-between">
                    <div className="flex gap-3">
                      <div className="relative w-12 h-12 rounded bg-surface overflow-hidden flex-shrink-0">
                        <Image src={item.product.image || "https://lh3.googleusercontent.com/aida-public/AB6AXuA12GYBUOApK8TOhl-_xJHF8c3O63XZJBaY0Cl4Qxtb169bQUm9MscI9B3ucDNRRsva-KUYw6j2JBvsRIyfvIv7QYDpRyL0uKW8lcQcQGo_Yw-KjJtvFjQD4egaXMpVR9sO06SmoR8BDAyFDY1iSGTBFxSmKIUk3c9f0W9cdeDY_yHgZPwlvVWOvSSs2oWxINGdismkZlB6cCJioCbb5c2VCYj-48eJ16SGSQU_jX72kpaiVIM6UMP7N-pTYJRIlCWz3Bjx58XNrCA"} alt={item.product.name} fill className="object-cover" />
                      </div>
                      <div>
                        <p className="font-headline-md text-sm line-clamp-1">{item.product.name}</p>
                        <p className="text-on-surface-variant text-xs mt-1">Qty: {item.quantity}</p>
                      </div>
                    </div>
                    <span className="font-code-sm text-sm">Rp {((item.product.price * item.quantity) / 1000).toFixed(0)}k</span>
                  </div>
                ))}
              </div>

              <div className="border-t border-white/10 pt-4 space-y-3">
                <div className="flex justify-between text-on-surface-variant text-sm">
                  <span>Subtotal</span>
                  <span className="font-code-sm">Rp {(subtotal / 1000).toFixed(0)}k</span>
                </div>
                <div className="flex justify-between text-on-surface-variant text-sm">
                  <span>PB1 (10%)</span>
                  <span className="font-code-sm">Rp {(tax / 1000).toFixed(1)}k</span>
                </div>
                <div className="flex justify-between items-center pt-3 border-t border-white/10 mt-3">
                  <span className="font-headline-md text-lg">Total</span>
                  <span className="font-display-sm text-2xl text-primary-fixed">Rp {(grandTotal / 1000).toFixed(1)}k</span>
                </div>
              </div>

              <button
                type="submit"
                form="checkout-form"
                className="w-full mt-8 py-4 bg-primary text-on-primary rounded-xl font-headline-md text-lg hover:bg-primary/90 hover:scale-[1.02] active:scale-95 transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2"
              >
                Place Order <IconArrowRight size={20} />
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
