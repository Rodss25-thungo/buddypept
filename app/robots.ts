import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/seo';

/**
 * /robots.txt. The private admin area and API routes stay out of crawlers'
 * way. /confirm is left crawlable on purpose so its noindex tag is seen.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin', '/api/'],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
