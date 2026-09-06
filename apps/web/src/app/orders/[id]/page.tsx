import { redirect } from 'next/navigation';

interface OrderRedirectPageProps {
  params: Promise<{ id: string }>;
}

export default async function OrderRedirectPage({ params }: OrderRedirectPageProps) {
  const { id } = await params;
  redirect(`/order/track/${encodeURIComponent(id)}`);
}
