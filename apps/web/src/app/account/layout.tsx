import { PRIVATE_METADATA } from '@/lib/seo';

export const metadata = PRIVATE_METADATA;

export default function Layout({ children }: { children: React.ReactNode }) {
  return <div id="main-content">{children}</div>;
}
