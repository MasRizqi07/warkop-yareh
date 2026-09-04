"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Coffee,
  CalendarCheck,
  Users,
  User,
  ShoppingBag,
  WifiOff,
  Sparkles,
  LayoutGrid,
  ShieldCheck,
  MonitorCheck,
} from "lucide-react";
import { useAppStore } from "@/store/useAppStore";

export function PwaBottomDock() {
  const pathname = usePathname();
  const { cartItems, setCartDrawerOpen } = useAppStore();
  const [isOnline, setIsOnline] = useState(true);
  const [isOpsMenuOpen, setIsOpsMenuOpen] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    setIsOnline(window.navigator.onLine);

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  const totalCartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  // Hide dock inside POS full-screen cashier terminal or KDS kitchen screen if desired, but keep accessible via mini toggles
  const isDedicatedStaffScreen = pathname.startsWith("/ops/pos") || pathname.startsWith("/ops/kds");

  const navItems = [
    { href: "/", label: "Beranda", icon: Coffee },
    { href: "/menu", label: "Menu", icon: LayoutGrid },
    { href: "/reservations", label: "Reservasi", icon: CalendarCheck },
    { href: "/community", label: "Komunitas", icon: Users },
    { href: "/profile", label: "Profil", icon: User },
  ];

  return (
    <>
      {/* Offline Alert Banner */}
      <AnimatePresence>
        {!isOnline && (
          <motion.div
            initial={{ opacity: 0, y: -40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -40 }}
            className="fixed top-0 left-0 right-0 z-[120] bg-rose-900/90 backdrop-blur-md text-white py-2 px-4 text-xs font-mono text-center flex items-center justify-center gap-2 border-b border-rose-500/30 shadow-lg"
          >
            <WifiOff className="w-4 h-4 text-rose-300 animate-pulse" />
            <span>Koneksi offline terdeteksi — Mode PWA aktif dengan cache lokal Ya&apos;reh.</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Glass Bottom Navigation Dock */}
      {!isDedicatedStaffScreen && (
        <div className="fixed bottom-4 inset-x-0 z-50 flex justify-center px-2 sm:px-4 pointer-events-none">
          <div className="pointer-events-auto relative flex items-center gap-1 sm:gap-1.5 p-1.5 sm:p-2 rounded-full bg-[#111114]/90 backdrop-blur-2xl border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.5)]">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`relative flex flex-col items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-full transition-all duration-300 ${
                    isActive
                      ? "text-[#f59e0b] bg-[#f59e0b]/10"
                      : "text-neutral-400 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span className="text-[9px] sm:text-[10px] font-sans font-medium mt-0.5 leading-none">
                    {item.label}
                  </span>
                  {isActive && (
                    <motion.div
                      layoutId="activeDockDot"
                      className="absolute -bottom-1 w-1.5 h-1.5 rounded-full bg-[#f59e0b] shadow-[0_0_8px_#f59e0b]"
                      transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    />
                  )}
                </Link>
              );
            })}

            {/* Cart Button */}
            <button
              onClick={() => setCartDrawerOpen(true)}
              className="relative flex flex-col items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-[#9c6b3a] hover:bg-[#b07b44] text-white shadow-[0_4px_16px_rgba(156,107,58,0.4)] transition-transform active:scale-95"
              aria-label="Keranjang"
            >
              <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5" />
              {totalCartCount > 0 && (
                <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-[16px] h-[16px] sm:min-w-[18px] sm:h-[18px] px-1 text-[9px] sm:text-[10px] font-bold font-mono text-white bg-rose-500 rounded-full border border-[#111114] shadow-md animate-bounce">
                  {totalCartCount}
                </span>
              )}
            </button>

            {/* Ecosystem / Staff Portal Switcher Dropdown Trigger */}
            <div className="relative">
              <button
                onClick={() => setIsOpsMenuOpen(!isOpsMenuOpen)}
                className="flex flex-col items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-full text-neutral-400 hover:text-white hover:bg-white/5 transition-colors"
                title="Beralih Portal (Staff & Admin)"
              >
                <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#f59e0b]" />
                <span className="text-[8px] sm:text-[9px] font-mono text-neutral-400">Hub</span>
              </button>

              <AnimatePresence>
                {isOpsMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: -8 }}
                    exit={{ opacity: 0, scale: 0.9, y: 10 }}
                    className="absolute bottom-full right-0 mb-2 w-56 p-2 rounded-2xl bg-[#18181c] border border-white/10 shadow-2xl backdrop-blur-xl text-xs space-y-1"
                  >
                    <div className="px-3 py-1.5 text-[11px] font-mono font-semibold text-neutral-400 uppercase tracking-wider border-b border-white/5">
                      Portal Ekosistem
                    </div>
                    <Link
                      href="/ops/pos"
                      onClick={() => setIsOpsMenuOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-neutral-200 hover:text-[#f59e0b] hover:bg-white/5 transition-colors"
                    >
                      <LayoutGrid className="w-4 h-4 text-emerald-400" />
                      <div>
                        <div className="font-medium">Kasir POS Touch</div>
                        <div className="text-[10px] text-neutral-400">Terminal Staf Kasir</div>
                      </div>
                    </Link>
                    <Link
                      href="/ops/kds"
                      onClick={() => setIsOpsMenuOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-neutral-200 hover:text-[#f59e0b] hover:bg-white/5 transition-colors"
                    >
                      <MonitorCheck className="w-4 h-4 text-amber-400" />
                      <div>
                        <div className="font-medium">Kitchen Display (KDS)</div>
                        <div className="text-[10px] text-neutral-400">Barista Kanban & SLA</div>
                      </div>
                    </Link>
                    <Link
                      href="/ops/shift"
                      onClick={() => setIsOpsMenuOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-neutral-200 hover:text-[#f59e0b] hover:bg-white/5 transition-colors"
                    >
                      <ShoppingBag className="w-4 h-4 text-sky-400" />
                      <div>
                        <div className="font-medium">Rekonsiliasi Shift</div>
                        <div className="text-[10px] text-neutral-400">Cash Drawer & X/Z-Report</div>
                      </div>
                    </Link>
                    <div className="my-1 border-t border-white/5" />
                    <Link
                      href="/admin"
                      onClick={() => setIsOpsMenuOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-neutral-200 hover:text-[#f59e0b] hover:bg-white/5 transition-colors"
                    >
                      <ShieldCheck className="w-4 h-4 text-purple-400" />
                      <div>
                        <div className="font-medium">Admin Enterprise</div>
                        <div className="text-[10px] text-neutral-400">KPI, Inventory & CRM</div>
                      </div>
                    </Link>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
