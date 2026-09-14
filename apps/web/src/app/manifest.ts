import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Warkop Ya'reh — Specialty Coffee & Coworking",
    short_name: "Warkop Ya'reh",
    description:
      'A Premium, Design-Driven Community Specialty Coffee Shop & Coworking Ecosystem.',
    start_url: '/',
    display: 'standalone',
    background_color: '#14110e',
    theme_color: '#c27803',
    icons: [
      {
        src: '/icons/icon-192x192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icons/icon-512x512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icons/icon-maskable-512x512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
  };
}

