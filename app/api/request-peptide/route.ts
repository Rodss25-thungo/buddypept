import { NextResponse } from 'next/server';
import { z } from 'zod';
import { randomUUID } from 'crypto';
import { getSupabaseAdmin } from '@/lib/supabase';
import { apiErrors, validationMessage } from '@/lib/api-messages';
import {
  isNonPeptideRequest,
  sendConfirmationEmail,
  sendNonPeptideAutoReply,
  sendOwnerNotification,
} from '@/lib/email';

/**
 * POST /api/request-peptide
 *
 * Saves a "request a peptide" submission (name + email + desired peptide) and:
 *   - For peptide requests: sends a confirmation email (double opt-in) and
 *     notifies the owner.
 *   - For non-peptide requests (testosterone, steroids): sends a polite
 *     auto-reply explaining we only cover peptides, and notifies the owner
 *     with a flag so they see the attempt.
 *
 * Brand rule: collect only name + email + the requested peptide. No health
 * data, no tracking.
 */

const RequestSchema = z.object({
  name: z.string().trim().min(1).max(100),
  email: z.string().trim().email().max(200),
  requestedPeptide: z.string().trim().min(1).max(200),
  /**
   * Site language the visitor was reading. Recorded on the row so the
   * confirmation email, and any later email, goes out in the same language.
   */
  locale: z.enum(['en', 'pt', 'es']).optional(),
});

const SITE_URL = 'https://buddypept.com';

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    // No parsed body yet, so no locale to read. English is the only option.
    const t = await apiErrors(null);
    return NextResponse.json({ error: t('invalidRequest') }, { status: 400 });
  }

  const parsed = RequestSchema.safeParse(body);
  // Read the locale off the raw body: it survives even when validation failed
  // on some other field, so the error comes back in the right language.
  const t = await apiErrors(
    (body as { locale?: string } | null)?.locale ?? null
  );
  if (!parsed.success) {
    return NextResponse.json(
      { error: validationMessage(parsed.error, t) },
      { status: 400 }
    );
  }

  const isNonPeptide = isNonPeptideRequest(parsed.data.requestedPeptide);
  const token = randomUUID();

  try {
    const supabase = getSupabaseAdmin();
    const { error } = await supabase.from('peptide_requests').insert({
      name: parsed.data.name,
      email: parsed.data.email,
      requested_peptide: parsed.data.requestedPeptide,
      confirmation_token: token,
      locale: parsed.data.locale ?? 'en',
    });
    if (error) {
      console.error('Supabase insert error:', error.message);
      return NextResponse.json(
        { error: t('saveRequestFailed') },
        { status: 500 }
      );
    }

    try {
      if (isNonPeptide) {
        // Send the polite auto-reply instead of a confirmation. They are not
        // asked to confirm because we are not adding the requested item.
        await sendNonPeptideAutoReply({
          to: parsed.data.email,
          toName: parsed.data.name,
          requested: parsed.data.requestedPeptide,
          locale: parsed.data.locale,
        });
      } else {
        await sendConfirmationEmail({
          to: parsed.data.email,
          toName: parsed.data.name,
          confirmUrl: `${SITE_URL}${
            parsed.data.locale && parsed.data.locale !== 'en'
              ? `/${parsed.data.locale}`
              : ''
          }/confirm?token=${token}`,
          locale: parsed.data.locale,
        });
      }
    } catch (emailError) {
      console.error('request-peptide email send error:', emailError);
      return NextResponse.json(
        { error: t('emailRequestFailed') },
        { status: 500 }
      );
    }

    // Owner notification (non-fatal if it fails).
    try {
      await sendOwnerNotification({
        type: isNonPeptide ? 'non-peptide-request' : 'peptide-request',
        name: parsed.data.name,
        email: parsed.data.email,
        detail: parsed.data.requestedPeptide,
      });
    } catch (ownerError) {
      console.error('request-peptide owner notification error:', ownerError);
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error('request-peptide route error:', e);
    return NextResponse.json(
      { error: t('serverError') },
      { status: 500 }
    );
  }
}
