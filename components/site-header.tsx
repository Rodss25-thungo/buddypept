import Link from 'next/link';
import { LogoMark, Wordmark } from './logo';

/**
 * Site-wide header. Brand presence on every page: logo + wordmark on the left,
 * a calculator call-to-action on the right. Sticky so it stays handy on mobile.
 */
export function SiteHeader() {
  return (
    <header className="sticky top-0 z-10 border-b border-zinc-200 bg-background/90 backdrop-blur dark:border-zinc-800">
      <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3">
        <Link href="/" className="flex items-center gap-2">
          <LogoMark className="h-7 w-7" />
          <Wordmark className="text-lg" />
        </Link>
        <Link
          href="/calculator"
          className="rounded-lg bg-brand-600 px-3.5 py-1.5 text-sm font-semibold text-white transition hover:bg-brand-700"
        >
          Calculator
        </Link>
      </div>
    </header>
  );
}
