'use client';

import React, { useEffect, useState } from 'react';
import io from 'socket.io-client';
import { Users, Clock, Hash } from 'lucide-react';

const SOCKET_URL = process.env.NEXT_PUBLIC_API_URL?.replace('/api/v1', '') || 'http://localhost:3001';

type TableStatus = 'AVAILABLE' | 'OCCUPIED' | 'RESERVED' | 'CLEANING' | 'MAINTENANCE';

interface ActiveOrder {
  id: string;
  orderNumber: string;
  customerCount: number;
  createdAt: string;
}

interface Table {
  id: string;
  number: string;
  name: string;
  capacity: number;
  status: TableStatus;
  activeOrder?: ActiveOrder;
}

function useDuration(createdAt?: string) {
  const [duration, setDuration] = useState('00:00:00');

  useEffect(() => {
    if (!createdAt) return;
    
    const start = new Date(createdAt).getTime();
    const interval = setInterval(() => {
      const elapsed = Date.now() - start;
      const hours = Math.floor(elapsed / 3600000);
      const minutes = Math.floor((elapsed % 3600000) / 60000);
      const seconds = Math.floor((elapsed % 60000) / 1000);
      setDuration(`${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
    }, 1000);

    return () => clearInterval(interval);
  }, [createdAt]);

  return duration;
}

const TableCard = ({ table }: { table: Table }) => {
  const duration = useDuration(table.activeOrder?.createdAt);

  const statusColors = {
    AVAILABLE: 'bg-[var(--success-500)]/10 text-[var(--success-500)] border-[var(--success-500)]/20',
    OCCUPIED: 'bg-[var(--error-500)]/10 text-[var(--error-500)] border-[var(--error-500)]/20',
    RESERVED: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800',
    CLEANING: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800',
    MAINTENANCE: 'bg-slate-100 dark:bg-slate-900/30 text-slate-700 dark:text-slate-400 border-slate-200 dark:border-slate-800',
  };

  return (
    <div className={`p-5 rounded-2xl border flex flex-col gap-4 transition-all shadow-sm ${statusColors[table.status]}`}>
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-xl font-bold font-display">{table.name}</h3>
          <span className="inline-block mt-1 font-semibold text-sm px-2 py-0.5 rounded bg-white/50 dark:bg-black/20">
            {table.status}
          </span>
        </div>
        <div className="flex items-center gap-1.5 opacity-80">
          <Users className="w-4 h-4" />
          <span className="font-semibold text-sm">
            {table.activeOrder?.customerCount || 0} / {table.capacity}
          </span>
        </div>
      </div>

      {table.activeOrder ? (
        <div className="mt-auto space-y-2 pt-4 border-t border-current/10">
          <div className="flex items-center gap-2 text-sm font-medium">
            <Hash className="w-4 h-4 opacity-70" />
            <span>Order {table.activeOrder.orderNumber}</span>
          </div>
          <div className="flex items-center gap-2 text-sm font-medium">
            <Clock className="w-4 h-4 opacity-70" />
            <span className="font-mono">{duration}</span>
          </div>
        </div>
      ) : (
        <div className="mt-auto pt-4 border-t border-current/10 text-sm font-medium opacity-60">
          No active order
        </div>
      )}
    </div>
  );
};

export default function TablesDashboardPage() {
  const [tables, setTables] = useState<Table[]>([
    { id: '1', number: 'T01', name: 'Table 1', capacity: 4, status: 'AVAILABLE' },
    { id: '2', number: 'T02', name: 'Table 2', capacity: 2, status: 'OCCUPIED', activeOrder: { id: 'o1', orderNumber: '#CNB-001', customerCount: 2, createdAt: new Date(Date.now() - 5000000).toISOString() } },
    { id: '3', number: 'T03', name: 'Table 3', capacity: 6, status: 'CLEANING' },
    { id: '4', number: 'T04', name: 'Table 4', capacity: 4, status: 'RESERVED' },
  ]);

  useEffect(() => {
    // Connect to WebSocket to listen for Table status updates
    const socket = io(SOCKET_URL);
    
    socket.on('connect', () => {
      console.log('Connected to Table Dashboard WS');
      socket.emit('joinCashier'); // Admin rooms hear table updates
    });

    socket.on('table.updated', (updatedTable: any) => {
      setTables(prev => prev.map(t => t.id === updatedTable.id ? { ...t, ...updatedTable } : t));
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const metrics = {
    total: tables.length,
    occupied: tables.filter(t => t.status === 'OCCUPIED').length,
    available: tables.filter(t => t.status === 'AVAILABLE').length,
    cleaning: tables.filter(t => t.status === 'CLEANING').length,
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-8">
      <header className="mb-8 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold font-display text-slate-900 dark:text-white">Table Monitoring</h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">Real-time occupancy and turnover metrics</p>
        </div>
        <div className="flex gap-4">
          <div className="px-4 py-2 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm text-center">
            <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Occupancy Rate</p>
            <p className="text-xl font-bold text-slate-900 dark:text-white mt-0.5">
              {Math.round((metrics.occupied / metrics.total) * 100) || 0}%
            </p>
          </div>
          <div className="px-4 py-2 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm text-center">
            <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Available</p>
            <p className="text-xl font-bold text-[var(--success-500)] mt-0.5">{metrics.available}</p>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
        {tables.map(table => (
          <TableCard key={table.id} table={table} />
        ))}
      </div>
    </div>
  );
}
