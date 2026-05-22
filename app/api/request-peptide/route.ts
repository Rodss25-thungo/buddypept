import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getSupabaseAdmin } from '@/lib/supabase';

/**
 * POST /api/request-peptide
 *
 * Saves a "request a peptide" submission (name + email + desired peptide) to
 * the Supabase `peptide_requests` table. This is BuddyPept's lead-capture +
 * roadmap-signal mechanism: people tell us which peptide they want next, and
 * we get their email to notify them.
 *
 * Brand rule: we collect ONLY name + email + the requested peptide. No health
 * data, no tracking. The secret key stays server-side; the browser never sees it.
 */

const RequestSchema = z.object({
  name: z.string().trim().min(1, 'Please enter your name.').max(100),
  email: z.string().trim().email('Please enter a valid email address.').max(200),
  requestedPeptide: z
    .string()
    .trim()
    .min(1, 'Please enter the peptide name.')
    .max(200),
});

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 });
  }

  const parsed = RequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? 'Please check your entries.' },
      { status: 400 }
    );
  }

  try {
    const supabase = getSupabaseAdmin();
    const { error } = await supabase.from('peptide_requests').insert({
      name: parsed.data.name,
      email: parsed.data.email,
      requested_peptide: parsed.data.requestedPeptide,
    });
    if (error) {
      console.error('Supabase insert error:', error.message);
      return NextResponse.json(
        { error: 'We could not save your request. Please try again.' },
        { status: 500 }
      );
    }
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error('request-peptide route error:', e);
    return NextResponse.json(
      { error: 'Server error. Please try again in a moment.' },
      { status: 500 }
    );
  }
}
