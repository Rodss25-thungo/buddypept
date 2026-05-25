import type { Metadata } from 'next';
import { getSupabaseAdmin } from '@/lib/supabase';

/**
 * Private admin view of "request a peptide" submissions.
 *
 * Protected by HTTP Basic Auth in middleware.ts (ADMIN_PASSWORD env var).
 * Not linked anywhere in the site and marked noindex so it stays private.
 * Reads from Supabase with the server-side service-role client.
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
}

export default async function AdminPage() {
  let rows: RequestRow[] = [];
  let loadError: string | null = null;

  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from('peptide_requests')
      .select('name, email, requested_peptide, created_at')
      .order('created_at', { ascending: false });
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
          People who asked to be notified when a peptide is added. Private to
          you.
        </p>
      </header>

      {loadError ? (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-900 dark:border-red-900 dark:bg-red-950 dark:text-red-100">
          Could not load requests right now. ({loadError})
        </div>
      ) : rows.length === 0 ? (
        <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-6 text-center text-sm text-zinc-600 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400">
          No requests yet. When someone submits the &ldquo;request a
          peptide&rdquo; form, it will show up here.
        </div>
      ) : (
        <>
          <p className="mb-3 text-xs text-zinc-500">
            {rows.length} {rows.length === 1 ? 'request' : 'requests'}
          </p>
          <div className="overflow-x-auto rounded-lg border border-zinc-200 dark:border-zinc-800">
            <table className="w-full text-left text-sm">
              <thead className="bg-zinc-50 text-xs uppercase tracking-wide text-zinc-500 dark:bg-zinc-900">
                <tr>
                  <th className="px-4 py-3 font-medium">When</th>
                  <th className="px-4 py-3 font-medium">Name</th>
                  <th className="px-4 py-3 font-medium">Email</th>
                  <th className="px-4 py-3 font-medium">Peptide requested</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                {rows.map((r, i) => (
                  <tr key={i} className="align-top">
                    <td className="whitespace-nowrap px-4 py-3 text-zinc-500">
                      {formatDate(r.created_at)}
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
