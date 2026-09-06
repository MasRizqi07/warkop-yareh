export function assertPaymentRedirect(url: string | null): string {
  if (!url) throw new Error('Tautan pembayaran belum tersedia. Silakan coba lagi.');
  const parsed = new URL(url);
  if (parsed.protocol !== 'https:' || !['app.midtrans.com', 'app.sandbox.midtrans.com'].includes(parsed.hostname) || parsed.username || parsed.password) throw new Error('Tautan pembayaran tidak valid.');
  return parsed.href;
}
