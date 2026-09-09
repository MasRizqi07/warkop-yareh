const LOCAL_ADMIN_URL = 'http://localhost:3001';

export function getAdminUrl(path = '/'): string {
  const configured = process.env.NEXT_PUBLIC_ADMIN_URL?.trim() || LOCAL_ADMIN_URL;
  try {
    const base = new URL(configured);
    if (base.protocol !== 'http:' && base.protocol !== 'https:') return new URL(path, LOCAL_ADMIN_URL).toString();
    return new URL(path.startsWith('/') ? path : `/${path}`, base.origin).toString();
  } catch {
    return new URL(path, LOCAL_ADMIN_URL).toString();
  }
}
