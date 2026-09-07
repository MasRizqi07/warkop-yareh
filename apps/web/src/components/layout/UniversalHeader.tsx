'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  MapPin,
  ChevronDown,
  ShoppingBag,
  Award,
  CheckCircle2,
} from 'lucide-react';
import { useActiveBranch } from '@/features/catalog/catalog.hooks';
import { useAuthStore } from '@/stores/auth.store';
import { useBranchStore, useCartStore } from '@/stores';

export function UniversalHeader() {
  const pathname = usePathname();
  const { data: branches = [], activeBranch } = useActiveBranch();
  const activeBranchId = useBranchStore((state) => state.activeBranchId);
  const setActiveBranchId = useBranchStore((state) => state.setActiveBranchId);
  const cartItems = useCartStore((state) => state.items);
  const setCartOpen = useCartStore((state) => state.setCartOpen);
  const clearCart = useCartStore((state) => state.clearCart);
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  const [isBranchDropdownOpen, setIsBranchDropdownOpen] = useState(false);
  const totalCartCount = cartItems.reduce(
    (acc, item) => acc + item.quantity,
    0
  );
  const canAccessOperations = Boolean(
    user &&
    [
      'STAFF',
      'CASHIER',
      'KITCHEN',
      'MANAGER',
      'ADMIN',
      'OWNER',
      'SUPERADMIN',
    ].includes(user.role)
  );

  // Hide on dedicated full-screen staff terminals
  if (pathname.startsWith('/ops/pos') || pathname.startsWith('/ops/kds')) {
    return null;
  }

  const navLinks = [
    { href: '/menu', label: 'Menu' },
    { href: '/booking', label: 'Reservasi' },
    { href: '/community', label: 'Komunitas' },
    { href: '/loyalty', label: 'Rewards' },
    { href: '/#locations', label: 'Cabang' },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border-subtle bg-canvas-obsidian/85 backdrop-blur-xl transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Left: Brand + Branch Selector */}
        <div className="flex items-center gap-4">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-accent-amber to-brand-coffee shadow-[var(--shadow-glow-gold)] transition-transform group-hover:scale-105">
              <span className="font-heading text-xl font-black tracking-tighter text-on-primary-container">
                Y
              </span>
            </div>
            <div>
              <div className="font-heading text-base font-bold uppercase leading-none tracking-wider text-text-primary">
                Warkop Ya&apos;reh
              </div>
              <div className="font-mono text-[10px] uppercase tracking-widest text-accent-amber">
                Surabaya Roastery
              </div>
            </div>
          </Link>

          {/* Branch Selector Dropdown */}
          <div className="relative hidden lg:block">
            <button
              onClick={() => setIsBranchDropdownOpen(!isBranchDropdownOpen)}
              className="flex items-center gap-2 rounded-full border border-border-subtle bg-surface-card px-3 py-1.5 text-xs text-on-surface-variant transition-colors hover:border-primary/40"
            >
              <span className="h-2 w-2 animate-pulse rounded-full bg-[var(--green-500)]" />
              <MapPin className="h-3.5 w-3.5 text-accent-amber" />
              <span className="max-w-40 truncate font-medium text-text-primary">
                {activeBranch?.name ?? 'Pilih cabang'}
              </span>
              <ChevronDown className="h-3 w-3 text-text-muted" />
            </button>

            {isBranchDropdownOpen && (
              <div className="animate-in fade-in slide-in-from-top-2 absolute left-0 top-full z-50 mt-2 w-72 rounded-2xl border border-border-subtle bg-surface-card p-2 shadow-2xl backdrop-blur-2xl">
                <div className="px-3 py-1.5 font-mono text-[11px] uppercase tracking-wider text-text-muted">
                  Pilih Cabang Surabaya
                </div>
                {branches.map((b) => (
                  <button
                    key={b.id}
                    onClick={() => {
                      if (b.id !== activeBranchId) clearCart();
                      setActiveBranchId(b.id);
                      setIsBranchDropdownOpen(false);
                    }}
                    className={`w-full text-left p-2.5 rounded-xl flex items-start gap-3 transition-colors ${
                      b.id === activeBranchId
                        ? 'border border-accent-amber/30 bg-accent-amber/10'
                        : 'hover:bg-surface-container-high/50'
                    }`}
                  >
                    <div className="mt-0.5">
                      {b.id === activeBranchId ? (
                        <CheckCircle2 className="h-4 w-4 text-accent-amber" />
                      ) : (
                        <MapPin className="h-4 w-4 text-text-muted" />
                      )}
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-text-primary">
                        {b.name}
                      </div>
                      <div className="line-clamp-1 text-[10px] text-text-muted">
                        {b.address}
                      </div>
                      <div className="mt-1 flex items-center gap-2 font-mono text-[10px] text-text-muted">
                        <span className="text-[var(--green-500)]">
                          {b.weekdayHours}
                        </span>
                        <span>•</span>
                        <span>{b.city}</span>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Desktop Customer Nav Links */}
        <nav className="hidden items-center gap-1 xl:flex">
          {navLinks.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-colors ${
                  isActive
                    ? 'bg-accent-amber/10 font-semibold text-accent-amber'
                    : 'text-text-muted hover:bg-surface-container-high/50 hover:text-text-primary'
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Center: Quick Portal Switcher Pills */}
        {canAccessOperations && (
          <div className="hidden items-center gap-1 rounded-full border border-border-subtle bg-surface-secondary p-1 text-xs font-medium xl:flex">
            <Link
              href="/"
              className={`px-3 py-1 rounded-full transition-colors ${
                !pathname.startsWith('/ops')
                  ? 'bg-primary-container text-on-primary-container'
                  : 'text-text-muted hover:text-text-primary'
              }`}
            >
              Customer
            </Link>
            <Link
              href="/ops/pos"
              className={`px-3 py-1 rounded-full transition-colors ${
                pathname.startsWith('/ops/pos')
                  ? 'bg-[var(--green-500)] text-on-primary'
                  : 'text-text-muted hover:text-text-primary'
              }`}
            >
              POS Kasir
            </Link>
            <Link
              href="/ops/kds"
              className={`px-3 py-1 rounded-full transition-colors ${
                pathname.startsWith('/ops/kds')
                  ? 'bg-accent-amber text-on-secondary'
                  : 'text-text-muted hover:text-text-primary'
              }`}
            >
              Kitchen KDS
            </Link>
          </div>
        )}

        {/* Right: Loyalty Status + Cart Button + Profile */}
        <div className="flex items-center gap-3">
          {/* Loyalty Tier Pill */}
          {isAuthenticated && user && (
            <Link
              href="/loyalty"
              className="hidden items-center gap-2 rounded-full border border-tertiary/20 bg-tertiary/10 px-3 py-1.5 text-xs text-tertiary transition-colors hover:border-tertiary/40 sm:flex"
            >
              <Award className="h-3.5 w-3.5 text-accent-amber" />
              <span className="font-semibold text-text-primary">
                {user.membershipTier}
              </span>
              <span className="font-mono text-[11px] text-accent-amber">
                {user.loyaltyPoints} pts
              </span>
            </Link>
          )}

          {/* Cart Trigger */}
          <button
            onClick={() => setCartOpen(true)}
            className="relative rounded-xl border border-border-subtle bg-surface-card p-2 text-on-surface transition-colors hover:border-outline-variant"
            aria-label="Keranjang Belanja"
          >
            <ShoppingBag className="h-5 w-5 text-on-surface-variant" />
            {totalCartCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-accent-amber px-1 font-mono text-[10px] font-bold text-on-secondary shadow-md">
                {totalCartCount}
              </span>
            )}
          </button>

          {/* Profile Avatar */}
          {isAuthenticated && user ? (
            <Link
              href="/profile"
              aria-label="Buka profil"
              className="group flex items-center gap-2 pl-1"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-full border border-border-subtle bg-primary-container/20 text-xs font-bold text-accent-amber transition-colors group-hover:border-accent-amber">
                {user.name.slice(0, 1).toUpperCase()}
              </span>
            </Link>
          ) : (
            <Link
              href="/login"
              className="rounded-xl border border-border-subtle px-3 py-2 text-xs font-semibold text-on-surface hover:border-accent-amber/40"
            >
              Masuk
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
