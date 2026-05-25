import type { SyringeType } from '@/lib/calculator';

/**
 * Live syringe diagram. Re-scales when the barrel changes and fills to the
 * draw amount. Sits in its own dark "display" panel so it stands out.
 * drawAmount is in the third-field unit: units for U-100, mL for IM.
 */
export function SyringeDiagram({
  scale,
  maxMl,
  shortLabel,
  drawAmount,
}: {
  scale: SyringeType;
  maxMl: number;
  shortLabel: string;
  drawAmount: number;
}) {
  const isInsulin = scale === 'U-100';
  const unitLabel = isInsulin ? 'units' : 'mL';
  const maxValue = isInsulin ? Math.round(maxMl * 100) : maxMl;

  const hasDraw = Number.isFinite(drawAmount) && drawAmount > 0;
  const over = hasDraw && drawAmount > maxValue;
  const fraction = hasDraw ? Math.min(drawAmount / maxValue, 1) : 0;

  const innerX = 30;
  const innerW = 256;
  const fillW = innerW * fraction;
  const markerX = innerX + fillW;
  const xFor = (v: number) => innerX + innerW * (v / maxValue);

  const ticks = buildSyringeTicks(isInsulin, maxValue, maxMl);

  return (
    <div className="rounded-xl bg-zinc-900 p-4 shadow-sm">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-xs font-medium text-zinc-300">Your syringe</span>
        <span className="text-xs text-zinc-400">{shortLabel}</span>
      </div>
      <svg
        viewBox="0 0 320 92"
        className="h-auto w-full"
        role="img"
        aria-label={`${shortLabel} filled to your dose`}
      >
        <rect x="0" y="22" width="7" height="36" rx="2" className="fill-zinc-500" />
        <rect x="7" y="37" width="21" height="6" className="fill-zinc-500" />
        <rect
          x="28"
          y="26"
          width="260"
          height="28"
          rx="5"
          className="fill-zinc-800 stroke-zinc-500"
          strokeWidth="1.5"
        />
        {fraction > 0 && (
          <rect
            x={innerX}
            y="28"
            width={fillW}
            height="24"
            rx="3"
            className={over ? 'fill-red-500' : 'fill-brand-400'}
          />
        )}
        <rect x="288" y="34" width="6" height="12" className="fill-zinc-500" />
        <line
          x1="294"
          y1="40"
          x2="316"
          y2="40"
          className="stroke-zinc-500"
          strokeWidth="2"
          strokeLinecap="round"
        />
        {ticks.map((t, i) => {
          const x = xFor(t.value);
          return (
            <g key={i}>
              <line
                x1={x}
                y1="54"
                x2={x}
                y2={t.major ? 61 : 57}
                className="stroke-zinc-500"
                strokeWidth="1"
              />
              {t.label !== null && (
                <text
                  x={x}
                  y="72"
                  textAnchor="middle"
                  className="fill-zinc-400"
                  fontSize="9"
                >
                  {t.label}
                </text>
              )}
            </g>
          );
        })}
        <text
          x="158"
          y="86"
          textAnchor="middle"
          className="fill-zinc-500"
          fontSize="7.5"
        >
          {unitLabel}
        </text>
        {hasDraw && (
          <g>
            <line
              x1={markerX}
              y1="20"
              x2={markerX}
              y2="56"
              className={over ? 'stroke-red-400' : 'stroke-brand-300'}
              strokeWidth="2"
            />
            <path
              d={`M${markerX - 4} 14 L${markerX + 4} 14 L${markerX} 20 Z`}
              className={over ? 'fill-red-400' : 'fill-brand-300'}
            />
          </g>
        )}
      </svg>
      <p className="mt-2 text-center text-sm text-zinc-300">
        {hasDraw ? (
          over ? (
            <>Your dose is bigger than this {shortLabel} holds. Pick a larger syringe.</>
          ) : (
            <>
              Fill to{' '}
              <span className="font-semibold text-brand-300">
                {formatNum(drawAmount, 2)} {unitLabel}
              </span>
            </>
          )
        ) : (
          <>Buddy will mark where to fill once you enter your dose.</>
        )}
      </p>
    </div>
  );
}

function buildSyringeTicks(
  isInsulin: boolean,
  maxValue: number,
  maxMl: number
): { value: number; major: boolean; label: string | null }[] {
  const ticks: { value: number; major: boolean; label: string | null }[] = [];
  if (isInsulin) {
    const minorStep = 5;
    for (let v = 0; v <= maxValue + 1e-9; v += minorStep) {
      const major = Math.abs(v % 10) < 1e-9;
      ticks.push({ value: v, major, label: major ? String(v) : null });
    }
  } else {
    const majorStep = maxMl <= 1 ? 0.2 : 0.5;
    const minorStep = majorStep / 2;
    const steps = Math.round(maxValue / minorStep);
    for (let i = 0; i <= steps; i++) {
      const v = Number((i * minorStep).toFixed(2));
      const major = Math.abs(v / majorStep - Math.round(v / majorStep)) < 1e-6;
      ticks.push({ value: v, major, label: major ? String(v) : null });
    }
  }
  return ticks;
}

function formatNum(n: number, decimals: number): string {
  if (!Number.isFinite(n)) return '-';
  return Number(n.toFixed(decimals)).toString();
}
