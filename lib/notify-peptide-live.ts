/**
 * Notifying requesters that a peptide is now in the calculator.
 *
 * One implementation, two callers: the manual admin route and the daily cron.
 * They must never drift, because a difference between them means the batch you
 * trigger by hand behaves differently from the one that runs while you sleep.
 *
 * ── Why it cannot double-email anyone ──
 * Two independent guards, both needed:
 *
 *  1. notification_sends is unique on (request_id, peptide_slug), and the row is
 *     inserted BEFORE the send, so the insert is the claim. A duplicate insert
 *     means another run already has that person, so this one skips them. A send
 *     that then fails flips the row to 'failed' and leaves fulfilled_at null, so
 *     a later run retries only the failures.
 *
 *  2. Dedupe on the email address. The constraint above protects a row, not a
 *     person: someone who submits the form three times has three rows, and one
 *     requester did exactly that on 2026-05-28. Without this they would have
 *     been emailed three times.
 */

import { getSupabaseAdmin } from '@/lib/supabase';
import { getPeptideBySlug } from '@/data/peptides';
import { sendPeptideLiveEmail } from '@/lib/email';
import {
  isNewsletterRow,
  keysForPeptide,
  normalizePeptideName,
} from '@/lib/peptide-matching';

interface RequestRow {
  id: string;
  name: string | null;
  email: string;
  requested_peptide: string;
  matched_slug: string | null;
  /**
   * Site language the person signed up in. Null on rows created before the
   * locale column existed; the send path treats that as English, which is
   * what those people were originally emailed in.
   */
  locale: string | null;
}

export interface NotifyResult {
  peptide: string;
  slug: string;
  dryRun: boolean;
  matchedRows: number;
  /** Distinct people, after deduping repeat submissions. */
  people: number;
  sent: number;
  skipped: number;
  failed: number;
  duplicateRowsClosed: number;
  recipients?: { email: string; requested: string }[];
  failures: { email: string; error: string }[];
}

export class NotifyError extends Error {
  constructor(
    message: string,
    readonly status: number
  ) {
    super(message);
  }
}

export async function notifyPeptideLive({
  slug,
  dryRun = false,
  limit = 200,
}: {
  slug: string;
  dryRun?: boolean;
  limit?: number;
}): Promise<NotifyResult> {
  // The peptide must actually be in the library before we tell anyone it is.
  const peptide = getPeptideBySlug(slug);
  if (!peptide) {
    throw new NotifyError(`No peptide with slug "${slug}" in data/peptides.ts.`, 404);
  }

  const supabase = getSupabaseAdmin();

  const { data: pending, error: selectError } = await supabase
    .from('peptide_requests')
    .select('id, name, email, requested_peptide, matched_slug, locale')
    .not('confirmed_at', 'is', null)
    .is('fulfilled_at', null)
    .order('created_at', { ascending: true });

  if (selectError) {
    throw new NotifyError(`Could not read requests: ${selectError.message}`, 500);
  }

  const keys = keysForPeptide(slug);

  const matches = (pending ?? [])
    // Newsletter signups live in the same table and must never receive a peptide
    // notification. Filtered here rather than in the query because PostgREST's
    // `not.like` wildcard handling is easy to get subtly wrong, and a miss means
    // emailing the wrong people.
    .filter((r: RequestRow) => !isNewsletterRow(r.requested_peptide))
    .filter((r: RequestRow) =>
      r.matched_slug
        ? r.matched_slug === slug
        : keys.has(normalizePeptideName(r.requested_peptide))
    )
    .slice(0, limit);

  // One person, one email. See guard 2 in the file comment.
  const seenEmail = new Set<string>();
  const primary: RequestRow[] = [];
  const duplicates: RequestRow[] = [];
  for (const row of matches) {
    const key = row.email.trim().toLowerCase();
    if (seenEmail.has(key)) duplicates.push(row);
    else {
      seenEmail.add(key);
      primary.push(row);
    }
  }

  const base = {
    peptide: peptide.name,
    slug,
    matchedRows: matches.length,
    people: primary.length,
  };

  if (dryRun) {
    return {
      ...base,
      dryRun: true,
      sent: 0,
      skipped: 0,
      failed: 0,
      duplicateRowsClosed: duplicates.length,
      recipients: primary.map((r) => ({
        email: r.email,
        requested: r.requested_peptide,
      })),
      failures: [],
    };
  }

  const sent: string[] = [];
  const failed: { email: string; error: string }[] = [];
  const skipped: string[] = [];

  for (const row of primary) {
    const { error: claimError } = await supabase
      .from('notification_sends')
      .insert({ request_id: row.id, peptide_slug: slug, status: 'sent' });

    if (claimError) {
      // 23505 is unique_violation. If the existing row succeeded, skip. If it
      // failed, this run is the retry, so take it over instead of skipping
      // forever.
      if (claimError.code === '23505') {
        const { data: existing } = await supabase
          .from('notification_sends')
          .select('status')
          .eq('request_id', row.id)
          .eq('peptide_slug', slug)
          .maybeSingle();

        if (existing?.status !== 'failed') {
          skipped.push(row.email);
          continue;
        }

        await supabase
          .from('notification_sends')
          .update({ status: 'sent', error_message: null })
          .eq('request_id', row.id)
          .eq('peptide_slug', slug);
      } else {
        failed.push({ email: row.email, error: `Claim failed: ${claimError.message}` });
        continue;
      }
    }

    try {
      await sendPeptideLiveEmail({
        to: row.email,
        toName: row.name ?? '',
        peptideName: peptide.name,
        peptideSlug: slug,
        locale: row.locale,
      });

      await supabase
        .from('peptide_requests')
        .update({ fulfilled_at: new Date().toISOString(), matched_slug: slug })
        .eq('id', row.id);

      sent.push(row.email);
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Unknown send error';
      await supabase
        .from('notification_sends')
        .update({ status: 'failed', error_message: message.slice(0, 500) })
        .eq('request_id', row.id)
        .eq('peptide_slug', slug);
      failed.push({ email: row.email, error: message });
    }
  }

  // Close out duplicate rows for anyone successfully emailed. Same person, must
  // not be mailed again, but leaving fulfilled_at null would keep them showing
  // as still owed forever.
  const sentEmails = new Set(sent.map((e) => e.trim().toLowerCase()));
  const toClose = duplicates.filter((r) => sentEmails.has(r.email.trim().toLowerCase()));
  if (toClose.length > 0) {
    await supabase
      .from('peptide_requests')
      .update({ fulfilled_at: new Date().toISOString(), matched_slug: slug })
      .in(
        'id',
        toClose.map((r) => r.id)
      );
  }

  return {
    ...base,
    dryRun: false,
    sent: sent.length,
    skipped: skipped.length,
    failed: failed.length,
    duplicateRowsClosed: toClose.length,
    failures: failed,
  };
}
