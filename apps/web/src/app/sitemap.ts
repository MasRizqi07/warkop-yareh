import type { MetadataRoute } from 'next';
import { SITE } from '@/lib/constants';
import { PUBLIC_PATHS } from '@/lib/seo';

export default function sitemap(): MetadataRoute.Sitemap {
  return PUBLIC_PATHS.map((path) => ({ url: new URL(path, SITE.url).href }));
}
