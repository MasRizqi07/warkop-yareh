"use client";
'use client';

import React, { useState } from "react";
import Link from "next/link";
import React, { useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  ArrowRight,
  Award,
  Check,
  Clock,
  Coffee,
  CreditCard,
  Edit2,
  ExternalLink,
  Flame,
  Heart,
  Lock,
  MapPin,
  Receipt,
  Search,
  ShieldCheck,
  Sparkles,
  Store,
  User as UserIcon,
  Zap,
} from 'lucide-react';
import { useBranches } from '@/features/catalog/catalog.hooks';
import { useMyOrders } from '@/features/orders/orders.hooks';
import { useAuthStore } from '@/stores/auth.store';
import { useCartStore } from '@/stores';
import type { Product } from '@warkop-yareh/types';

interface OrderArchive {
type AccountTab =
  | 'profile'
  | 'favorites'
  | 'orders'
  | 'locations'
  | 'payments'
  | 'security';

interface PresetItem {
  id: string;
  name: string;
  image: string;
  tag: string;
  price: number;
  options: string[];
  productData: {
    id: string;
    name: string;
    description: string;
    price: number;
    category: string;
    image: string;
    isAvailable: boolean;
  };
  customizations: Record<string, string>;
  notes: string;
}

const PRESET_FAVORITES: PresetItem[] = [
  {
    id: 'fav-1',
    name: 'Cold Brew Aren Brulee',
    image:
      'https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?q=80&w=800&auto=format&fit=crop',
    tag: 'Top Reorder (#1)',
    price: 51000,
    options: ['Large 16oz', '70% Less Sweet', 'Oatly® Oat (+Rp 8k)', 'Torched Crust'],
    productData: {
      id: 'prod-coldbrew-aren',
      name: 'Cold Brew Aren Brulee',
      description: 'Slow-steeped 18hr Ijen beans topped with torched aren glaze foam',
      price: 43000,
      category: 'signature-coffee',
      image:
        'https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?q=80&w=800&auto=format&fit=crop',
      isAvailable: true,
    },
    customizations: {
      Size: 'Large 16oz',
      Sweetness: '70% Less Sweet',
      Milk: 'Oatly® Barista Oat Milk',
      Finish: 'Torched Aren Glaze',
    },
    notes: 'Torch wild aren foam extra caramelized',
  },
  {
    id: 'fav-2',
    name: 'Smoked Pastrami Brioche Toast',
    image:
      'https://images.unsplash.com/photo-1525351484163-7529414344d8?q=80&w=800&auto=format&fit=crop',
    tag: 'Midnight Fuel',
    price: 48000,
    options: ['Extra Raclette', 'Sourdough Crisp', 'Dijon Mustard'],
    productData: {
      id: 'prod-toast-pastrami',
      name: 'Smoked Pastrami Brioche Toast',
      description: 'House-cured spiced pastrami, raclette melt, fermented cucumber pickle',
      price: 48000,
      category: 'food-bites',
      image:
        'https://images.unsplash.com/photo-1525351484163-7529414344d8?q=80&w=800&auto=format&fit=crop',
      isAvailable: true,
    },
    customizations: {
      Option: 'Raclette Melt & Extra House Mustard',
    },
    notes: 'Toast extra crisp',
  },
  {
    id: 'fav-3',
    name: 'Dirty Aren Pandan',
    image:
      'https://images.unsplash.com/photo-1541167760496-1628856ab772?q=80&w=800&auto=format&fit=crop',
    tag: 'Afternoon Pick',
    price: 30000,
    options: ['Regular 12oz', 'Double Ristretto', 'Pandan Foam'],
    productData: {
      id: 'prod-dirty-pandan',
      name: 'Dirty Aren Pandan',
      description: 'Double ristretto poured over cold fresh milk infused with Suji & Pandan leaf essence',
      price: 30000,
      category: 'signature-coffee',
      image:
        'https://images.unsplash.com/photo-1541167760496-1628856ab772?q=80&w=800&auto=format&fit=crop',
      isAvailable: true,
    },
    customizations: {
      Size: 'Regular 12oz',
      Shot: 'Double Ristretto',
      Essence: 'Organic Pandan Cold Foam',
    },
    notes: 'Serve layered, do not shake',
  },
  {
    id: 'fav-4',
    name: 'Single-Origin V60 Pour Over',
    image:
      'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?q=80&w=800&auto=format&fit=crop',
    tag: 'Slow Bar Pour',
    price: 35000,
    options: ['Ijen Honey', 'Hot 200ml', 'Peach & Jasmine'],
    productData: {
      id: 'prod-v60-ijen',
      name: 'Single-Origin V60 Pour Over',
      description: 'East Java Ijen Mountain anaerobic honey process roasted light-medium by Ya’reh Roastery',
      price: 35000,
      category: 'slow-bar',
      image:
        'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?q=80&w=800&auto=format&fit=crop',
      isAvailable: true,
    },
    customizations: {
      Bean: 'Ijen Anaerobic Honey 2026 Batch',
      Temp: 'Hot 200ml (92°C Extraction)',
    },
    notes: 'Serve with frozen aroma glass',
  },
];

interface MockOrderArchive {
  id: string;
  orderNumber: string;
  date: string;
  branch: string;
  table: string;
  status: 'COMPLETED' | 'IN_PREPARATION' | 'CANCELLED';
  itemsSummary: string;
  itemCount: number;
  total: number;
  status: "Completed" | "In Preparation" | "Refunded";
}

const PAST_ORDERS: OrderArchive[] = [
const FALLBACK_PAST_ORDERS: MockOrderArchive[] = [
  {
    id: "YR-20260904-8921",
    date: "04 Sep 2026, 23:42 WIB",
    branch: "Darmo Flagship (Table #14)",
    itemsSummary: "1× Cold Brew Aren Brulee, 1× Artisan Toasted Sourdough",
    total: 69000,
    status: "Completed",
    id: 'YR-20260904-8921',
    orderNumber: 'SBY-8921',
    date: '04 Sep 2026 · 23:42 WIB',
    branch: 'Darmo Flagship Sanctuary',
    table: 'Table #14 (Indoor AC)',
    status: 'IN_PREPARATION',
    itemsSummary: '1× Cold Brew Aren Brulee, 1× Smoked Pastrami Brioche Toast',
    itemCount: 2,
    total: 103350,
  },
  {
    id: "YR-20260902-7104",
    date: "02 Sep 2026, 19:15 WIB",
    branch: "Darmo Flagship (Tech Hub Desk #02)",
    itemsSummary: "1× Iced Matcha Pandan Latte, 1× French Butter Almond Croissant",
    id: 'YR-20260902-7104',
    orderNumber: 'SBY-7104',
    date: '02 Sep 2026 · 19:15 WIB',
    branch: 'Darmo Flagship Sanctuary',
    table: 'Tech Hub Desk #02',
    status: 'COMPLETED',
    itemsSummary: '1× Iced Matcha Pandan Latte, 1× French Butter Almond Croissant',
    itemCount: 2,
    total: 67000,
    status: "Completed",
  },
  {
    id: "YR-20260829-4591",
    date: "29 Aug 2026, 14:10 WIB",
    branch: "Gubeng Sanctuary (Self Pickup)",
    itemsSummary: "2× Velvet Flat White 6oz, 1× Warkop Heritage Toast",
    id: 'YR-20260829-4591',
    orderNumber: 'SBY-4591',
    date: '29 Aug 2026 · 14:10 WIB',
    branch: 'Gubeng Sanctuary Express',
    table: 'Self Pickup Express Counter',
    status: 'COMPLETED',
    itemsSummary: '2× Velvet Flat White 6oz, 1× Warkop Heritage Toast',
    itemCount: 3,
    total: 86000,
    status: "Completed",
  },
  {
    id: "YR-20260825-3312",
    date: "25 Aug 2026, 21:05 WIB",
    branch: "Darmo Flagship (Table #08)",
    itemsSummary: "1× Sumatra Gayo V60 Manual Brew, 1× Cold Brew Aren Brulee",
    id: 'YR-20260825-3312',
    orderNumber: 'SBY-3312',
    date: '25 Aug 2026 · 21:05 WIB',
    branch: 'Darmo Flagship Sanctuary',
    table: 'Table #08 (Open Veranda)',
    status: 'COMPLETED',
    itemsSummary: '1× Sumatra Gayo V60 Manual Brew, 1× Cold Brew Aren Brulee',
    itemCount: 2,
    total: 66000,
    status: "Completed",
  },
  {
    id: 'YR-20260818-1902',
    orderNumber: 'SBY-1902',
    date: '18 Aug 2026 · 20:30 WIB',
    branch: 'Darmo Flagship Sanctuary',
    table: 'VIP Meeting Studio A',
    status: 'COMPLETED',
    itemsSummary: '4× Nitro Cold Brew Flights, 2× Truffle Fries Platter',
    itemCount: 6,
    total: 215000,
  },
];

export default function AccountPage() {
  const [activeTab, setActiveTab] = useState<"orders" | "profile" | "preferences" | "security">("orders");
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isInitialized = useAuthStore((state) => state.isInitialized);
  const addItem = useCartStore((state) => state.addItem);
  const setCartOpen = useCartStore((state) => state.setCartOpen);

  const branchesQuery = useBranches();
  const realOrdersQuery = useMyOrders(isInitialized && isAuthenticated);

  const [activeTab, setActiveTab] = useState<AccountTab>('profile');
  const [orderFilter, setOrderFilter] = useState<'ALL' | 'PREP' | 'COMPLETED' | 'CANCELLED'>('ALL');
  const [orderSearchQuery, setOrderSearchQuery] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Profile editable form state
  const [fullName, setFullName] = useState(user?.name || 'Reyhan Arisandi');
  const [email, setEmail] = useState(user?.email || 'reyhan.arisandi@surabayatech.id');
  const [phone, setPhone] = useState(user?.phone || '+62 812-3456-7890');
  const [selectedBranch, setSelectedBranch] = useState(user?.branchId || 'branch-darmo');
  const [isSaved, setIsSaved] = useState(false);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaved(true);
    showToast('Profil Sanctuary berhasil diperbarui & tersinkronisasi.');
    setTimeout(() => setIsSaved(false), 3000);
  };

  const handleReorderPreset = (item: PresetItem) => {
    addItem(
      item.productData as unknown as Product,
      1,
      item.customizations,
      item.notes,
      item.price
    );
    setCartOpen(true);
    showToast(`1-Click Reorder "${item.name}" berhasil dimasukkan ke Cart!`);
  };

  // Combine real orders with fallback mock orders if user has no orders yet
  const combinedOrders = useMemo(() => {
    if (realOrdersQuery.data && realOrdersQuery.data.length > 0) {
      return realOrdersQuery.data.map((ord) => ({
        id: ord.id,
        orderNumber: ord.orderNumber,
        date:
          new Date(ord.createdAt).toLocaleDateString('id-ID', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          }) + ' WIB',
        branch:
          ord.branchId === 'branch-gubeng'
            ? 'Gubeng Sanctuary Express'
            : 'Darmo Flagship Sanctuary',
        table: ord.tableId ? `Meja #${ord.tableId}` : 'Takeaway / Self-Pickup',
        status: (ord.status === 'COMPLETED'
          ? 'COMPLETED'
          : ord.status === 'CANCELLED'
            ? 'CANCELLED'
            : 'IN_PREPARATION') as 'COMPLETED' | 'IN_PREPARATION' | 'CANCELLED',
        itemsSummary: ord.items.map((i) => `${i.quantity}× ${i.snapshotName}`).join(', '),
        itemCount: ord.items.reduce((acc, curr) => acc + curr.quantity, 0),
        total: ord.total,
      }));
    }
    return FALLBACK_PAST_ORDERS;
  }, [realOrdersQuery.data]);

  const filteredOrders = useMemo(() => {
    return combinedOrders.filter((ord) => {
      if (orderFilter === 'PREP' && ord.status !== 'IN_PREPARATION') return false;
      if (orderFilter === 'COMPLETED' && ord.status !== 'COMPLETED') return false;
      if (orderFilter === 'CANCELLED' && ord.status !== 'CANCELLED') return false;

      if (orderSearchQuery.trim()) {
        const q = orderSearchQuery.toLowerCase();
        const matchesId =
          ord.id.toLowerCase().includes(q) || ord.orderNumber.toLowerCase().includes(q);
        const matchesItems = ord.itemsSummary.toLowerCase().includes(q);
        const matchesBranch = ord.branch.toLowerCase().includes(q);
        return matchesId || matchesItems || matchesBranch;
      }
      return true;
    });
  }, [combinedOrders, orderFilter, orderSearchQuery]);

  const userInitials = (user?.name || 'Reyhan Arisandi')
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="min-h-screen bg-[#0a0a0c] text-[#e5e1e4] pt-8 sm:pt-10 pb-32">
    <div className="min-h-screen bg-canvas-obsidian text-on-surface pt-6 sm:pt-10 pb-32">
      {/* Subtle Ambient Glow */}
      <div className="fixed -top-24 right-1/4 w-96 h-96 bg-[#f59e0b]/5 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="fixed -top-24 right-1/4 w-96 h-96 bg-accent-amber/5 rounded-full blur-3xl pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
      {/* Floating Toast Notification */}
      {toastMessage && (
        <aside
          role="status"
          aria-live="polite"
          className="fixed bottom-6 right-6 z-50 bg-surface-card border border-accent-amber/40 text-on-surface px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-bottom-4 duration-200"
        >
          <Sparkles className="w-5 h-5 text-accent-amber shrink-0" />
          <span className="text-xs font-medium">{toastMessage}</span>
        </aside>
      )}

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Top Breadcrumb & Page Header */}
        <div className="flex flex-col space-y-2 pb-4 border-b border-white/[0.06]">
          <div className="flex items-center gap-2 font-mono text-xs text-[#94a3b8]">
            <Link href="/" className="hover:text-[#f7bb82] transition-colors">Sanctuary Home</Link>
            <span>/</span>
            <span className="text-[#94a3b8]">Member Portal</span>
            <span>/</span>
            <span className="text-[#f59e0b] font-semibold">Profile &amp; History</span>
          </div>
        <header className="flex flex-col space-y-2 pb-4 border-b border-border-subtle">
          <nav aria-label="Breadcrumb" className="flex items-center gap-2 font-mono text-xs text-text-muted">
            <Link href="/" className="hover:text-primary transition-colors">
              Sanctuary Home
            </Link>
            <span className="text-outline-variant">/</span>
            <span className="text-text-muted">Member Portal</span>
            <span className="text-outline-variant">/</span>
            <span className="text-accent-amber font-semibold">Profile &amp; History</span>
          </nav>

          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 pt-1">
            <div className="space-y-1">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#f8fafc] tracking-tight">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-text-primary tracking-tight font-headline-xl">
                Account Sanctuary &amp; Order Archives
              </h1>
              <p className="text-xs sm:text-sm text-[#94a3b8] max-w-2xl">
              <p className="text-xs sm:text-sm text-text-muted max-w-2xl font-body-md">
                Manage your identity, frequent midnight roasts, verified invoice archives, and active Surabaya table privileges.
              </p>
            </div>

            <div className="flex items-center gap-2 bg-[#111114] px-3.5 py-1.5 rounded-xl border border-white/[0.08] self-start lg:self-auto shadow-sm">
            <div className="flex items-center gap-2 bg-surface-secondary px-3.5 py-1.5 rounded-xl border border-border-subtle self-start lg:self-auto shadow-sm">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#f59e0b] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#f59e0b]"></span>
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent-amber opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-accent-amber"></span>
              </span>
              <span className="font-mono text-[11px] text-[#94a3b8]">Session: Darmo Mesh #04</span>
              <span>•</span>
              <span className="font-mono text-[11px] text-[#f7bb82] font-bold">23:58 WIB</span>
              <span className="font-mono text-[11px] text-text-muted">Session: Darmo Mesh #04</span>
              <span className="text-border-subtle">•</span>
              <span className="font-mono text-[11px] text-primary font-bold">23:58 WIB</span>
            </div>
          </div>
        </div>
        </header>

        {/* Lifetime KPI Bar Strip (4 cards) */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-[#111114] rounded-2xl p-5 border border-white/[0.08] shadow-md flex flex-col justify-between">
            <div className="flex items-center justify-between text-[#94a3b8] mb-2">
              <span className="text-xs uppercase font-mono">Lifetime Orders</span>
              <span className="material-symbols-outlined text-[#f7bb82] text-[18px]">receipt_long</span>
          <div className="bg-surface-card rounded-2xl p-5 border border-border-subtle shadow-md flex flex-col justify-between hover:bg-surface-container transition-all">
            <div className="flex items-center justify-between text-text-muted mb-2">
              <span className="text-xs uppercase font-mono tracking-wider font-semibold">Lifetime Orders</span>
              <Receipt className="w-4 h-4 text-primary" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-[#f8fafc] font-mono">68</span>
              <span className="text-3xl font-extrabold text-text-primary font-mono">{combinedOrders.length}</span>
              <span className="text-[11px] font-mono text-emerald-400 font-bold">+4 this month</span>
            </div>
            <span className="text-[11px] text-[#94a3b8] mt-2">Across 2 Surabaya outlets</span>
            <span className="text-[11px] text-text-muted mt-2">Across 2 Surabaya outlets</span>
          </div>

          <div className="bg-[#111114] rounded-2xl p-5 border border-white/[0.08] shadow-md flex flex-col justify-between">
            <div className="flex items-center justify-between text-[#94a3b8] mb-2">
              <span className="text-xs uppercase font-mono">Active Points</span>
              <span className="material-symbols-outlined text-[#f59e0b] text-[18px]">award_star</span>
          <div className="bg-surface-card rounded-2xl p-5 border border-border-subtle shadow-md flex flex-col justify-between hover:bg-surface-container transition-all">
            <div className="flex items-center justify-between text-text-muted mb-2">
              <span className="text-xs uppercase font-mono tracking-wider font-semibold">Active Ya&apos;reh Points</span>
              <Award className="w-4 h-4 text-accent-amber" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-[#f59e0b] font-mono">1,450</span>
              <span className="text-[10px] font-mono text-[#f59e0b] bg-[#f59e0b]/15 px-1.5 py-0.5 rounded">
              <span className="text-3xl font-extrabold text-accent-amber font-mono">
                {(user?.loyaltyPoints || 1450).toLocaleString('id-ID')}
              </span>
              <span className="text-[10px] font-mono text-accent-amber bg-accent-amber/15 px-1.5 py-0.5 rounded font-semibold">
                Gold 1.5x Multiplier
              </span>
            </div>
            <span className="text-[11px] text-[#94a3b8] mt-2">Approx. Rp 145.000 value</span>
            <span className="text-[11px] text-text-muted mt-2">Approx. Rp 145.000 value</span>
          </div>

          <div className="bg-[#111114] rounded-2xl p-5 border border-white/[0.08] shadow-md flex flex-col justify-between">
            <div className="flex items-center justify-between text-[#94a3b8] mb-2">
              <span className="text-xs uppercase font-mono">Primary Flagship</span>
              <span className="material-symbols-outlined text-[#e8c47a] text-[18px]">store</span>
          <div className="bg-surface-card rounded-2xl p-5 border border-border-subtle shadow-md flex flex-col justify-between hover:bg-surface-container transition-all">
            <div className="flex items-center justify-between text-text-muted mb-2">
              <span className="text-xs uppercase font-mono tracking-wider font-semibold">Dialed-in Presets</span>
              <Zap className="w-4 h-4 text-cream-beige" />
            </div>
            <div>
              <p className="text-lg font-bold text-[#f8fafc]">Darmo Flagship</p>
              <p className="text-[11px] text-[#94a3b8]">92% of your reservations</p>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-text-primary font-mono">{PRESET_FAVORITES.length}</span>
              <span className="text-[11px] font-mono text-cream-beige font-semibold">1-Click Ready</span>
            </div>
            <span className="text-[11px] text-emerald-400 font-mono mt-2">Preferred Table #14</span>
            <span className="text-[11px] text-text-muted mt-2">Custom sweetness &amp; foam</span>
          </div>

          <div className="bg-[#111114] rounded-2xl p-5 border border-white/[0.08] shadow-md flex flex-col justify-between">
            <div className="flex items-center justify-between text-[#94a3b8] mb-2">
              <span className="text-xs uppercase font-mono">Focus Hours</span>
              <span className="material-symbols-outlined text-emerald-400 text-[18px]">bolt</span>
          <div className="bg-surface-card rounded-2xl p-5 border border-border-subtle shadow-md flex flex-col justify-between hover:bg-surface-container transition-all">
            <div className="flex items-center justify-between text-text-muted mb-2">
              <span className="text-xs uppercase font-mono tracking-wider font-semibold">Sanctuary Resident</span>
              <ShieldCheck className="w-4 h-4 text-primary" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-[#f8fafc] font-mono">142</span>
              <span className="text-xs text-[#94a3b8]">Hours</span>
              <span className="text-2xl sm:text-3xl font-extrabold text-text-primary font-mono">Sep &apos;23</span>
              <span className="text-[11px] font-mono text-text-muted">365+ Days</span>
            </div>
            <span className="text-[11px] text-[#94a3b8] mt-2">Logged in Tech Hub</span>
            <span className="text-[11px] text-text-muted mt-2">Darmo Founding Cohort</span>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-white/[0.08] pb-1 overflow-x-auto scrollbar-none">
          {[
            { id: "orders", label: "Order Archives", icon: "inventory_2" },
            { id: "profile", label: "Patron Identity", icon: "badge" },
            { id: "preferences", label: "Brew & Desk Preferences", icon: "tune" },
            { id: "security", label: "Sessions & Security", icon: "security" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                activeTab === tab.id
                  ? "bg-[#18181c] border border-white/[0.08] text-[#f7bb82] shadow-sm"
                  : "text-[#94a3b8] hover:text-[#f8fafc]"
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
        {/* Main Two-Column Layout */}
        <div className="flex flex-col lg:flex-row gap-6 items-start">
          {/* Left Column: Sleek Nav Sidebar (~280px) */}
          <aside className="w-full lg:w-72 shrink-0 flex flex-col gap-4 sticky top-24">
            {/* User Profile Mini-Card */}
            <div className="bg-surface-card rounded-2xl p-4 border border-border-subtle shadow-md relative overflow-hidden group">
              <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-accent-amber/5 rounded-full blur-xl pointer-events-none" />
              <div className="flex items-center gap-3 mb-3">
                <div className="relative">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-brand-coffee to-accent-amber p-0.5 flex items-center justify-center shadow-md">
                    <div className="w-full h-full bg-canvas-obsidian rounded-full flex items-center justify-center font-bold text-accent-amber text-base font-headline-md">
                      {userInitials}
                    </div>
                  </div>
                  <span className="absolute -bottom-1 -right-1 bg-surface-card rounded-full p-0.5 shadow-sm">
                    <Award className="w-3.5 h-3.5 text-accent-amber fill-accent-amber" />
                  </span>
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="font-bold text-text-primary text-sm truncate font-headline-md">
                    {user?.name || fullName}
                  </span>
                  <div className="flex items-center gap-1 mt-0.5">
                    <span className="font-mono text-[10px] text-accent-amber font-semibold uppercase tracking-wider">
                      {user?.membershipTier || 'Gold Artisan'} Tier
                    </span>
                  </div>
                </div>
              </div>
              <div className="bg-surface-secondary rounded-xl px-3 py-1.5 flex items-center justify-between border border-border-subtle">
                <span className="font-mono text-[11px] text-text-muted uppercase tracking-wider">Patron ID</span>
                <span className="font-mono text-xs text-primary font-bold">
                  #YR-{user?.id?.replace(/[^0-9]/g, '').slice(-4) || '9821'}
                </span>
              </div>
            </div>

        {/* ══════════════════════════════════════════════════════════════
            TAB 1: ORDER ARCHIVES
            ══════════════════════════════════════════════════════════════ */}
        {activeTab === "orders" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-base text-[#f8fafc]">Past Order Receipts</h3>
              <span className="font-mono text-xs text-[#94a3b8]">Verified Tax Invoices (PB1)</span>
            {/* Vertical Menu Tabs */}
            <nav aria-label="Account Navigation" className="bg-surface-card rounded-2xl p-2 border border-border-subtle shadow-md flex flex-col space-y-1">
              {[
                { id: 'profile', label: 'Profile & Identity', icon: UserIcon, badge: 'Verified' },
                { id: 'favorites', label: 'Favorite Brews', icon: Heart, badge: `${PRESET_FAVORITES.length} items` },
                { id: 'orders', label: 'Order Archives', icon: Receipt, badge: `${combinedOrders.length}` },
                { id: 'locations', label: 'Saved Locations', icon: MapPin, badge: '2 hubs' },
                { id: 'payments', label: 'Payment & Wallets', icon: CreditCard, badge: 'QRIS/VA' },
                { id: 'security', label: 'Security & Sessions', icon: Lock, badge: 'Active' },
              ].map((item) => {
                const IconComponent = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id as AccountTab)}
                    type="button"
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all text-left ${
                      isActive
                        ? 'bg-surface-container text-accent-amber shadow-sm border border-accent-amber/20'
                        : 'text-text-muted hover:text-text-primary hover:bg-surface-secondary'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <IconComponent className={`w-4 h-4 ${isActive ? 'text-accent-amber' : 'text-text-muted'}`} />
                      <span>{item.label}</span>
                    </div>
                    {item.badge && (
                      <span
                        className={`font-mono text-[10px] px-2 py-0.5 rounded-full ${
                          isActive
                            ? 'bg-accent-amber/20 text-accent-amber font-bold'
                            : 'bg-surface-secondary text-text-muted'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>

            {/* Quick Barista Concierge Help Card */}
            <div className="bg-surface-secondary rounded-2xl p-4 border border-border-subtle shadow-sm space-y-2">
              <div className="flex items-center gap-2 text-primary text-xs font-bold">
                <Coffee className="w-4 h-4 text-accent-amber" />
                <span>Darmo Barista Concierge</span>
              </div>
              <p className="text-[11px] text-text-muted leading-relaxed">
                Need desk assistance, power supply, or custom event roasts? WhatsApp our on-duty bar shift lead directly.
              </p>
              <a
                href="https://wa.me/6281234567890?text=Halo%20Barista%20Warkop%20Ya'reh%2C%20saya%20patron%20di%20Surabaya."
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 font-mono text-[11px] text-accent-amber hover:text-primary transition-colors pt-1 font-semibold"
              >
                <span>Chat Barista Counter</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </a>
            </div>
          </aside>

            <div className="space-y-3">
              {PAST_ORDERS.map((ord) => (
                <div
                  key={ord.id}
                  className="p-5 rounded-2xl bg-[#111114] border border-white/[0.08] hover:border-white/[0.15] transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm"
                >
                  <div className="space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono font-bold text-xs text-[#f7bb82] bg-[#18181c] px-2 py-0.5 rounded border border-white/[0.06]">
                        {ord.id}
          {/* Right Column: Dynamic Content Area */}
          <div className="flex-1 w-full space-y-8 min-w-0">
            {/* ══════════════════════════════════════════════════════════════
                TAB: PROFILE & IDENTITY
                ══════════════════════════════════════════════════════════════ */}
            {activeTab === 'profile' && (
              <section className="bg-surface-card rounded-3xl p-6 sm:p-8 border border-border-subtle shadow-xl relative overflow-hidden space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-border-subtle">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[10px] text-accent-amber uppercase tracking-wider font-bold">
                        Identity Matrix
                      </span>
                      <span className="text-[11px] text-[#94a3b8]">{ord.date}</span>
                      <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded">
                        {ord.status}
                      <span className="w-1 h-1 bg-text-muted rounded-full" />
                      <span className="font-mono text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full font-bold">
                        KYC Verified
                      </span>
                    </div>
                    <p className="text-sm font-semibold text-[#f8fafc]">{ord.itemsSummary}</p>
                    <p className="text-xs text-[#94a3b8]">{ord.branch}</p>
                    <h2 className="text-xl sm:text-2xl font-bold text-text-primary font-headline-lg">
                      Profile Information &amp; Sanctuary Pass
                    </h2>
                  </div>
                  <div className="flex items-center gap-2 text-text-muted font-mono text-xs bg-surface-secondary px-3 py-1.5 rounded-xl border border-border-subtle">
                    <Clock className="w-3.5 h-3.5 text-accent-amber" />
                    <span>Updated: 04 Sep 2026, 18:20</span>
                  </div>
                </div>

                  <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-3 pt-2 sm:pt-0 border-t sm:border-0 border-white/[0.06]">
                    <span className="font-mono font-extrabold text-base text-[#f59e0b]">
                      Rp {ord.total.toLocaleString("id-ID")}
                    </span>
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/orders/${encodeURIComponent(ord.id)}`}
                        className="px-3 py-1.5 rounded-lg bg-[#18181c] hover:bg-[#201f21] text-xs text-[#d5c3b6] hover:text-[#f8fafc] border border-white/[0.08] transition-colors"
                {/* Avatar Banner */}
                <div className="flex flex-col sm:flex-row items-center gap-4 p-4 rounded-2xl bg-surface-secondary border border-border-subtle">
                  <div className="relative group cursor-pointer shrink-0">
                    <div className="w-20 h-20 rounded-full bg-surface-container-high flex items-center justify-center text-text-primary text-2xl font-bold border-2 border-accent-amber/40 shadow-md overflow-hidden">
                      {userInitials}
                    </div>
                    <div className="absolute inset-0 bg-canvas-obsidian/80 rounded-full flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <Edit2 className="w-4 h-4 text-accent-amber" />
                      <span className="font-mono text-[8px] text-text-primary mt-0.5">CHANGE</span>
                    </div>
                  </div>
                  <div className="flex flex-col items-center sm:items-start text-center sm:text-left space-y-1">
                    <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                      <span className="text-lg font-bold text-text-primary">{user?.name || fullName}</span>
                      <span className="px-2.5 py-0.5 rounded-full bg-accent-amber/15 text-accent-amber font-mono text-[11px] font-bold inline-flex items-center gap-1">
                        <Award className="w-3 h-3 fill-accent-amber" />
                        Gold Tier Resident
                      </span>
                    </div>
                    <p className="text-xs text-text-muted max-w-md">
                      Full 24-hour fiber WiFi access, reserved quiet pods, and 1.5x roast loyalty redemption unlocked at all Surabaya hubs.
                    </p>
                  </div>
                </div>

                {/* Profile Form */}
                <form onSubmit={handleSaveProfile} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Full Name */}
                    <div className="bg-surface-secondary rounded-2xl p-4 border border-border-subtle flex flex-col justify-between">
                      <label className="text-xs text-text-muted font-medium mb-1">Full Legal Name</label>
                      <input
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="w-full bg-surface-container px-3 py-2 rounded-xl text-sm font-semibold text-text-primary border border-border-subtle focus:outline-none focus:border-accent-amber"
                        required
                      />
                      <span className="font-mono text-[10px] text-text-muted mt-2">Matched to BCA &amp; GoPay Account</span>
                    </div>

                    {/* Email */}
                    <div className="bg-surface-secondary rounded-2xl p-4 border border-border-subtle flex flex-col justify-between">
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-xs text-text-muted font-medium">Registered Email</label>
                        <span className="font-mono text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full font-semibold">
                          Verified
                        </span>
                      </div>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full bg-surface-container px-3 py-2 rounded-xl text-sm font-semibold text-text-primary border border-border-subtle focus:outline-none focus:border-accent-amber"
                        required
                      />
                      <span className="text-[11px] text-text-muted mt-2">Receives automated tax e-invoices</span>
                    </div>

                    {/* WhatsApp */}
                    <div className="bg-surface-secondary rounded-2xl p-4 border border-border-subtle flex flex-col justify-between">
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-xs text-text-muted font-medium">WhatsApp Hotline</label>
                        <span className="font-mono text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full font-semibold">
                          WA Synced
                        </span>
                      </div>
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full bg-surface-container px-3 py-2 rounded-xl text-sm font-mono font-bold text-text-primary border border-border-subtle focus:outline-none focus:border-accent-amber"
                        required
                      />
                      <span className="text-[11px] text-text-muted mt-2">Real-time table buzzer &amp; brew alerts</span>
                    </div>

                    {/* Branch */}
                    <div className="bg-surface-secondary rounded-2xl p-4 border border-border-subtle flex flex-col justify-between">
                      <label className="text-xs text-text-muted font-medium mb-1">Primary Sanctuary Base</label>
                      <select
                        value={selectedBranch}
                        onChange={(e) => setSelectedBranch(e.target.value)}
                        className="w-full bg-surface-container px-3 py-2 rounded-xl text-sm font-semibold text-text-primary border border-border-subtle focus:outline-none focus:border-accent-amber cursor-pointer"
                      >
                        Receipt
                      </Link>
                      <Link
                        href="/menu"
                        className="px-3 py-1.5 rounded-lg bg-[#9c6b3a]/30 hover:bg-[#9c6b3a]/60 text-xs text-[#f7bb82] font-semibold transition-colors"
                        {branchesQuery.data && branchesQuery.data.length > 0 ? (
                          branchesQuery.data.map((b) => (
                            <option key={b.id} value={b.id}>
                              {b.name} ({b.city})
                            </option>
                          ))
                        ) : (
                          <>
                            <option value="branch-darmo">Darmo Flagship (Central SBY)</option>
                            <option value="branch-gubeng">Gubeng Express (East SBY)</option>
                          </>
                        )}
                      </select>
                      <span className="font-mono text-[10px] text-emerald-400 mt-2">24h Nonstop Fiber Hub</span>
                    </div>
                  </div>

                  {/* Connected Accounts */}
                  <div className="space-y-3 pt-2">
                    <h3 className="font-mono text-xs uppercase text-text-muted tracking-wider font-semibold">
                      Connected Identity &amp; Payments
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="flex items-center justify-between p-3.5 bg-surface-secondary rounded-xl border border-border-subtle">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-surface-container flex items-center justify-center font-bold text-text-primary text-sm">
                            G
                          </div>
                          <div>
                            <span className="text-xs font-semibold text-text-primary block">Google SSO</span>
                            <span className="font-mono text-[11px] text-text-muted truncate block max-w-[160px]">
                              {email}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                          <span className="font-mono text-[10px] text-emerald-400 font-bold">Linked</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between p-3.5 bg-surface-secondary rounded-xl border border-border-subtle">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-surface-container flex items-center justify-center text-accent-amber">
                            <CreditCard className="w-4 h-4" />
                          </div>
                          <div>
                            <span className="text-xs font-semibold text-text-primary block">Midtrans One-Click</span>
                            <span className="font-mono text-[11px] text-text-muted block">GoPay &amp; BCA VA Enabled</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                          <span className="font-mono text-[10px] text-emerald-400 font-bold">Active</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Action Button */}
                  <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-border-subtle">
                    <span className="text-xs text-text-muted">Passphrase last rotated 42 days ago</span>
                    <div className="flex items-center gap-3 w-full sm:w-auto">
                      <button
                        type="button"
                        onClick={() => {
                          setFullName(user?.name || 'Reyhan Arisandi');
                          setEmail(user?.email || 'reyhan.arisandi@surabayatech.id');
                          setPhone(user?.phone || '+62 812-3456-7890');
                        }}
                        className="px-4 py-2.5 rounded-xl bg-surface-secondary hover:bg-surface-container text-text-muted hover:text-text-primary text-xs font-semibold transition-colors w-full sm:w-auto"
                      >
                        Reorder
                      </Link>
                        Reset
                      </button>
                      <button
                        type="submit"
                        className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-brand-coffee to-secondary-container hover:from-primary-container hover:to-secondary text-text-primary text-xs font-bold transition-all shadow-md hover:shadow-lg w-full sm:w-auto text-center"
                      >
                        {isSaved ? 'Saved!' : 'Save Sanctuary Profile'}
                      </button>
                    </div>
                  </div>
                </form>
              </section>
            )}

            {/* ══════════════════════════════════════════════════════════════
                TAB: FAVORITE BREWS & 1-CLICK REORDER
                ══════════════════════════════════════════════════════════════ */}
            {activeTab === 'favorites' && (
              <section className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[10px] text-accent-amber uppercase tracking-wider font-bold">
                        Saved Roasts
                      </span>
                      <span className="w-1 h-1 bg-text-muted rounded-full" />
                      <span className="font-mono text-[10px] text-text-muted">Zero-Latency Brewing</span>
                    </div>
                    <h2 className="text-xl sm:text-2xl font-bold text-text-primary font-headline-lg">
                      Favorite Brews &amp; Midnight Presets
                    </h2>
                    <p className="text-xs sm:text-sm text-text-muted font-body-md">
                      Quick-reorder your dialed-in roast recipes without reconfiguring grind, sweetness, or milk type.
                    </p>
                  </div>
                  <Link
                    href="/menu"
                    className="text-primary hover:text-accent-amber transition-colors font-mono text-xs flex items-center gap-1 self-start sm:self-auto shrink-0 font-semibold"
                  >
                    <span>Browse All Menus</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════
            TAB 2: PATRON IDENTITY
            ══════════════════════════════════════════════════════════════ */}
        {activeTab === "profile" && (
          <div className="p-6 sm:p-8 rounded-3xl bg-[#111114] border border-white/[0.08] shadow-md space-y-6 max-w-2xl">
            <h3 className="font-bold text-lg text-[#f8fafc]">Patron Profile Identity</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="text-[#94a3b8] block mb-1">Full Legal Name</label>
                <input
                  type="text"
                  defaultValue="Reyhan Arisandi"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#18181c] border border-white/[0.08] text-[#f8fafc] focus:outline-none focus:border-[#f59e0b]"
                />
              </div>
              <div>
                <label className="text-[#94a3b8] block mb-1">WhatsApp Mobile</label>
                <input
                  type="text"
                  defaultValue="+62 812-9876-5432"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#18181c] border border-white/[0.08] text-[#f8fafc] focus:outline-none focus:border-[#f59e0b]"
                />
              </div>
              <div>
                <label className="text-[#94a3b8] block mb-1">Email Address</label>
                <input
                  type="email"
                  defaultValue="reyhan.arisandi@surabayatech.id"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#18181c] border border-white/[0.08] text-[#f8fafc] focus:outline-none focus:border-[#f59e0b]"
                />
              </div>
              <div>
                <label className="text-[#94a3b8] block mb-1">Patron Unique ID</label>
                <input
                  type="text"
                  defaultValue="#YR-9821-SBY"
                  readOnly
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#18181c] border border-white/[0.04] text-[#94a3b8] font-mono"
                />
              </div>
            </div>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                  {PRESET_FAVORITES.map((preset) => (
                    <div
                      key={preset.id}
                      className="bg-surface-card rounded-2xl overflow-hidden border border-border-subtle shadow-lg flex flex-col group hover:-translate-y-1 transition-all duration-300"
                    >
                      <div className="h-44 w-full relative overflow-hidden bg-surface-secondary">
                        <Image
                          src={preset.image}
                          alt={preset.name}
                          fill
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-canvas-obsidian via-transparent to-transparent" />
                        <div className="absolute top-2.5 left-2.5 bg-canvas-obsidian/85 backdrop-blur-md px-2 py-0.5 rounded-full font-mono text-[10px] text-accent-amber font-bold flex items-center gap-1 border border-border-subtle">
                          <Flame className="w-3 h-3 text-accent-amber fill-accent-amber" />
                          {preset.tag}
                        </div>
                        <button
                          type="button"
                          className="absolute top-2.5 right-2.5 w-7 h-7 rounded-full bg-canvas-obsidian/80 backdrop-blur-md flex items-center justify-center text-accent-amber hover:text-white transition-colors border border-border-subtle"
                        >
                          <Heart className="w-3.5 h-3.5 fill-accent-amber" />
                        </button>
                      </div>

            <button
              type="button"
              onClick={() => alert("Profile updated successfully!")}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#9c6b3a] to-[#ee9800] text-[#f8fafc] font-bold text-xs shadow-md hover:brightness-110 transition-all"
            >
              Save Profile Changes
            </button>
          </div>
        )}
                      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                        <div>
                          <h3 className="font-bold text-sm text-text-primary group-hover:text-primary transition-colors line-clamp-1">
                            {preset.name}
                          </h3>
                          <div className="flex flex-wrap gap-1 mt-2">
                            {preset.options.map((opt, i) => (
                              <span
                                key={i}
                                className="font-mono text-[9px] bg-surface-secondary text-text-muted px-1.5 py-0.5 rounded border border-border-subtle"
                              >
                                {opt}
                              </span>
                            ))}
                          </div>
                        </div>

        {/* ══════════════════════════════════════════════════════════════
            TAB 3: PREFERENCES
            ══════════════════════════════════════════════════════════════ */}
        {activeTab === "preferences" && (
          <div className="p-6 sm:p-8 rounded-3xl bg-[#111114] border border-white/[0.08] shadow-md space-y-6 max-w-2xl text-xs">
            <h3 className="font-bold text-lg text-[#f8fafc]">Coffee &amp; Coworking Preferences</h3>
            <div className="space-y-4">
              <div>
                <label className="text-[#94a3b8] block mb-1.5">Default Milk Preference</label>
                <select className="w-full px-3.5 py-2.5 rounded-xl bg-[#18181c] border border-white/[0.08] text-[#f8fafc] focus:outline-none">
                  <option>Oatly Barista Oat Milk</option>
                  <option>Fresh Whole Dairy Milk</option>
                  <option>Almond Milk</option>
                </select>
              </div>
                        <div className="pt-2 space-y-2 border-t border-border-subtle">
                          <div className="flex items-baseline justify-between">
                            <span className="font-mono text-[10px] text-text-muted uppercase">Preset Price</span>
                            <span className="font-mono text-sm text-accent-amber font-bold">
                              Rp {preset.price.toLocaleString('id-ID')}
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleReorderPreset(preset)}
                            className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-brand-coffee to-secondary-container hover:from-primary-container hover:to-secondary text-text-primary font-semibold text-xs flex items-center justify-center gap-1.5 shadow-md transition-all active:scale-[0.98]"
                          >
                            <Zap className="w-3.5 h-3.5" />
                            <span>1-Click Reorder</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

              <div>
                <label className="text-[#94a3b8] block mb-1.5">Preferred Sweetness</label>
                <select className="w-full px-3.5 py-2.5 rounded-xl bg-[#18181c] border border-white/[0.08] text-[#f8fafc] focus:outline-none">
                  <option>50% Less Sweet (Recommended)</option>
                  <option>0% No Sugar / Unsweetened</option>
                  <option>100% Signature Palm Sugar</option>
                </select>
              </div>
            {/* ══════════════════════════════════════════════════════════════
                TAB: ORDER ARCHIVES & TAX INVOICES
                ══════════════════════════════════════════════════════════════ */}
            {activeTab === 'orders' && (
              <section className="space-y-6">
                <div className="flex flex-col space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[10px] text-accent-amber uppercase tracking-wider font-bold">
                      Audit Trail
                    </span>
                    <span className="w-1 h-1 bg-text-muted rounded-full" />
                    <span className="font-mono text-[10px] text-text-muted">PB1 Tax Invoices</span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold text-text-primary font-headline-lg">
                    Order History Archive &amp; Invoices
                  </h2>
                </div>

              <div>
                <label className="text-[#94a3b8] block mb-1.5">Desk Seating Preference</label>
                <select className="w-full px-3.5 py-2.5 rounded-xl bg-[#18181c] border border-white/[0.08] text-[#f8fafc] focus:outline-none">
                  <option>Tech Hub (Dual AC + USB-C 100W PD)</option>
                  <option>Quiet Pod (Sub-35dB Silent Zone)</option>
                  <option>Garden Smoking Balcony</option>
                </select>
              </div>
            </div>
                {/* Filter & Search Bar */}
                <div className="bg-surface-card rounded-2xl p-4 border border-border-subtle shadow-md flex flex-col lg:flex-row gap-4 items-stretch lg:items-center justify-between">
                  {/* Status Pills */}
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setOrderFilter('ALL')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                        orderFilter === 'ALL'
                          ? 'bg-surface-container text-text-primary border border-border-subtle'
                          : 'text-text-muted hover:text-text-primary hover:bg-surface-secondary'
                      }`}
                    >
                      All Orders ({combinedOrders.length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setOrderFilter('PREP')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                        orderFilter === 'PREP'
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : 'text-text-muted hover:text-emerald-400 hover:bg-surface-secondary'
                      }`}
                    >
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                      <span>Brewing / In Prep</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setOrderFilter('COMPLETED')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                        orderFilter === 'COMPLETED'
                          ? 'bg-surface-container text-text-primary border border-border-subtle'
                          : 'text-text-muted hover:text-text-primary hover:bg-surface-secondary'
                      }`}
                    >
                      Completed
                    </button>
                    <button
                      type="button"
                      onClick={() => setOrderFilter('CANCELLED')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                        orderFilter === 'CANCELLED'
                          ? 'bg-surface-container text-text-primary border border-border-subtle'
                          : 'text-text-muted hover:text-text-primary hover:bg-surface-secondary'
                      }`}
                    >
                      Cancelled
                    </button>
                  </div>

            <button
              type="button"
              onClick={() => alert("Preferences saved successfully!")}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#9c6b3a] to-[#ee9800] text-[#f8fafc] font-bold text-xs shadow-md"
            >
              Update Preferences
            </button>
          </div>
        )}
                  {/* Search Input */}
                  <div className="relative w-full lg:w-72">
                    <Search className="w-4 h-4 text-text-muted absolute left-3 top-2.5" />
                    <input
                      type="text"
                      value={orderSearchQuery}
                      onChange={(e) => setOrderSearchQuery(e.target.value)}
                      placeholder="Search ID, Drink, Table..."
                      className="w-full bg-surface-secondary text-text-primary text-xs pl-9 pr-3 py-2 rounded-xl placeholder:text-text-muted border border-border-subtle focus:outline-none focus:bg-surface-container focus:border-accent-amber"
                    />
                  </div>
                </div>

        {/* ══════════════════════════════════════════════════════════════
            TAB 4: SECURITY & SESSIONS
            ══════════════════════════════════════════════════════════════ */}
        {activeTab === "security" && (
          <div className="p-6 sm:p-8 rounded-3xl bg-[#111114] border border-white/[0.08] shadow-md space-y-6 max-w-2xl text-xs">
            <h3 className="font-bold text-lg text-[#f8fafc]">Active Wi-Fi &amp; Web Sessions</h3>
            <div className="space-y-3">
              <div className="p-4 rounded-xl bg-[#18181c] border border-emerald-500/30 flex items-center justify-between">
                <div>
                  <p className="font-bold text-sm text-[#f8fafc]">MacBook Pro 16&quot; (macOS Sonoma)</p>
                  <p className="text-[11px] text-[#94a3b8] mt-0.5">Darmo Flagship • IP 10.24.8.91 (Gigabit Mesh)</p>
                {/* Orders List */}
                <div className="space-y-4">
                  {filteredOrders.length === 0 ? (
                    <div className="p-8 text-center bg-surface-card rounded-2xl border border-border-subtle space-y-3">
                      <Receipt className="w-8 h-8 text-text-muted mx-auto" />
                      <p className="text-sm font-semibold text-text-primary">Tidak ada order yang sesuai filter.</p>
                      <button
                        type="button"
                        onClick={() => {
                          setOrderFilter('ALL');
                          setOrderSearchQuery('');
                        }}
                        className="text-xs text-accent-amber hover:underline font-mono"
                      >
                        Reset Filter
                      </button>
                    </div>
                  ) : (
                    filteredOrders.map((ord) => (
                      <div
                        key={ord.id}
                        className="bg-surface-card rounded-2xl p-5 border border-border-subtle hover:border-border-subtle/80 transition-all shadow-md space-y-4"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border-subtle">
                          <div className="space-y-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="font-mono text-xs font-bold text-accent-amber">{ord.id}</span>
                              <span className="text-border-subtle">•</span>
                              <span className="font-mono text-[11px] text-text-muted">{ord.date}</span>
                            </div>
                            <div className="flex items-center gap-2 pt-0.5">
                              <span className="bg-primary/10 text-primary px-2 py-0.5 rounded-full font-mono text-[10px] font-bold inline-flex items-center gap-1">
                                <Store className="w-3 h-3" />
                                {ord.table}
                              </span>
                              <span className="text-xs text-text-muted">{ord.branch}</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 self-start sm:self-auto">
                            {ord.status === 'IN_PREPARATION' ? (
                              <span className="bg-emerald-500/15 text-emerald-400 px-3 py-1 rounded-xl font-mono text-[10px] font-bold flex items-center gap-1.5 border border-emerald-500/30">
                                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                                Brewing Active
                              </span>
                            ) : ord.status === 'COMPLETED' ? (
                              <span className="bg-surface-secondary text-text-muted px-2.5 py-1 rounded-xl font-mono text-[10px] font-semibold flex items-center gap-1 border border-border-subtle">
                                <Check className="w-3 h-3 text-emerald-400" />
                                Completed
                              </span>
                            ) : (
                              <span className="bg-red-500/10 text-red-400 px-2.5 py-1 rounded-xl font-mono text-[10px] font-semibold border border-red-500/20">
                                Cancelled
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Order Items & Total */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                          <div className="space-y-1">
                            <p className="text-xs font-medium text-text-primary">{ord.itemsSummary}</p>
                            <p className="text-[11px] text-text-muted font-mono">
                              Total {ord.itemCount} items · Pajak PB1 10% Termasuk
                            </p>
                          </div>

                          <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-0 border-border-subtle">
                            <div className="text-left sm:text-right">
                              <span className="block font-mono text-[10px] text-text-muted uppercase">Grand Total</span>
                              <span className="font-mono text-base font-extrabold text-accent-amber">
                                Rp {ord.total.toLocaleString('id-ID')}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Link
                                href={`/order/track/${encodeURIComponent(ord.id)}?receipt=true`}
                                className="px-3 py-1.5 rounded-xl bg-surface-secondary hover:bg-surface-container text-xs text-text-muted hover:text-text-primary border border-border-subtle transition-colors flex items-center gap-1"
                              >
                                <Receipt className="w-3.5 h-3.5" />
                                <span>Receipt</span>
                              </Link>
                              <Link
                                href={`/order/track/${encodeURIComponent(ord.id)}`}
                                className="px-3 py-1.5 rounded-xl bg-brand-coffee/20 hover:bg-brand-coffee/40 text-xs text-primary font-semibold border border-primary/20 transition-colors flex items-center gap-1"
                              >
                                <span>Track</span>
                                <ExternalLink className="w-3.5 h-3.5" />
                              </Link>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
                <span className="font-mono text-[10px] text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded">
                  Active Now
                </span>
              </div>
              </section>
            )}

              <div className="p-4 rounded-xl bg-[#18181c] border border-white/[0.06] flex items-center justify-between">
                <div>
                  <p className="font-bold text-sm text-[#f8fafc]">iPhone 15 Pro (iOS 18)</p>
                  <p className="text-[11px] text-[#94a3b8] mt-0.5">Cellular Telkomsel 5G • 2 hours ago</p>
            {/* ══════════════════════════════════════════════════════════════
                TAB: SAVED LOCATIONS
                ══════════════════════════════════════════════════════════════ */}
            {activeTab === 'locations' && (
              <section className="bg-surface-card rounded-3xl p-6 sm:p-8 border border-border-subtle shadow-xl space-y-6">
                <div className="space-y-1 pb-4 border-b border-border-subtle">
                  <span className="font-mono text-[10px] text-accent-amber uppercase tracking-wider font-bold">
                    Surabaya Mesh
                  </span>
                  <h2 className="text-xl sm:text-2xl font-bold text-text-primary font-headline-lg">
                    Saved Outlets &amp; Favorite Tables
                  </h2>
                  <p className="text-xs text-text-muted">
                    Your preferred sanctuary hubs with instant desk booking priority.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => alert("Session revoked.")}
                  className="text-[11px] text-red-400 hover:underline"
                >
                  Revoke
                </button>
              </div>
            </div>

            <button
              type="button"
              onClick={() => alert("Logged out of all other devices.")}
              className="px-5 py-2.5 rounded-xl bg-red-950/40 border border-red-500/30 text-red-300 font-semibold text-xs hover:bg-red-900/40 transition-colors"
            >
              Sign Out All Other Sessions
            </button>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-5 rounded-2xl bg-surface-secondary border border-border-subtle space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-bold text-primary">Darmo Flagship Sanctuary</span>
                      <span className="bg-accent-amber/15 text-accent-amber px-2 py-0.5 rounded-full font-mono text-[10px] font-bold">
                        Primary Base
                      </span>
                    </div>
                    <p className="text-xs text-text-muted">
                      Jl. Raya Darmo No. 45, Wonokromo, Surabaya 60241
                    </p>
                    <div className="flex items-center gap-4 text-xs font-mono text-text-muted pt-2 border-t border-border-subtle">
                      <span>Preferred Table: #14 (AC)</span>
                      <span>24h Nonstop</span>
                    </div>
                  </div>

                  <div className="p-5 rounded-2xl bg-surface-secondary border border-border-subtle space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-bold text-text-primary">Gubeng Express Hub</span>
                      <span className="bg-surface-container text-text-muted px-2 py-0.5 rounded-full font-mono text-[10px]">
                        Commuter Fast
                      </span>
                    </div>
                    <p className="text-xs text-text-muted">
                      Jl. Stasiun Gubeng No. 12, Genteng, Surabaya 60272
                    </p>
                    <div className="flex items-center gap-4 text-xs font-mono text-text-muted pt-2 border-t border-border-subtle">
                      <span>Self-Pickup Counter</span>
                      <span>06:00 – 23:00</span>
                    </div>
                  </div>
                </div>
              </section>
            )}

            {/* ══════════════════════════════════════════════════════════════
                TAB: PAYMENTS & WALLETS
                ══════════════════════════════════════════════════════════════ */}
            {activeTab === 'payments' && (
              <section className="bg-surface-card rounded-3xl p-6 sm:p-8 border border-border-subtle shadow-xl space-y-6">
                <div className="space-y-1 pb-4 border-b border-border-subtle">
                  <span className="font-mono text-[10px] text-accent-amber uppercase tracking-wider font-bold">
                    Fintech Mesh
                  </span>
                  <h2 className="text-xl sm:text-2xl font-bold text-text-primary font-headline-lg">
                    Payment Methods &amp; Midtrans Tokenization
                  </h2>
                  <p className="text-xs text-text-muted">
                    Direct settlements through Bank Indonesia National QRIS and Virtual Accounts.
                  </p>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between p-4 rounded-2xl bg-surface-secondary border border-border-subtle">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-surface-container flex items-center justify-center font-bold text-accent-amber">
                        <CreditCard className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-text-primary">BCA Virtual Account</p>
                        <p className="font-mono text-[11px] text-text-muted">Auto-detected settlement</p>
                      </div>
                    </div>
                    <span className="font-mono text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full font-bold">
                      Default VA
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-2xl bg-surface-secondary border border-border-subtle">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-surface-container flex items-center justify-center font-bold text-emerald-400">
                        <Zap className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-text-primary">GoPay / ShopeePay / QRIS</p>
                        <p className="font-mono text-[11px] text-text-muted">Real-time instant webhook</p>
                      </div>
                    </div>
                    <span className="font-mono text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full font-bold">
                      Connected
                    </span>
                  </div>
                </div>
              </section>
            )}

            {/* ══════════════════════════════════════════════════════════════
                TAB: SECURITY & SESSIONS
                ══════════════════════════════════════════════════════════════ */}
            {activeTab === 'security' && (
              <section className="bg-surface-card rounded-3xl p-6 sm:p-8 border border-border-subtle shadow-xl space-y-6">
                <div className="space-y-1 pb-4 border-b border-border-subtle">
                  <span className="font-mono text-[10px] text-accent-amber uppercase tracking-wider font-bold">
                    Zero-Trust Access
                  </span>
                  <h2 className="text-xl sm:text-2xl font-bold text-text-primary font-headline-lg">
                    Security &amp; Active Device Sessions
                  </h2>
                  <p className="text-xs text-text-muted">
                    Review logged-in devices connected to your Warkop Ya&apos;reh patron credentials.
                  </p>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between p-4 rounded-2xl bg-surface-secondary border border-border-subtle">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-surface-container flex items-center justify-center text-primary">
                        <ShieldCheck className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-text-primary">Current Web Session (Windows / Chrome)</p>
                        <p className="font-mono text-[11px] text-text-muted">Surabaya, ID · IP 180.252.xxx.xxx · Active Now</p>
                      </div>
                    </div>
                    <span className="font-mono text-[10px] text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full font-bold">
                      This Device
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-2xl bg-surface-secondary border border-border-subtle">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-surface-container flex items-center justify-center text-text-muted">
                        <Lock className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-text-primary">Two-Factor Authentication (2FA)</p>
                        <p className="text-[11px] text-text-muted">Secured via registered WhatsApp OTP</p>
                      </div>
                    </div>
                    <span className="font-mono text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full font-bold">
                      Enabled
                    </span>
                  </div>
                </div>
              </section>
            )}
          </div>
        )}
      </div>
        </div>
      </main>
    </div>
  );
}
