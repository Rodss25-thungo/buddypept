'use client';

import { useEffect, useState } from 'react';

/**
 * Soft email gate for the "Learn about peptides" library with double opt-in.
 * The first time someone visits, they submit name + email; we save it as
 * pending and send a confirmation email. They click the link in the email and
 * the /confirm page sets the unlock flag for this device, so future visits
 * skip the gate. Real signups go through, fakes never confirm.
 */

const UNLOCK_KEY = 'bp_learn_unlocked';

export function LearnGate({
  source,
  children,
}: {
  source: string;
  children: React.ReactNode;
}) {
  const [{ checked, unlocked }, setGate] = useState({ checked: false, unlocked: false });
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'submitting' | 'error' | 'sent'>(
    'idle'
  );
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    let isUnlocked = false;
    try {
      isUnlocked = localStorage.getItem(UNLOCK_KEY) === '1';
    } catch {
      // ignore storage errors
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time read of the persisted unlock flag on mount
    setGate({ checked: true, unlocked: isUnlocked });
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus('submitting');
    setErrorMsg('');
    try {
      const res = await fetch('/api/learn-signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, source }),
      });
      const data = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok) {
        setStatus('error');
        setErrorMsg(data.error ?? 'Something went wrong. Please try again.');
        return;
      }
      setStatus('sent');
    } catch {
      setStatus('error');
      setErrorMsg('Network error. Please try again.');
    }
  }

  // Avoid a flash of the form before we've checked storage.
  if (!checked) return null;

  if (unlocked) return <>{children}</>;

  if (status === 'sent') {
    return (
      <div className="rounded-2xl border border-brand-200 bg-brand-50 p-5 text-center shadow-sm dark:border-brand-900 dark:bg-brand-950/30 sm:p-6">
        <p className="text-3xl" aria-hidden>
          📬
        </p>
        <h2 className="mt-2 text-lg font-semibold">Check your email</h2>
        <p className="mt-2 text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">
          We sent a confirmation link to{' '}
          <span className="font-semibold">{email}</span>. Click it within 24
          hours to unlock the library.
        </p>
        <p className="mt-3 text-xs text-zinc-500">
          Didn&rsquo;t get it? Check your spam folder.
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 sm:p-6"
    >
      <h2 className="text-lg font-semibold">Read the full guide, free</h2>
      <p className="mt-1 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
        Pop in your name and email to unlock the full peptide library. We send
        one confirmation email; click the link and you&rsquo;re in.
      </p>
      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
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
      </div>
      {status === 'error' && (
        <p className="mt-2 text-sm text-red-600 dark:text-red-400">{errorMsg}</p>
      )}
      <button
        type="submit"
        disabled={status === 'submitting'}
        className="mt-4 w-full rounded-xl bg-brand-600 px-6 py-3.5 text-base font-semibold text-white shadow-sm transition hover:bg-brand-700 disabled:opacity-60"
      >
        {status === 'submitting' ? 'Sending the link…' : 'Send me the link'}
      </button>
      <p className="mt-3 text-xs text-zinc-500">
        We use your email only to share peptide education and occasional
        updates. We never sell your data.
      </p>
    </form>
  );
}
