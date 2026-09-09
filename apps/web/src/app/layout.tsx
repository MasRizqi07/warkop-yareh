import type { Metadata, Viewport } from 'next';
import { Plus_Jakarta_Sans, Inter, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';
import { SITE } from '@/lib/constants';
import { UniversalHeader } from '@/components/layout/UniversalHeader';
import { CartDrawer } from '@/components/cart/CartDrawer';
import { PwaBottomDock } from '@/components/navigation/PwaBottomDock';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#f8f5f0' },
    { media: '(prefers-color-scheme: dark)', color: '#14110e' },
  ],
};

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: '--font-heading-google',
  subsets: ['latin'],
});

const inter = Inter({
  variable: '--font-body-google',
  subsets: ['latin'],
});

const jetBrainsMono = JetBrains_Mono({
  variable: '--font-mono-google',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: `${SITE.name} — ${SITE.tagline}`,
    template: `%s | ${SITE.name}`,
  },
  description: SITE.description,
  keywords: [
    'warkop yareh surabaya',
    'warkop wonokromo',
    'coffee shop surabaya',
    'tempat nongkrong surabaya',
    'coworking space surabaya',
    'cafe premium surabaya',
    'community hub surabaya',
    'event space surabaya',
    'kopi specialty surabaya',
    'warkop modern surabaya',
  ],
  authors: [{ name: SITE.name }],
  creator: SITE.name,
  openGraph: {
    type: 'website',
    locale: 'id_ID',
    url: SITE.url,
    siteName: SITE.name,
    title: `${SITE.name} — ${SITE.tagline}`,
    description: SITE.description,
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: SITE.name,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: `${SITE.name} — ${SITE.tagline}`,
    description: SITE.description,
    images: ['/og-image.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  alternates: {
    canonical: SITE.url,
  },
};

// JSON-LD Structured Data
const socialProfiles = Object.values(SITE.social).filter(Boolean);
const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'CafeOrCoffeeShop',
  name: SITE.name,
  description: SITE.description,
  url: SITE.url,
  ...(SITE.phone ? { telephone: SITE.phone } : {}),
  ...(SITE.email ? { email: SITE.email } : {}),
  priceRange: '$$',
  servesCuisine: ['Coffee', 'Indonesian Food', 'Pastry'],
  hasMenu: `${SITE.url}/menu`,
  acceptsReservations: true,
  ...(socialProfiles.length ? { sameAs: socialProfiles } : {}),
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="id"
      className="dark"
      data-theme="dark"
      data-scroll-behavior="smooth"
      suppressHydrationWarning
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
          suppressHydrationWarning={true}
        />
      </head>
      <body
        className={`${plusJakartaSans.variable} ${inter.variable} ${jetBrainsMono.variable} min-h-screen bg-canvas-obsidian text-on-surface antialiased selection:bg-primary-container selection:text-on-primary-container`}
      >
        <Providers>
          <UniversalHeader />
          {children}
          <CartDrawer />
          <PwaBottomDock />
        </Providers>
      </body>
    </html>
  );
}
