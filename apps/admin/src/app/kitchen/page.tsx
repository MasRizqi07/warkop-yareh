'use client';

import React, { useEffect, useState } from 'react';
import io from 'socket.io-client';
import { Clock, Play, CheckCircle2, CheckSquare } from 'lucide-react';
import { canTransitionOrder } from '../../lib/order-logic';

const SOCKET_URL = process.env.NEXT_PUBLIC_API_URL?.replace('/api/v1', '') || 'http://localhost:3001';

type OrderStatus = 'PENDING' | 'PREPARING' | 'READY' | 'SERVED';

interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  customizations?: Record<string, string>;
}

interface Order {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  createdAt: string;
  items: OrderItem[];
}

// Kitchen Timer Hook
function useKitchenTimer(createdAt: string) {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const start = new Date(createdAt).getTime();
    const interval = setInterval(() => {
      setElapsed(Date.now() - start);
    }, 1000);
    return () => clearInterval(interval);
  }, [createdAt]);

  const minutes = Math.floor(elapsed / 60000);
  const seconds = Math.floor((elapsed % 60000) / 1000);
  
  let statusColor = 'text-slate-400 bg-slate-800/50 border-slate-700/50';
  if (minutes >= 5 && minutes < 10) {
    statusColor = 'text-amber-400 bg-amber-900/30 border-amber-900/50';
  } else if (minutes >= 10) {
    statusColor = 'text-[var(--error-500)] bg-[var(--error-500)]/10 border-[var(--error-500)]/20 animate-pulse';
  }

  return {
    timeString: `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`,
    statusColor,
  };
}

const OrderCard = ({ order, onUpdateStatus }: { order: Order, onUpdateStatus: (id: string, status: string) => void }) => {
  const { timeString, statusColor } = useKitchenTimer(order.createdAt);

  let nextAction = null;
  if (canTransitionOrder(order.status, 'PREPARING')) {
    nextAction = (
      <button 
        onClick={() => onUpdateStatus(order.id, 'PREPARING')}
        className="w-full flex items-center justify-center gap-2 bg-brand-600 hover:bg-brand-500 text-white font-medium py-2.5 rounded-lg transition-colors mt-4"
      >
        <Play className="w-4 h-4" /> Start Preparing
      </button>
    );
  } else if (canTransitionOrder(order.status, 'READY')) {
    nextAction = (
      <button 
        onClick={() => onUpdateStatus(order.id, 'READY')}
        className="w-full flex items-center justify-center gap-2 bg-amber-600 hover:bg-amber-500 text-white font-medium py-2.5 rounded-lg transition-colors mt-4"
      >
        <CheckSquare className="w-4 h-4" /> Mark Ready
      </button>
    );
  } else if (canTransitionOrder(order.status, 'SERVED')) {
    nextAction = (
      <button 
        onClick={() => onUpdateStatus(order.id, 'SERVED')}
        className="w-full flex items-center justify-center gap-2 bg-[var(--success-600)] hover:bg-[var(--success-500)] text-white font-medium py-2.5 rounded-lg transition-colors mt-4"
      >
        <CheckCircle2 className="w-4 h-4" /> Mark Served
      </button>
    );
  }

  return (
    <div className="bg-slate-800 rounded-xl p-4 border border-slate-700 shadow-sm flex flex-col gap-3">
      <div className="flex justify-between items-start mb-2">
        <div>
          <h3 className="font-bold text-white text-lg">{order.orderNumber}</h3>
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-mono font-bold mt-1 border ${statusColor}`}>
            <Clock className="w-3.5 h-3.5" />
            {timeString}
          </span>
        </div>
      </div>
      
      <div className="space-y-2 border-y border-slate-700/50 py-3 my-1">
        {order.items.map((item, idx) => (
          <div key={idx} className="flex justify-between items-start gap-3">
            <span className="font-bold text-slate-300 w-6">{item.quantity}x</span>
            <div className="flex-1">
              <p className="font-medium text-white">{item.name}</p>
              {item.customizations && (
                <p className="text-sm text-slate-400 mt-0.5">Note: {JSON.stringify(item.customizations)}</p>
              )}
            </div>
          </div>
        ))}
      </div>

      {nextAction}
    </div>
  );
};

export default function KitchenPage() {
  const [orders, setOrders] = useState<Order[]>([
    // Mock data for initial render if backend is empty
    { id: '1', orderNumber: '#CNB-1234', status: 'PENDING', createdAt: new Date(Date.now() - 1000 * 60 * 2).toISOString(), items: [{ id: 'i1', name: 'Cold Brew', quantity: 2 }, { id: 'i2', name: 'Croissant', quantity: 1 }] },
    { id: '2', orderNumber: '#CNB-1235', status: 'PREPARING', createdAt: new Date(Date.now() - 1000 * 60 * 6).toISOString(), items: [{ id: 'i3', name: 'Latte', quantity: 1 }] },
    { id: '3', orderNumber: '#CNB-1236', status: 'PREPARING', createdAt: new Date(Date.now() - 1000 * 60 * 12).toISOString(), items: [{ id: 'i4', name: 'Americano', quantity: 4 }] },
  ]);

  useEffect(() => {
    // 1. Fetch initial active orders from REST API
    // fetch('/api/v1/orders/kitchen/active').then(...)

    // 2. Connect to Socket.IO
    const socket = io(SOCKET_URL);
    
    socket.on('connect', () => {
      console.log('Connected to WebSocket');
      socket.emit('joinKitchen');
    });

    socket.on('order.created', (newOrder: Order) => {
      setOrders(prev => [...prev, newOrder]);
    });

    socket.on('order.updated', (updatedOrder: Order) => {
      setOrders(prev => {
        if (updatedOrder.status === 'SERVED') {
          return prev.filter(o => o.id !== updatedOrder.id);
        }
        return prev.map(o => o.id === updatedOrder.id ? updatedOrder : o);
      });
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const handleUpdateStatus = async (orderId: string, status: string) => {
    // Optimistic update
    setOrders(prev => {
      if (status === 'SERVED') return prev.filter(o => o.id !== orderId);
      return prev.map(o => o.id === orderId ? { ...o, status: status as OrderStatus } : o);
    });

    // Call API
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/orders/${orderId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
    } catch (e) {
      console.error('Failed to update status', e);
      // Revert in real app
    }
  };

  const pending = orders.filter(o => o.status === 'PENDING');
  const preparing = orders.filter(o => o.status === 'PREPARING');
  const ready = orders.filter(o => o.status === 'READY');

  return (
    <div className="flex flex-col h-screen w-full bg-slate-900 text-slate-100 overflow-hidden font-sans">
      <header className="px-6 py-4 bg-slate-950 flex justify-between items-center shadow-lg border-b border-slate-800">
        <h1 className="text-2xl font-bold font-display text-white tracking-wide">Kitchen Display System</h1>
        <div className="flex items-center gap-4">
          <div className="flex gap-2">
            <span className="flex items-center gap-2 px-3 py-1 bg-[var(--error-500)]/10 text-[var(--error-500)] rounded-full text-sm font-medium border border-[var(--error-500)]/20">
              <span className="w-2 h-2 rounded-full bg-[var(--error-500)] animate-pulse"></span>
              {pending.length} New
            </span>
          </div>
          <div className="text-right text-sm text-slate-400">
            <p>Station: Espresso Bar</p>
          </div>
        </div>
      </header>

      {/* Columns */}
      <div className="flex-1 overflow-x-auto overflow-y-hidden p-6">
        <div className="flex h-full gap-6 min-w-max">
          
          {/* Pending */}
          <div className="flex flex-col w-80 h-full bg-slate-800/50 rounded-2xl border border-slate-700/50">
            <div className="p-4 border-b border-slate-700/50 flex justify-between items-center bg-slate-800 rounded-t-2xl">
              <h2 className="font-bold text-lg text-white">Pending</h2>
              <span className="bg-slate-700 px-2.5 py-0.5 rounded-full text-sm font-medium">{pending.length}</span>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide">
              {pending.map(o => <OrderCard key={o.id} order={o} onUpdateStatus={handleUpdateStatus} />)}
              {pending.length === 0 && <div className="text-center text-slate-500 mt-10">No pending orders</div>}
            </div>
          </div>

          {/* Preparing */}
          <div className="flex flex-col w-80 h-full bg-slate-800/50 rounded-2xl border border-slate-700/50">
            <div className="p-4 border-b border-slate-700/50 flex justify-between items-center bg-amber-900/20 border-amber-900/30 rounded-t-2xl">
              <h2 className="font-bold text-lg text-amber-500">Preparing</h2>
              <span className="bg-amber-900/50 text-amber-400 px-2.5 py-0.5 rounded-full text-sm font-medium">{preparing.length}</span>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide">
              {preparing.map(o => <OrderCard key={o.id} order={o} onUpdateStatus={handleUpdateStatus} />)}
              {preparing.length === 0 && <div className="text-center text-slate-500 mt-10">All clear</div>}
            </div>
          </div>

          {/* Ready */}
          <div className="flex flex-col w-80 h-full bg-slate-800/50 rounded-2xl border border-slate-700/50">
            <div className="p-4 border-b border-slate-700/50 flex justify-between items-center bg-[var(--success-500)]/5 border-[var(--success-500)]/10 rounded-t-2xl">
              <h2 className="font-bold text-lg text-[var(--success-500)]">Ready for Pickup</h2>
              <span className="bg-[var(--success-500)]/10 text-[var(--success-500)] px-2.5 py-0.5 rounded-full text-sm font-medium">{ready.length}</span>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide">
              {ready.map(o => <OrderCard key={o.id} order={o} onUpdateStatus={handleUpdateStatus} />)}
              {ready.length === 0 && <div className="text-center text-slate-500 mt-10">No items waiting</div>}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
