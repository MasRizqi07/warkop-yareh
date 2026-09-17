/* ============================================
   WARKOP YA'REH DIGITAL PLATFORM — CONSTANTS
   ============================================ */

function httpUrl(value: string | undefined, fallback = ''): string {
  try {
    const url = new URL(value?.trim() || fallback);
    return url.protocol === 'http:' || url.protocol === 'https:'
      ? url.toString().replace(/\/$/, '')
      : fallback;
  } catch {
    return fallback;
  }
}

export const SITE = {
  name: "Warkop Ya'reh",
  tagline: 'Ngopi, Makan, Nongkrong. 24 Jam.',
  description:
    "Informasi resmi Warkop Ya'reh Surabaya — kedai kopi 24 jam di Jetis Kulon (Wonokromo) dan Prapen (Tenggilis Mejoyo).",
  url: httpUrl(process.env.NEXT_PUBLIC_SITE_URL, 'http://localhost:3000'),
  email: process.env.NEXT_PUBLIC_CONTACT_EMAIL?.trim() || '',
  phone: process.env.NEXT_PUBLIC_CONTACT_PHONE?.trim() || '0821-3735-4606',
  whatsapp: (process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '').replace(/\D/g, ''),
  social: {
    instagram: httpUrl(process.env.NEXT_PUBLIC_INSTAGRAM_URL),
    tiktok: httpUrl(process.env.NEXT_PUBLIC_TIKTOK_URL),
    twitter: httpUrl(process.env.NEXT_PUBLIC_TWITTER_URL),
    youtube: httpUrl(process.env.NEXT_PUBLIC_YOUTUBE_URL),
  },
} as const;

export const NAV_LINKS = [
  { label: 'Menu', href: '/menu', icon: 'Coffee' },
  { label: 'Cabang', href: '/outlets', icon: 'MapPin' },
  { label: 'Galeri', href: '/gallery', icon: 'Image' },
  { label: 'Tentang', href: '/about', icon: 'Info' },
  { label: 'Kontak', href: '/contact', icon: 'Phone' },
] as const;
