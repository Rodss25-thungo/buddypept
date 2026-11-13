import { randomUUID } from 'crypto';
import { getSupabaseAdmin } from '@/lib/supabase';
import type { Attribution, ConsentRecord } from '@/lib/consent';

/**
 * Save-first signup storage (server-side only).
 *
 * The row is saved before any email is attempted, and the email result is
 * recorded on the row. A repeat submission of the same email and request
 * reuses the existing row and its confirmation token instead of creating a
 * duplicate.
 */

export interface SignupInput {
  name: string;
  email: string;
  requestedPeptide: string;
  locale: string;
  matchedSlug?: string | null;
  consent?: ConsentRecord;
  attribution?: Attribution;
}

export interface SavedSignup {
  id: string;
  token: string;
  /** False when an earlier submission already existed and was reused. */
  isNew: boolean;
  emailAttempts: number;
  /** Their real confirmation time, or null while unconfirmed. */
  confirmedAt: string | null;
  /** True if this row holds marketing consent, given now or earlier. */
  marketingConsent: boolean;
  marketingConsentAt: string | null;
}

/** Columns written when consent is given. Consent is only ever added here. */
function consentColumns(consent: ConsentRecord, at: string) {
  return {
    marketing_consent: true,
    marketing_consent_at: at,
    marketing_consent_source: consent.consentSource,
    marketing_consent_text: consent.consentText,
    marketing_consent_version: consent.consentVersion,
  };
}

/** First-touch columns; only non-empty values. */
function attributionColumns(a: Attribution | undefined) {
  if (!a) return {};
  return Object.fromEntries(
    Object.entries(a).filter(([, v]) => typeof v === 'string' && v !== '')
  ) as Record<string, string>;
}

/** Escapes LIKE wildcards so an email's "_" matches only itself. */
function escapeLike(value: string): string {
  return value.replace(/[\\%_]/g, '\\$&');
}

export async function saveSignup(input: SignupInput): Promise<SavedSignup> {
  const supabase = getSupabaseAdmin();

  const { data: found, error: lookupError } = await supabase
    .from('peptide_requests')
    .select(
      'id, confirmation_token, email_attempts, matched_slug, confirmed_at, marketing_consent, marketing_consent_at, utm_source, referrer, landing_path'
    )
    .ilike('email', escapeLike(input.email))
    .ilike('requested_peptide', escapeLike(input.requestedPeptide))
    .order('created_at', { ascending: true })
    .limit(1);
  if (lookupError) {
    throw new Error(`Signup lookup failed: ${lookupError.message}`);
  }

  const existing = found?.[0];
  if (existing) {
    const updates: Record<string, string | boolean | null> = {};
    const now = new Date().toISOString();
    // Upgrade only. A later submission without the box ticked never
    // withdraws consent; withdrawal is the unsubscribe link.
    const addsConsent = Boolean(input.consent?.marketingConsent) && !existing.marketing_consent;
    if (addsConsent && input.consent) {
      Object.assign(updates, consentColumns(input.consent, now));
    }
    // First touch stays first: only fill attribution the row does not have.
    if (!existing.utm_source && !existing.referrer && !existing.landing_path) {
      Object.assign(updates, attributionColumns(input.attribution));
    }
    if (input.matchedSlug && !existing.matched_slug) {
      updates.matched_slug = input.matchedSlug;
    }
    const token: string = existing.confirmation_token ?? randomUUID();
    if (!existing.confirmation_token) updates.confirmation_token = token;
    if (Object.keys(updates).length > 0) {
      const { error } = await supabase
        .from('peptide_requests')
        .update(updates)
        .eq('id', existing.id);
      if (error) console.error('Signup update error:', error.message);
    }
    return {
      id: existing.id,
      token,
      isNew: false,
      emailAttempts: existing.email_attempts ?? 0,
      confirmedAt: existing.confirmed_at ?? null,
      marketingConsent: Boolean(existing.marketing_consent) || addsConsent,
      marketingConsentAt: addsConsent ? now : (existing.marketing_consent_at ?? null),
    };
  }

  const token = randomUUID();
  const now = new Date().toISOString();
  const givesConsent = Boolean(input.consent?.marketingConsent);
  const { data: inserted, error: insertError } = await supabase
    .from('peptide_requests')
    .insert({
      name: input.name,
      email: input.email,
      requested_peptide: input.requestedPeptide,
      confirmation_token: token,
      locale: input.locale,
      matched_slug: input.matchedSlug ?? null,
      ...(givesConsent && input.consent ? consentColumns(input.consent, now) : {}),
      ...attributionColumns(input.attribution),
    })
    .select('id')
    .single();
  if (insertError || !inserted) {
    throw new Error(`Signup insert failed: ${insertError?.message ?? 'no row'}`);
  }
  return {
    id: inserted.id,
    token,
    isNew: true,
    emailAttempts: 0,
    confirmedAt: null,
    marketingConsent: givesConsent,
    marketingConsentAt: givesConsent ? now : null,
  };
}

export async function recordEmailSent(
  id: string,
  attempts: number
): Promise<void> {
  const { error } = await getSupabaseAdmin()
    .from('peptide_requests')
    .update({
      email_status: 'sent',
      email_sent_at: new Date().toISOString(),
      email_attempts: attempts + 1,
      email_last_error: null,
    })
    .eq('id', id);
  if (error) console.error('Record email sent error:', error.message);
}

export async function recordEmailFailed(
  id: string,
  attempts: number,
  cause: unknown
): Promise<void> {
  const message = cause instanceof Error ? cause.message : String(cause);
  const { error } = await getSupabaseAdmin()
    .from('peptide_requests')
    .update({
      email_status: 'failed',
      email_attempts: attempts + 1,
      email_last_error: message.slice(0, 500),
    })
    .eq('id', id);
  if (error) console.error('Record email failed error:', error.message);
}
