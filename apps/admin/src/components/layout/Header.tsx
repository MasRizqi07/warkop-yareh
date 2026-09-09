"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Menu, LogOut } from "lucide-react";
import { adminLogout } from "@/lib/api";
import { getAdminProfile } from "@/lib/operations-api";
import { useAsyncResource } from "@/components/management/page-kit";

interface HeaderProps {
  onMenuClick?: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const profile = useAsyncResource(getAdminProfile);
  const initials = (profile.data?.name ?? 'Admin')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');

  async function handleLogout() {
    setIsLoggingOut(true);
    try {
      await adminLogout();
    } finally {
      router.replace("/login");
      router.refresh();
    }
  }

  return (
    <header className="sticky top-0 z-30 flex min-w-0 items-center justify-between border-b border-[var(--border-subtle)] px-4 py-4 glass md:px-6">
      <div className="flex min-w-0 items-center gap-4 lg:gap-6">
        <button 
          className="rounded-md p-1 text-[var(--text-secondary)] hover:text-[var(--text-primary)] focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] lg:hidden"
          onClick={onMenuClick}
          aria-label="Open Sidebar"
        >
          <Menu className="w-6 h-6" />
        </button>
        <h2 className="font-heading text-lg font-bold text-[var(--text-primary)] hidden sm:block">
          Admin Terminal
        </h2>
      </div>

      <div className="flex shrink-0 items-center gap-3 sm:gap-4 lg:gap-6">
        <div className="flex items-center gap-2 text-[var(--text-secondary)] sm:gap-4">
          <button
            aria-label="Sign out"
            className="rounded-full p-1 transition-colors hover:text-[var(--error-500)] focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] disabled:opacity-50"
            disabled={isLoggingOut}
            onClick={handleLogout}
          >
            <LogOut className="h-5 w-5" />
          </button>
        </div>
        
        <div className="hidden h-8 w-px bg-[var(--border-default)] sm:block"></div>
        
        <div className="flex items-center gap-3">
          <div className="hidden text-right sm:block">
            <p className="font-bold text-xs text-[var(--text-primary)] leading-none">{profile.loading ? 'Memuat profil…' : profile.data?.name ?? 'Profil tidak tersedia'}</p>
            <p className="mt-1 text-[10px] font-semibold uppercase tracking-wider text-[var(--text-secondary)]">{profile.data?.role ?? (profile.error ? 'API error' : 'Admin')}</p>
          </div>
          <div title={profile.error ?? profile.data?.email ?? 'Profil admin'} className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[var(--border-brand)] bg-[var(--surface-tertiary)] font-mono text-xs font-bold text-[var(--color-primary)]">{initials || 'A'}</div>
        </div>
      </div>
    </header>
  );
}
