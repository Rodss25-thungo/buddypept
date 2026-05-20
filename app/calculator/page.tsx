'use client';

/**
 * BuddyPept Calculator UI
 * ───────────────────────
 * Uses lib/calculator.ts for the math and data/peptides.ts for the library.
 *
 * Per the Phase 7 Disclaimer & Legal Placement Map in CLAUDE.md, this page
 * contains placeholder slots for lawyer-reviewed copy:
 *   - [MEDICAL_DISCLAIMER_TOP]     — above inputs
 *   - [MEDICAL_DISCLAIMER_RESULTS] — adjacent to result number
 *
 * Styling: minimal Tailwind. Final design pass happens in Phase 6.
 */

import { useState, useMemo } from 'react';
import {
  PEPTIDES,
  getPeptideBySlug,
  legalStatusLabel,
} from '@/data/peptides';
import {
  calculateDose,
  type DoseUnit,
  type SyringeType,
  type Warning as CalcWarning,
} from '@/lib/calculator';

// Phase 7 placeholder strings — visible in UI as "pending legal review" so
// they don't get accidentally shipped to production.
const PLACEHOLDER_DISCLAIMER_TOP =
  '[MEDICAL_DISCLAIMER_TOP — pending Phase 7 legal review]';
const PLACEHOLDER_DISCLAIMER_RESULTS =
  '[MEDICAL_DISCLAIMER_RESULTS — pending Phase 7 legal review]';

export default function CalculatorPage() {
  const [peptideSlug, setPeptideSlug] = useState<string>(PEPTIDES[0].slug);
  const [vialAmount, setVialAmount] = useState<number>(PEPTIDES[0].commonVialSizes[0]);
  const [waterMl, setWaterMl] = useState<number>(2);
  // Dose is INTENTIONALLY not pre-filled. Brand hard rule from CLAUDE.md:
  // "Never recommend a dose. Show only the math the user inputs."
  // The user enters their dose; we do the math.
  const [targetDose, setTargetDose] = useState<number>(NaN);
  const [targetDoseUnit, setTargetDoseUnit] = useState<DoseUnit>(PEPTIDES[0].typicalDoseUnit);
  const [syringeType, setSyringeType] = useState<SyringeType>('U-100');
  const [showMath, setShowMath] = useState(false);

  const peptide = getPeptideBySlug(peptideSlug);

  function handlePeptideChange(slug: string) {
    setPeptideSlug(slug);
    const p = getPeptideBySlug(slug);
    if (p) {
      setVialAmount(p.commonVialSizes[0]);
      // Clear dose on peptide switch — user must enter their own dose for
      // the new peptide. We update the unit (mg vs mcg) because that's a
      // factual property of the peptide, not a dose recommendation.
      setTargetDose(NaN);
      setTargetDoseUnit(p.typicalDoseUnit);
    }
  }

  // Compute result. Only run when all inputs are valid positive numbers
  // (otherwise we'd show Zod errors mid-typing, which is jarring).
  const isValidInput =
    Number.isFinite(vialAmount) &&
    vialAmount > 0 &&
    Number.isFinite(waterMl) &&
    waterMl > 0 &&
    Number.isFinite(targetDose) &&
    targetDose > 0;

  const computation = useMemo(() => {
    if (!isValidInput || !peptide) return { result: null, error: null };
    try {
      const result = calculateDose({
        vialAmount,
        vialUnit: peptide.vialUnit,
        waterMl,
        targetDose,
        targetDoseUnit,
        syringeType,
      });
      return { result, error: null as string | null };
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Invalid input';
      return { result: null, error: msg };
    }
  }, [isValidInput, peptide, vialAmount, waterMl, targetDose, targetDoseUnit, syringeType]);

  const { result, error } = computation;

  return (
    <main className="mx-auto max-w-2xl px-4 py-8 sm:py-12">
      {/* Header */}
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Peptide dosing calculator
        </h1>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
          The math, free forever. No paywall, no data harvest.
        </p>
      </header>

      {/* Placeholder: medical disclaimer at top of calculator */}
      <DisclaimerSlot text={PLACEHOLDER_DISCLAIMER_TOP} />

      {/* Inputs */}
      <section className="mt-8 space-y-5 rounded-lg border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
        <FieldPeptide value={peptideSlug} onChange={handlePeptideChange} />
        <FieldVialAmount
          peptide={peptide}
          value={vialAmount}
          onChange={setVialAmount}
        />
        <FieldNumber
          label="Bacteriostatic water"
          unit="mL"
          value={waterMl}
          onChange={setWaterMl}
          step={0.1}
          min={0.1}
        />
        <FieldTargetDose
          targetDose={targetDose}
          targetDoseUnit={targetDoseUnit}
          onDoseChange={setTargetDose}
          onUnitChange={setTargetDoseUnit}
        />
        <FieldSyringe value={syringeType} onChange={setSyringeType} />
      </section>

      {/* Result */}
      <section className="mt-6">
        {error ? (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-900 dark:border-red-900 dark:bg-red-950 dark:text-red-100">
            {error}
          </div>
        ) : result ? (
          <ResultDisplay
            result={result}
            peptide={peptide}
            inputs={{ vialAmount, waterMl, targetDose, targetDoseUnit, syringeType }}
            showMath={showMath}
            onToggleMath={() => setShowMath((s) => !s)}
          />
        ) : (
          <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-4 text-sm text-zinc-600 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400">
            Fill in vial amount, bacteriostatic water, and your target dose to see the result.
          </div>
        )}
      </section>

      {/* Peptide context */}
      {peptide && (
        <section className="mt-8 rounded-lg border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
          <h2 className="text-lg font-semibold">About {peptide.name}</h2>
          {peptide.aliases && peptide.aliases.length > 0 && (
            <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-500">
              Also known as: {peptide.aliases.join(', ')}
            </p>
          )}
          <p className="mt-3 text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">
            {peptide.shortDescription}
          </p>
          <dl className="mt-4 grid grid-cols-1 gap-2 text-xs sm:grid-cols-3">
            <div>
              <dt className="text-zinc-500">Reference dose (from studies)</dt>
              <dd className="font-medium">
                {peptide.typicalDose} {peptide.typicalDoseUnit}
              </dd>
            </div>
            <div>
              <dt className="text-zinc-500">Reference pattern</dt>
              <dd className="font-medium">{peptide.dosingPattern}</dd>
            </div>
            <div>
              <dt className="text-zinc-500">Legal status</dt>
              <dd className="font-medium">{legalStatusLabel(peptide.legalStatus)}</dd>
            </div>
          </dl>
          <p className="mt-3 text-xs italic leading-relaxed text-zinc-500 dark:text-zinc-400">
            Reference values reflect doses studied in published research or
            commonly cited in protocols. They are <strong>informational, not a
            recommendation for you</strong>. Decisions about your dose belong
            with your healthcare provider.
          </p>
          <p className="mt-3 text-[10px] uppercase tracking-wide text-zinc-400">
            Legal status last reviewed: {peptide.legalStatusLastUpdated}
          </p>
        </section>
      )}
    </main>
  );
}

// ─────────────────────────────────────────────────────────────
// Subcomponents (local, not exported)
// ─────────────────────────────────────────────────────────────

function DisclaimerSlot({ text }: { text: string }) {
  return (
    <div className="rounded-lg border border-dashed border-amber-300 bg-amber-50 p-3 text-xs text-amber-900 dark:border-amber-700 dark:bg-amber-950 dark:text-amber-200">
      {text}
    </div>
  );
}

function FieldPeptide({
  value,
  onChange,
}: {
  value: string;
  onChange: (slug: string) => void;
}) {
  return (
    <div>
      <label htmlFor="peptide" className="mb-1 block text-sm font-medium">
        Peptide
      </label>
      <select
        id="peptide"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800"
      >
        {PEPTIDES.map((p) => (
          <option key={p.slug} value={p.slug}>
            {p.name}
          </option>
        ))}
      </select>
    </div>
  );
}

function FieldVialAmount({
  peptide,
  value,
  onChange,
}: {
  peptide: ReturnType<typeof getPeptideBySlug>;
  value: number;
  onChange: (n: number) => void;
}) {
  const unit = peptide?.vialUnit ?? 'mg';
  return (
    <div>
      <label htmlFor="vialAmount" className="mb-1 block text-sm font-medium">
        Vial size <span className="text-zinc-500">({unit})</span>
      </label>
      <input
        id="vialAmount"
        type="number"
        step="any"
        min={0}
        value={Number.isFinite(value) ? value : ''}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800"
      />
      {peptide && peptide.commonVialSizes.length > 1 && (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {peptide.commonVialSizes.map((size) => (
            <button
              key={size}
              type="button"
              onClick={() => onChange(size)}
              className={`rounded-md border px-2 py-1 text-xs ${
                value === size
                  ? 'border-zinc-900 bg-zinc-900 text-white dark:border-zinc-100 dark:bg-zinc-100 dark:text-zinc-900'
                  : 'border-zinc-300 bg-white text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300'
              }`}
            >
              {size} {unit}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function FieldNumber({
  label,
  unit,
  value,
  onChange,
  step,
  min,
}: {
  label: string;
  unit: string;
  value: number;
  onChange: (n: number) => void;
  step?: number;
  min?: number;
}) {
  return (
    <div>
      <label className="mb-1 block text-sm font-medium">
        {label} <span className="text-zinc-500">({unit})</span>
      </label>
      <input
        type="number"
        step={step ?? 'any'}
        min={min ?? 0}
        value={Number.isFinite(value) ? value : ''}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800"
      />
    </div>
  );
}

function FieldTargetDose({
  targetDose,
  targetDoseUnit,
  onDoseChange,
  onUnitChange,
}: {
  targetDose: number;
  targetDoseUnit: DoseUnit;
  onDoseChange: (n: number) => void;
  onUnitChange: (u: DoseUnit) => void;
}) {
  return (
    <div>
      <label className="mb-1 block text-sm font-medium">Your dose</label>
      <div className="flex gap-2">
        <input
          type="number"
          step="any"
          min={0}
          value={Number.isFinite(targetDose) ? targetDose : ''}
          onChange={(e) => onDoseChange(parseFloat(e.target.value))}
          placeholder="Enter your dose"
          className="flex-1 rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800"
        />
        <select
          value={targetDoseUnit}
          onChange={(e) => onUnitChange(e.target.value as DoseUnit)}
          className="rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800"
        >
          <option value="mg">mg</option>
          <option value="mcg">mcg</option>
          <option value="IU">IU</option>
        </select>
      </div>
      <p className="mt-1 text-xs text-zinc-500">
        Decided by you and your healthcare provider — never by BuddyPept.
      </p>
    </div>
  );
}

function FieldSyringe({
  value,
  onChange,
}: {
  value: SyringeType;
  onChange: (s: SyringeType) => void;
}) {
  return (
    <div>
      <label htmlFor="syringe" className="mb-1 block text-sm font-medium">
        Syringe type
      </label>
      <select
        id="syringe"
        value={value}
        onChange={(e) => onChange(e.target.value as SyringeType)}
        className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800"
      >
        <option value="U-100">U-100 insulin syringe (units)</option>
        <option value="U-40">U-40 insulin syringe (units)</option>
        <option value="U-50">U-50 insulin syringe (units)</option>
        <option value="IM">IM syringe (mL only)</option>
      </select>
      <p className="mt-1 text-xs text-zinc-500">
        Both mL and units are shown in the result — read whichever matches your syringe.
      </p>
    </div>
  );
}

function ResultDisplay({
  result,
  peptide,
  inputs,
  showMath,
  onToggleMath,
}: {
  result: NonNullable<ReturnType<typeof calculateDose>>;
  peptide: ReturnType<typeof getPeptideBySlug>;
  inputs: {
    vialAmount: number;
    waterMl: number;
    targetDose: number;
    targetDoseUnit: DoseUnit;
    syringeType: SyringeType;
  };
  showMath: boolean;
  onToggleMath: () => void;
}) {
  const unitsPerMl =
    inputs.syringeType === 'U-100'
      ? 100
      : inputs.syringeType === 'U-40'
        ? 40
        : inputs.syringeType === 'U-50'
          ? 50
          : 1;
  const isIM = inputs.syringeType === 'IM';

  return (
    <div className="rounded-lg border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
      {/* Result numbers — both mL and units shown */}
      <div className="space-y-1">
        <div className="text-xs uppercase tracking-wide text-zinc-500">Draw</div>
        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <span className="text-3xl font-bold tabular-nums sm:text-4xl">
            {formatVolume(result.volumeMl)} mL
          </span>
          {!isIM && (
            <span className="text-zinc-500">
              or{' '}
              <span className="text-2xl font-semibold tabular-nums text-zinc-900 dark:text-zinc-100">
                {formatUnits(result.syringeUnits)}
              </span>{' '}
              units on a {inputs.syringeType} syringe
            </span>
          )}
        </div>
        <div className="text-xs text-zinc-500">
          Concentration: {formatNum(result.concentrationMgPerMl, 3)} mg/mL
        </div>
      </div>

      {/* Placeholder: medical disclaimer near the result number */}
      <div className="mt-4">
        <DisclaimerSlot text={PLACEHOLDER_DISCLAIMER_RESULTS} />
      </div>

      {/* Warnings */}
      {result.warnings.length > 0 && (
        <ul className="mt-4 space-y-2">
          {result.warnings.map((w, i) => (
            <li key={i}>
              <WarningCard warning={w} />
            </li>
          ))}
        </ul>
      )}

      {/* Show the math (expandable transparency) */}
      <div className="mt-5 border-t border-zinc-200 pt-4 dark:border-zinc-800">
        <button
          type="button"
          onClick={onToggleMath}
          className="flex items-center gap-1.5 text-sm font-medium text-zinc-700 hover:text-zinc-900 dark:text-zinc-300 dark:hover:text-zinc-100"
          aria-expanded={showMath}
        >
          <span aria-hidden>{showMath ? '▾' : '▸'}</span>
          {showMath ? 'Hide the math' : 'Show the math'}
        </button>
        {showMath && (
          <div className="mt-3 space-y-2 rounded-md bg-zinc-50 p-3 font-mono text-xs leading-relaxed text-zinc-700 dark:bg-zinc-950 dark:text-zinc-300">
            <p>
              <strong>Step 1 — Reconstitution:</strong>
              <br />
              {inputs.vialAmount} {peptide?.vialUnit ?? 'mg'} ÷ {inputs.waterMl} mL ={' '}
              {formatNum(result.concentrationMgPerMl, 3)} mg/mL concentration
            </p>
            <p>
              <strong>Step 2 — Volume to draw:</strong>
              <br />
              {inputs.targetDose} {inputs.targetDoseUnit} ÷{' '}
              {formatNum(result.concentrationMgPerMl, 3)} mg/mL ={' '}
              {formatVolume(result.volumeMl)} mL
            </p>
            {!isIM && (
              <p>
                <strong>Step 3 — Syringe units:</strong>
                <br />
                {formatVolume(result.volumeMl)} mL × {unitsPerMl} units/mL ={' '}
                {formatUnits(result.syringeUnits)} units
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function WarningCard({ warning }: { warning: CalcWarning }) {
  const styles = {
    info: 'border-zinc-300 bg-zinc-50 text-zinc-800 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200',
    caution:
      'border-yellow-300 bg-yellow-50 text-yellow-900 dark:border-yellow-700 dark:bg-yellow-950 dark:text-yellow-200',
    serious:
      'border-red-300 bg-red-50 text-red-900 dark:border-red-700 dark:bg-red-950 dark:text-red-200',
  } as const;
  return (
    <div className={`rounded-md border px-3 py-2 text-xs leading-relaxed ${styles[warning.level]}`}>
      {warning.message}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Formatting helpers (presentation-only, never affect math)
// ─────────────────────────────────────────────────────────────

function formatNum(n: number, decimals: number): string {
  return Number(n.toFixed(decimals)).toString();
}

function formatVolume(mL: number): string {
  // 3-decimal precision shows useful detail without being noisy
  return formatNum(mL, 3);
}

function formatUnits(units: number): string {
  // Round display to nearest 0.5 (matches typical syringe graduations)
  // but only for the display — the underlying value is preserved.
  const rounded = Math.round(units * 2) / 2;
  return rounded.toString();
}
