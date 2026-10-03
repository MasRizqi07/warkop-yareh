import { pageMetadata } from '@/lib/seo';

export const metadata = pageMetadata(
  "Tentang Warkop Ya'reh",
  "Profil Warkop Ya'reh di Surabaya dengan dua cabang: Jetis Kulon di Wonokromo dan Prapen di Tenggilis Mejoyo.",
  '/about'
);

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
