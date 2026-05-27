import type { Metadata } from 'next';
import Link from 'next/link';
import { getPeptideBySlug } from '@/data/peptides';
import { PEPTIDE_EDUCATION, LEARN_SLUGS } from '@/data/peptide-education';
import { LearnGate } from '@/components/learn-gate';

export const metadata: Metadata = {
  title: 'Learn about peptides | BuddyPept',
  description:
    'Plain-English, factual summaries of common peptides: what they are, what they have been studied for, how they are sold, and their legal status. Education only.',
};

export default function LearnIndexPage() {
  const entries = LEARN_SLUGS.map((slug) => ({
    slug,
    peptide: getPeptideBySlug(slug),
    edu: PEPTIDE_EDUCATION[slug],
  })).filter((e) => e.peptide && e.edu);

  return (
    <main className="mx-auto max-w-2xl px-4 py-10 sm:py-14">
      <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
        Learn about peptides
      </h1>
      <p className="mt-3 text-base leading-relaxed text-zinc-600 dark:text-zinc-400">
        Plain-English, factual summaries: what each peptide is, what it has been
        studied for, how it is sold, and its legal status. Education only, never
        medical advice, and never a recommendation to use anything.
      </p>

      <div className="mt-8">
        <LearnGate source="library">
          <ul className="space-y-3">
            {entries.map(({ slug, peptide, edu }) => (
              <li key={slug}>
                <Link
                  href={`/learn/${slug}`}
                  className="flex items-center justify-between rounded-xl border border-zinc-200 bg-white px-4 py-4 transition hover:border-brand-300 hover:bg-brand-50/40 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-brand-800"
                >
                  <span>
                    <span className="block text-base font-semibold">{peptide!.name}</span>
                    <span className="mt-0.5 block text-sm text-zinc-500">{edu!.teaser}</span>
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
        <p className="text-base font-medium">Need the dosing math?</p>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          The calculator is free and needs no sign-up.
        </p>
        <Link
          href="/calculator"
          className="mt-4 inline-flex items-center gap-2 rounded-lg bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-700"
        >
          Open the calculator <span aria-hidden>→</span>
        </Link>
      </div>
    </main>
  );
}
