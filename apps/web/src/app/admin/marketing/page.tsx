"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  MessageCircle,
  Send,
  CheckCheck,
} from "lucide-react";
import { useAppStore } from "@/store/useAppStore";
import { soundEffects } from "@/lib/audioAlerts";

export default function AdminMarketingPage() {
  const pathname = usePathname();
  const { user, getActiveBranch } = useAppStore();
  const activeBranch = getActiveBranch();

  const [campaignTitle, setCampaignTitle] = useState("Voucher Re-Engagement Akhir Pekan");
  const [targetSegment, setTargetSegment] = useState("VIP & Active Regulars");
  const [templateText, setTemplateText] = useState(
    "Halo Kak {{nama_pelanggan}}! ☕\n\nKangen suasana warkop favoritmu? Sebagai member {{tier_member}} di Warkop Ya'reh {{cabang_aktif}}, kami sediakan diskon spesial 20% untuk menu favoritmu ({{menu_favorit}}).\n\nGunakan kode voucher: {{voucher_code}}\n\nYuk reservasi spot mejamu sekarang sebelum penuh!"
  );
  const [voucherCode, setVoucherCode] = useState("CREATOR20");
  const [isSending, setIsSending] = useState(false);
  const [broadcastSentSuccess, setBroadcastSentSuccess] = useState(false);

  const adminNav = [
    { href: "/admin", label: "Executive Dashboard" },
    { href: "/admin/inventory", label: "Stok & Inventaris" },
    { href: "/admin/crm", label: "CRM & Segmentasi" },
    { href: "/admin/marketing", label: "WhatsApp Studio" },
    { href: "/admin/branches", label: "Multi-Cabang" },
  ];

  // Merge variables interpolation
  const interpolatedPreview = templateText
    .replace(/{{nama_pelanggan}}/g, user.name)
    .replace(/{{tier_member}}/g, user.tier)
    .replace(/{{saldo_poin}}/g, `${user.points} PTS`)
    .replace(/{{cabang_aktif}}/g, activeBranch.name)
    .replace(/{{menu_favorit}}/g, "Kopi Susu Aren Brulee")
    .replace(/{{voucher_code}}/g, voucherCode);

  const handleInsertVariable = (variable: string) => {
    setTemplateText((prev) => `${prev} {{${variable}}}`);
  };

  const handleSendBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSending(true);

    setTimeout(() => {
      setIsSending(false);
      setBroadcastSentSuccess(true);
      soundEffects.playSuccessChime();
      setTimeout(() => setBroadcastSentSuccess(false), 5000);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0c] text-white pt-8 sm:pt-10 pb-32 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Admin Module Sub-Nav */}
      <div className="flex items-center gap-1 overflow-x-auto pb-2 mb-8 border-b border-white/5 scrollbar-none">
        {adminNav.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                isActive
                  ? "bg-[#9c6b3a] text-white shadow-md"
                  : "text-neutral-400 hover:text-white hover:bg-white/5"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-[#f59e0b] uppercase tracking-wider mb-1">
            <MessageCircle className="w-4 h-4 text-emerald-400" />
            <span>META CLOUD API WHATSAPP BROADCAST STUDIO</span>
          </div>
          <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-white">
            WhatsApp Broadcast & Automation Studio
          </h1>
          <p className="text-xs text-neutral-400 mt-0.5">
            Kirim pesan promosi terpersonalisasi langsung ke WhatsApp member Warkop Ya&apos;reh
          </p>
        </div>
      </div>

      {broadcastSentSuccess && (
        <div className="mb-6 p-4 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs flex items-center justify-between shadow-lg">
          <div className="flex items-center gap-2">
            <CheckCheck className="w-5 h-5 text-emerald-400" />
            <span>
              Siaran WhatsApp Berhasil Terkirim ke 770 Kontak ({targetSegment})!
            </span>
          </div>
        </div>
      )}

      {/* Main 2-Column: Editor vs Live iPhone Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Broadcast Editor (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <form
            onSubmit={handleSendBroadcast}
            className="p-6 sm:p-7 rounded-3xl bg-[#18181c] border border-white/10 space-y-5 shadow-xl"
          >
            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                Nama Kampanye Pesan
              </label>
              <input
                type="text"
                required
                value={campaignTitle}
                onChange={(e) => setCampaignTitle(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-[#111114] border border-white/10 text-white text-xs focus:outline-none focus:border-[#f59e0b]"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                  Target Segmen Pelanggan
                </label>
                <select
                  value={targetSegment}
                  onChange={(e) => setTargetSegment(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-[#111114] border border-white/10 text-white text-xs"
                >
                  <option value="VIP & Active Regulars">VIP & Active Regulars (770 kontak)</option>
                  <option value="At-Risk Customers">At-Risk Churn (84 kontak)</option>
                  <option value="Semua Member Surabaya">Semua Member (2.840 kontak)</option>
                  <option value="Khusus Cabang Darmo">Khusus Cabang Darmo Flagship</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                  Lampirkan Kode Voucher
                </label>
                <input
                  type="text"
                  value={voucherCode}
                  onChange={(e) => setVoucherCode(e.target.value.toUpperCase())}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#111114] border border-white/10 text-white font-mono uppercase text-xs focus:outline-none focus:border-[#f59e0b]"
                />
              </div>
            </div>

            {/* Merge Variables Quick Chips */}
            <div>
              <label className="block text-xs font-mono uppercase text-neutral-400 mb-2">
                Sisipkan Variabel Personalisasi (Merge Tags):
              </label>
              <div className="flex flex-wrap gap-1.5">
                {[
                  { tag: "nama_pelanggan", label: "+ Nama Pelanggan" },
                  { tag: "tier_member", label: "+ Tier Loyalty" },
                  { tag: "saldo_poin", label: "+ Saldo Poin" },
                  { tag: "menu_favorit", label: "+ Menu Favorit" },
                  { tag: "cabang_aktif", label: "+ Cabang" },
                  { tag: "voucher_code", label: "+ Kode Voucher" },
                ].map((item) => (
                  <button
                    key={item.tag}
                    type="button"
                    onClick={() => handleInsertVariable(item.tag)}
                    className="text-[11px] font-mono px-3 py-1 rounded-xl bg-white/5 hover:bg-white/10 text-[#f59e0b] border border-white/5 transition-colors"
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Message Template Textarea */}
            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                Template Pesan WhatsApp
              </label>
              <textarea
                rows={7}
                required
                value={templateText}
                onChange={(e) => setTemplateText(e.target.value)}
                className="w-full p-4 rounded-2xl bg-[#111114] border border-white/10 text-white text-xs font-sans leading-relaxed focus:outline-none focus:border-[#f59e0b]"
              />
            </div>

            <button
              type="submit"
              disabled={isSending}
              className="w-full py-3.5 px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-heading font-bold text-xs flex items-center justify-center gap-2 shadow-lg transition-all active:scale-95"
            >
              {isSending ? (
                <>
                  <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                  <span>Mengirimkan Siaran WhatsApp API...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Kirim Broadcast Sekarang ({targetSegment})</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Right Column: Live iPhone WhatsApp Preview (5 cols) */}
        <div className="lg:col-span-5 flex justify-center sticky top-28">
          <div className="w-[340px] rounded-[48px] bg-[#111114] border-[10px] border-[#222228] shadow-[0_25px_60px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col h-[640px]">
            {/* iPhone Dynamic Island */}
            <div className="h-9 bg-[#111114] flex items-center justify-center px-6 relative">
              <div className="w-24 h-4 rounded-full bg-black mx-auto" />
              <div className="absolute right-6 text-[10px] font-mono text-white">9:41</div>
            </div>

            {/* WhatsApp App Header */}
            <div className="bg-[#1f2c34] px-4 py-2.5 flex items-center gap-3 border-b border-black/20 text-white">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#f59e0b] to-[#9c6b3a] flex items-center justify-center font-bold text-xs">
                Y
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-xs leading-none">Warkop Ya&apos;reh Official</div>
                <div className="text-[10px] text-emerald-400 font-mono mt-0.5">Akun Bisnis Terverifikasi</div>
              </div>
            </div>

            {/* Chat Body Wallpaper */}
            <div className="flex-1 bg-[#0b141a] p-3.5 overflow-y-auto space-y-3 flex flex-col justify-end">
              {/* WhatsApp Bubble */}
              <div className="self-start max-w-[90%] bg-[#005c4b] text-white p-3.5 rounded-2xl rounded-tl-none shadow-md text-[11px] leading-relaxed relative">
                <div className="whitespace-pre-line">{interpolatedPreview}</div>
                <div className="flex items-center justify-end gap-1 mt-1 text-[9px] text-neutral-300 font-mono">
                  <span>{new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}</span>
                  <CheckCheck className="w-3 h-3 text-sky-400" />
                </div>
              </div>
            </div>

            {/* Fake Input Bar */}
            <div className="p-2.5 bg-[#1f2c34] flex items-center gap-2">
              <div className="flex-1 bg-[#2a3942] rounded-full px-3 py-1.5 text-[11px] text-neutral-400">
                Ketik pesan...
              </div>
              <div className="w-7 h-7 rounded-full bg-[#00a884] flex items-center justify-center text-white">
                <Send className="w-3.5 h-3.5" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
