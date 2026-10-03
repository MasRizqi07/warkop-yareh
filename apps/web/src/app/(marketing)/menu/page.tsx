'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Coffee, AlertCircle, MapPin, Info } from 'lucide-react';
import { useActiveBranch, useCatalog } from '@/features/catalog/catalog.hooks';
import { VERIFIED_BRANCHES } from '@warkop-yareh/types';
import type { Product } from '@warkop-yareh/types';
import { useBranchStore } from '@/stores';
import { ProductCustomizerModal } from '@/components/menu/ProductCustomizerModal';
import { PUBLIC_ORDERING_ENABLED } from '@/lib/feature-flags';
import { TEST_CATALOG_ENABLED } from '@/lib/test-catalog';

export default function MenuPage() {
  const { data: runtimeBranches = [], activeBranch, isLoading: branchesLoading, isError: branchesError } = useActiveBranch();
  const catalog = useCatalog(activeBranch?.id);
  const activeBranchId = useBranchStore((state) => state.activeBranchId);
  const setActiveBranchId = useBranchStore((state) => state.setActiveBranchId);
  const [customizingProduct, setCustomizingProduct] =
    React.useState<Product | null>(null);

  const products = catalog.data?.products ?? [];
  const branchChoices = TEST_CATALOG_ENABLED
    ? runtimeBranches.map((branch) => ({ id: branch.id, name: branch.name }))
    : VERIFIED_BRANCHES;

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
            Informasi status menu dan kisaran pengeluaran di outlet Jetis Kulon
            dan Prapen.
          </p>

          {/* Branch Switcher Chips */}
          <div className="flex flex-wrap justify-center gap-2 pt-4">
            {branchChoices.map((b) => (
              <button
                key={b.id}
                onClick={() => setActiveBranchId(b.id)}
                aria-pressed={b.id === activeBranchId}
                className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold transition-all ${
                  b.id === activeBranchId
                    ? 'bg-accent-amber text-on-secondary shadow-md'
                    : 'border border-border-subtle bg-surface-card text-text-muted hover:text-text-primary'
                }`}
              >
                <MapPin className="h-3.5 w-3.5" />
                <span>{b.name}</span>
                <span className="font-mono text-[10px]">
                  (24 Jam)
                </span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-12 space-y-8">
        {/* Verification Status Banner */}
        {!branchesLoading && !branchesError && !catalog.isLoading && !catalog.isError && products.length === 0 ? <div className="rounded-3xl border border-accent-amber/40 bg-gradient-to-br from-accent-amber/10 via-surface-card to-canvas-obsidian p-6 sm:p-8 space-y-4">
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
                Katalog itemisasi dan daftar harga satuan resmi sedang
                diverifikasi langsung dari outlet fisik Jetis Kulon dan Prapen.
                Kami tidak mencantumkan menu spekulatif tanpa bukti autentik.
              </p>
            </div>
          </div>
        </div> : null}

        {/* Live Catalog Fallback / Products Display */}
        {branchesLoading || catalog.isLoading ? <p role="status" className="text-center text-sm text-text-muted">Memuat menu cabang…</p> : branchesError || catalog.isError ? <div role="alert" className="rounded-2xl border border-border-subtle bg-surface-card p-8 text-center text-sm">Menu belum dapat dimuat. Silakan coba kembali atau kunjungi outlet.</div> : products.length > 0 ? (
          <div className="space-y-4 pt-6">
            <h3 className="font-heading text-lg font-bold text-text-primary">
              Menu {activeBranch?.name ?? "Warkop Ya'reh"} ({products.length} item)
            </h3>
            <div data-testid="published-menu" className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {products.map((item) => (
                <article
                  key={item.id}
                  className="rounded-2xl border border-border-subtle bg-surface-card p-5 space-y-3 flex flex-col justify-between"
                >
                  {item.image ? <Image src={item.image} alt={item.name} width={560} height={360} unoptimized className="aspect-[14/9] w-full rounded-xl object-cover" /> : null}
                  <div className="space-y-2">
                    <p className="text-xs font-medium uppercase tracking-wide text-accent-amber">{item.category}</p>
                    <div className="flex justify-between items-start gap-2">
                      <h4 className="font-heading font-bold text-base text-text-primary">
                        {item.name}
                      </h4>
                      <span className="font-mono text-xs font-semibold text-accent-amber">
                        Rp {item.price.toLocaleString('id-ID')}
                      </span>
                    </div>
                    {item.description && (
                      <p className="text-xs text-text-muted leading-relaxed">
                        {item.description}
                      </p>
                    )}
                  </div>
                  {PUBLIC_ORDERING_ENABLED || (item.customizations?.length ?? 0) > 0 ? <div className="pt-2 border-t border-border-subtle/50 flex justify-end">
                    <button
                      type="button"
                      onClick={() =>
                        setCustomizingProduct(item as unknown as Product)
                      }
                      className="px-4 py-2 rounded-xl bg-accent-amber text-canvas-obsidian font-heading text-xs font-bold shadow-md hover:brightness-110 active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      <span>{!PUBLIC_ORDERING_ENABLED ? 'Lihat pilihan' : (item.customizations?.length ?? 0) > 0 ? 'Atur pilihan' : 'Tambah ke keranjang'}</span>
                    </button>
                  </div> : null}
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
              Untuk memesan, silakan langsung berkunjung ke cabang Jetis Kulon
              atau Prapen. Tim warkop kami siap melayani pesanan Anda 24 jam
              nonstop.
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
