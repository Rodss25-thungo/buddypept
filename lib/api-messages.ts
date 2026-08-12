import { getTranslations } from 'next-intl/server';
import { routing, type Locale } from '@/i18n/routing';
import type { ZodError } from 'zod';

/**
 * Translated error messages for the JSON API routes.
 *
 * These strings are not internal: the signup forms render whatever `error` the
 * route returns straight into the page. A Portuguese reader filling in a
 * Portuguese form and getting back "Please enter a valid email address." is
 * the seam showing.
 *
 * API routes have no locale in their path (they sit outside app/[locale]), so
 * the locale arrives in the request body, posted by the form that knows which
 * language it is being read in. Anything missing or unrecognised falls back to
 * English.
 */

export function resolveLocale(locale?: string | null): Locale {
  return routing.locales.includes(locale as Locale)
    ? (locale as Locale)
    : routing.defaultLocale;
}

export async function apiErrors(locale?: string | null) {
  return getTranslations({
    locale: resolveLocale(locale),
    namespace: 'apiErrors',
  });
}

/**
 * Turns the first Zod issue into a translated sentence.
 *
 * Keyed off the field that failed rather than off Zod's own message, so the
 * schemas stay free of English copy and the wording lives in the catalog with
 * everything else.
 */
export function validationMessage(
  error: ZodError,
  t: Awaited<ReturnType<typeof apiErrors>>
): string {
  const field = error.issues[0]?.path[0];
  switch (field) {
    case 'name':
      return t('name');
    case 'email':
      return t('email');
    case 'requestedPeptide':
      return t('peptide');
    default:
      return t('checkEntries');
  }
}
