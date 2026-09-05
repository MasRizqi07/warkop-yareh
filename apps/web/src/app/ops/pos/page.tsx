"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutGrid,
  ShoppingBag,
  Plus,
  Minus,
  Trash2,
  CheckCircle2,
  QrCode,
  Banknote,
  Search,
  MonitorCheck,
  Coffee,
  X,
} from "lucide-react";
import { useAppStore, AppCartItem, PaymentMethod } from "@/store/useAppStore";
import { MOCK_PRODUCTS, MockProduct } from "@/lib/mockData";
import { soundEffects } from "@/lib/audioAlerts";

function createPosItemId() {
  return `pos-${crypto.randomUUID()}`;
}

export default function PosTerminalPage() {
  const {
    getActiveBranch,
    createOrder,
    tables,
    currentShift,
  } = useAppStore();

  const activeBranch = getActiveBranch();

  // POS local active ticket state
  const [ticketItems, setTicketItems] = useState<AppCartItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [orderType, setOrderType] = useState<"dine-in" | "pickup">("dine-in");
  const [selectedTable, setSelectedTable] = useState("T-01");
  const [discountPercent, setDiscountPercent] = useState<number>(0);

  // Cash / Payment Modals
  const [isCashModalOpen, setIsCashModalOpen] = useState(false);
  const [isQrisModalOpen, setIsQrisModalOpen] = useState(false);
  const [cashTendered, setCashTendered] = useState<number>(0);
  const [completedOrderSuccess, setCompletedOrderSuccess] = useState<string | null>(null);

  // Filter products
  const filteredProducts = MOCK_PRODUCTS.filter((prod) => {
    const matchCategory = selectedCategory === "all" || prod.category === selectedCategory;
    const matchSearch = prod.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCategory && matchSearch;
  });

  // Add product to POS ticket
  const handleAddProduct = (prod: MockProduct) => {
    const existingIndex = ticketItems.findIndex((item) => item.productId === prod.id);
    if (existingIndex > -1) {
      const updated = [...ticketItems];
      updated[existingIndex].quantity += 1;
      updated[existingIndex].subtotal = updated[existingIndex].price * updated[existingIndex].quantity;
      setTicketItems(updated);
    } else {
      const newItem: AppCartItem = {
        id: createPosItemId(),
        productId: prod.id,
        name: prod.name,
        price: prod.price,
        image: prod.image,
        quantity: 1,
        customizations: {
          sweetness: "Normal (100%)",
          iceLevel: "Normal Ice",
          milkType: "Fresh Milk",
          beanRoast: "Signature House Blend",
        },
        subtotal: prod.price,
      };
      setTicketItems([...ticketItems, newItem]);
    }
    soundEffects.playSuccessChime();
  };

  const handleUpdateQty = (itemId: string, delta: number) => {
    const updated = ticketItems
      .map((item) => {
        if (item.id === itemId) {
          const newQty = item.quantity + delta;
          if (newQty <= 0) return null;
          return {
            ...item,
            quantity: newQty,
            subtotal: item.price * newQty,
          };
        }
        return item;
      })
      .filter(Boolean) as AppCartItem[];
    setTicketItems(updated);
  };

  const handleRemoveItem = (itemId: string) => {
    setTicketItems(ticketItems.filter((i) => i.id !== itemId));
  };

  // Financial calculations
  const subtotal = ticketItems.reduce((acc, item) => acc + item.subtotal, 0);
  const discountAmount = Math.round((subtotal * discountPercent) / 100);
  const taxableAmount = Math.max(0, subtotal - discountAmount);
  const tax = Math.round(taxableAmount * 0.1); // PB1 10%
  const grandTotal = taxableAmount + tax;

  const cashChange = Math.max(0, cashTendered - grandTotal);

  const handleFinalizeSale = (method: PaymentMethod) => {
    const created = createOrder({
      customerName: "Walk-In Cashier Guest",
      customerPhone: "0812-POS-OFFLINE",
      branchId: activeBranch.id,
      branchName: activeBranch.name,
      fulfillmentType: orderType,
      tableNumber: orderType === "dine-in" ? selectedTable : undefined,
      items: ticketItems,
      subtotal,
      voucherDiscount: discountAmount,
      tax,
      total: grandTotal,
      paymentMethod: method,
      paymentStatus: "paid",
      orderStatus: "confirmed", // POS orders go directly to confirmed for kitchen
    });

    soundEffects.playKdsBell();
    setCompletedOrderSuccess(created.id);
    setIsCashModalOpen(false);
    setIsQrisModalOpen(false);
    setTicketItems([]);
    setDiscountPercent(0);
    setCashTendered(0);

    setTimeout(() => {
      setCompletedOrderSuccess(null);
    }, 4000);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0c] text-white pt-4 sm:pt-6 pb-12 px-4 sm:px-6">
      {/* Top POS Bar */}
      <div className="flex items-center justify-between gap-4 bg-[#111114] p-3 rounded-2xl border border-white/10 mb-4 text-xs">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 font-bold flex items-center gap-1.5">
            <LayoutGrid className="w-4 h-4" />
            <span>TERMINAL KASIR #1</span>
          </div>
          <span className="font-mono text-neutral-300">
            Cabang: <span className="text-[#f59e0b] font-bold">{activeBranch.name}</span>
          </span>
          <span className="text-neutral-500 hidden sm:inline">|</span>
          <span className="text-neutral-400 hidden sm:inline">
            Kasir: <span className="text-white">{currentShift.cashierName}</span>
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/ops/kds"
            className="px-3 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/20 flex items-center gap-1.5 font-semibold transition-colors"
          >
            <MonitorCheck className="w-4 h-4" />
            <span>Buka KDS Dapur</span>
          </Link>
          <Link
            href="/ops/shift"
            className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-neutral-300 font-semibold transition-colors"
          >
            Rekonsiliasi Shift
          </Link>
        </div>
      </div>

      {completedOrderSuccess && (
        <div className="mb-4 p-4 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs flex items-center justify-between shadow-lg">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5" />
            <span>
              Transaksi Sukses #{completedOrderSuccess}! Tiket otomatis diteruskan ke layar KDS Barista.
            </span>
          </div>
          <Link
            href={`/order/track/${completedOrderSuccess}`}
            className="px-3 py-1 rounded-lg bg-emerald-500 text-black font-bold text-[11px]"
          >
            Cetak Struk
          </Link>
        </div>
      )}

      {/* Main Touchscreen 2-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 h-[calc(100vh-140px)]">
        {/* Left Column: Touchscreen High-Density Product Grid (7 cols) */}
        <div className="lg:col-span-7 flex flex-col bg-[#141418] rounded-3xl border border-white/10 p-4 overflow-hidden">
          {/* Category Bar & Search */}
          <div className="flex flex-col sm:flex-row gap-2 mb-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-neutral-500 absolute left-3 top-3" />
              <input
                aria-label="Cari menu POS"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari menu POS cepat..."
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-[#18181c] border border-white/10 text-xs text-white focus:outline-none focus:border-[#f59e0b]"
              />
            </div>

            <div className="flex gap-1 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
              {[
                { id: "all", label: "Semua" },
                { id: "coffee", label: "Kopi" },
                { id: "non-coffee", label: "Non-Kopi" },
                { id: "food", label: "Makanan" },
                { id: "pastry", label: "Pastry" },
              ].map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                    selectedCategory === cat.id
                      ? "bg-[#9c6b3a] text-white"
                      : "bg-[#18181c] text-neutral-400 hover:text-white"
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Touchscreen Product Grid */}
          <div className="flex-1 overflow-y-auto grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-2.5 pr-1">
            {filteredProducts.map((prod) => (
              <button
                key={prod.id}
                onClick={() => handleAddProduct(prod)}
                className="p-3 rounded-2xl bg-[#18181c] border border-white/5 hover:border-[#f59e0b]/50 text-left flex flex-col justify-between transition-all hover:bg-[#1f1f25] active:scale-95 shadow-sm group"
              >
                <div className="relative w-full h-24 rounded-xl overflow-hidden mb-2 bg-[#111114]">
                  <Image
                    src={prod.image}
                    alt={prod.name}
                    fill
                    className="object-cover"
                    sizes="160px"
                  />
                  <span className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded bg-black/70 text-[9px] font-mono text-[#f59e0b] font-bold">
                    {prod.preparationTime}m
                  </span>
                </div>

                <div>
                  <h4 className="font-heading font-bold text-xs text-white line-clamp-1 group-hover:text-[#fcd34d]">
                    {prod.name}
                  </h4>
                  <div className="font-mono font-bold text-xs text-[#f59e0b] mt-1">
                    Rp {prod.price.toLocaleString("id-ID")}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Right Column: Active Order Ticket & Checkout Controls (5 cols) */}
        <div className="lg:col-span-5 flex flex-col bg-[#18181c] rounded-3xl border border-white/10 p-5 overflow-hidden">
          {/* Ticket Header & Dine-In Selector */}
          <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-3">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-4 h-4 text-[#f59e0b]" />
              <span className="font-heading font-bold text-sm text-white">Tiket Aktif</span>
              <span className="text-[11px] font-mono text-neutral-400">
                ({ticketItems.length} item)
              </span>
            </div>

            {/* Dine-In vs Takeaway */}
            <div className="flex items-center gap-1 bg-[#111114] p-1 rounded-xl text-[11px]">
              <button
                onClick={() => setOrderType("dine-in")}
                className={`px-2.5 py-1 rounded-lg font-semibold transition-colors ${
                  orderType === "dine-in"
                    ? "bg-[#9c6b3a] text-white"
                    : "text-neutral-400 hover:text-white"
                }`}
              >
                Dine-In
              </button>
              <button
                onClick={() => setOrderType("pickup")}
                className={`px-2.5 py-1 rounded-lg font-semibold transition-colors ${
                  orderType === "pickup"
                    ? "bg-[#9c6b3a] text-white"
                    : "text-neutral-400 hover:text-white"
                }`}
              >
                Takeaway
              </button>
            </div>
          </div>

          {/* Table Selector if Dine-In */}
          {orderType === "dine-in" && (
            <div className="flex items-center gap-2 mb-3 bg-[#111114] p-2 rounded-xl text-xs">
              <span className="text-neutral-400 font-mono text-[11px]">Meja:</span>
              <select
                aria-label="Pilih meja"
                value={selectedTable}
                onChange={(e) => setSelectedTable(e.target.value)}
                className="bg-[#18181c] border border-white/10 rounded-lg px-2 py-1 text-xs text-[#f59e0b] font-mono font-bold focus:outline-none"
              >
                {tables.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.label} ({t.zoneName.split(" ")[0]})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Ticket Items Scroll Area */}
          <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
            {ticketItems.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center text-neutral-500 text-xs p-6">
                <Coffee className="w-10 h-10 mb-2 text-neutral-600" />
                <p>Ketuk menu di layar kiri untuk menambahkan ke tiket kasir.</p>
              </div>
            ) : (
              ticketItems.map((item) => (
                <div
                  key={item.id}
                  className="p-2.5 rounded-2xl bg-[#111114] border border-white/5 flex items-center justify-between text-xs"
                >
                  <div className="min-w-0 flex-1 pr-2">
                    <div className="font-medium text-white truncate">{item.name}</div>
                    <div className="font-mono text-[#f59e0b] text-[11px]">
                      Rp {item.subtotal.toLocaleString("id-ID")}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1.5 bg-[#18181c] border border-white/10 rounded-lg p-0.5">
                      <button
                        onClick={() => handleUpdateQty(item.id, -1)}
                        className="w-6 h-6 rounded flex items-center justify-center text-neutral-300 hover:text-white"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="font-mono font-bold w-4 text-center text-white">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => handleUpdateQty(item.id, 1)}
                        className="w-6 h-6 rounded flex items-center justify-center text-neutral-300 hover:text-white"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>

                    <button
                      onClick={() => handleRemoveItem(item.id)}
                      className="text-neutral-500 hover:text-rose-400 p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Discount Modifiers Quick Bar */}
          <div className="pt-3 border-t border-white/10 mb-3">
            <div className="flex items-center justify-between text-[11px] font-mono text-neutral-400 mb-1.5">
              <span>DISKON KASIR:</span>
              <span className="text-white font-bold">{discountPercent}%</span>
            </div>
            <div className="grid grid-cols-4 gap-1.5">
              {[0, 10, 15, 20].map((pct) => (
                <button
                  key={pct}
                  onClick={() => setDiscountPercent(pct)}
                  className={`py-1 rounded-lg text-xs font-mono font-bold transition-colors ${
                    discountPercent === pct
                      ? "bg-[#f59e0b] text-black"
                      : "bg-[#111114] text-neutral-400 hover:text-white"
                  }`}
                >
                  {pct === 0 ? "Normal" : `${pct}%`}
                </button>
              ))}
            </div>
          </div>

          {/* Summary & Payment Triggers */}
          <div className="space-y-2 pt-2 border-t border-white/10 text-xs">
            <div className="flex justify-between text-neutral-400 font-mono">
              <span>Subtotal:</span>
              <span className="text-white">Rp {subtotal.toLocaleString("id-ID")}</span>
            </div>
            {discountAmount > 0 && (
              <div className="flex justify-between text-emerald-400 font-mono">
                <span>Potongan Diskon:</span>
                <span>-Rp {discountAmount.toLocaleString("id-ID")}</span>
              </div>
            )}
            <div className="flex justify-between text-neutral-400 font-mono">
              <span>Pajak Resto (10%):</span>
              <span className="text-white">Rp {tax.toLocaleString("id-ID")}</span>
            </div>
            <div className="flex justify-between font-bold text-sm text-white pt-1 border-t border-white/5">
              <span>Total Akhir:</span>
              <span className="font-mono text-base text-[#f59e0b]">
                Rp {grandTotal.toLocaleString("id-ID")}
              </span>
            </div>

            {/* Action Buttons: Cash vs QRIS */}
            <div className="grid grid-cols-2 gap-2 pt-2">
              <button
                disabled={ticketItems.length === 0}
                onClick={() => {
                  setCashTendered(grandTotal);
                  setIsCashModalOpen(true);
                }}
                className="py-3 px-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white font-heading font-bold text-xs flex items-center justify-center gap-1.5 shadow-md transition-all active:scale-95"
              >
                <Banknote className="w-4 h-4" />
                <span>Bayar Tunai (Cash)</span>
              </button>

              <button
                disabled={ticketItems.length === 0}
                onClick={() => setIsQrisModalOpen(true)}
                className="py-3 px-3 rounded-2xl bg-gradient-to-r from-[#9c6b3a] to-[#d4b488] hover:opacity-95 disabled:opacity-40 text-white font-heading font-bold text-xs flex items-center justify-center gap-1.5 shadow-md transition-all active:scale-95"
              >
                <QrCode className="w-4 h-4" />
                <span>Midtrans QRIS</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Cash Tendered Calculator Modal */}
      <AnimatePresence>
        {isCashModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-sm rounded-3xl bg-[#18181c] border border-white/10 p-6 space-y-4 shadow-2xl"
            >
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <h3 className="font-heading font-bold text-base text-white flex items-center gap-2">
                  <Banknote className="w-5 h-5 text-emerald-400" />
                  <span>Kalkulator Uang Tunai</span>
                </h3>
                <button
                  onClick={() => setIsCashModalOpen(false)}
                  className="text-neutral-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-3 rounded-2xl bg-[#111114] text-center">
                <div className="text-xs text-neutral-400 font-mono">Total Tagihan</div>
                <div className="font-mono font-extrabold text-2xl text-[#f59e0b]">
                  Rp {grandTotal.toLocaleString("id-ID")}
                </div>
              </div>

              {/* Quick Cash Presets */}
              <div className="grid grid-cols-2 gap-2">
                {[grandTotal, 50000, 100000, 200000].map((amount) => (
                  <button
                    key={amount}
                    onClick={() => setCashTendered(amount)}
                    className={`p-2.5 rounded-xl border text-xs font-mono font-bold transition-colors ${
                      cashTendered === amount
                        ? "bg-emerald-600 text-white border-emerald-500"
                        : "bg-[#111114] border-white/10 text-neutral-300 hover:text-white"
                    }`}
                  >
                    {amount === grandTotal ? "Uang Pas" : `Rp ${amount.toLocaleString("id-ID")}`}
                  </button>
                ))}
              </div>

              <div>
                <label htmlFor="cash-tendered" className="block text-xs text-neutral-400 mb-1">Uang Diterima (Rp)</label>
                <input
                  id="cash-tendered"
                  type="number"
                  value={cashTendered || ""}
                  onChange={(e) => setCashTendered(parseInt(e.target.value) || 0)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#111114] border border-white/10 text-white font-mono text-base font-bold focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="p-3.5 rounded-2xl bg-emerald-950/20 border border-emerald-500/30 flex items-center justify-between text-xs">
                <span className="text-neutral-300 font-medium">Uang Kembalian:</span>
                <span className="font-mono font-extrabold text-base text-emerald-400">
                  Rp {cashChange.toLocaleString("id-ID")}
                </span>
              </div>

              <button
                disabled={cashTendered < grandTotal}
                onClick={() => handleFinalizeSale("cash")}
                className="w-full py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white font-heading font-bold text-xs shadow-lg transition-all"
              >
                Selesaikan Transaksi & Buka Laci Kas
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Midtrans QRIS Trigger Modal */}
      <AnimatePresence>
        {isQrisModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-sm rounded-3xl bg-[#18181c] border border-white/10 p-6 space-y-4 text-center shadow-2xl"
            >
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <span className="font-heading font-bold text-sm text-white">QRIS Dinamis Kasir</span>
                <button
                  onClick={() => setIsQrisModalOpen(false)}
                  className="text-neutral-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-4 bg-white rounded-2xl inline-block shadow-md">
                <QrCode className="w-44 h-44 text-black mx-auto" />
                <div className="font-mono text-[10px] text-neutral-600 font-bold mt-1">
                  TAGIHAN: Rp {grandTotal.toLocaleString("id-ID")}
                </div>
              </div>

              <p className="text-xs text-neutral-400">
                Arahkan layar monitor ke pelanggan untuk scan pembayaran via e-wallet.
              </p>

              <button
                onClick={() => handleFinalizeSale("qris")}
                className="w-full py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-heading font-bold text-xs shadow-md"
              >
                Simulasikan QRIS Terbayar (Instant Webhook)
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
