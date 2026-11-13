import { z } from 'zod';
import { getTranslations } from 'next-intl/server';

/**
 * Optional marketing-email consent (server-side).
 *
 * The checkbox is separate and unchecked. Nothing on the site depends on it:
 * the calculator, the library unlock and peptide requests all work without it.
 *
 * The label is read here, from the same catalog the form renders, so the
 * wording stored as evidence is exactly the wording the person saw, and a
 * client cannot send its own text. Bump CONSENT_VERSION whenever the
 * `consent.label` copy changes in any language.
 */
export const CONSENT_VERSION = '2026-11-12-v1';

/** Attribution fields a signup form may send. All optional, all short. */
export const AttributionSchema = z
  .object({
    utm_source: z.string().trim().toLowerCase().max(100).optional(),
    utm_medium: z.string().trim().toLowerCase().max(100).optional(),
    utm_campaign: z.string().trim().toLowerCase().max(100).optional(),
    utm_content: z.string().trim().toLowerCase().max(100).optional(),
    referrer: z.string().trim().toLowerCase().max(100).optional(),
    landing_path: z.string().trim().max(200).optional(),
  })
  .optional()
  // Attribution is a nice-to-have. A malformed blob is dropped, never a 400.
  .catch(undefined);

export type Attribution = z.infer<typeof AttributionSchema>;

export interface ConsentRecord {
  marketingConsent: boolean;
  consentSource: string;
  consentText: string | null;
  consentVersion: string | null;
}

export async function buildConsentRecord(
  given: boolean | undefined,
  locale: string,
  source: string
): Promise<ConsentRecord> {
  if (!given) {
    return {
      marketingConsent: false,
      consentSource: source,
      consentText: null,
      consentVersion: null,
    };
  }
  const t = await getTranslations({ locale, namespace: 'consent' });
  return {
    marketingConsent: true,
    consentSource: source,
    consentText: `[${locale}] ${t('label')}`,
    consentVersion: CONSENT_VERSION,
  };
}
