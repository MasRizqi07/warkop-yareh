"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Wifi,
  Copy,
  Check,
  BellRing,
  Users,
  ChevronRight,
  Plus,
} from "lucide-react";
import { useAppStore } from "@/store/useAppStore";
import { MOCK_PRODUCTS, MockProduct } from "@/lib/mockData";
import { ProductCustomizerModal } from "@/components/menu/ProductCustomizerModal";
import { soundEffects } from "@/lib/audioAlerts";

export default function TableDineInPage() {
  const params = useParams();
  const rawTableId = (params?.tableId as string) || "T-04";
  const tableId = decodeURIComponent(rawTableId).toUpperCase();

  const {
    setTableNumber,
    setFulfillmentType,
    getActiveBranch,
    orders,
  } = useAppStore();

  const activeBranch = getActiveBranch();
  const [copiedWifi, setCopiedWifi] = useState(false);
  const [isCallBaristaOpen, setIsCallBaristaOpen] = useState(false);
  const [callReason, setCallReason] = useState("Minta Air Putih Mineral");
  const [callAlertSent, setCallAlertSent] = useState(false);
  const [customizingProduct, setCustomizingProduct] = useState<MockProduct | null>(null);

  // Auto-lock table in state
  useEffect(() => {
    setTableNumber(tableId);
    setFulfillmentType("dine-in");
  }, [tableId, setTableNumber, setFulfillmentType]);

  const handleCopyWifi = () => {
    if (typeof navigator !== "undefined") {
      navigator.clipboard.writeText(activeBranch.wifiPass);
      setCopiedWifi(true);
      setTimeout(() => setCopiedWifi(false), 2500);
    }
  };

  const handleSendCallBarista = (e: React.FormEvent) => {
    e.preventDefault();
    soundEffects.playKdsBell();
    setCallAlertSent(true);
    setTimeout(() => {
      setCallAlertSent(false);
      setIsCallBaristaOpen(false);
    }, 2000);
  };

  // Find active orders belonging to this table
  const activeTableOrders = orders.filter(
    (o) => o.tableNumber === tableId && o.orderStatus !== "completed"
  );

  return (
    <div className="min-h-screen bg-[#0a0a0c] text-white pt-8 sm:pt-10 pb-32 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
      {/* Table Welcome Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-[#18181c] to-[#141418] border border-white/10 shadow-2xl mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-[#f59e0b] uppercase tracking-wider mb-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>QR DINE-IN DIGITAL MENU • {activeBranch.name}</span>
            </div>
            <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-white">
              Selamat Datang di Meja {tableId}
            </h1>
            <p className="text-xs text-neutral-400 mt-1">
              Pesanan dari halaman ini otomatis terhubung ke meja kamu tanpa antre di kasir.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Wi-Fi Copy Chip */}
            <button
              onClick={handleCopyWifi}
              className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-[#111114] border border-white/10 hover:border-[#f59e0b]/40 text-xs font-mono text-neutral-300 transition-colors"
            >
              <Wifi className="w-4 h-4 text-[#f59e0b]" />
              <span>{activeBranch.wifiName}</span>
              {copiedWifi ? (
                <span className="text-emerald-400 font-bold flex items-center gap-1">
                  <Check className="w-3.5 h-3.5" /> Tersalin!
                </span>
              ) : (
                <Copy className="w-3.5 h-3.5 text-neutral-500" />
              )}
            </button>

            {/* Call Barista Modal Trigger */}
            <button
              onClick={() => setIsCallBaristaOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 text-xs font-semibold text-amber-300 transition-colors"
            >
              <BellRing className="w-4 h-4" />
              <span>Panggil Barista</span>
            </button>
          </div>
        </div>
      </div>

      {/* Active Table Orders (Shared Bill) */}
      {activeTableOrders.length > 0 && (
        <div className="p-6 rounded-3xl bg-[#18181c] border border-amber-500/30 shadow-xl mb-8 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-[#f59e0b]" />
              <h3 className="font-heading font-bold text-sm text-white">
                Tagihan Meja Aktif ({tableId})
              </h3>
            </div>
            <span className="text-xs font-mono text-amber-300">
              Sedang diproses oleh Barista
            </span>
          </div>

          <div className="space-y-2">
            {activeTableOrders.map((ord) => (
              <div
                key={ord.id}
                className="p-3.5 rounded-2xl bg-[#111114] border border-white/5 flex items-center justify-between text-xs"
              >
                <div>
                  <div className="font-medium text-white">
                    #{ord.id} • {ord.items.map((i) => `${i.quantity}x ${i.name}`).join(", ")}
                  </div>
                  <div className="text-[11px] text-neutral-400 font-mono mt-0.5">
                    Status: <span className="text-[#f59e0b] uppercase">{ord.orderStatus}</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-mono font-bold text-white">
                    Rp {ord.total.toLocaleString("id-ID")}
                  </div>
                  <Link
                    href={`/order/track/${ord.id}`}
                    className="text-[11px] text-[#f59e0b] hover:underline"
                  >
                    Lacak Langsung
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Menu Selection */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-heading font-bold text-lg text-white">
              Pesan Menu Tambahan ke Meja {tableId}
            </h2>
            <p className="text-xs text-neutral-400">
              Pesanan akan langsung diantarkan oleh barista ke meja kamu.
            </p>
          </div>

          <Link
            href="/menu"
            className="text-xs text-[#f59e0b] hover:underline flex items-center gap-1 font-semibold"
          >
            <span>Lihat Semua Menu</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {MOCK_PRODUCTS.map((product) => (
            <div
              key={product.id}
              className="p-5 rounded-3xl bg-[#18181c] border border-white/10 hover:border-[#f59e0b]/40 transition-all flex flex-col justify-between group shadow-lg"
            >
              <div className="flex gap-4">
                <div className="relative w-20 h-20 rounded-2xl overflow-hidden bg-[#111114] flex-shrink-0">
                  <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    className="object-cover"
                    sizes="80px"
                  />
                </div>
                <div>
                  <h3 className="font-heading font-bold text-sm text-white line-clamp-1 group-hover:text-[#fcd34d]">
                    {product.name}
                  </h3>
                  <p className="text-[11px] text-neutral-400 line-clamp-2 mt-1">
                    {product.description}
                  </p>
                  <div className="font-mono font-bold text-xs text-[#f59e0b] mt-2">
                    Rp {product.price.toLocaleString("id-ID")}
                  </div>
                </div>
              </div>

              <div className="pt-4 mt-4 border-t border-white/5 flex items-center justify-between">
                <span className="text-[11px] font-mono text-neutral-400">
                  {product.preparationTime} mnt saji
                </span>
                <button
                  onClick={() => setCustomizingProduct(product)}
                  className="px-3.5 py-1.5 rounded-xl bg-[#9c6b3a] hover:bg-[#b07b44] text-white text-xs font-semibold flex items-center gap-1.5 shadow-md active:scale-95 transition-all"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Pesan</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Call Barista Modal */}
      <AnimatePresence>
        {isCallBaristaOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
            <motion.form
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onSubmit={handleSendCallBarista}
              className="w-full max-w-sm rounded-3xl bg-[#18181c] border border-white/10 p-6 space-y-4 shadow-2xl"
            >
              <div className="text-center">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-[#f59e0b] flex items-center justify-center mx-auto mb-2 border border-amber-500/20">
                  <BellRing className="w-6 h-6" />
                </div>
                <h3 className="font-heading font-bold text-base text-white">
                  Panggil Barista ke Meja {tableId}
                </h3>
                <p className="text-xs text-neutral-400 mt-0.5">
                  Lonceng notifikasi KDS akan segera berbunyi di stasiun barista.
                </p>
              </div>

              <div className="space-y-2">
                {[
                  "Minta Air Putih Mineral (Free)",
                  "Tolong Bersihkan / Lap Meja",
                  "Minta Kabel / Colokan Ekstra",
                  "Bantuan Pembayaran / Split Bill",
                ].map((reason) => (
                  <button
                    key={reason}
                    type="button"
                    onClick={() => setCallReason(reason)}
                    className={`w-full p-2.5 rounded-xl border text-xs font-medium text-left transition-all ${
                      callReason === reason
                        ? "bg-[#f59e0b]/20 border-[#f59e0b] text-white"
                        : "bg-[#111114] border-white/5 text-neutral-400 hover:text-white"
                    }`}
                  >
                    {reason}
                  </button>
                ))}
              </div>

              {callAlertSent ? (
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs text-center font-semibold">
                  Lonceng Berbunyi! Barista sedang menuju ke meja kamu.
                </div>
              ) : (
                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsCallBaristaOpen(false)}
                    className="flex-1 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs text-neutral-300 font-semibold"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-[#9c6b3a] to-[#d4b488] text-white font-bold text-xs shadow-md"
                  >
                    Kirim Panggilan
                  </button>
                </div>
              )}
            </motion.form>
          </div>
        )}
      </AnimatePresence>

      {/* Product Customizer Modal */}
      <ProductCustomizerModal
        product={customizingProduct}
        isOpen={Boolean(customizingProduct)}
        onClose={() => setCustomizingProduct(null)}
      />
    </div>
  );
}
