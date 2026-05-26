/**
 * BuddyPept peptide library
 * ─────────────────────────
 * Initial library of common peptides newcomers encounter.
 *
 * Each entry is factual, brand-aligned (no medical claims, no hype, no
 * fear-mongering), and includes placeholder slots for Phase 7 lawyer-reviewed
 * legal copy.
 *
 * Voice rules:
 *   - "Studied for X", never "treats X" or "cures X"
 *   - State regulatory status factually; never endorse "research use only"
 *     as a framing or imply users should take a peptide
 *   - Mention brand names where relevant. It helps users recognize what they
 *     have if they came in via a prescription
 *
 * To add a new peptide: append a new entry to PEPTIDES.
 * The conditional rule .claude/rules/calculator-precision.md fires on this
 * file. Verify all dose data against authoritative sources.
 */

import type { VialUnit, DoseUnit } from '@/lib/calculator';

// ─────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────

export type LegalStatus =
  /** FDA-approved for at least one indication; requires a prescription. */
  | 'prescription'
  /** Not FDA-approved for human use; sold "for research only" by vendors. */
  | 'research-chemical'
  /** Available over-the-counter as a dietary supplement. */
  | 'supplement';

export type PeptideCategory =
  | 'glp-1' // GLP-1 receptor agonists
  | 'recovery' // Tissue repair, healing, inflammation
  | 'longevity' // Anti-aging, mitochondrial support
  | 'growth-hormone' // GH analogs and secretagogues
  | 'aesthetic' // Skin, hair, pigmentation
  | 'libido' // Sexual function
  | 'other';

export interface Peptide {
  /** URL slug (lowercase, hyphen-separated). Used in `/peptides/[slug]`. */
  slug: string;

  /** Display name. */
  name: string;

  /** Alternate or brand names users might search for. */
  aliases?: string[];

  /** Broad category for library navigation and grouping. */
  category: PeptideCategory;

  /** Regulatory status. Drives UI framing per Phase 7 placement map. */
  legalStatus: LegalStatus;

  /**
   * ISO date of the last legal-status review (YYYY-MM-DD).
   * UI MUST surface this on every peptide page touching legal status,
   * per the disclaimer placement map.
   */
  legalStatusLastUpdated: string;

  /** Common vial sizes in `vialUnit` (e.g., [5, 10] for 5 mg or 10 mg vials). */
  commonVialSizes: number[];

  /** Unit for vial sizes. */
  vialUnit: VialUnit;

  /** Typical single dose value, in `typicalDoseUnit`. */
  typicalDose: number;

  /** Unit for typical dose. */
  typicalDoseUnit: DoseUnit;

  /**
   * Typical number of doses per week (1 = weekly, 7 = daily,
   * 14 = 2× daily, 21 = 3× daily, etc.). Used by calculateSupply().
   */
  typicalDosesPerWeek: number;

  /** Human-readable dosing pattern for display (e.g., "1× weekly (subcutaneous)"). */
  dosingPattern: string;

  /**
   * Factual 1-2 sentence description. No claims, no hype, no fear-mongering.
   * Brand voice: calm, kind, precise.
   */
  shortDescription: string;

  /**
   * Phase 7 placeholder: medical disclaimer at top of peptide page.
   * Filled with lawyer-reviewed copy before launch.
   */
  medicalDisclaimerTop?: string;

  /**
   * Phase 7 placeholder: note about legal/regulatory status.
   * Filled with lawyer-reviewed copy before launch.
   */
  legalStatusNote?: string;
}

// ─────────────────────────────────────────────────────────────
// Library
// ─────────────────────────────────────────────────────────────

export const PEPTIDES: Peptide[] = [
  // ───────── GLP-1 receptor agonists ─────────
  {
    slug: 'semaglutide',
    name: 'Semaglutide',
    aliases: ['Ozempic', 'Wegovy', 'Rybelsus'],
    category: 'glp-1',
    legalStatus: 'prescription',
    legalStatusLastUpdated: '2026-05-18',
    commonVialSizes: [2, 5, 10],
    vialUnit: 'mg',
    typicalDose: 0.25,
    typicalDoseUnit: 'mg',
    typicalDosesPerWeek: 1,
    dosingPattern: '1× weekly (subcutaneous), titrated up over several weeks',
    shortDescription:
      'A GLP-1 receptor agonist studied for type 2 diabetes and weight management. Marketed in the US under the brand names Ozempic (diabetes), Wegovy (weight loss), and Rybelsus (oral form for diabetes).',
  },
  {
    slug: 'tirzepatide',
    name: 'Tirzepatide',
    aliases: ['Mounjaro', 'Zepbound'],
    category: 'glp-1',
    legalStatus: 'prescription',
    legalStatusLastUpdated: '2026-05-18',
    commonVialSizes: [10, 30, 60],
    vialUnit: 'mg',
    typicalDose: 2.5,
    typicalDoseUnit: 'mg',
    typicalDosesPerWeek: 1,
    dosingPattern: '1× weekly (subcutaneous), titrated up over several weeks',
    shortDescription:
      'A dual GLP-1 and GIP receptor agonist studied for type 2 diabetes and weight management. Marketed in the US under the brand names Mounjaro (diabetes) and Zepbound (weight loss).',
  },
  {
    slug: 'retatrutide',
    name: 'Retatrutide',
    category: 'glp-1',
    legalStatus: 'research-chemical',
    legalStatusLastUpdated: '2026-05-18',
    commonVialSizes: [10, 30],
    vialUnit: 'mg',
    typicalDose: 2,
    typicalDoseUnit: 'mg',
    typicalDosesPerWeek: 1,
    dosingPattern: '1× weekly (subcutaneous)',
    shortDescription:
      'A triple agonist of GLP-1, GIP, and glucagon receptors. Currently in clinical trials for metabolic conditions; not yet approved for any medical use in any jurisdiction.',
  },

  // ───────── Recovery & tissue repair ─────────
  {
    slug: 'bpc-157',
    name: 'BPC-157',
    aliases: ['Body Protection Compound-157'],
    category: 'recovery',
    legalStatus: 'research-chemical',
    legalStatusLastUpdated: '2026-05-18',
    commonVialSizes: [5, 10],
    vialUnit: 'mg',
    typicalDose: 250,
    typicalDoseUnit: 'mcg',
    typicalDosesPerWeek: 7,
    dosingPattern: '1× daily (subcutaneous, often near the area of interest)',
    shortDescription:
      'A synthetic peptide fragment derived from a protein found in gastric juice. Studied in preclinical models for tissue repair and gastrointestinal effects. Not approved for human use.',
  },
  {
    slug: 'tb-500',
    name: 'TB-500',
    aliases: ['Thymosin Beta-4 fragment'],
    category: 'recovery',
    legalStatus: 'research-chemical',
    legalStatusLastUpdated: '2026-05-18',
    commonVialSizes: [5, 10],
    vialUnit: 'mg',
    typicalDose: 2,
    typicalDoseUnit: 'mg',
    typicalDosesPerWeek: 2,
    dosingPattern: '2× weekly (subcutaneous)',
    shortDescription:
      'A synthetic fragment of thymosin beta-4, a naturally occurring protein. Studied in preclinical models for tissue repair, wound healing, and inflammation modulation. Not approved for human use.',
  },

  // ───────── Aesthetic ─────────
  {
    slug: 'ghk-cu',
    name: 'GHK-Cu',
    aliases: ['Copper Tripeptide-1', 'GHK-Copper'],
    category: 'aesthetic',
    legalStatus: 'research-chemical',
    legalStatusLastUpdated: '2026-05-18',
    commonVialSizes: [50, 100],
    vialUnit: 'mg',
    typicalDose: 2,
    typicalDoseUnit: 'mg',
    typicalDosesPerWeek: 7,
    dosingPattern: '1× daily (subcutaneous or topical)',
    shortDescription:
      'A copper-binding tripeptide naturally present in human plasma at declining levels with age. Studied for skin remodeling, hair, and wound healing. Common in topical cosmetics and as an injectable in research contexts.',
  },

  // ───────── Growth hormone secretagogues ─────────
  {
    slug: 'ipamorelin',
    name: 'Ipamorelin',
    category: 'growth-hormone',
    legalStatus: 'research-chemical',
    legalStatusLastUpdated: '2026-05-18',
    commonVialSizes: [2, 5, 10],
    vialUnit: 'mg',
    typicalDose: 300,
    typicalDoseUnit: 'mcg',
    typicalDosesPerWeek: 14,
    dosingPattern: '2× daily (subcutaneous, typically before bed and post-workout)',
    shortDescription:
      'A selective growth hormone secretagogue that stimulates the pituitary gland to release endogenous growth hormone. Often paired with CJC-1295. Not approved for human use.',
  },
  {
    slug: 'cjc-1295',
    name: 'CJC-1295',
    aliases: ['Modified GRF 1-29', 'CJC-1295 with DAC', 'CJC-1295 no DAC'],
    category: 'growth-hormone',
    legalStatus: 'research-chemical',
    legalStatusLastUpdated: '2026-05-18',
    commonVialSizes: [2, 5],
    vialUnit: 'mg',
    typicalDose: 100,
    typicalDoseUnit: 'mcg',
    typicalDosesPerWeek: 7,
    dosingPattern: '1× daily without DAC (subcutaneous); less frequent with DAC',
    shortDescription:
      'A growth hormone releasing hormone (GHRH) analog. Two forms exist: with DAC (longer half-life, less frequent dosing) and without DAC (shorter half-life, daily dosing). Commonly stacked with ipamorelin. Not approved for human use.',
  },
  {
    slug: 'sermorelin',
    name: 'Sermorelin',
    aliases: ['GRF 1-29', 'Geref'],
    category: 'growth-hormone',
    legalStatus: 'prescription',
    legalStatusLastUpdated: '2026-05-18',
    commonVialSizes: [2, 3, 5, 15],
    vialUnit: 'mg',
    typicalDose: 200,
    typicalDoseUnit: 'mcg',
    typicalDosesPerWeek: 7,
    dosingPattern: '1× daily (subcutaneous, typically before bed)',
    shortDescription:
      'A growth hormone releasing hormone (GHRH) analog. FDA-approved under the brand name Geref for diagnostic testing of pituitary function. Available from compounding pharmacies by prescription for off-label anti-aging protocols.',
  },

  // ───────── Libido ─────────
  {
    slug: 'pt-141',
    name: 'PT-141',
    aliases: ['Bremelanotide', 'Vyleesi'],
    category: 'libido',
    legalStatus: 'prescription',
    legalStatusLastUpdated: '2026-05-18',
    commonVialSizes: [10],
    vialUnit: 'mg',
    typicalDose: 1.25,
    typicalDoseUnit: 'mg',
    typicalDosesPerWeek: 2,
    dosingPattern: 'As needed, up to 1 dose per 24 hours (subcutaneous)',
    shortDescription:
      'A melanocortin receptor agonist. Marketed in the US under the brand name Vyleesi (FDA-approved for hypoactive sexual desire disorder in premenopausal women). Used off-label by other populations.',
  },

  // ───────── Measured in international units (IU) ─────────
  {
    slug: 'hgh',
    name: 'HGH (Somatropin)',
    aliases: ['Somatropin', 'Human Growth Hormone'],
    category: 'growth-hormone',
    legalStatus: 'prescription',
    legalStatusLastUpdated: '2026-05-25',
    commonVialSizes: [10, 12, 36],
    vialUnit: 'IU',
    typicalDose: 2,
    typicalDoseUnit: 'IU',
    typicalDosesPerWeek: 7,
    dosingPattern: '1× daily (subcutaneous)',
    shortDescription:
      'A recombinant form of human growth hormone. FDA-approved by prescription for specific growth hormone deficiencies and related conditions. Measured and dosed in international units (IU).',
  },
  {
    slug: 'hcg',
    name: 'HCG',
    aliases: ['Human Chorionic Gonadotropin'],
    category: 'other',
    legalStatus: 'prescription',
    legalStatusLastUpdated: '2026-05-25',
    commonVialSizes: [5000, 10000],
    vialUnit: 'IU',
    typicalDose: 500,
    typicalDoseUnit: 'IU',
    typicalDosesPerWeek: 3,
    dosingPattern: 'Varies; often a few times per week (subcutaneous or intramuscular)',
    shortDescription:
      'A hormone (human chorionic gonadotropin) used in fertility treatment and prescribed in some hormone protocols. Sold and dosed in international units (IU).',
  },
];

// ─────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────

/** Find a peptide by its URL slug. Returns undefined if not found. */
export function getPeptideBySlug(slug: string): Peptide | undefined {
  return PEPTIDES.find((p) => p.slug === slug);
}

/** Get all peptides in a category. */
export function getPeptidesByCategory(category: PeptideCategory): Peptide[] {
  return PEPTIDES.filter((p) => p.category === category);
}

/** Get all peptides with a given legal status. */
export function getPeptidesByLegalStatus(status: LegalStatus): Peptide[] {
  return PEPTIDES.filter((p) => p.legalStatus === status);
}

/** Human-friendly label for a legal status. */
export function legalStatusLabel(status: LegalStatus): string {
  switch (status) {
    case 'prescription':
      return 'Prescription medication';
    case 'research-chemical':
      return 'Not FDA-approved for human use';
    case 'supplement':
      return 'Available as a dietary supplement';
  }
}

/** Human-friendly label for a category. */
export function categoryLabel(category: PeptideCategory): string {
  switch (category) {
    case 'glp-1':
      return 'GLP-1 / Metabolic';
    case 'recovery':
      return 'Recovery & Tissue Repair';
    case 'longevity':
      return 'Longevity';
    case 'growth-hormone':
      return 'Growth Hormone';
    case 'aesthetic':
      return 'Skin & Aesthetic';
    case 'libido':
      return 'Libido';
    case 'other':
      return 'Other';
  }
}
