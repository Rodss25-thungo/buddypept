'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Buddy } from './buddy';

/**
 * Homepage "Join the community" box + pop-up. For readers who want in without
 * using the calculator. Clicking "I want in" opens a friendly modal with the
 * name + email form. Submitting saves the lead as pending (source "homepage")
 * and sends a confirmation email (double opt-in); the modal then shows a
 * "check your email" message. Real signups confirm; fakes never do.
 */

export function CommunityCTA() {
  const t = useTranslations('community');
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'submitting' | 'error' | 'sent'>(
    'idle'
  );
  const [errorMsg, setErrorMsg] = useState('');

  function close() {
    setOpen(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus('submitting');
    setErrorMsg('');
    try {
      const res = await fetch('/api/learn-signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, source: 'homepage' }),
      });
      const data = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok) {
        setStatus('error');
        setErrorMsg(data.error ?? t('genericError'));
        return;
      }
      setStatus('sent');
    } catch {
      setStatus('error');
      setErrorMsg(t('networkError'));
    }
  }

  return (
    <section className="border-t border-zinc-200 dark:border-zinc-800">
      <div className="mx-auto max-w-2xl px-4 py-12 sm:py-16">
        <div className="rounded-2xl border border-brand-200 bg-brand-50 p-6 text-center dark:border-brand-900 dark:bg-brand-950/30">
          <p className="text-2xl" aria-hidden>
            🤝
          </p>
          <h2 className="mt-1 text-xl font-bold tracking-tight sm:text-2xl">
            {t('title')}
          </h2>
          <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
            {t('body')}
          </p>
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="mt-5 inline-flex items-center gap-2 rounded-lg bg-brand-600 px-6 py-3 text-base font-semibold text-white shadow-sm transition hover:bg-brand-700"
          >
            {t('cta')} <span aria-hidden>→</span>
          </button>
        </div>
      </div>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-4 sm:items-center"
          onClick={close}
        >
          <div
            className="relative w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-6 shadow-xl dark:border-zinc-800 dark:bg-zinc-900"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={close}
              aria-label={t('close')}
              className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-zinc-800"
            >
              ✕
            </button>

            <Buddy className="h-12 w-auto drop-shadow-sm" />

            {status === 'sent' ? (
              <>
                <p className="mt-3 text-3xl" aria-hidden>
                  📬
                </p>
                <h2 className="mt-1 text-xl font-bold tracking-tight">
                  {t('sentTitle')}
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
                  {t.rich('sentBody', {
                    email,
                    b: (chunks) => <span className="font-semibold">{chunks}</span>,
                  })}
                </p>
                <button
                  type="button"
                  onClick={close}
                  className="mt-5 w-full rounded-xl border border-zinc-300 px-6 py-3 text-base font-semibold text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800"
                >
                  {t('gotIt')}
                </button>
              </>
            ) : (
              <>
                <h2 className="mt-3 text-xl font-bold tracking-tight">
                  {t('modalTitle')}
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
                  {t('modalBody')}
                </p>

                <form onSubmit={handleSubmit} className="mt-4 space-y-3">
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    placeholder={t('firstName')}
                    className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-base dark:border-zinc-700 dark:bg-zinc-800"
                  />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder={t('emailPlaceholder')}
                    className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-base dark:border-zinc-700 dark:bg-zinc-800"
                  />
                  {status === 'error' && (
                    <p className="text-sm text-red-600 dark:text-red-400">
                      {errorMsg}
                    </p>
                  )}
                  <button
                    type="submit"
                    disabled={status === 'submitting'}
                    className="w-full rounded-xl bg-brand-600 px-6 py-3.5 text-base font-semibold text-white shadow-sm transition hover:bg-brand-700 disabled:opacity-60"
                  >
                    {status === 'submitting' ? t('submitting') : t('submit')}
                  </button>
                </form>

                <button
                  type="button"
                  onClick={close}
                  className="mt-3 w-full text-center text-sm font-medium text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
                >
                  {t('later')}
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
