import { getRequestConfig } from 'next-intl/server';
import { hasLocale } from 'next-intl';
import { routing, localeLang, type Locale } from './routing';

/**
 * Loads the message catalog for the request's locale.
 *
 * English is always loaded underneath as a fallback layer, so a key that is
 * missing from pt.json or es.json falls back to readable English instead of
 * rendering the raw key. That matters while the catalogs are still being
 * filled in: a half-translated page shows real sentences, not `home.hero.title`.
 */
export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale: Locale = hasLocale(routing.locales, requested)
    ? requested
    : routing.defaultLocale;

  const en = (await import('../messages/en.json')).default;
  const messages =
    locale === 'en'
      ? en
      : deepMerge(en, (await import(`../messages/${locale}.json`)).default);

  return {
    locale,
    messages,
    // Dates and numbers follow the full regional tag, not the short URL code.
    // This is what turns "12.5 units" into "12,5" for pt-BR and es-419 readers.
    formats: {
      number: {
        dose: { maximumFractionDigits: 3 },
      },
    },
    now: new Date(),
    timeZone: 'UTC',
    getMessageFallback: ({ key }) => key,
    onError: () => {
      // A missing translation is expected while catalogs are in draft. Staying
      // quiet here keeps the build log readable; the English fallback above is
      // what the reader actually sees.
    },
    // Exposed so components can format numbers with the regional tag.
    ...{ localeTag: localeLang[locale] },
  };
});

type JsonValue = string | JsonValue[] | { [key: string]: JsonValue };
type Json = { [key: string]: JsonValue };

/**
 * Overlays translated keys on top of English, so gaps fall back to English.
 *
 * Arrays are replaced wholesale rather than merged element by element. The
 * legal pages store their sections as arrays, and a translator who merges two
 * sections into one should get their shorter list, not their list padded back
 * out with leftover English entries from the end of the English one.
 */
function deepMerge(base: Json, over: Json): Json {
  const out: Json = { ...base };
  for (const [key, value] of Object.entries(over)) {
    const prev = out[key];
    const mergeable =
      isPlainObject(value) && isPlainObject(prev);
    out[key] = mergeable ? deepMerge(prev, value) : value;
  }
  return out;
}

function isPlainObject(v: JsonValue | undefined): v is Json {
  return typeof v === 'object' && v !== null && !Array.isArray(v);
}
