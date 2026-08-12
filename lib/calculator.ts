/**
 * BuddyPept calculator math
 * ─────────────────────────────
 * Pure functions for peptide reconstitution and dosing calculations.
 *
 * "The math doesn't lie": every function here is verified against
 * known reconstitution examples. See `.claude/rules/calculator-precision.md`
 * for the full verification standards.
 *
 * Conventions:
 * - All inputs validated with Zod at the boundary.
 * - All functions are pure (no I/O, no side effects).
 * - Internal math normalizes to milligrams (mg) for consistency.
 * - User-facing units (mg, mcg, IU) are converted at the input boundary.
 * - IU (International Units) cannot be auto-converted to mass; surfaces a warning.
 */

import { z } from 'zod';

// ─────────────────────────────────────────────────────────────
// Schemas
// ─────────────────────────────────────────────────────────────

export const DoseUnitSchema = z.enum(['mg', 'mcg', 'IU']);
export type DoseUnit = z.infer<typeof DoseUnitSchema>;

export const VialUnitSchema = z.enum(['mg', 'mcg', 'IU']);
export type VialUnit = z.infer<typeof VialUnitSchema>;

/**
 * Syringe scale. Only two real scales exist in practical use:
 * - 'U-100': standard insulin syringe, 100 units = 1 mL (~99% of peptide users).
 *   Barrel sizes (0.3 mL / 0.5 mL / 1 mL) are UI concerns, not math concerns.
 *   They all share the same U-100 scale.
 * - 'IM': intramuscular oil syringes, graduated in mL only (no unit markings).
 *
 * The earlier U-40 / U-50 enum values were based on a misunderstanding. In the
 * real world, what people call a "U-50 syringe" is a U-100-scale syringe with
 * a 0.5 mL barrel. Removed to prevent incorrect math.
 */
export const SyringeTypeSchema = z.enum(['U-100', 'IM']);
export type SyringeType = z.infer<typeof SyringeTypeSchema>;

export const ReconstitutionInputSchema = z.object({
  vialAmount: z.number().positive('Vial amount must be positive'),
  vialUnit: VialUnitSchema,
  waterMl: z.number().positive('Water volume must be positive (mL)'),
});

export const DoseInputSchema = z.object({
  vialAmount: z.number().positive(),
  vialUnit: VialUnitSchema,
  waterMl: z.number().positive(),
  targetDose: z.number().positive('Target dose must be positive'),
  targetDoseUnit: DoseUnitSchema,
  syringeType: SyringeTypeSchema.default('U-100'),
});

export const SupplyInputSchema = z.object({
  vialAmount: z.number().positive(),
  vialUnit: VialUnitSchema,
  targetDose: z.number().positive(),
  targetDoseUnit: DoseUnitSchema,
  dosesPerWeek: z.number().positive('Doses per week must be positive'),
});

export const CostInputSchema = z.object({
  vialCostUsd: z.number().min(0, 'Cost cannot be negative'),
  vialAmount: z.number().positive(),
  vialUnit: VialUnitSchema,
  targetDose: z.number().positive(),
  targetDoseUnit: DoseUnitSchema,
});

export type ReconstitutionInput = z.infer<typeof ReconstitutionInputSchema>;
export type DoseInput = z.infer<typeof DoseInputSchema>;
export type SupplyInput = z.infer<typeof SupplyInputSchema>;
export type CostInput = z.infer<typeof CostInputSchema>;

// ─────────────────────────────────────────────────────────────
// Output types
// ─────────────────────────────────────────────────────────────

export interface ConcentrationResult {
  concentrationMgPerMl: number;
  concentrationMcgPerMl: number;
  description: string;
}

/**
 * Warning codes, not sentences.
 *
 * This file is pure math and must stay language-free, so it emits a code and
 * the numbers behind it and lets the UI render the wording in the reader's
 * language. Codes are also stable to compare against, which sentences are not:
 * filtering warnings by matching on English text silently stops working the
 * moment the text is translated.
 */
export type WarningCode =
  | 'doseBelowOneUnit'
  | 'doseAboveSyringeCapacity'
  | 'concentrationVeryHigh'
  | 'iuNotConvertible';

export interface Warning {
  level: 'info' | 'caution' | 'serious';
  code: WarningCode;
  /** Numbers the wording interpolates, formatted by the UI for its locale. */
  values?: Record<string, number>;
}

export interface DoseResult {
  volumeMl: number;
  syringeUnits: number;
  /** Rounded to the nearest 0.5 unit: typical syringe graduation precision */
  syringeUnitsRounded: number;
  concentrationMgPerMl: number;
  warnings: Warning[];
}

export interface SupplyResult {
  dosesPerVial: number;
  daysSupply: number;
}

export interface CostResult {
  costPerDoseUsd: number;
  dosesPerVial: number;
}

// ─────────────────────────────────────────────────────────────
// Unit conversion helpers (internal)
// ─────────────────────────────────────────────────────────────

/**
 * Convert any dose unit to its equivalent in milligrams.
 *
 * IU (International Units) cannot be converted to mg without
 * substance-specific bioactivity data. We pass IU values through
 * unchanged; callers should surface a warning when IU is involved.
 *
 * @example
 *   toMg(250, 'mcg') === 0.25
 *   toMg(5, 'mg')    === 5
 *   toMg(100, 'IU')  === 100  // pass-through with caller-side warning
 */
function toMg(amount: number, unit: VialUnit | DoseUnit): number {
  switch (unit) {
    case 'mg':
      return amount;
    case 'mcg':
      return amount / 1000;
    case 'IU':
      // No substance-agnostic conversion possible. Pass through.
      return amount;
  }
}

/**
 * Get the units-per-mL scale for a given syringe type.
 *
 * U-100 is the only insulin-syringe scale in practical peptide use. 100 units
 * equals 1 mL. Barrel size (0.3 / 0.5 / 1.0 mL) is a separate UI concern
 * about capacity, not about scale.
 *
 * IM (intramuscular oil) syringes don't use unit graduations. They're marked
 * in mL only, so we return 1 (i.e., 1 "unit" = 1 mL) as a passthrough.
 */
function unitsPerMl(syringeType: SyringeType): number {
  switch (syringeType) {
    case 'U-100':
      return 100;
    case 'IM':
      return 1;
  }
}

/**
 * Round a syringe-unit value to the nearest 0.5 unit.
 * Most insulin syringes have 0.5- or 1-unit graduations.
 */
function roundToHalfUnit(units: number): number {
  return Math.round(units * 2) / 2;
}

// ─────────────────────────────────────────────────────────────
// Core calculations (pure functions, exported)
// ─────────────────────────────────────────────────────────────

/**
 * Calculate the concentration of a reconstituted peptide vial.
 *
 * Given a vial containing `vialAmount` of peptide (in mg, mcg, or IU)
 * and `waterMl` mL of bacteriostatic water added, returns the resulting
 * concentration in both mg/mL and mcg/mL.
 *
 * Formula:
 *   concentration = vial mass / water volume
 *
 * @example  Semaglutide reconstitution:
 *   calculateConcentration({ vialAmount: 5, vialUnit: 'mg', waterMl: 2 })
 *   // → { concentrationMgPerMl: 2.5, concentrationMcgPerMl: 2500, ... }
 */
export function calculateConcentration(
  input: z.input<typeof ReconstitutionInputSchema>
): ConcentrationResult {
  const { vialAmount, vialUnit, waterMl } = ReconstitutionInputSchema.parse(input);
  const vialMg = toMg(vialAmount, vialUnit);
  const mgPerMl = vialMg / waterMl;
  return {
    concentrationMgPerMl: mgPerMl,
    concentrationMcgPerMl: mgPerMl * 1000,
    // Diagnostic only. Always English, always a "." decimal separator, and
    // deliberately not rendered anywhere in the UI. Use the numeric fields
    // above with the locale-aware formatters in lib/format.ts for display.
    description: `${vialAmount} ${vialUnit} + ${waterMl} mL bac water = ${formatNumber(mgPerMl, 3)} mg/mL (${formatNumber(mgPerMl * 1000, 0)} mcg/mL)`,
  };
}

/**
 * Calculate the dose to draw for a target peptide dose.
 *
 * Given a reconstituted vial and a target dose, returns:
 *   - the volume to draw (in mL)
 *   - the corresponding syringe units (default: U-100 = 100 units/mL)
 *   - the rounded syringe units (to nearest 0.5)
 *   - the underlying concentration
 *   - any warnings about the dose's practicality
 *
 * Formula:
 *   1. concentration  = vial mass (mg) / water volume (mL)
 *   2. volume (mL)    = target dose (mg) / concentration (mg/mL)
 *   3. syringe units  = volume × (units per mL for syringe type)
 *
 * Verified test cases:
 *
 * @example  Semaglutide (5 mg vial, 2 mL water, 0.25 mg dose):
 *   calculateDose({
 *     vialAmount: 5, vialUnit: 'mg', waterMl: 2,
 *     targetDose: 0.25, targetDoseUnit: 'mg', syringeType: 'U-100',
 *   })
 *   // → volumeMl: 0.1, syringeUnits: 10  ✓
 *
 * @example  BPC-157 (10 mg vial, 5 mL water, 250 mcg dose):
 *   calculateDose({
 *     vialAmount: 10, vialUnit: 'mg', waterMl: 5,
 *     targetDose: 250, targetDoseUnit: 'mcg', syringeType: 'U-100',
 *   })
 *   // → volumeMl: 0.125, syringeUnits: 12.5  ✓
 *
 * @example  Tirzepatide (10 mg vial, 2 mL water, 2.5 mg dose):
 *   calculateDose({
 *     vialAmount: 10, vialUnit: 'mg', waterMl: 2,
 *     targetDose: 2.5, targetDoseUnit: 'mg', syringeType: 'U-100',
 *   })
 *   // → volumeMl: 0.5, syringeUnits: 50  ✓
 */
export function calculateDose(input: z.input<typeof DoseInputSchema>): DoseResult {
  const parsed = DoseInputSchema.parse(input);

  const vialMg = toMg(parsed.vialAmount, parsed.vialUnit);
  const targetDoseMg = toMg(parsed.targetDose, parsed.targetDoseUnit);
  const concentrationMgPerMl = vialMg / parsed.waterMl;
  const volumeMl = targetDoseMg / concentrationMgPerMl;
  const units = volumeMl * unitsPerMl(parsed.syringeType);
  const unitsRounded = roundToHalfUnit(units);

  const warnings: Warning[] = [];

  // Warning: dose too small to measure accurately
  if (parsed.syringeType !== 'IM' && units < 1) {
    warnings.push({ level: 'caution', code: 'doseBelowOneUnit' });
  }

  // Warning: dose exceeds single-injection capacity
  if (parsed.syringeType !== 'IM' && units > 100) {
    warnings.push({ level: 'caution', code: 'doseAboveSyringeCapacity' });
  }

  // Warning: unusually high concentration (possible input error)
  if (concentrationMgPerMl > 10) {
    warnings.push({ level: 'caution', code: 'concentrationVeryHigh' });
  }

  // Warning: IU conversions are substance-specific
  if (parsed.targetDoseUnit === 'IU' || parsed.vialUnit === 'IU') {
    warnings.push({ level: 'serious', code: 'iuNotConvertible' });
  }

  return {
    volumeMl,
    syringeUnits: units,
    syringeUnitsRounded: unitsRounded,
    concentrationMgPerMl,
    warnings,
  };
}

/**
 * Calculate how many doses are in a vial and how long it will last
 * given a target dose size and a weekly frequency.
 *
 * Formula:
 *   doses per vial = vial mass / dose size
 *   days supply    = (doses per vial / doses per week) × 7
 *
 * @example  5 mg semaglutide vial, 0.25 mg/dose, 1 dose/week:
 *   calculateSupply({
 *     vialAmount: 5, vialUnit: 'mg',
 *     targetDose: 0.25, targetDoseUnit: 'mg',
 *     dosesPerWeek: 1,
 *   })
 *   // → dosesPerVial: 20, daysSupply: 140
 */
export function calculateSupply(input: z.input<typeof SupplyInputSchema>): SupplyResult {
  const parsed = SupplyInputSchema.parse(input);
  const vialMg = toMg(parsed.vialAmount, parsed.vialUnit);
  const targetDoseMg = toMg(parsed.targetDose, parsed.targetDoseUnit);
  const dosesPerVial = vialMg / targetDoseMg;
  const daysSupply = (dosesPerVial / parsed.dosesPerWeek) * 7;
  return { dosesPerVial, daysSupply };
}

/**
 * Calculate the cost per dose for a given vial price and dose size.
 *
 * @example  $50 vial of 10 mg BPC-157, 250 mcg dose:
 *   calculateCostPerDose({
 *     vialCostUsd: 50, vialAmount: 10, vialUnit: 'mg',
 *     targetDose: 250, targetDoseUnit: 'mcg',
 *   })
 *   // → costPerDoseUsd: 1.25, dosesPerVial: 40
 */
export function calculateCostPerDose(input: z.input<typeof CostInputSchema>): CostResult {
  const parsed = CostInputSchema.parse(input);
  const vialMg = toMg(parsed.vialAmount, parsed.vialUnit);
  const targetDoseMg = toMg(parsed.targetDose, parsed.targetDoseUnit);
  const dosesPerVial = vialMg / targetDoseMg;
  const costPerDoseUsd = parsed.vialCostUsd / dosesPerVial;
  return { costPerDoseUsd, dosesPerVial };
}

/**
 * Calculate days until a reconstituted vial expires.
 *
 * Standard guidance for reconstituted peptides: 28 days refrigerated.
 * (Some peptides have shorter or longer windows; adjust if needed.)
 *
 * @returns number of days until expiry. Positive if not yet expired,
 *          zero if expiring today, negative if already expired.
 *
 * @example
 *   calculateVialExpiry('2026-05-10', new Date('2026-05-18'))
 *   // → 20  (28 - 8 days = 20 days remaining)
 */
export function calculateVialExpiry(
  dateReconstituted: Date | string,
  today: Date = new Date()
): number {
  const opened =
    typeof dateReconstituted === 'string' ? new Date(dateReconstituted) : dateReconstituted;
  if (isNaN(opened.getTime())) {
    throw new Error('Invalid date provided to calculateVialExpiry');
  }
  const SHELF_LIFE_DAYS = 28;
  const msPerDay = 1000 * 60 * 60 * 24;
  const daysOpen = Math.floor((today.getTime() - opened.getTime()) / msPerDay);
  return SHELF_LIFE_DAYS - daysOpen;
}

// ─────────────────────────────────────────────────────────────
// Formatting (internal utility)
// ─────────────────────────────────────────────────────────────

function formatNumber(n: number, decimals: number): string {
  return Number(n.toFixed(decimals)).toString();
}
