import type { Metadata } from 'next';
import Link from 'next/link';
import { getSupabaseAdmin } from '@/lib/supabase';
import { Buddy } from '@/components/buddy';
import { UnlockLibrary } from './unlock-library';

export const metadata: Metadata = {
  title: 'Confirming your email | BuddyPept',
  robots: { index: false, follow: false },
};

export const dynamic = 'force-dynamic';

type ConfirmStatus = 'success' | 'already' | 'invalid' | 'error';

export default async function ConfirmPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;
  const status = await confirmToken(token);

  return (
    <main className="mx-auto max-w-md px-4 py-16">
      <div className="rounded-2xl border border-zinc-200 bg-white p-8 text-center shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <Buddy className="mx-auto h-16 w-auto drop-shadow-sm" />
        {status === 'success' && <SuccessState />}
        {status === 'already' && <AlreadyState />}
        {status === 'invalid' && <InvalidState />}
        {status === 'error' && <ErrorState />}
      </div>
    </main>
  );
}

async function confirmToken(token?: string): Promise<ConfirmStatus> {
  if (!token || token.length < 8) return 'invalid';
  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from('peptide_requests')
      .select('id, confirmed_at')
      .eq('confirmation_token', token)
      .maybeSingle();
    if (error) {
      console.error('confirm lookup error:', error.message);
      return 'error';
    }
    if (!data) return 'invalid';
    if (data.confirmed_at) return 'already';

    const { error: updateError } = await supabase
      .from('peptide_requests')
      .update({ confirmed_at: new Date().toISOString() })
      .eq('id', data.id);
    if (updateError) {
      console.error('confirm update error:', updateError.message);
      return 'error';
    }
    return 'success';
  } catch (e) {
    console.error('confirm route error:', e);
    return 'error';
  }
}

function SuccessState() {
  return (
    <>
      <UnlockLibrary />
      <p className="mt-4 text-sm font-medium uppercase tracking-wide text-brand-700 dark:text-brand-300">
        Confirmed
      </p>
      <h1 className="mt-1 text-2xl font-bold tracking-tight">
        You&rsquo;re in! 🎉
      </h1>
      <p className="mt-3 text-base leading-relaxed text-zinc-600 dark:text-zinc-400">
        Welcome to the BuddyPept community. We&rsquo;ll keep you posted as the
        library and the community grow.
      </p>
      <Link
        href="/learn"
        className="mt-6 inline-flex items-center gap-2 rounded-xl bg-brand-600 px-6 py-3 text-base font-semibold text-white transition hover:bg-brand-700"
      >
        Browse the library <span aria-hidden>→</span>
      </Link>
    </>
  );
}

function AlreadyState() {
  return (
    <>
      <UnlockLibrary />
      <p className="mt-4 text-sm font-medium uppercase tracking-wide text-zinc-500">
        Already confirmed
      </p>
      <h1 className="mt-1 text-2xl font-bold tracking-tight">
        You&rsquo;re already in.
      </h1>
      <p className="mt-3 text-base leading-relaxed text-zinc-600 dark:text-zinc-400">
        This email is already confirmed. No need to do it again.
      </p>
      <Link
        href="/learn"
        className="mt-6 inline-flex items-center gap-2 rounded-xl bg-brand-600 px-6 py-3 text-base font-semibold text-white transition hover:bg-brand-700"
      >
        Browse the library <span aria-hidden>→</span>
      </Link>
    </>
  );
}

function InvalidState() {
  return (
    <>
      <p className="mt-4 text-sm font-medium uppercase tracking-wide text-amber-700 dark:text-amber-300">
        Link not recognised
      </p>
      <h1 className="mt-1 text-2xl font-bold tracking-tight">
        Hmm, that link did not work.
      </h1>
      <p className="mt-3 text-base leading-relaxed text-zinc-600 dark:text-zinc-400">
        It might be old, mistyped, or already used. Try signing up again on the
        homepage and we&rsquo;ll send you a fresh confirmation email.
      </p>
      <Link
        href="/"
        className="mt-6 inline-flex items-center gap-2 rounded-xl bg-brand-600 px-6 py-3 text-base font-semibold text-white transition hover:bg-brand-700"
      >
        Back to BuddyPept <span aria-hidden>→</span>
      </Link>
    </>
  );
}

function ErrorState() {
  return (
    <>
      <p className="mt-4 text-sm font-medium uppercase tracking-wide text-red-700 dark:text-red-300">
        Something went wrong
      </p>
      <h1 className="mt-1 text-2xl font-bold tracking-tight">
        We had a hiccup.
      </h1>
      <p className="mt-3 text-base leading-relaxed text-zinc-600 dark:text-zinc-400">
        Please try the link again in a minute. If it keeps failing, sign up
        again from the homepage and we&rsquo;ll send a fresh email.
      </p>
      <Link
        href="/"
        className="mt-6 inline-flex items-center gap-2 rounded-xl bg-brand-600 px-6 py-3 text-base font-semibold text-white transition hover:bg-brand-700"
      >
        Back to BuddyPept <span aria-hidden>→</span>
      </Link>
    </>
  );
}
