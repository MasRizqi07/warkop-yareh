'use client';

import React, { useEffect, useState } from 'react';
import io from 'socket.io-client';
import { Bell } from 'lucide-react';
import { calculateCheckoutTotal } from '../../lib/order-logic';

const SOCKET_URL = process.env.NEXT_PUBLIC_API_URL?.replace('/api/v1', '') || 'http://localhost:3001';

interface WaiterCall {
  id: string;
  tableId: string;
  type: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  table: { number: string };
}

export default function POSPage() {
  const [waiterCalls, setWaiterCalls] = useState<WaiterCall[]>([]);

  useEffect(() => {
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
  };

  const mockCart = [
    { id: '1', name: 'Coffee', price: 25000, quantity: 2 },
    { id: '2', name: 'Pastry', price: 15000, quantity: 1 }
  ];

  const { subtotal, tax, total } = calculateCheckoutTotal(mockCart, 0.1);

  return (
    <div className="flex h-screen w-full bg-slate-50 dark:bg-slate-950 overflow-hidden relative">
      {/* Waiter Calls Notifications */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 flex flex-col gap-2">
        {waiterCalls.map(call => (
          <div 
            key={call.id} 
            className={`flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg border cursor-pointer hover:opacity-90 transition-opacity
              ${call.priority === 'HIGH' ? 'bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-900 text-red-900 dark:text-red-100' : 
                call.priority === 'MEDIUM' ? 'bg-amber-50 dark:bg-amber-950 border-amber-200 dark:border-amber-900 text-amber-900 dark:text-amber-100' :
                'bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-900 text-blue-900 dark:text-blue-100'
              }`}
            onClick={() => dismissCall(call.id)}
          >
            <Bell className="w-5 h-5 animate-bounce" />
            <div>
              <p className="font-bold">{call.table.number}</p>
              <p className="text-sm font-medium">{call.type.replace('_', ' ')}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Left pane: Categories & Products Grid */}
      <div className="flex-1 flex flex-col p-4">
        <header className="mb-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold font-display text-slate-900 dark:text-white">Point of Sale</h1>
          <div className="flex gap-2">
            <span className="text-sm px-3 py-1 bg-brand-100 text-brand-700 rounded-full dark:bg-brand-900/30 dark:text-brand-300">
              Cashier: Active
            </span>
          </div>
        </header>
        
        {/* Categories */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-4 scrollbar-hide">
          {['Coffee', 'Non-Coffee', 'Food', 'Pastry', 'Merch'].map((cat) => (
            <button key={cat} className="px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg whitespace-nowrap font-medium hover:border-brand-500 transition-colors">
              {cat}
            </button>
          ))}
        </div>

        {/* Product Grid */}
        <div className="flex-1 overflow-y-auto pr-2 grid grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 cursor-pointer hover:shadow-md hover:border-brand-500 transition-all active:scale-95 flex flex-col">
              <div className="aspect-square bg-slate-100 dark:bg-slate-800 rounded-lg mb-3 flex items-center justify-center text-4xl">
                ☕
              </div>
              <p className="font-semibold text-slate-900 dark:text-white text-sm line-clamp-2 leading-tight">Product {i + 1}</p>
              <p className="text-brand-600 dark:text-brand-400 font-medium mt-auto pt-2">Rp 25.000</p>
            </div>
          ))}
        </div>
      </div>

      {/* Right pane: Current Order / Cart */}
      <div className="w-96 bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 flex flex-col shadow-xl z-10">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">Current Order</h2>
          <p className="text-sm text-slate-500">Order #12345</p>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {mockCart.map(item => (
            <div key={item.id} className="flex justify-between items-center text-sm">
              <div>
                <p className="font-semibold text-slate-900 dark:text-white">{item.name}</p>
                <p className="text-slate-500">{item.quantity} x Rp {item.price.toLocaleString()}</p>
              </div>
              <p className="font-medium text-slate-900 dark:text-white">Rp {(item.quantity * item.price).toLocaleString()}</p>
            </div>
          ))}
        </div>

        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
          <div className="flex justify-between mb-2 text-slate-600 dark:text-slate-400">
            <span>Subtotal</span>
            <span>Rp {subtotal.toLocaleString()}</span>
          </div>
          <div className="flex justify-between mb-4 text-slate-600 dark:text-slate-400">
            <span>Tax (10%)</span>
            <span>Rp {tax.toLocaleString()}</span>
          </div>
          <div className="flex justify-between mb-6 text-xl font-bold text-slate-900 dark:text-white">
            <span>Total</span>
            <span>Rp {total.toLocaleString()}</span>
          </div>
          
          <button className="w-full bg-brand-600 hover:bg-brand-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-brand-500/20 transition-transform active:scale-[0.98]">
            Charge Rp {total.toLocaleString()}
          </button>
        </div>
      </div>
    </div>
  );
}
