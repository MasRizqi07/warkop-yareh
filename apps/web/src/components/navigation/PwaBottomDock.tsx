"use client";

import React, { useState, useSyncExternalStore } from "react";
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
  MonitorCheck,
} from "lucide-react";
import { useCartStore } from "@/stores";
import { useAuthStore } from "@/stores/auth.store";

function subscribeToNetworkStatus(onStoreChange: () => void) {
  window.addEventListener("online", onStoreChange);
  window.addEventListener("offline", onStoreChange);

  return () => {
    window.removeEventListener("online", onStoreChange);
    window.removeEventListener("offline", onStoreChange);
  };
}

const getNetworkStatus = () => window.navigator.onLine;
const getServerNetworkStatus = () => true;

export function PwaBottomDock() {
  const pathname = usePathname();
  const cartItems = useCartStore((state) => state.items);
  const setCartOpen = useCartStore((state) => state.setCartOpen);
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isOnline = useSyncExternalStore(
    subscribeToNetworkStatus,
    getNetworkStatus,
    getServerNetworkStatus,
  );
  const [isOpsMenuOpen, setIsOpsMenuOpen] = useState(false);

  const totalCartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  const canAccessOperations = Boolean(
    user && ['STAFF', 'CASHIER', 'KITCHEN', 'MANAGER', 'ADMIN', 'OWNER', 'SUPERADMIN'].includes(user.role),
  );

  // Hide dock inside POS full-screen cashier terminal or KDS kitchen screen if desired, but keep accessible via mini toggles
  const isDedicatedStaffScreen = pathname.startsWith("/ops/pos") || pathname.startsWith("/ops/kds");

  const navItems = [
    { href: "/", label: "Beranda", icon: Coffee },
    { href: "/menu", label: "Menu", icon: LayoutGrid },
    { href: "/booking", label: "Reservasi", icon: CalendarCheck },
    { href: "/community", label: "Komunitas", icon: Users },
    { href: isAuthenticated ? "/profile" : "/login", label: isAuthenticated ? "Profil" : "Masuk", icon: User },
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
            <span>Koneksi offline terdeteksi — katalog, checkout, dan status live memerlukan internet.</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Glass Bottom Navigation Dock (Mobile / PWA only) */}
      {!isDedicatedStaffScreen && (
        <div className="fixed bottom-4 inset-x-0 z-50 flex justify-center px-2 sm:px-4 pointer-events-none md:hidden">
          <div className="pointer-events-auto relative flex items-center gap-1 sm:gap-1.5 p-1.5 sm:p-2 rounded-full bg-surface-card/95 backdrop-blur-2xl border border-border-subtle shadow-[0_8px_32px_rgba(0,0,0,0.5)]">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`relative flex flex-col items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-full transition-all duration-300 ${
                    isActive
                      ? "text-accent-amber bg-accent-amber/10"
                      : "text-text-muted hover:text-text-primary hover:bg-surface-secondary"
                  }`}
                >
                  <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span className="text-[9px] sm:text-[10px] font-sans font-medium mt-0.5 leading-none">
                    {item.label}
                  </span>
                  {isActive && (
                    <motion.div
                      layoutId="activeDockDot"
                      className="absolute -bottom-1 w-1.5 h-1.5 rounded-full bg-accent-amber shadow-[0_0_8px_rgba(245,158,11,0.5)]"
                      transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    />
                  )}
                </Link>
              );
            })}

            {/* Cart Button */}
            <button
              onClick={() => setCartOpen(true)}
              className="relative flex flex-col items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-primary hover:bg-primary-hover text-white shadow-[0_4px_16px_rgba(156,107,58,0.4)] transition-transform active:scale-95 cursor-pointer"
              aria-label="Keranjang"
            >
              <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5" />
              {totalCartCount > 0 && (
                <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-[16px] h-[16px] sm:min-w-[18px] sm:h-[18px] px-1 text-[9px] sm:text-[10px] font-bold font-mono text-white bg-rose-500 rounded-full border border-surface-card shadow-md animate-bounce">
                  {totalCartCount}
                </span>
              )}
            </button>

            {/* Ecosystem / Staff Portal Switcher Dropdown Trigger */}
            {canAccessOperations && (
              <div className="relative">
                <button
                  onClick={() => setIsOpsMenuOpen(!isOpsMenuOpen)}
                  className="flex flex-col items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-full text-text-muted hover:text-text-primary hover:bg-surface-secondary transition-colors cursor-pointer"
                  title="Beralih Portal (Staff & Admin)"
                >
                  <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-accent-amber" />
                  <span className="text-[8px] sm:text-[9px] font-mono text-text-muted">Hub</span>
                </button>

                <AnimatePresence>
                  {isOpsMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9, y: 10 }}
                      animate={{ opacity: 1, scale: 1, y: -8 }}
                      exit={{ opacity: 0, scale: 0.9, y: 10 }}
                      className="absolute bottom-full right-0 mb-2 w-56 p-2 rounded-2xl bg-surface-card border border-border-subtle shadow-2xl backdrop-blur-xl text-xs space-y-1"
                    >
                      <div className="px-3 py-1.5 text-[11px] font-mono font-semibold text-text-muted uppercase tracking-wider border-b border-border-subtle">
                        Portal Ekosistem
                      </div>
                      <Link
                        href="/ops/pos"
                        onClick={() => setIsOpsMenuOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-text-primary hover:text-accent-amber hover:bg-surface-secondary transition-colors"
                      >
                        <LayoutGrid className="w-4 h-4 text-emerald-400" />
                        <div>
                          <div className="font-medium">Kasir POS Touch</div>
                          <div className="text-[10px] text-text-muted">Terminal Staf Kasir</div>
                        </div>
                      </Link>
                      <Link
                        href="/ops/kds"
                        onClick={() => setIsOpsMenuOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-text-primary hover:text-accent-amber hover:bg-surface-secondary transition-colors"
                      >
                        <MonitorCheck className="w-4 h-4 text-accent-amber" />
                        <div>
                          <div className="font-medium">Kitchen Display (KDS)</div>
                          <div className="text-[10px] text-text-muted">Barista Kanban & SLA</div>
                        </div>
                      </Link>
                      <Link
                        href="/ops/shift"
                        onClick={() => setIsOpsMenuOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-text-primary hover:text-accent-amber hover:bg-surface-secondary transition-colors"
                      >
                        <ShoppingBag className="w-4 h-4 text-sky-400" />
                        <div>
                          <div className="font-medium">Rekonsiliasi Shift</div>
                          <div className="text-[10px] text-text-muted">Cash Drawer & X/Z-Report</div>
                        </div>
                      </Link>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
