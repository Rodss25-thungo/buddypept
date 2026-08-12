'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Buddy } from './buddy';

/**
 * "Learn more" pop-up. Appears once, a few seconds after someone gets their
 * calculator result (the highest-intent moment), inviting them into the gated
 * education library. The email form is inside the modal; submitting it sends
 * a confirmation email (double opt-in). The modal then shows a "check your
 * email" message and stays put until dismissed. Real signups confirm; fakes
 * never do.
 */

const POPUP_KEY = 'bp_popup_seen';
const UNLOCK_KEY = 'bp_learn_unlocked';

export function LearnPopup() {
  const tr = useTranslations('popup');
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'submitting' | 'error' | 'sent'>(
    'idle'
  );
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    let seen = false;
    let unlocked = false;
    try {
      seen = localStorage.getItem(POPUP_KEY) === '1';
      unlocked = localStorage.getItem(UNLOCK_KEY) === '1';
    } catch {
      // ignore storage errors
    }
    if (seen || unlocked) return;
    const t = setTimeout(() => setOpen(true), 4000);
    return () => clearTimeout(t);
  }, []);

  function dismiss() {
    try {
      localStorage.setItem(POPUP_KEY, '1');
    } catch {
      // ignore
    }
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
        body: JSON.stringify({ name, email, source: 'popup' }),
      });
      const data = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok) {
        setStatus('error');
        setErrorMsg(data.error ?? tr('genericError'));
        return;
      }
      try {
        localStorage.setItem(POPUP_KEY, '1');
      } catch {
        // ignore
      }
      setStatus('sent');
    } catch {
      setStatus('error');
      setErrorMsg(tr('networkError'));
    }
  }

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-4 sm:items-center"
      onClick={dismiss}
    >
      <div
        className="relative w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-6 shadow-xl dark:border-zinc-800 dark:bg-zinc-900"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={dismiss}
          aria-label={tr('close')}
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
              {tr('sentTitle')}
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
              {tr.rich('sentBody', {
                email,
                b: (chunks) => <span className="font-semibold">{chunks}</span>,
              })}
            </p>
            <button
              type="button"
              onClick={dismiss}
              className="mt-5 w-full rounded-xl border border-zinc-300 px-6 py-3 text-base font-semibold text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800"
            >
              {tr('gotIt')}
            </button>
          </>
        ) : (
          <>
            <h2 className="mt-3 text-xl font-bold tracking-tight">
              {tr('title')}
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
              {tr('body1')}
            </p>
            <p className="mt-2 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
              {tr('body2')}
            </p>

            <form onSubmit={handleSubmit} className="mt-4 space-y-3">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                placeholder={tr('firstName')}
                className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-base dark:border-zinc-700 dark:bg-zinc-800"
              />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder={tr('emailPlaceholder')}
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
                {status === 'submitting' ? tr('submitting') : tr('submit')}
              </button>
            </form>

            <button
              type="button"
              onClick={dismiss}
              className="mt-3 w-full text-center text-sm font-medium text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
            >
              {tr('later')}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
