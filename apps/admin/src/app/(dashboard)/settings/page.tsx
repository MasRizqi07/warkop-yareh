import Link from 'next/link';

export default function SettingsPage() {
  const apiConfigured = Boolean(process.env.NEXT_PUBLIC_API_URL);
  return (
    <div className="mx-auto max-w-5xl space-y-7 p-5 sm:p-8">
      <header className="border-b border-border-subtle pb-7"><p className="text-xs font-bold uppercase tracking-[0.22em] text-accent">Configuration boundary</p><h1 className="mt-2 text-3xl font-bold">Pengaturan sistem</h1><p className="mt-2 max-w-2xl text-sm leading-6 text-text-secondary">Pengaturan operasional disimpan pada resource yang memilikinya. Rahasia provider dan URL layanan dikelola melalui environment deployment, bukan dikirim dari browser.</p></header>
      <div className="grid gap-5 md:grid-cols-2"><section className="rounded-2xl border border-border-subtle bg-surface-card p-5"><h2 className="font-bold">Cabang, jam, dan kontak</h2><p className="mt-2 text-sm leading-6 text-text-secondary">Nama, alamat, kapasitas, fitur, serta jam operasional dapat diperbarui melalui konfigurasi cabang.</p><Link href="/branches" className="mt-5 inline-flex min-h-11 items-center rounded-xl bg-accent px-4 py-2 text-sm font-bold text-white">Kelola cabang</Link></section><section className="rounded-2xl border border-border-subtle bg-surface-card p-5"><h2 className="font-bold">Koneksi API</h2><p className="mt-2 text-sm leading-6 text-text-secondary">{apiConfigured ? 'NEXT_PUBLIC_API_URL dikonfigurasi untuk build ini.' : 'Build ini memakai fallback lokal http://localhost:4000/api/v1.'}</p><p className="mt-3 text-xs text-text-secondary">Nilai rahasia tidak pernah ditampilkan pada halaman ini.</p></section></div>
      <section className="rounded-2xl border border-border-subtle bg-surface-card p-5"><h2 className="font-bold">Provider eksternal</h2><p className="mt-2 text-sm leading-6 text-text-secondary">Midtrans, WhatsApp, email, database, dan Redis harus diverifikasi di environment tujuan. UI tidak menampilkan status “terhubung” tanpa health check atau respons provider yang nyata.</p><div className="mt-5 flex flex-wrap gap-3"><Link href="/marketing" className="rounded-xl border border-border-subtle px-4 py-2 text-sm font-semibold">Status WhatsApp</Link><Link href="/analytics" className="rounded-xl border border-border-subtle px-4 py-2 text-sm font-semibold">Telemetry</Link></div></section>
    </div>
  );
}
