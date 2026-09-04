"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, ShoppingCart, Package, CalendarCheck, MapPin, 
  Users, CalendarDays, MessageSquare, Star, BarChart3, Settings, Coffee, X,
  Boxes, Receipt, Send, UserCheck, MonitorPlay
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
      label: "Operations",
      items: [
        { icon: ShoppingCart,   label: "Orders", href: "/orders" },
        { icon: Package,        label: "Products Catalog", href: "/products" },
        { icon: Boxes,          label: "Inventory & Silos", href: "/inventory" },
        { icon: Receipt,        label: "Shifts & Drawer", href: "/shifts" },
        { icon: CalendarCheck,  label: "Reservations", href: "/reservations" },
        { icon: MapPin,         label: "Branches & Pricing", href: "/branches" },
      ]
    },
    {
      label: "Patron Growth",
      items: [
        { icon: UserCheck,      label: "Patron CRM", href: "/crm" },
        { icon: Send,           label: "WhatsApp Studio", href: "/marketing" },
        { icon: Star,           label: "Loyalty Tier", href: "/loyalty" },
        { icon: MessageSquare,  label: "Community Hub", href: "/community" },
        { icon: CalendarDays,   label: "Events & Meetups", href: "/events" },
        { icon: Users,          label: "User Accounts", href: "/users" },
      ]
    },
    {
      label: "Live Terminals",
      items: [
        { icon: Coffee,         label: "POS Cashier", href: "/pos" },
        { icon: MonitorPlay,    label: "Kitchen Display (KDS)", href: "/kitchen" },
      ]
    },
    {
      label: "System",
      items: [
        { icon: Settings,       label: "Settings", href: "/settings" },
      ]
    }
  ];

  return (
    <aside className={`fixed left-0 top-0 h-screen w-64 bg-[#111114] border-r border-white/[0.08] flex flex-col z-50 transition-transform duration-300 ${isOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0`}>
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
              Enterprise Admin
            </p>
          </div>
        </div>
        <button className="md:hidden p-1 text-[#94a3b8] hover:text-white" onClick={onClose} aria-label="Close Sidebar">
          <X className="w-5 h-5" />
        </button>
      </div>
      
      {/* Navigation */}
      <nav className="flex-grow overflow-y-auto p-3 space-y-5 no-scrollbar">
        {navGroups.map((group, i) => (
          <div key={i}>
            <p className="px-3 mb-1.5 text-[10px] font-mono uppercase tracking-wider text-[#94a3b8]/70">
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
                      className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                        isActive 
                          ? "bg-[#201f21] text-[#f59e0b] shadow-sm border border-white/[0.08]" 
                          : "text-[#94a3b8] hover:text-white hover:bg-white/[0.04]"
                      }`}
                    >
                      <Icon className={`w-4 h-4 ${isActive ? "text-[#f59e0b]" : "text-[#94a3b8]"}`} />
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>
      
      {/* Footer */}
      <div className="p-4 border-t border-white/[0.08] space-y-2">
        <div className="flex items-center justify-between text-[10px] font-mono text-[#94a3b8]">
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-emerald-400">Nodes Online</span>
          </span>
          <span>v4.2.1-prod</span>
        </div>
      </div>
    </aside>
  );
}
