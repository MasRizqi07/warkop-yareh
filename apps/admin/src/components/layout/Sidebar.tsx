"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, ShoppingCart, Package, MapPin, 
  Users, BarChart3, Settings, Coffee, X,
  Receipt, MonitorPlay, Image as ImageIcon, FileText
} from "lucide-react";
import { BrandEmblem } from "@warkop-yareh/ui";

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();

  const navGroups = [
    {
      label: "Intelligence",
      items: [
        { icon: LayoutDashboard, label: "Overview", href: "/" },
        { icon: BarChart3, label: "Analytics & Telemetry", href: "/analytics" },
      ]
    },
    {
      label: "Outlet & Content",
      items: [
        { icon: MapPin,         label: "Branches & Schedules", href: "/branches" },
        { icon: Package,        label: "Products Catalog", href: "/products" },
        { icon: ImageIcon,      label: "Gallery Assets", href: "/gallery" },
        { icon: FileText,       label: "Site Content & Facts", href: "/site-content" },
      ]
    },
    {
      label: "Live Operations",
      items: [
        { icon: Coffee,         label: "POS Cashier", href: "/pos" },
        { icon: MonitorPlay,    label: "Kitchen Display (KDS)", href: "/kitchen" },
        { icon: Receipt,        label: "Shifts & Drawer", href: "/shifts" },
        { icon: ShoppingCart,   label: "Orders & Logs", href: "/orders" },
      ]
    },
    {
      label: "System",
      items: [
        { icon: Users,          label: "Staff Accounts", href: "/users" },
        { icon: Settings,       label: "Settings", href: "/settings" },
      ]
    }
  ];

  return (
    <aside className={`fixed left-0 top-0 z-50 flex h-screen w-64 flex-col border-r border-white/[0.08] bg-[#111114] transition-transform duration-300 ${isOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0`}>
      {/* Logo area */}
      <div className="p-5 border-b border-white/[0.08] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#9c6b3a] flex items-center justify-center text-white shadow-md">
            <BrandEmblem className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-heading font-extrabold text-base text-white tracking-tight flex items-center gap-1">
              Warkop<span className="text-[#f59e0b]">.</span>Ya&apos;reh
            </h1>
            <p className="font-mono text-[9px] uppercase tracking-widest text-[#f59e0b]">
              Backoffice & CMS
            </p>
          </div>
        </div>
        <button className="p-1 text-[#94a3b8] hover:text-white lg:hidden" onClick={onClose} aria-label="Close Sidebar">
          <X className="w-5 h-5" />
        </button>
      </div>
      
      {/* Navigation */}
      <nav className="flex-grow overflow-y-auto p-3 space-y-5 no-scrollbar">
        {navGroups.map((group, i) => (
          <div key={i}>
            <p className="mb-1.5 px-3 font-mono text-[10px] uppercase tracking-wider text-[#94a3b8]">
              {group.label}
            </p>
            <ul className="space-y-0.5">
              {group.items.map((item, j) => {
                const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
                const Icon = item.icon;
                return (
                  <li key={j}>
                    <Link
                      href={item.href}
                      onClick={onClose}
                      className={`flex items-center gap-3 rounded-lg px-3 py-2 text-xs font-medium transition-all ${
                        isActive
                          ? "bg-[#9c6b3a]/20 text-[#f59e0b] shadow-inner font-semibold border-l-2 border-[#f59e0b]"
                          : "text-[#94a3b8] hover:bg-white/[0.04] hover:text-white"
                      }`}
                    >
                      <Icon className={`w-4 h-4 ${isActive ? "text-[#f59e0b]" : "text-[#94a3b8]"}`} />
                      <span>{item.label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* Footer System Info */}
      <div className="p-4 border-t border-white/[0.08] bg-black/20">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[10px] font-mono text-[#94a3b8]">Surabaya 24 Jam • Reality Active</span>
        </div>
      </div>
    </aside>
  );
}
