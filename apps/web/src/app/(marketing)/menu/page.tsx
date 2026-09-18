'use client';

import React from 'react';
import Link from 'next/link';
import {
  Coffee,
  AlertCircle,
  MapPin,
  Utensils,
  Sparkles,
  Info,
} from 'lucide-react';
import { useActiveBranch, useCatalog } from '@/features/catalog/catalog.hooks';
import { VERIFIED_BRANCHES } from '@warkop-yareh/types';
import type { Product } from '@warkop-yareh/types';
import { useBranchStore } from '@/stores';
import { ProductCustomizerModal } from '@/components/menu/ProductCustomizerModal';

export default function MenuPage() {
  const { activeBranch } = useActiveBranch();
  const catalog = useCatalog(activeBranch?.id);
  const activeBranchId = useBranchStore((state) => state.activeBranchId);
  const setActiveBranchId = useBranchStore((state) => state.setActiveBranchId);
  const [customizingProduct, setCustomizingProduct] = React.useState<Product | null>(null);

  const products = catalog.data?.products ?? [];

  return (
    <div className="min-h-screen bg-canvas-obsidian text-on-surface pb-20 font-body">
      {/* Header Section */}
      <section className="relative border-b border-border-subtle bg-surface-secondary/40 py-16 sm:py-20">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-border-subtle bg-surface-card px-3.5 py-1 font-mono text-xs text-accent-amber">
            <Coffee className="h-3.5 w-3.5" />
            <span>Katalog & Status Menu</span>
          </div>
          <h1 className="font-heading text-3xl sm:text-5xl font-extrabold tracking-tight text-text-primary">
            Menu Warkop Ya&apos;reh
          </h1>
          <p className="text-sm sm:text-base text-text-muted max-w-xl mx-auto">
            Sajian seduhan kopi, minuman segar, dan hidangan warkop khas Surabaya buka 24 jam.
          </p>

          {/* Branch Switcher Chips */}
          <div className="flex flex-wrap justify-center gap-2 pt-4">
            {VERIFIED_BRANCHES.map((b) => (
              <button
                key={b.id}
                onClick={() => setActiveBranchId(b.id)}
                className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold transition-all ${
                  b.id === activeBranchId
                    ? 'bg-accent-amber text-on-secondary shadow-md'
                    : 'border border-border-subtle bg-surface-card text-text-muted hover:text-text-primary'
                }`}
              >
                <MapPin className="h-3.5 w-3.5" />
                <span>{b.name}</span>
                <span className="font-mono text-[10px] opacity-80">(24 Jam)</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-12 space-y-8">
        {/* Verification Status Banner */}
        <div className="rounded-3xl border border-accent-amber/40 bg-gradient-to-br from-accent-amber/10 via-surface-card to-canvas-obsidian p-6 sm:p-8 space-y-4">
          <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent-amber/20 text-accent-amber">
              <AlertCircle className="h-5 w-5" />
            </div>
            <div className="space-y-1">
              <span className="font-mono text-xs font-semibold uppercase tracking-wider text-accent-amber">
                Status Verifikasi Menu
              </span>
              <h2 className="font-heading text-xl sm:text-2xl font-bold text-text-primary">
                Menu Lengkap Sedang Diverifikasi Langsung
              </h2>
              <p className="text-xs sm:text-sm text-text-muted leading-relaxed pt-1">
                Katalog itemisasi dan daftar harga satuan resmi sedang diverifikasi langsung dari outlet fisik Jetis Kulon dan Prapen. Kami tidak mencantumkan menu spekulatif tanpa bukti autentik.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-border-subtle">
            <div className="rounded-2xl border border-border-subtle bg-surface-card/80 p-4 space-y-1">
              <span className="font-mono text-[11px] text-text-muted uppercase">Kisaran Pengeluaran Publik</span>
              <div className="font-heading text-lg font-bold text-text-primary">
                Rp1–25.000 / orang
              </div>
              <p className="text-[11px] text-text-muted">
                Berdasarkan data atribut listing publik Google Maps per kunjungan.
              </p>
            </div>

            <div className="rounded-2xl border border-border-subtle bg-surface-card/80 p-4 space-y-1">
              <span className="font-mono text-[11px] text-text-muted uppercase">Format Pelayanan</span>
              <div className="font-heading text-lg font-bold text-[var(--green-500)]">
                Dine-in & Takeaway
              </div>
              <p className="text-[11px] text-text-muted">
                Pemesanan langsung dilayani oleh staf barista di konter outlet 24 jam.
              </p>
            </div>
          </div>
        </div>

        {/* Typical Offering Categories Overview */}
        <div className="space-y-4">
          <div className="space-y-1">
            <h3 className="font-heading text-xl font-bold text-text-primary">
              Kategori Sajian Umum Warkop Ya&apos;reh
            </h3>
            <p className="text-xs sm:text-sm text-text-muted">
              Pilihan menu yang umumnya tersedia di kedua cabang kami di Surabaya:
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="rounded-2xl border border-border-subtle bg-surface-card p-5 space-y-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent-amber/15 text-accent-amber">
                <Coffee className="h-4 w-4" />
              </div>
              <h4 className="font-heading font-bold text-base text-text-primary">
                Kopi & Seduhan
              </h4>
              <p className="text-xs text-text-muted leading-relaxed">
                Kopi hitam warkop, kopi susu tradisional, racikan khas, dan varian seduhan panas maupun dingin.
              </p>
            </div>

            <div className="rounded-2xl border border-border-subtle bg-surface-card p-5 space-y-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-sky-500/15 text-sky-400">
                <Sparkles className="h-4 w-4" />
              </div>
              <h4 className="font-heading font-bold text-base text-text-primary">
                Minuman Segar
              </h4>
              <p className="text-xs text-text-muted leading-relaxed">
                Aneka es teh, es jeruk, susu kental manis, minuman cokelat, dan ragam penyegar dahaga.
              </p>
            </div>

            <div className="rounded-2xl border border-border-subtle bg-surface-card p-5 space-y-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/15 text-emerald-400">
                <Utensils className="h-4 w-4" />
              </div>
              <h4 className="font-heading font-bold text-base text-text-primary">
                Makanan & Camilan
              </h4>
              <p className="text-xs text-text-muted leading-relaxed">
                Mie instan warkop, gorengan hangat, roti bakar, dan camilan pendamping cangkrukan santai.
              </p>
            </div>
          </div>
        </div>

        {/* Live Catalog Fallback / Products Display */}
        {products.length > 0 ? (
          <div className="space-y-4 pt-6">
            <h3 className="font-heading text-lg font-bold text-text-primary">
              Menu Terverifikasi ({products.length} item)
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {products.map((item) => (
                <article
                  key={item.id}
                  className="rounded-2xl border border-border-subtle bg-surface-card p-5 space-y-3 flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex justify-between items-start gap-2">
                      <h4 className="font-heading font-bold text-base text-text-primary">
                        {item.name}
                      </h4>
                      <span className="font-mono text-xs font-semibold text-accent-amber">
                        Rp {item.price.toLocaleString('id-ID')}
                      </span>
                    </div>
                    {item.description && (
                      <p className="text-xs text-text-muted leading-relaxed">{item.description}</p>
                    )}
                  </div>
                  <div className="pt-2 border-t border-border-subtle/50 flex justify-end">
                    <button
                      type="button"
                      onClick={() => setCustomizingProduct(item as unknown as Product)}
                      className="px-4 py-2 rounded-xl bg-accent-amber text-canvas-obsidian font-heading text-xs font-bold shadow-md hover:brightness-110 active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      <span>Customize</span>
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </div>
        ) : (
          <div className="rounded-2xl border border-border-subtle bg-surface-secondary/40 p-8 text-center space-y-3">
            <Info className="h-8 w-8 text-text-muted mx-auto" />
            <h4 className="font-heading font-bold text-base text-text-primary">
              Pemesanan Langsung di Outlet
            </h4>
            <p className="text-xs text-text-muted max-w-md mx-auto">
              Untuk memesan, silakan langsung berkunjung ke cabang Jetis Kulon atau Prapen. Tim warkop kami siap melayani pesanan Anda 24 jam nonstop.
            </p>
            <div className="pt-2">
              <Link
                href="/outlets"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-accent-amber hover:underline"
              >
                Lihat Alamat & Lokasi Cabang →
              </Link>
            </div>
          </div>
        )}
      </div>

      <ProductCustomizerModal
        product={customizingProduct}
        isOpen={Boolean(customizingProduct)}
        onClose={() => setCustomizingProduct(null)}
      />
    </div>
  );
}
