/**
 * Which peptides have an education entry in the "Learn about peptides" library.
 *
 * The prose itself lives in `peptideEducation.<slug>` in the message catalogs
 * (messages/en.json and its translations), not here, so each entry can be
 * written in every language the site speaks. This file is the index: it decides
 * which peptides the library lists and which /learn/<slug> pages are built.
 *
 * Kept SEPARATE from data/peptides.ts so the calculator's data shape is never
 * affected. Content rules (locked with Rod): original neutral writing, no
 * copied text, NO health claims ("studied for", never "treats/cures"), and the
 * "not approved / research / for testing" framing where it applies. The legal
 * status and "last reviewed" date come from data/peptides.ts.
 *
 * Adding a peptide to the library takes three edits, per CLAUDE.md:
 *   1. data/peptides.ts          the peptide itself
 *   2. WIZARD_PEPTIDE_SLUGS      so it is selectable in the calculator
 *   3. LEARN_SLUGS below, plus a `peptideEducation.<slug>` block in
 *      messages/en.json holding teaser / whatItIs / studiedFor / howSold /
 *      bottomLine. English is the source; other locales fall back to it until
 *      translated.
 */

/** The five fields every education entry provides, in render order. */
export const EDUCATION_FIELDS = [
  'whatItIs',
  'studiedFor',
  'howSold',
  'bottomLine',
] as const;

export type EducationField = (typeof EDUCATION_FIELDS)[number];

/**
 * Slugs with an education entry. Order here is the order shown in the library
 * index and the order the static /learn pages are generated in.
 */
export const LEARN_SLUGS = [
  'semaglutide',
  'tirzepatide',
  'retatrutide',
  'bpc-157',
  'tb-500',
  'ghk-cu',
  'ipamorelin',
  'cjc-1295-dac',
  'cjc-1295-no-dac',
  'sermorelin',
  'nad-plus',
  'ss-31',
  'mots-c',
  'hgh',
  'hcg',
] as const;

export type LearnSlug = (typeof LEARN_SLUGS)[number];

export function isLearnSlug(slug: string): slug is LearnSlug {
  return (LEARN_SLUGS as readonly string[]).includes(slug);
}
