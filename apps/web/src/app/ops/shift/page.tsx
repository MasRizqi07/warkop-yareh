import { redirect } from 'next/navigation';
import { getAdminUrl } from '@/lib/admin-url';

export default function LegacyShiftRedirect() {
  redirect(getAdminUrl('/shifts'));
}
