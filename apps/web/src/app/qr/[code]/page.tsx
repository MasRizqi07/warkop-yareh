'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { Coffee, Loader2, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
// In a real app we'd use useOrderStore from Zustand to persist tableId
// import { useOrderStore } from '@/stores/order.store';

export default function QRScanPage() {
  const params = useParams();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function resolveQr() {
      try {
        const code = params.code as string;
        if (!code) return;

        // Resolve QR Code via Table Occupancy Engine
        const res = await api.get(`/tables/qr/${code}`);
        const table = res.data.data;

        // Save table metadata to localStorage/Zustand
        localStorage.setItem('coldnbrew_table_id', table.id);
        localStorage.setItem('coldnbrew_table_name', table.name);

        // Redirect to menu
        router.push('/');
      } catch (err: unknown) {
        const errorMsg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
        setError(errorMsg || 'Invalid QR Code or Table is Inactive');
      }
    }

    resolveQr();
  }, [params.code, router]);

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-4">
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl p-8 max-w-sm w-full text-center border border-slate-200 dark:border-slate-800">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Scan Failed</h1>
          <p className="text-slate-600 dark:text-slate-400 mb-6">{error}</p>
          <button 
            onClick={() => router.push('/')}
            className="w-full bg-brand-600 hover:bg-brand-700 text-white font-medium py-3 rounded-xl transition-colors"
          >
            Go to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl p-8 max-w-sm w-full text-center border border-slate-200 dark:border-slate-800"
      >
        <div className="w-20 h-20 bg-brand-100 dark:bg-brand-900/30 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <Coffee className="w-10 h-10 text-brand-600 dark:text-brand-400 animate-pulse" />
        </div>
        <h1 className="text-2xl font-bold font-display text-slate-900 dark:text-white mb-2">
          Identifying Table...
        </h1>
        <p className="text-slate-600 dark:text-slate-400 mb-8">
          Please wait while we connect you to our ordering system.
        </p>
        <Loader2 className="w-8 h-8 text-brand-600 dark:text-brand-400 animate-spin mx-auto" />
      </motion.div>
    </div>
  );
}
