import { NextResponse } from 'next/server';
import { z } from 'zod';
import { notifyPeptideLive, NotifyError } from '@/lib/notify-peptide-live';

/**
 * POST /api/notify-peptide-live
 *
 * Manually notify everyone who requested one peptide that it is now live.
 * The daily cron at /api/cron/notify-live does this for every peptide on its
 * own; this route is for sending one on demand, and for dry runs.
 *
 * Body: { "slug": "nad-plus", "dryRun": true, "limit": 200 }
 *
 * Auth: the ADMIN_PASSWORD, as `Authorization: Bearer <password>` or HTTP Basic.
 * Checked here rather than relying on middleware.ts, whose matcher only covers
 * /admin. A route that mails real people must not depend on a matcher pattern
 * staying correct.
 *
 * The sending logic, including every double-send guard, lives in
 * lib/notify-peptide-live.ts.
 */

export const dynamic = 'force-dynamic';

const BodySchema = z.object({
  slug: z.string().trim().min(1),
  /** Preview only. Returns exactly who would be emailed and sends nothing. */
  dryRun: z.boolean().default(false),
  /** Safety cap on a single run. */
  limit: z.number().int().positive().max(500).default(200),
});

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

  try {
    return NextResponse.json(await notifyPeptideLive(parsed.data));
  } catch (e) {
    if (e instanceof NotifyError) {
      return NextResponse.json({ error: e.message }, { status: e.status });
    }
    throw e;
  }
}
