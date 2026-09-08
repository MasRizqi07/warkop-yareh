'use client';

import { useState } from 'react';
import {
  DataPanel,
  Notice,
  PageHeading,
  formatDateTime,
  secondaryButtonClass,
  useAsyncResource,
} from '@/components/management/page-kit';
import {
  getReservations,
  updateReservationStatus,
  type ReservationRecord,
} from '@/lib/management-api';
import { getOperationalBranchScope } from '@/lib/operations-api';

async function loadReservations() {
  const scope = await getOperationalBranchScope();
  const branchId = scope.canViewAllBranches ? undefined : scope.user.branchId ?? undefined;
  const reservations = await getReservations({ branchId });
  return { scope, reservations: reservations.data };
}

const NEXT_STATES: Record<ReservationRecord['status'], ReservationRecord['status'][]> = {
  PENDING: ['CONFIRMED', 'CANCELLED'],
  CONFIRMED: ['COMPLETED', 'NO_SHOW', 'CANCELLED'],
  CANCELLED: [],
  COMPLETED: [],
  NO_SHOW: [],
};

export default function ReservationsPage() {
  const resource = useAsyncResource(loadReservations);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [notice, setNotice] = useState<{ tone: 'success' | 'error'; text: string } | null>(null);

  async function transition(reservation: ReservationRecord, status: ReservationRecord['status']) {
    setBusyId(reservation.id);
    setNotice(null);
    try {
      await updateReservationStatus(reservation.id, status);
      setNotice({ tone: 'success', text: `Reservasi ${reservation.id} diperbarui menjadi ${status}.` });
      await resource.reload();
    } catch (reason) {
      setNotice({ tone: 'error', text: reason instanceof Error ? reason.message : 'Status reservasi gagal diperbarui.' });
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="mx-auto max-w-7xl space-y-7 p-5 sm:p-8">
      <PageHeading
        eyebrow="Bookings"
        title="Reservasi meja"
        description="Konfirmasi, pembatalan, dan penyelesaian mengikuti state machine server serta pembatasan cabang akun aktif."
        actions={<button type="button" onClick={() => void resource.reload()} className={secondaryButtonClass}>Muat ulang</button>}
      />
      {notice ? <Notice tone={notice.tone}>{notice.text}</Notice> : null}
      <DataPanel loading={resource.loading} error={resource.error} empty={(resource.data?.reservations.length ?? 0) === 0} onRetry={() => void resource.reload()}>
        <div className="overflow-x-auto rounded-2xl border border-border-subtle bg-surface-card">
          <table className="min-w-[920px] w-full text-left text-sm">
            <thead className="border-b border-border-subtle bg-surface-secondary text-xs uppercase tracking-wider text-text-secondary"><tr><th className="p-4">Tamu</th><th className="p-4">Jadwal</th><th className="p-4">Meja</th><th className="p-4">Status</th><th className="p-4">Permintaan</th><th className="p-4">Aksi valid</th></tr></thead>
            <tbody className="divide-y divide-border-subtle">
              {resource.data?.reservations.map((reservation) => (
                <tr key={reservation.id}>
                  <td className="p-4"><p className="font-semibold">{reservation.user.name}</p><p className="text-xs text-text-secondary">{reservation.user.phone || reservation.user.email} · {reservation.guestCount} orang</p></td>
                  <td className="p-4"><p>{new Intl.DateTimeFormat('id-ID', { dateStyle: 'medium', timeZone: 'UTC' }).format(new Date(reservation.date))}</p><p className="text-xs text-text-secondary">{reservation.startTime}–{reservation.endTime}</p></td>
                  <td className="p-4">{reservation.table?.number ?? 'Belum ditentukan'}</td>
                  <td className="p-4"><span className="rounded-full border border-border-subtle px-2.5 py-1 text-xs font-bold">{reservation.status}</span></td>
                  <td className="max-w-xs p-4 text-text-secondary">{reservation.specialRequests || '—'}</td>
                  <td className="p-4"><div className="flex flex-wrap gap-2">{NEXT_STATES[reservation.status].map((status) => <button key={status} disabled={busyId === reservation.id} type="button" className={secondaryButtonClass} onClick={() => void transition(reservation, status)}>{status}</button>)}{NEXT_STATES[reservation.status].length === 0 ? <span className="text-xs text-text-secondary">Terminal · {formatDateTime(reservation.date)}</span> : null}</div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </DataPanel>
    </div>
  );
}
