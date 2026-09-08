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
  tagline: 'Lebih dari Sekadar Warkop',
  description:
    "Platform digital ekosistem Warkop Ya'reh Wonokromo — kopi premium, coworking space, community hub, loyalty rewards, dan event platform di Surabaya.",
  url: httpUrl(process.env.NEXT_PUBLIC_SITE_URL, 'http://localhost:3000'),
  email: process.env.NEXT_PUBLIC_CONTACT_EMAIL?.trim() || '',
  phone: process.env.NEXT_PUBLIC_CONTACT_PHONE?.trim() || '',
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
  { label: 'Workspace & VIP', href: '/booking', icon: 'CalendarCheck' },
  { label: 'Community Hub', href: '/community', icon: 'Users' },
  { label: 'Loyalty Tier', href: '/loyalty', icon: 'Award' },
  { label: 'About', href: '/about', icon: 'Info' },
] as const;
