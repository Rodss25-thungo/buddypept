import Link from 'next/link';

/**
 * Site-wide footer. Carries the persistent medical disclaimer (per the Phase 7
 * Disclaimer & Legal Placement Map) plus links to the standalone legal pages.
 *
 * Disclaimer wording is draft, modeled on standard educational-health-tool
 * disclaimers, and still needs a lawyer review before public launch.
 */

const DISCLAIMER_FOOTER =
  'BuddyPept is an educational tool, not medical advice. It does the dosing math you enter; it does not diagnose, treat, prescribe, or recommend that you take any peptide. Using this site does not create a doctor-patient relationship. Peptides carry real risks and many are not approved for human use, so always consult a licensed healthcare provider before acting on anything here. You use this information at your own risk.';

export function SiteFooter() {
  return (
    <footer className="border-t border-zinc-200 dark:border-zinc-800">
      <div className="mx-auto max-w-2xl px-4 py-8">
        <p className="text-xs leading-relaxed text-zinc-500">
          {DISCLAIMER_FOOTER}
        </p>
        <nav className="mt-5 flex flex-wrap justify-center gap-x-5 gap-y-2 text-xs">
          <Link href="/" className="text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100">
            Home
          </Link>
          <Link href="/calculator" className="text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100">
            Calculator
          </Link>
          <Link href="/disclaimer" className="text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100">
            Medical Disclaimer
          </Link>
          <Link href="/terms" className="text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100">
            Terms
          </Link>
          <Link href="/privacy" className="text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100">
            Privacy
          </Link>
        </nav>
        <p className="mt-5 text-center text-xs text-zinc-500">
          BuddyPept. The math, free forever. © {new Date().getFullYear()}
        </p>
      </div>
    </footer>
  );
}
