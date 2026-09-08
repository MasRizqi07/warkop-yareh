import { redirect } from 'next/navigation';
import { getAdminUrl } from '@/lib/admin-url';

export default function LegacyPosRedirect() {
  redirect(getAdminUrl('/pos'));
}
