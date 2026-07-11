"use client";

import React from "react";
import Image from "next/image";
import { Search, Bell, Mail, Menu } from "lucide-react";

interface HeaderProps {
  onMenuClick?: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
  return (
    <header className="sticky top-0 z-30 glass border-b border-[var(--border-subtle)] px-4 md:px-6 py-4 flex items-center justify-between">
      <div className="flex items-center gap-4 md:gap-6">
        <button 
          className="md:hidden p-1 text-[var(--text-secondary)] hover:text-[var(--text-primary)] focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] rounded-md"
          onClick={onMenuClick}
          aria-label="Open Sidebar"
        >
          <Menu className="w-6 h-6" />
        </button>
        <h2 className="font-heading text-lg font-bold text-[var(--text-primary)] hidden sm:block">
          Admin Terminal
        </h2>
        <div className="relative hidden sm:block flex-1 max-w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-tertiary)]" />
          <input
            className="bg-[var(--surface-tertiary)] border border-[var(--border-default)] rounded-full pl-10 pr-4 py-2 w-full text-xs text-[var(--text-primary)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] transition-all"
            placeholder="Search orders, roast levels, or members..."
            type="text"
          />
        </div>
      </div>

      <div className="flex items-center gap-6">
        <div className="flex items-center gap-4 text-[var(--text-secondary)]">
          <button className="relative hover:text-[var(--text-primary)] transition-colors focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] rounded-full p-1" aria-label="Notifications">
            <Bell className="w-5 h-5" />
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-[var(--error-500)] text-white rounded-full flex items-center justify-center font-mono text-[10px]">
              3
            </span>
          </button>
          <button className="hover:text-[var(--text-primary)] transition-colors focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] rounded-full p-1" aria-label="Messages">
            <Mail className="w-5 h-5" />
          </button>
        </div>
        
        <div className="h-8 w-px bg-[var(--border-default)]"></div>
        
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="font-bold text-xs text-[var(--text-primary)] leading-none">Ari Satria</p>
            <p className="text-[10px] text-[var(--text-tertiary)] mt-1 font-semibold uppercase tracking-wider">Master Barista</p>
          </div>
          <Image
            alt="Manager Avatar"
            className="w-10 h-10 rounded-full border border-[var(--border-brand)] object-cover"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuA9yNNVOIFOBxwhPWN91b8F7L2QUPEuBRTDNam0g0dO-y9CfdDmWY3-DuxK0fJuty0G4t2IGz6llBVSPnHi3AADbWjGGy3p0m6Lfiey9WMACypHKJHkL5TEl5n5clOzu3XnfT_kfsszRec51lkHhOMx9fW5g2erZdKch-mk803gupQ-33gLZ50O1zKk87VXACGsXRhcoPkS33WKRT8OSl5buHJCkpRH-7fWT9A3ZrcnU8yqsE008eTW5SfVEx-EZIK2mMWeu413yy0"
            width={40}
            height={40}
          />
        </div>
      </div>
    </header>
  );
}
