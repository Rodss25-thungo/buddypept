/**
 * Buddy: BuddyPept's helper character, built from the logo water droplet.
 * Calm and competent (simple dot eyes, a gentle understated smile), warm but
 * not cutesy, to match the seriousness of dose math. Used as a greeter in the
 * hero and to "hand over" the calculator result.
 *
 * Pure SVG in brand colors, so it scales crisply at any size. A fuller
 * illustrated version can replace this later.
 */
export function Buddy({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 100 120"
      role="img"
      aria-label="Buddy, your friendly peptide helper"
      className={className}
    >
      {/* Droplet body */}
      <path
        d="M50 6C68 38 86 60 86 82a36 36 0 0 1-72 0C14 60 32 38 50 6Z"
        className="fill-brand-500"
      />
      {/* Soft shine */}
      <path
        d="M38 34c-6 8-11 16-11 23a11 11 0 0 0 5 9"
        fill="none"
        strokeWidth="5"
        strokeLinecap="round"
        className="stroke-white/40"
      />
      {/* Calm eyes (simple, competent, not cartoonish) */}
      <circle cx="41" cy="82" r="2.8" className="fill-brand-950" />
      <circle cx="59" cy="82" r="2.8" className="fill-brand-950" />
      {/* Gentle, understated smile */}
      <path
        d="M44 95q6 3.5 12 0"
        fill="none"
        strokeWidth="2.6"
        strokeLinecap="round"
        className="stroke-brand-950"
      />
    </svg>
  );
}
