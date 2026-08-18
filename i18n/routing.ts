import { defineRouting } from 'next-intl/routing';

/**
 * Locale routing for BuddyPept.
 *
 * English stays at the bare path (`/calculator`), Portuguese and Spanish live
 * under a prefix (`/pt/calculator`, `/es/calculator`). `localePrefix: 'as-needed'`
 * is what keeps the English URLs exactly as they were, so nothing that is
 * already indexed or already emailed out breaks.
 *
 * The short codes are the URL segments. The full BCP 47 tags in `localeLang`
 * are what goes in `<html lang>` and `hreflang`, because "pt" and "es" are too
 * coarse to tell a screen reader or a search engine which variant this is.
 * pt-BR is Brazilian Portuguese; es-419 is the standard tag for Latin American
 * Spanish.
 */
export const routing = defineRouting({
  locales: ['en', 'pt', 'es'],
  defaultLocale: 'en',
  localePrefix: 'as-needed',
  // Rod's call: do not auto-redirect people based on their browser language.
  // Someone on a Portuguese phone who typed buddypept.com should land on the
  // page they asked for. The language switcher is the way in, and the choice
  // is remembered in the NEXT_LOCALE cookie once they make it.
  localeDetection: false,
});

export type Locale = (typeof routing.locales)[number];

/** BCP 47 tags for `<html lang>`, `hreflang`, and Intl number formatting. */
export const localeLang: Record<Locale, string> = {
  en: 'en-US',
  pt: 'pt-BR',
  es: 'es-419',
};

/** Names shown in the language switcher, each written in its own language. */
export const localeName: Record<Locale, string> = {
  en: 'English',
  pt: 'Português',
  es: 'Español',
};

/**
 * Locales whose copy is still English placeholder text. While a locale is
 * listed here it is reachable only by typing the URL: it is left out of the
 * language switcher, the sitemap, and the hreflang tags, so no one lands on a
 * half-translated page by accident and no search engine indexes one.
 *
 * Remove a locale from this list when its catalog is actually translated and
 * reviewed. That single edit is what "launches" the language.
 *
 * pt and es were launched once their catalogs were translated in full and
 * rewritten into the institutional voice. The audience for both is Spanish- and
 * Portuguese-speaking readers in the United States, not other markets, so the
 * legal pages stay US-framed in every language: one jurisdiction, one FDA, one
 * emergency number.
 */
export const draftLocales: readonly Locale[] = [];

export function isLocaleLive(locale: Locale): boolean {
  return !draftLocales.includes(locale);
}

/** Locales ready to show the public. Drives the switcher and hreflang. */
export const liveLocales = routing.locales.filter(isLocaleLive);
