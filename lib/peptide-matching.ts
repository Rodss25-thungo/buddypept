/**
 * Matching free-text peptide requests to library slugs.
 *
 * Normally two call sites would not justify a shared module. This one does: the
 * admin demand table and the notification send route must agree exactly on who
 * matches what. If they drift, the admin page shows a count that the send route
 * will not honour, and the number you are looking at stops being true.
 *
 * Matching is exact on the normalized key and deliberately never fuzzy. A false
 * positive emails someone about a peptide they never asked for, which is worse
 * than a miss. Misses are handled by setting matched_slug by hand.
 */

import { PEPTIDES } from '@/data/peptides';

/** Mirrors public.normalize_peptide_name() in the database. Keep them identical. */
export function normalizePeptideName(raw: string): string {
  return raw.trim().toLowerCase().replace(/[^a-z0-9]/g, '');
}

/**
 * True for newsletter signups, which learn-signup/route.ts writes into the same
 * table as "Learn: <source>". Mirrors public.is_peptide_request().
 */
export function isNewsletterRow(requestedPeptide: string): boolean {
  return requestedPeptide.startsWith('Learn: ');
}

/** Every normalized key that should resolve to a given peptide. */
export function keysForPeptide(slug: string): Set<string> {
  const peptide = PEPTIDES.find((p) => p.slug === slug);
  if (!peptide) return new Set();
  const keys = new Set(
    [peptide.name, ...(peptide.aliases ?? [])].map(normalizePeptideName)
  );
  keys.add(normalizePeptideName(peptide.slug));
  return keys;
}

/**
 * Resolve request text to a library slug, or null if nothing matches exactly.
 * Null is the normal case for a peptide that is not in the library yet.
 */
export function resolveSlug(requestedPeptide: string): string | null {
  if (isNewsletterRow(requestedPeptide)) return null;
  const key = normalizePeptideName(requestedPeptide);
  for (const peptide of PEPTIDES) {
    if (keysForPeptide(peptide.slug).has(key)) return peptide.slug;
  }
  return null;
}
