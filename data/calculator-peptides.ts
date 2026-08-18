import { getPeptideBySlug, type Peptide } from './peptides';

/**
 * The peptides a visitor can actually reach in the calculator, in the order the
 * dropdown shows them.
 *
 * This used to live inside calculator-wizard.tsx, which meant only the wizard
 * knew what was reachable. Everything else, including the code that emails
 * people "the peptide you asked for is in", read the raw PEPTIDES array
 * instead. Those two lists are not the same, and when they disagreed the site
 * sent a real person an email about a peptide with no page and no dropdown
 * entry.
 *
 * So the list lives here now and anything that needs to know "can someone
 * actually use this yet" imports it rather than guessing.
 */
export const CALCULATOR_SLUGS = [
  'semaglutide',
  'tirzepatide',
  'bpc-157',
  'tb-500',
  'ghk-cu',
  'ipamorelin',
  'cjc-1295-dac',
  'cjc-1295-no-dac',
  'sermorelin',
  'retatrutide',
  'nad-plus',
  'ss-31',
  'mots-c',
  'hgh',
  'hcg',
] as const;

export type CalculatorSlug = (typeof CALCULATOR_SLUGS)[number];

/** Whether a visitor can pick this peptide today. */
export function isInCalculator(slug: string): boolean {
  return (CALCULATOR_SLUGS as readonly string[]).includes(slug);
}

/**
 * Resolved entries, in dropdown order. A slug with no matching entry in
 * data/peptides.ts is dropped rather than throwing, so a typo here costs one
 * missing row instead of a blank page.
 */
export const CALCULATOR_PEPTIDES: Peptide[] = CALCULATOR_SLUGS.map((s) =>
  getPeptideBySlug(s)
).filter((p): p is Peptide => Boolean(p));
