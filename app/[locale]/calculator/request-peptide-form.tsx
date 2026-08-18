'use client';

import { useMemo, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { suggestPeptide } from '@/lib/peptide-matching';
import { isInCalculator } from '@/data/calculator-peptides';

/**
 * "Request a peptide" form. Captures name + email + which peptide the user
 * wants added, and POSTs to /api/request-peptide (which saves to Supabase).
 *
 * This is BuddyPept's email sign-up, framed as a helpful "we'll notify you"
 * rather than a sales pitch. On-brand: useful to the user, useful to us
 * (lead + roadmap signal), never extractive.
 *
 * The name someone types is matched as they type, because the two worst
 * outcomes both happen silently otherwise:
 *
 *   1. They misspell it, nothing ever matches their row, and they wait for an
 *      email that by construction can never arrive.
 *   2. They ask for something already in the calculator and wait a day for an
 *      email telling them to use a thing that was one click away the whole time.
 *
 * Case 2 is why an already-built peptide short-circuits the form entirely. The
 * point is to answer the question, not to collect the address.
 */
export function RequestPeptideForm({
  defaultPeptide = '',
  onDone,
}: {
  defaultPeptide?: string;
  /**
   * Offered after a successful request: carry on into the generic calculation
   * under the name they asked for. Absent on the standalone form, where there
   * is no wizard waiting to receive them.
   */
  onDone?: (peptideName: string) => void;
}) {
  const t = useTranslations('requestForm');
  // Sent with the signup so the confirmation email arrives in the same
  // language the person was reading when they signed up.
  const locale = useLocale();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [peptide, setPeptide] = useState(defaultPeptide);
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>(
    'idle'
  );
  const [errorMsg, setErrorMsg] = useState('');
  /**
   * Slug the person explicitly agreed to. Only a confirmed slug is sent on, so
   * a guess they never looked at can never decide who gets emailed.
   */
  const [confirmedSlug, setConfirmedSlug] = useState<string | null>(null);
  /** Set when they say "no, keep what I typed", so the prompt stops asking. */
  const [dismissed, setDismissed] = useState('');

  const suggestion = useMemo(() => suggestPeptide(peptide), [peptide]);
  const typed = peptide.trim();
  /*
   * An exact match needs no confirming, and a dismissed one has been answered.
   *
   * Deliberately not compared against confirmedSlug. A peptide the calculator
   * does not curate has a null slug, so that comparison read `null !== null`
   * and hid the prompt for precisely the peptides it exists to catch. Accepting
   * rewrites the field to the canonical name, which makes the match exact and
   * closes the panel on its own.
   */
  const showSuggestion =
    suggestion !== null && !suggestion.exact && dismissed !== typed;
  // Already built, so the useful answer is the calculator, not a signup form.
  // A recognised name with no slug is a peptide BuddyPept knows of but has not
  // curated yet, which is a request, not a redirect.
  const availableNow =
    suggestion !== null &&
    suggestion.slug !== null &&
    isInCalculator(suggestion.slug) &&
    dismissed !== typed;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus('submitting');
    setErrorMsg('');
    try {
      const res = await fetch('/api/request-peptide', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email,
          requestedPeptide: peptide,
          locale,
          confirmedSlug,
        }),
      });
      const data = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok) {
        setStatus('error');
        setErrorMsg(data.error ?? t('genericError'));
        return;
      }
      setStatus('success');
    } catch {
      setStatus('error');
      setErrorMsg(t('networkError'));
    }
  }

  if (status === 'success') {
    return (
      <div className="rounded-lg border border-brand-300 bg-brand-50 p-4 text-sm text-brand-900 dark:border-brand-700 dark:bg-brand-950 dark:text-brand-100">
        <p className="font-medium">{t('sentTitle')}</p>
        <p className="mt-1">
          {t.rich('sentBody', {
            email,
            peptide: peptide.trim() || t('sentFallbackPeptide'),
            b: (chunks) => <span className="font-semibold">{chunks}</span>,
          })}
        </p>
        <p className="mt-2 text-xs">{t('sentSpam')}</p>
        {onDone && (
          <div className="mt-3 border-t border-brand-200 pt-3 dark:border-brand-800">
            <p className="mb-2">{t('doMathBody')}</p>
            <button
              type="button"
              onClick={() => onDone(peptide.trim())}
              className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700"
            >
              {t('doMathCta')}
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          <label htmlFor="rp-name" className="mb-1 block text-xs font-medium">
            {t('nameLabel')}
          </label>
          <input
            id="rp-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            placeholder={t('firstName')}
            className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800"
          />
        </div>
        <div>
          <label htmlFor="rp-email" className="mb-1 block text-xs font-medium">
            {t('emailLabel')}
          </label>
          <input
            id="rp-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder={t('emailPlaceholder')}
            className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800"
          />
        </div>
      </div>
      <div>
        <label htmlFor="rp-peptide" className="mb-1 block text-xs font-medium">
          {t('peptideLabel')}
        </label>
        <input
          id="rp-peptide"
          type="text"
          value={peptide}
          onChange={(e) => {
            setPeptide(e.target.value);
            // Editing the text abandons any earlier confirmation, so a slug
            // agreed to for one name cannot ride along with another.
            setConfirmedSlug(null);
          }}
          required
          placeholder={t('peptidePlaceholder')}
          className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800"
        />

        {availableNow && suggestion && (
          <div className="mt-2 rounded-md border border-emerald-300 bg-emerald-50 p-3 text-sm dark:border-emerald-800 dark:bg-emerald-950">
            <p className="font-medium text-emerald-900 dark:text-emerald-100">
              {t('availableTitle', { name: suggestion.name })}
            </p>
            <p className="mt-0.5 text-emerald-800 dark:text-emerald-200">
              {t('availableBody')}
            </p>
            <Link
              href={`/calculator?peptide=${suggestion.slug}`}
              className="mt-2 inline-block rounded-md bg-emerald-700 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-800"
            >
              {t('availableCta', { name: suggestion.name })}
            </Link>
            <button
              type="button"
              onClick={() => setDismissed(typed)}
              className="ml-2 text-xs text-emerald-800 underline dark:text-emerald-300"
            >
              {t('availableDifferent')}
            </button>
          </div>
        )}

        {!availableNow && showSuggestion && suggestion && (
          <div className="mt-2 rounded-md border border-zinc-300 bg-zinc-50 p-3 text-sm dark:border-zinc-700 dark:bg-zinc-900">
            <p className="font-medium">
              {t('suggestTitle', { name: suggestion.name })}
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => {
                  setPeptide(suggestion.name);
                  setConfirmedSlug(suggestion.slug);
                  setDismissed('');
                }}
                className="rounded-md bg-brand-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-brand-700"
              >
                {t('suggestAccept', { name: suggestion.name })}
              </button>
              <button
                type="button"
                onClick={() => setDismissed(typed)}
                className="rounded-md border border-zinc-300 px-3 py-1.5 text-xs font-medium dark:border-zinc-600"
              >
                {t('suggestKeep')}
              </button>
            </div>
          </div>
        )}
      </div>
      {status === 'error' && (
        <p className="text-xs text-red-600 dark:text-red-400">{errorMsg}</p>
      )}
      <button
        type="submit"
        disabled={status === 'submitting'}
        className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-700 disabled:opacity-60"
      >
        {status === 'submitting' ? t('submitting') : t('submit')}
      </button>
      <p className="text-xs text-zinc-500">{t('privacy')}</p>
    </form>
  );
}
