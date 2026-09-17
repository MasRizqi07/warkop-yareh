"use client";

import React from "react";
import { FileText, CheckCircle2, ShieldCheck } from "lucide-react";

export default function AdminSiteContentPage() {
  const sections = [
    {
      key: "homepage.hero",
      title: "Homepage Hero Copy",
      headline: "Warkop Ya'reh",
      tagline: "Ngopi, Makan, Nongkrong. 24 Jam.",
      status: "VERIFIED",
    },
    {
      key: "about.story",
      title: "About Page Narrative",
      headline: "Profil Warkop Ya'reh",
      tagline: "Kedai Kopi Lokal 24 Jam di Surabaya (Jetis Kulon & Prapen)",
      status: "VERIFIED",
    },
    {
      key: "menu.notice",
      title: "Menu Transparency Notice",
      headline: "Status Verifikasi Menu",
      tagline: "Kisaran Pengeluaran: Rp1–25.000 per orang",
      status: "VERIFIED",
    },
  ];

  return (
    <div className="p-6 sm:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/[0.08] pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs text-[#f59e0b] uppercase tracking-wider">
              Content Management System
            </span>
            <span className="rounded bg-emerald-500/15 px-2 py-0.5 font-mono text-[10px] text-emerald-400">
              Zero Hallucination
            </span>
          </div>
          <h1 className="font-heading text-2xl sm:text-3xl font-bold text-white mt-1">
            Site Content & Fakta Bisnis
          </h1>
          <p className="text-xs sm:text-sm text-[#94a3b8] mt-1">
            Kelola narasi publik, pengumuman resmi, dan audit jejak klaim bisnis Warkop Ya&apos;reh.
          </p>
        </div>
      </div>

      {/* Audit Policy */}
      <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-5 flex items-start gap-4">
        <ShieldCheck className="w-5 h-5 text-[#f59e0b] shrink-0 mt-0.5" />
        <div className="text-xs sm:text-sm text-[#94a3b8] space-y-1">
          <strong className="text-white block">Aturan Kebijakan Fakta:</strong>
          <p>
            Semua copywriting wajib berlandaskan data yang terverifikasi (VERIFIED). Dilarang menyisipkan narasi fiktif (seperti &quot;sejak tahun XXXX&quot; atau &quot;resep keluarga turun-temurun&quot;) tanpa bukti dokumen tertulis dari pemilik bisnis.
          </p>
        </div>
      </div>

      {/* Sections List */}
      <div className="grid grid-cols-1 gap-4">
        {sections.map((sec) => (
          <div
            key={sec.key}
            className="rounded-2xl border border-white/[0.08] bg-[#1a1a1e] p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
          >
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="font-mono text-[11px] text-[#94a3b8] uppercase">
                  {sec.key}
                </span>
                <span className="rounded bg-emerald-500/15 px-2 py-0.5 font-mono text-[10px] font-semibold text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  {sec.status}
                </span>
              </div>
              <h3 className="font-heading font-bold text-base text-white">
                {sec.title}
              </h3>
              <p className="text-xs text-[#94a3b8]">
                {sec.headline} — <em>&quot;{sec.tagline}&quot;</em>
              </p>
            </div>

            <button
              className="inline-flex items-center gap-1.5 rounded-xl border border-white/[0.1] bg-white/[0.04] px-4 py-2 text-xs font-semibold text-white hover:border-[#f59e0b]/40 transition-colors shrink-0"
            >
              <FileText className="w-3.5 h-3.5 text-[#f59e0b]" />
              Edit Konten
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

