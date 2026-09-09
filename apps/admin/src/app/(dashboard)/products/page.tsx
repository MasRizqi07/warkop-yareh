'use client';

import { FormEvent, useMemo, useState } from 'react';
import { Pencil, Plus, Search } from 'lucide-react';
import {
  DataPanel,
  Notice,
  PageHeading,
  fieldClass,
  formatRupiah,
  primaryButtonClass,
  secondaryButtonClass,
  useAsyncResource,
} from '@/components/management/page-kit';
import {
  createProduct,
  getCategories,
  getProducts,
  updateProduct,
  type ProductRecord,
} from '@/lib/management-api';
import { getAdminProfile } from '@/lib/operations-api';

const EMPTY_FORM = { name: '', description: '', price: '', categoryId: '' };

async function loadProducts() {
  const [products, categories, user] = await Promise.all([
    getProducts(),
    getCategories(),
    getAdminProfile(),
  ]);
  return { products: products.data, categories, user };
}

export default function ProductsPage() {
  const resource = useAsyncResource(loadProducts);
  const [search, setSearch] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [editing, setEditing] = useState<ProductRecord | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState<{ tone: 'success' | 'error'; text: string } | null>(null);
  const canEdit = ['ADMIN', 'SUPERADMIN'].includes(resource.data?.user.role ?? '');

  const filtered = useMemo(() => {
    const needle = search.trim().toLocaleLowerCase('id-ID');
    return (resource.data?.products ?? []).filter(
      (product) =>
        (!categoryId || product.categoryId === categoryId) &&
        (!needle ||
          product.name.toLocaleLowerCase('id-ID').includes(needle) ||
          product.slug.toLocaleLowerCase('id-ID').includes(needle)),
    );
  }, [categoryId, resource.data?.products, search]);

  function openCreate() {
    setEditing(null);
    setForm({ ...EMPTY_FORM, categoryId: resource.data?.categories[0]?.id ?? '' });
    setNotice(null);
    setShowForm(true);
  }

  function openEdit(product: ProductRecord) {
    setEditing(product);
    setForm({
      name: product.name,
      description: product.description,
      price: String(product.price),
      categoryId: product.categoryId,
    });
    setNotice(null);
    setShowForm(true);
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const price = Number(form.price);
    if (!Number.isSafeInteger(price) || price < 0) {
      setNotice({ tone: 'error', text: 'Harga harus berupa bilangan bulat non-negatif.' });
      return;
    }
    setSaving(true);
    setNotice(null);
    try {
      const payload = {
        name: form.name.trim(),
        description: form.description.trim(),
        price,
        categoryId: form.categoryId,
      };
      if (editing) await updateProduct(editing.id, payload);
      else await createProduct(payload);
      setShowForm(false);
      setNotice({ tone: 'success', text: editing ? 'Produk berhasil diperbarui.' : 'Produk berhasil dibuat.' });
      await resource.reload();
    } catch (reason) {
      setNotice({ tone: 'error', text: reason instanceof Error ? reason.message : 'Produk gagal disimpan.' });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mx-auto max-w-7xl space-y-7 p-5 sm:p-8">
      <PageHeading
        eyebrow="Catalog"
        title="Menu & produk"
        description="Kelola data produk global. Harga, stok, dan ketersediaan per cabang tetap dikelola dari halaman Inventory agar cakupan mutasi jelas."
        actions={canEdit ? <button type="button" onClick={openCreate} className={primaryButtonClass}><Plus className="mr-2 h-4 w-4" />Tambah produk</button> : undefined}
      />

      {notice ? <Notice tone={notice.tone}>{notice.text}</Notice> : null}
      {showForm ? (
        <form onSubmit={submit} className="grid gap-4 rounded-2xl border border-border-subtle bg-surface-card p-5 sm:grid-cols-2" aria-label={editing ? 'Edit produk' : 'Tambah produk'}>
          <label className="text-sm font-semibold">Nama<input required minLength={2} maxLength={160} className={`${fieldClass} mt-2`} value={form.name} onChange={(event) => setForm((value) => ({ ...value, name: event.target.value }))} /></label>
          <label className="text-sm font-semibold">Kategori<select required className={`${fieldClass} mt-2`} value={form.categoryId} onChange={(event) => setForm((value) => ({ ...value, categoryId: event.target.value }))}>{resource.data?.categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</select></label>
          <label className="text-sm font-semibold">Harga (rupiah)<input required min={0} max={1_000_000_000} step={1} type="number" className={`${fieldClass} mt-2`} value={form.price} onChange={(event) => setForm((value) => ({ ...value, price: event.target.value }))} /></label>
          <label className="text-sm font-semibold sm:col-span-2">Deskripsi<textarea maxLength={5000} rows={4} className={`${fieldClass} mt-2`} value={form.description} onChange={(event) => setForm((value) => ({ ...value, description: event.target.value }))} /></label>
          <div className="flex gap-3 sm:col-span-2"><button disabled={saving} className={primaryButtonClass}>{saving ? 'Menyimpan…' : 'Simpan'}</button><button type="button" onClick={() => setShowForm(false)} className={secondaryButtonClass}>Batal</button></div>
        </form>
      ) : null}

      <div className="grid gap-3 sm:grid-cols-[1fr_260px]">
        <label className="relative"><span className="sr-only">Cari produk</span><Search className="absolute left-3 top-3.5 h-4 w-4 text-text-secondary" /><input className={`${fieldClass} pl-10`} value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Cari nama atau slug…" /></label>
        <label><span className="sr-only">Filter kategori</span><select className={fieldClass} value={categoryId} onChange={(event) => setCategoryId(event.target.value)}><option value="">Semua kategori</option>{resource.data?.categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</select></label>
      </div>

      <DataPanel loading={resource.loading} error={resource.error} empty={filtered.length === 0} onRetry={() => void resource.reload()}>
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((product) => (
            <article key={product.id} className="rounded-2xl border border-border-subtle bg-surface-card p-5">
              <div className="flex items-start justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-wider text-accent">{product.category.name}</p><h2 className="mt-2 text-lg font-bold">{product.name}</h2></div>{canEdit ? <button type="button" onClick={() => openEdit(product)} className={secondaryButtonClass} aria-label={`Edit ${product.name}`}><Pencil className="h-4 w-4" /></button> : null}</div>
              <p className="mt-3 line-clamp-3 min-h-15 text-sm leading-5 text-text-secondary">{product.description || 'Belum ada deskripsi.'}</p>
              <div className="mt-5 border-t border-border-subtle pt-4"><p className="text-xs text-text-secondary">Harga dasar</p><p className="text-xl font-bold">{formatRupiah(product.price)}</p></div>
            </article>
          ))}
        </div>
      </DataPanel>
    </div>
  );
}
