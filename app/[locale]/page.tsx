import { useTranslations } from 'next-intl';
import { setRequestLocale } from 'next-intl/server';
import { use } from 'react';
import { Link } from '@/i18n/navigation';
import { Buddy } from '@/components/buddy';
import { CommunityCTA } from '@/components/community-cta';

/**
 * BuddyPept homepage.
 *
 * Brand-aligned marketing copy (calm, kind, precise; no medical claims, no
 * dose recommendations, no selling). Carries the mission, the "we give, they
 * sell" zag, and the "the math doesn't lie" trueline. Copy now lives in
 * messages/<locale>.json under the `home` namespace.
 *
 * Phase 7 placeholder: [MEDICAL_DISCLAIMER_FOOTER] in the site-wide footer,
 * per the Disclaimer & Legal Placement Map in CLAUDE.md.
 *
 * Styling: minimal Tailwind. Final visual identity + character art come in
 * Phase 6 (Wheeler / Archetype).
 */

export default function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = use(params);
  setRequestLocale(locale);
  const t = useTranslations('home');

  return (
    <div className="flex min-h-full flex-1 flex-col">
      <main className="flex-1">
        {/* ───── Hero ───── */}
        <section className="border-b border-zinc-200/70 bg-gradient-to-b from-brand-50 to-background dark:border-zinc-800 dark:from-brand-950/30 dark:to-background">
          <div className="mx-auto max-w-3xl px-4 pt-14 pb-14 text-center sm:pt-20 sm:pb-20">
          <Buddy className="mx-auto mb-6 h-24 w-auto drop-shadow-sm" />
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            {t('heroTitle')}
          </h1>
          <p className="mx-auto mt-5 max-w-xl whitespace-pre-line text-lg leading-relaxed text-zinc-600 dark:text-zinc-400">
            {t('heroBody')}
          </p>
          <div className="mt-8">
            <Link
              href="/calculator"
              className="inline-flex items-center gap-2 rounded-lg bg-brand-600 px-6 py-3 text-base font-semibold text-white shadow-sm transition hover:bg-brand-700"
            >
              {t('openCalculator')}
              <span aria-hidden>→</span>
            </Link>
          </div>
          </div>
        </section>

        {/* ───── The problem ───── */}
        <section className="bg-brand-50/50 dark:bg-brand-950/15">
          <div className="mx-auto max-w-2xl px-4 py-12 sm:py-16">
            <h2 className="text-2xl font-semibold tracking-tight">
              {t('problemTitle')}
            </h2>
            <p className="mt-4 whitespace-pre-line text-base leading-relaxed text-zinc-700 dark:text-zinc-300">
              {t('problemBody')}
            </p>
          </div>
        </section>

        {/* ───── What it is ───── */}
        <section className="mx-auto max-w-2xl px-4 py-12 sm:py-16">
          <h2 className="text-2xl font-semibold tracking-tight">
            {t('whatTitle')}
          </h2>
          <p className="mt-4 whitespace-pre-line text-base leading-relaxed text-zinc-700 dark:text-zinc-300">
            {t('whatBody')}
          </p>
          <p className="mt-6 text-lg font-semibold italic text-brand-700 dark:text-brand-400">
            {t('trueline')}
          </p>
        </section>

        {/* ───── How it works ───── */}
        <section className="bg-brand-50/50 dark:bg-brand-950/15">
          <div className="mx-auto max-w-2xl px-4 py-12 sm:py-16">
            <h2 className="text-2xl font-semibold tracking-tight">
              {t('howTitle')}
            </h2>
            <ol className="mt-6 space-y-5">
              <HowStep n={1} text={t('howStep1')} />
              <HowStep n={2} text={t('howStep2')} />
              <HowStep n={3} text={t('howStep3')} />
            </ol>
          </div>
        </section>

        {/* ───── Bottom CTA ───── */}
        <section className="border-t border-zinc-200 dark:border-zinc-800">
          <div className="mx-auto max-w-2xl px-4 py-14 text-center sm:py-20">
            <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
              {t('closingTitle')}
            </h2>
            <div className="mt-8">
              <Link
                href="/calculator"
                className="inline-flex items-center gap-2 rounded-lg bg-brand-600 px-6 py-3 text-base font-semibold text-white shadow-sm transition hover:bg-brand-700"
              >
                {t('openCalculator')}
                <span aria-hidden>→</span>
              </Link>
            </div>
          </div>
        </section>

        <CommunityCTA />
      </main>
    </div>
  );
}

function HowStep({ n, text }: { n: number; text: string }) {
  return (
    <li className="flex gap-4">
      <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-brand-600 text-sm font-semibold text-white">
        {n}
      </span>
      <span className="pt-1 text-base leading-relaxed text-zinc-700 dark:text-zinc-300">
        {text}
      </span>
    </li>
  );
}
