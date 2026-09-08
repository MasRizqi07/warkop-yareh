'use client';

import Link from 'next/link';
import { BrandLogo } from '@warkop-yareh/ui';
import { SITE, NAV_LINKS } from '@/lib/constants';
import { useBranches } from '@/features/catalog/catalog.hooks';

export function Footer() {
  const currentYear = new Date().getFullYear();
  const branches = useBranches();
  const contactLinks = [
    { label: 'Instagram', href: SITE.social.instagram, external: true },
    {
      label: 'WhatsApp Official',
      href: SITE.whatsapp ? `https://wa.me/${SITE.whatsapp}` : '',
      external: true,
    },
    { label: 'TikTok', href: SITE.social.tiktok, external: true },
    {
      label: SITE.email,
      href: SITE.email ? `mailto:${SITE.email}` : '',
      external: false,
    },
  ].filter((item) => item.href && item.label);

  return (
    <footer className="relative overflow-hidden border-t border-border-subtle bg-canvas-obsidian text-on-surface">
      {/* Top subtle glow line */}
      <div className="h-px w-full bg-gradient-to-r from-transparent via-accent-amber/30 to-transparent" />

      {/* Footer Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-32 md:pb-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-8 mb-14">
          {/* Brand Column (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            <Link href="/" className="inline-block group">
              <BrandLogo size={40} />
            </Link>
            <p className="max-w-sm text-sm leading-relaxed text-text-muted">
              Kopi, workspace, pemesanan, reservasi, komunitas, dan loyalty
              Warkop Ya&apos;reh dalam satu platform.
            </p>
            <div className="inline-flex items-center gap-2 rounded-full border border-border-subtle bg-surface-card px-3.5 py-1.5">
              <span className="h-2 w-2 rounded-full bg-accent-amber" />
              <span className="font-mono text-[11px] font-semibold uppercase tracking-wider text-cream-beige">
                Jam dan fasilitas mengikuti cabang pilihan
              </span>
            </div>
          </div>

          {/* Outlets Sanctuary (3 cols) */}
          <div id="locations" className="lg:col-span-3 space-y-3 scroll-mt-24">
            <h4 className="font-mono text-xs font-semibold uppercase tracking-widest text-accent-amber">
              Cabang aktif
            </h4>
            <div className="space-y-2.5 text-sm text-text-muted">
              {(branches.data ?? []).slice(0, 3).map((branch) => (
                <div
                  key={branch.id}
                  className="rounded-xl border border-border-subtle bg-surface-secondary p-2.5"
                >
                  <p className="text-xs font-semibold text-text-primary">
                    {branch.name}
                  </p>
                  <p className="mt-0.5 text-[11px] text-text-muted">
                    {branch.address}, {branch.city}
                  </p>
                  <span className="mt-1 inline-block rounded bg-primary-container/20 px-1.5 py-0.5 font-mono text-[10px] text-cream-beige">
                    Hari kerja {branch.weekdayHours}
                  </span>
                </div>
              ))}
              {!branches.isPending && !branches.data?.length && (
                <p className="text-xs text-text-muted">
                  Informasi cabang belum tersedia.
                </p>
              )}
            </div>
          </div>

          {/* Quick Links (2 cols) */}
          <div className="lg:col-span-2 space-y-3">
            <h4 className="font-mono text-xs font-semibold uppercase tracking-widest text-accent-amber">
              Navigation
            </h4>
            <ul className="space-y-2.5">
              {NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-text-muted transition-colors hover:text-primary"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
              <li>
                <Link
                  href="/account"
                  className="text-sm text-text-muted transition-colors hover:text-primary"
                >
                  Account Portal
                </Link>
              </li>
              <li>
                <Link
                  href="/checkout"
                  className="text-sm text-text-muted transition-colors hover:text-primary"
                >
                  Cart & Orders
                </Link>
              </li>
            </ul>
          </div>

          {/* Social & Contact (2 cols) */}
          <div className="lg:col-span-2 space-y-3">
            <h4 className="font-mono text-xs font-semibold uppercase tracking-widest text-accent-amber">
              Connect
            </h4>
            <div className="flex flex-col gap-2 text-sm text-text-muted">
              {contactLinks.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  {...(item.external
                    ? { target: '_blank', rel: 'noopener noreferrer' }
                    : {})}
                  className="flex items-center gap-1.5 transition-colors hover:text-primary"
                >
                  {item.label}
                </a>
              ))}
              {contactLinks.length === 0 && (
                <Link
                  href="/contact"
                  className="transition-colors hover:text-primary"
                >
                  Lihat halaman kontak
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="flex flex-col items-center justify-between gap-4 border-t border-border-subtle pt-8 text-xs text-text-muted sm:flex-row">
          <p>
            © {currentYear} Warkop Ya&apos;reh Indonesia. All Rights Reserved.
          </p>
          <div className="flex items-center gap-6 font-mono text-[11px]">
            <span className="text-cream-beige">Surabaya, East Java</span>
            <span>•</span>
            <span className="text-text-muted">
              Crafted with Precision & Single Origin
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
