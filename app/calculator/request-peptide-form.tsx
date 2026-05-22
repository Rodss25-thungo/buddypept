'use client';

import { useState } from 'react';

/**
 * "Request a peptide" form. Captures name + email + which peptide the user
 * wants added, and POSTs to /api/request-peptide (which saves to Supabase).
 *
 * This is BuddyPept's email sign-up — framed as a helpful "we'll notify you"
 * rather than a sales pitch. On-brand: useful to the user, useful to us
 * (lead + roadmap signal), never extractive.
 */
export function RequestPeptideForm({
  defaultPeptide = '',
}: {
  defaultPeptide?: string;
}) {
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
        body: JSON.stringify({ name, email, requestedPeptide: peptide }),
      });
      const data = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok) {
        setStatus('error');
        setErrorMsg(data.error ?? 'Something went wrong. Please try again.');
        return;
      }
      setStatus('success');
    } catch {
      setStatus('error');
      setErrorMsg('Network error. Please try again.');
    }
  }

  if (status === 'success') {
    return (
      <div className="rounded-lg border border-emerald-300 bg-emerald-50 p-4 text-sm text-emerald-900 dark:border-emerald-700 dark:bg-emerald-950 dark:text-emerald-200">
        <p className="font-medium">Thanks! Your request is in. 🎉</p>
        <p className="mt-1">
          We&rsquo;ll email you when {peptide.trim() || 'your peptide'} is added to
          the library. No spam — just that one heads-up.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          <label htmlFor="rp-name" className="mb-1 block text-xs font-medium">
            Your name
          </label>
          <input
            id="rp-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            placeholder="First name"
            className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800"
          />
        </div>
        <div>
          <label htmlFor="rp-email" className="mb-1 block text-xs font-medium">
            Your email
          </label>
          <input
            id="rp-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="you@example.com"
            className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800"
          />
        </div>
      </div>
      <div>
        <label htmlFor="rp-peptide" className="mb-1 block text-xs font-medium">
          Which peptide do you want added?
        </label>
        <input
          id="rp-peptide"
          type="text"
          value={peptide}
          onChange={(e) => setPeptide(e.target.value)}
          required
          placeholder="e.g., HGH, HCG, Tesamorelin"
          className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800"
        />
      </div>
      {status === 'error' && (
        <p className="text-xs text-red-600 dark:text-red-400">{errorMsg}</p>
      )}
      <button
        type="submit"
        disabled={status === 'submitting'}
        className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-zinc-700 disabled:opacity-60 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
      >
        {status === 'submitting' ? 'Sending…' : 'Notify me when it’s ready'}
      </button>
      <p className="text-xs text-zinc-500">
        We use your email only to tell you when this peptide is added. No spam,
        no selling your data.
      </p>
    </form>
  );
}
