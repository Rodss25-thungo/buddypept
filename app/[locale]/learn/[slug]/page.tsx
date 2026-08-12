import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getTranslations, setRequestLocale, getFormatter } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { getPeptideBySlug } from '@/data/peptides';
import { LEARN_SLUGS, EDUCATION_FIELDS, isLearnSlug } from '@/data/peptide-education';
import { LearnGate } from '@/components/learn-gate';
import { routing } from '@/i18n/routing';

/** Every peptide in every locale, prerendered. */
export function generateStaticParams() {
  return routing.locales.flatMap((locale) =>
    LEARN_SLUGS.map((slug) => ({ locale, slug }))
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const t = await getTranslations({ locale, namespace: 'meta' });
  const peptide = getPeptideBySlug(slug);
  if (!peptide) return { title: t('learnTitle') };
  return {
    title: t('learnEntryTitle', { name: peptide.name }),
    description: t('learnEntryDescription', { name: peptide.name }),
  };
}

export default async function LearnEntryPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const peptide = getPeptideBySlug(slug);
  if (!peptide || !isLearnSlug(slug)) notFound();

  const t = await getTranslations('learn');
  const edu = await getTranslations(`peptideEducation.${slug}`);
  const tStatus = await getTranslations('legalStatus');
  const format = await getFormatter();

  const isResearchChemical = peptide.legalStatus === 'research-chemical';

  // "2026-05-18" reads as a different date depending on the reader's
  // conventions, so the review date is formatted for the locale rather than
  // printed raw. Parsed as UTC noon so a timezone offset cannot shift the day.
  const reviewed = format.dateTime(
    new Date(`${peptide.legalStatusLastUpdated}T12:00:00Z`),
    { year: 'numeric', month: 'long', day: 'numeric' }
  );

  return (
    <main className="mx-auto max-w-2xl px-4 py-10 sm:py-14">
      <Link href="/learn" className="text-sm font-medium text-brand-700 hover:underline dark:text-brand-400">
        ← {t('backToAll')}
      </Link>

      <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">{peptide.name}</h1>
      {peptide.aliases && peptide.aliases.length > 0 && (
        <p className="mt-1 text-sm text-zinc-500">
          {t('alsoCalled', { aliases: peptide.aliases.join(', ') })}
        </p>
      )}
      <p className="mt-4 text-base leading-relaxed text-zinc-700 dark:text-zinc-300">
        {edu('teaser')}
      </p>

      <div className="mt-8">
        <LearnGate source={peptide.name}>
          <div className="space-y-8 text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">
            {/* whatItIs, studiedFor, howSold. bottomLine renders after the
                legal status, so it is not part of this loop. */}
            {EDUCATION_FIELDS.filter((f) => f !== 'bottomLine').map((field) => (
              <Section key={field} title={t(field)}>
                {edu(field)}
              </Section>
            ))}
            <Section title={t('legalStatus')}>
              {/*
                One message with placeholders rather than sentence fragments
                joined in JSX. The old version concatenated three pieces, which
                locks in English word order and leaves a translator no way to
                move the clauses.
              */}
              {t(isResearchChemical ? 'legalBodyResearch' : 'legalBody', {
                status: tStatus(peptide.legalStatus),
                date: reviewed,
              })}
            </Section>
            <Section title={t('bottomLine')}>{edu('bottomLine')}</Section>

            <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-3 text-xs leading-relaxed text-zinc-600 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400">
              {t('disclaimer')}
            </div>

            <div className="text-center">
              <Link
                href="/calculator"
                className="inline-flex items-center gap-2 rounded-lg bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-700"
              >
                {t('doTheMath')} <span aria-hidden>→</span>
              </Link>
            </div>
          </div>
        </LearnGate>
      </div>
    </main>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">{title}</h2>
      <p className="mt-2">{children}</p>
    </section>
  );
}
