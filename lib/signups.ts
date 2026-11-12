import { randomUUID } from 'crypto';
import { getSupabaseAdmin } from '@/lib/supabase';

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
}

export interface SavedSignup {
  id: string;
  token: string;
  /** False when an earlier submission already existed and was reused. */
  isNew: boolean;
  emailAttempts: number;
}

/** Escapes LIKE wildcards so an email's "_" matches only itself. */
function escapeLike(value: string): string {
  return value.replace(/[\\%_]/g, '\\$&');
}

export async function saveSignup(input: SignupInput): Promise<SavedSignup> {
  const supabase = getSupabaseAdmin();

  const { data: found, error: lookupError } = await supabase
    .from('peptide_requests')
    .select('id, confirmation_token, email_attempts, matched_slug')
    .ilike('email', escapeLike(input.email))
    .ilike('requested_peptide', escapeLike(input.requestedPeptide))
    .order('created_at', { ascending: true })
    .limit(1);
  if (lookupError) {
    throw new Error(`Signup lookup failed: ${lookupError.message}`);
  }

  const existing = found?.[0];
  if (existing) {
    const updates: Record<string, string> = {};
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
    };
  }

  const token = randomUUID();
  const { data: inserted, error: insertError } = await supabase
    .from('peptide_requests')
    .insert({
      name: input.name,
      email: input.email,
      requested_peptide: input.requestedPeptide,
      confirmation_token: token,
      locale: input.locale,
      matched_slug: input.matchedSlug ?? null,
    })
    .select('id')
    .single();
  if (insertError || !inserted) {
    throw new Error(`Signup insert failed: ${insertError?.message ?? 'no row'}`);
  }
  return { id: inserted.id, token, isNew: true, emailAttempts: 0 };
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
