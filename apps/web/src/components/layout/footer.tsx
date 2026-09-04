"use client";

import Link from "next/link";
import { BrandLogo } from "@warkop-yareh/ui";
import { SITE, NAV_LINKS } from "@/lib/constants";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative bg-[#0a0a0c] text-[#e5e1e4] border-t border-white/[0.08] overflow-hidden">
      {/* Top subtle glow line */}
      <div className="h-px w-full bg-gradient-to-r from-transparent via-[#f59e0b]/30 to-transparent" />

      {/* Footer Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-32 md:pb-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-8 mb-14">
          {/* Brand Column (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            <Link href="/" className="inline-block group">
              <BrandLogo size={40} />
            </Link>
            <p className="text-sm text-[#94a3b8] max-w-sm leading-relaxed">
              Surabaya&apos;s 24/7 nexus for artisanal single-origin coffees, gigabit mesh networking, and inspiring coworking spaces engineered for creators, engineers, and night owls.
            </p>
            {/* Sanctuary Status Badge */}
            <div className="inline-flex items-center gap-2 bg-[#18181c] px-3.5 py-1.5 rounded-full border border-white/[0.08]">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="font-mono text-[11px] text-emerald-400 font-semibold tracking-wider uppercase">
                Dual-WAN Gigabit Fiber Nominal • 940 Mbps
              </span>
            </div>
          </div>

          {/* Outlets Sanctuary (3 cols) */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="font-mono text-xs font-semibold text-[#f8fafc] uppercase tracking-widest text-[#f59e0b]">
              Sanctuary Outlets
            </h4>
            <div className="space-y-2.5 text-sm text-[#94a3b8]">
              <div className="bg-[#111114] p-2.5 rounded-xl border border-white/[0.06]">
                <p className="text-[#f8fafc] font-semibold text-xs">Darmo Flagship (SBY Pusat)</p>
                <p className="text-[11px] text-[#94a3b8] mt-0.5">Jl. Raya Darmo No. 88, Surabaya</p>
                <span className="inline-block mt-1 text-[10px] font-mono text-[#e8c47a] bg-[#9c6b3a]/20 px-1.5 py-0.5 rounded">
                  24/7 Nonstop Ops
                </span>
              </div>
              <div className="bg-[#111114] p-2.5 rounded-xl border border-white/[0.06]">
                <p className="text-[#f8fafc] font-semibold text-xs">Gubeng 24H Hub (SBY Timur)</p>
                <p className="text-[11px] text-[#94a3b8] mt-0.5">Jl. Raya Gubeng No. 42, Surabaya</p>
                <span className="inline-block mt-1 text-[10px] font-mono text-[#e8c47a] bg-[#9c6b3a]/20 px-1.5 py-0.5 rounded">
                  24/7 Nonstop Ops
                </span>
              </div>
              <div className="bg-[#111114] p-2.5 rounded-xl border border-white/[0.06]">
                <p className="text-[#f8fafc] font-semibold text-xs">Dharmahusada Campus (Unair)</p>
                <p className="text-[11px] text-[#94a3b8] mt-0.5">Jl. Dharmahusada No. 115, Surabaya</p>
                <span className="inline-block mt-1 text-[10px] font-mono text-[#e8c47a] bg-[#9c6b3a]/20 px-1.5 py-0.5 rounded">
                  07:00 - 02:00 WIB
                </span>
              </div>
            </div>
          </div>

          {/* Quick Links (2 cols) */}
          <div className="lg:col-span-2 space-y-3">
            <h4 className="font-mono text-xs font-semibold text-[#f8fafc] uppercase tracking-widest text-[#f59e0b]">
              Navigation
            </h4>
            <ul className="space-y-2.5">
              {NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-[#94a3b8] hover:text-[#f7bb82] transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
              <li>
                <Link
                  href="/account"
                  className="text-sm text-[#94a3b8] hover:text-[#f7bb82] transition-colors"
                >
                  Account Portal
                </Link>
              </li>
              <li>
                <Link
                  href="/checkout"
                  className="text-sm text-[#94a3b8] hover:text-[#f7bb82] transition-colors"
                >
                  Cart & Orders
                </Link>
              </li>
            </ul>
          </div>

          {/* Social & Contact (2 cols) */}
          <div className="lg:col-span-2 space-y-3">
            <h4 className="font-mono text-xs font-semibold text-[#f8fafc] uppercase tracking-widest text-[#f59e0b]">
              Connect
            </h4>
            <div className="flex flex-col gap-2 text-sm text-[#94a3b8]">
              <a
                href={SITE.social.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-[#f7bb82] transition-colors flex items-center gap-1.5"
              >
                <span>Instagram</span>
              </a>
              <a
                href={`https://wa.me/${SITE.whatsapp}`}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-[#f7bb82] transition-colors flex items-center gap-1.5"
              >
                <span>WhatsApp Official</span>
              </a>
              <a
                href={SITE.social.tiktok}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-[#f7bb82] transition-colors flex items-center gap-1.5"
              >
                <span>TikTok</span>
              </a>
              <a
                href={`mailto:${SITE.email}`}
                className="hover:text-[#f7bb82] transition-colors flex items-center gap-1.5"
              >
                <span>{SITE.email}</span>
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-white/[0.06] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#94a3b8]">
          <p>© {currentYear} Warkop Ya&apos;reh Indonesia. All Rights Reserved.</p>
          <div className="flex items-center gap-6 font-mono text-[11px]">
            <span className="text-[#e8c47a]">Surabaya, East Java</span>
            <span>•</span>
            <span className="text-[#94a3b8]">Crafted with Precision & Single Origin</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
