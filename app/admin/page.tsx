import type { Metadata } from 'next';
import Link from 'next/link';
import { getSupabaseAdmin } from '@/lib/supabase';
import { resolveSlug } from '@/lib/peptide-matching';

/**
 * Private admin view of signups and "request a peptide" submissions.
 *
 * Protected by HTTP Basic Auth in middleware.ts (ADMIN_PASSWORD env var).
 * Not linked anywhere in the site and marked noindex so it stays private.
 * Reads from Supabase with the server-side service-role client.
 *
 * Double opt-in: only rows with confirmed_at set are considered real signups.
 * By default we show only confirmed; ?show=pending shows the unconfirmed
 * leads, and ?show=all shows everything.
 */

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Requests | BuddyPept Admin',
  robots: { index: false, follow: false },
};

interface RequestRow {
  name: string;
  email: string;
  requested_peptide: string;
  created_at: string;
  confirmed_at: string | null;
}

type Filter = 'confirmed' | 'pending' | 'all';

/** One row of public.peptide_demand. Newsletter signups are already excluded. */
interface DemandRow {
  display_name: string;
  request_count: number;
  awaiting_notification: number;
  matched_slug: string | null;
}

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ show?: string }>;
}) {
  const { show } = await searchParams;
  const filter: Filter =
    show === 'pending' || show === 'all' ? show : 'confirmed';

  let rows: RequestRow[] = [];
  let demand: DemandRow[] = [];
  let loadError: string | null = null;

  try {
    const supabase = getSupabaseAdmin();

    // Demand is what decides which peptide gets built next. It is deliberately
    // read from the view rather than counted here, so this page and the send
    // route cannot disagree about who is owed an email.
    const { data: demandData } = await supabase
      .from('peptide_demand')
      .select('display_name, request_count, awaiting_notification, matched_slug');
    demand = (demandData as DemandRow[]) ?? [];

    let query = supabase
      .from('peptide_requests')
      .select('name, email, requested_peptide, created_at, confirmed_at')
      .order('created_at', { ascending: false });
    if (filter === 'confirmed') {
      query = query.not('confirmed_at', 'is', null);
    } else if (filter === 'pending') {
      query = query.is('confirmed_at', null);
    }
    const { data, error } = await query;
    if (error) {
      loadError = error.message;
    } else {
      rows = (data as RequestRow[]) ?? [];
    }
  } catch (e) {
    loadError = e instanceof Error ? e.message : 'Could not load requests.';
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-10 sm:py-14">
      <header className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
          Peptide requests
        </h1>
        <p className="mt-1 text-sm text-zinc-500">
          People who signed up or asked for a peptide. Private to you.
        </p>
      </header>

      {demand.length > 0 && (
        <section className="mb-8">
          <h2 className="mb-1 text-lg font-semibold tracking-tight">Demand</h2>
          <p className="mb-3 text-sm text-zinc-500">
            Confirmed requests only, newsletter signups excluded. This is the list
            that decides what gets built next.
          </p>
          <div className="overflow-x-auto rounded-lg border border-zinc-200 dark:border-zinc-800">
            <table className="w-full text-left text-sm">
              <thead className="bg-zinc-50 text-xs uppercase tracking-wide text-zinc-500 dark:bg-zinc-900">
                <tr>
                  <th className="px-4 py-3 font-medium">Requested</th>
                  <th className="px-4 py-3 font-medium">Asks</th>
                  <th className="px-4 py-3 font-medium">In calculator</th>
                  <th className="px-4 py-3 font-medium">Owed an email</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                {demand.map((d, i) => {
                  // matched_slug wins when set by hand; otherwise resolve the
                  // same way the send route will.
                  const slug = d.matched_slug ?? resolveSlug(d.display_name);
                  return (
                    <tr key={i} className="align-top">
                      <td className="px-4 py-3 font-medium">{d.display_name}</td>
                      <td className="px-4 py-3 tabular-nums">{d.request_count}</td>
                      <td className="whitespace-nowrap px-4 py-3">
                        {slug ? (
                          <Link
                            href={`/calculator?peptide=${slug}`}
                            className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
                          >
                            ✓ {slug}
                          </Link>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full bg-zinc-100 px-2 py-0.5 text-xs font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
                            Not added
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 tabular-nums">
                        {slug && d.awaiting_notification > 0 ? (
                          <span className="font-medium text-amber-700 dark:text-amber-300">
                            {d.awaiting_notification}
                          </span>
                        ) : (
                          <span className="text-zinc-400">
                            {d.awaiting_notification > 0 ? '—' : '0'}
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <p className="mt-2 text-xs text-zinc-500">
            &ldquo;Owed an email&rdquo; counts people who confirmed and have not been
            notified. A dash means the peptide is not in the calculator yet, so
            there is nothing to tell them.
          </p>
        </section>
      )}

      <nav className="mb-5 flex flex-wrap gap-2 text-sm">
        <FilterChip href="/admin" label="Confirmed" active={filter === 'confirmed'} />
        <FilterChip href="/admin?show=pending" label="Pending" active={filter === 'pending'} />
        <FilterChip href="/admin?show=all" label="All" active={filter === 'all'} />
      </nav>

      {loadError ? (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-900 dark:border-red-900 dark:bg-red-950 dark:text-red-100">
          Could not load requests right now. ({loadError})
        </div>
      ) : rows.length === 0 ? (
        <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-6 text-center text-sm text-zinc-600 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400">
          {filter === 'confirmed'
            ? 'No confirmed signups yet. When someone confirms their email, they will show up here.'
            : filter === 'pending'
              ? 'No pending signups. Everyone who has signed up has confirmed.'
              : 'No signups yet.'}
        </div>
      ) : (
        <>
          <p className="mb-3 text-xs text-zinc-500">
            {rows.length} {rows.length === 1 ? 'entry' : 'entries'}
          </p>
          <div className="overflow-x-auto rounded-lg border border-zinc-200 dark:border-zinc-800">
            <table className="w-full text-left text-sm">
              <thead className="bg-zinc-50 text-xs uppercase tracking-wide text-zinc-500 dark:bg-zinc-900">
                <tr>
                  <th className="px-4 py-3 font-medium">When</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Name</th>
                  <th className="px-4 py-3 font-medium">Email</th>
                  <th className="px-4 py-3 font-medium">Source / Peptide</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                {rows.map((r, i) => (
                  <tr key={i} className="align-top">
                    <td className="whitespace-nowrap px-4 py-3 text-zinc-500">
                      {formatDate(r.created_at)}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3">
                      {r.confirmed_at ? (
                        <span
                          title={`Confirmed ${formatDate(r.confirmed_at)}`}
                          className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
                        >
                          ✓ Confirmed
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-700 dark:bg-amber-950 dark:text-amber-300">
                          ⏳ Pending
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">{r.name}</td>
                    <td className="px-4 py-3">
                      <a
                        href={`mailto:${r.email}`}
                        className="text-zinc-700 underline dark:text-zinc-300"
                      >
                        {r.email}
                      </a>
                    </td>
                    <td className="px-4 py-3 font-medium">
                      {r.requested_peptide}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </main>
  );
}

function FilterChip({
  href,
  label,
  active,
}: {
  href: string;
  label: string;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      className={`rounded-full border px-3 py-1 ${
        active
          ? 'border-brand-600 bg-brand-600 text-white'
          : 'border-zinc-300 bg-white text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300'
      }`}
    >
      {label}
    </Link>
  );
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  return d.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}
