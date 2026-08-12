import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getSupabaseAdmin } from '@/lib/supabase';
import { getPeptideBySlug } from '@/data/peptides';
import { sendPeptideLiveEmail } from '@/lib/email';
import {
  isNewsletterRow,
  keysForPeptide,
  normalizePeptideName,
} from '@/lib/peptide-matching';

/**
 * POST /api/notify-peptide-live
 *
 * Tells the people who requested a peptide that it is now in the calculator.
 * This is the missing half of the request flow: today someone asks, confirms
 * their email, and never hears back.
 *
 * Body: { "slug": "nad-plus", "dryRun": true, "limit": 50 }
 *
 * Auth: the ADMIN_PASSWORD, sent as `Authorization: Bearer <password>` or as
 * HTTP Basic. Checked here rather than relying on middleware.ts, whose matcher
 * only covers /admin. A route that sends mail to real people must not depend on
 * a matcher pattern staying correct.
 *
 * ── Why it cannot double-email anyone ──
 * notification_sends has unique(request_id, peptide_slug). We insert the row
 * BEFORE sending, so the insert is the claim. A duplicate insert fails, which
 * means a concurrent or repeated run skips that person instead of mailing them
 * twice. If the send then fails, the row is flipped to 'failed' and a later run
 * retries only those. A crash mid-run is safe to re-run in full.
 *
 * ── Matching ──
 * A request matches when its normalized text equals the normalized peptide name
 * or one of its aliases. "NAD 500", "nad-500", and "NAD500" all collapse to the
 * same key. Matching is exact on that key, never fuzzy, because a false positive
 * emails someone about a peptide they did not ask for. Anything the normalizer
 * cannot catch is handled by setting matched_slug by hand, which this route also
 * honours.
 */

export const dynamic = 'force-dynamic';

const BodySchema = z.object({
  slug: z.string().trim().min(1),
  /** Preview only. Returns exactly who would be emailed and sends nothing. */
  dryRun: z.boolean().default(false),
  /** Safety cap on a single run. */
  limit: z.number().int().positive().max(500).default(200),
});

interface RequestRow {
  id: string;
  name: string | null;
  email: string;
  requested_peptide: string;
  matched_slug: string | null;
}

function isAuthorized(request: Request): boolean {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) return false;

  const header = request.headers.get('authorization') ?? '';

  if (header.startsWith('Bearer ')) {
    return timingSafeEqual(header.slice('Bearer '.length), expected);
  }
  if (header.startsWith('Basic ')) {
    let decoded = '';
    try {
      decoded = atob(header.slice('Basic '.length));
    } catch {
      return false;
    }
    return timingSafeEqual(decoded.slice(decoded.indexOf(':') + 1), expected);
  }
  return false;
}

/** Constant-time compare so the password cannot be guessed a character at a time. */
function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

export async function POST(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'Not authorized.' }, { status: 401 });
  }

  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 });
  }

  const parsed = BodySchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? 'Invalid request.' },
      { status: 400 }
    );
  }
  const { slug, dryRun, limit } = parsed.data;

  // The peptide must actually be in the library before we tell anyone it is.
  const peptide = getPeptideBySlug(slug);
  if (!peptide) {
    return NextResponse.json(
      { error: `No peptide with slug "${slug}" in data/peptides.ts.` },
      { status: 404 }
    );
  }

  const supabase = getSupabaseAdmin();

  // Everyone still owed a notification. Newsletter rows ("Learn: homepage") are
  // excluded by is_peptide_request() so they can never be emailed about a peptide.
  const { data: pending, error: selectError } = await supabase
    .from('peptide_requests')
    .select('id, name, email, requested_peptide, matched_slug')
    .not('confirmed_at', 'is', null)
    .is('fulfilled_at', null)
    .order('created_at', { ascending: true });

  if (selectError) {
    return NextResponse.json(
      { error: `Could not read requests: ${selectError.message}` },
      { status: 500 }
    );
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

  // One person, one email. The unique constraint on notification_sends is
  // (request_id, peptide_slug), which stops a row being sent twice but does NOT
  // stop the same person being emailed twice: someone who submits the form three
  // times has three rows. That is not hypothetical, one requester did exactly
  // that on 2026-05-28. Dedupe on the address, keeping the earliest row.
  const seenEmail = new Set<string>();
  const primary: RequestRow[] = [];
  const duplicates: RequestRow[] = [];
  for (const row of matches) {
    const key = row.email.trim().toLowerCase();
    if (seenEmail.has(key)) {
      duplicates.push(row);
    } else {
      seenEmail.add(key);
      primary.push(row);
    }
  }

  if (dryRun) {
    return NextResponse.json({
      dryRun: true,
      peptide: peptide.name,
      slug,
      wouldEmail: primary.length,
      duplicateRowsSuppressed: duplicates.length,
      recipients: primary.map((r) => ({
        email: r.email,
        requested: r.requested_peptide,
      })),
    });
  }

  const sent: string[] = [];
  const failed: { email: string; error: string }[] = [];
  const skipped: string[] = [];

  for (const row of primary) {
    // Claim first. A unique-constraint violation means someone else already has
    // this person, so we skip rather than risk a second email.
    const { error: claimError } = await supabase
      .from('notification_sends')
      .insert({ request_id: row.id, peptide_slug: slug, status: 'sent' });

    if (claimError) {
      // 23505 is unique_violation: this person already has a row for this
      // peptide. If that row succeeded, skip them. If it failed, this run is the
      // retry, so take it over instead of skipping forever.
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

        // Re-claim the failed row before retrying the send.
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
      });

      await supabase
        .from('peptide_requests')
        .update({ fulfilled_at: new Date().toISOString(), matched_slug: slug })
        .eq('id', row.id);

      sent.push(row.email);
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Unknown send error';
      // Flip the claim to failed so a later run picks it back up. fulfilled_at
      // stays null, so this person is still counted as owed a notification.
      await supabase
        .from('notification_sends')
        .update({ status: 'failed', error_message: message.slice(0, 500) })
        .eq('request_id', row.id)
        .eq('peptide_slug', slug);

      failed.push({ email: row.email, error: message });
    }
  }

  // Close out the duplicate rows for anyone who was successfully emailed. They
  // are the same person and must not be mailed again, but leaving fulfilled_at
  // null would keep them showing as still owed a notification forever.
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

  return NextResponse.json({
    peptide: peptide.name,
    slug,
    matchedRows: matches.length,
    people: primary.length,
    sent: sent.length,
    skipped: skipped.length,
    failed: failed.length,
    duplicateRowsClosed: toClose.length,
    failures: failed,
  });
}
