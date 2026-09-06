import { redirect } from 'next/navigation';

interface SuccessPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function CheckoutSuccessRedirect({ searchParams }: SuccessPageProps) {
  const query = await searchParams;
  const rawOrderId = query.orderId ?? query.orderNumber;
  const orderId = Array.isArray(rawOrderId) ? rawOrderId[0] : rawOrderId;
  redirect(orderId ? `/order/track/${encodeURIComponent(orderId)}` : '/orders');
}
