'use client';

import { useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, Minus, Plus, ShoppingBag, Trash2, X } from 'lucide-react';
import { useCartStore } from '@/stores';

export function CartDrawer() {
  const router = useRouter();
  const items = useCartStore((state) => state.items);
  const isOpen = useCartStore((state) => state.isOpen);
  const setCartOpen = useCartStore((state) => state.setCartOpen);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const removeItem = useCartStore((state) => state.removeItem);
  const subtotal = useCartStore((state) => state.total());

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setCartOpen(false);
    };
    if (isOpen) window.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [isOpen, setCartOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex justify-end">
          <motion.button type="button" aria-label="Tutup keranjang" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setCartOpen(false)} className="fixed inset-0 cursor-default bg-black/70 backdrop-blur-sm" />
          <motion.aside role="dialog" aria-modal="true" aria-labelledby="cart-drawer-title" initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 26, stiffness: 280 }} className="relative z-10 flex h-full w-full max-w-md flex-col border-l border-white/10 bg-[#111114] shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 p-5">
              <div className="flex items-center gap-2.5">
                <div className="rounded-xl bg-[#9c6b3a]/20 p-2 text-[#f59e0b]"><ShoppingBag className="h-5 w-5" /></div>
                <div><h2 id="cart-drawer-title" className="font-heading text-base font-bold text-white">Keranjang Pesanan</h2><p className="font-mono text-xs text-neutral-400">{items.reduce((count, item) => count + item.quantity, 0)} item dipilih</p></div>
              </div>
              <button type="button" onClick={() => setCartOpen(false)} className="rounded-full p-2 text-neutral-400 hover:bg-white/5 hover:text-white" aria-label="Tutup"><X className="h-5 w-5" /></button>
            </div>

            <div className="flex-1 space-y-4 overflow-y-auto p-5">
              {items.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center p-6 text-center text-neutral-400">
                  <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-white/5"><ShoppingBag className="h-8 w-8 text-neutral-500" /></div>
                  <h3 className="font-heading text-lg font-bold text-white">Keranjang masih kosong</h3>
                  <p className="mb-6 mt-1 max-w-xs text-xs">Pilih kopi specialty atau artisan snack favoritmu untuk memulai pesanan.</p>
                  <Link href="/menu" onClick={() => setCartOpen(false)} className="rounded-full bg-[#9c6b3a] px-5 py-2.5 text-xs font-semibold text-white hover:bg-[#b07b44]">Jelajahi Menu</Link>
                </div>
              ) : items.map((item) => (
                <article key={`${item.product.id}-${JSON.stringify(item.customizations)}-${item.notes ?? ''}`} className="flex gap-3 rounded-2xl border border-white/5 bg-[#18181c] p-3.5 hover:border-white/10">
                  <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-[#111114]"><Image src={item.product.image} alt={item.product.name} fill className="object-cover" sizes="64px" /></div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2"><h3 className="line-clamp-1 text-xs font-medium text-white">{item.product.name}</h3><button type="button" onClick={() => removeItem(item.product.id, item.customizations, item.notes)} className="p-1 text-neutral-500 hover:text-rose-400" aria-label={`Hapus ${item.product.name}`}><Trash2 className="h-3.5 w-3.5" /></button></div>
                    {item.customizations && <p className="mt-1 line-clamp-2 text-[10px] text-neutral-400">{Object.values(item.customizations).join(' • ')}</p>}
                    {item.notes && <p className="mt-0.5 line-clamp-1 text-[10px] italic text-neutral-500">“{item.notes}”</p>}
                    <div className="mt-3 flex items-center justify-between"><span className="font-mono text-xs font-bold text-white">Rp {(item.unitPrice * item.quantity).toLocaleString('id-ID')}</span><div className="flex items-center gap-2 rounded-lg border border-white/10 bg-[#111114] p-1"><button type="button" onClick={() => updateQuantity(item.product.id, item.quantity - 1, item.customizations, item.notes)} className="flex h-5 w-5 items-center justify-center rounded text-neutral-300 hover:bg-white/10" aria-label="Kurangi jumlah"><Minus className="h-3 w-3" /></button><span className="w-4 text-center font-mono text-xs font-bold text-white">{item.quantity}</span><button type="button" onClick={() => updateQuantity(item.product.id, item.quantity + 1, item.customizations, item.notes)} className="flex h-5 w-5 items-center justify-center rounded text-neutral-300 hover:bg-white/10" aria-label="Tambah jumlah"><Plus className="h-3 w-3" /></button></div></div>
                  </div>
                </article>
              ))}
            </div>

            {items.length > 0 && (
              <div className="space-y-3 border-t border-white/10 bg-[#141418] p-5">
                <div className="flex justify-between text-sm font-bold text-white"><span>Estimasi subtotal</span><span className="font-mono text-[#f59e0b]">Rp {subtotal.toLocaleString('id-ID')}</span></div>
                <p className="text-[10px] text-neutral-500">Pajak dan harga final dihitung ulang oleh server saat pesanan dibuat.</p>
                <div className="grid grid-cols-2 gap-2 pt-1"><button type="button" onClick={() => { setCartOpen(false); router.push('/cart'); }} className="rounded-xl border border-white/10 px-4 py-3 text-center text-xs font-semibold text-neutral-200 hover:bg-white/5">Detail Keranjang</button><button type="button" onClick={() => { setCartOpen(false); router.push('/checkout'); }} className="flex items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-[#9c6b3a] to-[#d4b488] px-4 py-3 text-xs font-bold text-white"><span>Checkout</span><ArrowRight className="h-3.5 w-3.5" /></button></div>
              </div>
            )}
          </motion.aside>
        </div>
      )}
    </AnimatePresence>
  );
}
