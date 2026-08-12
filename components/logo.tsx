import { useTranslations } from 'next-intl';

/**
 * BuddyPept logo: a friendly rounded teal tile holding a white droplet
 * (the bacteriostatic-water drop at the heart of reconstitution). Calm and
 * human, not clinical. Pair the mark with the wordmark for the full lockup.
 */

export function LogoMark({ className }: { className?: string }) {
  const t = useTranslations('a11y');
  return (
    <svg
      viewBox="0 0 32 32"
      role="img"
      aria-label={t('logo')}
      className={className}
    >
      <rect width="32" height="32" rx="9" className="fill-brand-600" />
      {/* Water droplet */}
      <path
        d="M16 7c3.6 4.2 6 7.2 6 10.2A6 6 0 0 1 10 17.2C10 14.2 12.4 11.2 16 7Z"
        className="fill-white"
      />
      {/* Small highlight dot for a soft, friendly feel */}
      <circle cx="13.6" cy="17.4" r="1.5" className="fill-brand-200" />
    </svg>
  );
}

export function Wordmark({ className }: { className?: string }) {
  return (
    <span className={className}>
      <span className="font-bold tracking-tight">Buddy</span>
      <span className="font-bold tracking-tight text-brand-600">Pept</span>
    </span>
  );
}
