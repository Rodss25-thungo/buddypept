import Link from 'next/link';

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

// Site-wide medical disclaimer. Draft wording modeled on standard
// educational-health-tool disclaimers (informational only, no doctor-patient
// relationship, consult a provider, limitation of liability, use at own risk).
// Final copy still needs a lawyer review before public launch (CLAUDE.md Phase 7).
const DISCLAIMER_FOOTER =
  'BuddyPept is an educational tool, not medical advice. It does the dosing math you enter; it does not diagnose, treat, prescribe, or recommend that you take any peptide. Using this site does not create a doctor-patient relationship. Peptides carry real risks and many are not approved for human use, so always consult a licensed healthcare provider before acting on anything here. You use this information at your own risk.';

export default function HomePage() {
  return (
    <div className="flex min-h-full flex-1 flex-col">
      <main className="flex-1">
        {/* ───── Hero ───── */}
        <section className="mx-auto max-w-3xl px-4 pt-16 pb-12 text-center sm:pt-24 sm:pb-16">
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
              className="inline-flex items-center gap-2 rounded-lg bg-zinc-900 px-6 py-3 text-base font-semibold text-white transition hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
            >
              Open the calculator
              <span aria-hidden>→</span>
            </Link>
          </div>
        </section>

        {/* ───── The problem ───── */}
        <section className="border-t border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900/40">
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
        <section className="border-t border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900/40">
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
          <p className="mt-6 text-lg font-medium italic text-zinc-900 dark:text-zinc-100">
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
                className="inline-flex items-center gap-2 rounded-lg bg-zinc-900 px-6 py-3 text-base font-semibold text-white transition hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
              >
                Open the calculator
                <span aria-hidden>→</span>
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* ───── Footer (site-wide disclaimer placeholder) ───── */}
      <footer className="border-t border-zinc-200 dark:border-zinc-800">
        <div className="mx-auto max-w-2xl px-4 py-8">
          <p className="text-xs leading-relaxed text-zinc-500">
            {DISCLAIMER_FOOTER}
          </p>
          <p className="mt-4 text-center text-xs text-zinc-500">
            BuddyPept. The math, free forever. © {new Date().getFullYear()}
          </p>
        </div>
      </footer>
    </div>
  );
}

function HowStep({ n, text }: { n: number; text: string }) {
  return (
    <li className="flex gap-4">
      <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-zinc-900 text-sm font-semibold text-white dark:bg-zinc-100 dark:text-zinc-900">
        {n}
      </span>
      <span className="pt-1 text-base leading-relaxed text-zinc-700 dark:text-zinc-300">
        {text}
      </span>
    </li>
  );
}
