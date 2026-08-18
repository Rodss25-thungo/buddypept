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

import { useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { getPeptideBySlug, type Peptide } from '@/data/peptides';
import { CALCULATOR_SLUGS, CALCULATOR_PEPTIDES } from '@/data/calculator-peptides';
import {
  calculateDose,
  type SyringeType,
  type VialUnit,
  type Warning as CalcWarning,
  type DoseResult,
} from '@/lib/calculator';
import { formatNum as fmt } from '@/lib/format';
import { Link } from '@/i18n/navigation';
import { RequestPeptideForm } from './request-peptide-form';
import { Buddy } from '@/components/buddy';
import { SyringeDiagram } from '@/components/syringe-diagram';
import { LearnPopup } from '@/components/learn-popup';

// ───── Syringe barrels ─────
type SyringeBarrelId = 'insulin-0.3' | 'insulin-0.5' | 'insulin-1.0' | 'im-1.0' | 'im-3.0';

interface SyringeBarrel {
  id: SyringeBarrelId;
  /**
   * Message key under `calculator.barrel`. Kept separate from `id` because the
   * ids contain dots and next-intl reads a dot as a path separator, so
   * `barrel.insulin-0.3.label` would be looked up as four nested levels.
   */
  msgKey: 'insulin03' | 'insulin05' | 'insulin10' | 'im10' | 'im30';
  maxMl: number;
  scale: SyringeType;
}

const BARRELS: SyringeBarrel[] = [
  { id: 'insulin-0.3', msgKey: 'insulin03', maxMl: 0.3, scale: 'U-100' },
  { id: 'insulin-0.5', msgKey: 'insulin05', maxMl: 0.5, scale: 'U-100' },
  { id: 'insulin-1.0', msgKey: 'insulin10', maxMl: 1.0, scale: 'U-100' },
  { id: 'im-1.0', msgKey: 'im10', maxMl: 1.0, scale: 'IM' },
  { id: 'im-3.0', msgKey: 'im30', maxMl: 3.0, scale: 'IM' },
];

function getBarrel(id: SyringeBarrelId): SyringeBarrel {
  return BARRELS.find((b) => b.id === id) ?? BARRELS[2];
}

// Curated picker list. It moved to data/calculator-peptides.ts so the code that
// emails people "your peptide is live" reads the same list this dropdown does;
// when those two disagreed, requesters were sent to a peptide that had no entry
// here. Adding to data/peptides.ts still does not put it in the picker.
const WIZARD_PEPTIDE_SLUGS: readonly string[] = CALCULATOR_SLUGS;
const WIZARD_PEPTIDES: Peptide[] = CALCULATOR_PEPTIDES;

const NOT_LISTED = '__not_listed__';
const OTHER_PEPTIDE = '__other__';
const COMMON_WATER_ML = [1, 2, 3, 5];
// Generic vial size quick-picks used when "Other peptide" is selected (no
// library data to fall back on). Common research-vial sizes in mg.
const COMMON_GENERIC_VIAL_MG = [5, 10, 15, 20, 30];

type DoseEntryUnit = 'mg' | 'mcg' | 'native' | 'draw';
/** The calculator has exactly one reachable failure, so one code covers it. */
type ErrorCode = 'generic' | null;
type Form = 'powder' | 'liquid';

const STEPS = ['peptide', 'form', 'amount', 'volume', 'syringe', 'dose'] as const;

/**
 * `initialPeptideSlug` preselects the dropdown from `/calculator?peptide=<slug>`.
 * It is how the "your peptide is live" email links someone straight to the
 * thing they asked for. Anything not in WIZARD_PEPTIDE_SLUGS is ignored, so a
 * stale or hand-edited URL falls back to the normal empty picker rather than
 * breaking the flow.
 */
export function CalculatorWizard({
  initialPeptideSlug,
}: {
  initialPeptideSlug?: string;
} = {}) {
  const presetSlug =
    initialPeptideSlug && WIZARD_PEPTIDE_SLUGS.includes(initialPeptideSlug)
      ? initialPeptideSlug
      : '';

  const t = useTranslations('calculator');
  const locale = useLocale();

  const [stepIndex, setStepIndex] = useState(0);
  const [showRequest, setShowRequest] = useState(false);
  const [peptideSlug, setPeptideSlug] = useState(presetSlug);
  const [form, setForm] = useState<Form>('powder');
  const [vialAmount, setVialAmount] = useState<number>(NaN);
  const [waterMl, setWaterMl] = useState<number>(NaN);
  const [barrelId, setBarrelId] = useState<SyringeBarrelId>('insulin-1.0');
  const [doseNative, setDoseNative] = useState<number>(NaN);
  // Mirrors handlePeptideChange(): IU peptides (HGH, HCG) enter doses natively.
  const [doseEntryUnit, setDoseEntryUnit] = useState<DoseEntryUnit>(
    getPeptideBySlug(presetSlug)?.vialUnit === 'IU' ? 'native' : 'mg'
  );
  const [showMath, setShowMath] = useState(false);
  /** Name typed for a peptide the library does not curate. Label only. */
  const [customName, setCustomName] = useState('');
  /** Unit on the vial, for a peptide the library does not curate. */
  const [customUnit, setCustomUnit] = useState<VialUnit>('mg');

  const isNotListed = peptideSlug === NOT_LISTED;
  const isOther = peptideSlug === OTHER_PEPTIDE;
  const peptide =
    isNotListed || isOther ? undefined : getPeptideBySlug(peptideSlug);
  const barrel = getBarrel(barrelId);
  // A curated peptide knows its own unit. A typed one has to be asked, because
  // guessing mg would print "mg" all over a screen whose vial says IU, and a
  // dosing tool that mislabels the unit is worse than one that asks.
  const vialUnit: VialUnit = peptide?.vialUnit ?? customUnit;
  const isIU = vialUnit === 'IU';

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

  // Not manually memoized: the React Compiler is enabled for this project and
  // memoizes this itself. A hand-written useMemo here trips
  // react-hooks/preserve-manual-memoization, because the compiler cannot prove
  // the dependencies stay unmodified across the component's hook calls.
  const computation = ((): { result: DoseResult | null; error: ErrorCode } => {
    const ok =
      Number.isFinite(vialAmount) &&
      vialAmount > 0 &&
      Number.isFinite(waterMl) &&
      waterMl > 0 &&
      Number.isFinite(doseNative) &&
      doseNative > 0;
    if (!ok) return { result: null, error: null as ErrorCode };
    try {
      const result = calculateDose({
        vialAmount,
        vialUnit,
        waterMl,
        targetDose: doseNative,
        targetDoseUnit: vialUnit,
        syringeType: barrel.scale,
      });
      return { result, error: null as ErrorCode };
    } catch {
      // A code, not a sentence. Zod's messages are English and are unreachable
      // in practice anyway (the `ok` guard above rejects every non-positive
      // input before this runs), so the UI renders its own translated wording
      // and this stays a pure computation with no translator dependency.
      return { result: null, error: 'generic' as ErrorCode };
    }
  })();

  // Declared after the memo on purpose. These call t(), and an opaque call
  // sitting between `vialUnit` and the useMemo stops the React Compiler from
  // proving the dependency is never mutated, which trips
  // react-hooks/preserve-manual-memoization.
  // Curated name, else whatever they typed, else a neutral stand-in. A person
  // who entered "tesamorelin" should read "tesamorelin" back on the result,
  // not "the peptide".
  const peptideLabel =
    peptide?.name ?? (customName.trim() || t('result.peptideFallback'));
  const thirdLabel = barrel.scale === 'U-100' ? t('units') : 'mL';
  // The unit abbreviation a reader sees. `vialUnit` is the internal code and
  // is always English; "IU" is "UI" in Portuguese and Spanish.
  const unitShort = isIU ? t('unit.iuShort') : t('unit.mgShort');

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

  function handlePeptideChange(slug: string, customName?: string) {
    setPeptideSlug(slug);
    setCustomName(customName ?? '');
    // Back to the default each time, so a unit chosen for one typed peptide
    // cannot silently carry over to the next.
    setCustomUnit('mg');
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
                {t('request.title')}
              </h1>
              <p className="mt-1.5 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
                {t('request.body')}
              </p>
            </div>
          </div>
          {/*
            Seeded with whatever they typed in the picker, so nobody retypes a
            name they already gave. onDone drops them into the generic
            calculation under that same name: the request is captured, and the
            answer still arrives in the same visit.
          */}
          <RequestPeptideForm
            defaultPeptide={customName}
            onDone={(peptideName) => {
              setShowRequest(false);
              handlePeptideChange(OTHER_PEPTIDE, peptideName);
              setStepIndex(1);
            }}
          />
        </div>
        <div className="mt-5">
          <button
            type="button"
            onClick={() => setShowRequest(false)}
            className="rounded-lg px-3 py-2 text-base font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
          >
            ← {t('back')}
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
          locale={locale}
          drawFromNative={drawFromNative}
          nativeFromDraw={nativeFromDraw}
          onChangeDoseNative={setDoseNative}
          waterMl={waterMl}
          onChangeWaterMl={setWaterMl}
          vialAmount={vialAmount}
          onChangeVialAmount={setVialAmount}
          form={form}
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
          ? unitShort
          : thirdLabel;

  return (
    <main className="mx-auto max-w-xl px-4 py-6 sm:py-10">
      <Progress current={stepIndex} total={STEPS.length} />

      <div className="mt-6 rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 sm:p-7">
        {STEPS[stepIndex] === 'peptide' && (
          <Step
            question={t('peptide.question')}
            subtitle={t('peptide.subtitle')}
          >
            <PeptidePicker
              value={peptideSlug}
              onChange={handlePeptideChange}
              placeholder={t('peptide.placeholder')}
              otherLabel={t('peptide.other')}
              notListedLabel={t('peptide.notListed')}
              typedOptionLabel={(typed) => t('peptide.useTyped', { name: typed })}
            />
            {isNotListed && (
              <p className="mt-3 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
                {t('peptide.notListedHint')}
              </p>
            )}
            {isOther && (
              <p className="mt-3 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
                {t.rich('peptide.otherHint', {
                  b: (chunks) => <strong>{chunks}</strong>,
                })}
              </p>
            )}
            {peptide && (
              <p className="mt-3 text-sm text-zinc-500">
                {t.rich('peptide.measuredIn', {
                  name: peptide.name,
                  unitLong: isIU ? t('unit.iuLong') : t('unit.mgLong'),
                  unitShort: isIU ? t('unit.iuShort') : t('unit.mgShort'),
                  b: (chunks) => <strong>{chunks}</strong>,
                })}
              </p>
            )}
          </Step>
        )}

        {STEPS[stepIndex] === 'form' && (
          <Step
            question={t('form.question', {
              name: peptide?.name ?? t('form.fallbackName'),
            })}
            subtitle={t('form.subtitle')}
          >
            <div className="space-y-2">
              <ChoiceButton
                selected={form === 'powder'}
                title={t('form.powderTitle')}
                subtitle={t('form.powderSubtitle')}
                onClick={() => setForm('powder')}
              />
              <ChoiceButton
                selected={form === 'liquid'}
                title={t('form.liquidTitle')}
                subtitle={t('form.liquidSubtitle')}
                onClick={() => setForm('liquid')}
              />
            </div>
          </Step>
        )}

        {STEPS[stepIndex] === 'amount' && (
          <Step
            /*
              Split by unit rather than interpolating "IU" into one sentence.
              The unit abbreviation carries grammatical gender in Portuguese
              and Spanish (UI is feminine, mg is not), so the number word ahead
              of it has to change with it. One shared string cannot agree with
              both.
            */
            question={
              isIU
                ? t('amount.questionIU', { name: peptide?.name ?? t('form.fallbackName') })
                : t('amount.questionMass', {
                    unit: t('unit.mgShort'),
                    name: peptide?.name ?? t('form.fallbackName'),
                  })
            }
            subtitle={
              form === 'powder'
                ? t('amount.subtitlePowder')
                : t('amount.subtitleLiquid', { name: peptideLabel })
            }
          >
            {/*
              Unit picker, only for a peptide the library does not curate. The
              label on the vial is the only thing that settles this, so it is
              asked plainly rather than inferred from the name.
            */}
            {!peptide && (
              <div className="mb-3">
                <p className="mb-1.5 text-xs font-medium text-zinc-600 dark:text-zinc-400">
                  {t('amount.unitQuestion')}
                </p>
                <div className="flex gap-2">
                  <UnitToggle
                    label={t('unit.mgShort')}
                    active={customUnit === 'mg'}
                    onClick={() => {
                      setCustomUnit('mg');
                      setVialAmount(NaN);
                      setDoseNative(NaN);
                      setDoseEntryUnit('mg');
                    }}
                  />
                  <UnitToggle
                    label={t('unit.iuShort')}
                    active={customUnit === 'IU'}
                    onClick={() => {
                      setCustomUnit('IU');
                      setVialAmount(NaN);
                      setDoseNative(NaN);
                      setDoseEntryUnit('native');
                    }}
                  />
                </div>
              </div>
            )}
            <BigNumberInput value={vialAmount} onChange={setVialAmount} unit={unitShort} placeholder={isIU ? t('amount.placeholderIU') : t('amount.placeholderMg')} />
            {peptide && peptide.commonVialSizes.length > 0 ? (
              <QuickPicks
                options={peptide.commonVialSizes}
                suffix={unitShort}
                value={vialAmount}
                onPick={setVialAmount}
                hint={t('amount.hint', { unit: unitShort })}
              />
            ) : isOther && !isIU ? (
              // Common strengths are mg figures. Offering them beside an IU
              // vial would suggest sizes that do not exist in that unit.
              <QuickPicks
                options={COMMON_GENERIC_VIAL_MG}
                suffix={t('unit.mgShort')}
                value={vialAmount}
                onPick={setVialAmount}
                hint={t('amount.hint', { unit: t('unit.mgShort') })}
              />
            ) : null}
          </Step>
        )}

        {STEPS[stepIndex] === 'volume' &&
          (form === 'powder' ? (
            <Step
              question={t('volume.powderQuestion')}
              subtitle={t('volume.powderSubtitle', {
                name: peptide?.name ?? t('form.fallbackName'),
              })}
            >
              <BigNumberInput value={waterMl} onChange={setWaterMl} unit="mL" placeholder={t('volume.powderPlaceholder')} />
              <QuickPicks options={COMMON_WATER_ML} suffix="mL" value={waterMl} onPick={setWaterMl} />
            </Step>
          ) : (
            <Step
              question={t('volume.liquidQuestion')}
              subtitle={t('volume.liquidSubtitle')}
            >
              <BigNumberInput value={waterMl} onChange={setWaterMl} unit="mL" placeholder={t('volume.liquidPlaceholder')} />
              <QuickPicks options={COMMON_WATER_ML} suffix="mL" value={waterMl} onPick={setWaterMl} />
            </Step>
          ))}

        {STEPS[stepIndex] === 'syringe' && (
          <Step
            question={t('syringe.question')}
            subtitle={t('syringe.subtitle')}
          >
            <div className="space-y-2">
              {BARRELS.map((b) => (
                <ChoiceButton
                  key={b.id}
                  selected={barrelId === b.id}
                  title={t(`barrel.${b.msgKey}.label`)}
                  onClick={() => setBarrelId(b.id)}
                />
              ))}
            </div>
          </Step>
        )}

        {STEPS[stepIndex] === 'dose' && (
          <Step
            question={t('dose.question')}
            subtitle={t('dose.subtitle', {
              enterUnit: isIU ? t('dose.enterUnitIU') : t('dose.enterUnitMass'),
              drawUnit: thirdLabel,
            })}
          >
            <BigNumberInput
              value={doseFieldValue}
              onChange={handleDoseFieldChange}
              unit={doseFieldUnit}
              placeholder={
                doseEntryUnit === 'mg'
                  ? t('dose.placeholderMg')
                  : doseEntryUnit === 'mcg'
                    ? t('dose.placeholderMcg')
                    : doseEntryUnit === 'native'
                      ? t('dose.placeholderNative')
                      : t('dose.placeholderDraw')
              }
            />
            <div className="mt-3 flex gap-2">
              {isIU ? (
                <UnitToggle label={t('unit.iuShort')} active={doseEntryUnit === 'native'} onClick={() => setDoseEntryUnit('native')} />
              ) : (
                <>
                  <UnitToggle label={t('unit.mgShort')} active={doseEntryUnit === 'mg'} onClick={() => setDoseEntryUnit('mg')} />
                  <UnitToggle label="mcg" active={doseEntryUnit === 'mcg'} onClick={() => setDoseEntryUnit('mcg')} />
                </>
              )}
              <UnitToggle label={thirdLabel} active={doseEntryUnit === 'draw'} onClick={() => setDoseEntryUnit('draw')} />
            </div>
            <p className="mt-3 text-sm text-zinc-500">
              {t('dose.neverSuggests')}
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
            ← {t('back')}
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
          {isLastInput && !isNotListed ? t('calculate') : t('continue')} →
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
  locale,
  drawFromNative,
  nativeFromDraw,
  onChangeDoseNative,
  waterMl,
  onChangeWaterMl,
  vialAmount,
  onChangeVialAmount,
  form,
  showMath,
  onToggleMath,
  onEditSteps,
  onRestart,
}: {
  result: DoseResult | null;
  error: ErrorCode;
  doseNative: number;
  vialUnit: VialUnit;
  barrel: SyringeBarrel;
  peptideLabel: string;
  locale: string;
  drawFromNative: (n: number) => number;
  nativeFromDraw: (draw: number) => number;
  onChangeDoseNative: (n: number) => void;
  waterMl: number;
  onChangeWaterMl: (n: number) => void;
  vialAmount: number;
  onChangeVialAmount: (n: number) => void;
  form: Form;
  showMath: boolean;
  onToggleMath: () => void;
  onEditSteps: () => void;
  onRestart: () => void;
}) {
  const t = useTranslations('calculator');
  const formatNum = (n: number, decimals: number) => fmt(locale, n, decimals) || '-';

  const isInsulin = barrel.scale === 'U-100';
  const thirdLabel = isInsulin ? t('units') : 'mL';
  const isIU = vialUnit === 'IU';
  // Built from the catalog, not hardcoded: "IU" is "UI" in Portuguese and
  // Spanish, and a results screen that mixes both invites a misread of the unit.
  const unitShort = isIU ? t('unit.iuShort') : t('unit.mgShort');
  const concUnit = `${unitShort}/mL`;
  const ready = Boolean(result) && !error;
  const barrelShort = t(`barrel.${barrel.msgKey}.short`);

  const drawAmount = ready
    ? isInsulin
      ? result!.syringeUnits
      : result!.volumeMl
    : drawFromNative(doseNative);

  const bigValue = ready
    ? isInsulin
      ? formatNum(result!.syringeUnits, 1)
      : formatNum(result!.volumeMl, 3)
    : t('result.empty');

  const subline = ready
    ? isInsulin
      ? t('result.sublineInsulin', {
          ml: formatNum(result!.volumeMl, 3),
          name: peptideLabel,
        })
      : t('result.sublineIM', { name: peptideLabel })
    : t('result.prompt');

  // Drop the lib's "IU cannot convert to mass" caution: we stay entirely in IU,
  // so it does not apply and would only confuse.
  //
  // This matches on the warning's `code`, not on its English text. The previous
  // version tested `w.message.includes('International Units')`, which would
  // have stopped matching the moment the message was translated and would have
  // shown every IU user an irrelevant, alarming warning in Portuguese and
  // Spanish while continuing to hide it in English.
  const baseWarnings: CalcWarning[] = ready
    ? isIU
      ? result!.warnings.filter((w) => w.code !== 'iuNotConvertible')
      : result!.warnings
    : [];

  // Rendered text, resolved here so the pure math layer never holds a sentence.
  const messages: Array<{ level: CalcWarning['level']; text: string }> = ready
    ? [
        ...baseWarnings.map((w) => ({
          level: w.level,
          text: t(`warning.${w.code}`),
        })),
        ...(result!.volumeMl > barrel.maxMl
          ? [
              {
                level: 'caution' as const,
                text: t('warning.exceedsBarrel', {
                  ml: formatNum(result!.volumeMl, 3),
                  syringe: barrelShort,
                  max: formatNum(barrel.maxMl, 3),
                }),
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
          {t('result.label')}
        </p>
        <div className="mt-1 text-5xl font-bold tabular-nums text-brand-700 dark:text-brand-300">
          {bigValue}
          <span className="ml-2 text-2xl font-semibold text-zinc-500">{thirdLabel}</span>
        </div>
        <p className="mt-1 text-base text-zinc-600 dark:text-zinc-400">{subline}</p>
      </div>

      <div className="mt-6">
        <SyringeDiagram scale={barrel.scale} maxMl={barrel.maxMl} shortLabel={barrelShort} drawAmount={drawAmount} />
      </div>

      {error && (
        <div className="mt-4">
          <WarningCard level="serious" text={t('result.genericError')} />
        </div>
      )}

      {/* Inline editor: change the draw or the dose here and the syringe updates live. */}
      <div className="mt-4 rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
        <p className="mb-2 text-xs font-medium uppercase tracking-wide text-zinc-500">
          {t('result.adjust')}
        </p>
        {/*
          Two columns, two rows. The top row is the dose (what you draw, and
          the same dose expressed in the vial's unit). The bottom row is the
          mix itself: liquid in the vial, and how much peptide it holds.
          Changing anything on the bottom row moves the concentration, so the
          draw above it recalculates.
        */}
        <div className="grid grid-cols-2 gap-x-3 gap-y-4">
          <EditField
            label={thirdLabel}
            hint={t('result.draw')}
            value={drawFromNative(doseNative)}
            onChange={(v) => onChangeDoseNative(nativeFromDraw(v))}
          />
          <EditField
            label={unitShort}
            hint={t('result.dose')}
            value={doseNative}
            onChange={(v) => onChangeDoseNative(v)}
          />
          <EditField
            label="mL"
            hint={form === 'powder' ? t('result.bacWater') : t('result.liquidInVial')}
            value={waterMl}
            onChange={onChangeWaterMl}
          />
          <EditField
            label={unitShort}
            hint={t('result.vialStrength')}
            value={vialAmount}
            onChange={onChangeVialAmount}
          />
        </div>
      </div>

      {messages.length > 0 && (
        <ul className="mt-4 space-y-2">
          {messages.map((m, i) => (
            <li key={i}>
              <WarningCard level={m.level} text={m.text} />
            </li>
          ))}
        </ul>
      )}

      <div className="mt-4 rounded-lg border border-zinc-200 bg-zinc-50 p-3 text-xs leading-relaxed text-zinc-600 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400">
        {t('result.disclaimer')}
      </div>

      {ready && (
        <div className="mt-3 rounded-lg bg-zinc-50 p-3 text-xs text-zinc-500 dark:bg-zinc-900">
          {isIU
            ? t('result.summaryIU', { dose: formatNum(doseNative, 2) })
            : t('result.summaryMass', {
                mcg: formatNum(doseNative * 1000, 0),
                mg: formatNum(doseNative, 4),
              })}
          {t('result.summaryTail', {
            conc: formatNum(result!.concentrationMgPerMl, 3),
            concUnit,
            syringe: barrelShort,
          })}
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
            {showMath ? t('result.hideMath') : t('result.showMath')}
          </button>
          {showMath && (
            <div className="mt-3 space-y-2 rounded-md bg-zinc-50 p-3 font-mono text-xs leading-relaxed text-zinc-700 dark:bg-zinc-950 dark:text-zinc-300">
              <p>
                {t('result.mathLine1', {
                  unit: unitShort,
                  conc: formatNum(result!.concentrationMgPerMl, 3),
                  concUnit,
                })}
              </p>
              <p>
                {t('result.mathLine2', {
                  dose: formatNum(doseNative, 4),
                  unit: unitShort,
                  conc: formatNum(result!.concentrationMgPerMl, 3),
                  concUnit,
                  ml: formatNum(result!.volumeMl, 3),
                })}
              </p>
              {isInsulin && (
                <p>
                  {t('result.mathLine3', {
                    ml: formatNum(result!.volumeMl, 3),
                    units: formatNum(result!.syringeUnits, 2),
                  })}
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
          {t('result.changeStep')}
        </button>
        <button
          type="button"
          onClick={onRestart}
          className="flex-1 rounded-xl bg-brand-600 px-4 py-3 text-base font-semibold text-white hover:bg-brand-700"
        >
          {t('result.startOver')}
        </button>
      </div>

      {/* Offer: the gated education library (lead engine) */}
      <div className="mt-8 rounded-2xl border border-brand-200 bg-brand-50 p-5 text-center dark:border-brand-900 dark:bg-brand-950/30">
        <p className="text-base font-semibold">{t('result.learnTitle')}</p>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          {t('result.learnBody')}
        </p>
        <Link
          href="/learn"
          className="mt-4 inline-flex items-center gap-2 rounded-lg bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-700"
        >
          {t('result.learnCta')} <span aria-hidden>→</span>
        </Link>
        {/*
          Second door for people who already handed over their email. The main
          CTA reads as a signup, so returning readers do not recognise it as
          theirs. Same destination: a confirmed device walks straight in, an
          unconfirmed one meets the usual gate.
        */}
        <p className="mt-3">
          <Link
            href="/learn"
            className="text-sm font-medium text-brand-700 underline underline-offset-4 hover:text-brand-800 dark:text-brand-300 dark:hover:text-brand-200"
          >
            {t('result.learnMemberCta')}
          </Link>
        </p>
      </div>

      <LearnPopup />
    </div>
  );
}

// ───── Building blocks ─────

function Progress({ current, total }: { current: number; total: number }) {
  const t = useTranslations('calculator');
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
        {/* Strings, not numbers: bare numeric args go through Intl.NumberFormat
            and a step counter must never pick up a grouping separator. */}
        {t('progress', { current: String(current + 1), total: String(total) })}
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

/**
 * Peptide picker as a type-to-filter combobox.
 *
 * A native <select> only jumps to the first option starting with the letters
 * you type, which is useless when someone knows their peptide by an alias
 * ("Body Protection Compound", "GLP-1") or types a fragment from the middle of
 * the name. This filters the list live on the name and every alias in
 * data/peptides.ts, and keeps the two escape hatches ("Other peptide",
 * "Not listed") reachable at all times.
 *
 * Typing after a peptide is already chosen clears the choice, so the box can
 * never read one peptide while the wizard is calculating another.
 */
function PeptidePicker({
  value,
  onChange,
  placeholder,
  otherLabel,
  notListedLabel,
  typedOptionLabel,
}: {
  value: string;
  onChange: (slug: string, customName?: string) => void;
  placeholder: string;
  otherLabel: string;
  notListedLabel: string;
  typedOptionLabel: (typed: string) => string;
}) {
  interface PickerOption {
    value: string;
    label: string;
    aliases: string[];
    /** Set on the "use what I typed" row: the name to carry through. */
    custom?: string;
  }

  const options: PickerOption[] = [
    { value: OTHER_PEPTIDE, label: otherLabel, aliases: [] },
    ...WIZARD_PEPTIDES.map((p) => ({
      value: p.slug,
      label: p.name,
      aliases: p.aliases ?? [],
    })),
  ];
  // Always last and never filtered out: it is the exit for a search that
  // found nothing, which is exactly when it matters most.
  const notListedOption: PickerOption = {
    value: NOT_LISTED,
    label: notListedLabel,
    aliases: [],
  };

  const selectedLabel =
    value === NOT_LISTED
      ? notListedLabel
      : (options.find((o) => o.value === value)?.label ?? '');

  const [query, setQuery] = useState(selectedLabel);
  const [open, setOpen] = useState(false);
  const [highlight, setHighlight] = useState(0);

  // "Start over" clears the selection from outside this component, so the box
  // has to empty itself too. Guarded on `open` because the same clear happens
  // while someone is mid-search, and that text must survive.
  const [lastValue, setLastValue] = useState(value);
  if (value !== lastValue) {
    setLastValue(value);
    if (!open) setQuery(selectedLabel);
  }

  const q = query.trim().toLowerCase();
  // An untouched query, or one still showing the current selection, means the
  // person is browsing rather than searching: show everything.
  const searching = q !== '' && q !== selectedLabel.trim().toLowerCase();
  const matches = searching
    ? options.filter(
        (o) =>
          o.label.toLowerCase().includes(q) ||
          o.aliases.some((a) => a.toLowerCase().includes(q))
      )
    : options;

  /**
   * "Use what I typed", offered whenever the text is not already an exact
   * option.
   *
   * It routes to the request screen rather than straight to the arithmetic.
   * The name is what tells BuddyPept which peptide to build next, and the
   * person asking is the one who should hear when it lands, so the request is
   * taken first. The maths is offered immediately afterwards, on the same
   * screen, using the name they typed: nobody leaves without an answer, and
   * nobody is counted as demand without being asked.
   */
  const typed = query.trim();
  const exactAlready = options.some(
    (o) => o.label.toLowerCase() === typed.toLowerCase()
  );
  const useTypedOption: PickerOption | null =
    typed && !exactAlready
      ? { value: NOT_LISTED, label: typedOptionLabel(typed), aliases: [], custom: typed }
      : null;

  const list = [
    ...(useTypedOption ? [useTypedOption] : []),
    ...matches,
    notListedOption,
  ];
  const activeIndex = Math.min(highlight, list.length - 1);

  function select(option: PickerOption) {
    onChange(option.value, option.custom);
    // The typed row keeps the person's own text in the box, not the wrapper
    // label around it.
    setQuery(option.custom ?? option.label);
    setOpen(false);
    setHighlight(0);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      if (!open) {
        setOpen(true);
        return;
      }
      const step = e.key === 'ArrowDown' ? 1 : -1;
      setHighlight((h) => {
        const next = Math.min(h, list.length - 1) + step;
        return (next + list.length) % list.length;
      });
      return;
    }
    if (e.key === 'Enter' && open) {
      e.preventDefault();
      select(list[activeIndex]);
      return;
    }
    if (e.key === 'Escape' && open) {
      setOpen(false);
      setQuery(selectedLabel);
    }
  }

  return (
    <div
      className="relative"
      onBlur={(e) => {
        // Ignore focus moves inside the widget (input -> option button).
        if (e.currentTarget.contains(e.relatedTarget as Node | null)) return;
        setOpen(false);
        setQuery(selectedLabel);
      }}
    >
      <input
        type="text"
        role="combobox"
        aria-expanded={open}
        aria-controls="peptide-picker-list"
        aria-autocomplete="list"
        autoComplete="off"
        value={query}
        placeholder={placeholder}
        onFocus={(e) => {
          setOpen(true);
          e.currentTarget.select();
        }}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
          setHighlight(0);
          // Editing the text abandons the current choice rather than leaving a
          // stale peptide selected behind a box that reads as something else.
          if (value) onChange('');
        }}
        onKeyDown={handleKeyDown}
        className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-3.5 text-lg dark:border-zinc-700 dark:bg-zinc-800"
      />

      {open && (
        <ul
          id="peptide-picker-list"
          role="listbox"
          className="absolute z-20 mt-1 max-h-72 w-full overflow-y-auto rounded-xl border border-zinc-200 bg-white py-1 shadow-lg dark:border-zinc-700 dark:bg-zinc-800"
        >
          {list.map((option, i) => (
            <li key={option.value} role="none">
              <button
                type="button"
                role="option"
                aria-selected={option.value === value}
                // Runs before blur, so picking with the mouse keeps focus in
                // the widget and the list does not close out from under it.
                onMouseDown={(e) => e.preventDefault()}
                onMouseEnter={() => setHighlight(i)}
                onClick={() => select(option)}
                className={`flex w-full items-center justify-between px-4 py-3 text-left text-base ${
                  i === activeIndex ? 'bg-brand-50 dark:bg-zinc-700' : ''
                } ${option.value === value ? 'font-semibold' : ''}`}
              >
                <span>{option.label}</span>
                {option.value === value && (
                  <span className="text-brand-600" aria-hidden>
                    ✓
                  </span>
                )}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
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
  hint,
  value,
  onChange,
}: {
  label: string;
  /** What this number is. Needed once the panel holds more than one field. */
  hint?: string;
  value: number;
  onChange: (n: number) => void;
}) {
  return (
    <label className="block">
      {hint ? (
        <span className="mb-1 block text-xs font-medium text-zinc-500 dark:text-zinc-400">
          {hint}
        </span>
      ) : null}
      {/* The suffix centres on the input alone, not on the hint above it. */}
      <span className="relative block">
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
      </span>
    </label>
  );
}

function QuickPicks({
  options,
  suffix,
  value,
  onPick,
  hint,
}: {
  options: number[];
  suffix: string;
  value: number;
  onPick: (n: number) => void;
  hint?: string;
}) {
  return (
    <>
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
      {hint ? (
        <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">{hint}</p>
      ) : null}
    </>
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

function WarningCard({
  level,
  text,
}: {
  level: CalcWarning['level'];
  text: string;
}) {
  const styles = {
    info: 'border-zinc-300 bg-zinc-50 text-zinc-800 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200',
    caution:
      'border-yellow-300 bg-yellow-50 text-yellow-900 dark:border-yellow-700 dark:bg-yellow-950 dark:text-yellow-200',
    serious: 'border-red-300 bg-red-50 text-red-900 dark:border-red-700 dark:bg-red-950 dark:text-red-200',
  } as const;
  return (
    <div className={`rounded-md border px-3 py-2 text-sm leading-relaxed ${styles[level]}`}>
      {text}
    </div>
  );
}

/**
 * Value for a `<input type="number">`.
 *
 * Deliberately NOT locale-formatted. The DOM value of a number input is always
 * a "."-decimal string regardless of the page language, and feeding it "12,5"
 * makes the browser treat the field as empty. What the reader sees typed is
 * rendered by the browser in their locale; this is only the underlying value.
 */
function formatForInput(n: number): string {
  if (!Number.isFinite(n)) return '';
  return Number(n.toFixed(6)).toString();
}
