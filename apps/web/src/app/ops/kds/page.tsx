"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  MonitorCheck,
  Clock,
  Plus,
  ArrowRight,
} from "lucide-react";
import { useAppStore, OrderStatus, MasterOrder } from "@/store/useAppStore";
import { soundEffects } from "@/lib/audioAlerts";

export default function KitchenDisplaySystemPage() {
  const { orders, updateOrderStatus, createOrder, getActiveBranch } = useAppStore();
  const activeBranch = getActiveBranch();

  const [stationFilter, setStationFilter] = useState<"all" | "coffee" | "kitchen">("all");
  const [now, setNow] = useState(0);

  useEffect(() => {
    const interval = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(interval);
  }, []);

  const columns: { status: OrderStatus; label: string; countColor: string }[] = [
    { status: "pending", label: "01. Tiket Baru Masuk", countColor: "bg-rose-500" },
    { status: "preparing", label: "02. Sedang Diseduh / Dimasak", countColor: "bg-[#f59e0b]" },
    { status: "ready", label: "03. Siap Diambil / Diantar", countColor: "bg-emerald-500" },
    { status: "completed", label: "04. Selesai (Arsip Shift)", countColor: "bg-neutral-600" },
  ];

  // Helper to calculate elapsed minutes
  const getElapsedMinutes = (dateStr: string) => {
    const diffMs = now - new Date(dateStr).getTime();
    return Math.max(0, Math.floor(diffMs / 60000));
  };

  // Filter orders by station if needed
  const filterByStation = (orderList: MasterOrder[]) => {
    if (stationFilter === "all") return orderList;
    return orderList.filter((ord) => {
      const hasCoffee = ord.items.some(
        (i) => i.name.includes("Kopi") || i.name.includes("Brew") || i.name.includes("V60") || i.name.includes("Latte")
      );
      if (stationFilter === "coffee") return hasCoffee;
      return !hasCoffee; // kitchen
    });
  };

  const handleBumpStatus = (orderId: string, current: OrderStatus) => {
    let next: OrderStatus = "preparing";
    if (current === "pending" || current === "confirmed") next = "preparing";
    else if (current === "preparing") next = "ready";
    else if (current === "ready") next = "completed";

    updateOrderStatus(orderId, next);
    soundEffects.playKdsBell();
  };

  const handleCreateTestOrder = () => {
    createOrder({
      customerName: "Pelanggan Test KDS",
      customerPhone: "081233445566",
      fulfillmentType: "dine-in",
      tableNumber: "T-03",
      paymentMethod: "qris",
    });
  };

  return (
    <div className="min-h-screen bg-[#0a0a0c] text-white pt-4 sm:pt-6 pb-12 px-4 sm:px-6">
      {/* KDS Header Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#111114] p-4 rounded-2xl border border-white/10 mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-amber-500/20 text-[#f59e0b] flex items-center gap-2 font-heading font-extrabold text-sm">
            <MonitorCheck className="w-5 h-5" />
            <span>KITCHEN DISPLAY SYSTEM (KDS)</span>
          </div>
          <div>
            <div className="text-xs font-semibold text-white">{activeBranch.name}</div>
            <div className="text-[10px] font-mono text-neutral-400">
              Sinkronisasi Real-Time dengan Kasir POS & QR Meja
            </div>
          </div>
        </div>

        {/* Station Filters & Quick Seed Button */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <div className="flex items-center gap-1 bg-[#18181c] p-1 rounded-xl border border-white/10">
            <button
              onClick={() => setStationFilter("all")}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                stationFilter === "all" ? "bg-[#9c6b3a] text-white" : "text-neutral-400 hover:text-white"
              }`}
            >
              Semua Stasiun
            </button>
            <button
              onClick={() => setStationFilter("coffee")}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                stationFilter === "coffee" ? "bg-[#9c6b3a] text-white" : "text-neutral-400 hover:text-white"
              }`}
            >
              Espresso & Bar
            </button>
            <button
              onClick={() => setStationFilter("kitchen")}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                stationFilter === "kitchen" ? "bg-[#9c6b3a] text-white" : "text-neutral-400 hover:text-white"
              }`}
            >
              Kitchen Makanan
            </button>
          </div>

          <button
            onClick={handleCreateTestOrder}
            className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white font-semibold flex items-center gap-1.5 transition-colors"
          >
            <Plus className="w-4 h-4 text-[#f59e0b]" />
            <span>+ Simulasi Tiket Baru</span>
          </button>
        </div>
      </div>

      {/* 4-Column Kanban Board */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 items-start">
        {columns.map((col) => {
          const colOrders = filterByStation(
            orders.filter((o) => {
              if (col.status === "pending") return o.orderStatus === "pending" || o.orderStatus === "confirmed";
              return o.orderStatus === col.status;
            })
          );

          return (
            <div
              key={col.status}
              className="rounded-3xl bg-[#141418] border border-white/10 p-4 flex flex-col min-h-[680px]"
            >
              {/* Column Header */}
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/5">
                <span className="font-heading font-bold text-xs uppercase tracking-wider text-neutral-300">
                  {col.label}
                </span>
                <span
                  className={`w-6 h-6 rounded-full flex items-center justify-center font-mono font-bold text-xs text-white ${col.countColor}`}
                >
                  {colOrders.length}
                </span>
              </div>

              {/* Tickets Column Scroll Area */}
              <div className="space-y-3 flex-1 overflow-y-auto pr-1">
                {colOrders.length === 0 ? (
                  <div className="h-48 flex items-center justify-center text-center text-xs text-neutral-600">
                    Tidak ada tiket di antrean ini
                  </div>
                ) : (
                  colOrders.map((ord) => {
                    const elapsed = getElapsedMinutes(ord.createdAt);
                    const isOverdue = elapsed >= 12 && ord.orderStatus !== "completed";

                    return (
                      <motion.div
                        key={ord.id}
                        layout
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className={`rounded-2xl p-4 border transition-all shadow-md ${
                          isOverdue
                            ? "bg-rose-950/30 border-rose-500 shadow-[0_0_20px_rgba(244,63,94,0.3)] animate-pulse"
                            : "bg-[#18181c] border-white/10 hover:border-white/20"
                        }`}
                      >
                        {/* Ticket Top: ID, Table, Elapsed Time */}
                        <div className="flex items-center justify-between text-xs pb-2.5 mb-2.5 border-b border-white/5">
                          <div>
                            <span className="font-mono font-extrabold text-sm text-white">
                              #{ord.id}
                            </span>
                            <div className="text-[11px] font-mono text-[#f59e0b]">
                              {ord.fulfillmentType === "dine-in"
                                ? `MEJA: ${ord.tableNumber || "T-04"}`
                                : ord.fulfillmentType.toUpperCase()}
                            </div>
                          </div>

                          <div
                            className={`flex items-center gap-1 font-mono text-xs px-2 py-0.5 rounded-md ${
                              isOverdue
                                ? "bg-rose-500 text-white font-bold"
                                : "bg-[#111114] text-neutral-300"
                            }`}
                          >
                            <Clock className="w-3.5 h-3.5" />
                            <span>{elapsed} mnt</span>
                          </div>
                        </div>

                        {/* Customer Details */}
                        <div className="text-[11px] text-neutral-400 mb-3">
                          Pelanggan: <span className="text-white font-medium">{ord.customerName}</span>
                        </div>

                        {/* Order Items with Customizations */}
                        <div className="space-y-2 mb-4">
                          {ord.items.map((item, idx) => (
                            <div key={idx} className="text-xs bg-[#111114] p-2.5 rounded-xl border border-white/5">
                              <div className="flex justify-between font-bold text-white">
                                <span>{item.quantity}x {item.name}</span>
                              </div>
                              <div className="text-[10px] text-neutral-400 font-mono mt-0.5">
                                {item.customizations.sweetness} • {item.customizations.iceLevel}
                                {item.customizations.milkType !== "None" && ` • ${item.customizations.milkType}`}
                              </div>
                              {item.customizations.notes && (
                                <div className="text-[10px] text-[#fcd34d] italic mt-0.5">
                                  &ldquo;{item.customizations.notes}&rdquo;
                                </div>
                              )}
                            </div>
                          ))}
                        </div>

                        {/* Bump Status Action Button */}
                        {ord.orderStatus !== "completed" && (
                          <button
                            onClick={() => handleBumpStatus(ord.id, ord.orderStatus)}
                            className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-[#9c6b3a] to-[#d4b488] hover:opacity-95 text-white font-heading font-bold text-xs flex items-center justify-center gap-1.5 shadow-md active:scale-95 transition-all"
                          >
                            <span>
                              {ord.orderStatus === "pending" || ord.orderStatus === "confirmed"
                                ? "Mulai Proses Seduh"
                                : ord.orderStatus === "preparing"
                                ? "Tandai Siap Saji (Ready)"
                                : "Selesaikan Pesanan"}
                            </span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </motion.div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
