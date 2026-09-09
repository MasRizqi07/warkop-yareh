'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Award,
  Heart,
  LogOut,
  MapPin,
  Receipt,
  ShieldCheck,
  User,
} from 'lucide-react';
import { Button, Input } from '@warkop-yareh/ui';
import { DataState, LoadingState } from '@/components/data-state';
import { getProfile, updateProfile, type Profile } from './account.api';
import { useMyOrders } from '@/features/orders/orders.hooks';
import { useActiveBranch, useCatalog } from '@/features/catalog/catalog.hooks';
import { useAuthStore } from '@/stores/auth.store';
import { useCartStore } from '@/stores';
import { useBranchStore } from '@/stores/branch.store';
import { getApiErrorMessage } from '@/lib/api-error';
import { api } from '@/lib/api';

const TABS = [
  { id: 'profile', label: 'Profil', icon: User },
  { id: 'favorites', label: 'Menu favorit', icon: Heart },
  { id: 'orders', label: 'Riwayat pesanan', icon: Receipt },
  { id: 'locations', label: 'Cabang', icon: MapPin },
  { id: 'security', label: 'Keamanan', icon: ShieldCheck },
] as const;

function ProfileForm({ profile }: { profile: Profile }) {
  const client = useQueryClient();
  const [name, setName] = useState(profile.name);
  const [phone, setPhone] = useState(profile.phone ?? '');
  const [whatsAppMarketingOptIn, setWhatsAppMarketingOptIn] = useState(
    Boolean(profile.whatsAppMarketingOptInAt)
  );
  const mutation = useMutation({
    mutationFn: () =>
      updateProfile(profile.id, {
        name: name.trim(),
        ...(phone.trim() ? { phone: phone.trim() } : {}),
        whatsAppMarketingOptIn,
      }),
    onSuccess: async () => {
      await client.invalidateQueries({ queryKey: ['profile', profile.id] });
    },
  });
  return (
    <form
      className="space-y-5"
      onSubmit={(event) => {
        event.preventDefault();
        mutation.mutate();
      }}
    >
      <div>
        <label htmlFor="profile-name" className="mb-2 block text-sm">
          Nama
        </label>
        <Input
          id="profile-name"
          value={name}
          onChange={(event) => setName(event.target.value)}
          required
          minLength={2}
          maxLength={100}
          autoComplete="name"
        />
      </div>
      <div>
        <label htmlFor="profile-email" className="mb-2 block text-sm">
          Email akun
        </label>
        <Input id="profile-email" value={profile.email} readOnly type="email" />
      </div>
      <div>
        <label htmlFor="profile-phone" className="mb-2 block text-sm">
          Nomor telepon
        </label>
        <Input
          id="profile-phone"
          value={phone}
          onChange={(event) => setPhone(event.target.value)}
          type="tel"
          autoComplete="tel"
          maxLength={20}
          pattern="[+0-9][0-9 -]{7,19}"
        />
      </div>
      <label className="flex items-start gap-3 rounded-xl border border-border-subtle p-4 text-sm">
        <input
          type="checkbox"
          className="mt-1"
          checked={whatsAppMarketingOptIn}
          disabled={!phone.trim()}
          onChange={(event) => setWhatsAppMarketingOptIn(event.target.checked)}
        />
        <span>
          <strong className="block">Promosi melalui WhatsApp</strong>
          <span className="mt-1 block text-text-muted">
            Izinkan Warkop Ya&apos;reh mengirim penawaran promosi ke nomor ini.
            Kamu dapat mencabut izin kapan saja.
          </span>
          {!phone.trim() && (
            <span className="mt-1 block text-error">
              Tambahkan nomor telepon untuk mengaktifkan pilihan ini.
            </span>
          )}
        </span>
      </label>
      <Button disabled={mutation.isPending} type="submit">
        {mutation.isPending ? 'Menyimpan...' : 'Simpan profil'}
      </Button>
      {mutation.isError && (
        <p role="alert" className="text-sm">
          {getApiErrorMessage(mutation.error)}
        </p>
      )}
      {mutation.isSuccess && (
        <p role="status" className="text-sm">
          Profil tersimpan.
        </p>
      )}
    </form>
  );
}

export default function AccountPage() {
  const user = useAuthStore((state) => state.user);
  const initialized = useAuthStore((state) => state.isInitialized);
  const authenticated = useAuthStore((state) => state.isAuthenticated);
  const enabled = initialized && authenticated && Boolean(user);
  const client = useQueryClient();
  const [tab, setTab] = useState<(typeof TABS)[number]['id']>('profile');
  const [search, setSearch] = useState('');
  const [notice, setNotice] = useState('');
  const profile = useQuery({
    queryKey: ['profile', user?.id],
    queryFn: () => getProfile(user!.id),
    enabled,
  });
  const orders = useMyOrders(enabled);
  const branches = useActiveBranch();
  const catalog = useCatalog(branches.activeBranch?.id);
  const setBranch = useBranchStore((state) => state.setActiveBranchId);
  const addItem = useCartStore((state) => state.addItem);
  const logout = useMutation({
    mutationFn: async () => {
      await api.post('/auth/logout');
      useAuthStore.getState().logout();
      client.clear();
    },
  });
  const favoriteProducts = useMemo(() => {
    const counts = new Map<string, number>();
    for (const order of orders.data ?? [])
      for (const item of order.items)
        counts.set(
          item.productId,
          (counts.get(item.productId) ?? 0) + item.quantity
        );
    return (catalog.data?.products ?? [])
      .filter((product) => counts.has(product.id))
      .sort((a, b) => counts.get(b.id)! - counts.get(a.id)!)
      .slice(0, 8);
  }, [orders.data, catalog.data]);
  const filteredOrders = (orders.data ?? []).filter((order) =>
    `${order.orderNumber} ${order.items.map((item) => item.snapshotName).join(' ')}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  return (
    <main className="mx-auto min-h-screen max-w-7xl space-y-8 px-4 pb-32 pt-10 text-text-primary sm:px-6">
      <header>
        <Link href="/" className="text-sm text-text-muted">
          Sanctuary Home
        </Link>
        <h1 className="mt-3 text-3xl font-bold sm:text-4xl">
          Your Sanctuary Account
        </h1>
        <p className="mt-2 text-text-muted">
          Profil, cangkir favorit, dan perjalanan Kawan Ya&apos;reh Anda.
        </p>
      </header>
      {!initialized ? (
        <LoadingState label="Memulihkan sesi..." />
      ) : !authenticated ? (
        <DataState title="Masuk untuk membuka akun Anda" loginPath="/account" />
      ) : profile.isPending ? (
        <LoadingState />
      ) : profile.isError ? (
        <DataState
          title="Profil belum dapat dimuat"
          detail={getApiErrorMessage(profile.error)}
          retry={() => void profile.refetch()}
        />
      ) : (
        profile.data && (
          <>
            <section className="grid gap-4 sm:grid-cols-3">
              {[
                ['Poin member', profile.data.loyaltyPoints ?? 0],
                ['Tier member', profile.data.membershipTier ?? 'BRONZE'],
                ['Pesanan terbaru dimuat', orders.data?.length ?? 0],
              ].map(([label, value]) => (
                <div
                  key={label}
                  className="rounded-2xl border border-border-subtle bg-surface-card p-6"
                >
                  <p className="text-xs text-text-muted">{label}</p>
                  <strong className="mt-3 block text-2xl text-accent-amber">
                    {value}
                  </strong>
                </div>
              ))}
            </section>
            <div className="grid gap-6 lg:grid-cols-[250px_minmax(0,1fr)]">
              <aside className="space-y-4">
                <section className="rounded-2xl border border-accent-amber/30 bg-gradient-to-br from-brand-coffee to-surface-card p-6">
                  <Award className="h-9 w-9 text-accent-amber" />
                  <h2 className="mt-6 break-words text-xl font-semibold">
                    {profile.data.name}
                  </h2>
                  <p className="mt-2 text-xs text-text-muted">
                    Member sejak{' '}
                    {new Date(profile.data.createdAt).toLocaleDateString(
                      'id-ID'
                    )}
                  </p>
                  <Link
                    href="/loyalty"
                    className="mt-5 inline-block text-accent-amber underline"
                  >
                    Lihat member pass &amp; hadiah
                  </Link>
                </section>
                <nav
                  aria-label="Navigasi akun"
                  className="flex flex-wrap gap-2 lg:flex-col"
                >
                  {TABS.map((item) => (
                    <Button
                      key={item.id}
                      variant={tab === item.id ? 'default' : 'secondary'}
                      aria-pressed={tab === item.id}
                      onClick={() => setTab(item.id)}
                    >
                      <item.icon className="h-4 w-4" />
                      {item.label}
                    </Button>
                  ))}
                </nav>
              </aside>
              <section className="min-w-0 space-y-6 rounded-2xl border border-border-subtle bg-surface-card p-5 sm:p-8">
                <h2 className="text-xl font-semibold">
                  {TABS.find((item) => item.id === tab)?.label}
                </h2>
                {tab === 'profile' && (
                  <ProfileForm key={profile.data.id} profile={profile.data} />
                )}
                {tab === 'favorites' && (
                  <>
                    <p className="text-sm text-text-muted">
                      Menu yang sering Anda pesan dan tersedia di{' '}
                      {branches.activeBranch?.name ?? 'cabang pilihan'}.
                    </p>
                    {catalog.isError ? (
                      <DataState
                        title="Katalog belum dapat dimuat"
                        retry={() => void catalog.refetch()}
                      />
                    ) : catalog.isPending ? (
                      <LoadingState />
                    ) : !favoriteProducts.length ? (
                      <DataState
                        title="Belum ada menu favorit dari riwayat pesanan"
                        detail="Pesan menu pertama Anda untuk mulai mengisi daftar ini."
                      />
                    ) : (
                      <div className="grid gap-4 sm:grid-cols-2">
                        {favoriteProducts.map((product) => (
                          <article
                            key={product.id}
                            className="rounded-xl border border-border-subtle bg-surface-secondary p-5"
                          >
                            <Heart className="mb-3 h-5 w-5 text-accent-amber" />
                            <h3 className="font-semibold">{product.name}</h3>
                            <p className="my-3 text-sm text-text-muted">
                              Rp {product.price.toLocaleString('id-ID')}
                            </p>
                            <Button
                              onClick={() => {
                                addItem(product, 1);
                                setNotice(`${product.name} masuk keranjang.`);
                              }}
                            >
                              Pesan lagi
                            </Button>
                          </article>
                        ))}
                      </div>
                    )}
                    {notice && (
                      <p role="status" className="text-sm">
                        {notice}{' '}
                        <Link href="/cart" className="underline">
                          Buka keranjang
                        </Link>
                      </p>
                    )}
                  </>
                )}
                {tab === 'orders' && (
                  <>
                    <label htmlFor="archive-search" className="sr-only">
                      Cari pesanan
                    </label>
                    <Input
                      id="archive-search"
                      value={search}
                      onChange={(event) => setSearch(event.target.value)}
                      placeholder="Cari ID atau nama menu"
                    />
                    {orders.isPending ? (
                      <LoadingState />
                    ) : orders.isError ? (
                      <DataState
                        title="Riwayat belum dapat dimuat"
                        retry={() => void orders.refetch()}
                      />
                    ) : !filteredOrders.length ? (
                      <DataState title="Belum ada pesanan yang cocok" />
                    ) : (
                      <ul className="space-y-3">
                        {filteredOrders.map((order) => (
                          <li
                            key={order.id}
                            className="rounded-xl border border-border-subtle p-4"
                          >
                            <Link
                              href={`/order/track/${encodeURIComponent(order.id)}`}
                              className="flex flex-wrap justify-between gap-3"
                            >
                              <span className="min-w-0 break-all font-mono text-sm text-accent-amber">
                                {order.orderNumber}
                              </span>
                              <span className="text-sm">
                                Rp {order.total.toLocaleString('id-ID')}
                              </span>
                            </Link>
                            <p className="mt-2 text-xs text-text-muted">
                              {new Date(order.createdAt).toLocaleString(
                                'id-ID'
                              )}{' '}
                              · {order.status} · {order.paymentStatus}
                            </p>
                          </li>
                        ))}
                      </ul>
                    )}
                    <p className="text-xs text-text-muted">
                      Menampilkan hingga 50 pesanan terbaru.
                    </p>
                  </>
                )}
                {tab === 'locations' && (
                  <>
                    {branches.isError ? (
                      <DataState
                        title="Cabang belum dapat dimuat"
                        retry={() => void branches.refetch()}
                      />
                    ) : branches.isPending ? (
                      <LoadingState />
                    ) : (
                      <div className="space-y-4">
                        {branches.data?.map((branch) => (
                          <article
                            key={branch.id}
                            className="rounded-xl border border-border-subtle p-5"
                          >
                            <h3 className="font-semibold">{branch.name}</h3>
                            <p className="my-3 text-sm text-text-muted">
                              {branch.address}, {branch.city}
                            </p>
                            <p className="mb-4 text-xs text-text-muted">
                              Hari kerja {branch.weekdayHours} · Akhir pekan{' '}
                              {branch.weekendHours}
                            </p>
                            <Button
                              variant="secondary"
                              disabled={branches.activeBranch?.id === branch.id}
                              onClick={() => setBranch(branch.id)}
                            >
                              {branches.activeBranch?.id === branch.id
                                ? 'Cabang aktif'
                                : 'Pilih cabang'}
                            </Button>
                          </article>
                        ))}
                      </div>
                    )}
                  </>
                )}
                {tab === 'security' && (
                  <div className="space-y-5">
                    <ShieldCheck className="h-10 w-10 text-accent-amber" />
                    <p className="text-sm text-text-muted">
                      Keluar akan mencabut sesi masuk pada perangkat ini. Anda
                      perlu masuk kembali untuk mengakses akun.
                    </p>
                    <Button
                      variant="secondary"
                      onClick={() => logout.mutate()}
                      disabled={logout.isPending}
                    >
                      <LogOut className="h-4 w-4" />
                      {logout.isPending
                        ? 'Mengakhiri sesi...'
                        : 'Keluar dari perangkat ini'}
                    </Button>
                    {logout.isError && (
                      <DataState
                        title="Sesi belum diakhiri"
                        detail={getApiErrorMessage(logout.error)}
                      />
                    )}
                  </div>
                )}
              </section>
            </div>
          </>
        )
      )}
    </main>
  );
}
