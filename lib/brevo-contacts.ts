/**
 * Brevo contact sync (server-side only).
 *
 * Keeps one Brevo contact per signup so the contact list reflects who signed
 * up, in which language, from where, and whether they confirmed.
 *
 * Deliberate limits:
 *   - No list membership is ever set. A contact here is a record, not a
 *     marketing subscriber.
 *   - MARKETING_CONSENT is never written. The attribute exists so a verified
 *     value can be set by hand; an empty value means consent is not recorded.
 *   - Brevo's own unsubscribe and blocklist status is never touched.
 *   - Failures are logged and swallowed. A Brevo outage must never block a
 *     signup or a confirmation.
 */

const BREVO_CONTACTS_URL = 'https://api.brevo.com/v3/contacts';

export interface ContactSyncInput {
  email: string;
  name: string;
  locale?: string | null;
  requestedPeptide: string;
  /** ISO timestamp, set once the person has confirmed their email. */
  confirmedAt?: string | null;
}

/** "library:homepage" for Learn signups, "peptide-request" for requests. */
export function signupSource(requestedPeptide: string): string {
  return requestedPeptide.startsWith('Learn: ')
    ? `library:${requestedPeptide.slice('Learn: '.length)}`
    : 'peptide-request';
}

function splitName(name: string): { first: string; last: string } {
  const parts = name.trim().split(/\s+/);
  return { first: parts[0] ?? '', last: parts.slice(1).join(' ') };
}

export async function syncBrevoContact(
  input: ContactSyncInput
): Promise<boolean> {
  const apiKey = process.env.BREVO_API_KEY;
  if (!apiKey) {
    console.error('Brevo contact sync skipped: BREVO_API_KEY is not set.');
    return false;
  }

  const { first, last } = splitName(input.name);
  const confirmed = Boolean(input.confirmedAt);
  const attributes: Record<string, string | boolean> = {
    FIRSTNAME: first,
    LASTNAME: last,
    LANGUAGE: input.locale ?? 'en',
    SIGNUP_SOURCE: signupSource(input.requestedPeptide),
    CONFIRMED: confirmed,
  };
  if (input.confirmedAt) {
    attributes.CONFIRMED_AT = input.confirmedAt.slice(0, 10);
  }

  try {
    const res = await fetch(BREVO_CONTACTS_URL, {
      method: 'POST',
      headers: {
        accept: 'application/json',
        'api-key': apiKey,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        email: input.email,
        attributes,
        updateEnabled: true,
      }),
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) {
      console.error(
        `Brevo contact sync failed: ${res.status} ${await res.text()}`
      );
      return false;
    }
    return true;
  } catch (e) {
    console.error('Brevo contact sync error:', e);
    return false;
  }
}
