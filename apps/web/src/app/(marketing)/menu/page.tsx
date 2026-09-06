'use client';

import { useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Clock, Coffee, Heart, Search, ShoppingBag, Sparkles, Star } from 'lucide-react';
import type { Product } from '@warkop-yareh/types';
import { ProductCustomizerModal } from '@/components/menu/ProductCustomizerModal';
import { useActiveBranch, useCatalog } from '@/features/catalog/catalog.hooks';
import { getApiErrorMessage } from '@/lib/api-error';

export default function MenuPage() {
  const { activeBranch, isPending: isBranchPending, isError: branchFailed, refetch: refetchBranches } = useActiveBranch();
  const catalog = useCatalog(activeBranch?.id);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [favorites, setFavorites] = useState<Set<string>>(() => new Set());
  const [customizingProduct, setCustomizingProduct] = useState<Product | null>(null);

  const allTags = useMemo(
    () => [...new Set((catalog.data?.products ?? []).flatMap((product) => product.tags))].sort(),
    [catalog.data?.products],
  );

  const filteredProducts = useMemo(() => {
    const search = searchQuery.trim().toLocaleLowerCase('id-ID');
    return (catalog.data?.products ?? []).filter((product) => {
      const matchesSearch =
        !search ||
        product.name.toLocaleLowerCase('id-ID').includes(search) ||
        product.description.toLocaleLowerCase('id-ID').includes(search) ||
        (product.ingredients ?? []).some((ingredient) =>
          ingredient.toLocaleLowerCase('id-ID').includes(search),
        );
      const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
      const matchesTag = !selectedTag || product.tags.includes(selectedTag);
      return matchesSearch && matchesCategory && matchesTag;
    });
  }, [catalog.data?.products, searchQuery, selectedCategory, selectedTag]);

  const toggleFavorite = (productId: string) => {
    setFavorites((current) => {
      const next = new Set(current);
      if (next.has(productId)) next.delete(productId);
      else next.add(productId);
      return next;
    });
  };

  const isLoading = isBranchPending || catalog.isPending;
  const error = branchFailed || catalog.isError;

  return (
    <main className="mx-auto min-h-screen max-w-7xl bg-[#0a0a0c] px-4 pb-32 pt-8 text-white sm:px-6 sm:pt-10 lg:px-8">
      <div className="mb-8 border-b border-white/5 pb-6">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <div className="mb-2 flex items-center gap-2 font-mono text-xs uppercase tracking-wider text-[#f59e0b]">
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
              <span>{activeBranch ? `Menu resmi • ${activeBranch.name}` : 'Memuat cabang aktif'}</span>
            </div>
            <h1 className="font-heading text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
              Katalog Specialty &amp; Artisan
            </h1>
            <p className="mt-1 max-w-xl text-sm text-neutral-400">
              Harga dan ketersediaan langsung dari sistem cabang. Total final selalu divalidasi ulang oleh server saat checkout.
            </p>
          </div>
          <Link href="/cart" className="flex items-center gap-2 self-start rounded-2xl border border-white/10 bg-[#18181c] px-4 py-2.5 text-xs font-semibold text-neutral-300 transition-colors hover:border-white/20">
            <ShoppingBag className="h-4 w-4 text-[#f59e0b]" />
            Lihat Keranjang
          </Link>
        </div>
      </div>

      <div className="mb-8 space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500" />
            <input aria-label="Cari menu" type="search" value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} placeholder="Cari kopi, cold brew, makanan..." className="w-full rounded-2xl border border-white/10 bg-[#141418] py-3 pl-11 pr-4 text-sm text-white placeholder-neutral-500 focus:border-[#f59e0b] focus:outline-none" />
          </div>
          {allTags.length > 0 && (
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
              {allTags.map((tag) => {
                const active = selectedTag === tag;
                return <button key={tag} type="button" aria-pressed={active} onClick={() => setSelectedTag(active ? null : tag)} className={`whitespace-nowrap rounded-xl px-3 py-2 text-xs font-medium transition-all ${active ? 'bg-[#f59e0b] font-bold text-black' : 'border border-white/10 bg-[#18181c] text-neutral-400 hover:text-white'}`}>#{tag}</button>;
              })}
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 overflow-x-auto border-b border-white/5 pb-2">
          <button type="button" aria-pressed={selectedCategory === 'all'} onClick={() => setSelectedCategory('all')} className={`whitespace-nowrap rounded-xl px-4 py-2 text-xs font-semibold ${selectedCategory === 'all' ? 'bg-[#9c6b3a] text-white' : 'bg-[#111114] text-neutral-400 hover:text-white'}`}>Semua Menu</button>
          {(catalog.data?.categories ?? []).map((category) => (
            <button key={category.id} type="button" aria-pressed={selectedCategory === category.slug} onClick={() => setSelectedCategory(category.slug)} className={`whitespace-nowrap rounded-xl px-4 py-2 text-xs font-semibold ${selectedCategory === category.slug ? 'bg-[#9c6b3a] text-white' : 'bg-[#111114] text-neutral-400 hover:text-white'}`}>
              {category.icon ? `${category.icon} ` : ''}{category.name}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div aria-label="Memuat katalog" className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, index) => <div key={index} className="h-[390px] animate-pulse rounded-3xl border border-white/5 bg-[#18181c]" />)}
        </div>
      ) : error ? (
        <section role="alert" className="rounded-3xl border border-rose-500/20 bg-rose-500/10 p-8 text-center">
          <h2 className="font-heading text-lg font-bold">Katalog belum dapat dimuat</h2>
          <p className="mx-auto mt-2 max-w-lg text-sm text-neutral-300">{getApiErrorMessage(catalog.error, 'Layanan katalog tidak terhubung. Pastikan API dan database aktif.')}</p>
          <button type="button" onClick={() => { void refetchBranches(); void catalog.refetch(); }} className="mt-5 rounded-xl bg-[#9c6b3a] px-5 py-2.5 text-xs font-bold text-white">Coba Lagi</button>
        </section>
      ) : filteredProducts.length === 0 ? (
        <section className="rounded-3xl border border-white/5 bg-[#111114] p-8 py-20 text-center">
          <Coffee className="mx-auto mb-3 h-12 w-12 text-neutral-600" />
          <h2 className="font-heading text-lg font-bold">Menu tidak ditemukan</h2>
          <p className="mt-1 text-xs text-neutral-400">Ubah kata kunci atau reset filter yang aktif.</p>
          <button type="button" onClick={() => { setSearchQuery(''); setSelectedCategory('all'); setSelectedTag(null); }} className="mt-4 rounded-xl bg-white/10 px-4 py-2 text-xs font-medium">Reset Filter</button>
        </section>
      ) : (
        <section aria-label="Daftar menu" className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredProducts.map((product, index) => (
            <motion.article key={product.id} initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} className="group relative flex flex-col overflow-hidden rounded-3xl border border-white/10 bg-[#18181c] transition-all duration-300 hover:-translate-y-1 hover:border-[#f59e0b]/40">
              <div className="relative h-48 w-full overflow-hidden bg-[#111114]">
                <Image src={product.image} alt={product.name} fill className="object-cover transition-transform duration-500 group-hover:scale-105" sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw" priority={index < 4} />
                <div className="absolute inset-0 bg-gradient-to-t from-[#18181c] via-black/30 to-transparent" />
                <div className="absolute left-3 top-3 flex gap-1.5">
                  {product.isPopular && <span className="flex items-center gap-1 rounded-full bg-[#f59e0b] px-2.5 py-0.5 font-mono text-[10px] font-bold text-black"><Sparkles className="h-3 w-3" /> FAVORIT</span>}
                  {product.isNew && <span className="rounded-full bg-emerald-700 px-2.5 py-0.5 font-mono text-[10px] font-bold text-white">BARU</span>}
                </div>
                <button type="button" onClick={() => toggleFavorite(product.id)} aria-label={favorites.has(product.id) ? `Hapus ${product.name} dari favorit` : `Simpan ${product.name} ke favorit`} aria-pressed={favorites.has(product.id)} className="absolute right-3 top-3 rounded-full bg-black/60 p-2 text-white backdrop-blur-md hover:bg-black/80">
                  <Heart className={`h-4 w-4 ${favorites.has(product.id) ? 'fill-rose-500 text-rose-500' : 'text-white'}`} />
                </button>
                <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between font-mono text-[11px] text-neutral-300">
                  <span className="flex items-center gap-1 rounded-md bg-black/60 px-2 py-0.5"><Star className="h-3.5 w-3.5 fill-[#f59e0b] text-[#f59e0b]" />{product.rating.toFixed(1)} <span className="text-neutral-400">({product.reviewCount})</span></span>
                  <span className="flex items-center gap-1 rounded-md bg-black/60 px-2 py-0.5"><Clock className="h-3 w-3" />{product.preparationTime} mnt</span>
                </div>
              </div>
              <div className="flex flex-1 flex-col justify-between p-5">
                <div>
                  <h2 className="line-clamp-1 font-heading text-base font-bold text-white group-hover:text-[#fcd34d]">{product.name}</h2>
                  <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-neutral-400">{product.description}</p>
                  {(product.ingredients ?? []).length > 0 && <div className="mt-3 flex flex-wrap gap-1">{(product.ingredients ?? []).slice(0, 2).map((ingredient) => <span key={ingredient} className="rounded-md bg-white/5 px-2 py-0.5 font-mono text-[10px] text-neutral-400">{ingredient}</span>)}</div>}
                </div>
                <div className="mt-4 flex items-center justify-between border-t border-white/5 pt-4">
                  <div><div className="font-mono text-[10px] uppercase text-neutral-500">Harga</div><div className="font-mono text-base font-bold text-[#f59e0b]">Rp {product.price.toLocaleString('id-ID')}</div></div>
                  <button type="button" onClick={() => setCustomizingProduct(product)} className="rounded-xl bg-[#9c6b3a] px-3.5 py-2 text-xs font-semibold text-white shadow-[0_4px_12px_rgba(156,107,58,0.3)] hover:bg-[#b07b44]">Pilih Menu</button>
                </div>
              </div>
            </motion.article>
          ))}
        </section>
      )}

      <ProductCustomizerModal product={customizingProduct} isOpen={Boolean(customizingProduct)} onClose={() => setCustomizingProduct(null)} />
    </main>
  );
}
