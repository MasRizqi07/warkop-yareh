import { redirect } from 'next/navigation';

interface StatusPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function CheckoutStatusRedirect({ searchParams }: StatusPageProps) {
  const query = await searchParams;
  const rawOrderId = query.orderId ?? query.orderNumber;
  const orderId = Array.isArray(rawOrderId) ? rawOrderId[0] : rawOrderId;
  redirect(orderId ? `/order/track/${encodeURIComponent(orderId)}` : '/orders');
}
