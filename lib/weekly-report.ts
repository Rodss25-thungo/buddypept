/**
 * Weekly performance report (server-side only).
 *
 * Gathers the numbers that actually move BuddyPept forward and hands them to
 * lib/email.ts to send. Every figure comes from Supabase, so the report needs
 * no new accounts and no new credentials.
 *
 * What it deliberately does NOT report: page views, traffic sources, and
 * bounce rate. Those live in Google Analytics, which only gives data back
 * through the GA Data API, and that needs a Google Cloud service account that
 * does not exist yet. Rather than pad the email with numbers it cannot verify,
 * the report says plainly that traffic is not included.
 *
 * It also does not count replies to the tracker teaser. Those arrive in Gmail,
 * not in the database, so the 30-reply build threshold stays a manual count.
 * Guessing at it would turn a real decision signal into a made-up one.
 */

import { getSupabaseAdmin } from '@/lib/supabase';
import { CALCULATOR_SLUGS } from '@/data/calculator-peptides';
import { routing } from '@/i18n/routing';

const DAY_MS = 24 * 60 * 60 * 1000;

export interface DemandRow {
  displayName: string;
  requestCount: number;
  matchedSlug: string | null;
  /** True when nobody can pick this peptide in the calculator yet. */
  isGap: boolean;
}

export interface WeeklyReport {
  /** Inclusive start and exclusive end of the seven days being reported. */
  windowStart: Date;
  windowEnd: Date;
  signups: number;
  signupsPrior: number;
  confirmed: number;
  /** Signed up in the window and has not clicked the confirmation link. */
  pending: number;
  /** Confirmed as a share of signups, 0 to 100, or null when nobody signed up. */
  confirmationRate: number | null;
  /** Locale code to signup count, only locales with at least one signup. */
  localeSplit: Record<string, number>;
  /** All-time demand, highest first. */
  topDemand: DemandRow[];
  /** Demand for peptides the calculator does not offer yet. */
  gaps: DemandRow[];
  /** People confirmed and still owed a "your peptide is live" email. */
  awaitingNotification: number;
  totalConfirmedAllTime: number;
}

/**
 * Reads the last seven days, plus the seven before it for comparison.
 *
 * `now` is injectable so a test can pin the window instead of depending on
 * when the suite happens to run.
 */
export async function gatherWeeklyReport(now: Date = new Date()): Promise<WeeklyReport> {
  const supabase = getSupabaseAdmin();

  const windowEnd = now;
  const windowStart = new Date(now.getTime() - 7 * DAY_MS);
  const priorStart = new Date(now.getTime() - 14 * DAY_MS);

  // One read covering both windows, then split in memory. Two round trips to
  // Postgres to answer "this week versus last week" is a round trip too many.
  const { data: rows, error } = await supabase
    .from('peptide_requests')
    .select('created_at, confirmed_at, locale')
    .gte('created_at', priorStart.toISOString());
  if (error) throw new Error(`Could not read signups: ${error.message}`);

  const recent = (rows ?? []).filter(
    (r) => new Date(r.created_at) >= windowStart
  );
  const prior = (rows ?? []).filter(
    (r) => new Date(r.created_at) < windowStart
  );

  const confirmed = recent.filter((r) => r.confirmed_at !== null).length;

  const localeSplit: Record<string, number> = {};
  for (const row of recent) {
    // Anything the database holds that is not a live locale is counted under
    // the default rather than dropped, so the split always sums to signups.
    const locale = routing.locales.includes(row.locale as never)
      ? (row.locale as string)
      : routing.defaultLocale;
    localeSplit[locale] = (localeSplit[locale] ?? 0) + 1;
  }

  const { data: demand, error: demandError } = await supabase
    .from('peptide_demand')
    .select('display_name, request_count, awaiting_notification, matched_slug');
  if (demandError) {
    throw new Error(`Could not read demand: ${demandError.message}`);
  }

  const offered = new Set<string>(CALCULATOR_SLUGS);
  const demandRows: DemandRow[] = (demand ?? []).map((d) => ({
    displayName: d.display_name as string,
    requestCount: d.request_count as number,
    matchedSlug: (d.matched_slug as string | null) ?? null,
    // A request is a gap when it matched nothing in the library, or matched
    // something the calculator does not list. Both mean the same thing to the
    // person who asked: they cannot use the tool for what they came for.
    isGap: !d.matched_slug || !offered.has(d.matched_slug as string),
  }));

  const awaitingNotification = (demand ?? []).reduce(
    (sum, d) => sum + ((d.awaiting_notification as number) ?? 0),
    0
  );

  const { count: totalConfirmed } = await supabase
    .from('peptide_requests')
    .select('*', { count: 'exact', head: true })
    .not('confirmed_at', 'is', null);

  return {
    windowStart,
    windowEnd,
    signups: recent.length,
    signupsPrior: prior.length,
    confirmed,
    pending: recent.length - confirmed,
    confirmationRate: recent.length ? (confirmed / recent.length) * 100 : null,
    localeSplit,
    topDemand: demandRows.slice(0, 10),
    gaps: demandRows.filter((d) => d.isGap).slice(0, 10),
    awaitingNotification,
    totalConfirmedAllTime: totalConfirmed ?? 0,
  };
}

/** "up 3" / "down 2" / "flat", phrased for a sentence rather than a dashboard. */
export function describeChange(current: number, prior: number): string {
  const delta = current - prior;
  if (delta === 0) return 'flat against the week before';
  return `${delta > 0 ? 'up' : 'down'} ${Math.abs(delta)} against the week before`;
}

/** "Aug 22 to Aug 29", the window in words. */
export function describeWindow(start: Date, end: Date): string {
  const fmt = (d: Date) =>
    d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      timeZone: 'UTC',
    });
  return `${fmt(start)} to ${fmt(end)}`;
}
