import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { getSupabaseAdmin } from '@/lib/supabase';
import { Buddy } from '@/components/buddy';
import { UnlockLibrary } from './unlock-library';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'meta' });
  return { title: t('confirmTitle'), robots: { index: false, follow: false } };
}

export const dynamic = 'force-dynamic';

type ConfirmStatus = 'success' | 'already' | 'invalid' | 'error';

export default async function ConfirmPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ token?: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const { token } = await searchParams;
  const status = await confirmToken(token);
  const t = await getTranslations('confirm');

  // Each state is the same shape: a kicker, a headline, a paragraph, and one
  // link out. Driving it from a table keeps the four near-identical JSX blocks
  // from having to be kept in sync by hand.
  const states = {
    success: { kickerClass: 'text-brand-700 dark:text-brand-300', href: '/learn', cta: 'browseLibrary', unlock: true },
    already: { kickerClass: 'text-zinc-500', href: '/learn', cta: 'browseLibrary', unlock: true },
    invalid: { kickerClass: 'text-amber-700 dark:text-amber-300', href: '/', cta: 'backHome', unlock: false },
    error: { kickerClass: 'text-red-700 dark:text-red-300', href: '/', cta: 'backHome', unlock: false },
  } as const;

  const state = states[status];

  return (
    <main className="mx-auto max-w-md px-4 py-16">
      <div className="rounded-2xl border border-zinc-200 bg-white p-8 text-center shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <Buddy className="mx-auto h-16 w-auto drop-shadow-sm" />
        {state.unlock && <UnlockLibrary />}
        <p className={`mt-4 text-sm font-medium uppercase tracking-wide ${state.kickerClass}`}>
          {t(`${status}Kicker`)}
        </p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight">
          {t(`${status}Title`)}
        </h1>
        <p className="mt-3 text-base leading-relaxed text-zinc-600 dark:text-zinc-400">
          {t(`${status}Body`)}
        </p>
        <Link
          href={state.href}
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-brand-600 px-6 py-3 text-base font-semibold text-white transition hover:bg-brand-700"
        >
          {t(state.cta)} <span aria-hidden>→</span>
        </Link>
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
