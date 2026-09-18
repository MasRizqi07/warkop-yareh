const WIB_TIME_ZONE = 'Asia/Jakarta';

export const formatWibDate = (date: Date) =>
  new Intl.DateTimeFormat('sv-SE', { timeZone: WIB_TIME_ZONE }).format(date);

export function isBookingStartFuture(
  date: string,
  startTime: string,
  now = new Date()
): boolean {
  return new Date(`${date}T${startTime}:00+07:00`).getTime() > now.getTime();
}

export function getFirstBookableDate(
  startTime: string,
  now = new Date()
): string {
  const today = formatWibDate(now);
  if (isBookingStartFuture(today, startTime, now)) return today;

  const tomorrow = new Date(`${today}T00:00:00+07:00`);
  tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);
  return formatWibDate(tomorrow);
}
