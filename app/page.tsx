import Link from 'next/link';
import { Buddy } from '@/components/buddy';
import { CommunityCTA } from '@/components/community-cta';

/**
 * BuddyPept homepage.
 *
 * Brand-aligned marketing copy (calm, kind, precise; no medical claims, no
 * dose recommendations, no selling). Carries the mission, the "we give, they
 * sell" zag, and the "the math doesn't lie" trueline.
 *
 * Phase 7 placeholder: [MEDICAL_DISCLAIMER_FOOTER] in the site-wide footer,
 * per the Disclaimer & Legal Placement Map in CLAUDE.md.
 *
 * Styling: minimal Tailwind. Final visual identity + character art come in
 * Phase 6 (Wheeler / Archetype).
 */

export default function HomePage() {
  return (
    <div className="flex min-h-full flex-1 flex-col">
      <main className="flex-1">
        {/* ───── Hero ───── */}
        <section className="border-b border-zinc-200/70 bg-gradient-to-b from-brand-50 to-background dark:border-zinc-800 dark:from-brand-950/30 dark:to-background">
          <div className="mx-auto max-w-3xl px-4 pt-14 pb-14 text-center sm:pt-20 sm:pb-20">
          <Buddy className="mx-auto mb-6 h-24 w-auto drop-shadow-sm" />
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            Turn any dose into the exact amount to draw.
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-lg leading-relaxed text-zinc-600 dark:text-zinc-400">
            A free calculator for people new to peptides. Enter what&rsquo;s in
            the vial and the dose, and see the exact amount to draw on the
            syringe, in mcg, mg, or units. No sign-up. Just the math.
          </p>
          <div className="mt-8">
            <Link
              href="/calculator"
              className="inline-flex items-center gap-2 rounded-lg bg-brand-600 px-6 py-3 text-base font-semibold text-white shadow-sm transition hover:bg-brand-700"
            >
              Open the calculator
              <span aria-hidden>→</span>
            </Link>
          </div>
          </div>
        </section>

        {/* ───── The problem ───── */}
        <section className="bg-brand-50/50 dark:bg-brand-950/15">
          <div className="mx-auto max-w-2xl px-4 py-12 sm:py-16">
            <h2 className="text-2xl font-semibold tracking-tight">
              mg, mcg, units. Where it gets confusing.
            </h2>
            <p className="mt-4 text-base leading-relaxed text-zinc-700 dark:text-zinc-300">
              A vial, some bacteriostatic water, a syringe, and a pile of
              numbers that don&rsquo;t obviously fit together. mg? mcg? units?
              The internet is full of bro-science, sketchy vendors, and people
              trying to sell something. BuddyPept just explains the math,
              clearly.
            </p>
          </div>
        </section>

        {/* ───── What it is ───── */}
        <section className="mx-auto max-w-2xl px-4 py-12 sm:py-16">
          <h2 className="text-2xl font-semibold tracking-tight">
            What BuddyPept is
          </h2>
          <p className="mt-4 text-base leading-relaxed text-zinc-700 dark:text-zinc-300">
            BuddyPept is a free calculator and plain-English guide for people
            new to peptides. Enter what&rsquo;s in a vial and a dose, and it
            shows exactly how much that works out to, in whatever unit a syringe
            uses. That&rsquo;s the whole thing.
          </p>
          <p className="mt-6 text-lg font-semibold italic text-brand-700 dark:text-brand-400">
            The math doesn&rsquo;t lie.
          </p>
        </section>

        {/* ───── How it works ───── */}
        <section className="bg-brand-50/50 dark:bg-brand-950/15">
          <div className="mx-auto max-w-2xl px-4 py-12 sm:py-16">
            <h2 className="text-2xl font-semibold tracking-tight">
              How it works
            </h2>
            <ol className="mt-6 space-y-5">
              <HowStep
                n={1}
                text="Pick a peptide, or request one that's not listed yet."
              />
              <HowStep
                n={2}
                text="Enter the vial amount, the bacteriostatic water, and a dose."
              />
              <HowStep
                n={3}
                text="See it in mcg, mg, and syringe units, clearly explained."
              />
            </ol>
          </div>
        </section>

        {/* ───── Bottom CTA ───── */}
        <section className="border-t border-zinc-200 dark:border-zinc-800">
          <div className="mx-auto max-w-2xl px-4 py-14 text-center sm:py-20">
            <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
              Turn peptide-curious into peptide-confident.
            </h2>
            <div className="mt-8">
              <Link
                href="/calculator"
                className="inline-flex items-center gap-2 rounded-lg bg-brand-600 px-6 py-3 text-base font-semibold text-white shadow-sm transition hover:bg-brand-700"
              >
                Open the calculator
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
