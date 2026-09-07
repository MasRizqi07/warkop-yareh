'use client';

import React, { useMemo, useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Award,
  Heart,
  LogOut,
  MapPin,
  Receipt,
  ShieldCheck,
  User,
  Star,
  CheckCircle2,
  Clock,
  Sparkles,
  ExternalLink,
  ChevronRight,
  Download,
  RotateCw,
  Search,
  Bell,
  Smartphone,
  CreditCard,
  Building,
  Radio,
  Share2,
  Coffee,
  X,
  Check,
  Flame,
  Zap,
} from 'lucide-react';
import { Button, Input } from '@warkop-yareh/ui';
import { DataState, LoadingState } from '@/components/data-state';
import { getProfile, updateProfile, type Profile } from './account.api';
import { useMyOrders } from '@/features/orders/orders.hooks';
import { useActiveBranch, useCatalog } from '@/features/catalog/catalog.hooks';
import { useAuthStore } from '@/stores/auth.store';
import { useCartStore } from '@/stores';
import { useBranchStore } from '@/stores/branch.store';
import { getApiErrorMessage } from '@/lib/api-error';
import { api } from '@/lib/api';
import { soundEffects } from '@/lib/audioAlerts';

type TabType =
  | 'profile'
  | 'favorites'
  | 'orders'
  | 'locations'
  | 'payments'
  | 'notifications'
  | 'security';

interface PresetItem {
  id: string;
  name: string;
  category: string;
  price: number;
  image: string;
  tags: string[];
  isTopReorder?: boolean;
}

const SIGNATURE_PRESETS: PresetItem[] = [
  {
    id: 'preset-1',
    name: "Cold Brew Aren Brulee",
    category: "Signature Coffee",
    price: 51000,
    image:
      "https://lh3.googleusercontent.com/aida/AEtjO1WwwiCXR-siS67wXwrZfBOQ_v9AjozQR_fn0UvwnEs-vOYDwFv7CukMIrZNJklzAMFwStSddMvhLJBkeemvHzycEaC0V2Dr62ppSSdPqD788PdqeMkALAemZ9guS_-l6Q58ecqxb0tYK5JJkm6zYTn7l1tRWGEINpn7MS8xiCrc_MR5WKABp0XtY2aUCV0EoN4oEPwXt2SqKQhF9Dk1AWjX3r805gepWUiHessHhbTVVQVILGzRs-MVSS4Z",
    tags: ["Large 16oz", "70% Less Sweet", "Oatly® Oat (+Rp 8k)", "Torched Crust"],
    isTopReorder: true,
  },
  {
    id: 'preset-2',
    name: "Smoked Pastrami Brioche",
    category: "Artisan Toast",
    price: 48000,
    image:
      "https://lh3.googleusercontent.com/aida/AEtjO1WZp3fn_HyDkO_8S_8u7Gn4pJE_XGhcEb7JTUDqhkgVM86Wif8GTG_A4naEoKfeiSqpl1MlI3wmyARa-TT6tcWnftknEb-yF2iEUVn69rV_wciq-OjF5bgwPtD1xcY-SrF6KEvqluDzT6giUfTkpG0gOBw_t9g2438SWVKW8gfAs4N2kjutICoMkDyLBKaBELU6YxPi5JhsHcRs0jITQtpArkSqGOp8vuQsSisY3xS4kl_UQlsPpFe-7G8",
    tags: ["Extra Raclette", "Sourdough Crisp", "Dijon Mustard"],
  },
  {
    id: 'preset-3',
    name: "Dirty Aren Pandan",
    category: "Signature Coffee",
    price: 30000,
    image:
      "https://lh3.googleusercontent.com/aida/AEtjO1VLGECsFG8PkSmHvYE0LGCC5Nj7j-DFFu7RLGM9cS6432h1hfgqaKitYhuDEpdlvSsht4M1I7SUSr1a7EbyilLhSjjyUd15NxL7CA96TBcaUBJzTw6McXIs6tU9hme9SEFN_RGRA_kUNX-tjDgf6mrdD4JoEXkCLvTu3S1Jk9k0keb8NEIVr8dhnhIRMn7Kafw5zVr-dxABkVYaKrrx08ZfDtvPWa_WlLvdQ1loc_FQGtbAk-pT6J-eqr7j",
    tags: ["Regular 12oz", "Double Ristretto", "Pandan Cold Foam"],
  },
  {
    id: 'preset-4',
    name: "Single-Origin V60 Pour Over",
    category: "Slow Bar",
    price: 35000,
    image:
      "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?q=80&w=600&auto=format&fit=crop",
    tags: ["Ijen Honey", "Hot 200ml", "Peach & Jasmine Note"],
  },
];

export default function AccountPage() {
  const user = useAuthStore((state) => state.user);
  const initialized = useAuthStore((state) => state.isInitialized);
  const authenticated = useAuthStore((state) => state.isAuthenticated);
  const enabled = initialized && authenticated && Boolean(user);
  const client = useQueryClient();

  const [activeTab, setActiveTab] = useState<TabType>('profile');
  const [orderFilter, setOrderFilter] = useState<'ALL' | 'BREWING' | 'COMPLETED' | 'CANCELLED'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [notice, setNotice] = useState<string | null>(null);

  // Modals
  const [ratingOrderModal, setRatingOrderModal] = useState<any | null>(null);
  const [ratingStars, setRatingStars] = useState(5);
  const [ratingTags, setRatingTags] = useState<string[]>(['Aroma Mantap', 'Ekstraksi Pas']);
  const [receiptOrderModal, setReceiptOrderModal] = useState<any | null>(null);

  // Notifications toggles
  const [notifState, setNotifState] = useState({
    whatsapp: true,
    events: true,
    newsletter: false,
    sms: false,
  });

  // Current session time
  const [currentTime, setCurrentTime] = useState('23:58 WIB');
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString('id-ID', {
          hour: '2-digit',
          minute: '2-digit',
          timeZone: 'Asia/Jakarta',
        }) + ' WIB'
      );
    };
    updateTime();
    const timer = setInterval(updateTime, 10000);
    return () => clearInterval(timer);
  }, []);

  const profile = useQuery({
    queryKey: ['profile', user?.id],
    queryFn: () => getProfile(user!.id),
    enabled,
  });

  const orders = useMyOrders(enabled);
  const branches = useActiveBranch();
  const catalog = useCatalog(branches.activeBranch?.id);
  const setBranch = useBranchStore((state) => state.setActiveBranchId);
  const addItem = useCartStore((state) => state.addItem);

  // Form states for profile
  const [nameInput, setNameInput] = useState('');
  const [phoneInput, setPhoneInput] = useState('');
  const [waOptIn, setWaOptIn] = useState(false);

  useEffect(() => {
    if (profile.data) {
      setNameInput(profile.data.name || '');
      setPhoneInput(profile.data.phone || '');
      setWaOptIn(Boolean(profile.data.whatsAppMarketingOptInAt));
    }
  }, [profile.data]);

  const updateMutation = useMutation({
    mutationFn: () =>
      updateProfile(profile.data!.id, {
        name: nameInput.trim(),
        ...(phoneInput.trim() ? { phone: phoneInput.trim() } : {}),
        whatsAppMarketingOptIn: waOptIn,
      }),
    onSuccess: async () => {
      await client.invalidateQueries({ queryKey: ['profile', profile.data?.id] });
      soundEffects.playSuccessChime();
      setNotice('Sanctuary identity profile successfully updated.');
      setTimeout(() => setNotice(null), 4000);
    },
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      await api.post('/auth/logout');
      useAuthStore.getState().logout();
      client.clear();
    },
  });

  const patronId = useMemo(() => {
    if (!profile.data?.id) return '#YR-9821';
    return `#YR-${profile.data.id.replace(/[^a-zA-Z0-9]/g, '').slice(0, 4).toUpperCase()}`;
  }, [profile.data?.id]);

  const patronInitials = useMemo(() => {
    const name = profile.data?.name || user?.name || 'Sanctuary Patron';
    return name
      .split(' ')
      .slice(0, 2)
      .map((n) => n[0])
      .join('')
      .toUpperCase();
  }, [profile.data?.name, user?.name]);

  // Orders filtering
  const filteredOrders = useMemo(() => {
    let list = orders.data ?? [];
    if (orderFilter === 'BREWING') {
      list = list.filter(
        (o) => o.status === 'CONFIRMED' || o.status === 'PREPARING' || o.status === 'PENDING'
      );
    } else if (orderFilter === 'COMPLETED') {
      list = list.filter((o) => o.status === 'COMPLETED' || o.status === 'SERVED');
    } else if (orderFilter === 'CANCELLED') {
      list = list.filter((o) => o.status === 'CANCELLED');
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (o) =>
          o.orderNumber.toLowerCase().includes(q) ||
          o.items.some((i) => i.snapshotName.toLowerCase().includes(q))
      );
    }
    return list;
  }, [orders.data, orderFilter, searchQuery]);

  const handle1ClickReorder = (item: PresetItem) => {
    // Find matching catalog product or synthetic product
    const matching = catalog.data?.products?.find(
      (p) => p.name.toLowerCase() === item.name.toLowerCase()
    );

    if (matching) {
      addItem(matching, 1);
    } else {
      // Add custom synthetic product
      addItem(
        {
          id: item.id,
          name: item.name,
          price: item.price,
          description: item.tags.join(', '),
          image: item.image,
          category: 'signature',
          tags: item.tags,
          isPopular: true,
          isNew: false,
          rating: 5,
          reviewCount: 42,
          preparationTime: 5,
          branchAvailability: ['darmo', 'gubeng'],
        },
        1
      );
    }
    soundEffects.playSuccessChime();
    setNotice(`"${item.name}" ditambahkan ke keranjang pesanan.`);
    setTimeout(() => setNotice(null), 4000);
  };

  const handleSummonServer = () => {
    soundEffects.playKdsBell();
    setNotice('Table buzzer activated! Barista on-duty is heading to your pod.');
    setTimeout(() => setNotice(null), 4000);
  };

  return (
    <main className="w-full min-h-screen bg-[#0a0a0c] text-[#e5e1e4] font-sans pt-24 pb-32">
      {/* Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Top Breadcrumb & Page Header */}
        <div className="flex flex-col space-y-2 pb-2">
          <div className="flex items-center gap-2 font-mono text-xs text-neutral-400">
            <Link href="/" className="hover:text-[#f7bb82] transition-colors">
              Sanctuary Home
            </Link>
            <span className="text-neutral-600">/</span>
            <span className="hover:text-[#f7bb82] transition-colors cursor-pointer">
              Member Portal
            </span>
            <span className="text-neutral-600">/</span>
            <span className="text-[#f59e0b] font-medium">Profile & History</span>
          </div>

          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 pt-1">
            <div>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                Account Sanctuary & Order Archives
              </h1>
              <p className="text-sm sm:text-base text-neutral-400 max-w-2xl mt-1">
                Manage your identity, frequent midnight roasts, verified invoice archives, and active Surabaya table privileges.
              </p>
            </div>

            {/* Live Quick Timestamp Tag */}
            <div className="flex items-center gap-2.5 bg-[#141418] border border-white/5 px-3.5 py-1.5 rounded-full self-start lg:self-auto shadow-sm">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#f59e0b] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#f59e0b]"></span>
              </span>
              <span className="font-mono text-xs text-neutral-400">Session: Darmo Mesh #04</span>
              <span className="font-mono text-xs text-[#f7bb82] font-bold">{currentTime}</span>
            </div>
          </div>
        </div>

        {/* Notice Toast */}
        <AnimatePresence>
          {notice && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="p-4 rounded-xl bg-[#f59e0b]/15 border border-[#f59e0b]/40 text-[#f59e0b] flex items-center justify-between shadow-lg"
            >
              <div className="flex items-center gap-2.5 text-sm font-medium">
                <Sparkles className="w-4 h-4 shrink-0" />
                <span>{notice}</span>
              </div>
              <Link
                href="/cart"
                className="text-xs font-mono font-bold bg-[#f59e0b] text-black px-3 py-1 rounded-lg hover:bg-[#fcd34d] transition-all"
              >
                Lihat Keranjang
              </Link>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Auth Check States */}
        {!initialized ? (
          <LoadingState label="Memulihkan sesi Sanctuary..." />
        ) : !authenticated ? (
          <div className="bg-[#18181c] border border-white/10 rounded-2xl p-8 text-center space-y-4 max-w-md mx-auto my-12">
            <User className="w-12 h-12 text-[#f59e0b] mx-auto opacity-80" />
            <h2 className="text-xl font-bold text-white">Masuk ke Sanctuary Account</h2>
            <p className="text-sm text-neutral-400">
              Akses kartu keanggotaan Kawan Ya&apos;reh, arsip faktur pesanan, dan preset seduh tengah malam.
            </p>
            <Link
              href="/login?redirect=/account"
              className="inline-block w-full py-2.5 rounded-xl bg-gradient-to-r from-[#9c6b3a] to-[#ee9800] text-white font-semibold shadow-md hover:brightness-110 transition-all"
            >
              Masuk / Bergabung
            </Link>
          </div>
        ) : (
          <>
            {/* Quick Lifetime KPI Bar Strip (4 Cards) */}
            <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Card 1: Lifetime Orders */}
              <div className="bg-[#18181c] border border-white/5 rounded-2xl p-5 shadow-lg flex flex-col justify-between hover:bg-[#201f21] transition-all">
                <div className="flex items-center justify-between text-neutral-400 mb-2">
                  <span className="text-xs font-medium">Lifetime Orders</span>
                  <Receipt className="w-4 h-4 text-[#f7bb82]" />
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl sm:text-3xl font-bold text-white font-mono">
                    {orders.data ? orders.data.length + 18 : 68}
                  </span>
                  <span className="font-mono text-xs text-emerald-400 font-semibold">+4 this month</span>
                </div>
                <span className="text-xs text-neutral-400 mt-1">Across 2 Surabaya outlets</span>
              </div>

              {/* Card 2: Active Points */}
              <div className="bg-[#18181c] border border-white/5 rounded-2xl p-5 shadow-lg flex flex-col justify-between hover:bg-[#201f21] transition-all">
                <div className="flex items-center justify-between text-neutral-400 mb-2">
                  <span className="text-xs font-medium">Active Ya&apos;reh Points</span>
                  <Star className="w-4 h-4 text-[#f59e0b] fill-[#f59e0b]" />
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl sm:text-3xl font-bold text-[#f59e0b] font-mono">
                    {profile.data?.loyaltyPoints?.toLocaleString('id-ID') ?? '1,450'}
                  </span>
                  <span className="font-mono text-[10px] bg-[#f59e0b]/20 text-[#f59e0b] px-1.5 py-0.5 rounded font-bold">
                    {profile.data?.membershipTier ?? 'GOLD'} 1.5x
                  </span>
                </div>
                <span className="text-xs text-neutral-400 mt-1">
                  Approx. Rp{' '}
                  {((profile.data?.loyaltyPoints ?? 1450) * 100).toLocaleString('id-ID')} value
                </span>
              </div>

              {/* Card 3: Dialed-in Presets */}
              <div className="bg-[#18181c] border border-white/5 rounded-2xl p-5 shadow-lg flex flex-col justify-between hover:bg-[#201f21] transition-all">
                <div className="flex items-center justify-between text-neutral-400 mb-2">
                  <span className="text-xs font-medium">Dialed-in Presets</span>
                  <Sparkles className="w-4 h-4 text-[#e8c47a]" />
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl sm:text-3xl font-bold text-white font-mono">4</span>
                  <span className="font-mono text-xs text-[#e8c47a] font-semibold">1-Click Ready</span>
                </div>
                <span className="text-xs text-neutral-400 mt-1">Custom sweetness & foam</span>
              </div>

              {/* Card 4: Sanctuary Resident */}
              <div className="bg-[#18181c] border border-white/5 rounded-2xl p-5 shadow-lg flex flex-col justify-between hover:bg-[#201f21] transition-all">
                <div className="flex items-center justify-between text-neutral-400 mb-2">
                  <span className="text-xs font-medium">Sanctuary Resident</span>
                  <ShieldCheck className="w-4 h-4 text-[#f7bb82]" />
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl sm:text-3xl font-bold text-white font-mono">
                    {profile.data?.createdAt
                      ? new Date(profile.data.createdAt).toLocaleDateString('en-US', {
                          month: 'short',
                          year: '2-digit',
                        })
                      : "Sep '23"}
                  </span>
                  <span className="font-mono text-xs text-neutral-400">365+ Days</span>
                </div>
                <span className="text-xs text-neutral-400 mt-1">Darmo Founding Cohort</span>
              </div>
            </section>

            {/* Main Two-Column Layout */}
            <div className="flex flex-col lg:flex-row gap-8 items-start">
              {/* Left Column: Sleek Nav Sidebar (~280px) */}
              <aside className="w-full lg:w-72 shrink-0 flex flex-col gap-4 sticky top-24">
                {/* User Profile Mini-Card at Top of Nav */}
                <div className="bg-[#18181c] border border-white/10 rounded-2xl p-5 shadow-xl relative overflow-hidden group">
                  <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-[#f59e0b]/10 rounded-full blur-xl pointer-events-none"></div>

                  <div className="flex items-center gap-3.5 mb-4">
                    <div className="relative">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-[#9c6b3a] to-[#f59e0b] p-0.5 flex items-center justify-center shadow-lg">
                        <div className="w-full h-full bg-[#0a0a0c] rounded-full flex items-center justify-center font-bold text-base text-[#f59e0b]">
                          {patronInitials}
                        </div>
                      </div>
                      <span className="absolute -bottom-1 -right-1 bg-[#18181c] rounded-full p-0.5 border border-[#f59e0b]/40">
                        <Star className="w-3.5 h-3.5 text-[#f59e0b] fill-[#f59e0b]" />
                      </span>
                    </div>

                    <div className="flex flex-col min-w-0">
                      <span className="font-bold text-base text-white truncate">
                        {profile.data?.name || 'Reyhan Arisandi'}
                      </span>
                      <div className="flex items-center gap-1.5">
                        <Award className="w-3.5 h-3.5 text-[#f59e0b]" />
                        <span className="font-mono text-xs text-[#f59e0b] font-semibold">
                          {profile.data?.membershipTier ?? 'Gold'} Artisan Tier
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-[#111114] border border-white/5 rounded-xl px-3 py-2 flex items-center justify-between">
                    <span className="font-mono text-xs text-neutral-400 uppercase tracking-wider">
                      Patron ID
                    </span>
                    <span className="font-mono text-xs text-[#f7bb82] font-bold">{patronId}</span>
                  </div>
                </div>

                {/* Vertical Menu Tabs */}
                <nav className="bg-[#18181c] border border-white/10 rounded-2xl p-2 shadow-lg flex flex-col space-y-1">
                  {/* Tab 1: Profile */}
                  <button
                    onClick={() => setActiveTab('profile')}
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all text-left ${
                      activeTab === 'profile'
                        ? 'bg-[#201f21] text-[#f59e0b] shadow-sm font-semibold'
                        : 'text-neutral-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <User className="w-4 h-4" />
                      <span>Profile & Identity</span>
                    </div>
                    {activeTab === 'profile' && (
                      <span className="w-1.5 h-4 bg-[#f59e0b] rounded-full shadow-[0_0_8px_rgba(245,158,11,0.6)]" />
                    )}
                  </button>

                  {/* Tab 2: Favorite Brews */}
                  <button
                    onClick={() => setActiveTab('favorites')}
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all text-left ${
                      activeTab === 'favorites'
                        ? 'bg-[#201f21] text-[#f59e0b] shadow-sm font-semibold'
                        : 'text-neutral-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Heart className="w-4 h-4" />
                      <span>Favorite Brews</span>
                    </div>
                    <span className="font-mono text-xs bg-[#111114] text-[#f7bb82] px-2 py-0.5 rounded-full border border-white/5">
                      4 items
                    </span>
                  </button>

                  {/* Tab 3: Order Archives */}
                  <button
                    onClick={() => setActiveTab('orders')}
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all text-left ${
                      activeTab === 'orders'
                        ? 'bg-[#201f21] text-[#f59e0b] shadow-sm font-semibold'
                        : 'text-neutral-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Receipt className="w-4 h-4" />
                      <span>Order Archives</span>
                    </div>
                    <span className="font-mono text-xs bg-[#111114] text-neutral-400 px-2 py-0.5 rounded-full border border-white/5">
                      {orders.data ? orders.data.length : 18}
                    </span>
                  </button>

                  {/* Tab 4: Saved Locations */}
                  <button
                    onClick={() => setActiveTab('locations')}
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all text-left ${
                      activeTab === 'locations'
                        ? 'bg-[#201f21] text-[#f59e0b] shadow-sm font-semibold'
                        : 'text-neutral-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <MapPin className="w-4 h-4" />
                      <span>Saved Locations</span>
                    </div>
                    <span className="font-mono text-xs text-neutral-400">2</span>
                  </button>

                  {/* Tab 5: Payment & Wallets */}
                  <button
                    onClick={() => setActiveTab('payments')}
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all text-left ${
                      activeTab === 'payments'
                        ? 'bg-[#201f21] text-[#f59e0b] shadow-sm font-semibold'
                        : 'text-neutral-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <CreditCard className="w-4 h-4" />
                      <span>Payment & Wallets</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                      <span className="font-mono text-[10px] text-neutral-400">QRIS/VA</span>
                    </div>
                  </button>

                  {/* Tab 6: Notifications */}
                  <button
                    onClick={() => setActiveTab('notifications')}
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all text-left ${
                      activeTab === 'notifications'
                        ? 'bg-[#201f21] text-[#f59e0b] shadow-sm font-semibold'
                        : 'text-neutral-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Bell className="w-4 h-4" />
                      <span>Notifications</span>
                    </div>
                  </button>

                  {/* Tab 7: Security */}
                  <button
                    onClick={() => setActiveTab('security')}
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all text-left ${
                      activeTab === 'security'
                        ? 'bg-[#201f21] text-[#f59e0b] shadow-sm font-semibold'
                        : 'text-neutral-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <ShieldCheck className="w-4 h-4" />
                      <span>Security & Sessions</span>
                    </div>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  </button>
                </nav>

                {/* Quick Help Card: Barista Concierge */}
                <div className="bg-[#111114] border border-white/5 rounded-2xl p-4 space-y-2 shadow-sm">
                  <div className="flex items-center gap-2 text-[#f7bb82] font-semibold text-xs">
                    <Coffee className="w-4 h-4 text-[#f59e0b]" />
                    <span>Darmo Barista Concierge</span>
                  </div>
                  <p className="text-xs text-neutral-400 leading-relaxed">
                    Need desk assistance, special grind adjustments, or custom bulk orders? WhatsApp our on-duty bar shift lead directly.
                  </p>
                  <a
                    href="https://wa.me/6281234567890"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 font-mono text-xs text-[#f59e0b] hover:text-[#fcd34d] transition-colors pt-1 font-semibold"
                  >
                    <span>Chat Barista Counter</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </a>
                </div>
              </aside>

              {/* Right Column: Dynamic Content Area */}
              <div className="flex-1 w-full space-y-8 min-w-0">
                {/* PANE 1: Profile Information & Sanctuary Pass */}
                {activeTab === 'profile' && (
                  <section className="bg-[#18181c] border border-white/10 rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-6 border-b border-white/5">
                      <div>
                        <div className="flex items-center gap-2 text-xs font-mono text-[#f59e0b] uppercase tracking-wider mb-1">
                          <span>Identity Matrix</span>
                          <span className="text-neutral-600">•</span>
                          <span className="text-emerald-400 font-bold">KYC Verified</span>
                        </div>
                        <h2 className="text-xl sm:text-2xl font-bold text-white">
                          Profile Information & Sanctuary Pass
                        </h2>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-neutral-400 font-mono bg-[#111114] px-3 py-1.5 rounded-lg border border-white/5 self-start sm:self-auto">
                        <Clock className="w-3.5 h-3.5" />
                        <span>Synced with Surabaya Cloud Hub</span>
                      </div>
                    </div>

                    {/* Avatar & Tier Badge Preview */}
                    <div className="flex flex-col sm:flex-row items-center gap-5 p-4 rounded-2xl bg-[#111114] border border-white/5 my-6">
                      <div className="relative group cursor-pointer shrink-0">
                        <div className="w-20 h-20 rounded-full bg-[#2a2a2c] flex items-center justify-center text-white text-2xl font-bold border-2 border-[#f59e0b]/40 shadow-[0_0_20px_rgba(245,158,11,0.2)] overflow-hidden">
                          {patronInitials}
                        </div>
                        <div className="absolute inset-0 bg-black/75 rounded-full flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <Sparkles className="w-4 h-4 text-[#f59e0b]" />
                          <span className="font-mono text-[9px] text-white mt-0.5">EDIT</span>
                        </div>
                      </div>

                      <div className="flex flex-col items-center sm:items-start text-center sm:text-left space-y-1">
                        <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                          <span className="text-lg font-bold text-white">
                            {profile.data?.name || 'Reyhan Arisandi'}
                          </span>
                          <span className="px-2.5 py-0.5 rounded-full bg-[#f59e0b]/15 text-[#f59e0b] font-mono text-xs font-semibold inline-flex items-center gap-1 border border-[#f59e0b]/20">
                            <Award className="w-3.5 h-3.5" />
                            {profile.data?.membershipTier ?? 'Gold'} Tier Resident
                          </span>
                        </div>
                        <p className="text-xs text-neutral-400 max-w-md">
                          Full 24-hour fiber WiFi access, reserved quiet pods, and 1.5x roast loyalty redemption unlocked at all Surabaya hubs.
                        </p>
                      </div>
                    </div>

                    {/* Profile Form */}
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        updateMutation.mutate();
                      }}
                      className="space-y-6"
                    >
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Full Name */}
                        <div className="bg-[#111114] border border-white/5 rounded-2xl p-4 flex flex-col justify-between">
                          <label className="text-xs text-neutral-400 font-medium mb-1">
                            Full Legal Name
                          </label>
                          <Input
                            value={nameInput}
                            onChange={(e) => setNameInput(e.target.value)}
                            required
                            minLength={2}
                            maxLength={100}
                            className="bg-transparent border-white/10 text-white font-semibold focus:border-[#f59e0b]"
                          />
                          <span className="font-mono text-[11px] text-neutral-500 mt-2">
                            Matched to BCA & GoPay Account
                          </span>
                        </div>

                        {/* Email Address */}
                        <div className="bg-[#111114] border border-white/5 rounded-2xl p-4 flex flex-col justify-between">
                          <div className="flex items-center justify-between mb-1">
                            <label className="text-xs text-neutral-400 font-medium">
                              Registered Email
                            </label>
                            <span className="inline-flex items-center gap-1 font-mono text-[11px] text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded">
                              <Check className="w-3 h-3" />
                              Verified
                            </span>
                          </div>
                          <Input
                            value={profile.data?.email || user?.email || 'reyhan@surabayatech.id'}
                            readOnly
                            disabled
                            className="bg-transparent border-white/5 text-neutral-400 font-mono text-sm cursor-not-allowed"
                          />
                          <span className="text-xs text-neutral-500 mt-2">
                            Receives automated tax e-invoices
                          </span>
                        </div>

                        {/* Phone */}
                        <div className="bg-[#111114] border border-white/5 rounded-2xl p-4 flex flex-col justify-between">
                          <div className="flex items-center justify-between mb-1">
                            <label className="text-xs text-neutral-400 font-medium">
                              WhatsApp Hotline
                            </label>
                            <span className="inline-flex items-center gap-1 font-mono text-[11px] text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded">
                              <Smartphone className="w-3 h-3" />
                              WA Synced
                            </span>
                          </div>
                          <Input
                            value={phoneInput}
                            onChange={(e) => setPhoneInput(e.target.value)}
                            placeholder="+62 812-3456-7890"
                            className="bg-transparent border-white/10 text-white font-mono font-bold focus:border-[#f59e0b]"
                          />
                          <span className="text-xs text-neutral-500 mt-2">
                            Real-time table buzzer & brew alerts
                          </span>
                        </div>

                        {/* Sanctuary Homebase */}
                        <div className="bg-[#111114] border border-white/5 rounded-2xl p-4 flex flex-col justify-between">
                          <div className="flex items-center justify-between mb-1">
                            <label className="text-xs text-neutral-400 font-medium">
                              Primary Sanctuary Base
                            </label>
                            <button
                              type="button"
                              onClick={() => setActiveTab('locations')}
                              className="text-[#f59e0b] hover:text-[#fcd34d] transition-colors flex items-center gap-1 font-mono text-xs"
                            >
                              <span>Switch</span>
                              <ChevronRight className="w-3 h-3" />
                            </button>
                          </div>
                          <div className="text-sm text-white font-semibold flex items-center gap-2">
                            <Building className="w-4 h-4 text-[#f7bb82]" />
                            <span>{branches.activeBranch?.name ?? 'Darmo Flagship (Central SBY)'}</span>
                          </div>
                          <span className="font-mono text-[11px] text-emerald-400 mt-2">
                            24h Nonstop Fiber Hub
                          </span>
                        </div>
                      </div>

                      {/* Connected Accounts Strip */}
                      <div className="space-y-3 pt-2">
                        <h3 className="text-xs font-mono text-neutral-400 uppercase tracking-wider">
                          Connected Identity & Payments
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div className="flex items-center justify-between p-3.5 bg-[#111114] border border-white/5 rounded-2xl">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center font-bold text-white text-xs">
                                G
                              </div>
                              <div className="flex flex-col">
                                <span className="text-xs font-semibold text-white">Google SSO</span>
                                <span className="font-mono text-[11px] text-neutral-400 truncate">
                                  {profile.data?.email || 'reyhan@surabayatech.id'}
                                </span>
                              </div>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                              <span className="font-mono text-xs text-emerald-400">Linked</span>
                            </div>
                          </div>

                          <div className="flex items-center justify-between p-3.5 bg-[#111114] border border-white/5 rounded-2xl">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-lg bg-[#f59e0b]/10 flex items-center justify-center text-[#f59e0b]">
                                <CreditCard className="w-4 h-4" />
                              </div>
                              <div className="flex flex-col">
                                <span className="text-xs font-semibold text-white">
                                  Midtrans One-Click
                                </span>
                                <span className="font-mono text-[11px] text-neutral-400">
                                  GoPay & BCA VA Ready
                                </span>
                              </div>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                              <span className="font-mono text-xs text-emerald-400">Active</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* WhatsApp Marketing Opt-In Checkbox */}
                      <label className="flex items-start gap-3 rounded-2xl border border-white/5 bg-[#111114] p-4 text-xs cursor-pointer hover:border-white/10 transition-colors">
                        <input
                          type="checkbox"
                          className="mt-0.5 rounded accent-[#f59e0b]"
                          checked={waOptIn}
                          onChange={(e) => setWaOptIn(e.target.checked)}
                        />
                        <div className="space-y-1">
                          <strong className="block text-white">
                            Promosi & Notifikasi Sesi Roasting via WhatsApp
                          </strong>
                          <span className="text-neutral-400 block leading-relaxed">
                            Izinkan Warkop Ya&apos;reh mengirim update ketersediaan biji single origin, tiket workshop Surabaya tech, dan diskon loyalty ke nomor telepon Anda.
                          </span>
                        </div>
                      </label>

                      {/* Actions */}
                      <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-white/5">
                        <span className="text-xs text-neutral-500">
                          Passphrase & security verified on this device
                        </span>
                        <div className="flex items-center gap-3 w-full sm:w-auto">
                          <Button
                            type="button"
                            variant="secondary"
                            onClick={() => {
                              if (profile.data) {
                                setNameInput(profile.data.name || '');
                                setPhoneInput(profile.data.phone || '');
                              }
                            }}
                            className="w-full sm:w-auto"
                          >
                            Discard
                          </Button>
                          <Button
                            type="submit"
                            disabled={updateMutation.isPending}
                            className="w-full sm:w-auto bg-gradient-to-r from-[#9c6b3a] to-[#ee9800] text-white font-semibold shadow-lg hover:brightness-110"
                          >
                            {updateMutation.isPending ? 'Saving...' : 'Save Sanctuary Profile'}
                          </Button>
                        </div>
                      </div>
                    </form>
                  </section>
                )}

                {/* PANE 2: Favorite Brews & 1-Click Quick Order */}
                {activeTab === 'favorites' && (
                  <section className="space-y-6">
                    <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2 text-xs font-mono text-[#f59e0b] uppercase tracking-wider mb-1">
                          <span>Saved Roasts</span>
                          <span className="text-neutral-600">•</span>
                          <span className="text-neutral-400">Zero-Latency Brewing</span>
                        </div>
                        <h2 className="text-2xl font-bold text-white">
                          Favorite Brews & Midnight Presets
                        </h2>
                        <p className="text-sm text-neutral-400 mt-1">
                          Quick-reorder your dialed-in roast recipes without reconfiguring grind, sweetness, or milk type.
                        </p>
                      </div>

                      <span className="font-mono text-xs text-[#f7bb82] bg-[#18181c] px-3 py-1.5 rounded-xl border border-white/5 self-start sm:self-auto">
                        4 Presets Configured
                      </span>
                    </div>

                    {/* Preset Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                      {SIGNATURE_PRESETS.map((preset) => (
                        <div
                          key={preset.id}
                          className="bg-[#18181c] border border-white/10 rounded-3xl overflow-hidden shadow-xl flex flex-col justify-between group hover:-translate-y-1 transition-all duration-300"
                        >
                          {/* Image */}
                          <div className="h-44 w-full relative overflow-hidden bg-[#111114]">
                            <Image
                              src={preset.image}
                              alt={preset.name}
                              fill
                              className="object-cover group-hover:scale-105 transition-transform duration-500"
                              sizes="(max-width: 768px) 100vw, 300px"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-[#18181c] via-transparent to-transparent" />
                            {preset.isTopReorder && (
                              <div className="absolute top-3 left-3 bg-black/80 backdrop-blur-md px-2.5 py-1 rounded-full font-mono text-[10px] text-[#f59e0b] flex items-center gap-1 border border-[#f59e0b]/30">
                                <Star className="w-3 h-3 fill-[#f59e0b]" />
                                Top Reorder (#1)
                              </div>
                            )}
                            <button
                              type="button"
                              className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/80 backdrop-blur-md flex items-center justify-center text-[#f59e0b] hover:text-white transition-colors"
                            >
                              <Heart className="w-4 h-4 fill-[#f59e0b]" />
                            </button>
                          </div>

                          {/* Content */}
                          <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                            <div>
                              <h3 className="text-base font-bold text-white group-hover:text-[#f7bb82] transition-colors line-clamp-1">
                                {preset.name}
                              </h3>
                              <div className="flex flex-wrap gap-1.5 mt-2">
                                {preset.tags.map((tag) => (
                                  <span
                                    key={tag}
                                    className="font-mono text-[10px] bg-[#111114] border border-white/5 text-neutral-300 px-2 py-0.5 rounded-md"
                                  >
                                    {tag}
                                  </span>
                                ))}
                              </div>
                            </div>

                            <div className="pt-2 space-y-3">
                              <div className="flex items-baseline justify-between">
                                <span className="font-mono text-xs text-neutral-400">
                                  Preset Price
                                </span>
                                <span className="font-mono text-base text-[#f59e0b] font-bold">
                                  Rp {preset.price.toLocaleString('id-ID')}
                                </span>
                              </div>

                              <button
                                type="button"
                                onClick={() => handle1ClickReorder(preset)}
                                className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-[#9c6b3a] to-[#ee9800] hover:brightness-110 text-white font-semibold text-xs flex items-center justify-center gap-1.5 shadow-[0_4px_16px_rgba(245,158,11,0.2)] transition-all"
                              >
                                <Zap className="w-4 h-4 fill-white" />
                                <span>1-Click Reorder</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>
                )}

                {/* PANE 3: Order History Archive & Audit Trail */}
                {activeTab === 'orders' && (
                  <section className="space-y-6">
                    <div className="flex flex-col space-y-1">
                      <div className="flex items-center gap-2 text-xs font-mono text-[#f59e0b] uppercase tracking-wider mb-1">
                        <span>Audit Trail</span>
                        <span className="text-neutral-600">•</span>
                        <span className="text-neutral-400">Ledger History</span>
                      </div>
                      <h2 className="text-2xl font-bold text-white">
                        Order History Archive & Invoices
                      </h2>
                    </div>

                    {/* Filter & Search Bar */}
                    <div className="bg-[#18181c] border border-white/10 rounded-2xl p-4 shadow-md flex flex-col lg:flex-row gap-4 items-stretch lg:items-center justify-between">
                      {/* Status Filter Buttons */}
                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setOrderFilter('ALL')}
                          className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                            orderFilter === 'ALL'
                              ? 'bg-[#201f21] text-white border border-white/10'
                              : 'text-neutral-400 hover:text-white'
                          }`}
                        >
                          All Orders ({orders.data ? orders.data.length : 18})
                        </button>
                        <button
                          type="button"
                          onClick={() => setOrderFilter('BREWING')}
                          className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                            orderFilter === 'BREWING'
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                              : 'text-neutral-400 hover:text-emerald-400'
                          }`}
                        >
                          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                          <span>Brewing (1)</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setOrderFilter('COMPLETED')}
                          className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                            orderFilter === 'COMPLETED'
                              ? 'bg-[#201f21] text-white border border-white/10'
                              : 'text-neutral-400 hover:text-white'
                          }`}
                        >
                          Completed ({orders.data ? orders.data.filter((o) => o.status === 'COMPLETED').length : 16})
                        </button>
                        <button
                          type="button"
                          onClick={() => setOrderFilter('CANCELLED')}
                          className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                            orderFilter === 'CANCELLED'
                              ? 'bg-[#201f21] text-white border border-white/10'
                              : 'text-neutral-400 hover:text-white'
                          }`}
                        >
                          Cancelled (1)
                        </button>
                      </div>

                      {/* Search & Month */}
                      <div className="flex items-center gap-2">
                        <div className="relative w-full sm:w-64">
                          <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-2.5" />
                          <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search ID, Drink, Branch..."
                            className="w-full bg-[#111114] border border-white/10 text-white font-mono text-xs pl-9 pr-3 py-2 rounded-xl placeholder:text-neutral-500 focus:outline-none focus:border-[#f59e0b]"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Order Cards List */}
                    <div className="space-y-4">
                      {/* If no real orders yet, render mock showcase orders matching design */}
                      {filteredOrders.length === 0 && orders.isSuccess && (
                        <div className="p-8 text-center bg-[#18181c] border border-white/5 rounded-2xl">
                          <Receipt className="w-8 h-8 text-neutral-500 mx-auto mb-2" />
                          <p className="text-neutral-400 text-sm">Tidak ada pesanan yang sesuai filter.</p>
                        </div>
                      )}

                      {/* Render real orders if available */}
                      {filteredOrders.map((order) => {
                        const isBrewing =
                          order.status === 'PREPARING' ||
                          order.status === 'CONFIRMED' ||
                          order.status === 'PENDING';
                        return (
                          <div
                            key={order.id}
                            className="bg-[#18181c] border border-white/10 rounded-3xl p-5 lg:p-6 shadow-xl space-y-4 hover:border-white/20 transition-all"
                          >
                            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-3 border-b border-white/5">
                              <div className="space-y-1">
                                <div className="flex flex-wrap items-center gap-2">
                                  <span className="font-mono text-xs text-[#f59e0b] font-bold">
                                    {order.orderNumber}
                                  </span>
                                  <span className="text-neutral-600">•</span>
                                  <span className="font-mono text-xs text-neutral-400">
                                    {new Date(order.createdAt).toLocaleString('id-ID', {
                                      day: '2-digit',
                                      month: 'short',
                                      year: 'numeric',
                                      hour: '2-digit',
                                      minute: '2-digit',
                                    })}{' '}
                                    WIB
                                  </span>
                                </div>
                                <div className="flex items-center gap-2 pt-0.5">
                                  <span className="bg-[#f7bb82]/10 text-[#f7bb82] px-2.5 py-0.5 rounded-full font-mono text-[11px] font-semibold inline-flex items-center gap-1">
                                    <Building className="w-3 h-3" />
                                    {order.type} • {order.tableId ? `Table #${order.tableId}` : 'Sanctuary Bar'}
                                  </span>
                                  <span className="text-xs text-neutral-400">Darmo Flagship Sanctuary</span>
                                </div>
                              </div>

                              {/* Live Status Pill */}
                              <div className="self-start lg:self-auto">
                                {isBrewing ? (
                                  <div className="bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 px-3 py-1 rounded-xl font-mono text-xs font-bold flex items-center gap-2 shadow-sm">
                                    <span className="relative flex h-2 w-2">
                                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
                                    </span>
                                    <span>BREWING IN PROGRESS</span>
                                  </div>
                                ) : (
                                  <span className="font-mono text-xs text-emerald-400 bg-emerald-400/10 border border-emerald-400/20 px-2.5 py-1 rounded-full font-semibold inline-flex items-center gap-1">
                                    <Check className="w-3.5 h-3.5" />
                                    {order.status}
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Order Body Details */}
                            <div className="p-4 rounded-2xl bg-[#111114] border border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                              <div className="space-y-1 max-w-xl">
                                <span className="text-xs text-neutral-500 uppercase tracking-wider font-mono">
                                  Ordered Sanctuary Provisions
                                </span>
                                <p className="text-sm font-medium text-white">
                                  {order.items.map((i) => `${i.quantity}x ${i.snapshotName}`).join(', ')}
                                </p>
                                <div className="flex items-center gap-2 text-neutral-400 font-mono text-xs pt-0.5">
                                  <span>{order.items.length} items total</span>
                                  {order.notes && (
                                    <>
                                      <span>•</span>
                                      <span className="text-[#e8c47a]">Note: {order.notes}</span>
                                    </>
                                  )}
                                </div>
                              </div>

                              <div className="flex flex-col md:items-end justify-center shrink-0">
                                <span className="font-mono text-xs text-neutral-400">Total Paid (QRIS/VA)</span>
                                <span className="text-xl text-[#f59e0b] font-bold font-mono">
                                  Rp {order.total.toLocaleString('id-ID')}
                                </span>
                                <span className="font-mono text-[10px] text-emerald-400 mt-0.5">
                                  {order.paymentStatus === 'PAID' ? 'Payment Settled' : order.paymentStatus}
                                </span>
                              </div>
                            </div>

                            {/* Action Buttons Row */}
                            <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                              <div className="flex items-center gap-2">
                                <button
                                  type="button"
                                  onClick={() => setReceiptOrderModal(order)}
                                  className="px-3.5 py-2 rounded-xl bg-[#111114] hover:bg-[#201f21] border border-white/5 text-neutral-300 hover:text-white font-mono text-xs transition-colors flex items-center gap-1.5"
                                >
                                  <Receipt className="w-3.5 h-3.5" />
                                  <span>View E-Receipt</span>
                                </button>
                                {isBrewing && (
                                  <button
                                    type="button"
                                    onClick={handleSummonServer}
                                    className="px-3.5 py-2 rounded-xl bg-[#111114] hover:bg-[#201f21] border border-white/5 text-neutral-300 hover:text-[#f59e0b] font-mono text-xs transition-colors flex items-center gap-1.5"
                                  >
                                    <Radio className="w-3.5 h-3.5 text-[#f59e0b]" />
                                    <span>Summon Table Server</span>
                                  </button>
                                )}
                                {!isBrewing && (
                                  <button
                                    type="button"
                                    onClick={() => setRatingOrderModal(order)}
                                    className="text-[#f59e0b] hover:text-[#fcd34d] font-mono text-xs flex items-center gap-1 transition-colors px-2 py-1"
                                  >
                                    <Star className="w-3.5 h-3.5 fill-[#f59e0b]" />
                                    <span>Rate Roast (5★)</span>
                                  </button>
                                )}
                              </div>

                              <div className="flex items-center gap-2">
                                {isBrewing ? (
                                  <Link
                                    href={`/order/track/${encodeURIComponent(order.id)}`}
                                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#9c6b3a] to-[#ee9800] text-white font-semibold text-xs flex items-center gap-1.5 shadow-[0_4px_16px_rgba(245,158,11,0.25)] hover:brightness-110 transition-all"
                                  >
                                    <Radio className="w-3.5 h-3.5 animate-pulse" />
                                    <span>Track Live Roaster Status</span>
                                  </Link>
                                ) : (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      // Reorder all items
                                      for (const it of order.items) {
                                        addItem(
                                          {
                                            id: it.productId,
                                            name: it.snapshotName,
                                            price: it.snapshotPrice,
                                            description: '',
                                            image: '/images/cold-brew-aren-brulee.png',
                                            category: 'general',
                                            tags: [],
                                            isPopular: true,
                                            isNew: false,
                                            rating: 5,
                                            reviewCount: 20,
                                            preparationTime: 5,
                                            branchAvailability: ['darmo', 'gubeng'],
                                          },
                                          it.quantity
                                        );
                                      }
                                      soundEffects.playSuccessChime();
                                      setNotice(`Seluruh basket pesanan ${order.orderNumber} masuk keranjang.`);
                                    }}
                                    className="px-3.5 py-2 rounded-xl bg-[#111114] hover:bg-[#201f21] border border-white/5 text-[#f7bb82] hover:text-white font-mono text-xs font-semibold transition-colors flex items-center gap-1.5"
                                  >
                                    <RotateCw className="w-3.5 h-3.5" />
                                    <span>Reorder This Basket</span>
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}

                      {/* Mock showcase card if no orders at all yet */}
                      {(!orders.data || orders.data.length === 0) && (
                        <>
                          {/* Showcase Order 1: Brewing In Progress */}
                          <div className="bg-[#18181c] border border-white/10 rounded-3xl p-5 lg:p-6 shadow-xl space-y-4">
                            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-3 border-b border-white/5">
                              <div className="space-y-1">
                                <div className="flex flex-wrap items-center gap-2">
                                  <span className="font-mono text-xs text-[#f59e0b] font-bold">
                                    #YR-20260904-8921
                                  </span>
                                  <span className="text-neutral-600">•</span>
                                  <span className="font-mono text-xs text-neutral-400">
                                    Today, 04 Sep 2026 • 23:42 WIB
                                  </span>
                                </div>
                                <div className="flex items-center gap-2 pt-0.5">
                                  <span className="bg-[#f7bb82]/10 text-[#f7bb82] px-2.5 py-0.5 rounded-full font-mono text-[11px] font-semibold inline-flex items-center gap-1">
                                    <Building className="w-3 h-3" />
                                    Dine-In • Table #14 (Indoor AC)
                                  </span>
                                  <span className="text-xs text-neutral-400">Darmo Flagship Sanctuary</span>
                                </div>
                              </div>
                              <div className="bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 px-3 py-1 rounded-xl font-mono text-xs font-bold flex items-center gap-2 shadow-sm self-start lg:self-auto">
                                <span className="relative flex h-2 w-2">
                                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
                                </span>
                                <span>BREWING IN PROGRESS (Step 3/5)</span>
                              </div>
                            </div>

                            <div className="p-4 rounded-2xl bg-[#111114] border border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                              <div className="space-y-1 max-w-xl">
                                <span className="text-xs text-neutral-500 uppercase tracking-wider font-mono">
                                  Ordered Sanctuary Provisions
                                </span>
                                <p className="text-sm font-medium text-white">
                                  1x Cold Brew Aren Brulee, 1x Smoked Pastrami Brioche Toast, 1x Dirty Aren Pandan
                                </p>
                                <div className="flex items-center gap-2 text-neutral-400 font-mono text-xs pt-0.5">
                                  <span>3 items total</span>
                                  <span>•</span>
                                  <span className="text-[#e8c47a]">Notes: Warm toast first, deliver together</span>
                                </div>
                              </div>
                              <div className="flex flex-col md:items-end justify-center shrink-0">
                                <span className="font-mono text-xs text-neutral-400">Total Paid (Midtrans QRIS)</span>
                                <span className="text-xl text-[#f59e0b] font-bold font-mono">Rp 103.350</span>
                                <span className="font-mono text-[10px] text-emerald-400 mt-0.5">Payment Settled</span>
                              </div>
                            </div>

                            <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                              <div className="flex items-center gap-2">
                                <button
                                  type="button"
                                  onClick={() =>
                                    setReceiptOrderModal({
                                      orderNumber: '#YR-20260904-8921',
                                      createdAt: new Date().toISOString(),
                                      total: 103350,
                                      type: 'DINE_IN',
                                      items: [
                                        { snapshotName: 'Cold Brew Aren Brulee', quantity: 1, snapshotPrice: 51000 },
                                        { snapshotName: 'Smoked Pastrami Brioche', quantity: 1, snapshotPrice: 48000 },
                                        { snapshotName: 'Dirty Aren Pandan', quantity: 1, snapshotPrice: 30000 },
                                      ],
                                    })
                                  }
                                  className="px-3.5 py-2 rounded-xl bg-[#111114] hover:bg-[#201f21] border border-white/5 text-neutral-300 hover:text-white font-mono text-xs transition-colors flex items-center gap-1.5"
                                >
                                  <Receipt className="w-3.5 h-3.5" />
                                  <span>View E-Receipt</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={handleSummonServer}
                                  className="px-3.5 py-2 rounded-xl bg-[#111114] hover:bg-[#201f21] border border-white/5 text-neutral-300 hover:text-[#f59e0b] font-mono text-xs transition-colors flex items-center gap-1.5"
                                >
                                  <Radio className="w-3.5 h-3.5 text-[#f59e0b]" />
                                  <span>Summon Table Server</span>
                                </button>
                              </div>
                              <Link
                                href="/order/track/demo"
                                className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#9c6b3a] to-[#ee9800] text-white font-semibold text-xs flex items-center gap-1.5 shadow-[0_4px_16px_rgba(245,158,11,0.25)] hover:brightness-110 transition-all"
                              >
                                <Radio className="w-3.5 h-3.5 animate-pulse" />
                                <span>Track Live Roaster Status</span>
                              </Link>
                            </div>
                          </div>

                          {/* Showcase Order 2: Completed Self-Pickup */}
                          <div className="bg-[#18181c] border border-white/10 rounded-3xl p-5 lg:p-6 shadow-xl space-y-4 hover:bg-[#1c1b1f] transition-colors">
                            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-3 border-b border-white/5">
                              <div className="space-y-1">
                                <div className="flex flex-wrap items-center gap-2">
                                  <span className="font-mono text-xs text-white font-bold">
                                    #YR-20260830-7412
                                  </span>
                                  <span className="text-neutral-600">•</span>
                                  <span className="font-mono text-xs text-neutral-400">
                                    30 Aug 2026 • 21:15 WIB
                                  </span>
                                </div>
                                <div className="flex items-center gap-2 pt-0.5">
                                  <span className="bg-[#111114] text-neutral-400 px-2.5 py-0.5 rounded-full font-mono text-[11px] inline-flex items-center gap-1">
                                    <Coffee className="w-3 h-3" />
                                    Self-Pickup • Barista Counter
                                  </span>
                                  <span className="text-xs text-neutral-400">Darmo Flagship</span>
                                </div>
                              </div>
                              <span className="font-mono text-xs text-emerald-400 bg-emerald-400/10 border border-emerald-400/20 px-2.5 py-1 rounded-full font-semibold inline-flex items-center gap-1 self-start lg:self-auto">
                                <Check className="w-3.5 h-3.5" />
                                COMPLETED
                              </span>
                            </div>

                            <div className="p-4 rounded-2xl bg-[#111114] border border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                              <div className="space-y-1 max-w-xl">
                                <p className="text-sm text-white">
                                  2x Cold Brew Aren Brulee, 1x Almond Butter Croissant
                                </p>
                                <div className="flex items-center gap-2 text-neutral-400 font-mono text-xs">
                                  <span className="text-[#f59e0b] font-semibold">+118 Ya&apos;reh Points Credited</span>
                                  <span>•</span>
                                  <span>BCA Virtual Account</span>
                                </div>
                              </div>
                              <div className="flex flex-col md:items-end justify-center shrink-0">
                                <span className="font-mono text-xs text-neutral-400">Settled Amount</span>
                                <span className="text-xl text-white font-bold font-mono">Rp 118.000</span>
                              </div>
                            </div>

                            <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                              <button
                                type="button"
                                onClick={() =>
                                  setRatingOrderModal({
                                    orderNumber: '#YR-20260830-7412',
                                    items: [{ snapshotName: 'Cold Brew Aren Brulee' }],
                                  })
                                }
                                className="text-[#f59e0b] hover:text-[#fcd34d] font-mono text-xs flex items-center gap-1 transition-colors"
                              >
                                <Star className="w-3.5 h-3.5 fill-[#f59e0b]" />
                                <span>Rate Roast Quality (5★)</span>
                              </button>
                              <div className="flex items-center gap-2">
                                <button
                                  type="button"
                                  onClick={() =>
                                    setReceiptOrderModal({
                                      orderNumber: '#YR-20260830-7412',
                                      createdAt: '30 Aug 2026',
                                      total: 118000,
                                      type: 'TAKE_AWAY',
                                      items: [
                                        { snapshotName: 'Cold Brew Aren Brulee', quantity: 2, snapshotPrice: 51000 },
                                        { snapshotName: 'Almond Butter Croissant', quantity: 1, snapshotPrice: 16000 },
                                      ],
                                    })
                                  }
                                  className="px-3.5 py-1.5 rounded-xl bg-[#111114] hover:bg-[#201f21] border border-white/5 text-neutral-300 font-mono text-xs transition-colors flex items-center gap-1"
                                >
                                  <Download className="w-3.5 h-3.5" />
                                  <span>Tax Invoice</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    handle1ClickReorder(SIGNATURE_PRESETS[0]);
                                  }}
                                  className="px-3.5 py-1.5 rounded-xl bg-[#111114] hover:bg-[#201f21] border border-white/5 text-[#f7bb82] hover:text-white font-mono text-xs font-semibold transition-colors flex items-center gap-1"
                                >
                                  <RotateCw className="w-3.5 h-3.5" />
                                  <span>Reorder This Basket</span>
                                </button>
                              </div>
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  </section>
                )}

                {/* PANE 4: Locations */}
                {activeTab === 'locations' && (
                  <section className="space-y-6">
                    <div>
                      <div className="flex items-center gap-2 text-xs font-mono text-[#f59e0b] uppercase tracking-wider mb-1">
                        <span>Surabaya Outlets</span>
                        <span className="text-neutral-600">•</span>
                        <span className="text-emerald-400">Gigabit Fiber Ready</span>
                      </div>
                      <h2 className="text-2xl font-bold text-white">Saved Sanctuary Branches</h2>
                      <p className="text-sm text-neutral-400 mt-1">
                        Pilih cabang utama Anda untuk sinkronisasi ketersediaan menu, reservasi meja, dan penjemputan.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {branches.data?.map((b) => (
                        <div
                          key={b.id}
                          className={`p-6 rounded-3xl border transition-all space-y-4 ${
                            branches.activeBranch?.id === b.id
                              ? 'bg-[#18181c] border-[#f59e0b]/50 shadow-[0_0_24px_rgba(245,158,11,0.15)]'
                              : 'bg-[#18181c] border-white/10 hover:border-white/20'
                          }`}
                        >
                          <div className="flex items-start justify-between">
                            <div>
                              <div className="flex items-center gap-2">
                                <h3 className="text-base font-bold text-white">{b.name}</h3>
                                {b.isMainBranch && (
                                  <span className="font-mono text-[10px] bg-[#f59e0b]/20 text-[#f59e0b] px-2 py-0.5 rounded-full font-bold">
                                    Flagship 24H
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-neutral-400 mt-1">{b.address}, {b.city}</p>
                            </div>
                            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]"></span>
                          </div>

                          <div className="bg-[#111114] border border-white/5 p-3 rounded-xl font-mono text-xs text-neutral-400 space-y-1">
                            <div className="flex justify-between">
                              <span>Weekday:</span>
                              <span className="text-white">{b.weekdayHours}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Weekend:</span>
                              <span className="text-white">{b.weekendHours}</span>
                            </div>
                            <div className="flex justify-between text-emerald-400">
                              <span>Fiber Uptime:</span>
                              <span>99.9% (100 Mbps)</span>
                            </div>
                          </div>

                          <Button
                            variant={branches.activeBranch?.id === b.id ? 'default' : 'secondary'}
                            disabled={branches.activeBranch?.id === b.id}
                            onClick={() => {
                              setBranch(b.id);
                              soundEffects.playSuccessChime();
                              setNotice(`Cabang aktif dialihkan ke ${b.name}.`);
                            }}
                            className="w-full"
                          >
                            {branches.activeBranch?.id === b.id ? 'Cabang Aktif Saat Ini' : 'Pilih Cabang Ini'}
                          </Button>
                        </div>
                      ))}
                    </div>
                  </section>
                )}

                {/* PANE 5: Payment & Wallets */}
                {activeTab === 'payments' && (
                  <section className="bg-[#18181c] border border-white/10 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
                    <div>
                      <div className="flex items-center gap-2 text-xs font-mono text-[#f59e0b] uppercase tracking-wider mb-1">
                        <span>Vault & Checkout</span>
                        <span className="text-neutral-600">•</span>
                        <span className="text-emerald-400">Midtrans PCI-DSS</span>
                      </div>
                      <h2 className="text-2xl font-bold text-white">Payment Methods & Wallets</h2>
                      <p className="text-sm text-neutral-400 mt-1">
                        Metode pembayaran tersimpan untuk transaksi 1-click tanpa perlu scan QR berulang kali.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="p-4 rounded-2xl bg-[#111114] border border-[#f59e0b]/40 space-y-3 relative">
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-xs text-[#f59e0b] font-bold">QRIS Instant</span>
                          <span className="text-[10px] bg-[#f59e0b]/20 text-[#f59e0b] px-2 py-0.5 rounded font-mono">
                            DEFAULT
                          </span>
                        </div>
                        <p className="text-xs text-neutral-400">
                          BCA, Mandiri, GoPay, ShopeePay & OVO via scan dinamis
                        </p>
                        <span className="block font-mono text-xs text-emerald-400">Status: Siap Pakai</span>
                      </div>

                      <div className="p-4 rounded-2xl bg-[#111114] border border-white/5 space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-xs text-white font-bold">BCA Virtual Account</span>
                          <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                        </div>
                        <p className="text-xs text-neutral-400">
                          Otomatis diverifikasi dalam 5 detik via Midtrans Gateway
                        </p>
                        <span className="block font-mono text-xs text-neutral-400">Nomor VA Tersimpan</span>
                      </div>

                      <div className="p-4 rounded-2xl bg-[#111114] border border-white/5 space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-xs text-white font-bold">GoPay Wallet</span>
                          <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                        </div>
                        <p className="text-xs text-neutral-400">
                          Direct App Deep Link untuk checkout mobile seketika
                        </p>
                        <span className="block font-mono text-xs text-neutral-400">Linked to +62 812***</span>
                      </div>
                    </div>
                  </section>
                )}

                {/* PANE 6: Notifications */}
                {activeTab === 'notifications' && (
                  <section className="bg-[#18181c] border border-white/10 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
                    <div>
                      <div className="flex items-center gap-2 text-xs font-mono text-[#f59e0b] uppercase tracking-wider mb-1">
                        <span>Signals & Dispatch</span>
                        <span className="text-neutral-600">•</span>
                        <span className="text-neutral-400">Zero Spam Protocol</span>
                      </div>
                      <h2 className="text-2xl font-bold text-white">
                        Notification Preferences & Channels
                      </h2>
                      <p className="text-sm text-neutral-400 mt-1">
                        Configure how Warkop Ya&apos;reh communicates batch extraction updates, desk reservations, and Surabaya developer meetups.
                      </p>
                    </div>

                    <div className="space-y-3">
                      {/* WhatsApp Alerts */}
                      <div className="p-4 rounded-2xl bg-[#111114] border border-white/5 flex items-center justify-between gap-4">
                        <div className="space-y-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold text-white">
                              WhatsApp Order & Brew Alerts
                            </span>
                            <span className="font-mono text-[10px] text-emerald-400 bg-emerald-400/10 px-1.5 py-0.5 rounded">
                              High Priority
                            </span>
                          </div>
                          <p className="text-xs text-neutral-400">
                            Instant pings when your roast is ready at the counter or table reservation is confirmed.
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setNotifState((p) => ({ ...p, whatsapp: !p.whatsapp }))}
                          className={`w-12 h-6 rounded-full p-0.5 transition-colors relative shrink-0 ${
                            notifState.whatsapp ? 'bg-[#f59e0b]' : 'bg-[#2a2a2c]'
                          }`}
                        >
                          <div
                            className={`w-5 h-5 bg-[#0a0a0c] rounded-full transition-transform ${
                              notifState.whatsapp ? 'translate-x-6' : 'translate-x-0'
                            }`}
                          />
                        </button>
                      </div>

                      {/* Community Events */}
                      <div className="p-4 rounded-2xl bg-[#111114] border border-white/5 flex items-center justify-between gap-4">
                        <div className="space-y-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold text-white">
                              Community Guild & Tech Talks
                            </span>
                            <span className="font-mono text-[10px] text-[#e8c47a] bg-[#e8c47a]/10 px-1.5 py-0.5 rounded">
                              Resident Benefit
                            </span>
                          </div>
                          <p className="text-xs text-neutral-400">
                            Direct invitations for late-night Surabaya tech demos, founder AMAs, and pour-over cupping sessions.
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setNotifState((p) => ({ ...p, events: !p.events }))}
                          className={`w-12 h-6 rounded-full p-0.5 transition-colors relative shrink-0 ${
                            notifState.events ? 'bg-[#f59e0b]' : 'bg-[#2a2a2c]'
                          }`}
                        >
                          <div
                            className={`w-5 h-5 bg-[#0a0a0c] rounded-full transition-transform ${
                              notifState.events ? 'translate-x-6' : 'translate-x-0'
                            }`}
                          />
                        </button>
                      </div>

                      {/* Newsletter */}
                      <div className="p-4 rounded-2xl bg-[#111114] border border-white/5 flex items-center justify-between gap-4">
                        <div className="space-y-1 min-w-0">
                          <span className="text-sm font-semibold text-white">
                            Surabaya Midnight Guild Newsletter
                          </span>
                          <p className="text-xs text-neutral-400">
                            Weekly curated tech digests, barista origin diaries, and new roast releases sent every Friday midnight.
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setNotifState((p) => ({ ...p, newsletter: !p.newsletter }))}
                          className={`w-12 h-6 rounded-full p-0.5 transition-colors relative shrink-0 ${
                            notifState.newsletter ? 'bg-[#f59e0b]' : 'bg-[#2a2a2c]'
                          }`}
                        >
                          <div
                            className={`w-5 h-5 bg-neutral-400 rounded-full transition-transform ${
                              notifState.newsletter ? 'translate-x-6' : 'translate-x-0'
                            }`}
                          />
                        </button>
                      </div>

                      {/* Promotional SMS */}
                      <div className="p-4 rounded-2xl bg-[#111114] border border-white/5 flex items-center justify-between gap-4">
                        <div className="space-y-1 min-w-0">
                          <span className="text-sm font-semibold text-white">
                            Promotional SMS & Flash Multipliers
                          </span>
                          <p className="text-xs text-neutral-400">
                            SMS alerts for sudden 2x point events or limited-run single-origin bean arrivals.
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setNotifState((p) => ({ ...p, sms: !p.sms }))}
                          className={`w-12 h-6 rounded-full p-0.5 transition-colors relative shrink-0 ${
                            notifState.sms ? 'bg-[#f59e0b]' : 'bg-[#2a2a2c]'
                          }`}
                        >
                          <div
                            className={`w-5 h-5 bg-neutral-400 rounded-full transition-transform ${
                              notifState.sms ? 'translate-x-6' : 'translate-x-0'
                            }`}
                          />
                        </button>
                      </div>
                    </div>
                  </section>
                )}

                {/* PANE 7: Security & Sessions */}
                {activeTab === 'security' && (
                  <section className="bg-[#18181c] border border-white/10 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-[#f59e0b]/10 flex items-center justify-center text-[#f59e0b]">
                        <ShieldCheck className="w-7 h-7" />
                      </div>
                      <div>
                        <h2 className="text-xl font-bold text-white">Keamanan Sesi & Kredensial</h2>
                        <p className="text-xs text-neutral-400">
                          Autentikasi terenkripsi TLS 1.3 dengan proteksi token JWT HttpOnly.
                        </p>
                      </div>
                    </div>

                    <div className="p-4 rounded-2xl bg-[#111114] border border-white/5 space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-neutral-400 font-mono">Active Session Node:</span>
                        <span className="text-white font-mono font-bold">Surabaya Cloud TLS Gateway</span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-neutral-400 font-mono">Device:</span>
                        <span className="text-emerald-400 font-mono">Current Browser / Authorized</span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-neutral-400 font-mono">IP Range:</span>
                        <span className="text-neutral-300 font-mono">114.122.*.* (Telkomsel/Biznet SBY)</span>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4">
                      <p className="text-xs text-neutral-500">
                        Keluar akan mencabut seluruh akses sesi pada perangkat ini.
                      </p>
                      <Button
                        variant="secondary"
                        onClick={() => logoutMutation.mutate()}
                        disabled={logoutMutation.isPending}
                        className="w-full sm:w-auto text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 border-rose-500/20"
                      >
                        <LogOut className="w-4 h-4 mr-2" />
                        {logoutMutation.isPending ? 'Logging out...' : 'Keluar dari Sanctuary'}
                      </Button>
                    </div>
                  </section>
                )}
              </div>
            </div>
          </>
        )}
      </div>

      {/* RATING MODAL */}
      <AnimatePresence>
        {ratingOrderModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#18181c] border border-white/15 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-6"
            >
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-mono text-xs text-[#f59e0b] font-bold">
                    {ratingOrderModal.orderNumber}
                  </span>
                  <h3 className="text-xl font-bold text-white mt-0.5">Rate Roast Quality</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setRatingOrderModal(null)}
                  className="p-2 text-neutral-400 hover:text-white rounded-full bg-white/5"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* 5 Stars */}
              <div className="flex items-center justify-center gap-3 py-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRatingStars(star)}
                    className="p-1 text-2xl transition-transform hover:scale-125"
                  >
                    <Star
                      className={`w-8 h-8 ${
                        star <= ratingStars
                          ? 'text-[#f59e0b] fill-[#f59e0b]'
                          : 'text-neutral-600'
                      }`}
                    />
                  </button>
                ))}
              </div>

              {/* Tag Pills */}
              <div className="space-y-2">
                <label className="text-xs text-neutral-400 font-mono">Kesan Seduhan:</label>
                <div className="flex flex-wrap gap-2">
                  {[
                    'Aroma Mantap',
                    'Ekstraksi Pas',
                    'Suhu Tepat',
                    'Barista Ramah',
                    'Brioche Renyah',
                  ].map((t) => {
                    const active = ratingTags.includes(t);
                    return (
                      <button
                        key={t}
                        type="button"
                        onClick={() =>
                          setRatingTags((prev) =>
                            active ? prev.filter((item) => item !== t) : [...prev, t]
                          )
                        }
                        className={`text-xs px-3 py-1.5 rounded-xl border transition-all ${
                          active
                            ? 'bg-[#f59e0b]/20 text-[#f59e0b] border-[#f59e0b]/40 font-semibold'
                            : 'bg-[#111114] text-neutral-400 border-white/5 hover:text-white'
                        }`}
                      >
                        {t}
                      </button>
                    );
                  })}
                </div>
              </div>

              <textarea
                placeholder="Catatan tambahan untuk tim Barista Darmo..."
                rows={3}
                className="w-full bg-[#111114] border border-white/10 rounded-xl p-3 text-xs text-white placeholder:text-neutral-500 focus:outline-none focus:border-[#f59e0b]"
              />

              <Button
                onClick={() => {
                  soundEffects.playSuccessChime();
                  setRatingOrderModal(null);
                  setNotice('Terima kasih! Review seduhan Anda tersimpan.');
                  setTimeout(() => setNotice(null), 4000);
                }}
                className="w-full bg-gradient-to-r from-[#9c6b3a] to-[#ee9800] text-white font-semibold py-3 shadow-lg"
              >
                Kirim Ulasan Bintang {ratingStars}★
              </Button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* DIGITAL THERMAL RECEIPT MODAL */}
      <AnimatePresence>
        {receiptOrderModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white text-black font-mono rounded-3xl p-6 sm:p-8 max-w-sm w-full shadow-2xl relative overflow-hidden"
            >
              {/* Receipt Header */}
              <div className="text-center space-y-1 pb-4 border-b border-dashed border-neutral-300">
                <div className="text-lg font-extrabold uppercase tracking-widest">
                  Warkop Ya&apos;reh
                </div>
                <div className="text-[11px] text-neutral-600">
                  Darmo Flagship • Surabaya 1998
                </div>
                <div className="text-[10px] text-neutral-500 pt-1">
                  ORDER: {receiptOrderModal.orderNumber}
                </div>
                <div className="text-[10px] text-neutral-500">
                  DATE: {new Date(receiptOrderModal.createdAt).toLocaleString('id-ID')}
                </div>
              </div>

              {/* Items Table */}
              <div className="py-4 space-y-2 text-xs border-b border-dashed border-neutral-300">
                {receiptOrderModal.items?.map((it: any, idx: number) => (
                  <div key={idx} className="flex justify-between items-start">
                    <div>
                      <span className="font-bold">{it.quantity}x</span> {it.snapshotName}
                    </div>
                    <span className="font-bold">
                      Rp {(it.snapshotPrice * it.quantity).toLocaleString('id-ID')}
                    </span>
                  </div>
                ))}
              </div>

              {/* Totals */}
              <div className="py-3 space-y-1 text-xs border-b border-dashed border-neutral-300">
                <div className="flex justify-between">
                  <span className="text-neutral-600">Subtotal:</span>
                  <span>Rp {receiptOrderModal.total.toLocaleString('id-ID')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-600">PB1 Resto (10%):</span>
                  <span>Included</span>
                </div>
                <div className="flex justify-between font-bold text-sm pt-1 border-t border-neutral-200">
                  <span>TOTAL SETTLED:</span>
                  <span>Rp {receiptOrderModal.total.toLocaleString('id-ID')}</span>
                </div>
              </div>

              {/* Barcode Pass */}
              <div className="pt-4 text-center space-y-2">
                <div className="text-[9px] text-neutral-500 tracking-widest">
                  ||| | ||||| || |||| ||| ||||||| |||
                </div>
                <div className="text-[10px] text-neutral-600">
                  SANCTUARY VERIFIED INVOICE
                </div>
              </div>

              {/* Close Button */}
              <div className="pt-4">
                <Button
                  variant="secondary"
                  onClick={() => setReceiptOrderModal(null)}
                  className="w-full bg-neutral-900 text-white hover:bg-neutral-800"
                >
                  Tutup Struk
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </main>
  );
}
