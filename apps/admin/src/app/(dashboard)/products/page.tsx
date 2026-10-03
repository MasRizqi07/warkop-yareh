'use client';

import { FormEvent, useMemo, useState } from 'react';
import Image from 'next/image';
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
  createCategory,
  createMenuEvidence,
  getCategories,
  getProducts,
  setProductPublication,
  replaceProductCustomizations,
  updateProduct,
  type ProductRecord,
} from '@/lib/management-api';
import { getAdminProfile, getBranches, getBranchProducts, updateBranchProduct } from '@/lib/operations-api';

const EMPTY_FORM = { name: '', description: '', price: '', categoryId: '', image: '' };

async function loadProducts() {
  const [products, categories, user, branches, branchProducts] = await Promise.all([
    getProducts(),
    getCategories(),
    getAdminProfile(),
    getBranches(),
    getBranchProducts(),
  ]);
  return { products: products.data, categories, user, branches, branchProducts };
}

export default function ProductsPage() {
  const resource = useAsyncResource(loadProducts);
  const [search, setSearch] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [editing, setEditing] = useState<ProductRecord | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [categoryName, setCategoryName] = useState('');
  const [evidenceProductId, setEvidenceProductId] = useState<string | null>(null);
  const [evidence, setEvidence] = useState({ sourceType: 'DIRECT_PHYSICAL_AUDIT' as 'DIRECT_PHYSICAL_AUDIT' | 'PRIMARY_OPERATOR', sourceName: '', referenceUrl: '', rawExcerpt: '', capturedAt: '' });
  const [priceOverrides, setPriceOverrides] = useState<Record<string, string>>({});
  const [customizingId, setCustomizingId] = useState<string | null>(null);
  const [customizationJson, setCustomizationJson] = useState('[]');
  const [previewId, setPreviewId] = useState<string | null>(null);
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
      image: product.image ?? '',
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
        image: form.image.trim() || null,
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

  async function addCategory(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    try {
      await createCategory(categoryName.trim());
      setCategoryName('');
      await resource.reload();
      setNotice({ tone: 'success', text: 'Kategori berhasil dibuat.' });
    } catch (reason) {
      setNotice({ tone: 'error', text: reason instanceof Error ? reason.message : 'Kategori gagal dibuat.' });
    } finally { setSaving(false); }
  }

  async function transition(product: ProductRecord, status: ProductRecord['publicationStatus']) {
    setSaving(true);
    try {
      await setProductPublication(product.id, status);
      await resource.reload();
      setNotice({ tone: 'success', text: `${product.name}: ${status}` });
    } catch (reason) {
      setNotice({ tone: 'error', text: reason instanceof Error ? reason.message : 'Status gagal diperbarui.' });
    } finally { setSaving(false); }
  }

  async function verifyProduct(event: FormEvent<HTMLFormElement>, product: ProductRecord) {
    event.preventDefault();
    setSaving(true);
    try {
      const source = await createMenuEvidence(product.id, evidence);
      await setProductPublication(product.id, 'VERIFIED', source.id);
      setEvidenceProductId(null);
      setEvidence({ sourceType: 'DIRECT_PHYSICAL_AUDIT', sourceName: '', referenceUrl: '', rawExcerpt: '', capturedAt: '' });
      await resource.reload();
      setNotice({ tone: 'success', text: `${product.name}: bukti tersimpan dan menu terverifikasi.` });
    } catch (reason) {
      setNotice({ tone: 'error', text: reason instanceof Error ? reason.message : 'Verifikasi gagal.' });
    } finally { setSaving(false); }
  }

  async function setBranchAvailability(productId: string, branchId: string, isAvailable: boolean) {
    setSaving(true);
    try {
      await updateBranchProduct(branchId, productId, { isAvailable });
      await resource.reload();
      setNotice({ tone: 'success', text: 'Ketersediaan cabang diperbarui.' });
    } catch (reason) {
      setNotice({ tone: 'error', text: reason instanceof Error ? reason.message : 'Ketersediaan gagal diperbarui.' });
    } finally { setSaving(false); }
  }

  async function setBranchPrice(productId: string, branchId: string) {
    const key = `${productId}:${branchId}`;
    const raw = priceOverrides[key]?.trim();
    const priceOverride = raw ? Number(raw) : null;
    if (priceOverride !== null && (!Number.isSafeInteger(priceOverride) || priceOverride < 0)) {
      setNotice({ tone: 'error', text: 'Harga cabang harus bilangan bulat non-negatif.' });
      return;
    }
    setSaving(true);
    try {
      await updateBranchProduct(branchId, productId, { priceOverride });
      await resource.reload();
      setNotice({ tone: 'success', text: 'Harga cabang diperbarui.' });
    } catch (reason) {
      setNotice({ tone: 'error', text: reason instanceof Error ? reason.message : 'Harga cabang gagal diperbarui.' });
    } finally { setSaving(false); }
  }

  async function saveCustomizations(event: FormEvent<HTMLFormElement>, productId: string) {
    event.preventDefault();
    let groups: Array<{ name: string; options: Array<{ label: string; price: number }> }>;
    try {
      const parsed: unknown = JSON.parse(customizationJson);
      if (!Array.isArray(parsed)) throw new Error('Variasi harus berupa daftar JSON.');
      groups = parsed as typeof groups;
    } catch (reason) {
      setNotice({ tone: 'error', text: reason instanceof Error ? reason.message : 'JSON variasi tidak valid.' });
      return;
    }
    setSaving(true);
    try {
      await replaceProductCustomizations(productId, groups);
      setCustomizingId(null);
      await resource.reload();
      setNotice({ tone: 'success', text: 'Variasi disimpan. Produk kembali ke draft untuk verifikasi ulang.' });
    } catch (reason) {
      setNotice({ tone: 'error', text: reason instanceof Error ? reason.message : 'Variasi gagal disimpan.' });
    } finally { setSaving(false); }
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
      {canEdit ? <form onSubmit={addCategory} className="flex flex-wrap items-end gap-3 rounded-2xl border border-border-subtle bg-surface-card p-4">
        <label className="min-w-52 flex-1 text-sm font-semibold">Kategori baru<input required minLength={2} maxLength={100} className={`${fieldClass} mt-2`} value={categoryName} onChange={(event) => setCategoryName(event.target.value)} /></label>
        <button disabled={saving} className={secondaryButtonClass}>Tambah kategori</button>
      </form> : null}
      {showForm ? (
        <form onSubmit={submit} className="grid gap-4 rounded-2xl border border-border-subtle bg-surface-card p-5 sm:grid-cols-2" aria-label={editing ? 'Edit produk' : 'Tambah produk'}>
          <label className="text-sm font-semibold">Nama<input required minLength={2} maxLength={160} className={`${fieldClass} mt-2`} value={form.name} onChange={(event) => setForm((value) => ({ ...value, name: event.target.value }))} /></label>
          <label className="text-sm font-semibold">Kategori<select required className={`${fieldClass} mt-2`} value={form.categoryId} onChange={(event) => setForm((value) => ({ ...value, categoryId: event.target.value }))}>{resource.data?.categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</select></label>
          <label className="text-sm font-semibold">Harga (rupiah)<input required min={0} max={1_000_000_000} step={1} type="number" className={`${fieldClass} mt-2`} value={form.price} onChange={(event) => setForm((value) => ({ ...value, price: event.target.value }))} /></label>
          <label className="text-sm font-semibold sm:col-span-2">Deskripsi<textarea maxLength={5000} rows={4} className={`${fieldClass} mt-2`} value={form.description} onChange={(event) => setForm((value) => ({ ...value, description: event.target.value }))} /></label>
          <label className="text-sm font-semibold sm:col-span-2">URL gambar terverifikasi (HTTPS, opsional)<input type="url" maxLength={2000} className={`${fieldClass} mt-2`} value={form.image} onChange={(event) => setForm((value) => ({ ...value, image: event.target.value }))} /></label>
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
              <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-accent">Status: {product.publicationStatus}</p>
              <button type="button" onClick={() => setPreviewId(previewId === product.id ? null : product.id)} className={`${secondaryButtonClass} mt-3`}>Pratinjau produk</button>
              {previewId === product.id ? <div className="mt-3 rounded-xl border border-border-subtle bg-surface-secondary p-4" aria-label={`Pratinjau ${product.name}`}>
                {product.image ? <Image src={product.image} alt={product.name} width={480} height={300} unoptimized className="aspect-[8/5] w-full rounded-lg object-cover" /> : null}
                <h3 className="mt-3 font-bold">{product.name}</h3>
                <p className="text-sm text-text-secondary">{product.description}</p>
                <p className="font-semibold">{formatRupiah(product.price)}</p>
                <p className="text-xs text-text-secondary">{product.customizations?.length ?? 0} kelompok variasi. Pratinjau internal; status {product.publicationStatus}.</p>
              </div> : null}
              {canEdit ? <div className="mt-4 space-y-3 border-t border-border-subtle pt-4">
                <p className="text-xs font-semibold">Cabang &amp; harga</p>
                {resource.data?.branches.map((branch) => {
                  const assignment = resource.data?.branchProducts.find((row) => row.branchId === branch.id && row.productId === product.id);
                  const key = `${product.id}:${branch.id}`;
                  return <div key={branch.id} className="rounded-lg border border-border-subtle p-2 text-xs">
                    <label className="flex items-center gap-2"><input type="checkbox" disabled={saving} checked={assignment?.isAvailable ?? false} onChange={(event) => void setBranchAvailability(product.id, branch.id, event.target.checked)} />{branch.name}</label>
                    <div className="mt-2 flex gap-2"><input aria-label={`Harga khusus ${product.name} di ${branch.name}`} type="number" min={0} step={1} placeholder={assignment?.priceOverride == null ? 'Harga dasar' : String(assignment.priceOverride)} className={`${fieldClass} min-w-0 flex-1`} value={priceOverrides[key] ?? ''} onChange={(event) => setPriceOverrides((current) => ({ ...current, [key]: event.target.value }))} /><button type="button" disabled={saving} onClick={() => void setBranchPrice(product.id, branch.id)} className={secondaryButtonClass}>Simpan</button></div>
                  </div>;
                })}
                <div className="flex flex-wrap gap-2">
                  <button type="button" disabled={saving} onClick={() => { setCustomizingId(product.id); setCustomizationJson(JSON.stringify(product.customizations?.map(({ name, options }) => ({ name, options })) ?? [], null, 2)); }} className={secondaryButtonClass}>Kelola variasi</button>
                  {product.publicationStatus === 'DRAFT' ? <button type="button" disabled={saving} onClick={() => void transition(product, 'REVIEW')} className={secondaryButtonClass}>Ajukan review</button> : null}
                  {product.publicationStatus === 'REVIEW' ? <button type="button" disabled={saving} onClick={() => setEvidenceProductId(product.id)} className={secondaryButtonClass}>Catat bukti verifikasi</button> : null}
                  {product.publicationStatus === 'VERIFIED' ? <button type="button" disabled={saving} onClick={() => void transition(product, 'PUBLISHED')} className={primaryButtonClass}>Publikasikan</button> : null}
                  {product.publicationStatus === 'PUBLISHED' ? <button type="button" disabled={saving} onClick={() => void transition(product, 'ARCHIVED')} className={secondaryButtonClass}>Arsipkan</button> : null}
                  {product.publicationStatus === 'ARCHIVED' ? <button type="button" disabled={saving} onClick={() => void transition(product, 'DRAFT')} className={secondaryButtonClass}>Kembali ke draft</button> : null}
                </div>
                {customizingId === product.id ? <form onSubmit={(event) => void saveCustomizations(event, product.id)} className="space-y-2 rounded-xl border border-border-subtle p-3">
                  <label className="block text-xs font-semibold">Variasi menu (JSON)<textarea required rows={8} className={`${fieldClass} mt-1 font-mono text-xs`} value={customizationJson} onChange={(event) => setCustomizationJson(event.target.value)} /></label>
                  <p className="text-xs text-text-secondary">Format: <code>{'[{"name":"Ukuran","options":[{"label":"Besar","price":3000}]}]'}</code>. Simpan ulang mengembalikan produk ke draft.</p>
                  <button disabled={saving} className={secondaryButtonClass}>Simpan variasi</button>
                </form> : null}
                {evidenceProductId === product.id ? <form onSubmit={(event) => void verifyProduct(event, product)} className="space-y-3 rounded-xl border border-accent p-3">
                  <p className="text-xs">Bukti harus berasal dari operator atau audit fisik menu. Nama dan harga produk saat ini akan disimpan bersama sumber.</p>
                  <label className="block text-xs">Jenis sumber<select className={`${fieldClass} mt-1`} value={evidence.sourceType} onChange={(event) => setEvidence((value) => ({ ...value, sourceType: event.target.value as typeof evidence.sourceType }))}><option value="DIRECT_PHYSICAL_AUDIT">Audit menu fisik</option><option value="PRIMARY_OPERATOR">Operator utama</option></select></label>
                  <label className="block text-xs">Nama sumber<input required minLength={3} maxLength={160} className={`${fieldClass} mt-1`} value={evidence.sourceName} onChange={(event) => setEvidence((value) => ({ ...value, sourceName: event.target.value }))} /></label>
                  <label className="block text-xs">Tanggal bukti<input required type="date" max={new Date().toISOString().slice(0, 10)} className={`${fieldClass} mt-1`} value={evidence.capturedAt} onChange={(event) => setEvidence((value) => ({ ...value, capturedAt: event.target.value }))} /></label>
                  <label className="block text-xs">URL bukti (HTTPS, opsional)<input type="url" maxLength={1000} className={`${fieldClass} mt-1`} value={evidence.referenceUrl} onChange={(event) => setEvidence((value) => ({ ...value, referenceUrl: event.target.value }))} /></label>
                  <label className="block text-xs">Catatan bukti (wajib jika tanpa URL)<textarea maxLength={2000} className={`${fieldClass} mt-1`} value={evidence.rawExcerpt} onChange={(event) => setEvidence((value) => ({ ...value, rawExcerpt: event.target.value }))} /></label>
                  <button disabled={saving} className={primaryButtonClass}>Simpan bukti &amp; verifikasi</button>
                </form> : null}
              </div> : null}
            </article>
          ))}
        </div>
      </DataPanel>
    </div>
  );
}
