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
 * than a miss.
 *
 * Fuzzy lives in suggestPeptide() at the bottom, and it is only ever shown to
 * the person who typed the text, never used to decide who gets an email. They
 * confirm or they do not. A guess the visitor never saw is not evidence of
 * anything.
 */

import { PEPTIDES } from '@/data/peptides';
import { PEPTIDE_VOCABULARY } from '@/data/peptide-vocabulary';

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

/* ────────────────────────── suggestions ────────────────────────── */

export interface PeptideSuggestion {
  /** Slug in data/peptides.ts, only when the calculator curates this one. */
  slug: string | null;
  /** Canonical name, for showing back to the person who typed something else. */
  name: string;
  /** True when the text already resolves exactly and needs no confirming. */
  exact: boolean;
  /** The spreadsheet flags this name as not fully verified. */
  needsReview?: string;
}

/** Levenshtein distance, bailing out once it cannot beat `max`. */
function editDistance(a: string, b: string, max: number): number {
  if (Math.abs(a.length - b.length) > max) return max + 1;
  let prev = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    const curr = [i];
    let rowMin = i;
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      curr[j] = Math.min(prev[j] + 1, curr[j - 1] + 1, prev[j - 1] + cost);
      if (curr[j] < rowMin) rowMin = curr[j];
    }
    // Every remaining row can only grow, so an already-hopeless row ends it.
    if (rowMin > max) return max + 1;
    prev = curr;
  }
  return prev[b.length];
}

/** How wrong a name is allowed to be before it stops being a typo. */
function tolerance(len: number): number {
  if (len <= 5) return 1;
  if (len <= 10) return 2;
  return 3;
}

/**
 * Best guess at which peptide someone meant, for a "did you mean" prompt.
 *
 * Handles the three ways people actually get it wrong: a misspelling
 * ("semaglutid"), a partial name ("tirzep"), and a brand or alias that is
 * already recorded in data/peptides.ts. Punctuation and case never reach here,
 * having been stripped by normalizePeptideName, so "BPC157" is already exact.
 *
 * Returns null rather than a bad guess. Two characters is not enough to guess
 * from, and a wrong suggestion is worse than none: it teaches people to ignore
 * the prompt.
 */
export function suggestPeptide(requestedPeptide: string): PeptideSuggestion | null {
  if (isNewsletterRow(requestedPeptide)) return null;
  const key = normalizePeptideName(requestedPeptide);
  if (key.length < 3) return null;

  // Every name the site knows: the curated library first, then the wider
  // vocabulary from the nomenclature spreadsheet. Public Name is what comes
  // back either way, so a request is filed under one spelling no matter which
  // brand, code or misspelling someone typed to get here.
  const targets: {
    name: string;
    slug: string | null;
    keys: string[];
    needsReview?: string;
  }[] = [
    ...PEPTIDES.map((p) => ({
      name: p.name,
      slug: p.slug as string | null,
      keys: [...keysForPeptide(p.slug)],
    })),
    ...PEPTIDE_VOCABULARY.filter((v) => !v.slug).map((v) => ({
      name: v.name,
      slug: null,
      keys: [v.name, ...v.aliases].map(normalizePeptideName).filter(Boolean),
      needsReview: v.needsReview,
    })),
  ];

  for (const target of targets) {
    if (target.keys.includes(key)) {
      return {
        slug: target.slug,
        name: target.name,
        exact: true,
        needsReview: target.needsReview,
      };
    }
  }

  let best: { slug: string | null; name: string; needsReview?: string } | null = null;
  // Lower is better. Prefix and containment beat edit distance so that
  // "sema" prefers semaglutide over a same-distance unrelated name.
  let bestScore = Number.POSITIVE_INFINITY;
  let bestKeyLength = Number.POSITIVE_INFINITY;

  for (const target of targets) {
    for (const candidate of target.keys) {
      let score: number;
      // Three is enough for a prefix because a real name has to start with it:
      // "ghk" reaches GHK-Cu, while "xyz" still reaches nothing.
      if (key.length >= 3 && candidate.startsWith(key)) {
        score = 0.5;
      } else if (key.length >= 5 && candidate.includes(key)) {
        score = 0.75;
      } else {
        const max = tolerance(candidate.length);
        const d = editDistance(key, candidate, max);
        if (d > max) continue;
        score = d;
      }
      /*
       * Ties are common on short prefixes: "bpc" starts both BPC-157 and the
       * blend "BPC-157 + TB-500 + GHK-Cu". Broken in two steps.
       *
       * A peptide the calculator curates wins first, because someone typing
       * three letters is far more likely to want the common one than a
       * combination product. Then the shorter matched name wins, as the
       * closest thing to what was actually typed.
       */
      const beatsTie =
        best === null ||
        (target.slug !== null && best.slug === null) ||
        ((target.slug === null) === (best.slug === null) && candidate.length < bestKeyLength);

      if (score < bestScore || (score === bestScore && beatsTie)) {
        bestScore = score;
        bestKeyLength = candidate.length;
        best = {
          slug: target.slug,
          name: target.name,
          needsReview: target.needsReview,
        };
      }
    }
  }

  return best ? { ...best, exact: false } : null;
}
