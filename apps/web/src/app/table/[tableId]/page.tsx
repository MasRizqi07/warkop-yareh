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
    <div className="min-h-screen bg-canvas-obsidian text-text-primary pt-8 sm:pt-10 pb-32 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto transition-colors">
      {/* Table Welcome Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-surface-card border border-border-subtle shadow-2xl mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-accent-amber uppercase tracking-wider mb-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>QR DINE-IN DIGITAL MENU • {activeBranch.name}</span>
            </div>
            <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-text-primary">
              Selamat Datang di Meja {tableId}
            </h1>
            <p className="text-xs text-text-muted mt-1">
              Pesanan dari halaman ini otomatis terhubung ke meja kamu tanpa antre di kasir.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Wi-Fi Copy Chip */}
            <button
              onClick={handleCopyWifi}
              className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-surface-secondary border border-border-subtle hover:border-accent-amber/40 text-xs font-mono text-text-secondary transition-colors cursor-pointer"
            >
              <Wifi className="w-4 h-4 text-accent-amber" />
              <span>{activeBranch.wifiName}</span>
              {copiedWifi ? (
                <span className="text-emerald-400 font-bold flex items-center gap-1">
                  <Check className="w-3.5 h-3.5" /> Tersalin!
                </span>
              ) : (
                <Copy className="w-3.5 h-3.5 text-text-muted" />
              )}
            </button>

            {/* Call Barista Modal Trigger */}
            <button
              onClick={() => setIsCallBaristaOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-accent-amber/10 hover:bg-accent-amber/20 border border-accent-amber/20 text-xs font-semibold text-accent-amber transition-colors cursor-pointer"
            >
              <BellRing className="w-4 h-4" />
              <span>Panggil Barista</span>
            </button>
          </div>
        </div>
      </div>

      {/* Active Table Orders (Shared Bill) */}
      {activeTableOrders.length > 0 && (
        <div className="p-6 rounded-3xl bg-surface-card border border-accent-amber/30 shadow-xl mb-8 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-accent-amber" />
              <h3 className="font-heading font-bold text-sm text-text-primary">
                Tagihan Meja Aktif ({tableId})
              </h3>
            </div>
            <span className="text-xs font-mono text-accent-amber">
              Sedang diproses oleh Barista
            </span>
          </div>

          <div className="space-y-2">
            {activeTableOrders.map((ord) => (
              <div
                key={ord.id}
                className="p-3.5 rounded-2xl bg-surface-secondary border border-border-subtle flex items-center justify-between text-xs"
              >
                <div>
                  <div className="font-medium text-text-primary">
                    #{ord.id} • {ord.items.map((i) => `${i.quantity}x ${i.name}`).join(", ")}
                  </div>
                  <div className="text-[11px] text-text-muted font-mono mt-0.5">
                    Status: <span className="text-accent-amber uppercase font-semibold">{ord.orderStatus}</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-mono font-bold text-text-primary">
                    Rp {ord.total.toLocaleString("id-ID")}
                  </div>
                  <Link
                    href={`/order/track/${ord.id}`}
                    className="text-[11px] text-accent-amber hover:underline"
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
            <h2 className="font-heading font-bold text-lg text-text-primary">
              Pesan Menu Tambahan ke Meja {tableId}
            </h2>
            <p className="text-xs text-text-muted">
              Pesanan akan langsung diantarkan oleh barista ke meja kamu.
            </p>
          </div>

          <Link
            href="/menu"
            className="text-xs text-accent-amber hover:underline flex items-center gap-1 font-semibold"
          >
            <span>Lihat Semua Menu</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {MOCK_PRODUCTS.map((product) => (
            <div
              key={product.id}
              className="p-5 rounded-3xl bg-surface-card border border-border-subtle hover:border-accent-amber/40 transition-all flex flex-col justify-between group shadow-lg"
            >
              <div className="flex gap-4">
                <div className="relative w-20 h-20 rounded-2xl overflow-hidden bg-surface-secondary flex-shrink-0">
                  <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    className="object-cover"
                    sizes="80px"
                  />
                </div>
                <div>
                  <h3 className="font-heading font-bold text-sm text-text-primary line-clamp-1 group-hover:text-accent-amber transition-colors">
                    {product.name}
                  </h3>
                  <p className="text-[11px] text-text-muted line-clamp-2 mt-1">
                    {product.description}
                  </p>
                  <div className="font-mono font-bold text-xs text-accent-amber mt-2">
                    Rp {product.price.toLocaleString("id-ID")}
                  </div>
                </div>
              </div>

              <div className="pt-4 mt-4 border-t border-border-subtle flex items-center justify-between">
                <span className="text-[11px] font-mono text-text-muted">
                  {product.preparationTime} mnt saji
                </span>
                <button
                  onClick={() => setCustomizingProduct(product)}
                  className="px-3.5 py-1.5 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-semibold flex items-center gap-1.5 shadow-md active:scale-95 transition-all cursor-pointer"
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
              className="w-full max-w-sm rounded-3xl bg-surface-card border border-border-subtle p-6 space-y-4 shadow-2xl"
            >
              <div className="text-center">
                <div className="w-12 h-12 rounded-2xl bg-accent-amber/10 text-accent-amber flex items-center justify-center mx-auto mb-2 border border-accent-amber/20">
                  <BellRing className="w-6 h-6" />
                </div>
                <h3 className="font-heading font-bold text-base text-text-primary">
                  Panggil Barista ke Meja {tableId}
                </h3>
                <p className="text-xs text-text-muted mt-0.5">
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
                    className={`w-full p-2.5 rounded-xl border text-xs font-medium text-left transition-all cursor-pointer ${
                      callReason === reason
                        ? "bg-accent-amber/20 border-accent-amber text-text-primary"
                        : "bg-surface-secondary border-border-subtle text-text-muted hover:text-text-primary"
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
                    className="flex-1 py-2.5 rounded-xl bg-surface-secondary hover:bg-surface-container border border-border-subtle text-xs text-text-secondary font-semibold cursor-pointer transition-colors"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-[#9c6b3a] via-[#ee9800] to-[#f59e0b] text-[#0a0a0c] font-bold text-xs shadow-md cursor-pointer hover:brightness-110 active:scale-95 transition-all"
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
        product={
          customizingProduct
            ? ({
                ...customizingProduct,
                isPopular: Boolean(customizingProduct.isPopular),
                isNew: Boolean(customizingProduct.isNew),
              } as unknown as import("@warkop-yareh/types").Product)
            : null
        }
        isOpen={Boolean(customizingProduct)}
        onClose={() => setCustomizingProduct(null)}
      />
    </div>
  );
}
