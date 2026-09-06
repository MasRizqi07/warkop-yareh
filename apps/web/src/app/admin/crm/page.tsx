"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users,
  Search,
  MessageCircle,
  X,
} from "lucide-react";
import { useAppStore } from "@/store/useAppStore";

interface CustomerRecord {
  id: string;
  name: string;
  avatar: string;
  phone: string;
  segment: "VIP" | "Active" | "At-Risk" | "Inactive";
  tier: "Bronze" | "Silver" | "Gold" | "Platinum";
  lifetimeSpend: number;
  totalOrders: number;
  lastVisit: string;
  favoriteDrink: string;
  peakHour: string;
}

const MOCK_CUSTOMERS: CustomerRecord[] = [
  {
    id: "c-1",
    name: "Achmad Rizqi",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&fit=crop&crop=faces",
    phone: "08123456789",
    segment: "VIP",
    tier: "Gold",
    lifetimeSpend: 2840000,
    totalOrders: 48,
    lastVisit: "Hari ini, 14:15 WIB",
    favoriteDrink: "Kopi Susu Aren Brulee (Less Sweet)",
    peakHour: "19:00 - 23:00 WIB (Night Owl)",
  },
  {
    id: "c-2",
    name: "Clarissa Putri",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&fit=crop&crop=faces",
    phone: "08198765432",
    segment: "VIP",
    tier: "Platinum",
    lifetimeSpend: 4620000,
    totalOrders: 72,
    lastVisit: "Kemarin, 20:30 WIB",
    favoriteDrink: "Nitro Honey Cold Brew + Croissant",
    peakHour: "16:00 - 20:00 WIB (Afternoon Sprint)",
  },
  {
    id: "c-3",
    name: "Dimas Suryo",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&fit=crop&crop=faces",
    phone: "08133377788",
    segment: "Active",
    tier: "Silver",
    lifetimeSpend: 980000,
    totalOrders: 22,
    lastVisit: "2 hari yang lalu",
    favoriteDrink: "Ijen Single Origin V60",
    peakHour: "08:00 - 11:00 WIB (Morning Cupping)",
  },
  {
    id: "c-4",
    name: "Fadhil Rahmat",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&fit=crop&crop=faces",
    phone: "08155566677",
    segment: "At-Risk",
    tier: "Gold",
    lifetimeSpend: 1750000,
    totalOrders: 31,
    lastVisit: "24 hari yang lalu",
    favoriteDrink: "Matcha Kyoto Oat Latte",
    peakHour: "21:00 - 01:00 WIB (Midnight Nomad)",
  },
  {
    id: "c-5",
    name: "Salsa Bella",
    avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200&fit=crop&crop=faces",
    phone: "08177788899",
    segment: "Inactive",
    tier: "Bronze",
    lifetimeSpend: 240000,
    totalOrders: 6,
    lastVisit: "52 hari yang lalu",
    favoriteDrink: "Kopi Susu Aren Brulee",
    peakHour: "13:00 - 15:00 WIB (Lunch Break)",
  },
];

export default function AdminCrmPage() {
  const pathname = usePathname();
  const { getActiveBranch } = useAppStore();
  const activeBranch = getActiveBranch();

  const [selectedSegment, setSelectedSegment] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerRecord | null>(null);

  const adminNav = [
    { href: "/admin", label: "Executive Dashboard" },
    { href: "/admin/inventory", label: "Stok & Inventaris" },
    { href: "/admin/crm", label: "CRM & Segmentasi" },
    { href: "/admin/marketing", label: "WhatsApp Studio" },
    { href: "/admin/branches", label: "Multi-Cabang" },
  ];

  const filteredCustomers = MOCK_CUSTOMERS.filter((cust) => {
    const matchSegment = selectedSegment === "all" || cust.segment === selectedSegment;
    const matchSearch =
      cust.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cust.phone.includes(searchQuery);
    return matchSegment && matchSearch;
  });

  return (
    <div className="min-h-screen bg-[#0a0a0c] text-white pt-8 sm:pt-10 pb-32 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Admin Module Sub-Nav */}
      <div className="flex items-center gap-1 overflow-x-auto pb-2 mb-8 border-b border-white/5 scrollbar-none">
        {adminNav.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                isActive
                  ? "bg-[#9c6b3a] text-white shadow-md"
                  : "text-neutral-400 hover:text-white hover:bg-white/5"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-[#f59e0b] uppercase tracking-wider mb-1">
            <Users className="w-4 h-4 text-sky-400" />
            <span>CUSTOMER LIFECYCLE & RFM SEGMENTATION</span>
          </div>
          <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-white">
            Customer Segmentation Studio
          </h1>
          <p className="text-xs text-neutral-400 mt-0.5">
            Analisis RFM (Recency, Frequency, Monetary) & 360 Profil Pelanggan — Cabang {activeBranch.name}
          </p>
        </div>

        <Link
          href="/admin/marketing"
          className="px-4 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-2 shadow-md transition-colors self-start sm:self-auto"
        >
          <MessageCircle className="w-4 h-4" />
          <span>Kirim WhatsApp Broadcast</span>
        </Link>
      </div>

      {/* RFM Segmentation Matrix Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          {
            segment: "VIP",
            title: "VIP Patrons",
            count: "128 Members",
            desc: "Spend > Rp 1.5M/bln, kunjungan mingguan",
            color: "border-purple-500/40 text-purple-300",
            bg: "bg-purple-950/20",
          },
          {
            segment: "Active",
            title: "Active Regulars",
            count: "642 Members",
            desc: "Kunjungan 2-4x seminggu, AOV sehat",
            color: "border-emerald-500/40 text-emerald-300",
            bg: "bg-emerald-950/20",
          },
          {
            segment: "At-Risk",
            title: "At-Risk (Churn Risk)",
            count: "84 Members",
            desc: "Tidak berkunjung > 21 hari terakhir",
            color: "border-amber-500/40 text-amber-300",
            bg: "bg-amber-950/20",
          },
          {
            segment: "Inactive",
            title: "Dormant / Inactive",
            count: "145 Members",
            desc: "Tidak berkunjung > 45 hari",
            color: "border-rose-500/40 text-rose-300",
            bg: "bg-rose-950/20",
          },
        ].map((s) => (
          <button
            key={s.segment}
            onClick={() => setSelectedSegment(s.segment)}
            className={`p-5 rounded-3xl border text-left transition-all hover:scale-[1.02] ${
              s.color
            } ${s.bg} ${selectedSegment === s.segment ? "ring-2 ring-white" : ""}`}
          >
            <div className="font-heading font-extrabold text-lg text-white">{s.title}</div>
            <div className="font-mono text-sm font-bold mt-1 text-white">{s.count}</div>
            <p className="text-[11px] text-neutral-400 mt-1">{s.desc}</p>
          </button>
        ))}
      </div>

      {/* Filters & Customer Table */}
      <div className="p-6 sm:p-7 rounded-3xl bg-[#18181c] border border-white/10 space-y-4 shadow-xl">
        <div className="flex flex-col sm:flex-row gap-3 justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-neutral-500 absolute left-3.5 top-3" />
          <input
            aria-label="Cari pelanggan"
            type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari pelanggan berdasarkan nama atau no WA..."
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-[#111114] border border-white/10 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-[#f59e0b]"
            />
          </div>

          <div className="flex items-center gap-2 text-xs">
            <button
              onClick={() => setSelectedSegment("all")}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold ${
                selectedSegment === "all" ? "bg-[#9c6b3a] text-white" : "text-neutral-400 hover:text-white"
              }`}
            >
              Semua Segmen
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-white/10 text-neutral-400 font-mono uppercase">
                <th className="py-3 px-2">Pelanggan</th>
                <th className="py-3 px-2">Segmen RFM</th>
                <th className="py-3 px-2">Tier Loyalty</th>
                <th className="py-3 px-2">Total Transaksi</th>
                <th className="py-3 px-2">Lifetime Spend</th>
                <th className="py-3 px-2">Kunjungan Terakhir</th>
                <th className="py-3 px-2 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 font-mono">
              {filteredCustomers.map((cust) => (
                <tr key={cust.id} className="hover:bg-white/5 transition-colors">
                  <td className="py-3 px-2 font-sans">
                    <div className="flex items-center gap-3">
                      <div className="relative w-8 h-8 rounded-full overflow-hidden bg-neutral-800 flex-shrink-0">
                        <Image
                          src={cust.avatar}
                          alt={cust.name}
                          fill
                          className="object-cover"
                          sizes="32px"
                        />
                      </div>
                      <div>
                        <div className="font-bold text-white">{cust.name}</div>
                        <div className="text-[11px] text-neutral-400 font-mono">{cust.phone}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-2">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        cust.segment === "VIP"
                          ? "bg-purple-500/20 text-purple-300 border border-purple-500/30"
                          : cust.segment === "Active"
                          ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                          : cust.segment === "At-Risk"
                          ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                          : "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                      }`}
                    >
                      {cust.segment}
                    </span>
                  </td>
                  <td className="py-3 px-2 text-[#f59e0b] font-bold">{cust.tier}</td>
                  <td className="py-3 px-2 text-white">{cust.totalOrders} Pesanan</td>
                  <td className="py-3 px-2 text-emerald-400 font-bold">
                    Rp {cust.lifetimeSpend.toLocaleString("id-ID")}
                  </td>
                  <td className="py-3 px-2 text-neutral-400 font-sans">{cust.lastVisit}</td>
                  <td className="py-3 px-2 text-right">
                    <button
                      onClick={() => setSelectedCustomer(cust)}
                      className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-neutral-200 text-xs font-semibold transition-colors"
                    >
                      360 Profil
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 360-Degree Customer Profile Drawer */}
      <AnimatePresence>
        {selectedCustomer && (
          <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 280 }}
              className="w-full max-w-md h-full bg-[#18181c] border-l border-white/10 p-6 space-y-6 overflow-y-auto flex flex-col justify-between"
            >
              <div className="space-y-6">
                <div className="flex items-center justify-between border-b border-white/10 pb-4">
                  <h3 className="font-heading font-bold text-base text-white">
                    360 Customer Profile
                  </h3>
                  <button
                    onClick={() => setSelectedCustomer(null)}
                    className="text-neutral-400 hover:text-white"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Profile Overview */}
                <div className="flex items-center gap-4">
                  <div className="relative w-16 h-16 rounded-2xl overflow-hidden border-2 border-[#f59e0b]">
                    <Image
                      src={selectedCustomer.avatar}
                      alt={selectedCustomer.name}
                      fill
                      className="object-cover"
                      sizes="64px"
                    />
                  </div>
                  <div>
                    <h4 className="font-heading font-bold text-lg text-white">
                      {selectedCustomer.name}
                    </h4>
                    <p className="text-xs font-mono text-neutral-400">{selectedCustomer.phone}</p>
                    <span className="inline-block mt-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#f59e0b]/20 text-[#fcd34d]">
                      {selectedCustomer.tier} Member ({selectedCustomer.segment})
                    </span>
                  </div>
                </div>

                {/* Lifetime Metrics */}
                <div className="grid grid-cols-2 gap-3 text-xs font-mono">
                  <div className="p-3.5 rounded-2xl bg-[#111114]">
                    <div className="text-[10px] text-neutral-400">Total Belanja</div>
                    <div className="font-bold text-emerald-400 text-base mt-0.5">
                      Rp {selectedCustomer.lifetimeSpend.toLocaleString("id-ID")}
                    </div>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-[#111114]">
                    <div className="text-[10px] text-neutral-400">Total Kunjungan</div>
                    <div className="font-bold text-white text-base mt-0.5">
                      {selectedCustomer.totalOrders} Kali Order
                    </div>
                  </div>
                </div>

                {/* Behavioral Habits */}
                <div className="space-y-3 text-xs">
                  <h5 className="font-mono text-neutral-400 uppercase font-bold text-[11px]">
                    Kebiasaan & Preferensi Menu
                  </h5>

                  <div className="p-3 rounded-2xl bg-[#111114] space-y-1">
                    <span className="text-[11px] text-neutral-400">Minuman Paling Sering:</span>
                    <p className="font-semibold text-white">{selectedCustomer.favoriteDrink}</p>
                  </div>

                  <div className="p-3 rounded-2xl bg-[#111114] space-y-1">
                    <span className="text-[11px] text-neutral-400">Jam Kunjungan Favorit:</span>
                    <p className="font-semibold text-[#f59e0b] font-mono">{selectedCustomer.peakHour}</p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-white/10 space-y-2">
                <Link
                  href={`/admin/marketing?targetCustomer=${encodeURIComponent(selectedCustomer.name)}`}
                  className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-colors"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Kirim Voucher Re-Engagement via WA</span>
                </Link>
                <button
                  onClick={() => setSelectedCustomer(null)}
                  className="w-full py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-semibold text-neutral-300"
                >
                  Tutup Drawer
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
