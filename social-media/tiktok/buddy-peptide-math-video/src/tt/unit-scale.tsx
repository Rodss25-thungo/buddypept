import React from 'react';
import {spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {loadFont as loadAnton} from '@remotion/google-fonts/Anton';
import {TEAL} from '../Video';

const anton = loadAnton();

// TikTok-only measuring scale: a plain rounded rectangle with unit ticks and a
// teal fill level. No needle, plunger, or barrel shape. Same props and outer
// footprint as the Instagram Syringe so layouts stay identical.
export const UnitScale: React.FC<{units: number; label: string}> = ({units, label}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const fill = spring({frame: frame - 8, fps, config: {damping: 16, stiffness: 60}});
  const SCALE_MAX = 25;
  const BOX_X = 58;
  const BOX_Y = 40;
  const BOX_W = 72;
  const BOX_H = 260;
  const INSET = 6;
  const innerH = BOX_H - INSET * 2;
  const pxPerUnit = innerH / SCALE_MAX;
  const levelH = units * pxPerUnit * fill;
  const levelY = BOX_Y + INSET + innerH - levelH;
  return (
    <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8}}>
      <svg width={210} height={340}>
        <defs>
          <linearGradient id="tt-scale-fill" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#1b7f90" />
            <stop offset="35%" stopColor="#4fd4e6" />
            <stop offset="70%" stopColor="#2ab6c9" />
            <stop offset="100%" stopColor="#156a79" />
          </linearGradient>
        </defs>
        <rect x={BOX_X} y={BOX_Y} width={BOX_W} height={BOX_H} rx={14} fill="#0e161b" stroke="#57707c" strokeWidth={3} />
        <rect
          x={BOX_X + INSET}
          y={levelY}
          width={BOX_W - INSET * 2}
          height={levelH}
          rx={8}
          fill="url(#tt-scale-fill)"
          opacity={0.95}
        />
        <line
          x1={BOX_X + INSET}
          y1={levelY}
          x2={BOX_X + BOX_W - INSET}
          y2={levelY}
          stroke="#7fe6f2"
          strokeWidth={3}
          opacity={fill > 0.05 ? 0.9 : 0}
        />
        {Array.from({length: SCALE_MAX + 1}).map((_, t) => {
          const y = BOX_Y + INSET + innerH - t * pxPerUnit;
          const major = t % 5 === 0;
          return (
            <g key={t}>
              <line
                x1={BOX_X + BOX_W + 4}
                y1={y}
                x2={BOX_X + BOX_W + (major ? 22 : 12)}
                y2={y}
                stroke={major ? '#c9d4da' : '#5d7078'}
                strokeWidth={major ? 3 : 1.5}
              />
              {major ? (
                <text x={BOX_X + BOX_W + 28} y={y + 8} fill="#c9d4da" fontSize={22} fontFamily="Arial">
                  {t}
                </text>
              ) : null}
            </g>
          );
        })}
      </svg>
      <div style={{fontFamily: anton.fontFamily, fontSize: 42, color: TEAL}}>{label}</div>
    </div>
  );
};
