import { useMessages, useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';

/**
 * Renders one of the three standalone legal pages (medical disclaimer, terms,
 * privacy) from `legal.<page>` in the message catalog.
 *
 * The three pages were near-identical JSX, so they share one renderer and the
 * prose lives entirely in the catalog. That is what makes them translatable at
 * all, but note what it does NOT make them: valid.
 *
 * These are US-framed documents. A Brazilian or Mexican reader shown a
 * translated US disclaimer gets something that reads authoritative and is not.
 * Per the Phase 7 placement map in CLAUDE.md, the English copy is still awaiting
 * lawyer review; the pt and es catalogs need review per market, not a
 * translation pass. Until that happens those locales stay in `draftLocales`.
 */

interface LegalSection {
  title: string;
  // A body is usually one paragraph. Where a section needs several, it is an
  // array instead, so each entry stays its own translatable message.
  body: string | string[];
}

interface LegalContent {
  title: string;
  lastUpdated: string;
  intro: string[];
  sections: LegalSection[];
}

export function LegalPage({ page }: { page: 'disclaimer' | 'terms' | 'privacy' }) {
  const t = useTranslations(`legal.${page}`);
  const common = useTranslations('legal');

  // The section list is data, not a fixed set of keys, so it is read off the
  // raw messages. A translator can shorten or merge sections without the page
  // needing a code change; only the count has to match what they wrote.
  const messages = useMessages() as unknown as {
    legal: Record<string, LegalContent>;
  };
  const content = messages.legal[page];

  return (
    <main className="mx-auto max-w-2xl px-4 py-10 sm:py-14">
      <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
        {t('title')}
      </h1>
      <p className="mt-2 text-sm text-zinc-500">
        {common('lastUpdatedLabel', { date: t('lastUpdated') })}
      </p>

      <div className="mt-8 space-y-8 text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">
        {content.intro.map((_, i) => (
          <p key={i}>{t.rich(`intro.${i}`, RICH)}</p>
        ))}

        {content.sections.map((section, i) => (
          <section key={i}>
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
              {t(`sections.${i}.title`)}
            </h2>
            {Array.isArray(section.body) ? (
              <div className="mt-2 space-y-3">
                {section.body.map((_, j) => (
                  <p key={j}>{t.rich(`sections.${i}.body.${j}`, RICH)}</p>
                ))}
              </div>
            ) : (
              <p className="mt-2">{t.rich(`sections.${i}.body`, RICH)}</p>
            )}
          </section>
        ))}
      </div>
    </main>
  );
}

/**
 * Tags a legal body may use. Named rather than positional so a translator can
 * move the link anywhere the target language needs it.
 */
const RICH = {
  b: (chunks: React.ReactNode) => <span className="font-medium">{chunks}</span>,
  disclaimerLink: (chunks: React.ReactNode) => (
    <Link href="/disclaimer" className="underline">
      {chunks}
    </Link>
  ),
  privacyLink: (chunks: React.ReactNode) => (
    <Link href="/privacy" className="underline">
      {chunks}
    </Link>
  ),
};
