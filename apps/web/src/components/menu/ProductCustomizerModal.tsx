'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import { AnimatePresence, motion } from 'framer-motion';
import { Coffee, Minus, Plus, SlidersHorizontal, X } from 'lucide-react';
import type { Product } from '@warkop-yareh/types';
import { useCartStore } from '@/stores';

interface ProductCustomizerModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
}

export function ProductCustomizerModal({ product, isOpen, onClose }: ProductCustomizerModalProps) {
  const addItem = useCartStore((state) => state.addItem);
  const [selections, setSelections] = useState<Record<string, string>>({});
  const [notes, setNotes] = useState('');
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    if (!isOpen || !product) return;
    setSelections(
      Object.fromEntries(
        (product.customizations ?? []).flatMap((definition) => {
          const first = definition.options[0];
          return first ? [[definition.name, first.label]] : [];
        }),
      ),
    );
    setNotes('');
    setQuantity(1);
  }, [isOpen, product]);

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen, onClose]);

  const additionalPrice = useMemo(() => {
    if (!product) return 0;
    return (product.customizations ?? []).reduce((total, definition) => {
      const selected = selections[definition.name];
      const option = definition.options.find((item) => item.label === selected);
      return total + (option?.price ?? 0);
    }, 0);
  }, [product, selections]);

  if (!product) return null;

  const unitPrice = product.price + additionalPrice;
  const totalPrice = unitPrice * quantity;
  const customizations = Object.keys(selections).length ? selections : undefined;

  const handleAddToCart = () => {
    addItem(product, quantity, customizations, notes.trim() || undefined, unitPrice);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center overflow-y-auto p-4 sm:p-6">
          <motion.button
            type="button"
            aria-label="Tutup pengaturan menu"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 cursor-default bg-black/75 backdrop-blur-md"
          />

          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="product-customizer-title"
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative z-10 flex max-h-[90dvh] w-full max-w-lg flex-col overflow-hidden rounded-3xl border border-white/10 bg-[#18181c] shadow-2xl"
          >
            <div className="relative h-48 w-full shrink-0 bg-[#111114]">
              <Image
                src={product.image}
                alt={product.name}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 500px"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#18181c] via-black/40 to-transparent" />
              <button
                type="button"
                onClick={onClose}
                className="absolute right-4 top-4 rounded-full bg-black/60 p-2 text-white backdrop-blur-md transition-colors hover:bg-black"
                aria-label="Tutup"
              >
                <X className="h-5 w-5" />
              </button>
              <div className="absolute bottom-4 left-6 right-6">
                <span className="rounded-full border border-[#f59e0b]/30 bg-[#f59e0b]/20 px-2.5 py-0.5 font-mono text-[10px] font-semibold uppercase text-[#fcd34d]">
                  {product.category.replaceAll('-', ' ')}
                </span>
                <h2 id="product-customizer-title" className="mt-1 font-heading text-xl font-bold leading-tight text-white">
                  {product.name}
                </h2>
              </div>
            </div>

            <div className="space-y-6 overflow-y-auto p-6 text-sm text-neutral-300">
              <p className="text-xs leading-relaxed text-neutral-400">{product.description}</p>

              {(product.customizations ?? []).length ? (
                (product.customizations ?? []).map((definition) => (
                  <fieldset key={definition.id}>
                    <legend className="mb-2.5 flex items-center gap-1.5 font-semibold text-white">
                      <SlidersHorizontal className="h-4 w-4 text-[#f59e0b]" />
                      {definition.name}
                    </legend>
                    <div className="grid grid-cols-2 gap-2">
                      {definition.options.map((option) => {
                        const selected = selections[definition.name] === option.label;
                        return (
                          <button
                            key={option.label}
                            type="button"
                            aria-pressed={selected}
                            onClick={() => setSelections((current) => ({ ...current, [definition.name]: option.label }))}
                            className={`rounded-xl border p-2.5 text-left text-xs font-medium transition-all ${
                              selected
                                ? 'border-[#9c6b3a] bg-[#9c6b3a]/20 text-white'
                                : 'border-white/5 bg-[#111114] text-neutral-400 hover:border-white/20'
                            }`}
                          >
                            <span className="block">{option.label}</span>
                            {option.price > 0 && (
                              <span className="mt-0.5 block font-mono text-[10px] text-[#f59e0b]">
                                +Rp {option.price.toLocaleString('id-ID')}
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </fieldset>
                ))
              ) : (
                <div className="flex items-center gap-3 rounded-2xl border border-white/5 bg-[#111114] p-3 text-xs text-neutral-400">
                  <Coffee className="h-5 w-5 shrink-0 text-[#f59e0b]" />
                  Menu ini disajikan dengan racikan standar barista.
                </div>
              )}

              <div>
                <label htmlFor="product-notes" className="mb-2 block font-semibold text-white">
                  Catatan untuk barista
                </label>
                <textarea
                  id="product-notes"
                  value={notes}
                  maxLength={300}
                  onChange={(event) => setNotes(event.target.value)}
                  placeholder="Contoh: tanpa sedotan, bungkus terpisah..."
                  className="h-20 w-full rounded-2xl border border-white/10 bg-[#111114] p-3 text-xs text-white placeholder-neutral-500 focus:border-[#f59e0b] focus:outline-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-between gap-4 border-t border-white/10 bg-[#111114] p-4 sm:p-6">
              <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-[#18181c] p-1.5">
                <button type="button" onClick={() => setQuantity((current) => Math.max(1, current - 1))} className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/5 text-white hover:bg-white/10" aria-label="Kurangi jumlah">
                  <Minus className="h-4 w-4" />
                </button>
                <span className="w-6 text-center font-mono text-sm font-bold text-white">{quantity}</span>
                <button type="button" onClick={() => setQuantity((current) => Math.min(100, current + 1))} className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/5 text-white hover:bg-white/10" aria-label="Tambah jumlah">
                  <Plus className="h-4 w-4" />
                </button>
              </div>

              <button type="button" onClick={handleAddToCart} className="flex min-w-0 flex-1 items-center justify-between gap-2 rounded-2xl bg-gradient-to-r from-[#9c6b3a] to-[#d4b488] px-4 py-3 font-heading text-sm font-bold text-white shadow-[0_4px_20px_rgba(156,107,58,0.4)] transition-all hover:opacity-95 active:scale-[0.98]">
                <span className="truncate">Tambah</span>
                <span className="whitespace-nowrap font-mono">Rp {totalPrice.toLocaleString('id-ID')}</span>
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
