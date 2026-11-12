import { NextResponse } from 'next/server';
import { z } from 'zod';
import { saveSignup, recordEmailSent, recordEmailFailed } from '@/lib/signups';
import { apiErrors, validationMessage } from '@/lib/api-messages';
import { sendConfirmationEmail, sendOwnerNotification } from '@/lib/email';

/**
 * POST /api/learn-signup
 *
 * Double opt-in: saves the signup as PENDING (confirmed_at = null) with a
 * one-time confirmation token, sends a confirmation email to the user, and
 * fires a notification email to the owner (buddypept@gmail.com).
 */

const SignupSchema = z.object({
  name: z.string().trim().min(1).max(100),
  email: z.string().trim().toLowerCase().email().max(200),
  source: z.string().trim().max(120).optional(),
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

  const parsed = SignupSchema.safeParse(body);
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

  try {
    // Save first. The row exists before any email is attempted, and a repeat
    // submission reuses it instead of creating a duplicate.
    let signup;
    try {
      signup = await saveSignup({
        name: parsed.data.name,
        email: parsed.data.email,
        requestedPeptide: `Learn: ${parsed.data.source ?? 'library'}`,
        locale: parsed.data.locale ?? 'en',
      });
    } catch (saveError) {
      console.error('learn-signup save error:', saveError);
      return NextResponse.json(
        { error: t('saveFailed') },
        { status: 500 }
      );
    }

    try {
      await sendConfirmationEmail({
        to: parsed.data.email,
        toName: parsed.data.name,
        confirmUrl: `${SITE_URL}${
          parsed.data.locale && parsed.data.locale !== 'en'
            ? `/${parsed.data.locale}`
            : ''
        }/confirm?token=${signup.token}`,
        locale: parsed.data.locale,
      });
      await recordEmailSent(signup.id, signup.emailAttempts);
    } catch (emailError) {
      console.error('learn-signup email send error:', emailError);
      await recordEmailFailed(signup.id, signup.emailAttempts, emailError);
      return NextResponse.json(
        { error: t('emailFailed') },
        { status: 500 }
      );
    }

    // Notify the owner once per new signup. Errors here are non-fatal: we
    // still want the user to get their flow even if the owner notification fails.
    if (signup.isNew) {
      try {
        await sendOwnerNotification({
          type: 'library-signup',
          name: parsed.data.name,
          email: parsed.data.email,
          detail: parsed.data.source ?? 'library',
        });
      } catch (ownerError) {
        console.error('learn-signup owner notification error:', ownerError);
      }
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error('learn-signup route error:', e);
    return NextResponse.json(
      { error: t('serverError') },
      { status: 500 }
    );
  }
}
