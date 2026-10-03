"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FileText, Image as ImageIcon, LayoutDashboard, MapPin, Package, Settings, ShoppingCart, Users, X } from "lucide-react";
import { BrandEmblem } from "@warkop-yareh/ui";

interface SidebarProps { isOpen?: boolean; onClose?: () => void }

const navigation = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/" },
  { icon: MapPin, label: "Branches", href: "/branches" },
  { icon: Package, label: "Menu", href: "/products" },
  { icon: ShoppingCart, label: "Orders", href: "/orders" },
  { icon: ImageIcon, label: "Gallery", href: "/gallery" },
  { icon: FileText, label: "Site Content", href: "/site-content" },
  { icon: Users, label: "Customers", href: "/users" },
  { icon: Settings, label: "System", href: "/settings" },
] as const;

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  return (
    <aside className={`fixed left-0 top-0 z-50 flex h-screen w-64 flex-col border-r border-white/[0.08] bg-[#111114] transition-transform duration-300 ${isOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0`}>
      <div className="flex items-center justify-between border-b border-white/[0.08] p-5">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#9c6b3a] text-white shadow-md"><BrandEmblem className="h-5 w-5 text-white" /></div>
          <div><h1 className="font-heading text-base font-extrabold tracking-tight text-white">Warkop<span className="text-[#f59e0b]">.</span>Ya&apos;reh</h1><p className="font-mono text-[9px] uppercase tracking-widest text-[#f59e0b]">Backoffice & CMS</p></div>
        </div>
        <button className="p-1 text-[#94a3b8] hover:text-white lg:hidden" onClick={onClose} aria-label="Close Sidebar"><X className="h-5 w-5" /></button>
      </div>
      <nav aria-label="Admin utama" className="flex-grow overflow-y-auto p-3 no-scrollbar">
        <ul className="space-y-0.5">{navigation.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(`${item.href}/`));
          const Icon = item.icon;
          return <li key={item.href}><Link href={item.href} onClick={onClose} aria-current={isActive ? "page" : undefined} className={`flex items-center gap-3 rounded-lg px-3 py-2 text-xs font-medium transition-colors ${isActive ? "border-l-2 border-[#f59e0b] bg-[#9c6b3a]/20 font-semibold text-[#f59e0b]" : "text-[#94a3b8] hover:bg-white/[0.04] hover:text-white"}`}><Icon aria-hidden="true" className="h-4 w-4" /><span>{item.label}</span></Link></li>;
        })}</ul>
      </nav>
      <div className="border-t border-white/[0.08] bg-black/20 p-4"><span className="font-mono text-[10px] text-[#94a3b8]">Surabaya · 24 jam</span></div>
    </aside>
  );
}
