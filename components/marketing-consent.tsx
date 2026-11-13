'use client';

import { useId } from 'react';
import { useTranslations } from 'next-intl';

/**
 * The separate, optional marketing-email checkbox. Always starts unchecked
 * and never gates anything: the form submits the same way either way. The
 * server stores the exact label wording from the same catalog as evidence.
 */
export function MarketingConsent({
  checked,
  onChange,
  compact = false,
}: {
  checked: boolean;
  onChange: (value: boolean) => void;
  compact?: boolean;
}) {
  const t = useTranslations('consent');
  const id = useId();
  return (
    <div className="flex items-start gap-2.5 text-left">
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-0.5 h-4 w-4 flex-shrink-0 rounded border-zinc-300 accent-brand-600 dark:border-zinc-600"
      />
      <label
        htmlFor={id}
        className={`${compact ? 'text-xs' : 'text-sm'} leading-snug text-zinc-600 dark:text-zinc-400`}
      >
        {t('label')}
      </label>
    </div>
  );
}
