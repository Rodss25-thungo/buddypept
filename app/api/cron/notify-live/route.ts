import { NextResponse } from 'next/server';
import { CALCULATOR_PEPTIDES } from '@/data/calculator-peptides';
import { notifyPeptideLive } from '@/lib/notify-peptide-live';

/**
 * GET /api/cron/notify-live  — runs daily, scheduled in vercel.json.
 *
 * Walks every peptide a visitor can actually reach and emails anyone still owed
 * a "your peptide is live" notification. Add a peptide to data/peptides.ts and
 * data/calculator-peptides.ts, ship it, and the people who asked for it hear
 * back within a day without you doing anything.
 *
 * It sweeps CALCULATOR_PEPTIDES rather than the raw PEPTIDES array on purpose.
 * An entry can exist in the data with no dropdown row and no learn page, and
 * sweeping the raw array told those requesters their peptide was live, then
 * dropped them on a calculator that had never heard of it. If nobody can pick
 * it, nobody gets an email about it.
 *
 * Vercel Hobby allows daily cron only, so the worst-case wait is 24 hours.
 *
 * Why it is safe to run every single day against every peptide: the guards in
 * lib/notify-peptide-live.ts mean a person who has already been notified is
 * matched by nothing (fulfilled_at is set) and, even if they were, the unique
 * constraint on notification_sends would stop a second send. A normal day sends
 * zero emails and writes nothing.
 *
 * Auth: Vercel sends `Authorization: Bearer $CRON_SECRET` on scheduled
 * invocations when CRON_SECRET is set. Without that env var the route refuses
 * to run rather than sitting open to the internet, because anything that can
 * call this can mail your users.
 */

export const dynamic = 'force-dynamic';
export const maxDuration = 300;

export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    return NextResponse.json(
      { error: 'CRON_SECRET is not configured. Refusing to run.' },
      { status: 503 }
    );
  }
  if (request.headers.get('authorization') !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'Not authorized.' }, { status: 401 });
  }

  const results = [];
  let totalSent = 0;
  let totalFailed = 0;

  for (const peptide of CALCULATOR_PEPTIDES) {
    try {
      const result = await notifyPeptideLive({ slug: peptide.slug });
      totalSent += result.sent;
      totalFailed += result.failed;
      // Only report peptides that actually did something, so the log is
      // readable on the overwhelming majority of days when nothing happens.
      if (result.sent > 0 || result.failed > 0) results.push(result);
    } catch (e) {
      totalFailed += 1;
      results.push({
        slug: peptide.slug,
        error: e instanceof Error ? e.message : 'Unknown error',
      });
    }
  }

  return NextResponse.json({
    ranAt: new Date().toISOString(),
    peptidesChecked: CALCULATOR_PEPTIDES.length,
    totalSent,
    totalFailed,
    results,
  });
}
