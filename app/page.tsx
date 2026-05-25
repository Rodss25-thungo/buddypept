import Link from 'next/link';
import { Buddy } from '@/components/buddy';

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
            Peptide-curious? Meet your Buddy.
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-lg leading-relaxed text-zinc-600 dark:text-zinc-400">
            Free, clear answers to the question nobody wants to ask out loud:{' '}
            <em>how much do I actually draw?</em> No sales pitch. No sign-up
            wall. Just the math.
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
              The vial is open. Now what?
            </h2>
            <p className="mt-4 text-base leading-relaxed text-zinc-700 dark:text-zinc-300">
              You&rsquo;ve got a vial, some bacteriostatic water, and a syringe,
              and no idea how the three fit together. mg? mcg? units? The
              internet is full of bro-science, sketchy vendors, and people
              trying to sell you something. You just want a straight answer.
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
            new to peptides. Tell it what&rsquo;s in your vial and the dose you
            want, and it shows exactly how much to draw, in whatever unit your
            syringe uses. That&rsquo;s the whole thing.
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
                text="Pick your peptide, or type your own if it's not on the list."
              />
              <HowStep
                n={2}
                text="Enter your vial amount, your bacteriostatic water, and your dose."
              />
              <HowStep
                n={3}
                text="See it in mcg, mg, and syringe units, all at once, always in sync."
              />
            </ol>
          </div>
        </section>

        {/* ───── Why different ───── */}
        <section className="mx-auto max-w-2xl px-4 py-12 sm:py-16">
          <h2 className="text-2xl font-semibold tracking-tight">
            Why we&rsquo;re different
          </h2>
          <p className="mt-4 text-base leading-relaxed text-zinc-700 dark:text-zinc-300">
            Everyone else in peptides is selling something. We&rsquo;re not. The
            math stays free, forever. We don&rsquo;t harvest your health data.
            We don&rsquo;t tell you what to take. That&rsquo;s between you and
            your doctor. We just make the numbers make sense.
          </p>
          <p className="mt-6 text-lg font-semibold italic text-brand-700 dark:text-brand-400">
            The math doesn&rsquo;t lie.
          </p>
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
