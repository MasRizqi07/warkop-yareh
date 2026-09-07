import { redirect } from 'next/navigation';

interface StatusPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function CheckoutStatusRedirect({ searchParams }: StatusPageProps) {
  const query = await searchParams;
  const rawOrderId = query.orderId ?? query.orderNumber;
  const orderId = Array.isArray(rawOrderId) ? rawOrderId[0] : rawOrderId;
  const transactionStatus = query.transaction_status || query.status;
  const statusStr = Array.isArray(transactionStatus) ? transactionStatus[0] : transactionStatus;

  if (statusStr === 'settlement' || statusStr === 'capture') {
    redirect(orderId ? `/order/track/${encodeURIComponent(orderId)}` : '/orders');
  } else {
    redirect(orderId ? `/payment/status?orderId=${encodeURIComponent(orderId)}&status=${statusStr ?? 'pending'}` : '/payment/status');
  }
}
