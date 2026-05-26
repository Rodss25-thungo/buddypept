import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getSupabaseAdmin } from '@/lib/supabase';

/**
 * POST /api/learn-signup
 *
 * Captures name + email when someone unlocks the "Learn about peptides"
 * library. Stored in the same `peptide_requests` table (so it shows in /admin)
 * with a "Learn:" marker in the requested_peptide column, which avoids needing
 * a new Supabase table. Brand rule: only name + email, never health data.
 */

const SignupSchema = z.object({
  name: z.string().trim().min(1, 'Please enter your name.').max(100),
  email: z.string().trim().email('Please enter a valid email address.').max(200),
  source: z.string().trim().max(120).optional(),
});

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

  try {
    const supabase = getSupabaseAdmin();
    const { error } = await supabase.from('peptide_requests').insert({
      name: parsed.data.name,
      email: parsed.data.email,
      requested_peptide: `Learn: ${parsed.data.source ?? 'library'}`,
    });
    if (error) {
      console.error('learn-signup insert error:', error.message);
      return NextResponse.json(
        { error: 'We could not save that. Please try again.' },
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
