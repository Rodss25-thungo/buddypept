/**
 * Buddy: BuddyPept's friendly helper character, built from the logo water
 * droplet. Calm, warm, and approachable (the opposite of the cold/clinical or
 * bro-aggressive peptide category). Used as a greeter in the hero and to
 * "hand over" the calculator result.
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
      {/* Warm cheeks */}
      <circle cx="33" cy="93" r="5" className="fill-accent-400" opacity="0.7" />
      <circle cx="67" cy="93" r="5" className="fill-accent-400" opacity="0.7" />
      {/* Eyes */}
      <circle cx="40" cy="83" r="7" className="fill-white" />
      <circle cx="60" cy="83" r="7" className="fill-white" />
      <circle cx="41.5" cy="84" r="3.4" className="fill-brand-950" />
      <circle cx="61.5" cy="84" r="3.4" className="fill-brand-950" />
      {/* Smile */}
      <path
        d="M42 100q8 7 16 0"
        fill="none"
        strokeWidth="3"
        strokeLinecap="round"
        className="stroke-brand-950"
      />
    </svg>
  );
}
