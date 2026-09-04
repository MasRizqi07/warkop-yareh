"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { NAV_LINKS } from "@/lib/constants";
import { useCartStore, useUIStore } from "@/stores";
import { BrandLogo } from "@warkop-yareh/ui";

export function Header() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const { itemCount, toggleCart } = useCartStore();
  const { isMobileMenuOpen, setMobileMenu } = useUIStore();
  const count = itemCount();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMobileMenu(false);
  }, [pathname, setMobileMenu]);

  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobileMenuOpen]);

  return (
    <header
      className={cn(
        "fixed top-0 w-full z-50 transition-all duration-300",
        scrolled
          ? "bg-[#0a0a0c]/90 backdrop-blur-xl border-b border-white/[0.08] shadow-[0_4px_24px_rgba(0,0,0,0.5)] py-2.5"
          : "bg-[#0a0a0c]/80 backdrop-blur-lg border-b border-white/[0.05] py-3.5"
      )}
    >
      <div className="h-14 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
        {/* Left: Brand Logo & Live Branch Indicator */}
        <div className="flex items-center gap-5">
          <Link href="/" className="group flex items-center">
            <BrandLogo size={36} />
          </Link>

          {/* Live Branch Indicator */}
          <div className="hidden xl:flex items-center gap-2 bg-[#111114]/80 border border-white/[0.08] px-3 py-1.5 rounded-xl">
            <span className="material-symbols-outlined text-[16px] text-[#f59e0b]">
              store
            </span>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="text-[12px] font-medium text-[#f8fafc]">
                  Darmo Flagship, SBY
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span className="font-mono text-[10px] text-emerald-400 font-semibold uppercase tracking-wider">
                  Open 24 Hours
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Center: Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-1.5" aria-label="Main navigation">
          {NAV_LINKS.map((link) => {
            const isActive =
              (link.href as string) === "/" ? pathname === "/" : pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "px-3.5 py-1.5 text-[14px] font-medium rounded-lg transition-all duration-200",
                  isActive
                    ? "text-[#f7bb82] font-semibold bg-[#18181c] border border-white/[0.08]"
                    : "text-[#d5c3b6] hover:text-[#f8fafc] hover:bg-white/[0.04]"
                )}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Right: Actions */}
        <div className="flex items-center gap-2.5">
          {/* Cart Icon with Live Badge */}
          <button
            onClick={toggleCart}
            className="relative p-2.5 rounded-xl bg-[#111114] border border-white/[0.08] text-[#d5c3b6] hover:text-[#f8fafc] hover:border-[#f59e0b]/40 transition-all flex items-center justify-center cursor-pointer"
            aria-label="Shopping Cart"
          >
            <span className="material-symbols-outlined text-[20px]">local_cafe</span>
            {count > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-[#f59e0b] text-[#0a0a0c] font-mono text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center shadow-[0_0_12px_rgba(245,158,11,0.6)]">
                {count > 9 ? "9+" : count}
              </span>
            )}
          </button>

          {/* Join Tier / Sign In CTA */}
          <Link
            href="/loyalty"
            className="hidden sm:flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-[#9c6b3a] to-[#ee9800] hover:from-[#b57d44] hover:to-[#f59e0b] text-[#f8fafc] font-semibold text-[13px] shadow-[0_4px_16px_-2px_rgba(245,158,11,0.25)] hover:shadow-[0_6px_24px_-2px_rgba(245,158,11,0.4)] transition-all"
          >
            <span className="material-symbols-outlined text-[16px]">verified</span>
            <span>Join Tier</span>
          </Link>

          {/* Account Profile Avatar */}
          <Link
            href="/account"
            className="w-9 h-9 rounded-xl bg-[#18181c] border border-white/[0.08] hover:border-[#f7bb82]/50 flex items-center justify-center text-[#f7bb82] transition-colors"
            aria-label="Account Portal"
          >
            <span className="material-symbols-outlined text-[18px]">person</span>
          </Link>

          {/* Mobile Hamburger Toggle */}
          <button
            onClick={() => setMobileMenu(!isMobileMenuOpen)}
            className="lg:hidden p-2 rounded-xl bg-[#111114] border border-white/[0.08] text-[#d5c3b6] hover:text-[#f8fafc] transition-colors"
            aria-label="Toggle menu"
            aria-expanded={isMobileMenuOpen}
          >
            <span className="material-symbols-outlined text-[22px]">
              {isMobileMenuOpen ? "close" : "menu"}
            </span>
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black/80 backdrop-blur-md z-40 lg:hidden"
              onClick={() => setMobileMenu(false)}
            />
            <motion.nav
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 bottom-0 w-[310px] bg-[#0e0e10] border-l border-white/[0.08] z-50 shadow-2xl lg:hidden overflow-y-auto p-6 flex flex-col justify-between"
              aria-label="Mobile navigation"
            >
              <div>
                <div className="flex items-center justify-between pb-6 border-b border-white/[0.08] mb-6">
                  <BrandLogo size={32} />
                  <button
                    onClick={() => setMobileMenu(false)}
                    className="p-1.5 rounded-lg bg-[#18181c] text-[#94a3b8] hover:text-[#f8fafc]"
                  >
                    <span className="material-symbols-outlined text-[20px]">close</span>
                  </button>
                </div>

                {/* Outlet Status */}
                <div className="flex items-center gap-2 bg-[#18181c] p-3 rounded-xl border border-white/[0.06] mb-6">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                  </span>
                  <div className="flex flex-col text-xs">
                    <span className="text-[#f8fafc] font-semibold">Darmo Flagship (SBY)</span>
                    <span className="text-emerald-400 font-mono text-[10px]">Open 24 Hours Active</span>
                  </div>
                </div>

                {/* Links */}
                <div className="flex flex-col gap-1.5">
                  {NAV_LINKS.map((link) => {
                    const isActive =
                      (link.href as string) === "/" ? pathname === "/" : pathname.startsWith(link.href);
                    return (
                      <Link
                        key={link.href}
                        href={link.href}
                        className={cn(
                          "flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-colors",
                          isActive
                            ? "bg-[#18181c] text-[#f7bb82] border border-[#f7bb82]/30"
                            : "text-[#d5c3b6] hover:bg-[#18181c]/60 hover:text-[#f8fafc]"
                        )}
                      >
                        <span>{link.label}</span>
                        <span className="material-symbols-outlined text-[16px] text-white/30">
                          chevron_right
                        </span>
                      </Link>
                    );
                  })}
                  <Link
                    href="/account"
                    className="flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium text-[#d5c3b6] hover:bg-[#18181c]/60 hover:text-[#f8fafc]"
                  >
                    <span>Account Sanctuary</span>
                    <span className="material-symbols-outlined text-[16px] text-white/30">
                      person
                    </span>
                  </Link>
                </div>
              </div>

              {/* Drawer Bottom Actions */}
              <div className="pt-6 border-t border-white/[0.08] space-y-3">
                <Link
                  href="/menu"
                  className="block w-full text-center py-3 rounded-xl bg-gradient-to-r from-[#9c6b3a] to-[#ee9800] text-[#f8fafc] font-bold text-sm shadow-lg shadow-[#f59e0b]/20"
                >
                  Order for Pickup / Table
                </Link>
                <Link
                  href="/booking"
                  className="block w-full text-center py-2.5 rounded-xl bg-[#18181c] border border-white/[0.08] text-[#d5c3b6] hover:text-[#f8fafc] text-xs font-semibold"
                >
                  Book Workspace / VIP
                </Link>
              </div>
            </motion.nav>
          </>
        )}
      </AnimatePresence>
    </header>
  );
}
