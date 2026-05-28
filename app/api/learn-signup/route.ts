import { NextResponse } from 'next/server';
import { z } from 'zod';
import { randomUUID } from 'crypto';
import { getSupabaseAdmin } from '@/lib/supabase';
import { sendConfirmationEmail } from '@/lib/email';

/**
 * POST /api/learn-signup
 *
 * Double opt-in: saves the signup as PENDING (confirmed_at = null) with a
 * one-time confirmation token, then sends a confirmation email via Brevo. The
 * lead only counts as "confirmed" in /admin after the user clicks the link in
 * the email, which fakes/typos cannot do.
 */

const SignupSchema = z.object({
  name: z.string().trim().min(1, 'Please enter your name.').max(100),
  email: z.string().trim().email('Please enter a valid email address.').max(200),
  source: z.string().trim().max(120).optional(),
});

const SITE_URL = 'https://buddypept.com';

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 });
  }

  const parsed = SignupSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? 'Please check your entries.' },
      { status: 400 }
    );
  }

  const token = randomUUID();

  try {
    const supabase = getSupabaseAdmin();
    const { error: insertError } = await supabase.from('peptide_requests').insert({
      name: parsed.data.name,
      email: parsed.data.email,
      requested_peptide: `Learn: ${parsed.data.source ?? 'library'}`,
      confirmation_token: token,
    });
    if (insertError) {
      console.error('learn-signup insert error:', insertError.message);
      return NextResponse.json(
        { error: 'We could not save that. Please try again.' },
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
      console.error('learn-signup email send error:', emailError);
      return NextResponse.json(
        {
          error:
            'We saved your details but could not send the confirmation email. Please try again in a minute.',
        },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error('learn-signup route error:', e);
    return NextResponse.json(
      { error: 'Server error. Please try again in a moment.' },
      { status: 500 }
    );
  }
}
