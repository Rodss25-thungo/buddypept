import { NextResponse } from 'next/server';
import { gatherWeeklyReport } from '@/lib/weekly-report';
import { sendWeeklyReport } from '@/lib/email';

/**
 * GET /api/cron/weekly-report — the Sunday evening performance email.
 *
 * Scheduled weekly in vercel.json, but it does not trust the schedule. The
 * existing daily job notes that Vercel Hobby only guarantees daily triggering,
 * so a weekly cron expression may be fired more often than once a week. This
 * route checks the day itself and exits without sending on any day that is not
 * Sunday. Worst case on a plan that ignores the weekly expression is six cheap
 * no-op invocations and one email, rather than seven emails.
 *
 * `?force=1` sends regardless of the day, for testing. It still requires the
 * cron secret, so it is not a way in from the outside.
 *
 * Auth matches the notify-live job: Vercel sends
 * `Authorization: Bearer $CRON_SECRET` on scheduled invocations. Without the
 * env var the route refuses to run rather than sitting open, because anything
 * that can call this can read the whole signup table back out by email.
 */

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

/** Sunday. Date.getUTCDay() counts from Sunday = 0. */
const SUNDAY = 0;

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

  const now = new Date();
  const force = new URL(request.url).searchParams.get('force') === '1';

  if (now.getUTCDay() !== SUNDAY && !force) {
    return NextResponse.json({
      ranAt: now.toISOString(),
      sent: false,
      reason: 'Not Sunday. The report sends once a week.',
    });
  }

  try {
    const report = await gatherWeeklyReport(now);
    await sendWeeklyReport({ report });
    return NextResponse.json({
      ranAt: now.toISOString(),
      sent: true,
      signups: report.signups,
      confirmed: report.confirmed,
      gaps: report.gaps.length,
    });
  } catch (e) {
    // A failed report must not retry itself into a mailbox full of duplicates,
    // so it reports the error and stops. The next Sunday covers the same
    // ground, since every figure is derived from the table rather than from a
    // running tally that could fall behind.
    return NextResponse.json(
      {
        ranAt: now.toISOString(),
        sent: false,
        error: e instanceof Error ? e.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
