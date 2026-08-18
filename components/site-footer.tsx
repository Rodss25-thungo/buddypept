import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { Prose } from '@/components/prose';

/**
 * Site-wide footer. Carries the persistent medical disclaimer (per the Phase 7
 * Disclaimer & Legal Placement Map) plus links to the standalone legal pages.
 *
 * Disclaimer wording is draft, modeled on standard educational-health-tool
 * disclaimers, and still needs a lawyer review before public launch. That
 * review is per-market: a translated US disclaimer is not a valid disclaimer
 * in Brazil or Mexico, so `footer.disclaimer` must not simply be machine
 * translated when the pt and es catalogs are filled in.
 */

const LINKS = [
  { href: '/', key: 'home' },
  { href: '/calculator', key: 'calculator' },
  { href: '/learn', key: 'learn' },
  { href: '/disclaimer', key: 'disclaimer' },
  { href: '/terms', key: 'terms' },
  { href: '/privacy', key: 'privacy' },
] as const;

export function SiteFooter() {
  const t = useTranslations('footer');
  const nav = useTranslations('nav');

  return (
    <footer className="border-t border-zinc-200 dark:border-zinc-800">
      <div className="mx-auto max-w-2xl px-4 py-8">
        <Prose
          text={t('disclaimer')}
          className="text-xs leading-relaxed text-zinc-500"
          spacing="mt-2"
        />
        <nav className="mt-5 flex flex-wrap justify-center gap-x-5 gap-y-2 text-xs">
          {LINKS.map(({ href, key }) => (
            <Link
              key={href}
              href={href}
              className="text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
            >
              {nav(key)}
            </Link>
          ))}
        </nav>
        <p className="mt-5 text-center text-xs text-zinc-500">
          {/* String, not number: a bare {year} number would be run through
              Intl.NumberFormat and render as "2,026". */}
          {t('colophon', { year: String(new Date().getFullYear()) })}
        </p>
      </div>
    </footer>
  );
}
