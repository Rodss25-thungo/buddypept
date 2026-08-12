'use client';

import { useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';

/**
 * "Request a peptide" form. Captures name + email + which peptide the user
 * wants added, and POSTs to /api/request-peptide (which saves to Supabase).
 *
 * This is BuddyPept's email sign-up, framed as a helpful "we'll notify you"
 * rather than a sales pitch. On-brand: useful to the user, useful to us
 * (lead + roadmap signal), never extractive.
 */
export function RequestPeptideForm({
  defaultPeptide = '',
}: {
  defaultPeptide?: string;
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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus('submitting');
    setErrorMsg('');
    try {
      const res = await fetch('/api/request-peptide', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, requestedPeptide: peptide, locale }),
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
          onChange={(e) => setPeptide(e.target.value)}
          required
          placeholder={t('peptidePlaceholder')}
          className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800"
        />
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
