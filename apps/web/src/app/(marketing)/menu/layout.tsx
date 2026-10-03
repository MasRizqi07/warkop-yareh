import { pageMetadata } from '@/lib/seo';

export const metadata = pageMetadata(
  'Menu dan Harga',
  "Status verifikasi menu Warkop Ya'reh. Kisaran pengeluaran per orang, informasi cabang, dan petunjuk kunjungan.",
  '/menu'
);

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
