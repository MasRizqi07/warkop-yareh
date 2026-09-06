'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, ChevronRight, Minus, Plus, ShoppingBag, Trash2, Users } from 'lucide-react';
import { useActiveBranch } from '@/features/catalog/catalog.hooks';
import { type FulfillmentType, useCartStore, useCheckoutStore } from '@/stores';

const FULFILLMENT_OPTIONS: Array<{ type: FulfillmentType; label: string }> = [
  { type: 'dine-in', label: 'Dine-In' },
  { type: 'pickup', label: 'Self Pickup' },
  { type: 'drive-thru', label: 'Drive-Thru' },
  { type: 'delivery', label: 'Delivery' },
];

export default function CartPage() {
  const items = useCartStore((state) => state.items);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const removeItem = useCartStore((state) => state.removeItem);
  const clearCart = useCartStore((state) => state.clearCart);
  const subtotal = useCartStore((state) => state.total());
  const fulfillmentType = useCheckoutStore((state) => state.fulfillmentType);
  const setFulfillmentType = useCheckoutStore((state) => state.setFulfillmentType);
  const splitBillCount = useCheckoutStore((state) => state.splitBillCount);
  const setSplitBillCount = useCheckoutStore((state) => state.setSplitBillCount);
  const tableLabel = useCheckoutStore((state) => state.tableLabel);
  const { activeBranch } = useActiveBranch();
  const estimatedTotal = subtotal + Math.round(subtotal * 0.11);
  const perPersonShare = Math.ceil(estimatedTotal / splitBillCount);

  return (
    <main className="mx-auto min-h-screen max-w-7xl bg-[#0a0a0c] px-4 pb-32 pt-8 text-white sm:px-6 sm:pt-10 lg:px-8">
      <nav aria-label="Breadcrumb" className="mb-6 flex items-center gap-2 font-mono text-xs text-neutral-400">
        <Link href="/" className="hover:text-white">Beranda</Link><ChevronRight className="h-3 w-3" /><Link href="/menu" className="hover:text-white">Menu</Link><ChevronRight className="h-3 w-3" /><span className="text-[#f59e0b]">Keranjang</span>
      </nav>

      <div className="mb-8 flex flex-col justify-between gap-4 border-b border-white/5 pb-6 sm:flex-row sm:items-end">
        <div><h1 className="font-heading text-3xl font-extrabold sm:text-4xl">Keranjang Belanja</h1><p className="mt-1 text-sm text-neutral-400">{activeBranch ? `Pesanan untuk ${activeBranch.name}` : 'Menyiapkan cabang aktif...'}</p></div>
        {items.length > 0 && <button type="button" onClick={clearCart} className="flex items-center gap-1.5 self-start text-xs text-rose-400 hover:text-rose-300"><Trash2 className="h-3.5 w-3.5" />Kosongkan keranjang</button>}
      </div>

      {items.length === 0 ? (
        <section className="mx-auto max-w-xl rounded-3xl border border-white/5 bg-[#141418] p-8 py-20 text-center">
          <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-white/5"><ShoppingBag className="h-10 w-10 text-neutral-500" /></div>
          <h2 className="font-heading text-xl font-bold">Belum ada item di keranjang</h2>
          <p className="mx-auto mb-6 mt-2 max-w-sm text-sm text-neutral-400">Pilih sajian dari katalog cabang aktif untuk memulai pesanan.</p>
          <Link href="/menu" className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-[#9c6b3a] to-[#d4b488] px-6 py-3 text-sm font-bold text-white">Buka Katalog <ArrowRight className="h-4 w-4" /></Link>
        </section>
      ) : (
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          <section aria-labelledby="cart-items-title" className="space-y-4 lg:col-span-7">
            <h2 id="cart-items-title" className="px-1 font-mono text-xs text-neutral-400">DAFTAR MENU ({items.reduce((count, item) => count + item.quantity, 0)} ITEM)</h2>
            {items.map((item) => (
              <article key={`${item.product.id}-${JSON.stringify(item.customizations)}-${item.notes ?? ''}`} className="flex flex-col justify-between gap-4 rounded-3xl border border-white/10 bg-[#18181c] p-4 sm:flex-row sm:items-center sm:p-5">
                <div className="flex min-w-0 items-center gap-4"><div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl bg-[#111114]"><Image src={item.product.image} alt={item.product.name} fill className="object-cover" sizes="80px" /></div><div className="min-w-0"><h3 className="truncate font-heading text-base font-bold">{item.product.name}</h3>{item.customizations && <p className="mt-1 line-clamp-2 text-[11px] text-neutral-400">{Object.values(item.customizations).join(' • ')}</p>}{item.notes && <p className="mt-1 line-clamp-1 text-[11px] italic text-neutral-500">“{item.notes}”</p>}<p className="mt-2 font-mono text-xs text-neutral-400">Rp {item.unitPrice.toLocaleString('id-ID')} / item</p></div></div>
                <div className="flex items-center justify-between gap-3 border-t border-white/5 pt-3 sm:flex-col sm:items-end sm:border-0 sm:pt-0"><span className="font-mono text-base font-bold text-[#f59e0b]">Rp {(item.unitPrice * item.quantity).toLocaleString('id-ID')}</span><div className="flex items-center gap-2"><div className="flex items-center gap-2 rounded-xl border border-white/10 bg-[#111114] p-1"><button type="button" onClick={() => updateQuantity(item.product.id, item.quantity - 1, item.customizations, item.notes)} className="flex h-7 w-7 items-center justify-center rounded-lg hover:bg-white/10" aria-label={`Kurangi ${item.product.name}`}><Minus className="h-3.5 w-3.5" /></button><span className="w-6 text-center font-mono text-xs font-bold">{item.quantity}</span><button type="button" onClick={() => updateQuantity(item.product.id, item.quantity + 1, item.customizations, item.notes)} className="flex h-7 w-7 items-center justify-center rounded-lg hover:bg-white/10" aria-label={`Tambah ${item.product.name}`}><Plus className="h-3.5 w-3.5" /></button></div><button type="button" onClick={() => removeItem(item.product.id, item.customizations, item.notes)} className="rounded-xl p-2 text-neutral-500 hover:bg-rose-500/10 hover:text-rose-400" aria-label={`Hapus ${item.product.name}`}><Trash2 className="h-4 w-4" /></button></div></div>
              </article>
            ))}

            <div className="mt-6 space-y-3 rounded-3xl border border-white/5 bg-[#141418] p-5">
              <h2 className="font-mono text-xs font-semibold uppercase tracking-wider text-neutral-400">Tipe Pemesanan</h2>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">{FULFILLMENT_OPTIONS.map((option) => <button key={option.type} type="button" aria-pressed={fulfillmentType === option.type} onClick={() => setFulfillmentType(option.type)} className={`rounded-2xl border px-3 py-3 text-xs font-semibold ${fulfillmentType === option.type ? 'border-[#9c6b3a] bg-[#9c6b3a]/20 text-white' : 'border-white/5 bg-[#18181c] text-neutral-400 hover:text-white'}`}>{option.label}</button>)}</div>
              {fulfillmentType === 'dine-in' && <p className="rounded-xl bg-white/5 p-3 text-xs text-neutral-400">{tableLabel ? `Meja terpilih dari QR: ${tableLabel}` : 'Tanpa QR meja, staf akan menentukan meja saat pesanan dikonfirmasi.'}</p>}
            </div>
          </section>

          <aside className="space-y-6 lg:col-span-5">
            <div className="space-y-4 rounded-3xl border border-white/10 bg-[#18181c] p-6">
              <div className="flex items-center justify-between"><div className="flex items-center gap-2"><div className="rounded-xl bg-sky-500/10 p-2 text-sky-400"><Users className="h-5 w-5" /></div><div><h2 className="font-heading text-sm font-bold">Kalkulator Split-Bill</h2><p className="font-mono text-[11px] text-neutral-400">Informasi pembagian saja</p></div></div><span className="rounded-full bg-sky-500/20 px-2.5 py-1 font-mono text-xs font-bold text-sky-300">{splitBillCount} orang</span></div>
              <input aria-label="Jumlah orang untuk split bill" type="range" min={1} max={10} value={splitBillCount} onChange={(event) => setSplitBillCount(Number(event.target.value))} className="h-2 w-full cursor-pointer rounded-lg bg-[#111114] accent-sky-400" />
              <div className="flex items-center justify-between rounded-2xl border border-sky-500/20 bg-[#111114] p-3.5 text-xs"><span className="text-neutral-300">Per orang:</span><span className="font-mono text-sm font-bold text-sky-400">Rp {perPersonShare.toLocaleString('id-ID')}</span></div>
            </div>

            <div className="sticky top-24 space-y-4 rounded-3xl border border-white/10 bg-[#18181c] p-6">
              <h2 className="font-heading text-base font-bold">Ringkasan Estimasi</h2>
              <div className="space-y-2 border-t border-white/5 pt-3 text-xs text-neutral-400"><div className="flex justify-between"><span>Subtotal</span><span className="font-mono text-white">Rp {subtotal.toLocaleString('id-ID')}</span></div><div className="flex justify-between"><span>Pajak 11%</span><span className="font-mono text-white">Rp {Math.round(subtotal * 0.11).toLocaleString('id-ID')}</span></div><div className="flex items-baseline justify-between border-t border-white/10 pt-3"><span className="font-heading text-base font-bold text-white">Estimasi total</span><span className="font-mono text-2xl font-extrabold text-[#f59e0b]">Rp {estimatedTotal.toLocaleString('id-ID')}</span></div></div>
              <p className="text-[11px] leading-relaxed text-neutral-500">Server akan memvalidasi ulang harga, ketersediaan, opsi, dan pajak pada langkah berikutnya.</p>
              <Link href="/checkout" className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#9c6b3a] to-[#d4b488] px-6 py-4 font-heading text-sm font-bold text-white">Lanjut Checkout <ArrowRight className="h-4 w-4" /></Link>
            </div>
          </aside>
        </div>
      )}
    </main>
  );
}
