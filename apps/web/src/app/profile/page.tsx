"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ChevronRight,
  Repeat,
  LogOut,
} from "lucide-react";
import { useAppStore } from "@/store/useAppStore";
import { MOCK_PRODUCTS } from "@/lib/mockData";
import { soundEffects } from "@/lib/audioAlerts";

export default function ProfilePage() {
  const router = useRouter();
  const { user, orders, updateProfile, addToCart, logout } = useAppStore();

  const [activeTab, setActiveTab] = useState<"orders" | "favorites" | "settings">("orders");
  const [nameInput, setNameInput] = useState(user.name);
  const [emailInput, setEmailInput] = useState(user.email);
  const [waNotify, setWaNotify] = useState(true);
  const [promoNotify, setPromoNotify] = useState(true);
  const [eventNotify, setEventNotify] = useState(true);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Filter favorite products from mock
  const favoriteProducts = MOCK_PRODUCTS.filter((p) =>
    user.favoriteOrderIds?.includes(p.id)
  );

  const handleQuickReorder = (product: typeof MOCK_PRODUCTS[0]) => {
    addToCart(product, 1, {
      sweetness: "Less Sweet (50%)",
      iceLevel: "Normal Ice",
      milkType: "Fresh Milk",
      beanRoast: "Signature House Blend",
      notes: "Preset Kopi Pagi Favorit",
    });
    soundEffects.playSuccessChime();
    router.push("/cart");
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({ name: nameInput, email: emailInput });
    setSaveSuccess(true);
    soundEffects.playSuccessChime();
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0c] text-white pt-8 sm:pt-10 pb-32 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
      {/* Profile Header Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-[#18181c] to-[#141418] border border-white/10 shadow-2xl mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="relative w-20 h-20 rounded-2xl overflow-hidden border-2 border-[#f59e0b] shadow-[0_0_20px_rgba(245,158,11,0.3)]">
              <Image
                src={user.avatar}
                alt={user.name}
                fill
                className="object-cover"
                sizes="80px"
              />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="font-heading font-bold text-2xl text-white">
                  {user.name}
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-[#f59e0b]/20 text-[#fcd34d] border border-[#f59e0b]/30">
                  {user.tier} Member
                </span>
              </div>
              <p className="text-xs font-mono text-neutral-400 mt-1 flex items-center gap-2">
                <span>{user.phone}</span> • <span>{user.email}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="p-3 px-5 rounded-2xl bg-[#111114] border border-white/5 text-right">
              <div className="text-[10px] font-mono text-neutral-400 uppercase">Saldo Loyalty</div>
              <div className="font-mono font-extrabold text-xl text-[#f59e0b]">{user.points} PTS</div>
            </div>
            <button
              onClick={() => {
                logout();
                router.push("/auth");
              }}
              className="p-3 rounded-2xl bg-white/5 hover:bg-rose-500/10 text-neutral-400 hover:text-rose-400 transition-colors"
              title="Keluar Akun"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-white/5 pb-3 mb-8 text-xs font-semibold">
        <button
          onClick={() => setActiveTab("orders")}
          className={`px-4 py-2 rounded-xl transition-all ${
            activeTab === "orders"
              ? "bg-[#9c6b3a] text-white shadow-md"
              : "text-neutral-400 hover:text-white"
          }`}
        >
          Riwayat Struk Pesanan ({orders.length})
        </button>
        <button
          onClick={() => setActiveTab("favorites")}
          className={`px-4 py-2 rounded-xl transition-all ${
            activeTab === "favorites"
              ? "bg-[#9c6b3a] text-white shadow-md"
              : "text-neutral-400 hover:text-white"
          }`}
        >
          Preset Kopi Pagi ({favoriteProducts.length})
        </button>
        <button
          onClick={() => setActiveTab("settings")}
          className={`px-4 py-2 rounded-xl transition-all ${
            activeTab === "settings"
              ? "bg-[#9c6b3a] text-white shadow-md"
              : "text-neutral-400 hover:text-white"
          }`}
        >
          Pengaturan & Notifikasi
        </button>
      </div>

      {/* Tab 1: Orders History */}
      {activeTab === "orders" && (
        <div className="space-y-4">
          {orders.length === 0 ? (
            <div className="text-center py-16 p-6 rounded-3xl bg-[#141418] text-neutral-400 text-xs">
              Belum ada riwayat pesanan tercatat.
            </div>
          ) : (
            orders.map((ord) => (
              <div
                key={ord.id}
                className="p-6 rounded-3xl bg-[#18181c] border border-white/10 hover:border-white/20 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div>
                  <div className="flex items-center gap-3 mb-1.5">
                    <span className="font-mono font-bold text-sm text-white">
                      #{ord.id}
                    </span>
                    <span className="text-xs text-neutral-400 font-mono">
                      {new Date(ord.createdAt).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })} WIB
                    </span>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase ${
                        ord.orderStatus === "completed"
                          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                          : "bg-amber-500/10 text-amber-300 border border-amber-500/20"
                      }`}
                    >
                      {ord.orderStatus}
                    </span>
                  </div>

                  <div className="text-xs text-neutral-300">
                    <span className="text-[#f59e0b] font-medium">{ord.branchName}</span> •{" "}
                    {ord.items.map((i) => `${i.quantity}x ${i.name}`).join(", ")}
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-4 pt-3 sm:pt-0 border-t sm:border-t-0 border-white/5">
                  <span className="font-mono font-bold text-base text-white">
                    Rp {ord.total.toLocaleString("id-ID")}
                  </span>

                  <Link
                    href={`/order/track/${ord.id}`}
                    className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-semibold text-neutral-200 flex items-center gap-1.5 transition-colors"
                  >
                    <span>Lacak & Struk</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Tab 2: Favorites & Morning Presets */}
      {activeTab === "favorites" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {favoriteProducts.map((prod) => (
            <div
              key={prod.id}
              className="p-5 rounded-3xl bg-[#18181c] border border-white/10 flex items-center justify-between gap-4"
            >
              <div className="flex items-center gap-3.5">
                <div className="relative w-14 h-14 rounded-2xl overflow-hidden bg-[#111114] flex-shrink-0">
                  <Image
                    src={prod.image}
                    alt={prod.name}
                    fill
                    className="object-cover"
                    sizes="56px"
                  />
                </div>
                <div>
                  <h3 className="font-heading font-bold text-sm text-white">{prod.name}</h3>
                  <div className="font-mono text-xs text-[#f59e0b] mt-0.5">
                    Rp {prod.price.toLocaleString("id-ID")}
                  </div>
                </div>
              </div>

              <button
                onClick={() => handleQuickReorder(prod)}
                className="px-3.5 py-2 rounded-xl bg-[#9c6b3a] hover:bg-[#b07b44] text-white text-xs font-semibold flex items-center gap-1.5 shadow-md active:scale-95 transition-all whitespace-nowrap"
              >
                <Repeat className="w-3.5 h-3.5" />
                <span>Pesan Ulang</span>
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Tab 3: Settings & Notifications */}
      {activeTab === "settings" && (
        <div className="space-y-6">
          <form
            onSubmit={handleSaveProfile}
            className="p-6 sm:p-7 rounded-3xl bg-[#18181c] border border-white/10 space-y-4"
          >
            <h3 className="font-heading font-bold text-base text-white">
              Ubah Data Diri
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1">
                  Nama Lengkap
                </label>
                <input
                  type="text"
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#111114] border border-white/10 text-white text-xs focus:outline-none focus:border-[#f59e0b]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#111114] border border-white/10 text-white text-xs focus:outline-none focus:border-[#f59e0b]"
                />
              </div>
            </div>

            <button
              type="submit"
              className="py-2.5 px-5 rounded-xl bg-[#9c6b3a] hover:bg-[#b07b44] text-white font-bold text-xs transition-colors"
            >
              Simpan Perubahan
            </button>
            {saveSuccess && (
              <span className="text-xs text-emerald-400 ml-3">Data berhasil diperbarui!</span>
            )}
          </form>

          {/* Notification Toggles */}
          <div className="p-6 sm:p-7 rounded-3xl bg-[#18181c] border border-white/10 space-y-4">
            <h3 className="font-heading font-bold text-base text-white">
              Preferensi Notifikasi
            </h3>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between p-3 rounded-2xl bg-[#111114]">
                <div>
                  <div className="font-semibold text-white">Notifikasi WhatsApp Pesanan</div>
                  <div className="text-neutral-400 text-[11px]">Update live saat barista menyeduh & pesanan siap</div>
                </div>
                <button
                  type="button"
                  onClick={() => setWaNotify(!waNotify)}
                  className={`w-11 h-6 rounded-full transition-colors relative ${
                    waNotify ? "bg-emerald-500" : "bg-neutral-700"
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded-full bg-white transition-transform ${
                      waNotify ? "translate-x-6" : "translate-x-1"
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between p-3 rounded-2xl bg-[#111114]">
                <div>
                  <div className="font-semibold text-white">Undangan Workshop & Event Kreatif</div>
                  <div className="text-neutral-400 text-[11px]">Pemberitahuan tiket early-bird Surabaya community</div>
                </div>
                <button
                  type="button"
                  onClick={() => setEventNotify(!eventNotify)}
                  className={`w-11 h-6 rounded-full transition-colors relative ${
                    eventNotify ? "bg-[#f59e0b]" : "bg-neutral-700"
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded-full bg-white transition-transform ${
                      eventNotify ? "translate-x-6" : "translate-x-1"
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between p-3 rounded-2xl bg-[#111114]">
                <div>
                  <div className="font-semibold text-white">Pengingat Masa Berlaku Poin Loyalty</div>
                  <div className="text-neutral-400 text-[11px]">Notifikasi sebelum poin hangus akhir kuartal</div>
                </div>
                <button
                  type="button"
                  onClick={() => setPromoNotify(!promoNotify)}
                  className={`w-11 h-6 rounded-full transition-colors relative ${
                    promoNotify ? "bg-[#f59e0b]" : "bg-neutral-700"
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded-full bg-white transition-transform ${
                      promoNotify ? "translate-x-6" : "translate-x-1"
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
