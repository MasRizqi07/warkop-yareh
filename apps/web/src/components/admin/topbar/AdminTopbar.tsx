'use client'

import { Bell, Mail, Search } from 'lucide-react'

export function AdminTopbar() {
  return (
    <header
      className="sticky top-0 z-10 h-16 flex items-center justify-between px-6
                 glass border-b border-[var(--border-default)]"
    >
      {/* Search */}
      <div className="relative w-72">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-tertiary)]" />
        <input
          type="text"
          placeholder="Search levels, events, or members..."
          className="w-full h-9 pl-9 pr-4 rounded-lg text-sm font-inter
                     bg-[var(--surface-tertiary)] border border-[var(--border-default)]
                     text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)]
                     focus:outline-none focus:border-[var(--border-focus)]
                     transition-colors duration-200"
        />
      </div>

      {/* Right actions */}
      <div className="flex items-center gap-4">
        <button className="relative w-9 h-9 rounded-lg flex items-center justify-center
                           bg-[var(--surface-tertiary)] border border-[var(--border-default)]
                           text-[var(--text-secondary)] hover:text-[var(--text-primary)]
                           hover:border-[var(--border-hover)] transition-colors duration-200">
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-[var(--error-500)]" />
        </button>

        <button className="w-9 h-9 rounded-lg flex items-center justify-center
                           bg-[var(--surface-tertiary)] border border-[var(--border-default)]
                           text-[var(--text-secondary)] hover:text-[var(--text-primary)]
                           hover:border-[var(--border-hover)] transition-colors duration-200">
          <Mail className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-3 pl-4 border-l border-[var(--border-default)]">
          <div className="text-right">
            <p className="text-sm font-plus-jakarta font-600 text-[var(--text-primary)] leading-none">
              Ari Satria
            </p>
            <p className="text-[11px] font-jetbrains text-[var(--text-brand)] mt-0.5 uppercase tracking-wider">
              Master Barista
            </p>
          </div>
          <div className="w-9 h-9 rounded-full bg-[var(--interactive-primary)] 
                          flex items-center justify-center font-plus-jakarta font-700 
                          text-sm text-[var(--primary-900)]">
            AS
          </div>
        </div>
      </div>
    </header>
  )
}
