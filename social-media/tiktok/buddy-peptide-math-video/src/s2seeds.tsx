import React from 'react';
import {AbsoluteFill, Img, staticFile} from 'remotion';
import {BG, Glow, TEAL} from './Video';

// Series 2 seed stills for Runway image-to-video. Rendered once as PNGs;
// the still controls composition, the Runway prompt controls motion.

// Shot 1 seed: the lyophilized vial alone in the dark lab world.
export const S2Seed1: React.FC = () => {
  return (
    <AbsoluteFill style={{background: BG}}>
      <Glow />
      <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center'}}>
        <Img
          src={staticFile('vial-large.png')}
          style={{
            height: 760,
            borderRadius: 14,
            WebkitMaskImage: 'linear-gradient(to right, transparent 0%, black 10%, black 90%, transparent 100%)',
            maskImage: 'linear-gradient(to right, transparent 0%, black 10%, black 90%, transparent 100%)',

            filter: 'drop-shadow(0 0 90px rgba(42,182,201,0.35))',
          }}
        />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// Shot 5 seed: the exact brand clock behind the vial, hands mid-sweep.
export const S2Seed5: React.FC = () => {
  const R = 430;
  const minuteAngle = 132;
  return (
    <AbsoluteFill style={{background: BG}}>
      <Glow />
      <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center'}}>
        <div style={{position: 'relative', width: R * 2, height: R * 2, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
          <svg width={R * 2} height={R * 2} style={{position: 'absolute', inset: 0, opacity: 0.85}}>
            <circle cx={R} cy={R} r={R - 8} fill="none" stroke={TEAL} strokeWidth={7} style={{filter: 'drop-shadow(0 0 26px rgba(42,182,201,0.65))'}} />
            {Array.from({length: 12}).map((_, i) => {
              const a = (i / 12) * Math.PI * 2;
              return (
                <line
                  key={i}
                  x1={R + Math.sin(a) * (R - 18)}
                  y1={R - Math.cos(a) * (R - 18)}
                  x2={R + Math.sin(a) * (R - 44)}
                  y2={R - Math.cos(a) * (R - 44)}
                  stroke={TEAL}
                  strokeWidth={i % 3 === 0 ? 10 : 4.5}
                />
              );
            })}
            <line
              x1={R}
              y1={R}
              x2={R + Math.sin((minuteAngle * Math.PI) / 180) * (R - 76)}
              y2={R - Math.cos((minuteAngle * Math.PI) / 180) * (R - 76)}
              stroke={TEAL}
              strokeWidth={10}
              strokeLinecap="round"
            />
            <line
              x1={R}
              y1={R}
              x2={R + Math.sin((minuteAngle / 12) * (Math.PI / 180)) * (R - 170)}
              y2={R - Math.cos((minuteAngle / 12) * (Math.PI / 180)) * (R - 170)}
              stroke="#7fe6f2"
              strokeWidth={14}
              strokeLinecap="round"
            />
            <circle cx={R} cy={R} r={16} fill={TEAL} />
          </svg>
          <Img
            src={staticFile('vial-liquid.png')}
            style={{
              height: 430,
              borderRadius: 12,
              WebkitMaskImage: 'linear-gradient(to right, transparent 0%, black 10%, black 90%, transparent 100%)',
              maskImage: 'linear-gradient(to right, transparent 0%, black 10%, black 90%, transparent 100%)',

              filter: 'drop-shadow(0 0 70px rgba(42,182,201,0.3))',
            }}
          />
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
