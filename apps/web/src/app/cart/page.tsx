"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  Sparkles,
  Users,
  Tag,
  Award,
  ChevronRight,
} from "lucide-react";
import { useAppStore, FulfillmentType } from "@/store/useAppStore";
import { MOCK_VOUCHERS } from "@/lib/mockData";

export default function CartPage() {
  const router = useRouter();
  const {
    cartItems,
    updateCartQuantity,
    removeCartItem,
    clearCart,
    fulfillmentType,
    setFulfillmentType,
    tableNumber,
    setTableNumber,
    appliedVoucher,
    applyVoucher,
    removeVoucher,
    redeemedPoints,
    setRedeemedPoints,
    splitBillCount,
    setSplitBillCount,
    getCartSubtotal,
    getCartTotal,
    user,
    getActiveBranch,
  } = useAppStore();

  const [voucherInput, setVoucherInput] = useState("");
  const [voucherError, setVoucherError] = useState("");
  const activeBranch = getActiveBranch();

  const subtotal = getCartSubtotal();
  const total = getCartTotal();

  // Split bill calculation
  const perPersonShare = Math.round(total / (splitBillCount || 1));

  const handleApplyVoucher = (e: React.FormEvent) => {
    e.preventDefault();
    if (!voucherInput.trim()) return;
    const success = applyVoucher(voucherInput.trim());
    if (success) {
      setVoucherError("");
      setVoucherInput("");
    } else {
      setVoucherError("Kode voucher tidak valid atau belum memenuhi minimum belanja.");
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0c] text-white pt-8 sm:pt-10 pb-32 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs font-mono text-neutral-400 mb-6">
        <Link href="/" className="hover:text-white transition-colors">Beranda</Link>
        <ChevronRight className="w-3 h-3 text-neutral-600" />
        <Link href="/menu" className="hover:text-white transition-colors">Menu</Link>
        <ChevronRight className="w-3 h-3 text-neutral-600" />
        <span className="text-[#f59e0b]">Keranjang & Split-Bill</span>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-white/5 pb-6 mb-8">
        <div>
          <h1 className="font-heading font-extrabold text-3xl sm:text-4xl text-white">
            Keranjang Belanja
          </h1>
          <p className="text-xs sm:text-sm text-neutral-400 mt-1">
            Pesanan terhubung dengan Kitchen KDS & POS Kasir di <span className="text-[#f59e0b] font-semibold">{activeBranch.name}</span>.
          </p>
        </div>

        {cartItems.length > 0 && (
          <button
            onClick={clearCart}
            className="text-xs text-rose-400 hover:text-rose-300 transition-colors flex items-center gap-1.5 self-start sm:self-auto"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Kosongkan Keranjang</span>
          </button>
        )}
      </div>

      {cartItems.length === 0 ? (
        <div className="py-20 text-center rounded-3xl bg-[#141418] border border-white/5 max-w-xl mx-auto p-8">
          <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4">
            <ShoppingBag className="w-10 h-10 text-neutral-500" />
          </div>
          <h2 className="font-heading text-xl font-bold text-white mb-2">
            Belum ada item di keranjang
          </h2>
          <p className="text-xs sm:text-sm text-neutral-400 mb-6 max-w-sm mx-auto">
            Yuk pilih sajian kopi specialty atau camilan hangat favoritmu dari katalog Ya&apos;reh.
          </p>
          <Link
            href="/menu"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-[#9c6b3a] to-[#d4b488] hover:opacity-95 text-white font-heading font-bold text-sm shadow-[0_4px_20px_rgba(156,107,58,0.4)]"
          >
            <span>Buka Katalog Menu</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Cart Items + Customizations */}
          <div className="lg:col-span-7 space-y-4">
            <div className="flex items-center justify-between text-xs font-mono text-neutral-400 px-1">
              <span>DAFTAR MENU ({cartItems.length} ITEM)</span>
              <span>LOKASI: {activeBranch.name.toUpperCase()}</span>
            </div>

            {cartItems.map((item) => (
              <div
                key={item.id}
                className="p-4 sm:p-5 rounded-3xl bg-[#18181c] border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all hover:border-white/20"
              >
                <div className="flex gap-4 items-center">
                  <div className="relative w-20 h-20 rounded-2xl overflow-hidden bg-[#111114] flex-shrink-0">
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      className="object-cover"
                      sizes="80px"
                    />
                  </div>
                  <div>
                    <h3 className="font-heading font-bold text-sm sm:text-base text-white">
                      {item.name}
                    </h3>
                    <div className="text-[11px] text-neutral-400 mt-1 space-y-0.5">
                      <div>
                        {item.customizations.sweetness} • {item.customizations.iceLevel}
                      </div>
                      <div className="text-neutral-300">
                        {item.customizations.beanRoast}
                      </div>
                      {item.customizations.milkType !== "None" && item.customizations.milkType !== "Fresh Milk" && (
                        <div className="text-[#f59e0b] font-medium">
                          {item.customizations.milkType}
                        </div>
                      )}
                      {item.customizations.notes && (
                        <div className="text-neutral-400 italic">
                          &ldquo;{item.customizations.notes}&rdquo;
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-3 pt-3 sm:pt-0 border-t sm:border-t-0 border-white/5">
                  <span className="font-mono font-bold text-base text-[#f59e0b]">
                    Rp {item.subtotal.toLocaleString("id-ID")}
                  </span>

                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 bg-[#111114] border border-white/10 rounded-xl p-1">
                      <button
                        onClick={() => updateCartQuantity(item.id, -1)}
                        className="w-7 h-7 rounded-lg flex items-center justify-center text-neutral-300 hover:text-white hover:bg-white/10 transition-colors"
                        aria-label="Kurangi jumlah"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="font-mono font-bold text-xs w-6 text-center text-white">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateCartQuantity(item.id, 1)}
                        className="w-7 h-7 rounded-lg flex items-center justify-center text-neutral-300 hover:text-white hover:bg-white/10 transition-colors"
                        aria-label="Tambah jumlah"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <button
                      onClick={() => removeCartItem(item.id)}
                      className="p-2 rounded-xl text-neutral-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                      title="Hapus dari keranjang"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {/* Fulfillment Type Options */}
            <div className="p-5 rounded-3xl bg-[#141418] border border-white/5 space-y-3 mt-6">
              <h4 className="text-xs font-mono uppercase text-neutral-400 font-semibold tracking-wider">
                Pilih Tipe Pemesanan
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { type: "dine-in" as FulfillmentType, label: "Dine-In (Di Meja)" },
                  { type: "pickup" as FulfillmentType, label: "Self Pickup" },
                  { type: "drive-thru" as FulfillmentType, label: "Drive-Thru" },
                  { type: "delivery" as FulfillmentType, label: "Antar Kilat" },
                ].map((item) => (
                  <button
                    key={item.type}
                    onClick={() => setFulfillmentType(item.type)}
                    className={`py-3 px-3 rounded-2xl border text-xs font-semibold transition-all text-center ${
                      fulfillmentType === item.type
                        ? "bg-[#9c6b3a]/20 border-[#9c6b3a] text-white shadow-sm"
                        : "bg-[#18181c] border-white/5 text-neutral-400 hover:text-white"
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>

              {fulfillmentType === "dine-in" && (
                <div className="pt-2 flex items-center gap-3">
                  <label className="text-xs font-medium text-neutral-300 whitespace-nowrap">
                    Nomor Meja:
                  </label>
                  <input
                    type="text"
                    value={tableNumber}
                    onChange={(e) => setTableNumber(e.target.value.toUpperCase())}
                    placeholder="Contoh: T-04"
                    className="w-28 px-3 py-1.5 rounded-xl bg-[#111114] border border-white/10 text-white font-mono text-xs focus:outline-none focus:border-[#f59e0b]"
                  />
                  <span className="text-[11px] text-neutral-500">
                    Otomatis sinkron dengan pesanan barcode meja
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Split-Bill, Promo, Loyalty Points & Total */}
          <div className="lg:col-span-5 space-y-6">
            {/* Split-Bill Calculator Box */}
            <div className="p-6 rounded-3xl bg-[#18181c] border border-white/10 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-sky-500/10 text-sky-400">
                    <Users className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-heading font-bold text-sm text-white">
                      Split-Bill Nongkrong
                    </h3>
                    <p className="text-[11px] text-neutral-400 font-mono">
                      Bagi tagihan bareng teman komunitas
                    </p>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-full text-xs font-mono font-bold bg-sky-500/20 text-sky-300">
                  {splitBillCount} Orang
                </span>
              </div>

              {/* Slider */}
              <div className="space-y-2">
                <input
                  type="range"
                  min={1}
                  max={10}
                  step={1}
                  value={splitBillCount}
                  onChange={(e) => setSplitBillCount(parseInt(e.target.value))}
                  className="w-full h-2 bg-[#111114] rounded-lg appearance-none cursor-pointer accent-sky-400"
                />
                <div className="flex justify-between text-[10px] font-mono text-neutral-500">
                  <span>1 Orang (Bayar Sendiri)</span>
                  <span>5 Orang</span>
                  <span>10 Orang</span>
                </div>
              </div>

              {splitBillCount > 1 && (
                <div className="p-3.5 rounded-2xl bg-[#111114] border border-sky-500/20 flex items-center justify-between">
                  <span className="text-xs text-neutral-300">Patungan per Orang:</span>
                  <span className="font-mono font-bold text-sm text-sky-400">
                    Rp {perPersonShare.toLocaleString("id-ID")}
                  </span>
                </div>
              )}
            </div>

            {/* Loyalty Point Redemption Slider */}
            <div className="p-6 rounded-3xl bg-[#18181c] border border-white/10 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-amber-500/10 text-[#f59e0b]">
                    <Award className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-heading font-bold text-sm text-white">
                      Tukar Poin Loyalty
                    </h3>
                    <p className="text-[11px] text-neutral-400 font-mono">
                      Saldo kamu: {user.points} pts (Tier {user.tier})
                    </p>
                  </div>
                </div>
                <span className="font-mono text-xs text-[#f59e0b] font-bold">
                  {redeemedPoints} pts
                </span>
              </div>

              <input
                type="range"
                min={0}
                max={Math.min(user.points, Math.floor(subtotal / 10))}
                step={50}
                value={redeemedPoints}
                onChange={(e) => setRedeemedPoints(parseInt(e.target.value))}
                className="w-full h-2 bg-[#111114] rounded-lg appearance-none cursor-pointer accent-[#f59e0b]"
              />

              <div className="flex justify-between items-center text-xs text-neutral-400">
                <span>Potongan dari Poin:</span>
                <span className="font-mono font-bold text-[#f59e0b]">
                  -Rp {(redeemedPoints * 10).toLocaleString("id-ID")}
                </span>
              </div>
            </div>

            {/* Voucher Code Form */}
            <div className="p-6 rounded-3xl bg-[#18181c] border border-white/10 space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-white uppercase font-mono">
                <Tag className="w-4 h-4 text-[#f59e0b]" />
                <span>Voucher Diskon Promo</span>
              </div>

              {appliedVoucher ? (
                <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-between text-xs">
                  <div>
                    <div className="font-bold text-emerald-400">{appliedVoucher.code}</div>
                    <div className="text-[11px] text-neutral-300">{appliedVoucher.title}</div>
                  </div>
                  <button
                    onClick={removeVoucher}
                    className="text-xs text-rose-400 hover:underline font-medium"
                  >
                    Hapus
                  </button>
                </div>
              ) : (
                <form onSubmit={handleApplyVoucher} className="flex gap-2">
                  <input
                    type="text"
                    value={voucherInput}
                    onChange={(e) => setVoucherInput(e.target.value.toUpperCase())}
                    placeholder="Contoh: YAREHHEMAT10"
                    className="flex-1 px-4 py-2.5 rounded-xl bg-[#111114] border border-white/10 text-white font-mono text-xs placeholder-neutral-500 uppercase focus:outline-none focus:border-[#f59e0b]"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-semibold text-xs transition-colors"
                  >
                    Terapkan
                  </button>
                </form>
              )}

              {voucherError && (
                <p className="text-[11px] text-rose-400">{voucherError}</p>
              )}

              <div className="flex gap-1.5 flex-wrap pt-1">
                {MOCK_VOUCHERS.map((v) => (
                  <button
                    key={v.code}
                    type="button"
                    onClick={() => {
                      applyVoucher(v.code);
                    }}
                    className="text-[10px] font-mono px-2 py-1 rounded-md bg-[#111114] hover:bg-white/5 border border-white/5 text-neutral-400"
                  >
                    {v.code}
                  </button>
                ))}
              </div>
            </div>

            {/* Total Summary Card & Checkout Trigger */}
            <div className="p-6 rounded-3xl bg-[#141418] border border-white/10 space-y-4">
              <h3 className="font-heading font-bold text-base text-white">
                Rincian Pembayaran
              </h3>

              <div className="space-y-2 text-xs text-neutral-400">
                <div className="flex justify-between">
                  <span>Subtotal Pesanan</span>
                  <span className="font-mono text-white">
                    Rp {subtotal.toLocaleString("id-ID")}
                  </span>
                </div>

                {appliedVoucher && (
                  <div className="flex justify-between text-emerald-400">
                    <span>Voucher ({appliedVoucher.code})</span>
                    <span className="font-mono">
                      -Rp{" "}
                      {(appliedVoucher.discountType === "percentage"
                        ? (subtotal * appliedVoucher.discountValue) / 100
                        : appliedVoucher.discountValue
                      ).toLocaleString("id-ID")}
                    </span>
                  </div>
                )}

                {redeemedPoints > 0 && (
                  <div className="flex justify-between text-[#f59e0b]">
                    <span>Diskon Poin Loyalty</span>
                    <span className="font-mono">
                      -Rp {(redeemedPoints * 10).toLocaleString("id-ID")}
                    </span>
                  </div>
                )}

                <div className="flex justify-between">
                  <span>Pajak Restoran (PB1 10%)</span>
                  <span className="font-mono text-white">
                    Rp {Math.round(subtotal * 0.1).toLocaleString("id-ID")}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span>Biaya Layanan & Fasilitas</span>
                  <span className="font-mono text-white">Rp 2.000</span>
                </div>

                <div className="pt-3 border-t border-white/10 flex justify-between items-baseline">
                  <span className="font-heading font-bold text-base text-white">Total Akhir</span>
                  <span className="font-mono font-extrabold text-xl text-[#f59e0b]">
                    Rp {total.toLocaleString("id-ID")}
                  </span>
                </div>
              </div>

              <button
                onClick={() => router.push("/checkout")}
                className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-[#9c6b3a] to-[#d4b488] hover:opacity-95 text-white font-heading font-bold text-sm flex items-center justify-between shadow-[0_4px_20px_rgba(156,107,58,0.4)] transition-all active:scale-[0.98]"
              >
                <span>Lanjut ke Pembayaran</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="flex items-center justify-center gap-2 text-[11px] font-mono text-neutral-400 pt-1">
                <Sparkles className="w-3.5 h-3.5 text-[#f59e0b]" />
                <span>Mendapatkan +{Math.floor(total / 10000) * 10} Poin Loyalty</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
