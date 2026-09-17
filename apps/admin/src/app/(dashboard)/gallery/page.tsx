"use client";

import React from "react";
import { Image as ImageIcon, Plus, ShieldCheck } from "lucide-react";

export default function AdminGalleryPage() {
  return (
    <div className="p-6 sm:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/[0.08] pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs text-[#f59e0b] uppercase tracking-wider">
              Asset Management
            </span>
            <span className="rounded bg-emerald-500/15 px-2 py-0.5 font-mono text-[10px] text-emerald-400">
              Verified Reality
            </span>
          </div>
          <h1 className="font-heading text-2xl sm:text-3xl font-bold text-white mt-1">
            Galeri Suasana Warkop
          </h1>
          <p className="text-xs sm:text-sm text-[#94a3b8] mt-1">
            Kelola dokumentasi visual autentik outlet Jetis Kulon dan Prapen tanpa foto stok atau AI.
          </p>
        </div>

        <button
          className="inline-flex items-center gap-2 rounded-xl bg-[#9c6b3a] px-4 py-2.5 text-xs font-semibold text-white hover:bg-[#b57d44] transition-colors shadow-md"
        >
          <Plus className="w-4 h-4" />
          Tambah Dokumentasi
        </button>
      </div>

      {/* Policy Notice */}
      <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-5 flex items-start gap-4">
        <ShieldCheck className="w-5 h-5 text-[#f59e0b] shrink-0 mt-0.5" />
        <div className="text-xs sm:text-sm text-[#94a3b8] space-y-1">
          <strong className="text-white block">Standar Kurasi Foto Autentik:</strong>
          <p>
            Semua aset galeri yang dipublikasikan ke aplikasi publik wajib diambil langsung dari lokasi fisik Warkop Ya&apos;reh (Jetis Kulon atau Prapen). Foto AI-generated, render fiktif, dan foto stok bertema kafe mewah dilarang keras.
          </p>
        </div>
      </div>

      {/* Empty / Placeholder State */}
      <div className="rounded-2xl border border-white/[0.08] bg-[#1a1a1e] p-12 text-center space-y-4">
        <div className="w-14 h-14 rounded-2xl bg-[#9c6b3a]/20 text-[#f59e0b] flex items-center justify-center mx-auto">
          <ImageIcon className="w-7 h-7" />
        </div>
        <div className="space-y-1 max-w-md mx-auto">
          <h3 className="font-heading text-lg font-bold text-white">
            Dokumentasi Sedang Dikurasi
          </h3>
          <p className="text-xs text-[#94a3b8]">
            Foto fisik beresolusi tinggi untuk Jetis Kulon dan Prapen akan ditampilkan di sini setelah proses audit visual selesai.
          </p>
        </div>
      </div>
    </div>
  );
}

