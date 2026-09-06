'use client';

import { useState } from 'react';
import Image from 'next/image';
import * as Dialog from '@radix-ui/react-dialog';
import { Coffee, Minus, Plus, X } from 'lucide-react';
import { Button } from '@warkop-yareh/ui';
import type { Product } from '@warkop-yareh/types';
import { useCartStore } from '@/stores';

export function customizationPrice(product: Product, selections: Record<string, string>): number {
  return product.price + (product.customizations ?? []).reduce((total, definition) => total + (definition.options.find((option) => option.label === selections[definition.name])?.price ?? 0), 0);
}

function CustomizerForm({ product, onClose }: { product: Product; onClose: () => void }) {
  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes] = useState('');
  const [selections, setSelections] = useState<Record<string, string>>(() => Object.fromEntries((product.customizations ?? []).flatMap((definition) => definition.options[0] ? [[definition.name, definition.options[0].label]] : [])));
  const unitPrice = customizationPrice(product, selections);
  return <form onSubmit={(event) => {
    event.preventDefault();
    useCartStore.getState().addItem(product, quantity, Object.keys(selections).length ? selections : undefined, notes.trim() || undefined, unitPrice);
    onClose();
    useCartStore.getState().setCartOpen(true);
  }} className="space-y-6">
    <div className="flex items-start gap-4"><div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-2xl bg-surface-container"><Image src={product.image} alt={product.name} fill sizes="96px" className="object-cover" /></div><div><Dialog.Title className="text-xl font-semibold">{product.name}</Dialog.Title><Dialog.Description className="mt-2 text-sm text-text-muted">{product.description}</Dialog.Description><p className="mt-3 font-mono text-accent-amber">Rp {product.price.toLocaleString('id-ID')}</p></div></div>
    {(product.customizations ?? []).map((definition) => <fieldset key={definition.id} className="space-y-3"><legend className="mb-3 flex items-center gap-2 text-sm font-semibold"><Coffee className="h-4 w-4 text-accent-amber" />{definition.name}</legend><div className="grid gap-2 sm:grid-cols-2">{definition.options.map((option) => <label key={option.label} className={`flex cursor-pointer items-center gap-3 rounded-xl border p-4 text-sm ${selections[definition.name] === option.label ? 'border-accent-amber bg-accent-amber/5' : 'border-border-subtle bg-surface-secondary'}`}><input type="radio" name={definition.id} value={option.label} checked={selections[definition.name] === option.label} onChange={() => setSelections((current) => ({ ...current, [definition.name]: option.label }))} required /><span>{option.label}<span className="mt-1 block text-xs text-text-muted">{option.price ? `+Rp ${option.price.toLocaleString('id-ID')}` : 'Tanpa tambahan'}</span></span></label>)}</div></fieldset>)}
    <div><label htmlFor="customizer-notes" className="mb-2 block text-sm font-semibold">Catatan untuk barista</label><textarea id="customizer-notes" value={notes} onChange={(event) => setNotes(event.target.value)} maxLength={300} rows={3} className="w-full rounded-xl border border-border-subtle bg-surface-secondary p-3 text-sm" /></div>
    <div className="flex flex-wrap items-center justify-between gap-4 border-t border-border-subtle pt-5"><div className="flex items-center gap-3"><Button type="button" variant="secondary" size="icon" aria-label="Kurangi jumlah" disabled={quantity <= 1} onClick={() => setQuantity(quantity - 1)}><Minus /></Button><output aria-label="Jumlah produk" className="w-8 text-center font-mono">{quantity}</output><Button type="button" variant="secondary" size="icon" aria-label="Tambah jumlah" disabled={quantity >= 100} onClick={() => setQuantity(quantity + 1)}><Plus /></Button></div><Button type="submit">Tambah · Rp {(unitPrice * quantity).toLocaleString('id-ID')}</Button></div>
  </form>;
}

export function ProductCustomizerModal({ product, isOpen, onClose }: { product: Product | null; isOpen: boolean; onClose: () => void }) {
  return <Dialog.Root open={isOpen && Boolean(product)} onOpenChange={(open) => { if (!open) onClose(); }}><Dialog.Portal><Dialog.Overlay className="fixed inset-0 z-[110] bg-black/70 backdrop-blur-sm" /><Dialog.Content className="fixed left-1/2 top-1/2 z-[111] max-h-[90dvh] w-[calc(100%_-_2rem)] max-w-2xl -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-3xl border border-border-subtle bg-surface-card p-5 pt-14 text-text-primary shadow-2xl sm:p-8 sm:pt-14"><Dialog.Close className="absolute right-3 top-3 flex h-11 w-11 items-center justify-center rounded-xl hover:bg-surface-container" aria-label="Tutup kustomisasi"><X className="h-5 w-5" /></Dialog.Close>{product && <CustomizerForm key={product.id} product={product} onClose={onClose} />}</Dialog.Content></Dialog.Portal></Dialog.Root>;
}
