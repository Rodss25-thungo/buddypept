import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getPeptideBySlug, legalStatusLabel } from '@/data/peptides';
import { PEPTIDE_EDUCATION, LEARN_SLUGS } from '@/data/peptide-education';
import { LearnGate } from '@/components/learn-gate';

export function generateStaticParams() {
  return LEARN_SLUGS.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const peptide = getPeptideBySlug(slug);
  if (!peptide) return { title: 'Learn about peptides | BuddyPept' };
  return {
    title: `${peptide.name}: what it is | BuddyPept`,
    description: `Factual, plain-English overview of ${peptide.name}. Education only, not medical advice.`,
  };
}

export default async function LearnEntryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const peptide = getPeptideBySlug(slug);
  const edu = PEPTIDE_EDUCATION[slug];
  if (!peptide || !edu) notFound();

  const isResearchChemical = peptide.legalStatus === 'research-chemical';

  return (
    <main className="mx-auto max-w-2xl px-4 py-10 sm:py-14">
      <Link href="/learn" className="text-sm font-medium text-brand-700 hover:underline dark:text-brand-400">
        ← All peptides
      </Link>

      <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">{peptide.name}</h1>
      {peptide.aliases && peptide.aliases.length > 0 && (
        <p className="mt-1 text-sm text-zinc-500">Also called: {peptide.aliases.join(', ')}</p>
      )}
      <p className="mt-4 text-base leading-relaxed text-zinc-700 dark:text-zinc-300">{edu.teaser}</p>

      <div className="mt-8">
        <LearnGate source={peptide.name}>
          <div className="space-y-8 text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">
            <Section title="What it is">{edu.whatItIs}</Section>
            <Section title="What it has been studied for">{edu.studiedFor}</Section>
            <Section title="How it is usually sold">{edu.howSold}</Section>
            <Section title="Legal status">
              {legalStatusLabel(peptide.legalStatus)}.{' '}
              {isResearchChemical &&
                'Vendors sell it strictly as a research compound (“for research use only,” “not for human consumption”). '}
              Laws vary by location and change over time. Last reviewed:{' '}
              {peptide.legalStatusLastUpdated}.
            </Section>
            <Section title="The honest bottom line">{edu.bottomLine}</Section>

            <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-3 text-xs leading-relaxed text-zinc-600 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400">
              This is general education, not medical advice. BuddyPept does not
              sell peptides, is not affiliated with any seller, and does not tell
              anyone to use any peptide. Talk to a licensed healthcare provider.
            </div>

            <div className="text-center">
              <Link
                href="/calculator"
                className="inline-flex items-center gap-2 rounded-lg bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-700"
              >
                Do the dosing math <span aria-hidden>→</span>
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
