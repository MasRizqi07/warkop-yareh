"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, ChevronRight } from "lucide-react";
import { useAppStore } from "@/store/useAppStore";

export default function OrdersIndexPage() {
  const router = useRouter();
  const { orders } = useAppStore();
  const [orderIdInput, setOrderIdInput] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (orderIdInput.trim()) {
      router.push(`/order/track/${encodeURIComponent(orderIdInput.trim().toUpperCase())}`);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0c] text-white pt-12 pb-32 px-4 sm:px-6 max-w-xl mx-auto space-y-6">
      <div className="p-8 rounded-3xl bg-[#141418] border border-white/10 shadow-2xl space-y-6 text-center">
        <div className="w-16 h-16 rounded-2xl bg-[#9c6b3a]/20 border border-[#9c6b3a]/40 text-[#f59e0b] flex items-center justify-center mx-auto">
          <Search className="w-8 h-8" />
        </div>

        <div>
          <h1 className="text-2xl font-heading font-extrabold text-white">
            Lacak Pesanan Warkop Ya&apos;reh
          </h1>
          <p className="text-xs text-neutral-400 mt-1">
            Masukkan kode tiket pesanan (contoh: YRH-8492) untuk memantau status live KDS.
          </p>
        </div>

        <form onSubmit={handleSearch} className="space-y-3">
          <input
            aria-label="Cari pesanan berdasarkan ID"
            type="text"
            value={orderIdInput}
            onChange={(e) => setOrderIdInput(e.target.value)}
            placeholder="Contoh: YRH-8492"
            className="w-full px-4 py-3 rounded-xl bg-[#18181c] border border-white/10 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-[#f59e0b] font-mono text-center uppercase font-bold"
            required
          />

          <button
            type="submit"
            className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-[#9c6b3a] to-[#d4b488] text-white font-heading font-bold text-xs shadow-md"
          >
            Lacak Status Sekarang
          </button>
        </form>
      </div>

      {/* Recent Orders List */}
      {orders.length > 0 && (
        <div className="p-6 rounded-3xl bg-[#18181c] border border-white/10 space-y-3">
          <h2 className="text-xs font-mono uppercase text-neutral-400 font-bold">
            Pesanan Terakhir Kamu
          </h2>
          <div className="space-y-2">
            {orders.slice(0, 3).map((ord) => (
              <Link
                key={ord.id}
                href={`/order/track/${ord.id}`}
                className="p-3 rounded-2xl bg-[#111114] border border-white/5 hover:border-white/20 flex items-center justify-between text-xs transition-colors"
              >
                <div>
                  <span className="font-mono font-bold text-white">#{ord.id}</span>
                  <div className="text-[11px] text-neutral-400">{ord.branchName} • {ord.items.length} menu</div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold text-[#f59e0b]">
                    Rp {ord.total.toLocaleString("id-ID")}
                  </span>
                  <ChevronRight className="w-4 h-4 text-neutral-500" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
