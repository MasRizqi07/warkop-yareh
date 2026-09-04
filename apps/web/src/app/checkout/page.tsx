"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ShieldCheck,
  CreditCard,
  QrCode,
  Building2,
  CheckCircle2,
  ArrowRight,
  ShoppingBag,
  Award,
  Tag,
  Lock,
} from "lucide-react";
import { useAppStore, FulfillmentType, PaymentMethod } from "@/store/useAppStore";
import { MOCK_PRODUCTS } from "@/lib/mockData";

export default function CheckoutPage() {
  const router = useRouter();
  const {
    cartItems,
    fulfillmentType,
    setFulfillmentType,
    tableNumber,
    setTableNumber,
    deliveryAddress,
    setDeliveryAddress,
    appliedVoucher,
    redeemedPoints,
    getCartSubtotal,
    getCartTotal,
    createOrder,
    addToCart,
    getActiveBranch,
    user,
  } = useAppStore();

  const activeBranch = getActiveBranch();
  const [selectedPayment, setSelectedPayment] = useState<PaymentMethod>("qris");
  const [customerName, setCustomerName] = useState(user.name);
  const [customerPhone, setCustomerPhone] = useState(user.phone);
  const [notes, setNotes] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const subtotal = getCartSubtotal();
  const total = getCartTotal();

  // If cart is completely empty, give quick option to seed signature items
  const handleAddSampleItem = () => {
    addToCart(MOCK_PRODUCTS[0], 1, {
      sweetness: "Less Sweet (50%)",
      iceLevel: "Normal Ice",
      milkType: "Fresh Milk",
      beanRoast: "Signature House Blend",
      notes: "Foam brulee tebal",
    });
  };

  const handleProcessOrder = () => {
    setIsProcessing(true);

    setTimeout(() => {
      const newOrder = createOrder({
        customerName: customerName || user.name,
        customerPhone: customerPhone || user.phone,
        fulfillmentType,
        tableNumber: fulfillmentType === "dine-in" ? tableNumber : undefined,
        deliveryAddress: fulfillmentType === "delivery" ? deliveryAddress : undefined,
        paymentMethod: selectedPayment,
      });

      setIsProcessing(false);
      router.push(`/order/track/${newOrder.id}`);
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0c] text-white pt-8 sm:pt-10 pb-32 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8 border-b border-white/5 pb-6">
        <div className="flex items-center gap-2 text-xs font-mono text-[#f59e0b] uppercase tracking-wider mb-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Midtrans Secure Payment Gateway • 256-Bit SSL</span>
        </div>
        <h1 className="font-heading font-extrabold text-3xl sm:text-4xl text-white">
          Kasir Pembayaran Digital
        </h1>
        <p className="text-xs sm:text-sm text-neutral-400 mt-1">
          Cabang Operasional: <span className="text-white font-semibold">{activeBranch.name}</span> ({activeBranch.address})
        </p>
      </div>

      {cartItems.length === 0 ? (
        <div className="py-20 text-center rounded-3xl bg-[#141418] border border-white/5 max-w-md mx-auto p-8">
          <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4">
            <ShoppingBag className="w-8 h-8 text-neutral-500" />
          </div>
          <h2 className="font-heading text-lg font-bold text-white mb-2">
            Keranjang Kamu Masih Kosong
          </h2>
          <p className="text-xs text-neutral-400 mb-6">
            Pilih menu favoritmu terlebih dahulu atau tambahkan menu signature instan di bawah ini.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={handleAddSampleItem}
              className="px-5 py-2.5 rounded-xl bg-[#9c6b3a] hover:bg-[#b07b44] text-white font-bold text-xs transition-colors"
            >
              + Tambah Kopi Susu Aren Brulee
            </button>
            <Link
              href="/menu"
              className="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-medium text-xs transition-colors"
            >
              Buka Katalog Menu
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Fulfillment & Customer Data & Payment Selection */}
          <div className="lg:col-span-7 space-y-6">
            {/* 1. Fulfillment Mode */}
            <div className="p-6 rounded-3xl bg-[#18181c] border border-white/10 space-y-4">
              <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-[#f59e0b] flex items-center gap-2">
                <span>01. Saluran Pesanan & Lokasi</span>
              </h2>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { id: "dine-in" as FulfillmentType, label: "Dine-In", desc: "Makan di Meja" },
                  { id: "pickup" as FulfillmentType, label: "Self Pickup", desc: "Ambil di Barista" },
                  { id: "drive-thru" as FulfillmentType, label: "Drive-Thru", desc: "Ambil di Kendaraan" },
                  { id: "delivery" as FulfillmentType, label: "Delivery", desc: "Antar Surabaya Area" },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setFulfillmentType(item.id)}
                    className={`p-3 rounded-2xl border text-left transition-all ${
                      fulfillmentType === item.id
                        ? "bg-[#9c6b3a]/20 border-[#9c6b3a] text-white shadow-sm"
                        : "bg-[#111114] border-white/5 text-neutral-400 hover:text-white"
                    }`}
                  >
                    <div className="font-heading font-bold text-xs text-white">{item.label}</div>
                    <div className="text-[10px] text-neutral-400">{item.desc}</div>
                  </button>
                ))}
              </div>

              {fulfillmentType === "dine-in" && (
                <div className="pt-2 flex items-center gap-3">
                  <span className="text-xs text-neutral-300 font-medium">Nomor Meja:</span>
                  <input
                    type="text"
                    value={tableNumber}
                    onChange={(e) => setTableNumber(e.target.value.toUpperCase())}
                    placeholder="Contoh: T-04"
                    className="w-28 px-3 py-2 rounded-xl bg-[#111114] border border-white/10 text-white font-mono text-xs focus:outline-none focus:border-[#f59e0b]"
                  />
                  <span className="text-[11px] text-neutral-500">
                    Staff akan langsung mengantarkan pesanan ke meja ini.
                  </span>
                </div>
              )}

              {fulfillmentType === "delivery" && (
                <div className="pt-2 space-y-2">
                  <label className="text-xs text-neutral-300 font-medium block">
                    Alamat Pengantaran Surabaya:
                  </label>
                  <textarea
                    value={deliveryAddress}
                    onChange={(e) => setDeliveryAddress(e.target.value)}
                    rows={2}
                    placeholder="Nama jalan, nomor rumah, gedung, patokan..."
                    className="w-full p-3 rounded-xl bg-[#111114] border border-white/10 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-[#f59e0b]"
                  />
                </div>
              )}
            </div>

            {/* 2. Customer Contact Info */}
            <div className="p-6 rounded-3xl bg-[#18181c] border border-white/10 space-y-4">
              <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-[#f59e0b]">
                02. Data Pemesan
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-neutral-300 mb-1.5">
                    Nama Pemesan
                  </label>
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-[#111114] border border-white/10 text-white text-xs focus:outline-none focus:border-[#f59e0b]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-neutral-300 mb-1.5">
                    Nomor WhatsApp (Untuk Notifikasi KDS)
                  </label>
                  <input
                    type="tel"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-[#111114] border border-white/10 text-white text-xs font-mono focus:outline-none focus:border-[#f59e0b]"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium text-neutral-300 mb-1.5">
                    Catatan Khusus Barista / Kitchen (Opsional)
                  </label>
                  <input
                    type="text"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Contoh: jangan terlalu manis, sedotan kertas, dll."
                    className="w-full px-4 py-2.5 rounded-xl bg-[#111114] border border-white/10 text-white text-xs focus:outline-none focus:border-[#f59e0b]"
                  />
                </div>
              </div>
            </div>

            {/* 3. Midtrans Payment Gateway Selector */}
            <div className="p-6 rounded-3xl bg-[#18181c] border border-white/10 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-[#f59e0b]">
                  03. Metode Pembayaran Midtrans Snap
                </h2>
                <div className="flex items-center gap-1.5 text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                  <Lock className="w-3 h-3" />
                  <span>Auto-Verified</span>
                </div>
              </div>

              <div className="space-y-2.5">
                {[
                  {
                    id: "qris" as PaymentMethod,
                    title: "QRIS Instant (GoPay, OVO, ShopeePay, BCA)",
                    desc: "Scan langsung dari aplikasi e-wallet apa saja. Verifikasi dalam 2 detik.",
                    icon: QrCode,
                    badge: "Paling Populer",
                  },
                  {
                    id: "bca-va" as PaymentMethod,
                    title: "BCA Virtual Account",
                    desc: "Transfer otomatis 24 jam tanpa perlu upload bukti transfer.",
                    icon: Building2,
                  },
                  {
                    id: "mandiri-va" as PaymentMethod,
                    title: "Mandiri / BNI Virtual Account",
                    desc: "Bayar instan melalui Livin' by Mandiri atau ATM.",
                    icon: Building2,
                  },
                  {
                    id: "credit-card" as PaymentMethod,
                    title: "Kartu Kredit / Debit Visa & Mastercard",
                    desc: "3D-Secure proteksi standar PCI-DSS.",
                    icon: CreditCard,
                  },
                ].map((item) => {
                  const Icon = item.icon;
                  const isSelected = selectedPayment === item.id;

                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setSelectedPayment(item.id)}
                      className={`w-full p-4 rounded-2xl border text-left flex items-start justify-between gap-3 transition-all ${
                        isSelected
                          ? "bg-[#9c6b3a]/15 border-[#f59e0b] text-white shadow-md"
                          : "bg-[#111114] border-white/5 text-neutral-400 hover:border-white/20"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={`p-2.5 rounded-xl ${
                            isSelected
                              ? "bg-[#f59e0b] text-black"
                              : "bg-white/5 text-neutral-400"
                          }`}
                        >
                          <Icon className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-heading font-bold text-xs sm:text-sm text-white">
                              {item.title}
                            </span>
                            {item.badge && (
                              <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-[#f59e0b]/20 text-[#fcd34d] border border-[#f59e0b]/30">
                                {item.badge}
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-neutral-400 mt-0.5">{item.desc}</p>
                        </div>
                      </div>

                      <div className="mt-1">
                        <div
                          className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                            isSelected
                              ? "border-[#f59e0b] bg-[#f59e0b]"
                              : "border-neutral-600"
                          }`}
                        >
                          {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-black" />}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right Column: Order Summary & Checkout Trigger */}
          <div className="lg:col-span-5 space-y-6">
            <div className="p-6 rounded-3xl bg-[#18181c] border border-white/10 space-y-4 sticky top-28">
              <h3 className="font-heading font-bold text-base text-white flex items-center justify-between">
                <span>Ringkasan Pesanan</span>
                <span className="text-xs font-mono text-neutral-400">
                  {cartItems.length} menu
                </span>
              </h3>

              {/* Items List */}
              <div className="max-h-60 overflow-y-auto space-y-3 pr-1">
                {cartItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between gap-3 text-xs border-b border-white/5 pb-2.5"
                  >
                    <div className="min-w-0">
                      <div className="font-medium text-white truncate">
                        {item.quantity}x {item.name}
                      </div>
                      <div className="text-[10px] text-neutral-400">
                        {item.customizations.sweetness} • {item.customizations.iceLevel}
                      </div>
                    </div>
                    <span className="font-mono font-semibold text-white whitespace-nowrap">
                      Rp {item.subtotal.toLocaleString("id-ID")}
                    </span>
                  </div>
                ))}
              </div>

              {/* Promo & Loyalty chips */}
              {appliedVoucher && (
                <div className="flex items-center justify-between text-xs px-3 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                  <span className="flex items-center gap-1.5">
                    <Tag className="w-3.5 h-3.5" /> Voucher {appliedVoucher.code}
                  </span>
                  <span>Aktif</span>
                </div>
              )}

              {redeemedPoints > 0 && (
                <div className="flex items-center justify-between text-xs px-3 py-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-[#f59e0b]">
                  <span className="flex items-center gap-1.5">
                    <Award className="w-3.5 h-3.5" /> Diskon Poin ({redeemedPoints} pts)
                  </span>
                  <span>-Rp {(redeemedPoints * 10).toLocaleString("id-ID")}</span>
                </div>
              )}

              {/* Price Breakdown */}
              <div className="space-y-2 text-xs text-neutral-400 pt-2 border-t border-white/5">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-mono text-white">
                    Rp {subtotal.toLocaleString("id-ID")}
                  </span>
                </div>
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
                  <span className="font-heading font-bold text-base text-white">Total Tagihan</span>
                  <span className="font-mono font-extrabold text-2xl text-[#f59e0b]">
                    Rp {total.toLocaleString("id-ID")}
                  </span>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="button"
                onClick={handleProcessOrder}
                disabled={isProcessing}
                className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-[#9c6b3a] to-[#d4b488] hover:opacity-95 text-white font-heading font-bold text-sm flex items-center justify-center gap-2 shadow-[0_4px_24px_rgba(156,107,58,0.4)] transition-all active:scale-[0.98] disabled:opacity-50"
              >
                {isProcessing ? (
                  <>
                    <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                    <span>Memproses Transaksi Midtrans...</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4" />
                    <span>Bayar Sekarang (Rp {total.toLocaleString("id-ID")})</span>
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </>
                )}
              </button>

              <p className="text-[11px] text-center text-neutral-500 leading-tight">
                Pesanan otomatis terhubung ke sistem Kitchen Display (KDS) & poin loyalty langsung bertambah.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
