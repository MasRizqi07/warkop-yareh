'use client'

import { LayoutDashboard, Users, CalendarDays, BarChart3, Settings, Coffee } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const navItems = [
  { label: 'Dashboard',  href: '/dashboard',  icon: LayoutDashboard },
  { label: 'Users',      href: '/users',      icon: Users },
  { label: 'Events',     href: '/events',     icon: CalendarDays },
  { label: 'Analytics',  href: '/analytics',  icon: BarChart3 },
  { label: 'Settings',   href: '/settings',   icon: Settings },
]

export function AdminSidebar() {
  const pathname = usePathname()

  return (
    <aside
      className="sticky top-0 h-screen flex flex-col
                 bg-[var(--surface-secondary)] border-r border-[var(--border-default)]
                 overflow-y-auto"
    >
      {/* Brand */}
      <div className="px-6 py-5 border-b border-[var(--border-default)]">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[var(--interactive-primary)] 
                          flex items-center justify-center">
            <Coffee className="w-4 h-4 text-[var(--primary-900)]" />
          </div>
          <div>
            <p className="font-plus-jakarta font-700 text-sm text-[var(--text-primary)] leading-none">
              Warkop Ya&apos;reh
            </p>
            <p className="text-[10px] font-inter text-[var(--text-tertiary)] mt-0.5 uppercase tracking-widest">
              Admin Terminal
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map(({ label, href, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + '/')
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm
                         font-inter transition-all duration-[250ms] [transition-timing-function:cubic-bezier(0.22,1,0.36,1)]
                         ${active
                           ? 'bg-[var(--interactive-primary)]/15 text-[var(--text-brand)] font-medium'
                           : 'text-[var(--text-secondary)] hover:bg-[var(--surface-tertiary)] hover:text-[var(--text-primary)]'
                         }`}
            >
              <Icon className={`w-4 h-4 flex-shrink-0 ${active ? 'text-[var(--text-brand)]' : ''}`} />
              {label}
              {active && (
                <span className="ml-auto w-1.5 h-1.5 rounded-full bg-[var(--interactive-primary)]" />
              )}
            </Link>
          )
        })}
      </nav>

      {/* Bottom status */}
      <div className="px-4 py-4 border-t border-[var(--border-default)]">
        <div className="flex items-center gap-2.5 px-3 py-2 rounded-lg 
                        bg-[var(--surface-tertiary)] cursor-pointer">
          <Coffee className="w-4 h-4 text-[var(--text-tertiary)]" />
          <span className="text-xs font-inter text-[var(--text-tertiary)]">Brew Report</span>
          <span className="ml-auto flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--success-500)] animate-pulse" />
            <span className="text-[10px] text-[var(--success-500)] font-jetbrains uppercase tracking-wider">
              Online
            </span>
          </span>
        </div>
      </div>
    </aside>
  )
}
