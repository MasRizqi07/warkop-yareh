"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, ShoppingCart, Package, CalendarCheck, MapPin, 
  Users, CalendarDays, MessageSquare, Star, BarChart3, Settings, Coffee, X
} from "lucide-react";

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();

  const navGroups = [
    {
      label: "Overview",
      items: [
        { icon: LayoutDashboard, label: "Dashboard", href: "/" },
      ]
    },
    {
      label: "Operations",
      items: [
        { icon: ShoppingCart,   label: "Orders",       href: "/orders" },
        { icon: Package,        label: "Products",     href: "/products" },
        { icon: CalendarCheck,  label: "Reservations", href: "/reservations" },
        { icon: MapPin,         label: "Branches",     href: "/branches" },
      ]
    },
    {
      label: "Community",
      items: [
        { icon: Users,          label: "Users",        href: "/users" },
        { icon: CalendarDays,   label: "Events",       href: "/events" },
        { icon: MessageSquare,  label: "Community",    href: "/community" },
      ]
    },
    {
      label: "Growth",
      items: [
        { icon: Star,           label: "Loyalty",      href: "/loyalty" },
        { icon: BarChart3,      label: "Analytics",    href: "/analytics" },
      ]
    },
    {
      label: "System",
      items: [
        { icon: Settings,       label: "Settings",     href: "/settings" },
      ]
    }
  ];

  return (
    <aside className={`fixed left-0 top-0 h-screen w-64 bg-[var(--surface-secondary)] dark:bg-[var(--surface-secondary)] border-r border-[var(--border-default)] flex flex-col z-50 transition-transform duration-300 ${isOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0`}>
      {/* Logo area */}
      <div className="p-6 border-b border-[var(--border-default)] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[var(--color-primary)] flex items-center justify-center text-white">
            <Coffee className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-heading font-extrabold text-xl text-[var(--text-primary)] tracking-tight">
              Warkop<span className="text-[var(--interactive-primary)]">.</span>Ya&apos;reh
            </h1>
            <p className="font-mono text-[10px] uppercase tracking-widest text-[var(--text-tertiary)]">
              Admin Terminal
            </p>
          </div>
        </div>
        <button className="md:hidden p-1 text-[var(--text-secondary)] hover:text-[var(--text-primary)]" onClick={onClose} aria-label="Close Sidebar">
          <X className="w-5 h-5" />
        </button>
      </div>
      
      {/* Navigation */}
      <nav className="flex-grow overflow-y-auto p-4 space-y-6 no-scrollbar">
        {navGroups.map((group, i) => (
          <div key={i}>
            <p className="px-3 mb-2 text-xs font-semibold uppercase tracking-wider text-[var(--text-tertiary)]">
              {group.label}
            </p>
            <ul className="space-y-1">
              {group.items.map((item, j) => {
                const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
                const Icon = item.icon;
                return (
                  <li key={j}>
                    <Link 
                      href={item.href}
                      className={`flex items-center gap-3 px-3 py-2 rounded-r-lg rounded-l-sm border-l-4 text-sm font-medium transition-all ${
                        isActive 
                          ? "border-[var(--interactive-primary)] bg-[var(--interactive-primary)]/10 text-[var(--interactive-primary)]" 
                          : "border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-tertiary)]"
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>
      
      {/* Footer / Brew Report */}
      <div className="p-4 border-t border-[var(--border-default)]">
        <button
          onClick={() => alert("Generating reports...")}
          className="w-full bg-[var(--interactive-primary)] text-white hover:bg-[var(--interactive-primary-hover)] font-bold py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 transition-all text-xs uppercase tracking-wider active:scale-95 pulse-glow"
        >
          <Coffee className="w-4 h-4" />
          Brew Report
        </button>
        <div className="flex items-center gap-2 mt-4 px-2 text-[var(--success-500)] text-[10px]">
          <div className="w-1.5 h-1.5 rounded-full bg-[var(--success-500)] animate-pulse"></div>
          <span className="font-mono uppercase">Roasters Online</span>
        </div>
      </div>
    </aside>
  );
}
