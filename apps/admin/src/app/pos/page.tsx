'use client';

import React, { useEffect, useState } from 'react';
import io from 'socket.io-client';
import { Bell, Plus, Minus, ShoppingCart, Check } from 'lucide-react';
import { Button, useToast, Dialog } from '@warkop-yareh/ui';
import { cn } from '@warkop-yareh/ui';

const API_URL = process.env.NEXT_PUBLIC_API_URL;
const SOCKET_URL = API_URL?.replace(/\/api\/v1\/?$/, '');

interface WaiterCall {
  id: string;
  tableId: string;
  type: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  table: { number: string };
}

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

const POS_PRODUCTS = [
  { id: 'p1', name: "Kopi Susu Aren Signature", price: 28000, category: "Coffee", icon: "☕" },
  { id: 'p2', name: "V60 Single Origin Toraja", price: 38000, category: "Coffee", icon: "☕" },
  { id: 'p3', name: "Premium Matcha Latte", price: 35000, category: "Non-Coffee", icon: "🍵" },
  { id: 'p4', name: "Tahu Walik Crispy", price: 18000, category: "Snacks", icon: "🥟" },
  { id: 'p5', name: "Nasi Goreng Ya'reh", price: 38000, category: "Food", icon: "🍛" },
  { id: 'p6', name: "Iced Caramel Macchiato", price: 32000, category: "Coffee", icon: "☕" },
  { id: 'p7', name: "Cireng Salju Rujak", price: 16000, category: "Snacks", icon: "🥟" },
  { id: 'p8', name: "Es Teh Manis Jumbo", price: 8000, category: "Non-Coffee", icon: "🥤" },
];

export default function POSPage() {
  const [waiterCalls, setWaiterCalls] = useState<WaiterCall[]>([]);
  const [activeCategory, setActiveCategory] = useState("All");
  const [cart, setCart] = useState<CartItem[]>([
    { id: 'p1', name: "Kopi Susu Aren Signature", price: 28000, quantity: 2 },
    { id: 'p4', name: "Tahu Walik Crispy", price: 18000, quantity: 1 }
  ]);
  const [isCharging, setIsCharging] = useState(false);
  const [splitCount, setSplitCount] = useState(1);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [lastOrderDetails, setLastOrderDetails] = useState<{ total: number; orderNumber: string } | null>(null);
  
  const { success, error: toastError } = useToast();

  useEffect(() => {
    if (!SOCKET_URL) return;

    const socket = io(SOCKET_URL);
    
    socket.on('connect', () => {
      console.log('POS connected to WebSocket');
      socket.emit('joinCashier');
    });

    socket.on('waiter.called', (call: WaiterCall) => {
      setWaiterCalls(prev => [call, ...prev]);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const dismissCall = (id: string) => {
    setWaiterCalls(prev => prev.filter(c => c.id !== id));
    success("Panggilan pelayan selesai ditanggapi", "Panggilan Selesai");
  };

  const handleAddToCart = (product: typeof POS_PRODUCTS[0]) => {
    setCart(prev => {
      const idx = prev.findIndex(item => item.id === product.id);
      if (idx > -1) {
        const next = [...prev];
        next[idx] = { ...next[idx], quantity: next[idx].quantity + 1 };
        return next;
      }
      return [...prev, { id: product.id, name: product.name, price: product.price, quantity: 1 }];
    });
  };

  const handleUpdateQty = (id: string, diff: number) => {
    setCart(prev => {
      return prev.map(item => {
        if (item.id === id) {
          const nextQty = item.quantity + diff;
          if (nextQty <= 0) return null;
          return { ...item, quantity: nextQty };
        }
        return item;
      }).filter(Boolean) as CartItem[];
    });
  };

  const subtotal = cart.reduce((acc, curr) => acc + (curr.price * curr.quantity), 0);
  const tax = Math.round(subtotal * 0.1);
  const total = subtotal + tax;

  const handleCharge = () => {
    if (cart.length === 0) {
      toastError("Keranjang belanja masih kosong!", "Gagal");
      return;
    }
    setIsCharging(true);
    const finalTotal = total;
    const finalOrderNum = `CNB-${Math.floor(1000 + Math.random() * 9000)}`;
    setTimeout(() => {
      setLastOrderDetails({ total: finalTotal, orderNumber: finalOrderNum });
      setCart([]);
      setIsCharging(false);
      setShowConfirmation(true);
      setSplitCount(1);
      success("Pembayaran berhasil diproses!", "Pembayaran Sukses");
    }, 1500);
  };

  const filteredProducts = activeCategory === "All"
    ? POS_PRODUCTS
    : POS_PRODUCTS.filter(p => p.category === activeCategory);

  return (
    <div className="flex h-screen w-full bg-[var(--bg-canvas)] text-[var(--text-primary)] overflow-hidden relative font-body-md">
      
      {/* Waiter Calls Notifications Alert List */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 flex flex-col gap-2 max-w-sm w-full px-4">
        {waiterCalls.map(call => (
          <div 
            key={call.id} 
            className={cn(
              "flex items-center justify-between gap-3 px-4 py-3.5 rounded-xl shadow-xl border cursor-pointer hover:scale-[1.02] transition-all",
              call.priority === 'HIGH' 
                ? 'bg-[var(--danger-container)] border-[var(--danger-fill)]/30 text-[var(--danger-fill)]' 
                : call.priority === 'MEDIUM' 
                ? 'bg-[var(--gold-container)] border-[var(--gold-highlight)]/30 text-[var(--gold-highlight)]'
                : 'bg-[var(--accent-container)] border-[var(--accent-fill)]/30 text-[var(--accent-container-text)]'
            )}
            onClick={() => dismissCall(call.id)}
          >
            <div className="flex items-center gap-3">
              <Bell className="w-5 h-5 animate-bounce shrink-0" />
              <div>
                <p className="font-bold text-sm">Meja {call.table.number}</p>
                <p className="text-xs font-semibold uppercase tracking-wider opacity-90">{call.type.replace('_', ' ')}</p>
              </div>
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider opacity-70">Tutup</span>
          </div>
        ))}
      </div>

      {/* Left pane: Categories & Products Grid */}
      <div className="flex-1 flex flex-col p-6 bg-noise overflow-hidden">
        <header className="mb-6 flex justify-between items-center shrink-0">
          <div>
            <h1 className="text-2xl font-bold font-heading">Point of Sale</h1>
            <p className="text-xs text-[var(--text-secondary)] mt-0.5">Terminal Kasir Cabang Darmo Flagship</p>
          </div>
          <span className="text-xs font-bold px-3 py-1.5 bg-[var(--accent-container)] text-[var(--accent-container-text)] rounded-full border border-[var(--accent-fill)]/10">
            Kasir: Active
          </span>
        </header>
        
        {/* Categories Tab Bar with 56x56px min size constraint */}
        <div className="flex gap-2 overflow-x-auto pb-3 mb-6 shrink-0 no-scrollbar">
          {['All', 'Coffee', 'Non-Coffee', 'Food', 'Snacks'].map((cat) => (
            <button 
              key={cat} 
              onClick={() => setActiveCategory(cat)}
              className={cn(
                "px-6 py-2.5 rounded-xl whitespace-nowrap text-xs font-bold transition-all cursor-pointer border min-h-[56px] min-w-[56px]",
                activeCategory === cat
                  ? "bg-[var(--accent-fill)] text-[var(--text-on-brand)] border-transparent"
                  : "bg-[var(--bg-surface-raised)] text-[var(--text-secondary)] border-[var(--border-default)] hover:bg-[var(--bg-surface-overlay)]"
              )}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Product Grid */}
        <div className="flex-1 overflow-y-auto pr-2 grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4 no-scrollbar">
          {filteredProducts.map((p) => (
            <div 
              key={p.id} 
              onClick={() => handleAddToCart(p)}
              className="bg-[var(--bg-surface-raised)] border border-[var(--border-default)] rounded-2xl p-4 cursor-pointer hover:border-[var(--accent-fill)]/50 transition-all active:scale-95 flex flex-col hover:shadow-md select-none group min-h-[160px]"
            >
              <div className="aspect-square bg-[var(--bg-surface-overlay)] rounded-xl mb-3 flex items-center justify-center text-3xl group-hover:scale-105 transition-transform shrink-0 w-12 h-12">
                {p.icon}
              </div>
              <p className="font-bold text-xs text-[var(--text-primary)] leading-snug line-clamp-2">{p.name}</p>
              <p className="text-[var(--accent-fill)] font-bold text-sm mt-auto pt-2 font-mono">Rp {p.price.toLocaleString("id-ID")}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Right pane: Current Order / Cart */}
      <div className="w-[380px] bg-[var(--bg-surface-raised)] border-l border-[var(--border-default)] flex flex-col shadow-xl shrink-0 z-10">
        <div className="p-5 border-b border-[var(--border-default)]/40 flex items-center justify-between shrink-0">
          <div>
            <h2 className="text-base font-bold text-[var(--text-primary)]">Daftar Pesanan</h2>
            <p className="text-[10px] text-[var(--text-secondary)] font-semibold mt-0.5">ORDER #{"\u200B"}12345</p>
          </div>
          <div className="w-9 h-9 rounded-xl bg-[var(--bg-surface-overlay)] border border-[var(--border-default)] flex items-center justify-center text-[var(--accent-fill)]">
            <ShoppingCart size={18} />
          </div>
        </div>
        
        {/* Cart Item Feed */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4 no-scrollbar">
          {cart.map(item => (
            <div key={item.id} className="flex justify-between items-center text-xs border-b border-[var(--border-default)]/20 pb-3 last:border-0 last:pb-0">
              <div className="flex-grow pr-3">
                <p className="font-bold text-[var(--text-primary)] leading-tight">{item.name}</p>
                <p className="text-[var(--text-secondary)]/80 mt-1 font-mono">Rp {item.price.toLocaleString("id-ID")}</p>
              </div>
              <div className="flex items-center gap-2 bg-[var(--bg-surface-overlay)] p-1.5 rounded-xl border border-[var(--border-default)] shrink-0">
                <button 
                  onClick={() => handleUpdateQty(item.id, -1)}
                  className="w-14 h-14 rounded-lg flex items-center justify-center font-bold hover:bg-[var(--border-default)]/20 min-h-[56px] min-w-[56px] cursor-pointer"
                  aria-label={`Kurangi ${item.name}`}
                >
                  <Minus className="w-5 h-5" />
                </button>
                <span className="font-bold font-mono w-6 text-center text-sm">{item.quantity}</span>
                <button 
                  onClick={() => handleUpdateQty(item.id, 1)}
                  className="w-14 h-14 rounded-lg flex items-center justify-center font-bold hover:bg-[var(--border-default)]/20 min-h-[56px] min-w-[56px] cursor-pointer"
                  aria-label={`Tambah ${item.name}`}
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))}
          {cart.length === 0 && (
            <div className="text-center text-xs text-[var(--text-secondary)]/60 py-20 flex flex-col items-center justify-center gap-3">
              <ShoppingCart size={32} className="opacity-40" />
              <span>Keranjang kasir kosong</span>
            </div>
          )}
        </div>

        {/* Totals & Charge Panel */}
        <div className="p-5 border-t border-[var(--border-default)] bg-[var(--bg-surface-overlay)] shrink-0">
          <div className="flex justify-between mb-2 text-xs font-semibold text-[var(--text-secondary)]">
            <span>Subtotal</span>
            <span className="font-mono">Rp {subtotal.toLocaleString("id-ID")}</span>
          </div>
          <div className="flex justify-between mb-2 text-xs font-semibold text-[var(--text-secondary)]">
            <span>Pajak PB1 (10%)</span>
            <span className="font-mono">Rp {tax.toLocaleString("id-ID")}</span>
          </div>

          {/* Live Splitting order subtotal triggers & highlights */}
          {splitCount > 1 && (
            <div className="flex justify-between mb-4 text-xs font-bold text-[var(--gold-highlight)] bg-[var(--gold-container)]/10 p-2.5 rounded-lg border border-[var(--gold-highlight)]/15 animate-in slide-in-from-top-2">
              <span>Split Bill ({splitCount} Orang)</span>
              <span className="font-mono text-[var(--gold-highlight)]">Rp {Math.round(total / splitCount).toLocaleString("id-ID")} / org</span>
            </div>
          )}

          <div className="flex justify-between items-center mb-6 pt-3 border-t border-[var(--border-default)]/30">
            <div>
              <span className="font-bold text-sm block">Grand Total</span>
              <span className="text-[10px] text-[var(--text-secondary)] font-medium">Split Bill:</span>
            </div>
            <div className="text-right">
              <span className="font-mono text-lg font-bold text-[var(--accent-fill)] block">Rp {total.toLocaleString("id-ID")}</span>
              <div className="flex gap-2 mt-2 justify-end">
                {[1, 2, 3, 4].map(n => (
                  <button
                    key={n}
                    onClick={() => setSplitCount(n)}
                    className={cn(
                      "w-14 h-14 rounded-xl text-xs font-bold border transition-all cursor-pointer min-h-[56px] min-w-[56px] flex items-center justify-center",
                      splitCount === n
                        ? "bg-[var(--accent-fill)] text-[var(--text-on-brand)] border-transparent"
                        : "bg-[var(--bg-surface-overlay)] text-[var(--text-secondary)] border-[var(--border-default)] hover:bg-[var(--bg-surface-raised)]"
                    )}
                  >
                    {n}x
                  </button>
                ))}
              </div>
            </div>
          </div>
          
          <Button 
            disabled={cart.length === 0 || isCharging}
            onClick={handleCharge}
            variant="default"
            className="w-full font-bold min-h-[56px] h-14 rounded-xl shadow-lg text-base cursor-pointer flex items-center justify-center gap-2"
          >
            {isCharging ? (
              <span>Memproses...</span>
            ) : (
              <>
                <span>Charge Rp {total.toLocaleString("id-ID")}</span>
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Confirmation Dialog Overlay */}
      <Dialog isOpen={showConfirmation} onClose={() => setShowConfirmation(false)} title="">
        <div className="flex flex-col items-center justify-center py-6 text-center gap-4 text-[var(--text-primary)]">
          <div className="w-16 h-16 rounded-full bg-[var(--green-500)]/15 border border-[var(--green-500)] text-[var(--green-500)] flex items-center justify-center animate-bounce mb-2">
            <Check className="w-8 h-8" />
          </div>
          <div>
            <h3 className="font-heading font-bold text-lg">Transaksi Sukses!</h3>
            <p className="text-xs text-[var(--text-secondary)] mt-1.5 max-w-[280px] leading-relaxed">
              Order <span className="font-bold text-[var(--text-primary)]">{lastOrderDetails?.orderNumber}</span> berhasil dicatat dan dikirim ke stasiun kitchen.
            </p>
          </div>
          <div className="bg-[var(--bg-surface-overlay)] border border-[var(--border-default)] rounded-xl p-4 w-full flex justify-between items-center mt-2">
            <span className="text-xs font-semibold text-[var(--text-secondary)]">Total Dibayar</span>
            <span className="font-mono font-bold text-base text-[var(--accent-fill)]">
              Rp {lastOrderDetails?.total.toLocaleString("id-ID")}
            </span>
          </div>
          <Button onClick={() => setShowConfirmation(false)} variant="default" className="w-full mt-4 rounded-xl py-3.5 font-bold text-base min-h-[48px] h-12">
            Selesai
          </Button>
        </div>
      </Dialog>
    </div>
  );
}

