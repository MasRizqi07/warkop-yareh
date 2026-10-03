import { PRIVATE_METADATA } from '@/lib/seo';
import { requireQrOrdering } from '@/lib/require-ordering';

export const metadata = PRIVATE_METADATA;

export default function Layout({ children }: { children: React.ReactNode }) {
  requireQrOrdering();
  return <div id="main-content">{children}</div>;
}
