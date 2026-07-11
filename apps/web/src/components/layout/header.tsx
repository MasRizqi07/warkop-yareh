"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { NAV_LINKS } from "@/lib/constants";
import { useThemeStore, useCartStore, useUIStore } from "@/stores";
import { SPRING } from "@/lib/animations";
import {
  IconLightMode,
  IconDarkMode,
  IconCart,
  IconClose,
  IconChevronRight,
  IconCoffee,
} from "@/lib/icons";

export function Header() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const { isDark, toggle: toggleTheme } = useThemeStore();
  const { itemCount, toggleCart } = useCartStore();
  const { isMobileMenuOpen, setMobileMenu } = useUIStore();
  const count = itemCount();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
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
    return () => { document.body.style.overflow = ""; };
  }, [isMobileMenuOpen]);

  return (
    <header
      className={cn(
        "fixed top-0 w-full z-50 transition-all",
        scrolled
          ? "py-2 bg-[var(--surface-nav)] backdrop-blur-xl border-b border-[var(--surface-border)] shadow-lg"
          : "py-4 bg-transparent border-b border-transparent"
      )}
      style={{ transitionDuration: "300ms", transitionTimingFunction: "cubic-bezier(0.22, 1, 0.36, 1)" }}
    >
      <div className="flex justify-between items-center px-4 sm:px-6 lg:px-8 w-full max-w-[var(--container-2xl)] mx-auto">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[var(--color-primary-500)] to-[var(--color-primary-700)] flex items-center justify-center shadow-md group-hover:shadow-[var(--shadow-glow-soft)] transition-shadow duration-300">
            <IconCoffee size={18} className="text-white" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-bold tracking-tight text-[var(--text-primary)] leading-none">
              WARKOP
            </span>
            <span className="text-[9px] font-semibold tracking-[0.2em] text-[var(--text-brand)] leading-none mt-0.5">
              YA&apos;REH
            </span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-1" aria-label="Main navigation">
          {NAV_LINKS.map((link) => {
            const isActive = link.href === "/" ? pathname === "/" : pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "relative px-4 py-2 text-sm font-medium rounded-lg transition-colors duration-200",
                  isActive
                    ? "text-[var(--text-brand)]"
                    : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                )}
              >
                {link.label}
                {isActive && (
                  <motion.div
                    layoutId="nav-indicator"
                    className="absolute bottom-0 left-2 right-2 h-0.5 rounded-full bg-[var(--text-brand)]"
                    transition={SPRING.snappy}
                  />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-1">
          {/* Theme Toggle */}
          <button
            onClick={() => {
              document.documentElement.classList.add("transitioning");
              toggleTheme();
              setTimeout(() => document.documentElement.classList.remove("transitioning"), 350);
            }}
            className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-[var(--interactive-secondary)] transition-colors duration-200"
            aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
          >
            <AnimatePresence mode="wait" initial={false}>
              {isDark ? (
                <motion.span
                  key="sun"
                  initial={{ rotate: -90, scale: 0.5, opacity: 0 }}
                  animate={{ rotate: 0, scale: 1, opacity: 1 }}
                  exit={{ rotate: 90, scale: 0.5, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="flex items-center justify-center text-[var(--text-secondary)]"
                >
                  <IconLightMode size={20} />
                </motion.span>
              ) : (
                <motion.span
                  key="moon"
                  initial={{ rotate: 90, scale: 0.5, opacity: 0 }}
                  animate={{ rotate: 0, scale: 1, opacity: 1 }}
                  exit={{ rotate: -90, scale: 0.5, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="flex items-center justify-center text-[var(--text-secondary)]"
                >
                  <IconDarkMode size={20} />
                </motion.span>
              )}
            </AnimatePresence>
          </button>

          {/* Cart */}
          <button
            onClick={toggleCart}
            className="relative w-10 h-10 flex items-center justify-center rounded-xl hover:bg-[var(--interactive-secondary)] transition-colors duration-200"
            aria-label="Shopping Cart"
          >
            <IconCart size={20} className="text-[var(--text-secondary)]" />
            {count > 0 && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={SPRING.bouncy}
                className="absolute top-1 right-1 w-4 h-4 bg-[var(--color-primary-500)] text-white text-[10px] font-bold rounded-full flex items-center justify-center"
              >
                {count > 9 ? "9+" : count}
              </motion.span>
            )}
          </button>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenu(!isMobileMenuOpen)}
            className="lg:hidden w-10 h-10 flex items-center justify-center rounded-xl hover:bg-[var(--interactive-secondary)] transition-colors duration-200"
            aria-label="Toggle menu"
            aria-expanded={isMobileMenuOpen}
          >
            <div className="relative w-5 h-4 flex flex-col justify-between">
              <motion.span
                animate={isMobileMenuOpen ? { rotate: 45, y: 7 } : { rotate: 0, y: 0 }}
                transition={{ duration: 0.2 }}
                className="block w-full h-0.5 bg-[var(--text-secondary)] rounded-full origin-center"
              />
              <motion.span
                animate={isMobileMenuOpen ? { opacity: 0, scaleX: 0 } : { opacity: 1, scaleX: 1 }}
                transition={{ duration: 0.15 }}
                className="block w-full h-0.5 bg-[var(--text-secondary)] rounded-full"
              />
              <motion.span
                animate={isMobileMenuOpen ? { rotate: -45, y: -7 } : { rotate: 0, y: 0 }}
                transition={{ duration: 0.2 }}
                className="block w-full h-0.5 bg-[var(--text-secondary)] rounded-full origin-center"
              />
            </div>
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
              onClick={() => setMobileMenu(false)}
            />
            <motion.nav
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={SPRING.gentle}
              className="fixed top-0 right-0 bottom-0 w-[300px] bg-[var(--surface-raised)] z-50 shadow-2xl lg:hidden overflow-y-auto"
              aria-label="Mobile navigation"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-10">
                  <span className="text-lg font-bold text-[var(--text-primary)]">
                    Menu
                  </span>
                  <button
                    onClick={() => setMobileMenu(false)}
                    className="p-2 rounded-xl hover:bg-[var(--interactive-secondary)] text-[var(--text-secondary)]"
                    aria-label="Close menu"
                  >
                    <IconClose size={20} />
                  </button>
                </div>
                <div className="flex flex-col gap-1">
                  {NAV_LINKS.map((link, i) => {
                    const isActive = link.href === "/" ? pathname === "/" : pathname.startsWith(link.href);
                    return (
                      <motion.div
                        key={link.href}
                        initial={{ opacity: 0, x: 24 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.05, ...SPRING.gentle }}
                      >
                        <Link
                          href={link.href}
                          className={cn(
                            "flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-colors",
                            isActive
                              ? "bg-[var(--color-primary-500)]/10 text-[var(--text-brand)]"
                              : "text-[var(--text-secondary)] hover:bg-[var(--interactive-secondary)] hover:text-[var(--text-primary)]"
                          )}
                        >
                          {link.label}
                          <IconChevronRight size={16} className="opacity-30" />
                        </Link>
                      </motion.div>
                    );
                  })}
                </div>

                {/* Mobile CTA */}
                <div className="mt-8 pt-6 border-t border-[var(--border-default)]">
                  <Link href="/menu">
                    <button className="w-full py-3 px-6 rounded-full bg-gradient-to-r from-[var(--color-primary-500)] to-[var(--color-primary-600)] text-white text-sm font-semibold shadow-lg shadow-[var(--color-primary-500)]/20 hover:shadow-[var(--shadow-glow-primary)] transition-shadow duration-300">
                      Pesan Sekarang
                    </button>
                  </Link>
                </div>
              </div>
            </motion.nav>
          </>
        )}
      </AnimatePresence>
    </header>
  );
}
