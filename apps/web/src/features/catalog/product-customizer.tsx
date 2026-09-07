'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import * as Dialog from '@radix-ui/react-dialog';
import { Coffee, Flame, Minus, Plus, Sparkles, X, Check } from 'lucide-react';
import { Button } from '@warkop-yareh/ui';
import type { Product } from '@warkop-yareh/types';
import { useCartStore } from '@/stores';
import { soundEffects } from '@/lib/audioAlerts';

export function customizationPrice(
  product: Product,
  selections: Record<string, string>,
  addons: Record<string, number>
): number {
  const customTotal = (product.customizations ?? []).reduce((total, definition) => {
    const selected = definition.options.find((option) => option.label === selections[definition.name]);
    return total + (selected?.price ?? 0);
  }, 0);

  const addonsTotal = Object.values(addons).reduce((sum, p) => sum + p, 0);

  return product.price + customTotal + addonsTotal;
}

const DEFAULT_SWEETNESS = [
  { label: 'Normal (100%)', desc: 'Standard manis resep' },
  { label: 'Less Sweet (70%)', desc: 'Rasa seimbang' },
  { label: 'Mild (30%)', desc: 'Sentuhan manis tipis' },
  { label: 'No Sugar (0%)', desc: 'Pahit murni biji kopi' },
];

const DEFAULT_ICE = [
  { label: 'Normal Ice', desc: 'Suhu dingin optimal' },
  { label: 'Less Ice', desc: 'Es sedikit' },
  { label: 'No Ice', desc: 'Dingin tanpa es batu' },
  { label: 'Hot Artisan', desc: 'Hangat seduhan barista' },
];

const DEFAULT_MILK = [
  { label: 'Fresh Milk', price: 0 },
  { label: 'Oat Milk Barista (+Rp 6.000)', price: 6000 },
  { label: 'Almond Milk (+Rp 8.000)', price: 8000 },
];

const DEFAULT_ADDONS = [
  { id: 'shot', label: 'Extra Espresso Shot', price: 6000 },
  { id: 'jelly', label: 'Coffee Jelly Topping', price: 5000 },
  { id: 'cream', label: 'Salted Cream Cloud', price: 7000 },
];

function CustomizerForm({ product, onClose }: { product: Product; onClose: () => void }) {
  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes] = useState('');
  const [sweetness, setSweetness] = useState('Normal (100%)');
  const [iceLevel, setIceLevel] = useState('Normal Ice');
  const [milk, setMilk] = useState('Fresh Milk');
  const [selectedAddons, setSelectedAddons] = useState<Record<string, number>>({});

  // Specific backend customizations if available
  const [selections, setSelections] = useState<Record<string, string>>(() =>
    Object.fromEntries(
      (product.customizations ?? []).flatMap((definition) =>
        definition.options[0] ? [[definition.name, definition.options[0].label]] : []
      )
    )
  );

  const milkPrice = DEFAULT_MILK.find((m) => m.label === milk)?.price ?? 0;
  const combinedAddons = { ...selectedAddons, ...(milkPrice > 0 ? { milk: milkPrice } : {}) };

  const unitPrice = customizationPrice(product, selections, combinedAddons);

  const handleToggleAddon = (id: string, price: number) => {
    setSelectedAddons((prev) => {
      const copy = { ...prev };
      if (copy[id]) {
        delete copy[id];
      } else {
        copy[id] = price;
      }
      return copy;
    });
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    const finalSelections: Record<string, string> = {
      ...selections,
      Manis: sweetness,
      Suhu: iceLevel,
      Susu: milk,
      ...(Object.keys(selectedAddons).length > 0
        ? {
            'Ekstra Tambahan': Object.keys(selectedAddons)
              .map((id) => DEFAULT_ADDONS.find((a) => a.id === id)?.label)
              .filter(Boolean)
              .join(', '),
          }
        : {}),
    };

    useCartStore
      .getState()
      .addItem(product, quantity, finalSelections, notes.trim() || undefined, unitPrice);

    soundEffects.playSuccessChime();
    onClose();
    useCartStore.getState().setCartOpen(true);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Product Hero Snapshot */}
      <div className="flex flex-col sm:flex-row items-start gap-4 pb-5 border-b border-border-subtle">
        <div className="relative h-28 w-28 sm:h-32 sm:w-32 shrink-0 overflow-hidden rounded-2xl bg-surface-secondary border border-border-subtle shadow-md">
          <Image
            src={product.image}
            alt={product.name}
            fill
            sizes="128px"
            className="object-cover"
          />
          <span className="absolute top-2 left-2 px-2 py-0.5 rounded font-mono text-[9px] font-bold uppercase bg-canvas-obsidian/80 text-accent-amber border border-border-subtle">
            Specialty
          </span>
        </div>
        <div className="flex-1">
          <Dialog.Title className="text-xl sm:text-2xl font-heading font-extrabold text-text-primary tracking-tight">
            {product.name}
          </Dialog.Title>
          <Dialog.Description className="mt-1 text-xs sm:text-sm text-text-muted leading-relaxed line-clamp-2">
            {product.description}
          </Dialog.Description>
          <div className="mt-3 flex items-center gap-3">
            <span className="font-mono text-base font-bold text-accent-amber">
              Rp {product.price.toLocaleString('id-ID')}
            </span>
            <span className="font-mono text-[11px] text-text-muted bg-surface-secondary px-2.5 py-1 rounded-md border border-border-subtle">
              Waktu Racik ~{product.preparationTime} menit
            </span>
          </div>
        </div>
      </div>

      {/* Sweetness Slider / Radio Group */}
      <fieldset className="space-y-2.5">
        <legend className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-text-muted">
          <Sparkles className="w-3.5 h-3.5 text-accent-amber" />
          <span>Tingkat Kemanisan (Sweetness)</span>
        </legend>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {DEFAULT_SWEETNESS.map((s) => (
            <button
              type="button"
              key={s.label}
              onClick={() => setSweetness(s.label)}
              className={`p-3 rounded-xl border text-left transition-all ${
                sweetness === s.label
                  ? 'border-accent-amber bg-accent-amber/10 shadow-sm'
                  : 'border-border-subtle bg-surface-secondary hover:border-border-subtle/80'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-text-primary">{s.label}</span>
                {sweetness === s.label && <Check className="w-3.5 h-3.5 text-accent-amber" />}
              </div>
              <span className="text-[10px] text-text-muted block mt-0.5">{s.desc}</span>
            </button>
          ))}
        </div>
      </fieldset>

      {/* Temperature & Ice Level */}
      <fieldset className="space-y-2.5">
        <legend className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-text-muted">
          <Coffee className="w-3.5 h-3.5 text-accent-amber" />
          <span>Suhu &amp; Tingkat Es (Ice Level)</span>
        </legend>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {DEFAULT_ICE.map((ice) => (
            <button
              type="button"
              key={ice.label}
              onClick={() => setIceLevel(ice.label)}
              className={`p-3 rounded-xl border text-left transition-all ${
                iceLevel === ice.label
                  ? 'border-accent-amber bg-accent-amber/10 shadow-sm'
                  : 'border-border-subtle bg-surface-secondary hover:border-border-subtle/80'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-text-primary">{ice.label}</span>
                {iceLevel === ice.label && <Check className="w-3.5 h-3.5 text-accent-amber" />}
              </div>
              <span className="text-[10px] text-text-muted block mt-0.5">{ice.desc}</span>
            </button>
          ))}
        </div>
      </fieldset>

      {/* Milk Options */}
      <fieldset className="space-y-2.5">
        <legend className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-text-muted">
          <span>Pilihan Susu (Dairy Option)</span>
        </legend>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          {DEFAULT_MILK.map((m) => (
            <button
              type="button"
              key={m.label}
              onClick={() => setMilk(m.label)}
              className={`p-3 rounded-xl border text-left transition-all ${
                milk === m.label
                  ? 'border-accent-amber bg-accent-amber/10 shadow-sm'
                  : 'border-border-subtle bg-surface-secondary hover:border-border-subtle/80'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-text-primary">{m.label}</span>
                {milk === m.label && <Check className="w-3.5 h-3.5 text-accent-amber" />}
              </div>
              <span className="text-[10px] text-text-muted block mt-0.5">
                {m.price ? `+Rp ${m.price.toLocaleString('id-ID')}` : 'Included'}
              </span>
            </button>
          ))}
        </div>
      </fieldset>

      {/* Extra Addons */}
      <fieldset className="space-y-2.5">
        <legend className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-text-muted">
          <span>Ekstra Topping &amp; Shot</span>
        </legend>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          {DEFAULT_ADDONS.map((addon) => {
            const isSelected = Boolean(selectedAddons[addon.id]);
            return (
              <button
                type="button"
                key={addon.id}
                onClick={() => handleToggleAddon(addon.id, addon.price)}
                className={`p-3 rounded-xl border text-left transition-all ${
                  isSelected
                    ? 'border-accent-amber bg-accent-amber/10 shadow-sm'
                    : 'border-border-subtle bg-surface-secondary hover:border-border-subtle/80'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-text-primary">{addon.label}</span>
                  {isSelected && <Check className="w-3.5 h-3.5 text-accent-amber" />}
                </div>
                <span className="text-[10px] text-accent-amber font-mono block mt-0.5">
                  +Rp {addon.price.toLocaleString('id-ID')}
                </span>
              </button>
            );
          })}
        </div>
      </fieldset>

      {/* Backend Customizations if defined */}
      {(product.customizations ?? []).map((definition) => (
        <fieldset key={definition.id} className="space-y-2.5">
          <legend className="text-xs font-mono font-bold uppercase tracking-wider text-text-muted">
            {definition.name}
          </legend>
          <div className="grid grid-cols-2 gap-2">
            {definition.options.map((option) => (
              <button
                type="button"
                key={option.label}
                onClick={() =>
                  setSelections((prev) => ({ ...prev, [definition.name]: option.label }))
                }
                className={`p-3 rounded-xl border text-left transition-all ${
                  selections[definition.name] === option.label
                    ? 'border-accent-amber bg-accent-amber/10 shadow-sm'
                    : 'border-border-subtle bg-surface-secondary hover:border-border-subtle/80'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-text-primary">{option.label}</span>
                  {selections[definition.name] === option.label && (
                    <Check className="w-3.5 h-3.5 text-accent-amber" />
                  )}
                </div>
                <span className="text-[10px] text-text-muted block mt-0.5">
                  {option.price ? `+Rp ${option.price.toLocaleString('id-ID')}` : 'Included'}
                </span>
              </button>
            ))}
          </div>
        </fieldset>
      ))}

      {/* Notes to Barista */}
      <div>
        <label htmlFor="customizer-notes" className="mb-1.5 block text-xs font-mono font-bold uppercase tracking-wider text-text-muted">
          Catatan Khusus Barista
        </label>
        <textarea
          id="customizer-notes"
          value={notes}
          onChange={(event) => setNotes(event.target.value)}
          maxLength={300}
          rows={2}
          placeholder="Contoh: Pisahkan es batu, ekstra sedotan bambu..."
          className="w-full rounded-xl border border-border-subtle bg-surface-secondary p-3 text-xs text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent-amber/40"
        />
      </div>

      {/* Footer Controls & Submit */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-t border-border-subtle pt-5">
        <div className="flex items-center gap-3 bg-surface-secondary p-1 rounded-xl border border-border-subtle">
          <Button
            type="button"
            variant="secondary"
            size="icon"
            aria-label="Kurangi jumlah"
            disabled={quantity <= 1}
            onClick={() => setQuantity(quantity - 1)}
            className="h-8 w-8 rounded-lg"
          >
            <Minus className="w-3.5 h-3.5" />
          </Button>
          <output aria-label="Jumlah produk" className="w-8 text-center font-mono text-sm font-bold text-text-primary">
            {quantity}
          </output>
          <Button
            type="button"
            variant="secondary"
            size="icon"
            aria-label="Tambah jumlah"
            disabled={quantity >= 100}
            onClick={() => setQuantity(quantity + 1)}
            className="h-8 w-8 rounded-lg"
          >
            <Plus className="w-3.5 h-3.5" />
          </Button>
        </div>

        <Button
          type="submit"
          className="flex-1 sm:flex-none px-7 py-3 rounded-xl bg-gradient-to-r from-brand-coffee via-secondary-container to-accent-amber text-canvas-obsidian font-heading font-bold text-sm shadow-lg hover:scale-102 transition-all cursor-pointer"
        >
          Tambah ke Pesanan • Rp {(unitPrice * quantity).toLocaleString('id-ID')}
        </Button>
      </div>
    </form>
  );
}

export function ProductCustomizerModal({
  product,
  isOpen,
  onClose,
}: {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
}) {
  return (
    <Dialog.Root
      open={isOpen && Boolean(product)}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[110] bg-black/80 backdrop-blur-md" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-[111] max-h-[92dvh] w-[calc(100%_-_2rem)] max-w-2xl -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-3xl border border-border-subtle bg-surface-card p-5 pt-12 text-text-primary shadow-2xl sm:p-7 sm:pt-14 scrollbar-none">
          <Dialog.Close
            className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-xl bg-surface-secondary text-text-muted hover:text-text-primary transition-colors border border-border-subtle"
            aria-label="Tutup kustomisasi"
          >
            <X className="h-4 w-4" />
          </Dialog.Close>
          {product && <CustomizerForm key={product.id} product={product} onClose={onClose} />}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
