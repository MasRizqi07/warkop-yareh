import type { Metadata, Viewport } from 'next';
import { Plus_Jakarta_Sans, Inter, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';
import { SITE } from '@/lib/constants';
import { UniversalHeader } from '@/components/layout/UniversalHeader';
import { CartDrawer } from '@/components/cart/CartDrawer';
import { PwaBottomDock } from '@/components/navigation/PwaBottomDock';
import { PwaRegister } from '@/components/pwa/PwaRegister';
import { serializeJsonLd, websiteStructuredData } from '@/lib/seo';

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
    'warkop prapen',
    'warkop jetis kulon',
    'warkop 24 jam surabaya',
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
  },
  twitter: {
    card: 'summary',
    title: `${SITE.name} — ${SITE.tagline}`,
    description: SITE.description,
  },
  robots: {
    index: process.env.VERCEL_ENV !== 'preview',
    follow: true,
    googleBot: {
      index: process.env.VERCEL_ENV !== 'preview',
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  alternates: {
    canonical: SITE.url,
  },
  manifest: '/manifest.webmanifest',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: SITE.name,
  },
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
          dangerouslySetInnerHTML={{
            __html: serializeJsonLd(websiteStructuredData()),
          }}
          suppressHydrationWarning={true}
        />
      </head>
      <body
        className={`${plusJakartaSans.variable} ${inter.variable} ${jetBrainsMono.variable} min-h-screen bg-canvas-obsidian text-on-surface antialiased selection:bg-primary-container selection:text-on-primary-container`}
      >
        <Providers>
          <a href="#main-content" className="skip-link">
            Lewati ke konten utama
          </a>
          <PwaRegister />
          <UniversalHeader />
          {children}
          <CartDrawer />
          <PwaBottomDock />
        </Providers>
      </body>
    </html>
  );
}
