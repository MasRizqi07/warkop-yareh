import { PRIVATE_METADATA } from '@/lib/seo';
import { requireTableOrdering } from '@/lib/require-ordering';

export const metadata = PRIVATE_METADATA;

export default function Layout({ children }: { children: React.ReactNode }) {
  requireTableOrdering();
  return <div id="main-content">{children}</div>;
}
