import { pageMetadata } from '@/lib/seo';

export const metadata = pageMetadata(
  'Kontak dan Lokasi',
  "Alamat dan petunjuk arah kedua cabang Warkop Ya'reh. Telepon outlet Prapen 0821-3735-4606; nomor Jetis Kulon belum terverifikasi.",
  '/contact'
);

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
