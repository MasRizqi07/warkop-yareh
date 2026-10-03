import Link from 'next/link';
import { BrandLogo } from '@warkop-yareh/ui';
import { VERIFIED_BRANCHES } from '@warkop-yareh/types';
import { NAV_LINKS } from '@/lib/constants';
import { branchAddress } from '@/lib/seo';

export function Footer() {
  return (
    <footer className="border-t border-border-subtle bg-canvas-obsidian text-on-surface">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-12 pb-32 md:pb-12">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          <div className="space-y-4">
            <Link href="/" aria-label="Warkop Ya'reh, beranda">
              <BrandLogo size={40} />
            </Link>
            <p className="text-sm leading-relaxed text-text-muted">
              Kedai kopi lokal di Surabaya. Kunjungi cabang Jetis Kulon atau
              Prapen untuk dine-in dan takeaway.
            </p>
            <p className="text-sm text-text-muted">
              Buka 24 Jam • Dine-in &amp; Takeaway
            </p>
          </div>
          <div className="space-y-3">
            <h2 className="font-heading text-base font-bold">
              Cabang Warkop Ya&apos;reh
            </h2>
            {VERIFIED_BRANCHES.map((branch) => (
              <div
                key={branch.id}
                className="space-y-1 rounded-xl border border-border-subtle p-3"
              >
                <Link
                  href={`/outlets/${branch.slug}`}
                  className="text-sm font-semibold text-accent-amber"
                >
                  {branch.name}
                </Link>
                <p className="text-xs leading-relaxed text-text-muted">
                  {branchAddress(branch)}
                </p>
                {branch.phone && (
                  <a
                    className="inline-block py-2 text-sm text-accent-amber"
                    href={`tel:${branch.phone}`}
                  >
                    Prapen: {branch.phone}
                  </a>
                )}
              </div>
            ))}
          </div>
          <nav aria-label="Navigasi footer">
            <h2 className="font-heading text-base font-bold mb-3">Navigasi</h2>
            <ul className="space-y-1">
              {NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    className="inline-block py-2 text-sm text-text-muted hover:text-primary"
                    href={link.href}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
        <p className="mt-6 text-xs leading-relaxed text-text-muted">
          Jam dan kisaran pengeluaran mengacu pada listing publik yang dicatat
          pada 17 September 2026. Informasi ini dapat berubah; konfirmasikan
          langsung di outlet. Kisaran pengeluaran bukan harga per item menu.
        </p>
        <p className="mt-8 border-t border-border-subtle pt-6 text-xs text-text-muted">
          © {new Date().getFullYear()} Warkop Ya&apos;reh • Surabaya, Jawa Timur
        </p>
      </div>
    </footer>
  );
}
