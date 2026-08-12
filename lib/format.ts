import { localeLang, routing, type Locale } from '@/i18n/routing';

/**
 * Locale-aware number formatting for the calculator.
 *
 * Why this file exists
 * ────────────────────
 * The old formatter ended in `.toString()`, which always writes a "." decimal
 * separator regardless of who is reading. In pt-BR and es-419 the decimal
 * separator is a comma and "." is a thousands separator, so an untranslated
 * "12.5 units" is read by a Brazilian user as twelve-point-five only if they
 * happen to know the app is American. Read as local notation it is 125.
 *
 * A tenfold dosing error is the exact failure "the math doesn't lie" exists to
 * prevent, so every number the calculator shows a reader goes through here.
 *
 * `useGrouping: false` throughout. Grouping separators are the ambiguous part:
 * "2.500" is two-and-a-half in pt-BR and two-thousand-five-hundred in en-US.
 * Dosing numbers are small enough that grouping buys nothing and risks
 * everything, so it is off in every locale, including English.
 */

function tagFor(locale: string): string {
  return localeLang[locale as Locale] ?? localeLang[routing.defaultLocale];
}

/**
 * Format a value for display, trimming trailing zeros so 12.50 reads "12,5".
 *
 * @param locale  the short URL locale ("en" | "pt" | "es")
 * @param n       the value
 * @param decimals  maximum decimal places to keep
 */
export function formatNum(locale: string, n: number, decimals: number): string {
  if (!Number.isFinite(n)) return '';
  return new Intl.NumberFormat(tagFor(locale), {
    maximumFractionDigits: decimals,
    useGrouping: false,
  }).format(n);
}

/**
 * Full precision, for values that must not be silently rounded.
 *
 * Six decimals matches the previous behaviour. Per the calculator-precision
 * rule, rounding is never allowed to happen quietly; anything that rounds for
 * display says so in the surrounding copy.
 */
export function formatExact(locale: string, n: number): string {
  if (!Number.isFinite(n)) return '';
  return new Intl.NumberFormat(tagFor(locale), {
    maximumFractionDigits: 6,
    useGrouping: false,
  }).format(n);
}

/**
 * The decimal separator this locale writes, e.g. "." for en, "," for pt.
 *
 * Used to label numeric inputs, so someone typing a fractional dose is told
 * which character the field accepts before they get it wrong.
 */
export function decimalSeparator(locale: string): string {
  return (
    new Intl.NumberFormat(tagFor(locale))
      .formatToParts(1.1)
      .find((part) => part.type === 'decimal')?.value ?? '.'
  );
}

/**
 * Parse what a reader typed, accepting either separator.
 *
 * `<input type="number">` reports its value through the DOM as a "."-decimal
 * string no matter the display locale, but readers also paste and retype
 * values, and some mobile keyboards emit the local separator. Accepting both
 * is safe here because grouping separators are never used in these fields:
 * with no grouping, a lone "," or "." can only be a decimal point.
 *
 * Returns NaN for anything unparseable, which every call site already treats
 * as "not ready to calculate" rather than as zero.
 */
export function parseNum(raw: string): number {
  const trimmed = raw.trim();
  if (trimmed === '') return NaN;
  const normalized = trimmed.replace(',', '.');
  // Reject strings with more than one separator ("1.2.3", "1,2,3") instead of
  // letting parseFloat silently truncate them to 1.2.
  if ((normalized.match(/\./g) ?? []).length > 1) return NaN;
  return Number(normalized);
}
