"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { IconCheck, IconPreparing } from "@/lib/icons";
import Link from "next/link";

export default function OrderSuccessPage() {
  const [orderId, setOrderId] = useState("");

  useEffect(() => {
    // Generate a random order ID like WY-1A2B3C
    const id = "WY-" + Math.random().toString(36).substring(2, 8).toUpperCase();
    setOrderId(id);
  }, []);

  return (
    <div className="bg-background text-on-background font-body-md min-h-screen flex items-center justify-center p-6 relative">
      <div className="fixed inset-0 organic-noise pointer-events-none z-[-1]"></div>

      {/* Decorative background gradients */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary/20 blur-[100px] rounded-full pointer-events-none"></div>

      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, type: "spring", bounce: 0.4 }}
        className="glass-card max-w-md w-full p-8 md:p-12 rounded-3xl border border-white/10 text-center shadow-2xl relative z-10"
      >
        <div className="w-24 h-24 mx-auto bg-primary/20 rounded-full flex items-center justify-center mb-6 relative">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3, type: "spring", bounce: 0.6 }}
            className="w-16 h-16 bg-primary rounded-full flex items-center justify-center text-on-primary shadow-lg shadow-primary/30"
          >
            <IconCheck size={32} strokeWidth={3} />
          </motion.div>
        </div>

        <h1 className="font-display-lg text-3xl md:text-4xl text-on-surface mb-2 tracking-tight">Order Confirmed!</h1>
        <p className="text-on-surface-variant mb-8">
          Thank you for choosing Warkop Ya&apos;reh. We&apos;ve received your order.
        </p>

        <div className="bg-surface-container-highest/40 border border-white/5 rounded-2xl p-6 mb-8 flex flex-col gap-4">
          <div>
            <span className="text-sm text-on-surface-variant block mb-1">Order ID</span>
            <span className="font-code-lg text-2xl text-primary-fixed tracking-wider">{orderId || "..."}</span>
          </div>
          
          <div className="h-px w-full bg-white/5 my-2"></div>
          
          <div className="flex items-center justify-center gap-3 text-on-surface">
            <IconPreparing size={20} className="text-primary-fixed animate-pulse" />
            <span className="font-headline-md">Preparing your fuel...</span>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <Link href="/orders" className="w-full py-4 bg-primary text-on-primary rounded-xl font-headline-md hover:bg-primary/90 hover:scale-[1.02] active:scale-95 transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2">
            View Order Status
          </Link>
          <Link href="/menu" className="w-full py-4 bg-surface border border-white/10 text-on-surface rounded-xl font-headline-md hover:bg-surface-container-highest transition-all flex items-center justify-center gap-2">
            Back to Menu
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
