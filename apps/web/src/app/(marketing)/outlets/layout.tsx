import { pageMetadata } from '@/lib/seo';

export const metadata = pageMetadata(
  'Cabang di Surabaya',
  "Alamat Warkop Ya'reh Jetis Kulon dan Warkop Ya'reh 2 Prapen, Plus Code, layanan dine-in dan takeaway, serta petunjuk arah.",
  '/outlets'
);

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
