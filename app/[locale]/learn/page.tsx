import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { useTranslations } from 'next-intl';
import { use } from 'react';
import { Link } from '@/i18n/navigation';
import { getPeptideBySlug } from '@/data/peptides';
import { LEARN_SLUGS } from '@/data/peptide-education';
import { LearnGate } from '@/components/learn-gate';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'meta' });
  return { title: t('learnTitle'), description: t('learnDescription') };
}

export default function LearnIndexPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = use(params);
  setRequestLocale(locale);
  const t = useTranslations('learn');
  // Teasers come from the catalog so the library index reads in the visitor's
  // language; the peptide's name stays as-is, being a proper noun.
  const edu = useTranslations('peptideEducation');

  const entries = LEARN_SLUGS.map((slug) => ({
    slug,
    peptide: getPeptideBySlug(slug),
  })).filter((e) => e.peptide);

  return (
    <main className="mx-auto max-w-2xl px-4 py-10 sm:py-14">
      <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
        {t('title')}
      </h1>
      <p className="mt-3 text-base leading-relaxed text-zinc-600 dark:text-zinc-400">
        {t('intro')}
      </p>

      <div className="mt-8">
        <LearnGate source="library">
          <ul className="space-y-3">
            {entries.map(({ slug, peptide }) => (
              <li key={slug}>
                <Link
                  href={`/learn/${slug}`}
                  className="flex items-center justify-between rounded-xl border border-zinc-200 bg-white px-4 py-4 transition hover:border-brand-300 hover:bg-brand-50/40 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-brand-800"
                >
                  <span>
                    <span className="block text-base font-semibold">{peptide!.name}</span>
                    <span className="mt-0.5 block text-sm text-zinc-500">
                      {edu(`${slug}.teaser`)}
                    </span>
                  </span>
                  <span aria-hidden className="ml-3 text-brand-600">
                    →
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </LearnGate>
      </div>

      <div className="mt-10 rounded-xl border border-zinc-200 bg-brand-50/50 p-5 text-center dark:border-zinc-800 dark:bg-brand-950/20">
        <p className="text-base font-medium">{t('mathTitle')}</p>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          {t('mathBody')}
        </p>
        <Link
          href="/calculator"
          className="mt-4 inline-flex items-center gap-2 rounded-lg bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-700"
        >
          {t('openCalculator')} <span aria-hidden>→</span>
        </Link>
      </div>
    </main>
  );
}
