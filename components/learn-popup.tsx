'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Buddy } from './buddy';

/**
 * "Learn more" pop-up. Appears once, a few seconds after someone gets their
 * calculator result (the highest-intent moment), inviting them into the gated
 * education library. The email form is inside the modal, so subscribing is one
 * step. Shows once per visitor; easy to dismiss ("Maybe later" / X / backdrop).
 *
 * Honest community framing: invites people to be an EARLY member of a community
 * we are building, never claims a peer-sharing feature that does not exist yet.
 */

const POPUP_KEY = 'bp_popup_seen';
const UNLOCK_KEY = 'bp_learn_unlocked';

export function LearnPopup() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'submitting' | 'error'>('idle');
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
        setErrorMsg(data.error ?? 'Something went wrong. Please try again.');
        return;
      }
      try {
        localStorage.setItem(UNLOCK_KEY, '1');
        localStorage.setItem(POPUP_KEY, '1');
      } catch {
        // ignore
      }
      setOpen(false);
      router.push('/learn');
    } catch {
      setStatus('error');
      setErrorMsg('Network error. Please try again.');
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
          aria-label="Close"
          className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-zinc-800"
        >
          ✕
        </button>

        <Buddy className="h-12 w-auto drop-shadow-sm" />
        <h2 className="mt-3 text-xl font-bold tracking-tight">
          You&rsquo;re a genius! 🎉
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
          The mg-to-units math trips up almost everyone, and you just cracked it.
        </p>
        <p className="mt-2 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
          We&rsquo;re building a community for people learning about peptides.
          Want in? Add your name and email and we&rsquo;ll keep you posted as it
          grows.
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
            {status === 'submitting' ? 'Unlocking…' : 'Unlock the library'}
          </button>
        </form>

        <button
          type="button"
          onClick={dismiss}
          className="mt-3 w-full text-center text-sm font-medium text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
        >
          Maybe later
        </button>
        <p className="mt-3 text-center text-xs text-zinc-400">
          Just your name and email. No spam, and we never sell your data.
        </p>
      </div>
    </div>
  );
}
