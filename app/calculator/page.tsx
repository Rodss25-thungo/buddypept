'use client';

/**
 * BuddyPept Calculator UI
 * ───────────────────────
 * Three-field dose converter (mcg ↔ mg ↔ units), all bidirectionally linked.
 * Plus a barrel-size syringe selector and a collapsible "How this works"
 * educational section.
 *
 * Per the Phase 7 Disclaimer & Legal Placement Map in CLAUDE.md, this page
 * contains placeholder slots for lawyer-reviewed copy:
 *   - [MEDICAL_DISCLAIMER_TOP]     — above inputs
 *   - [MEDICAL_DISCLAIMER_RESULTS] — adjacent to result number
 *
 * Hard brand rule respected: dose fields are NEVER pre-filled — the user
 * enters their own dose. typicalDose in data/peptides.ts is reference-only.
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
  type SyringeType,
  type Warning as CalcWarning,
} from '@/lib/calculator';

// ─────────────────────────────────────────────────────────────
// Syringe barrels (UI concern — math library only knows U-100 vs IM)
// ─────────────────────────────────────────────────────────────

type SyringeBarrelId =
  | 'insulin-0.3'
  | 'insulin-0.5'
  | 'insulin-1.0'
  | 'im-1.0'
  | 'im-3.0';

interface SyringeBarrel {
  id: SyringeBarrelId;
  /** UI label for the dropdown option */
  optionLabel: string;
  /** Short label for inline references like "your 0.5 mL syringe" */
  shortLabel: string;
  /** Max liquid capacity in mL */
  maxMl: number;
  /** Scale passed to the math library */
  scale: SyringeType;
}

const BARRELS: SyringeBarrel[] = [
  {
    id: 'insulin-0.3',
    optionLabel: '0.3 mL insulin syringe — max 30 units',
    shortLabel: '0.3 mL insulin',
    maxMl: 0.3,
    scale: 'U-100',
  },
  {
    id: 'insulin-0.5',
    optionLabel: '0.5 mL insulin syringe — max 50 units',
    shortLabel: '0.5 mL insulin',
    maxMl: 0.5,
    scale: 'U-100',
  },
  {
    id: 'insulin-1.0',
    optionLabel: '1.0 mL insulin syringe — max 100 units',
    shortLabel: '1 mL insulin',
    maxMl: 1.0,
    scale: 'U-100',
  },
  {
    id: 'im-1.0',
    optionLabel: 'IM 1 mL syringe (oil-based, mL graduations)',
    shortLabel: 'IM 1 mL',
    maxMl: 1.0,
    scale: 'IM',
  },
  {
    id: 'im-3.0',
    optionLabel: 'IM 3 mL syringe (oil-based, mL graduations)',
    shortLabel: 'IM 3 mL',
    maxMl: 3.0,
    scale: 'IM',
  },
];

function getBarrel(id: SyringeBarrelId): SyringeBarrel {
  return BARRELS.find((b) => b.id === id) ?? BARRELS[2]; // default to 1 mL insulin
}

// ─────────────────────────────────────────────────────────────
// Phase 7 placeholders
// ─────────────────────────────────────────────────────────────

const PLACEHOLDER_DISCLAIMER_TOP =
  '[MEDICAL_DISCLAIMER_TOP — pending Phase 7 legal review]';
const PLACEHOLDER_DISCLAIMER_RESULTS =
  '[MEDICAL_DISCLAIMER_RESULTS — pending Phase 7 legal review]';

// Common vial sizes (mg) for quick-pick buttons. These are the amounts
// vendors most often sell. Users can still type any custom value or
// fine-tune with the input's up/down arrows.
const COMMON_VIAL_MG = [5, 10, 30, 50, 80];

// ─────────────────────────────────────────────────────────────
// Main component
// ─────────────────────────────────────────────────────────────

export default function CalculatorPage() {
  const [peptideSlug, setPeptideSlug] = useState<string>(PEPTIDES[0].slug);
  const [vialAmount, setVialAmount] = useState<number>(PEPTIDES[0].commonVialSizes[0]);
  const [waterMl, setWaterMl] = useState<number>(2);

  // Single source of truth for dose: mg. mcg and units are derived.
  // Brand hard rule: dose is NOT pre-filled — user must enter.
  const [doseMg, setDoseMg] = useState<number>(NaN);

  const [barrelId, setBarrelId] = useState<SyringeBarrelId>('insulin-1.0');
  const [showMath, setShowMath] = useState(false);
  const [showHowItWorks, setShowHowItWorks] = useState(false);

  const peptide = getPeptideBySlug(peptideSlug);
  const barrel = getBarrel(barrelId);

  // Concentration math — requires vial + water to be valid
  const haveReconstitution =
    Number.isFinite(vialAmount) &&
    vialAmount > 0 &&
    Number.isFinite(waterMl) &&
    waterMl > 0;
  const concentrationMgPerMl = haveReconstitution ? vialAmount / waterMl : NaN;

  // Derived dose values from doseMg + barrel + concentration
  const doseMcg = Number.isFinite(doseMg) ? doseMg * 1000 : NaN;
  const doseSyringeAmount = computeSyringeAmount(doseMg, barrel.scale, concentrationMgPerMl);

  // What the third field is called — "units" for U-100, "mL" for IM
  const thirdFieldUnit = barrel.scale === 'IM' ? 'mL' : 'units';

  // ───── handlers ─────

  function handlePeptideChange(slug: string) {
    setPeptideSlug(slug);
    const p = getPeptideBySlug(slug);
    if (p) {
      setVialAmount(p.commonVialSizes[0]);
      // Clear dose on peptide switch (brand rule)
      setDoseMg(NaN);
    }
  }

  function handleMcgChange(mcg: number) {
    if (!Number.isFinite(mcg) || mcg < 0) {
      setDoseMg(NaN);
    } else {
      setDoseMg(mcg / 1000);
    }
  }

  function handleMgChange(mg: number) {
    setDoseMg(mg);
  }

  function handleSyringeAmountChange(amount: number) {
    if (!Number.isFinite(amount) || amount < 0 || !haveReconstitution) {
      setDoseMg(NaN);
      return;
    }
    if (barrel.scale === 'U-100') {
      // amount is units. mg = units × (concentration / 100)
      setDoseMg(amount * (concentrationMgPerMl / 100));
    } else {
      // amount is mL. mg = mL × concentration
      setDoseMg(amount * concentrationMgPerMl);
    }
  }

  // ───── result computation ─────

  const isValidInput = haveReconstitution && Number.isFinite(doseMg) && doseMg > 0;

  const computation = useMemo(() => {
    if (!isValidInput || !peptide) {
      return { result: null, error: null as string | null };
    }
    try {
      const result = calculateDose({
        vialAmount,
        vialUnit: peptide.vialUnit,
        waterMl,
        targetDose: doseMg,
        targetDoseUnit: 'mg',
        syringeType: barrel.scale,
      });
      return { result, error: null as string | null };
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Invalid input';
      return { result: null, error: msg };
    }
  }, [isValidInput, peptide, vialAmount, waterMl, doseMg, barrel.scale]);

  const { result, error } = computation;

  // Additional capacity warning (specific to barrel)
  const capacityWarning: CalcWarning | null =
    result && result.volumeMl > barrel.maxMl
      ? {
          level: 'caution',
          message: `Your dose volume (${formatNum(result.volumeMl, 3)} mL) is larger than the ${barrel.shortLabel} can hold (${barrel.maxMl} mL). Pick a larger syringe, or reconstitute with more bacteriostatic water for a lower concentration.`,
        }
      : null;

  const allWarnings: CalcWarning[] = [
    ...(result?.warnings ?? []),
    ...(capacityWarning ? [capacityWarning] : []),
  ];

  return (
    <main className="mx-auto max-w-2xl px-4 py-8 sm:py-12">
      {/* Header */}
      <header className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Peptide dosing calculator
        </h1>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
          The math, free forever. No paywall, no data harvest.
        </p>
      </header>

      {/* How this works — collapsible educational content */}
      <HowThisWorks open={showHowItWorks} onToggle={() => setShowHowItWorks((s) => !s)} />

      {/* Placeholder: medical disclaimer at top of calculator */}
      <div className="mt-6">
        <DisclaimerSlot text={PLACEHOLDER_DISCLAIMER_TOP} />
      </div>

      {/* Inputs */}
      <section className="mt-6 space-y-5 rounded-lg border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
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
        <FieldSyringeBarrel value={barrelId} onChange={setBarrelId} />
        <FieldThreeWayDose
          doseMcg={doseMcg}
          doseMg={doseMg}
          doseSyringeAmount={doseSyringeAmount}
          thirdFieldUnit={thirdFieldUnit}
          haveReconstitution={haveReconstitution}
          onMcgChange={handleMcgChange}
          onMgChange={handleMgChange}
          onSyringeAmountChange={handleSyringeAmountChange}
        />
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
            warnings={allWarnings}
            barrel={barrel}
            doseMg={doseMg}
            doseMcg={doseMcg}
            showMath={showMath}
            onToggleMath={() => setShowMath((s) => !s)}
          />
        ) : (
          <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-4 text-sm text-zinc-600 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400">
            Fill in the vial size, bacteriostatic water, and your dose to see the result. All three dose fields above stay in sync as you type.
          </div>
        )}
      </section>

      {/* Peptide context */}
      {peptide && (
        <section className="mt-8 rounded-lg border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
          <h2 className="text-lg font-semibold">About {peptide.name}</h2>
          {peptide.aliases && peptide.aliases.length > 0 && (
            <p className="mt-1 text-xs text-zinc-500">
              Also known as: {peptide.aliases.join(', ')}
            </p>
          )}
          <p className="mt-3 text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">
            {peptide.shortDescription}
          </p>
          <dl className="mt-4 grid grid-cols-1 gap-2 text-xs sm:grid-cols-3">
            <div>
              <dt className="text-zinc-500">Reference dose (from studies)</dt>
              <dd className="font-medium">{formatReferenceDose(peptide.typicalDose, peptide.typicalDoseUnit)}</dd>
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
            commonly cited in protocols. They are{' '}
            <strong>informational, not a recommendation for you</strong>.
            Decisions about your dose belong with your healthcare provider.
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
// Subcomponents
// ─────────────────────────────────────────────────────────────

function DisclaimerSlot({ text }: { text: string }) {
  return (
    <div className="rounded-lg border border-dashed border-amber-300 bg-amber-50 p-3 text-xs text-amber-900 dark:border-amber-700 dark:bg-amber-950 dark:text-amber-200">
      {text}
    </div>
  );
}

function HowThisWorks({
  open,
  onToggle,
}: {
  open: boolean;
  onToggle: () => void;
}) {
  return (
    <section className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center justify-between text-left"
        aria-expanded={open}
      >
        <span className="text-base font-semibold">
          How peptide reconstitution works
        </span>
        <span className="ml-2 text-zinc-500" aria-hidden>
          {open ? '▾' : '▸'}
        </span>
      </button>
      {!open && (
        <p className="mt-1 text-xs text-zinc-500">
          New to peptides or confused by mcg vs mg vs units? Open this section first.
        </p>
      )}
      {open && (
        <div className="mt-5 space-y-5 text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">
          <Step
            n={1}
            title="What's in the vial"
            body="Peptides come as a freeze-dried white powder sealed in a small glass vial. The vial label tells you the total mass of peptide inside (for example, 5 mg or 10 mg). You can't inject the powder directly — it has to be dissolved in liquid first."
          />
          <Step
            n={2}
            title="What bacteriostatic water does"
            body="Bacteriostatic water (bac water) is sterile water with a tiny amount of preservative added. When you add it to the vial, the peptide powder dissolves and becomes injectable. The preservative keeps the solution sterile in the fridge for about 28 days — bacteria can't grow."
          />
          <div>
            <h3 className="font-medium text-zinc-900 dark:text-zinc-100">
              3. What &ldquo;concentration&rdquo; means
            </h3>
            <p className="mt-1">
              Concentration is how much peptide is in each mL of liquid.
            </p>
            <p className="mt-2 rounded bg-zinc-100 px-3 py-2 font-mono text-xs dark:bg-zinc-800">
              concentration (mg/mL) = vial peptide (mg) ÷ water (mL)
            </p>
            <p className="mt-2 text-zinc-600 dark:text-zinc-400">
              Same vial dissolved in <em>less</em> water gives a stronger
              concentration — each drop contains more peptide. Example:
              5 mg vial + 2 mL water = 2.5 mg/mL. 5 mg + 1 mL = 5 mg/mL
              (twice as strong).
            </p>
          </div>
          <div>
            <h3 className="font-medium text-zinc-900 dark:text-zinc-100">
              4. How an insulin syringe is marked
            </h3>
            <p className="mt-1">
              A U-100 insulin syringe has markings called &ldquo;units.&rdquo;
              100 units always equals 1 mL of liquid. So 1 unit = 0.01 mL.
            </p>
            <p className="mt-2">Insulin syringes come in three common barrel sizes:</p>
            <ul className="mt-1 list-disc space-y-0.5 pl-5 text-zinc-600 dark:text-zinc-400">
              <li>
                <strong>0.3 mL barrel</strong> — markings up to 30 units
              </li>
              <li>
                <strong>0.5 mL barrel</strong> — markings up to 50 units
              </li>
              <li>
                <strong>1.0 mL barrel</strong> — markings up to 100 units
              </li>
            </ul>
            <p className="mt-2">
              All three have the <em>same scale</em> (100 units per mL).
              Smaller barrel just means less total capacity. Pick the one
              that fits your dose comfortably.
            </p>
          </div>
          <div>
            <h3 className="font-medium text-zinc-900 dark:text-zinc-100">
              5. Why mg and mcg are both used
            </h3>
            <p className="mt-1">
              <strong>1 mg = 1,000 mcg.</strong> They&rsquo;re the same unit
              measured at different scales — like inches vs. feet.
            </p>
            <p className="mt-2 text-zinc-600 dark:text-zinc-400">
              Some peptides (semaglutide, tirzepatide) are commonly written in{' '}
              <strong>mg</strong> because typical doses are between 0.25 mg
              and 15 mg. Others (BPC-157, TB-500, GHK-Cu) are usually written
              in <strong>mcg</strong> because typical doses are 100–500 mcg,
              which sounds more natural than &ldquo;0.1–0.5 mg.&rdquo; The
              math is identical — just bigger or smaller numbers on paper.
            </p>
          </div>
          <div>
            <h3 className="font-medium text-zinc-900 dark:text-zinc-100">
              6. Your dose vs. your draw
            </h3>
            <p className="mt-1">Two different things, often confused:</p>
            <ul className="mt-1 list-disc space-y-1 pl-5 text-zinc-600 dark:text-zinc-400">
              <li>
                <strong>Your dose</strong> = how much peptide (the drug
                itself). Expressed in mg or mcg.
              </li>
              <li>
                <strong>Your draw</strong> = the mark on your syringe (the
                diluted solution). Expressed in units (insulin syringe) or
                mL (IM syringe).
              </li>
            </ul>
            <p className="mt-2">
              They&rsquo;re <em>not the same number</em> — but they describe
              the same injection. The calculator below shows all three views
              side-by-side so you can see how they connect.
            </p>
          </div>
        </div>
      )}
    </section>
  );
}

function Step({ n, title, body }: { n: number; title: string; body: string }) {
  return (
    <div>
      <h3 className="font-medium text-zinc-900 dark:text-zinc-100">
        {n}. {title}
      </h3>
      <p className="mt-1">{body}</p>
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
        Peptide in the vial <span className="text-zinc-500">({unit})</span>
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
      <p className="mt-1 text-xs text-zinc-500">
        The amount of peptide powder — the number on your vial label (e.g.,
        5 mg, 10 mg). <strong>Not</strong> the size of the glass container.
      </p>
      <div className="mt-2 flex flex-wrap gap-1.5">
        {COMMON_VIAL_MG.map((size) => (
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
            {size} mg
          </button>
        ))}
      </div>
      <p className="mt-1 text-xs text-zinc-500">
        Pick a common size, then fine-tune with the arrows or by typing.
      </p>
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

function FieldSyringeBarrel({
  value,
  onChange,
}: {
  value: SyringeBarrelId;
  onChange: (b: SyringeBarrelId) => void;
}) {
  return (
    <div>
      <label htmlFor="barrel" className="mb-1 block text-sm font-medium">
        Syringe you have
      </label>
      <select
        id="barrel"
        value={value}
        onChange={(e) => onChange(e.target.value as SyringeBarrelId)}
        className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800"
      >
        <optgroup label="Insulin syringes (U-100 scale — 100 units = 1 mL)">
          <option value="insulin-0.3">0.3 mL — max 30 units</option>
          <option value="insulin-0.5">0.5 mL — max 50 units</option>
          <option value="insulin-1.0">1.0 mL — max 100 units</option>
        </optgroup>
        <optgroup label="IM (oil) syringes — mL graduations, no unit markings">
          <option value="im-1.0">IM 1 mL</option>
          <option value="im-3.0">IM 3 mL</option>
        </optgroup>
      </select>
      <p className="mt-1 text-xs text-zinc-500">
        All insulin syringes share the same scale (100 units = 1 mL). A smaller barrel just holds less liquid — it&rsquo;s not a different scale.
      </p>
    </div>
  );
}

function FieldThreeWayDose({
  doseMcg,
  doseMg,
  doseSyringeAmount,
  thirdFieldUnit,
  haveReconstitution,
  onMcgChange,
  onMgChange,
  onSyringeAmountChange,
}: {
  doseMcg: number;
  doseMg: number;
  doseSyringeAmount: number;
  thirdFieldUnit: 'units' | 'mL';
  haveReconstitution: boolean;
  onMcgChange: (n: number) => void;
  onMgChange: (n: number) => void;
  onSyringeAmountChange: (n: number) => void;
}) {
  return (
    <div>
      <label className="mb-1 block text-sm font-medium">Your dose</label>
      <p className="mb-2 text-xs text-zinc-500">
        These three fields all represent the same injection. Edit any one — the other two update.
      </p>
      <div className="grid grid-cols-3 gap-2">
        <DoseField
          label={`mcg`}
          sublabel="of peptide"
          placeholder="e.g. 250"
          value={doseMcg}
          onChange={onMcgChange}
        />
        <DoseField
          label={`mg`}
          sublabel="of peptide"
          placeholder="e.g. 0.25"
          value={doseMg}
          onChange={onMgChange}
        />
        <DoseField
          label={thirdFieldUnit}
          sublabel="on your syringe"
          placeholder={haveReconstitution ? (thirdFieldUnit === 'units' ? 'e.g. 25' : 'e.g. 0.25') : 'enter vial + water first'}
          value={doseSyringeAmount}
          onChange={onSyringeAmountChange}
          disabled={!haveReconstitution}
        />
      </div>
      <p className="mt-2 text-xs leading-relaxed text-zinc-500">
        <strong>mcg</strong> = same drug, smaller units.{' '}
        <strong>mg</strong> = the drug itself.{' '}
        <strong>{thirdFieldUnit}</strong> = the mark on your syringe (peptide already mixed with the water). These three always match.
      </p>
      <p className="mt-1 text-xs italic text-zinc-500">
        Decided by you and your healthcare provider — never by BuddyPept.
      </p>
    </div>
  );
}

function DoseField({
  label,
  sublabel,
  placeholder,
  value,
  onChange,
  disabled,
}: {
  label: string;
  sublabel: string;
  placeholder: string;
  value: number;
  onChange: (n: number) => void;
  disabled?: boolean;
}) {
  return (
    <div>
      <label className="mb-1 block text-xs">
        <span className="font-medium">{label}</span>{' '}
        <span className="text-zinc-500">{sublabel}</span>
      </label>
      <input
        type="number"
        step="any"
        min={0}
        value={Number.isFinite(value) ? formatForInput(value) : ''}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        placeholder={placeholder}
        disabled={disabled}
        className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm tabular-nums disabled:cursor-not-allowed disabled:bg-zinc-100 disabled:text-zinc-400 dark:border-zinc-700 dark:bg-zinc-800 dark:disabled:bg-zinc-900"
      />
    </div>
  );
}

function ResultDisplay({
  result,
  warnings,
  barrel,
  doseMg,
  doseMcg,
  showMath,
  onToggleMath,
}: {
  result: NonNullable<ReturnType<typeof calculateDose>>;
  warnings: CalcWarning[];
  barrel: SyringeBarrel;
  doseMg: number;
  doseMcg: number;
  showMath: boolean;
  onToggleMath: () => void;
}) {
  const isIM = barrel.scale === 'IM';
  // Display values
  const volumeMl = result.volumeMl;
  const syringeUnits = result.syringeUnits;

  return (
    <div className="rounded-lg border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
      <div className="space-y-1">
        <div className="text-xs uppercase tracking-wide text-zinc-500">Draw</div>
        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <span className="text-3xl font-bold tabular-nums sm:text-4xl">
            {formatNum(volumeMl, 3)} mL
          </span>
          {!isIM && (
            <span className="text-zinc-500">
              or{' '}
              <span className="text-2xl font-semibold tabular-nums text-zinc-900 dark:text-zinc-100">
                {formatNum(syringeUnits, 2)}
              </span>{' '}
              units on a U-100 insulin syringe
            </span>
          )}
        </div>
        <div className="text-xs text-zinc-500">
          Your dose: {formatNum(doseMcg, 2)} mcg = {formatNum(doseMg, 4)} mg ·
          Concentration: {formatNum(result.concentrationMgPerMl, 3)} mg/mL ·
          Syringe: {barrel.shortLabel}
        </div>
      </div>

      <div className="mt-4">
        <DisclaimerSlot text={PLACEHOLDER_DISCLAIMER_RESULTS} />
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
              Vial mg ÷ water mL = {formatNum(result.concentrationMgPerMl, 3)} mg/mL concentration
            </p>
            <p>
              <strong>Step 2 — Same dose, three views:</strong>
              <br />
              {formatNum(doseMcg, 2)} mcg = {formatNum(doseMg, 4)} mg (÷ 1000 = mg ↔ mcg)
            </p>
            <p>
              <strong>Step 3 — Volume to draw:</strong>
              <br />
              {formatNum(doseMg, 4)} mg ÷ {formatNum(result.concentrationMgPerMl, 3)} mg/mL = {formatNum(volumeMl, 3)} mL
            </p>
            {!isIM && (
              <p>
                <strong>Step 4 — Syringe units:</strong>
                <br />
                {formatNum(volumeMl, 3)} mL × 100 units/mL = {formatNum(syringeUnits, 2)} units (U-100 scale)
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
// Math + formatting helpers (presentation-only, never affect the
// canonical math in lib/calculator.ts)
// ─────────────────────────────────────────────────────────────

/**
 * Compute the syringe-amount field value from the canonical doseMg.
 * For U-100 insulin: returns units (= doseMg ÷ mgPerUnit).
 * For IM: returns mL (= doseMg ÷ concentration).
 * Returns NaN if reconstitution data is missing.
 */
function computeSyringeAmount(
  doseMg: number,
  scale: SyringeType,
  concentrationMgPerMl: number
): number {
  if (!Number.isFinite(doseMg) || !Number.isFinite(concentrationMgPerMl)) {
    return NaN;
  }
  if (scale === 'U-100') {
    const mgPerUnit = concentrationMgPerMl / 100;
    if (mgPerUnit === 0) return NaN;
    return doseMg / mgPerUnit;
  }
  // IM: the third field is mL
  if (concentrationMgPerMl === 0) return NaN;
  return doseMg / concentrationMgPerMl;
}

function formatNum(n: number, decimals: number): string {
  if (!Number.isFinite(n)) return '—';
  return Number(n.toFixed(decimals)).toString();
}

/**
 * Format a number for use as the `value` of a controlled input.
 * Hides floating-point noise like 20.000000000001 → 20.
 */
function formatForInput(n: number): string {
  if (!Number.isFinite(n)) return '';
  // Round to 6 decimal places of precision, then strip trailing zeros
  return Number(n.toFixed(6)).toString();
}

function formatReferenceDose(value: number, unit: 'mg' | 'mcg' | 'IU'): string {
  if (unit === 'IU') return `${value} IU`;
  if (unit === 'mg') {
    return `${value} mg = ${value * 1000} mcg`;
  }
  // mcg
  return `${value} mcg = ${value / 1000} mg`;
}
