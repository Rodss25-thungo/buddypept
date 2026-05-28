'use client';

/**
 * BuddyPept calculator, as a guided step-by-step flow.
 *
 * One big question per screen, large tap targets, Buddy guiding, a result
 * reveal with the live syringe, and an inline editor. Built to feel like an app
 * and read clearly for a 40+ audience. Educational framing only: it never
 * assumes anyone is using a peptide and never recommends a dose.
 *
 * The math is unchanged: it reuses calculateDose() from lib/calculator, which
 * is unit-agnostic. The vial's unit (mg or IU) is chosen by the peptide and
 * stays consistent through every step. Peptides sold in IU (HGH, HCG) are
 * calculated entirely in IU; we never convert IU to mass.
 *
 * Two reconstitution paths:
 *  - powder: amount + bacteriostatic water added -> strength
 *  - already liquid: amount + total liquid already in the vial -> strength
 */

import { useMemo, useState } from 'react';
import { getPeptideBySlug, type Peptide } from '@/data/peptides';
import {
  calculateDose,
  type SyringeType,
  type VialUnit,
  type Warning as CalcWarning,
} from '@/lib/calculator';
import Link from 'next/link';
import { RequestPeptideForm } from './request-peptide-form';
import { Buddy } from '@/components/buddy';
import { SyringeDiagram } from '@/components/syringe-diagram';
import { LearnPopup } from '@/components/learn-popup';

// ───── Syringe barrels ─────
type SyringeBarrelId = 'insulin-0.3' | 'insulin-0.5' | 'insulin-1.0' | 'im-1.0' | 'im-3.0';

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

// Curated picker list (slugs in data/peptides.ts). Order shown in the dropdown.
const WIZARD_PEPTIDE_SLUGS = [
  'semaglutide',
  'tirzepatide',
  'bpc-157',
  'tb-500',
  'ghk-cu',
  'ipamorelin',
  'cjc-1295',
  'sermorelin',
  'retatrutide',
  'hgh',
  'hcg',
];
const WIZARD_PEPTIDES = WIZARD_PEPTIDE_SLUGS.map((s) => getPeptideBySlug(s)).filter(
  (p): p is Peptide => Boolean(p)
);

const NOT_LISTED = '__not_listed__';
const COMMON_WATER_ML = [1, 2, 3, 5];

const DISCLAIMER_RESULTS =
  'This is math, not medical advice. Check it against the vial label and a licensed provider’s guidance before drawing any dose.';

type DoseEntryUnit = 'mg' | 'mcg' | 'native' | 'draw';
type Form = 'powder' | 'liquid';

const STEPS = ['peptide', 'form', 'amount', 'volume', 'syringe', 'dose'] as const;

export function CalculatorWizard() {
  const [stepIndex, setStepIndex] = useState(0);
  const [showRequest, setShowRequest] = useState(false);
  const [peptideSlug, setPeptideSlug] = useState('');
  const [form, setForm] = useState<Form>('powder');
  const [vialAmount, setVialAmount] = useState<number>(NaN);
  const [waterMl, setWaterMl] = useState<number>(NaN);
  const [barrelId, setBarrelId] = useState<SyringeBarrelId>('insulin-1.0');
  const [doseNative, setDoseNative] = useState<number>(NaN);
  const [doseEntryUnit, setDoseEntryUnit] = useState<DoseEntryUnit>('mg');
  const [showMath, setShowMath] = useState(false);

  const isNotListed = peptideSlug === NOT_LISTED;
  const peptide = isNotListed ? undefined : getPeptideBySlug(peptideSlug);
  const barrel = getBarrel(barrelId);
  const vialUnit: VialUnit = peptide?.vialUnit ?? 'mg';
  const isIU = vialUnit === 'IU';
  const peptideLabel = peptide?.name ?? 'the peptide';
  const thirdLabel = barrel.scale === 'U-100' ? 'units' : 'mL';

  const concPerMl =
    Number.isFinite(vialAmount) && vialAmount > 0 && Number.isFinite(waterMl) && waterMl > 0
      ? vialAmount / waterMl
      : NaN;

  const drawFromNative = (native: number) => {
    if (!Number.isFinite(native) || !Number.isFinite(concPerMl)) return NaN;
    return barrel.scale === 'U-100' ? native / (concPerMl / 100) : native / concPerMl;
  };
  const nativeFromDraw = (draw: number) => {
    if (!Number.isFinite(draw) || !Number.isFinite(concPerMl)) return NaN;
    return barrel.scale === 'U-100' ? draw * (concPerMl / 100) : draw * concPerMl;
  };

  const isResult = stepIndex >= STEPS.length;

  const computation = useMemo(() => {
    const ok =
      Number.isFinite(vialAmount) &&
      vialAmount > 0 &&
      Number.isFinite(waterMl) &&
      waterMl > 0 &&
      Number.isFinite(doseNative) &&
      doseNative > 0;
    if (!ok) return { result: null, error: null as string | null };
    try {
      const result = calculateDose({
        vialAmount,
        vialUnit,
        waterMl,
        targetDose: doseNative,
        targetDoseUnit: vialUnit,
        syringeType: barrel.scale,
      });
      return { result, error: null as string | null };
    } catch (e) {
      return {
        result: null,
        error: e instanceof Error ? e.message : 'Something looks off with those numbers.',
      };
    }
  }, [vialAmount, vialUnit, waterMl, doseNative, barrel.scale]);

  function stepValid(i: number): boolean {
    switch (STEPS[i]) {
      case 'peptide':
        return peptideSlug !== '';
      case 'form':
        return true;
      case 'amount':
        return Number.isFinite(vialAmount) && vialAmount > 0;
      case 'volume':
        return Number.isFinite(waterMl) && waterMl > 0;
      case 'syringe':
        return true;
      case 'dose':
        return Number.isFinite(doseNative) && doseNative > 0;
      default:
        return false;
    }
  }

  const canContinue = !isResult && stepValid(stepIndex);
  const isLastInput = stepIndex === STEPS.length - 1;

  function handlePeptideChange(slug: string) {
    setPeptideSlug(slug);
    setVialAmount(NaN);
    setDoseNative(NaN);
    const p = getPeptideBySlug(slug);
    setDoseEntryUnit(p?.vialUnit === 'IU' ? 'native' : 'mg');
  }

  function next() {
    if (!canContinue) return;
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
    setForm('powder');
    setVialAmount(NaN);
    setWaterMl(NaN);
    setBarrelId('insulin-1.0');
    setDoseNative(NaN);
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
          doseNative={doseNative}
          vialUnit={vialUnit}
          barrel={barrel}
          peptideLabel={peptideLabel}
          drawFromNative={drawFromNative}
          nativeFromDraw={nativeFromDraw}
          onChangeDoseNative={setDoseNative}
          showMath={showMath}
          onToggleMath={() => setShowMath((s) => !s)}
          onEditSteps={() => setStepIndex(STEPS.length - 1)}
          onRestart={restart}
        />
      </main>
    );
  }

  // dose field value derived from canonical doseNative
  const doseFieldValue =
    doseEntryUnit === 'mg'
      ? doseNative
      : doseEntryUnit === 'mcg'
        ? Number.isFinite(doseNative)
          ? doseNative * 1000
          : NaN
        : doseEntryUnit === 'native'
          ? doseNative
          : drawFromNative(doseNative);

  function handleDoseFieldChange(raw: number) {
    if (!Number.isFinite(raw)) {
      setDoseNative(NaN);
      return;
    }
    if (doseEntryUnit === 'mg' || doseEntryUnit === 'native') setDoseNative(raw);
    else if (doseEntryUnit === 'mcg') setDoseNative(raw / 1000);
    else setDoseNative(nativeFromDraw(raw));
  }

  const doseFieldUnit =
    doseEntryUnit === 'mg'
      ? 'mg'
      : doseEntryUnit === 'mcg'
        ? 'mcg'
        : doseEntryUnit === 'native'
          ? vialUnit
          : thirdLabel;

  return (
    <main className="mx-auto max-w-xl px-4 py-6 sm:py-10">
      <Progress current={stepIndex} total={STEPS.length} />

      <div className="mt-6 rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 sm:p-7">
        {STEPS[stepIndex] === 'peptide' && (
          <Step
            question="Pick a peptide"
            subtitle="Select one from the list. Not there? Choose “I don't see it here.”"
          >
            <select
              value={peptideSlug}
              onChange={(e) => handlePeptideChange(e.target.value)}
              className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-3.5 text-lg dark:border-zinc-700 dark:bg-zinc-800"
            >
              <option value="">Choose a peptide…</option>
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
            {peptide && (
              <p className="mt-3 text-sm text-zinc-500">
                {peptide.name} is measured in{' '}
                <strong>{isIU ? 'international units (IU)' : 'milligrams (mg)'}</strong>,
                so the whole calculation will stay in {isIU ? 'IU' : 'mg'}.
              </p>
            )}
          </Step>
        )}

        {STEPS[stepIndex] === 'form' && (
          <Step
            question={`Is the ${peptideLabel} a powder or already a liquid?`}
            subtitle="Freeze-dried powder needs mixing. An already-liquid vial does not."
          >
            <div className="space-y-2">
              <ChoiceButton
                selected={form === 'powder'}
                title="A powder I mix"
                subtitle="Freeze-dried, needs bacteriostatic water"
                onClick={() => setForm('powder')}
              />
              <ChoiceButton
                selected={form === 'liquid'}
                title="Already a liquid"
                subtitle="Pre-mixed in the vial, no water to add"
                onClick={() => setForm('liquid')}
              />
            </div>
          </Step>
        )}

        {STEPS[stepIndex] === 'amount' && (
          <Step
            question={`How many ${vialUnit} are in the ${peptideLabel} vial?`}
            subtitle={
              form === 'powder'
                ? `Peptides come as a freeze-dried powder sealed in a glass vial. Enter the total amount on the label, not the size of the glass.`
                : `Enter the total amount of ${peptideLabel} in the vial, printed on the label. Not the size of the glass.`
            }
          >
            <BigNumberInput value={vialAmount} onChange={setVialAmount} unit={vialUnit} placeholder={isIU ? 'e.g. 5000' : 'e.g. 5'} />
            {peptide && peptide.commonVialSizes.length > 0 && (
              <QuickPicks options={peptide.commonVialSizes} suffix={vialUnit} value={vialAmount} onPick={setVialAmount} />
            )}
          </Step>
        )}

        {STEPS[stepIndex] === 'volume' &&
          (form === 'powder' ? (
            <Step
              question="How much bacteriostatic water goes in?"
              subtitle={`Powder is a two-part mix: the ${peptideLabel} plus bacteriostatic water to dissolve it. Enter the amount of water added to the vial.`}
            >
              <BigNumberInput value={waterMl} onChange={setWaterMl} unit="mL" placeholder="e.g. 2" />
              <QuickPicks options={COMMON_WATER_ML} suffix="mL" value={waterMl} onPick={setWaterMl} />
            </Step>
          ) : (
            <Step
              question="How much total liquid is in the vial?"
              subtitle="The full volume already in the vial. Check the label (for example, the mL it came in)."
            >
              <BigNumberInput value={waterMl} onChange={setWaterMl} unit="mL" placeholder="e.g. 1" />
              <QuickPicks options={COMMON_WATER_ML} suffix="mL" value={waterMl} onPick={setWaterMl} />
            </Step>
          ))}

        {STEPS[stepIndex] === 'syringe' && (
          <Step
            question="Pick a syringe"
            subtitle="Most people use an insulin syringe. The mL is how much it holds; the units are the marks along the barrel. We'll show where the dose lands on it."
          >
            <div className="space-y-2">
              {BARRELS.map((b) => (
                <ChoiceButton key={b.id} selected={barrelId === b.id} title={b.label} onClick={() => setBarrelId(b.id)} />
              ))}
            </div>
          </Step>
        )}

        {STEPS[stepIndex] === 'dose' && (
          <Step
            question="What dose do you want to calculate?"
            subtitle={`Enter it in ${isIU ? 'IU' : 'mg or mcg'}. Only know how many ${thirdLabel} to draw? Switch the unit below.`}
          >
            <BigNumberInput
              value={doseFieldValue}
              onChange={handleDoseFieldChange}
              unit={doseFieldUnit}
              placeholder={
                doseEntryUnit === 'mg'
                  ? 'e.g. 0.25'
                  : doseEntryUnit === 'mcg'
                    ? 'e.g. 250'
                    : doseEntryUnit === 'native'
                      ? 'e.g. 500'
                      : 'e.g. 25'
              }
            />
            <div className="mt-3 flex gap-2">
              {isIU ? (
                <UnitToggle label="IU" active={doseEntryUnit === 'native'} onClick={() => setDoseEntryUnit('native')} />
              ) : (
                <>
                  <UnitToggle label="mg" active={doseEntryUnit === 'mg'} onClick={() => setDoseEntryUnit('mg')} />
                  <UnitToggle label="mcg" active={doseEntryUnit === 'mcg'} onClick={() => setDoseEntryUnit('mcg')} />
                </>
              )}
              <UnitToggle label={thirdLabel} active={doseEntryUnit === 'draw'} onClick={() => setDoseEntryUnit('draw')} />
            </div>
            <p className="mt-3 text-sm text-zinc-500">
              BuddyPept never suggests a dose. It just does the math for the
              number you enter. Dosing is a decision for you and your provider.
            </p>
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
  doseNative,
  vialUnit,
  barrel,
  peptideLabel,
  drawFromNative,
  nativeFromDraw,
  onChangeDoseNative,
  showMath,
  onToggleMath,
  onEditSteps,
  onRestart,
}: {
  result: ReturnType<typeof calculateDose> | null;
  error: string | null;
  doseNative: number;
  vialUnit: VialUnit;
  barrel: SyringeBarrel;
  peptideLabel: string;
  drawFromNative: (n: number) => number;
  nativeFromDraw: (draw: number) => number;
  onChangeDoseNative: (n: number) => void;
  showMath: boolean;
  onToggleMath: () => void;
  onEditSteps: () => void;
  onRestart: () => void;
}) {
  const isInsulin = barrel.scale === 'U-100';
  const thirdLabel = isInsulin ? 'units' : 'mL';
  const isIU = vialUnit === 'IU';
  const concUnit = isIU ? 'IU/mL' : 'mg/mL';
  const ready = Boolean(result) && !error;

  const drawAmount = ready
    ? isInsulin
      ? result!.syringeUnits
      : result!.volumeMl
    : drawFromNative(doseNative);

  const bigValue = ready
    ? isInsulin
      ? formatNum(result!.syringeUnits, 1)
      : formatNum(result!.volumeMl, 3)
    : '—';

  const subline = ready
    ? isInsulin
      ? `that's ${formatNum(result!.volumeMl, 3)} mL of ${peptideLabel}`
      : `of ${peptideLabel}`
    : 'Type a dose below to see the draw.';

  // Drop the lib's "IU cannot convert to mass" caution: we stay entirely in IU,
  // so it does not apply and would only confuse.
  const baseWarnings = ready
    ? isIU
      ? result!.warnings.filter((w) => !w.message.includes('International Units'))
      : result!.warnings
    : [];
  const warnings: CalcWarning[] = ready
    ? [
        ...baseWarnings,
        ...(result!.volumeMl > barrel.maxMl
          ? [
              {
                level: 'caution' as const,
                message: `This dose needs ${formatNum(result!.volumeMl, 3)} mL, more than the ${barrel.shortLabel} holds (${barrel.maxMl} mL). Use a larger syringe, or mix with more water for a weaker concentration.`,
              },
            ]
          : []),
      ]
    : [];

  return (
    <div>
      <div className="text-center">
        <Buddy className="mx-auto h-16 w-auto drop-shadow-sm" />
        <p className="mt-3 text-sm font-medium uppercase tracking-wide text-brand-700 dark:text-brand-300">
          Calculated draw
        </p>
        <div className="mt-1 text-5xl font-bold tabular-nums text-brand-700 dark:text-brand-300">
          {bigValue}
          <span className="ml-2 text-2xl font-semibold text-zinc-500">{thirdLabel}</span>
        </div>
        <p className="mt-1 text-base text-zinc-600 dark:text-zinc-400">{subline}</p>
      </div>

      <div className="mt-6">
        <SyringeDiagram scale={barrel.scale} maxMl={barrel.maxMl} shortLabel={barrel.shortLabel} drawAmount={drawAmount} />
      </div>

      {error && (
        <div className="mt-4">
          <WarningCard warning={{ level: 'serious', message: error }} />
        </div>
      )}

      {/* Inline editor: change the draw or the dose here and the syringe updates live. */}
      <div className="mt-4 rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
        <p className="mb-2 text-xs font-medium uppercase tracking-wide text-zinc-500">
          Adjust without going back
        </p>
        <div className="grid grid-cols-2 gap-3">
          <EditField label={thirdLabel} value={drawFromNative(doseNative)} onChange={(v) => onChangeDoseNative(nativeFromDraw(v))} />
          <EditField label={vialUnit} value={doseNative} onChange={(v) => onChangeDoseNative(v)} />
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

      {ready && (
        <div className="mt-3 rounded-lg bg-zinc-50 p-3 text-xs text-zinc-500 dark:bg-zinc-900">
          {isIU ? (
            <>Dose: {formatNum(doseNative, 2)} IU · </>
          ) : (
            <>Dose: {formatNum(doseNative * 1000, 0)} mcg = {formatNum(doseNative, 4)} mg · </>
          )}
          Concentration: {formatNum(result!.concentrationMgPerMl, 3)} {concUnit} · Syringe: {barrel.shortLabel}
        </div>
      )}

      {ready && (
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
              <p>Vial {vialUnit} ÷ liquid mL = {formatNum(result!.concentrationMgPerMl, 3)} {concUnit}</p>
              <p>
                {formatNum(doseNative, 4)} {vialUnit} ÷ {formatNum(result!.concentrationMgPerMl, 3)} {concUnit} ={' '}
                {formatNum(result!.volumeMl, 3)} mL
              </p>
              {isInsulin && (
                <p>
                  {formatNum(result!.volumeMl, 3)} mL × 100 units/mL = {formatNum(result!.syringeUnits, 2)} units
                </p>
              )}
            </div>
          )}
        </div>
      )}

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

      {/* Offer: the gated education library (lead engine) */}
      <div className="mt-8 rounded-2xl border border-brand-200 bg-brand-50 p-5 text-center dark:border-brand-900 dark:bg-brand-950/30">
        <p className="text-base font-semibold">Want to understand the peptides themselves?</p>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          Free, plain-English guides: what each one is, what it has been studied
          for, how it is sold, and its legal status.
        </p>
        <Link
          href="/learn"
          className="mt-4 inline-flex items-center gap-2 rounded-lg bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-700"
        >
          Learn about peptides <span aria-hidden>→</span>
        </Link>
      </div>

      <LearnPopup />
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
          {subtitle && <p className="mt-1.5 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">{subtitle}</p>}
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
        className="w-full rounded-lg border border-zinc-300 bg-white py-2.5 pl-3 pr-14 text-lg font-semibold tabular-nums dark:border-zinc-700 dark:bg-zinc-800"
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
    serious: 'border-red-300 bg-red-50 text-red-900 dark:border-red-700 dark:bg-red-950 dark:text-red-200',
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
