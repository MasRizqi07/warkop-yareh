'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Award, Coffee, Download, Gift, Lock, Sparkles } from 'lucide-react';
import { Button } from '@warkop-yareh/ui';
import { DataState, LoadingState } from '@/components/data-state';
import {
  getLoyaltyStatus,
  getLoyaltyTransactions,
  getRewards,
  redeemReward,
  type LoyaltyTier,
} from './loyalty.api';
import { getApiErrorMessage } from '@/lib/api-error';
import { csvCell, downloadText } from '@/lib/download';
import { useAuthStore } from '@/stores/auth.store';

const TIERS: LoyaltyTier[] = ['BRONZE', 'SILVER', 'GOLD', 'PLATINUM'];
const THRESHOLDS = [0, 200, 500, 1000];

export default function LoyaltyPage() {
  const user = useAuthStore((s) => s.user);
  const initialized = useAuthStore((s) => s.isInitialized);
  const authenticated = useAuthStore((s) => s.isAuthenticated);
  const enabled = initialized && authenticated;
  const client = useQueryClient();
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState('ALL');
  const [notice, setNotice] = useState('');
  const status = useQuery({
    queryKey: ['loyalty', user?.id, 'status'],
    queryFn: getLoyaltyStatus,
    enabled,
  });
  const rewards = useQuery({
    queryKey: ['loyalty', user?.id, 'rewards'],
    queryFn: getRewards,
    enabled,
  });
  const ledger = useQuery({
    queryKey: ['loyalty', user?.id, 'ledger', page],
    queryFn: () => getLoyaltyTransactions(page),
    enabled,
  });
  const redemption = useMutation({
    mutationFn: redeemReward,
    onSuccess: async (result) => {
      setNotice(
        `${result.reward.name} berhasil ditukar. Referensi: ${result.transaction.id}`
      );
      await client.invalidateQueries({ queryKey: ['loyalty', user?.id] });
    },
  });
  const data = status.data;
  const tierIndex = data ? TIERS.indexOf(data.membershipTier) : 0;
  const nextThreshold = THRESHOLDS[Math.min(3, tierIndex + 1)];
  const progress = data
    ? Math.min(100, (data.loyaltyPoints / nextThreshold) * 100)
    : 0;
  const transactions =
    ledger.data?.data.filter(
      (item) =>
        filter === 'ALL' ||
        (filter === 'EARNED' ? item.points > 0 : item.points < 0)
    ) ?? [];

  return (
    <main className="mx-auto min-h-screen max-w-7xl space-y-8 px-4 pb-32 pt-10 text-text-primary sm:px-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <Link href="/account" className="text-sm text-text-muted">
            Sanctuary Member Portal
          </Link>
          <h1 className="mt-3 font-headline-xl text-3xl font-bold sm:text-4xl">
            Kawan Ya&apos;reh
          </h1>
          <p className="mt-2 text-text-muted">
            Setiap kunjungan, setiap cangkir, satu perjalanan.
          </p>
        </div>
        <Gift className="h-10 w-10 text-accent-amber" aria-hidden="true" />
      </header>
      {!initialized ? (
        <LoadingState label="Memulihkan sesi..." />
      ) : !authenticated ? (
        <DataState
          title="Masuk untuk melihat poin dan hadiah"
          loginPath="/loyalty"
        />
      ) : status.isPending ? (
        <LoadingState />
      ) : status.isError ? (
        <DataState
          title="Saldo belum dapat dimuat"
          detail={getApiErrorMessage(status.error)}
          retry={() => void status.refetch()}
        />
      ) : (
        data && (
          <>
            <section className="grid gap-6 lg:grid-cols-2">
              <div className="relative overflow-hidden rounded-3xl border border-accent-amber/40 bg-gradient-to-br from-brand-coffee via-surface-card to-canvas-obsidian p-7 shadow-xl sm:p-10">
                <div className="flex items-center justify-between gap-4">
                  <Award className="h-9 w-9 text-accent-amber" />
                  <span className="rounded-full border border-accent-amber/30 px-3 py-1 text-xs tracking-widest">
                    {data.membershipTier}
                  </span>
                </div>
                <p className="mt-12 text-sm text-text-muted">
                  SANCTUARY MEMBER PASS
                </p>
                <h2 className="mt-2 break-words text-2xl font-semibold">
                  {data.name}
                </h2>
                <p className="mt-5 font-mono text-4xl text-accent-amber">
                  {data.loyaltyPoints.toLocaleString('id-ID')}{' '}
                  <span className="text-sm">PTS</span>
                </p>
                <p className="mt-6 break-all font-mono text-xs text-text-muted">
                  Member ID: {data.id}
                </p>
              </div>
              <div className="rounded-3xl border border-border-subtle bg-surface-card p-7 sm:p-10">
                <h2 className="flex items-center gap-2 text-xl font-semibold">
                  <Sparkles className="text-accent-amber" /> Artisan Journey
                </h2>
                <p className="mt-4 text-sm text-text-muted">
                  {tierIndex === 3
                    ? 'Anda telah mencapai Platinum.'
                    : `${Math.max(0, nextThreshold - data.loyaltyPoints)} poin menuju ${TIERS[tierIndex + 1]}.`}
                </p>
                <div
                  role="progressbar"
                  aria-label="Progres membership"
                  aria-valuenow={Math.round(progress)}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  className="my-6 h-2 overflow-hidden rounded-full bg-surface-container"
                >
                  <div
                    className="h-full bg-accent-amber"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <ol className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {TIERS.map((tier, index) => (
                    <li
                      key={tier}
                      className={`rounded-xl border p-3 text-xs ${index <= tierIndex ? 'border-accent-amber/30 text-accent-amber' : 'border-border-subtle text-text-muted'}`}
                    >
                      <Award className="mb-2 h-5 w-5" />
                      {tier}
                      <span className="mt-1 block">
                        {THRESHOLDS[index]} PTS
                      </span>
                    </li>
                  ))}
                </ol>
                <p className="mt-6 text-xs text-text-muted">
                  Poin dan tier diperbarui dari transaksi akun. Tier yang sudah
                  diraih tetap dipertahankan setelah penukaran.
                </p>
              </div>
            </section>
            {notice && <DataState title={notice} />}
            {redemption.isError && (
              <DataState
                title="Hadiah belum ditukar"
                detail={getApiErrorMessage(redemption.error)}
              />
            )}
            <section className="space-y-5">
              <div className="flex items-center gap-3">
                <Coffee className="text-accent-amber" />
                <h2 className="text-2xl font-semibold">
                  Artisan Rewards Marketplace
                </h2>
              </div>
              {rewards.isPending ? (
                <LoadingState />
              ) : rewards.isError ? (
                <DataState
                  title="Hadiah belum dapat dimuat"
                  detail={getApiErrorMessage(rewards.error)}
                  retry={() => void rewards.refetch()}
                />
              ) : !rewards.data?.length ? (
                <DataState
                  title="Belum ada hadiah aktif"
                  detail="Hadiah yang tersedia akan muncul di sini."
                />
              ) : (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {rewards.data.map((reward) => {
                    const locked =
                      TIERS.indexOf(reward.tier) > tierIndex ||
                      reward.pointsCost > data.loyaltyPoints;
                    return (
                      <article
                        key={reward.id}
                        className="delight-card flex flex-col rounded-2xl border border-border-subtle bg-surface-card p-6"
                      >
                        <Gift className="mb-5 h-8 w-8 text-accent-amber" />
                        <h3 className="text-lg font-semibold">{reward.name}</h3>
                        <p className="mt-2 flex-1 text-sm text-text-muted">
                          {reward.description}
                        </p>
                        <div className="my-5 flex flex-wrap justify-between gap-2 text-sm">
                          <strong className="text-accent-amber">
                            {reward.pointsCost} PTS
                          </strong>
                          <span>{reward.tier}</span>
                        </div>
                        <Button
                          disabled={locked || redemption.isPending}
                          onClick={() => redemption.mutate(reward.id)}
                        >
                          {locked && <Lock className="h-4 w-4" />}
                          {redemption.isPending
                            ? 'Memproses...'
                            : locked
                              ? 'Poin atau tier belum cukup'
                              : 'Tukar hadiah'}
                        </Button>
                      </article>
                    );
                  })}
                </div>
              )}
            </section>
            <section className="space-y-4 rounded-2xl border border-border-subtle bg-surface-card p-5 sm:p-7">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <h2 className="text-xl font-semibold">
                  Points &amp; Perks Ledger
                </h2>
                <Button
                  variant="secondary"
                  disabled={!transactions.length}
                  onClick={() =>
                    downloadText(
                      `loyalty-page-${page}.csv`,
                      [
                        ['Tanggal', 'Jenis', 'Poin', 'Deskripsi', 'Referensi'],
                        ...transactions.map((row) => [
                          row.createdAt,
                          row.type,
                          row.points,
                          row.description,
                          row.id,
                        ]),
                      ]
                        .map((row) => row.map(csvCell).join(','))
                        .join('\r\n'),
                      'text/csv;charset=utf-8'
                    )
                  }
                >
                  <Download className="h-4 w-4" />
                  Unduh halaman CSV
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {[
                  ['ALL', 'Semua'],
                  ['EARNED', 'Poin masuk'],
                  ['REDEEMED', 'Poin keluar'],
                ].map(([value, label]) => (
                  <Button
                    key={value}
                    variant={filter === value ? 'default' : 'secondary'}
                    aria-pressed={filter === value}
                    onClick={() => setFilter(value)}
                  >
                    {label}
                  </Button>
                ))}
              </div>
              {ledger.isPending ? (
                <LoadingState />
              ) : ledger.isError ? (
                <DataState
                  title="Ledger belum dapat dimuat"
                  retry={() => void ledger.refetch()}
                />
              ) : !transactions.length ? (
                <p className="py-6 text-text-muted">
                  Belum ada transaksi pada halaman dan filter ini.
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="border-b border-border-subtle text-text-muted">
                        <th scope="col" className="p-3">
                          Tanggal
                        </th>
                        <th scope="col" className="p-3">
                          Keterangan
                        </th>
                        <th scope="col" className="p-3 text-right">
                          Poin
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {transactions.map((row) => (
                        <tr
                          key={row.id}
                          className="border-b border-border-subtle"
                        >
                          <td className="whitespace-nowrap p-3">
                            {new Date(row.createdAt).toLocaleDateString(
                              'id-ID'
                            )}
                          </td>
                          <td className="p-3">{row.description}</td>
                          <td className="p-3 text-right font-mono">
                            {row.points > 0 ? '+' : ''}
                            {row.points}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              <nav
                aria-label="Halaman ledger"
                className="flex items-center justify-between gap-3"
              >
                <Button
                  variant="secondary"
                  disabled={page === 1}
                  onClick={() => setPage(page - 1)}
                >
                  Sebelumnya
                </Button>
                <span className="text-sm">
                  {page} / {Math.max(1, ledger.data?.meta.totalPages ?? 1)}
                </span>
                <Button
                  variant="secondary"
                  disabled={page >= (ledger.data?.meta.totalPages ?? 1)}
                  onClick={() => setPage(page + 1)}
                >
                  Berikutnya
                </Button>
              </nav>
            </section>
          </>
        )
      )}
    </main>
  );
}
