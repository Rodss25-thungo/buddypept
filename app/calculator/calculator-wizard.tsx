'use client';

/**
 * BuddyPept calculator, as a guided step-by-step flow.
 *
 * One big question per screen, large tap targets, Buddy guiding, and a result
 * reveal with the live syringe and an inline editor. Designed to feel like an
 * app and be easy to read for a 40+ audience.
 *
 * The math is unchanged: it reuses calculateDose() from lib/calculator. This
 * component only changes how the questions are presented and answered.
 *
 * Hard brand rule respected: the dose is NEVER pre-filled. The user enters it.
 */

import { useMemo, useState } from 'react';
import { getPeptideBySlug, type Peptide } from '@/data/peptides';
import {
  calculateDose,
  type SyringeType,
  type Warning as CalcWarning,
} from '@/lib/calculator';
import { RequestPeptideForm } from './request-peptide-form';
import { Buddy } from '@/components/buddy';
import { SyringeDiagram } from '@/components/syringe-diagram';

// ───── Syringe barrels ─────
type SyringeBarrelId =
  | 'insulin-0.3'
  | 'insulin-0.5'
  | 'insulin-1.0'
  | 'im-1.0'
  | 'im-3.0';

interface SyringeBarrel {
  id: SyringeBarrelId;
  label: string;
  shortLabel: string;
  maxMl: number;
  scale: SyringeType;
}

const BARRELS: SyringeBarrel[] = [
  { id: 'insulin-0.3', label: 'Insulin syringe, 0.3 mL (up to 30 units)', shortLabel: '0.3 mL insulin', maxMl: 0.3, scale: 'U-100' },
  { id: 'insulin-0.5', label: 'Insulin syringe, 0.5 mL (up to 50 units)', shortLabel: '0.5 mL insulin', maxMl: 0.5, scale: 'U-100' },
  { id: 'insulin-1.0', label: 'Insulin syringe, 1 mL (up to 100 units)', shortLabel: '1 mL insulin', maxMl: 1.0, scale: 'U-100' },
  { id: 'im-1.0', label: 'IM syringe, 1 mL (oil based, marked in mL)', shortLabel: 'IM 1 mL', maxMl: 1.0, scale: 'IM' },
  { id: 'im-3.0', label: 'IM syringe, 3 mL (oil based, marked in mL)', shortLabel: 'IM 3 mL', maxMl: 3.0, scale: 'IM' },
];

function getBarrel(id: SyringeBarrelId): SyringeBarrel {
  return BARRELS.find((b) => b.id === id) ?? BARRELS[2];
}

// Curated picker list (slugs that exist in data/peptides.ts). Others use the
// "I don't see it here" path, which captures a request instead.
const WIZARD_PEPTIDE_SLUGS = [
  'bpc-157',
  'tb-500',
  'ghk-cu',
  'ipamorelin',
  'cjc-1295',
  'sermorelin',
  'retatrutide',
];
const WIZARD_PEPTIDES = WIZARD_PEPTIDE_SLUGS.map((s) => getPeptideBySlug(s)).filter(
  (p): p is Peptide => Boolean(p)
);

const NOT_LISTED = '__not_listed__';
const COMMON_VIAL_MG = [5, 10, 30, 50];
const COMMON_WATER_ML = [1, 2, 3, 5];

const DISCLAIMER_RESULTS =
  'This is math, not medical advice. Check it against your vial label and your provider’s guidance before drawing any dose.';

type DoseEntryUnit = 'mg' | 'mcg' | 'syringe';

const STEPS = ['peptide', 'vial', 'water', 'syringe', 'dose'] as const;

export function CalculatorWizard() {
  const [stepIndex, setStepIndex] = useState(0); // 0..4 inputs, 5 = result
  const [showRequest, setShowRequest] = useState(false);
  const [peptideSlug, setPeptideSlug] = useState('');
  const [vialAmount, setVialAmount] = useState<number>(NaN);
  const [waterMl, setWaterMl] = useState<number>(NaN);
  const [barrelId, setBarrelId] = useState<SyringeBarrelId>('insulin-1.0');
  const [doseMg, setDoseMg] = useState<number>(NaN); // canonical dose
  const [doseEntryUnit, setDoseEntryUnit] = useState<DoseEntryUnit>('mg');
  const [showMath, setShowMath] = useState(false);

  const isNotListed = peptideSlug === NOT_LISTED;
  const peptide = isNotListed ? undefined : getPeptideBySlug(peptideSlug);
  const barrel = getBarrel(barrelId);
  const vialUnit = peptide?.vialUnit ?? 'mg';
  const peptideLabel = peptide?.name ?? 'your peptide';
  const thirdLabel = barrel.scale === 'U-100' ? 'units' : 'mL';

  const concentrationMgPerMl =
    Number.isFinite(vialAmount) && vialAmount > 0 && Number.isFinite(waterMl) && waterMl > 0
      ? vialAmount / waterMl
      : NaN;

  // dose <-> syringe-draw conversions (presentation only)
  const drawFromMg = (mg: number) => {
    if (!Number.isFinite(mg) || !Number.isFinite(concentrationMgPerMl)) return NaN;
    return barrel.scale === 'U-100'
      ? mg / (concentrationMgPerMl / 100)
      : mg / concentrationMgPerMl;
  };
  const mgFromDraw = (draw: number) => {
    if (!Number.isFinite(draw) || !Number.isFinite(concentrationMgPerMl)) return NaN;
    return barrel.scale === 'U-100'
      ? draw * (concentrationMgPerMl / 100)
      : draw * concentrationMgPerMl;
  };

  const isResult = stepIndex >= STEPS.length;

  const computation = useMemo(() => {
    const ok =
      Number.isFinite(vialAmount) &&
      vialAmount > 0 &&
      Number.isFinite(waterMl) &&
      waterMl > 0 &&
      Number.isFinite(doseMg) &&
      doseMg > 0;
    if (!ok) return { result: null, error: null as string | null };
    try {
      const result = calculateDose({
        vialAmount,
        vialUnit,
        waterMl,
        targetDose: doseMg,
        targetDoseUnit: 'mg',
        syringeType: barrel.scale,
      });
      return { result, error: null as string | null };
    } catch (e) {
      return {
        result: null,
        error: e instanceof Error ? e.message : 'Something looks off with those numbers.',
      };
    }
  }, [vialAmount, vialUnit, waterMl, doseMg, barrel.scale]);

  function stepValid(i: number): boolean {
    switch (STEPS[i]) {
      case 'peptide':
        return peptideSlug !== '';
      case 'vial':
        return Number.isFinite(vialAmount) && vialAmount > 0;
      case 'water':
        return Number.isFinite(waterMl) && waterMl > 0;
      case 'syringe':
        return true;
      case 'dose':
        return Number.isFinite(doseMg) && doseMg > 0;
      default:
        return false;
    }
  }

  const canContinue = !isResult && stepValid(stepIndex);
  const isLastInput = stepIndex === STEPS.length - 1;

  function next() {
    if (!canContinue) return;
    // "I don't see it here" branches to the request screen, not the calculation.
    if (STEPS[stepIndex] === 'peptide' && isNotListed) {
      setShowRequest(true);
      return;
    }
    setStepIndex((s) => s + 1);
  }
  function back() {
    setStepIndex((s) => Math.max(0, s - 1));
  }
  function restart() {
    setStepIndex(0);
    setShowRequest(false);
    setPeptideSlug('');
    setVialAmount(NaN);
    setWaterMl(NaN);
    setBarrelId('insulin-1.0');
    setDoseMg(NaN);
    setDoseEntryUnit('mg');
    setShowMath(false);
  }

  // ── Request screen ("I don't see it here") ──
  if (showRequest) {
    return (
      <main className="mx-auto max-w-xl px-4 py-6 sm:py-10">
        <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 sm:p-7">
          <div className="mb-5 flex items-start gap-3">
            <Buddy className="h-12 w-auto flex-shrink-0 drop-shadow-sm" />
            <div>
              <h1 className="text-xl font-bold leading-snug tracking-tight sm:text-2xl">
                Which peptide do you need?
              </h1>
              <p className="mt-1.5 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
                Tell us the one you want and your email. We&rsquo;ll build it
                into the calculator and let you know when it&rsquo;s ready.
              </p>
            </div>
          </div>
          <RequestPeptideForm defaultPeptide="" />
        </div>
        <div className="mt-5">
          <button
            type="button"
            onClick={() => setShowRequest(false)}
            className="rounded-lg px-3 py-2 text-base font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
          >
            ← Back
          </button>
        </div>
      </main>
    );
  }

  // ── Result screen ──
  if (isResult) {
    return (
      <main className="mx-auto max-w-xl px-4 py-6 sm:py-10">
        <ResultScreen
          result={computation.result}
          error={computation.error}
          doseMg={doseMg}
          barrel={barrel}
          peptideLabel={peptideLabel}
          drawFromMg={drawFromMg}
          mgFromDraw={mgFromDraw}
          onChangeDoseMg={setDoseMg}
          showMath={showMath}
          onToggleMath={() => setShowMath((s) => !s)}
          onEditSteps={() => setStepIndex(STEPS.length - 1)}
          onRestart={restart}
        />
      </main>
    );
  }

  // dose field display value, derived from canonical doseMg
  const doseFieldValue =
    doseEntryUnit === 'mg'
      ? doseMg
      : doseEntryUnit === 'mcg'
        ? (Number.isFinite(doseMg) ? doseMg * 1000 : NaN)
        : drawFromMg(doseMg);

  function handleDoseFieldChange(raw: number) {
    if (!Number.isFinite(raw)) {
      setDoseMg(NaN);
      return;
    }
    if (doseEntryUnit === 'mg') setDoseMg(raw);
    else if (doseEntryUnit === 'mcg') setDoseMg(raw / 1000);
    else setDoseMg(mgFromDraw(raw));
  }

  return (
    <main className="mx-auto max-w-xl px-4 py-6 sm:py-10">
      <Progress current={stepIndex} total={STEPS.length} />

      <div className="mt-6 rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 sm:p-7">
        {STEPS[stepIndex] === 'peptide' && (
          <Step
            question="Which peptide are you using?"
            subtitle="Pick yours from the list. Not there? Choose “I don't see it here.”"
          >
            <select
              value={peptideSlug}
              onChange={(e) => setPeptideSlug(e.target.value)}
              className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-3.5 text-lg dark:border-zinc-700 dark:bg-zinc-800"
            >
              <option value="">Choose your peptide…</option>
              {WIZARD_PEPTIDES.map((p) => (
                <option key={p.slug} value={p.slug}>
                  {p.name}
                </option>
              ))}
              <option value={NOT_LISTED}>I don&rsquo;t see it here</option>
            </select>
            {isNotListed && (
              <p className="mt-3 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
                No problem. Tap Continue and we&rsquo;ll ask which one you need so
                we can add it.
              </p>
            )}
          </Step>
        )}

        {STEPS[stepIndex] === 'vial' && (
          <Step
            question={`How many mg are in your ${peptideLabel} vial?`}
            subtitle="The amount of peptide powder, printed on the vial label. Not the size of the glass container."
          >
            <BigNumberInput value={vialAmount} onChange={setVialAmount} unit="mg" placeholder="e.g. 5" />
            <QuickPicks options={COMMON_VIAL_MG} suffix="mg" value={vialAmount} onPick={setVialAmount} />
          </Step>
        )}

        {STEPS[stepIndex] === 'water' && (
          <Step
            question="How much bacteriostatic water are you mixing in?"
            subtitle="The sterile liquid you add to the vial to dissolve the powder."
          >
            <BigNumberInput value={waterMl} onChange={setWaterMl} unit="mL" placeholder="e.g. 2" />
            <QuickPicks options={COMMON_WATER_ML} suffix="mL" value={waterMl} onPick={setWaterMl} />
          </Step>
        )}

        {STEPS[stepIndex] === 'syringe' && (
          <Step question="What syringe do you have?" subtitle="We'll mark exactly where to fill it.">
            <div className="space-y-2">
              {BARRELS.map((b) => (
                <ChoiceButton
                  key={b.id}
                  selected={barrelId === b.id}
                  title={b.label}
                  onClick={() => setBarrelId(b.id)}
                />
              ))}
            </div>
          </Step>
        )}

        {STEPS[stepIndex] === 'dose' && (
          <Step
            question="What dose are you taking?"
            subtitle={`Enter it in mg or mcg. Don't know it that way? Switch to ${thirdLabel} and enter what you plan to draw. BuddyPept never picks this for you.`}
          >
            <BigNumberInput
              value={doseFieldValue}
              onChange={handleDoseFieldChange}
              unit={doseEntryUnit === 'syringe' ? thirdLabel : doseEntryUnit}
              placeholder={
                doseEntryUnit === 'mg' ? 'e.g. 0.25' : doseEntryUnit === 'mcg' ? 'e.g. 250' : 'e.g. 25'
              }
            />
            <div className="mt-3 flex gap-2">
              <UnitToggle label="mg" active={doseEntryUnit === 'mg'} onClick={() => setDoseEntryUnit('mg')} />
              <UnitToggle label="mcg" active={doseEntryUnit === 'mcg'} onClick={() => setDoseEntryUnit('mcg')} />
              <UnitToggle
                label={thirdLabel}
                active={doseEntryUnit === 'syringe'}
                onClick={() => setDoseEntryUnit('syringe')}
              />
            </div>
            {peptide && (
              <p className="mt-3 text-sm text-zinc-500">
                For reference only, research often cites around {peptide.typicalDose}{' '}
                {peptide.typicalDoseUnit} for {peptide.name}. Your dose is up to
                you and your provider.
              </p>
            )}
          </Step>
        )}
      </div>

      <div className="mt-5 flex items-center justify-between gap-3">
        {stepIndex > 0 ? (
          <button
            type="button"
            onClick={back}
            className="rounded-lg px-3 py-2 text-base font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
          >
            ← Back
          </button>
        ) : (
          <span />
        )}
        <button
          type="button"
          onClick={next}
          disabled={!canContinue}
          className="flex-1 rounded-xl bg-brand-600 px-6 py-4 text-lg font-semibold text-white shadow-sm transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-40 sm:flex-none"
        >
          {isNotListed ? 'Continue' : isLastInput ? 'Calculate' : 'Continue'} →
        </button>
      </div>
    </main>
  );
}

// ───── Result screen ─────

function ResultScreen({
  result,
  error,
  doseMg,
  barrel,
  peptideLabel,
  drawFromMg,
  mgFromDraw,
  onChangeDoseMg,
  showMath,
  onToggleMath,
  onEditSteps,
  onRestart,
}: {
  result: ReturnType<typeof calculateDose> | null;
  error: string | null;
  doseMg: number;
  barrel: SyringeBarrel;
  peptideLabel: string;
  drawFromMg: (mg: number) => number;
  mgFromDraw: (draw: number) => number;
  onChangeDoseMg: (mg: number) => void;
  showMath: boolean;
  onToggleMath: () => void;
  onEditSteps: () => void;
  onRestart: () => void;
}) {
  const isInsulin = barrel.scale === 'U-100';
  const thirdLabel = isInsulin ? 'units' : 'mL';

  if (error || !result) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center dark:border-red-900 dark:bg-red-950">
        <p className="text-base text-red-900 dark:text-red-100">
          {error ?? 'We could not work that out. Please check your numbers.'}
        </p>
        <button
          type="button"
          onClick={onEditSteps}
          className="mt-4 rounded-xl bg-brand-600 px-5 py-3 text-base font-semibold text-white hover:bg-brand-700"
        >
          ← Go back
        </button>
      </div>
    );
  }

  const drawAmount = isInsulin ? result.syringeUnits : result.volumeMl;
  const overCapacity = result.volumeMl > barrel.maxMl;

  const warnings: CalcWarning[] = [
    ...result.warnings,
    ...(overCapacity
      ? [
          {
            level: 'caution' as const,
            message: `Your dose needs ${formatNum(result.volumeMl, 3)} mL, more than the ${barrel.shortLabel} holds (${barrel.maxMl} mL). Use a larger syringe, or mix with more water for a weaker concentration.`,
          },
        ]
      : []),
  ];

  return (
    <div>
      <div className="text-center">
        <Buddy className="mx-auto h-16 w-auto drop-shadow-sm" />
        <p className="mt-3 text-sm font-medium uppercase tracking-wide text-brand-700 dark:text-brand-300">
          Here&rsquo;s your draw
        </p>
        <div className="mt-1 text-5xl font-bold tabular-nums text-brand-700 dark:text-brand-300">
          {isInsulin ? formatNum(result.syringeUnits, 1) : formatNum(result.volumeMl, 3)}
          <span className="ml-2 text-2xl font-semibold text-zinc-500">{thirdLabel}</span>
        </div>
        <p className="mt-1 text-base text-zinc-600 dark:text-zinc-400">
          {isInsulin ? `that's ${formatNum(result.volumeMl, 3)} mL of ${peptideLabel}` : `of ${peptideLabel}`}
        </p>
      </div>

      <div className="mt-6">
        <SyringeDiagram
          scale={barrel.scale}
          maxMl={barrel.maxMl}
          shortLabel={barrel.shortLabel}
          drawAmount={drawAmount}
        />
      </div>

      {/* Inline editor: change units or mg here and the syringe updates live. */}
      <div className="mt-4 rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
        <p className="mb-2 text-xs font-medium uppercase tracking-wide text-zinc-500">
          Adjust without going back
        </p>
        <div className="grid grid-cols-2 gap-3">
          <EditField
            label={thirdLabel}
            value={drawFromMg(doseMg)}
            onChange={(v) => onChangeDoseMg(mgFromDraw(v))}
          />
          <EditField
            label="mg"
            value={doseMg}
            onChange={(v) => onChangeDoseMg(v)}
          />
        </div>
      </div>

      {warnings.length > 0 && (
        <ul className="mt-4 space-y-2">
          {warnings.map((w, i) => (
            <li key={i}>
              <WarningCard warning={w} />
            </li>
          ))}
        </ul>
      )}

      <div className="mt-4 rounded-lg border border-zinc-200 bg-zinc-50 p-3 text-xs leading-relaxed text-zinc-600 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400">
        {DISCLAIMER_RESULTS}
      </div>

      <div className="mt-3 rounded-lg bg-zinc-50 p-3 text-xs text-zinc-500 dark:bg-zinc-900">
        Your dose: {formatNum(doseMg * 1000, 0)} mcg = {formatNum(doseMg, 4)} mg ·
        Concentration: {formatNum(result.concentrationMgPerMl, 3)} mg/mL · Syringe: {barrel.shortLabel}
      </div>

      <div className="mt-3">
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
            <p>Vial mg ÷ water mL = {formatNum(result.concentrationMgPerMl, 3)} mg/mL</p>
            <p>
              {formatNum(doseMg, 4)} mg ÷ {formatNum(result.concentrationMgPerMl, 3)} mg/mL ={' '}
              {formatNum(result.volumeMl, 3)} mL
            </p>
            {isInsulin && (
              <p>
                {formatNum(result.volumeMl, 3)} mL × 100 units/mL ={' '}
                {formatNum(result.syringeUnits, 2)} units
              </p>
            )}
          </div>
        )}
      </div>

      <div className="mt-6 flex gap-3">
        <button
          type="button"
          onClick={onEditSteps}
          className="flex-1 rounded-xl border border-zinc-300 px-4 py-3 text-base font-semibold text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800"
        >
          Change a step
        </button>
        <button
          type="button"
          onClick={onRestart}
          className="flex-1 rounded-xl bg-brand-600 px-4 py-3 text-base font-semibold text-white hover:bg-brand-700"
        >
          Start over
        </button>
      </div>
    </div>
  );
}

// ───── Building blocks ─────

function Progress({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex flex-1 gap-1.5">
        {Array.from({ length: total }).map((_, i) => (
          <div
            key={i}
            className={`h-1.5 flex-1 rounded-full ${i <= current ? 'bg-brand-600' : 'bg-zinc-200 dark:bg-zinc-700'}`}
          />
        ))}
      </div>
      <span className="text-xs font-medium text-zinc-500">
        Step {current + 1} of {total}
      </span>
    </div>
  );
}

function Step({
  question,
  subtitle,
  children,
}: {
  question: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="mb-5 flex items-start gap-3">
        <Buddy className="h-12 w-auto flex-shrink-0 drop-shadow-sm" />
        <div>
          <h1 className="text-xl font-bold leading-snug tracking-tight sm:text-2xl">{question}</h1>
          {subtitle && (
            <p className="mt-1.5 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">{subtitle}</p>
          )}
        </div>
      </div>
      {children}
    </div>
  );
}

function ChoiceButton({
  selected,
  title,
  subtitle,
  onClick,
}: {
  selected: boolean;
  title: string;
  subtitle?: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full items-center justify-between rounded-xl border px-4 py-3.5 text-left transition ${
        selected
          ? 'border-brand-600 bg-brand-50 ring-1 ring-brand-600 dark:bg-brand-950/40'
          : 'border-zinc-200 bg-white hover:border-zinc-300 dark:border-zinc-700 dark:bg-zinc-800 dark:hover:border-zinc-600'
      }`}
    >
      <span>
        <span className="block text-base font-medium">{title}</span>
        {subtitle && <span className="mt-0.5 block text-sm text-zinc-500">{subtitle}</span>}
      </span>
      <span
        className={`ml-3 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full border-2 ${
          selected ? 'border-brand-600 bg-brand-600' : 'border-zinc-300 dark:border-zinc-600'
        }`}
      >
        {selected && <span className="h-2 w-2 rounded-full bg-white" />}
      </span>
    </button>
  );
}

function BigNumberInput({
  value,
  onChange,
  unit,
  placeholder,
}: {
  value: number;
  onChange: (n: number) => void;
  unit: string;
  placeholder?: string;
}) {
  return (
    <div className="relative">
      <input
        type="number"
        inputMode="decimal"
        step="any"
        min={0}
        autoFocus
        value={Number.isFinite(value) ? formatForInput(value) : ''}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        placeholder={placeholder}
        className="w-full rounded-xl border border-zinc-300 bg-white py-4 pl-5 pr-16 text-2xl font-semibold tabular-nums dark:border-zinc-700 dark:bg-zinc-800"
      />
      <span className="pointer-events-none absolute right-5 top-1/2 -translate-y-1/2 text-lg font-medium text-zinc-400">
        {unit}
      </span>
    </div>
  );
}

function EditField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (n: number) => void;
}) {
  return (
    <div className="relative">
      <input
        type="number"
        inputMode="decimal"
        step="any"
        min={0}
        value={Number.isFinite(value) ? formatForInput(value) : ''}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full rounded-lg border border-zinc-300 bg-white py-2.5 pl-3 pr-12 text-lg font-semibold tabular-nums dark:border-zinc-700 dark:bg-zinc-800"
      />
      <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm font-medium text-zinc-400">
        {label}
      </span>
    </div>
  );
}

function QuickPicks({
  options,
  suffix,
  value,
  onPick,
}: {
  options: number[];
  suffix: string;
  value: number;
  onPick: (n: number) => void;
}) {
  return (
    <div className="mt-3 flex flex-wrap gap-2">
      {options.map((o) => (
        <button
          key={o}
          type="button"
          onClick={() => onPick(o)}
          className={`rounded-xl border px-4 py-2.5 text-base font-medium transition ${
            value === o
              ? 'border-brand-600 bg-brand-600 text-white'
              : 'border-zinc-300 bg-white text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200'
          }`}
        >
          {o} {suffix}
        </button>
      ))}
    </div>
  );
}

function UnitToggle({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex-1 rounded-xl border px-4 py-3 text-base font-semibold transition ${
        active
          ? 'border-brand-600 bg-brand-600 text-white'
          : 'border-zinc-300 bg-white text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200'
      }`}
    >
      {label}
    </button>
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
    <div className={`rounded-md border px-3 py-2 text-sm leading-relaxed ${styles[warning.level]}`}>
      {warning.message}
    </div>
  );
}

function formatNum(n: number, decimals: number): string {
  if (!Number.isFinite(n)) return '-';
  return Number(n.toFixed(decimals)).toString();
}

function formatForInput(n: number): string {
  if (!Number.isFinite(n)) return '';
  return Number(n.toFixed(6)).toString();
}
