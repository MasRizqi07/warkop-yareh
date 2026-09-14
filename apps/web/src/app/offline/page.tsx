'use client';

import { WifiOff, RefreshCw } from 'lucide-react';
import { Button } from '@warkop-yareh/ui';

export default function OfflinePage() {
  const handleRetry = () => {
    if (typeof window !== 'undefined') {
      window.location.reload();
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-canvas-obsidian text-on-surface">
      <div className="text-center max-w-md p-8 bg-surface-elevated/40 backdrop-blur-md rounded-2xl border border-outline-variant/30 shadow-2xl">
        <div className="h-16 w-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto mb-6">
          <WifiOff className="h-8 w-8 text-primary" />
        </div>
        <h1 className="text-2xl font-bold font-heading mb-3 text-on-surface">
          Koneksi Terputus
        </h1>
        <p className="text-sm text-on-surface-variant mb-8 leading-relaxed">
          Anda sedang berada dalam mode offline. Silakan periksa jaringan internet atau Wi-Fi Anda untuk kembali mengakses Warkop Ya&apos;reh.
        </p>
        <Button
          onClick={handleRetry}
          variant="default"
          className="w-full flex items-center justify-center gap-2 h-12 rounded-xl"
        >
          <RefreshCw className="h-4 w-4" />
          Muat Ulang Halaman
        </Button>
      </div>
    </div>
  );
}
