"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  CheckCircle2,
  Clock,
  Coffee,
  BellRing,
  Download,
  MapPin,
  Sparkles,
  ExternalLink,
  RotateCw,
} from "lucide-react";
import { useAppStore, OrderStatus } from "@/store/useAppStore";
import { soundEffects } from "@/lib/audioAlerts";

export default function OrderTrackPage() {
  const params = useParams();
  const orderId = (params?.orderId as string) || "YRH-8492";

  const { orders, updateOrderStatus, getOrderById } = useAppStore();
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  // Retrieve current order
  const order = getOrderById(orderId) || orders[0];

  const steps: { status: OrderStatus; label: string; desc: string; icon: React.ElementType }[] = [
    {
      status: "pending",
      label: "Pesanan Diterima",
      desc: "Transaksi Midtrans terverifikasi, menunggu antrean KDS",
      icon: Clock,
    },
    {
      status: "confirmed",
      label: "Dikonfirmasi Barista",
      desc: "Pesanan masuk stasiun bar & dapur Ya'reh",
      icon: CheckCircle2,
    },
    {
      status: "preparing",
      label: "Sedang Dirajik",
      desc: "Biji kopi baru digiling dan diseduh presisi",
      icon: Coffee,
    },
    {
      status: "ready",
      label: "Siap Diambil / Diantar",
      desc: "Sajian siap di pick-up counter atau diantar ke meja",
      icon: BellRing,
    },
    {
      status: "completed",
      label: "Pesanan Selesai",
      desc: "Selamat menikmati sajian spesial Warkop Ya'reh!",
      icon: Sparkles,
    },
  ];

  const statusOrder: OrderStatus[] = ["pending", "confirmed", "preparing", "ready", "completed"];
  const currentStepIndex = statusOrder.indexOf(order?.orderStatus || "pending");

  // Fast prototype helper to advance status
  const handleSimulateNextStep = () => {
    if (!order) return;
    const nextIdx = Math.min(statusOrder.length - 1, currentStepIndex + 1);
    const nextStatus = statusOrder[nextIdx];
    updateOrderStatus(order.id, nextStatus);
    soundEffects.playKdsBell();
  };

  const handleDownloadReceipt = () => {
    setDownloadSuccess(true);
    soundEffects.playSuccessChime();
    setTimeout(() => setDownloadSuccess(false), 3000);
  };

  if (!order) {
    return (
      <div className="min-h-screen bg-[#0a0a0c] text-white pt-28 pb-20 flex items-center justify-center px-4">
        <div className="text-center space-y-4 max-w-md">
          <Clock className="w-12 h-12 text-[#f59e0b] mx-auto animate-pulse" />
          <h2 className="font-heading text-xl font-bold">Pesanan Tidak Ditemukan</h2>
          <p className="text-xs text-neutral-400">
            ID pesanan <span className="font-mono text-white">{orderId}</span> tidak tercatat di memori lokal.
          </p>
          <Link
            href="/menu"
            className="inline-block px-5 py-2.5 rounded-xl bg-[#9c6b3a] text-xs font-bold text-white"
          >
            Kembali ke Menu
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0c] text-white pt-8 sm:pt-10 pb-32 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
      {/* Top Header & Fast Jump */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-6 mb-8">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-[#f59e0b] mb-1">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>LIVE KITCHEN DISPLAY SYSTEM SYNC</span>
          </div>
          <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-white">
            Pelacakan Pesanan #{order.id}
          </h1>
          <p className="text-xs text-neutral-400 mt-0.5">
            Dipesan di <span className="text-white font-medium">{order.branchName}</span> • {new Date(order.createdAt).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })} WIB
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Simulation button */}
          <button
            onClick={handleSimulateNextStep}
            disabled={order.orderStatus === "completed"}
            className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-medium text-neutral-300 flex items-center gap-1.5 transition-colors disabled:opacity-40"
            title="Simulasikan Barista Memajukan Status"
          >
            <RotateCw className="w-3.5 h-3.5 text-[#f59e0b]" />
            <span>Simulasi Step Barista</span>
          </button>

          <Link
            href="/ops/kds"
            className="px-3.5 py-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 text-xs font-medium text-amber-300 flex items-center gap-1.5 transition-colors"
          >
            <span>Buka KDS Dapur</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Timeline Progress Tracker */}
        <div className="lg:col-span-7 space-y-6">
          {/* Status Hero Card */}
          <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-[#18181c] to-[#141418] border border-white/10 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 pointer-events-none opacity-5">
              <Coffee className="w-48 h-48" />
            </div>

            <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="px-3 py-1 rounded-full text-xs font-mono font-bold uppercase bg-[#f59e0b]/20 text-[#fcd34d] border border-[#f59e0b]/30">
                  Status: {order.orderStatus.toUpperCase()}
                </span>
                <h2 className="font-heading font-extrabold text-2xl text-white mt-3">
                  {steps[currentStepIndex]?.label}
                </h2>
                <p className="text-xs text-neutral-400 mt-1 max-w-sm">
                  {steps[currentStepIndex]?.desc}
                </p>
              </div>

              {order.orderStatus !== "completed" && (
                <div className="p-4 rounded-2xl bg-[#111114] border border-white/10 text-center min-w-[130px]">
                  <div className="text-[10px] font-mono uppercase text-neutral-400">Estimasi Selesai</div>
                  <div className="font-mono font-extrabold text-2xl text-[#f59e0b] mt-0.5">
                    {order.estimatedMinutes} Mnt
                  </div>
                  <div className="text-[10px] text-emerald-400 mt-0.5 flex items-center justify-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                    <span>Barista Aktif</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Stepper Vertical Timeline */}
          <div className="p-6 sm:p-8 rounded-3xl bg-[#18181c] border border-white/10 space-y-6">
            <h3 className="text-xs font-mono uppercase tracking-wider text-neutral-400 font-bold">
              Alur Proses Pesanan
            </h3>

            <div className="relative pl-6 space-y-8 before:absolute before:left-3 before:top-3 before:bottom-3 before:w-0.5 before:bg-white/10">
              {steps.map((step, idx) => {
                const isPassed = idx <= currentStepIndex;
                const isCurrent = idx === currentStepIndex;
                const Icon = step.icon;

                return (
                  <div key={step.status} className="relative flex items-start gap-4 group">
                    {/* Step Icon / Dot */}
                    <div
                      className={`absolute -left-6 top-0 w-6 h-6 rounded-full border flex items-center justify-center transition-all ${
                        isCurrent
                          ? "border-[#f59e0b] bg-[#f59e0b] text-black shadow-[0_0_12px_#f59e0b]"
                          : isPassed
                          ? "border-emerald-500 bg-emerald-500 text-white"
                          : "border-neutral-700 bg-[#111114] text-neutral-600"
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                    </div>

                    <div className="ml-3">
                      <h4
                        className={`text-sm font-heading font-bold ${
                          isPassed ? "text-white" : "text-neutral-500"
                        }`}
                      >
                        {step.label}
                      </h4>
                      <p className="text-xs text-neutral-400 mt-0.5">{step.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Table / Location Info */}
          <div className="p-5 rounded-2xl bg-[#141418] border border-white/5 flex items-center justify-between text-xs">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-white/5 text-[#f59e0b]">
                <MapPin className="w-4 h-4" />
              </div>
              <div>
                <div className="font-semibold text-white">
                  {order.fulfillmentType === "dine-in"
                    ? `Dine-In • Meja ${order.tableNumber || "T-04"}`
                    : order.fulfillmentType === "pickup"
                    ? "Self Pick-up di Counter Barista"
                    : "Antar Kilat Surabaya"}
                </div>
                <div className="text-[11px] text-neutral-400">{order.branchName}</div>
              </div>
            </div>
            <span className="font-mono text-xs text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
              Lunas ({order.paymentMethod.toUpperCase()})
            </span>
          </div>
        </div>

        {/* Right Column: Perforated Digital Receipt */}
        <div className="lg:col-span-5 space-y-4">
          <div className="relative rounded-3xl bg-[#1c1c21] border border-white/10 shadow-2xl p-6 sm:p-7 text-neutral-200">
            {/* Perforated Top Edge Teeth */}
            <div className="flex justify-between items-center border-b border-white/10 pb-4 mb-4">
              <div>
                <div className="font-heading font-black text-base text-white tracking-widest uppercase">
                  WARKOP YA&apos;REH
                </div>
                <div className="text-[10px] font-mono text-neutral-400">
                  SURABAYA COFFEE & COWORKING
                </div>
              </div>
              <div className="text-right font-mono text-xs">
                <div className="text-white font-bold">{order.id}</div>
                <div className="text-[10px] text-neutral-400">
                  {new Date(order.createdAt).toLocaleDateString("id-ID")}
                </div>
              </div>
            </div>

            {/* Customer Info */}
            <div className="text-xs space-y-1 font-mono text-neutral-400 mb-4 pb-4 border-b border-white/5">
              <div className="flex justify-between">
                <span>Pelanggan:</span>
                <span className="text-white font-medium">{order.customerName}</span>
              </div>
              <div className="flex justify-between">
                <span>WhatsApp:</span>
                <span className="text-white font-medium">{order.customerPhone}</span>
              </div>
              <div className="flex justify-between">
                <span>Layanan:</span>
                <span className="text-white font-medium uppercase">{order.fulfillmentType}</span>
              </div>
            </div>

            {/* Items Breakdown */}
            <div className="space-y-3 mb-6">
              {order.items.map((item, idx) => (
                <div key={idx} className="text-xs">
                  <div className="flex justify-between font-medium text-white">
                    <span>
                      {item.quantity}x {item.name}
                    </span>
                    <span className="font-mono">Rp {item.subtotal.toLocaleString("id-ID")}</span>
                  </div>
                  <div className="text-[10px] text-neutral-400 font-mono">
                    {item.customizations.sweetness}, {item.customizations.iceLevel}
                    {item.customizations.milkType !== "None" && `, ${item.customizations.milkType}`}
                  </div>
                </div>
              ))}
            </div>

            {/* Perforation Divider Line */}
            <div className="relative my-6">
              <div className="absolute -left-7 -right-7 border-b-2 border-dashed border-white/20" />
              <div className="absolute -left-9 -top-3 w-5 h-5 rounded-full bg-[#0a0a0c]" />
              <div className="absolute -right-9 -top-3 w-5 h-5 rounded-full bg-[#0a0a0c]" />
            </div>

            {/* Financial Summary */}
            <div className="space-y-1.5 text-xs text-neutral-400 font-mono pt-4 mb-6">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>Rp {order.subtotal.toLocaleString("id-ID")}</span>
              </div>
              {order.voucherDiscount > 0 && (
                <div className="flex justify-between text-emerald-400">
                  <span>Diskon Voucher</span>
                  <span>-Rp {order.voucherDiscount.toLocaleString("id-ID")}</span>
                </div>
              )}
              {order.pointsDiscount > 0 && (
                <div className="flex justify-between text-[#f59e0b]">
                  <span>Tukar Poin ({order.pointsRedeemed} pts)</span>
                  <span>-Rp {order.pointsDiscount.toLocaleString("id-ID")}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Pajak Restoran PB1</span>
                <span>Rp {order.tax.toLocaleString("id-ID")}</span>
              </div>
              <div className="flex justify-between">
                <span>Biaya Layanan</span>
                <span>Rp {order.serviceFee.toLocaleString("id-ID")}</span>
              </div>
              <div className="pt-2 border-t border-white/10 flex justify-between font-bold text-sm text-white">
                <span>TOTAL DIBAYAR</span>
                <span className="text-[#f59e0b]">Rp {order.total.toLocaleString("id-ID")}</span>
              </div>
            </div>

            {/* Mock Barcode */}
            <div className="pt-2 pb-4 text-center">
              <div className="h-10 w-full max-w-[240px] mx-auto bg-gradient-to-r from-white via-neutral-300 to-white flex items-center justify-center rounded overflow-hidden p-1">
                <div className="w-full h-full flex justify-between gap-0.5">
                  {Array.from({ length: 36 }).map((_, i) => (
                    <div
                      key={i}
                      className={`h-full ${i % 3 === 0 ? "w-1 bg-black" : "w-0.5 bg-black"}`}
                    />
                  ))}
                </div>
              </div>
              <p className="font-mono text-[10px] text-neutral-500 mt-1 tracking-widest">
                *{order.id}*
              </p>
            </div>

            {/* Download Button */}
            <button
              onClick={handleDownloadReceipt}
              className="w-full py-3 px-4 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
            >
              <Download className="w-4 h-4 text-[#f59e0b]" />
              <span>{downloadSuccess ? "Struk Berhasil Diunduh!" : "Unduh Struk Digital (PDF)"}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
