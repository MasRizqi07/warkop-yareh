'use client';

import { FormEvent, useState } from 'react';
import {
  DataPanel,
  Notice,
  PageHeading,
  fieldClass,
  formatDateTime,
  formatRupiah,
  primaryButtonClass,
  secondaryButtonClass,
  useAsyncResource,
} from '@/components/management/page-kit';
import {
  addCashMovement,
  closeShift,
  getCurrentShift,
  getShifts,
  openShift,
} from '@/lib/management-api';
import { getOperationalBranchScope } from '@/lib/operations-api';

export default function ShiftsPage() {
  const scope = useAsyncResource(getOperationalBranchScope);
  const [selectedBranchId, setSelectedBranchId] = useState<string | null>(null);
  const branchId = selectedBranchId ?? scope.data?.user.branchId ?? scope.data?.branches[0]?.id ?? '';
  const shifts = useAsyncResource(async () => {
    if (!branchId) return { current: null, history: [] };
    const [current, history] = await Promise.all([getCurrentShift(branchId), getShifts(branchId)]);
    return { current, history: history.data };
  }, branchId);
  const [mode, setMode] = useState<'open' | 'movement' | 'close' | null>(null);
  const [amount, setAmount] = useState('');
  const [reason, setReason] = useState('');
  const [movementType, setMovementType] = useState<'CASH_IN' | 'CASH_OUT'>('CASH_IN');
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<{ tone: 'success' | 'error'; text: string } | null>(null);

  function start(nextMode: typeof mode) {
    setMode(nextMode);
    setAmount(nextMode === 'close' && shifts.data?.current ? String(shifts.data.current.summary.expectedCash) : '');
    setReason('');
    setNotice(null);
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const numeric = Number(amount);
    if (!Number.isSafeInteger(numeric) || numeric < (mode === 'movement' ? 1 : 0)) {
      setNotice({ tone: 'error', text: 'Jumlah kas tidak valid.' });
      return;
    }
    setBusy(true);
    setNotice(null);
    try {
      if (mode === 'open') await openShift(branchId, numeric);
      else if (mode === 'movement' && shifts.data?.current) await addCashMovement(shifts.data.current.id, { type: movementType, amount: numeric, reason });
      else if (mode === 'close' && shifts.data?.current) await closeShift(shifts.data.current.id, numeric, reason || undefined);
      else throw new Error('Shift aktif tidak tersedia.');
      setNotice({ tone: 'success', text: mode === 'open' ? 'Shift berhasil dibuka.' : mode === 'close' ? 'Shift berhasil ditutup.' : 'Pergerakan kas berhasil dicatat.' });
      setMode(null);
      await shifts.reload();
    } catch (error) {
      setNotice({ tone: 'error', text: error instanceof Error ? error.message : 'Operasi shift gagal.' });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-7xl space-y-7 p-5 sm:p-8">
      <PageHeading eyebrow="Cash controls" title="Shift & cash drawer" description="Saldo ekspektasi dihitung server dari opening float, pembayaran tunai, cash-in, dan cash-out. Selisih hanya ditetapkan saat shift ditutup." actions={<button type="button" className={secondaryButtonClass} onClick={() => void shifts.reload()}>Muat ulang</button>} />
      <label className="block max-w-sm text-sm font-semibold">Cabang<select disabled={!scope.data?.canViewAllBranches} className={`${fieldClass} mt-2`} value={branchId} onChange={(event) => setSelectedBranchId(event.target.value)}><option value="">Pilih cabang</option>{scope.data?.branches.map((branch) => <option key={branch.id} value={branch.id}>{branch.name}</option>)}</select></label>
      {notice ? <Notice tone={notice.tone}>{notice.text}</Notice> : null}
      <DataPanel loading={scope.loading || shifts.loading} error={scope.error || shifts.error} empty={!branchId} onRetry={() => { void scope.reload(); void shifts.reload(); }}>
        {branchId && shifts.data ? (
          <>
            <section className="rounded-2xl border border-border-subtle bg-surface-card p-5">
              <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between"><div><p className="text-xs font-bold uppercase tracking-wider text-accent">{shifts.data.current ? 'Shift aktif' : 'Drawer tertutup'}</p><h2 className="mt-2 text-2xl font-bold">{shifts.data.current ? `${shifts.data.current.openedBy.name} · ${formatDateTime(shifts.data.current.openedAt)}` : 'Tidak ada shift aktif'}</h2></div><div className="flex flex-wrap gap-2">{shifts.data.current ? <><button type="button" className={secondaryButtonClass} onClick={() => start('movement')}>Catat kas masuk/keluar</button><button type="button" className={primaryButtonClass} onClick={() => start('close')}>Tutup shift</button></> : <button type="button" className={primaryButtonClass} onClick={() => start('open')}>Buka shift</button>}</div></div>
              {shifts.data.current ? <dl className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{[{ label: 'Opening float', value: shifts.data.current.openingFloat }, { label: 'Penjualan tunai', value: shifts.data.current.summary.cashSales }, { label: 'Kas masuk / keluar', value: shifts.data.current.summary.cashIn - shifts.data.current.summary.cashOut }, { label: 'Kas ekspektasi', value: shifts.data.current.summary.expectedCash }].map((item) => <div key={item.label} className="rounded-xl border border-border-subtle p-4"><dt className="text-xs text-text-secondary">{item.label}</dt><dd className="mt-1 text-lg font-bold">{formatRupiah(item.value)}</dd></div>)}</dl> : null}
            </section>

            {mode ? <form onSubmit={submit} className="grid gap-4 rounded-2xl border border-accent/30 bg-surface-card p-5 sm:grid-cols-2"><h2 className="font-bold sm:col-span-2">{mode === 'open' ? 'Buka shift' : mode === 'close' ? 'Tutup shift' : 'Pergerakan kas'}</h2>{mode === 'movement' ? <label className="text-sm font-semibold">Tipe<select className={`${fieldClass} mt-2`} value={movementType} onChange={(event) => setMovementType(event.target.value as typeof movementType)}><option value="CASH_IN">Kas masuk</option><option value="CASH_OUT">Kas keluar</option></select></label> : null}<label className="text-sm font-semibold">{mode === 'open' ? 'Opening float' : mode === 'close' ? 'Kas fisik penutupan' : 'Jumlah'}<input required type="number" min={mode === 'movement' ? 1 : 0} step={1} className={`${fieldClass} mt-2`} value={amount} onChange={(event) => setAmount(event.target.value)} /></label>{mode !== 'open' ? <label className="text-sm font-semibold sm:col-span-2">{mode === 'close' ? 'Catatan (opsional)' : 'Alasan'}<textarea required={mode === 'movement'} minLength={mode === 'movement' ? 3 : undefined} maxLength={mode === 'close' ? 1000 : 300} rows={3} className={`${fieldClass} mt-2`} value={reason} onChange={(event) => setReason(event.target.value)} /></label> : null}<div className="flex gap-3 sm:col-span-2"><button disabled={busy} className={primaryButtonClass}>{busy ? 'Memproses…' : 'Konfirmasi'}</button><button type="button" className={secondaryButtonClass} onClick={() => setMode(null)}>Batal</button></div></form> : null}

            <section className="overflow-hidden rounded-2xl border border-border-subtle bg-surface-card"><div className="border-b border-border-subtle p-5"><h2 className="font-bold">Riwayat shift</h2></div>{shifts.data.history.length === 0 ? <p className="p-8 text-center text-sm text-text-secondary">Belum ada riwayat shift.</p> : <div className="overflow-x-auto"><table className="min-w-[760px] w-full text-left text-sm"><thead className="bg-surface-secondary text-xs uppercase tracking-wider text-text-secondary"><tr><th className="p-4">Dibuka</th><th className="p-4">Operator</th><th className="p-4">Status</th><th className="p-4">Ekspektasi</th><th className="p-4">Kas tutup</th><th className="p-4">Selisih</th></tr></thead><tbody className="divide-y divide-border-subtle">{shifts.data.history.map((shift) => <tr key={shift.id}><td className="p-4">{formatDateTime(shift.openedAt)}</td><td className="p-4">{shift.openedBy.name}</td><td className="p-4">{shift.status}</td><td className="p-4">{formatRupiah(shift.expectedCash ?? shift.summary.expectedCash)}</td><td className="p-4">{shift.closingCash === null ? '—' : formatRupiah(shift.closingCash)}</td><td className="p-4">{shift.variance === null ? '—' : formatRupiah(shift.variance)}</td></tr>)}</tbody></table></div>}</section>
          </>
        ) : null}
      </DataPanel>
    </div>
  );
}
