import { NextResponse } from 'next/server';
import { z } from 'zod';
import { randomUUID } from 'crypto';
import { getSupabaseAdmin } from '@/lib/supabase';
import { sendConfirmationEmail } from '@/lib/email';

/**
 * POST /api/request-peptide
 *
 * Saves a "request a peptide" submission (name + email + desired peptide) as
 * PENDING and sends a confirmation email via Brevo. The lead is only counted
 * as confirmed in /admin once the user clicks the confirm link.
 *
 * Brand rule: collect only name + email + the requested peptide. No health
 * data, no tracking.
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

const SITE_URL = 'https://buddypept.com';

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

  const token = randomUUID();

  try {
    const supabase = getSupabaseAdmin();
    const { error } = await supabase.from('peptide_requests').insert({
      name: parsed.data.name,
      email: parsed.data.email,
      requested_peptide: parsed.data.requestedPeptide,
      confirmation_token: token,
    });
    if (error) {
      console.error('Supabase insert error:', error.message);
      return NextResponse.json(
        { error: 'We could not save your request. Please try again.' },
        { status: 500 }
      );
    }

    try {
      await sendConfirmationEmail({
        to: parsed.data.email,
        toName: parsed.data.name,
        confirmUrl: `${SITE_URL}/confirm?token=${token}`,
      });
    } catch (emailError) {
      console.error('request-peptide email send error:', emailError);
      return NextResponse.json(
        {
          error:
            'We saved your request but could not send the confirmation email. Please try again in a minute.',
        },
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
