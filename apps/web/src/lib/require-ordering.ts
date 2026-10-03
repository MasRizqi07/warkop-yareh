import { redirect } from 'next/navigation';
import { PUBLIC_ORDERING_ENABLED, QR_ORDERING_ENABLED, TABLE_ORDERING_ENABLED } from './feature-flags';

export function requirePublicOrdering(): void {
  if (!PUBLIC_ORDERING_ENABLED) redirect('/menu');
}

export function requireQrOrdering(): void {
  if (!PUBLIC_ORDERING_ENABLED || !QR_ORDERING_ENABLED) redirect('/menu');
}

export function requireTableOrdering(): void {
  if (!PUBLIC_ORDERING_ENABLED || !TABLE_ORDERING_ENABLED) redirect('/menu');
}
