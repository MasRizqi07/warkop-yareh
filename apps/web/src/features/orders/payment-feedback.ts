import type {
  ApiOrderStatus,
  ApiPaymentStatus,
} from '@/features/api/contracts';

export type PaymentFeedbackKind =
  'pending' | 'paid' | 'expired' | 'failed' | 'refunded' | 'cancelled';

export interface PaymentFeedback {
  kind: PaymentFeedbackKind;
  title: string;
  detail: string;
  canInitializePayment: boolean;
}

const FAILED_GATEWAY_STATES = new Set(['cancel', 'deny', 'failure']);

export function getPaymentFeedback(
  paymentStatus: ApiPaymentStatus,
  orderStatus: ApiOrderStatus,
  gatewayStatus?: string
): PaymentFeedback {
  const normalizedGatewayStatus = gatewayStatus?.trim().toLowerCase();

  if (paymentStatus === 'PAID') {
    return {
      kind: 'paid',
      title: 'Pembayaran berhasil',
      detail: 'Pembayaran sudah dikonfirmasi dan pesanan diteruskan ke cabang.',
      canInitializePayment: false,
    };
  }

  if (paymentStatus === 'REFUNDED') {
    return {
      kind: 'refunded',
      title: 'Dana dikembalikan',
      detail:
        'Pembayaran berstatus refund. Waktu dana masuk mengikuti proses penyedia pembayaran.',
      canInitializePayment: false,
    };
  }

  if (normalizedGatewayStatus === 'expire') {
    return {
      kind: 'expired',
      title: 'Waktu pembayaran telah habis',
      detail:
        'Sesi pembayaran di penyedia telah kedaluwarsa. Pesanan ini tidak dapat dibayar ulang; buat pesanan baru dari menu.',
      canInitializePayment: false,
    };
  }

  if (
    paymentStatus === 'FAILED' ||
    (normalizedGatewayStatus &&
      FAILED_GATEWAY_STATES.has(normalizedGatewayStatus))
  ) {
    return {
      kind: 'failed',
      title: 'Pembayaran tidak dapat diproses',
      detail:
        'Penyedia pembayaran menolak atau membatalkan transaksi. Pesanan ini tidak dapat dibayar ulang; buat pesanan baru dari menu.',
      canInitializePayment: false,
    };
  }

  if (orderStatus === 'CANCELLED') {
    return {
      kind: 'cancelled',
      title: 'Pesanan dibatalkan',
      detail:
        'Pesanan tidak lagi aktif. Hubungi cabang bila Anda memerlukan bantuan.',
      canInitializePayment: false,
    };
  }

  return {
    kind: 'pending',
    title: 'Menunggu pembayaran',
    detail:
      'Buka halaman pembayaran untuk melihat QRIS, batas waktu, dan instruksi dari Midtrans. Status akan diperbarui setelah konfirmasi diterima.',
    canInitializePayment: !['CANCELLED', 'COMPLETED'].includes(orderStatus),
  };
}
