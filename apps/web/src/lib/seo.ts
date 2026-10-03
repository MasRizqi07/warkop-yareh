import type { Metadata } from 'next';
import { type VerifiedBranchFixture } from '@warkop-yareh/types';
import { SITE } from './constants';

export const PUBLIC_PATHS = [
  '/',
  '/menu',
  '/outlets',
  '/outlets/jetis-kulon',
  '/outlets/prapen',
  '/gallery',
  '/about',
  '/contact',
] as const;

export function pageMetadata(
  title: string,
  description: string,
  path: string
): Metadata {
  const url = new URL(path, SITE.url).href;
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      type: 'website',
      locale: 'id_ID',
      siteName: SITE.name,
      title,
      description,
      url,
    },
    twitter: { card: 'summary', title, description },
  };
}

export const PRIVATE_METADATA: Metadata = {
  robots: {
    index: false,
    follow: false,
    googleBot: { index: false, follow: false },
  },
  alternates: { canonical: null },
};

export function branchAddress(branch: VerifiedBranchFixture): string {
  const a = branch.address;
  return `${a.street}, ${a.subdistrict}, ${a.district}, ${a.city}, ${a.province} ${a.postalCode}`;
}

export function branchStructuredData(branch: VerifiedBranchFixture) {
  return {
    '@context': 'https://schema.org',
    '@type': 'CafeOrCoffeeShop',
    '@id': `${SITE.url}/outlets/${branch.slug}#business`,
    name: branch.name,
    url: `${SITE.url}/outlets/${branch.slug}`,
    address: {
      '@type': 'PostalAddress',
      streetAddress: branch.address.street,
      addressLocality: `${branch.address.subdistrict}, ${branch.address.city}`,
      addressRegion: branch.address.province,
      postalCode: branch.address.postalCode,
      addressCountry: 'ID',
    },
    openingHours: 'Mo-Su 00:00-24:00',
    ...(branch.phone ? { telephone: '+6282137354606' } : {}),
    hasMap: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(branch.plusCode)}`,
  };
}

export function serializeJsonLd(value: unknown): string {
  return JSON.stringify(value).replace(/</g, '\\u003c');
}

export function websiteStructuredData() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE.name,
    url: SITE.url,
  };
}
