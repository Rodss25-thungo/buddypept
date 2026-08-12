'use client';

import { useLocale, useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';
import { useTransition } from 'react';
import { usePathname, useRouter } from '@/i18n/navigation';
import { liveLocales, localeName, type Locale } from '@/i18n/routing';

/**
 * Language switcher.
 *
 * Renders nothing while only one locale is live, so it stays invisible until a
 * translated catalog actually ships. Switching keeps the reader on the same
 * page rather than dumping them on the homepage, and next-intl's router writes
 * the NEXT_LOCALE cookie so the choice sticks on the next visit.
 *
 * A plain <select> on purpose: it is one tap on a phone, it is keyboard and
 * screen-reader accessible for free, and it needs no dropdown JavaScript.
 */
export function LanguageSwitcher() {
  const t = useTranslations('nav');
  const locale = useLocale() as Locale;
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams();
  const [isPending, startTransition] = useTransition();

  if (liveLocales.length < 2) return null;

  return (
    <label className="relative">
      <span className="sr-only">{t('chooseLanguage')}</span>
      <select
        value={locale}
        disabled={isPending}
        onChange={(event) => {
          const next = event.target.value as Locale;
          startTransition(() => {
            // `params` carries dynamic segments such as the peptide slug, so a
            // reader on /learn/bpc-157 lands on the same peptide, translated.
            router.replace(
              // @ts-expect-error pathname and params are correlated at runtime
              { pathname, params },
              { locale: next }
            );
          });
        }}
        className="cursor-pointer rounded-lg border border-zinc-300 bg-transparent py-1.5 pl-2.5 pr-7 text-sm font-medium text-zinc-700 transition hover:border-zinc-400 disabled:opacity-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:border-zinc-600"
      >
        {liveLocales.map((l) => (
          <option key={l} value={l}>
            {localeName[l]}
          </option>
        ))}
      </select>
    </label>
  );
}
