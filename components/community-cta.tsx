'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Buddy } from './buddy';

/**
 * Homepage "Join the community" box + pop-up. For readers who want in without
 * using the calculator. Clicking "I want in" opens a friendly modal with the
 * name + email form. Submitting saves the lead (source "homepage"), unlocks the
 * library, and welcomes them into the guides.
 *
 * Self-contained on purpose, so it never touches the calculator's pop-up.
 * Honest framing: a community we are building; nothing implies peptide use.
 */

const UNLOCK_KEY = 'bp_learn_unlocked';

export function CommunityCTA() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'submitting' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

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
        setErrorMsg(data.error ?? 'Something went wrong. Please try again.');
        return;
      }
      try {
        localStorage.setItem(UNLOCK_KEY, '1');
      } catch {
        // ignore storage errors
      }
      setOpen(false);
      router.push('/learn');
    } catch {
      setStatus('error');
      setErrorMsg('Network error. Please try again.');
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
            Join the community
          </h2>
          <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
            We&rsquo;re building a friendly community for people learning about
            peptides, and we&rsquo;d love for you to be part of it. No pressure,
            just learning together.
          </p>
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="mt-5 inline-flex items-center gap-2 rounded-lg bg-brand-600 px-6 py-3 text-base font-semibold text-white shadow-sm transition hover:bg-brand-700"
          >
            I want in <span aria-hidden>→</span>
          </button>
        </div>
      </div>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-4 sm:items-center"
          onClick={() => setOpen(false)}
        >
          <div
            className="relative w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-6 shadow-xl dark:border-zinc-800 dark:bg-zinc-900"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close"
              className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-zinc-800"
            >
              ✕
            </button>

            <Buddy className="h-12 w-auto drop-shadow-sm" />
            <h2 className="mt-3 text-xl font-bold tracking-tight">
              Let&rsquo;s learn together
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
              Add your name and email and we&rsquo;ll welcome you in and keep you
              posted as the community grows.
            </p>

            <form onSubmit={handleSubmit} className="mt-4 space-y-3">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                placeholder="First name"
                className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-base dark:border-zinc-700 dark:bg-zinc-800"
              />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="you@example.com"
                className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-base dark:border-zinc-700 dark:bg-zinc-800"
              />
              {status === 'error' && (
                <p className="text-sm text-red-600 dark:text-red-400">{errorMsg}</p>
              )}
              <button
                type="submit"
                disabled={status === 'submitting'}
                className="w-full rounded-xl bg-brand-600 px-6 py-3.5 text-base font-semibold text-white shadow-sm transition hover:bg-brand-700 disabled:opacity-60"
              >
                {status === 'submitting' ? 'Joining…' : 'Count me in'}
              </button>
            </form>

            <button
              type="button"
              onClick={() => setOpen(false)}
              className="mt-3 w-full text-center text-sm font-medium text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
            >
              Maybe later
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
