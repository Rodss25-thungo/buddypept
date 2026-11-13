import type { MetadataRoute } from 'next';
import { liveLocales } from '@/i18n/routing';
import {
  SITE_URL,
  INDEXABLE_PATHS,
  localePath,
  languageAlternates,
} from '@/lib/seo';

/**
 * /sitemap.xml: every indexable page in every live locale, each entry carrying
 * its hreflang siblings. Draft locales stay out automatically via liveLocales.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const absolute = (p: string) => `${SITE_URL}${p === '/' ? '' : p}`;

  return INDEXABLE_PATHS.flatMap((path) => {
    const languages = Object.fromEntries(
      Object.entries(languageAlternates(path)).map(([lang, p]) => [
        lang,
        absolute(p),
      ])
    );
    return liveLocales.map((locale) => ({
      url: absolute(localePath(locale, path)),
      changeFrequency: path === '/' || path === '/calculator' ? 'weekly' : 'monthly',
      priority: path === '/' ? 1 : path === '/calculator' ? 0.9 : 0.6,
      alternates: { languages },
    }));
  });
}
