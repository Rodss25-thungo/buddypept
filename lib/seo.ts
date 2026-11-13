import type { Metadata } from 'next';
import { routing, localeLang, liveLocales, type Locale } from '@/i18n/routing';
import { LEARN_SLUGS } from '@/data/peptide-education';

/**
 * Search-engine plumbing shared by page metadata, the sitemap, and robots.txt.
 *
 * The production host is the www subdomain; the apex redirects there, so every
 * canonical, hreflang, and sitemap URL is written against www.
 */
export const SITE_URL = 'https://www.buddypept.com';

/**
 * Public, indexable paths in their unprefixed (English) form. /confirm and
 * /admin are deliberately absent: both are noindex.
 */
export const INDEXABLE_PATHS: readonly string[] = [
  '/',
  '/calculator',
  '/learn',
  ...LEARN_SLUGS.map((slug) => `/learn/${slug}`),
  '/disclaimer',
  '/privacy',
  '/terms',
];

/** `/calculator` in English, `/es/calculator` in Spanish, `/es` for home. */
export function localePath(locale: Locale, path: string): string {
  if (locale === routing.defaultLocale) return path;
  return path === '/' ? `/${locale}` : `/${locale}${path}`;
}

/** hreflang map for one page across the live locales, plus x-default. */
export function languageAlternates(path: string): Record<string, string> {
  return {
    ...Object.fromEntries(
      liveLocales.map((l) => [localeLang[l], localePath(l, path)])
    ),
    'x-default': localePath(routing.defaultLocale, path),
  };
}

/**
 * Canonical plus hreflang for a page. Relative URLs are resolved against
 * `metadataBase` in the locale layout, so the HTML carries absolute URLs.
 */
export function pageAlternates(
  locale: string,
  path: string
): Metadata['alternates'] {
  return {
    canonical: localePath(locale as Locale, path),
    languages: languageAlternates(path),
  };
}
