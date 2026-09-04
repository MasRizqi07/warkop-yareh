"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  MapPin,
  Wifi,
  ChevronDown,
  ShoppingBag,
  Award,
  CheckCircle2,
} from "lucide-react";
import { useAppStore } from "@/store/useAppStore";

export function UniversalHeader() {
  const pathname = usePathname();
  const {
    branches,
    activeBranchId,
    setActiveBranch,
    getActiveBranch,
    cartItems,
    setCartDrawerOpen,
    user,
  } = useAppStore();

  const [isBranchDropdownOpen, setIsBranchDropdownOpen] = useState(false);
  const activeBranch = getActiveBranch();
  const totalCartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  // Hide on dedicated full-screen staff terminals
  if (pathname.startsWith("/ops/pos") || pathname.startsWith("/ops/kds")) {
    return null;
  }

  const navLinks = [
    { href: "/menu", label: "Menu" },
    { href: "/reservations", label: "Reservasi" },
    { href: "/community", label: "Komunitas" },
    { href: "/loyalty", label: "Rewards" },
    { href: "/#locations", label: "Cabang" },
  ];

  return (
    <header className="sticky top-0 z-40 w-full bg-[#0a0a0c]/85 backdrop-blur-xl border-b border-white/5 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Left: Brand + Branch Selector */}
        <div className="flex items-center gap-4">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#f59e0b] to-[#9c6b3a] flex items-center justify-center shadow-[0_0_15px_rgba(245,158,11,0.3)] transition-transform group-hover:scale-105">
              <span className="font-heading font-black text-white text-xl tracking-tighter">Y</span>
            </div>
            <div>
              <div className="font-heading font-bold text-base text-white tracking-wider uppercase leading-none">
                Warkop Ya&apos;reh
              </div>
              <div className="text-[10px] font-mono text-[#f59e0b] tracking-widest uppercase">
                Surabaya Roastery
              </div>
            </div>
          </Link>

          {/* Branch Selector Dropdown */}
          <div className="relative hidden md:block">
            <button
              onClick={() => setIsBranchDropdownOpen(!isBranchDropdownOpen)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#18181c] border border-white/10 hover:border-[#f59e0b]/40 text-xs text-neutral-300 transition-colors"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <MapPin className="w-3.5 h-3.5 text-[#f59e0b]" />
              <span className="font-medium text-white">{activeBranch.name}</span>
              <ChevronDown className="w-3 h-3 text-neutral-400" />
            </button>

            {isBranchDropdownOpen && (
              <div className="absolute top-full left-0 mt-2 w-72 p-2 rounded-2xl bg-[#18181c] border border-white/10 shadow-2xl backdrop-blur-2xl z-50 animate-in fade-in slide-in-from-top-2">
                <div className="px-3 py-1.5 text-[11px] font-mono text-neutral-400 uppercase tracking-wider">
                  Pilih Cabang Surabaya
                </div>
                {branches.map((b) => (
                  <button
                    key={b.id}
                    onClick={() => {
                      setActiveBranch(b.id);
                      setIsBranchDropdownOpen(false);
                    }}
                    className={`w-full text-left p-2.5 rounded-xl flex items-start gap-3 transition-colors ${
                      b.id === activeBranchId
                        ? "bg-[#f59e0b]/10 border border-[#f59e0b]/30"
                        : "hover:bg-white/5"
                    }`}
                  >
                    <div className="mt-0.5">
                      {b.id === activeBranchId ? (
                        <CheckCircle2 className="w-4 h-4 text-[#f59e0b]" />
                      ) : (
                        <MapPin className="w-4 h-4 text-neutral-500" />
                      )}
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-white">{b.name}</div>
                      <div className="text-[10px] text-neutral-400 line-clamp-1">{b.address}</div>
                      <div className="flex items-center gap-2 mt-1 text-[10px] font-mono text-neutral-400">
                        <span className="text-emerald-400">{b.hours}</span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Wifi className="w-3 h-3 text-[#f59e0b]" /> {b.wifiName}
                        </span>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Desktop Customer Nav Links */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-colors ${
                  isActive
                    ? "text-[#f59e0b] bg-[#f59e0b]/10 font-semibold"
                    : "text-neutral-400 hover:text-white hover:bg-white/5"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Center: Quick Portal Switcher Pills */}
        <div className="hidden xl:flex items-center gap-1 p-1 rounded-full bg-[#111114] border border-white/5 text-xs font-medium">
          <Link
            href="/"
            className={`px-3 py-1 rounded-full transition-colors ${
              !pathname.startsWith("/ops") && !pathname.startsWith("/admin")
                ? "bg-[#9c6b3a] text-white"
                : "text-neutral-400 hover:text-white"
            }`}
          >
            Customer
          </Link>
          <Link
            href="/ops/pos"
            className={`px-3 py-1 rounded-full transition-colors ${
              pathname.startsWith("/ops/pos")
                ? "bg-emerald-600 text-white"
                : "text-neutral-400 hover:text-white"
            }`}
          >
            POS Kasir
          </Link>
          <Link
            href="/ops/kds"
            className={`px-3 py-1 rounded-full transition-colors ${
              pathname.startsWith("/ops/kds")
                ? "bg-amber-600 text-white"
                : "text-neutral-400 hover:text-white"
            }`}
          >
            Kitchen KDS
          </Link>
          <Link
            href="/admin"
            className={`px-3 py-1 rounded-full transition-colors ${
              pathname.startsWith("/admin")
                ? "bg-purple-600 text-white"
                : "text-neutral-400 hover:text-white"
            }`}
          >
            Enterprise
          </Link>
        </div>

        {/* Right: Loyalty Status + Cart Button + Profile */}
        <div className="flex items-center gap-3">
          {/* Loyalty Tier Pill */}
          <Link
            href="/loyalty"
            className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-amber-500/10 to-amber-700/10 border border-amber-500/20 text-xs text-amber-200 hover:border-amber-500/40 transition-colors"
          >
            <Award className="w-3.5 h-3.5 text-[#f59e0b]" />
            <span className="font-semibold text-white">{user.tier}</span>
            <span className="font-mono text-[11px] text-[#f59e0b]">{user.points} pts</span>
          </Link>

          {/* Cart Trigger */}
          <button
            onClick={() => setCartDrawerOpen(true)}
            className="relative p-2 rounded-xl bg-[#18181c] border border-white/10 hover:border-white/20 text-neutral-200 transition-colors"
            aria-label="Keranjang Belanja"
          >
            <ShoppingBag className="w-5 h-5 text-neutral-300" />
            {totalCartCount > 0 && (
              <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-bold font-mono text-white bg-[#f59e0b] rounded-full shadow-md">
                {totalCartCount}
              </span>
            )}
          </button>

          {/* Profile Avatar */}
          <Link href="/profile" className="flex items-center gap-2 pl-1 group">
            <div className="relative w-8 h-8 rounded-full overflow-hidden border border-white/10 group-hover:border-[#f59e0b] transition-colors">
              <Image
                src={user.avatar}
                alt={user.name}
                fill
                className="object-cover"
                sizes="32px"
              />
            </div>
          </Link>
        </div>
      </div>
    </header>
  );
}
