import { pageMetadata } from '@/lib/seo';

export const metadata = pageMetadata(
  'Galeri',
  'Status dokumentasi foto outlet Jetis Kulon dan Prapen. Foto lokasi ditampilkan setelah bukti dan izin publikasinya diverifikasi.',
  '/gallery'
);

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
