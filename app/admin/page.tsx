import type { Metadata } from 'next';
import Link from 'next/link';
import { getSupabaseAdmin } from '@/lib/supabase';

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

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ show?: string }>;
}) {
  const { show } = await searchParams;
  const filter: Filter =
    show === 'pending' || show === 'all' ? show : 'confirmed';

  let rows: RequestRow[] = [];
  let loadError: string | null = null;

  try {
    const supabase = getSupabaseAdmin();
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
