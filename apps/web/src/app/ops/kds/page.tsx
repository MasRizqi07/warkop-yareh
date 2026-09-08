import { redirect } from 'next/navigation';
import { getAdminUrl } from '@/lib/admin-url';

export default function LegacyKdsRedirect() {
  redirect(getAdminUrl('/kitchen'));
}
