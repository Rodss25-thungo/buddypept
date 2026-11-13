import { NextResponse } from 'next/server';
import { createHmac, timingSafeEqual } from 'crypto';
import { z } from 'zod';
import { getSupabaseAdmin } from '@/lib/supabase';

/**
 * POST /api/brevo-webhook
 *
 * Brevo calls this when someone unsubscribes from a marketing email. Brevo
 * itself is the authority on who can be emailed (the contact is blocklisted
 * there); this mirrors the date onto every signup row for that address so the
 * admin view and reports show it.
 *
 * Consent evidence is never erased: marketing_consent stays as it was, and
 * marketing_unsubscribed_at records the withdrawal.
 *
 * Auth: Brevo sends `Authorization: Bearer <token>`, where the token is an
 * HMAC of the label "brevo-webhook" keyed with CRON_SECRET. No extra secret
 * to store; scripts/brevo-webhook-setup.ts registers the same value.
 */

const EventSchema = z.object({
  event: z.string(),
  email: z.string().trim().toLowerCase().email(),
  date_event: z.string().optional(),
});

function authorized(header: string | null): boolean {
  const key = process.env.CRON_SECRET;
  if (!key || !header?.startsWith('Bearer ')) return false;
  const secret = createHmac('sha256', key).update('brevo-webhook').digest('hex');
  const given = Buffer.from(header.slice('Bearer '.length));
  const expected = Buffer.from(secret);
  return given.length === expected.length && timingSafeEqual(given, expected);
}

function escapeLike(value: string): string {
  return value.replace(/[\\%_]/g, '\\$&');
}

export async function POST(request: Request) {
  if (!authorized(request.headers.get('authorization'))) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'invalid json' }, { status: 400 });
  }

  // Brevo can batch events into an array.
  const events = (Array.isArray(body) ? body : [body])
    .map((e) => EventSchema.safeParse(e))
    .filter((r) => r.success)
    .map((r) => r.data);

  const supabase = getSupabaseAdmin();
  let updated = 0;
  for (const e of events) {
    if (!/unsub/i.test(e.event)) continue;
    const at = e.date_event ? new Date(e.date_event) : new Date();
    const { data, error } = await supabase
      .from('peptide_requests')
      .update({
        marketing_unsubscribed_at: Number.isNaN(at.getTime())
          ? new Date().toISOString()
          : at.toISOString(),
      })
      .ilike('email', escapeLike(e.email))
      .is('marketing_unsubscribed_at', null)
      .select('id');
    if (error) {
      console.error('brevo-webhook update error:', error.message);
      return NextResponse.json({ error: 'update failed' }, { status: 500 });
    }
    updated += data?.length ?? 0;
  }

  return NextResponse.json({ ok: true, updated });
}
