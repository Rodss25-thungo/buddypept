import React from 'react';
import {
  AbsoluteFill,
  Audio,
  interpolate,
  OffthreadVideo,
  random,
  Sequence,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import {loadFont as loadAnton} from '@remotion/google-fonts/Anton';
import {loadFont as loadArchivo} from '@remotion/google-fonts/Archivo';
import type {Cue} from './locales';
import {BG, Buddy, Caption, FPS, Flag, Glow, Logo, MUTED, TEAL, TEAL_DEEP, WHITE} from './Video';

const anton = loadAnton();
const archivo = loadArchivo();

const AMBER = '#f59e0b';
const CYAN = '#7fe6f2';

type ClipCfg = {src: string; from: number; dur: number};
type Span = {from: number; to: number};

type S2Day4Config = {
  id: string;
  flag: 'us' | 'mx' | 'br';
  voFile: string;
  cues: Cue[];
  clips: ClipCfg[];
  hook: Span;
  ingredients: Span & {title: string; line1: string; line2: string; tag: string; sourceLabel: string; source: string};
  job: Span & {chip: string};
  compare: Span & {bAt: number; aTitle: string; aLine1: string; aLine2: string; bTitle: string; bLine1: string; bLine2: string};
  micro: Span & {label: string; chip: string};
  nots: Span & {chemLabel: string; chips: string[]; chipAt: number[]};
  verdict: Span & {line1: string; line2: string};
  endFrom: number;
  dayChip: {from: number; label: string};
  disclaimer: string;
  durationSec: number;
  clipMode?: 'full' | 'shrink';
};

const Cinematic: React.FC<{src: string; shrink?: boolean}> = ({src, shrink}) => {
  const frame = useCurrentFrame();
  const fade = interpolate(frame, [0, 10], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  if (shrink) {
    return (
      <AbsoluteFill style={{opacity: fade, alignItems: 'center', paddingTop: 500}}>
        <div style={{width: 792, height: 1408, borderRadius: 36, overflow: 'hidden', WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, black 8%, black 88%, transparent 100%)'}}>
          <OffthreadVideo src={staticFile(src)} muted style={{width: '100%', height: '100%', objectFit: 'cover'}} />
        </div>
      </AbsoluteFill>
    );
  }
  return (
    <AbsoluteFill style={{opacity: fade}}>
      <OffthreadVideo src={staticFile(src)} muted style={{width: '100%', height: '100%', objectFit: 'cover'}} />
    </AbsoluteFill>
  );
};


const ClockFace: React.FC<{R: number; color: string; speed: number}> = ({R, color, speed}) => {
  const frame = useCurrentFrame();
  const minuteAngle = 40 + frame * speed;
  return (
    <svg width={R * 2} height={R * 2}>
      <circle cx={R} cy={R} r={R - 6} fill="none" stroke={color} strokeWidth={Math.max(4, R * 0.02)} style={{filter: `drop-shadow(0 0 ${R * 0.07}px ${color})`}} />
      {Array.from({length: 12}).map((_, i) => {
        const a = (i / 12) * Math.PI * 2;
        return (
          <line
            key={i}
            x1={R + Math.sin(a) * (R - 12)}
            y1={R - Math.cos(a) * (R - 12)}
            x2={R + Math.sin(a) * (R - 12 - R * 0.09)}
            y2={R - Math.cos(a) * (R - 12 - R * 0.09)}
            stroke={color}
            strokeWidth={i % 3 === 0 ? Math.max(4, R * 0.028) : Math.max(2, R * 0.014)}
          />
        );
      })}
      <line x1={R} y1={R} x2={R + Math.sin((minuteAngle * Math.PI) / 180) * (R * 0.72)} y2={R - Math.cos((minuteAngle * Math.PI) / 180) * (R * 0.72)} stroke={color} strokeWidth={Math.max(4, R * 0.028)} strokeLinecap="round" />
      <circle cx={R} cy={R} r={Math.max(6, R * 0.045)} fill={color} />
    </svg>
  );
};

// Bottle silhouette used by the hook and the job beat.
const Bottle: React.FC<{w: number; h: number; stroke: string}> = ({w, h, stroke}) => (
  <svg width={w} height={h} viewBox="0 0 200 320">
    <rect x={70} y={6} width={60} height={34} rx={8} fill={TEAL_DEEP} />
    <path d="M78 40 h44 v22 c30 14 48 36 48 70 v160 c0 14 -10 22 -24 22 h-92 c-14 0 -24 -8 -24 -22 v-160 c0 -34 18 -56 48 -70 z" fill="rgba(127,230,242,0.08)" stroke={stroke} strokeWidth={6} />
    <rect x={40} y={170} width={120} height={70} rx={8} fill="rgba(242,244,245,0.9)" />
    <rect x={54} y={188} width={92} height={10} rx={5} fill={TEAL_DEEP} />
    <rect x={54} y={210} width={64} height={10} rx={5} fill="#9fb3bb" />
  </svg>
);

// Beat 1: bottle with a glowing shield that flickers (looks like it protects everything, but it doesn't).
const Hook: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const s = spring({frame, fps, config: {damping: 12, stiffness: 150}});
  const flicker = frame > 70 ? (Math.sin(frame * 1.7) > 0.2 ? 0.9 : 0.25) : interpolate(frame, [10, 40], [0, 0.9], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return (
    <div style={{position: 'relative', width: 700, height: 760, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: s, transform: `scale(${interpolate(s, [0, 1], [0.8, 1])})`}}>
      <svg width={640} height={740} style={{position: 'absolute', opacity: flicker}}>
        <path d="M320 20 L600 110 C600 400 480 620 320 720 C160 620 40 400 40 110 Z" fill="rgba(42,182,201,0.08)" stroke={TEAL} strokeWidth={8} style={{filter: 'drop-shadow(0 0 30px rgba(42,182,201,0.7))'}} />
      </svg>
      <Bottle w={300} h={480} stroke={CYAN} />
    </div>
  );
};

// Beat 2: ingredient card with SOURCE VERIFIED.
const Ingredients: React.FC<{title: string; line1: string; line2: string; tag: string; sourceLabel: string; source: string}> = ({title, line1, line2, tag, sourceLabel, source}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const flip = spring({frame, fps, config: {damping: 14, stiffness: 120}});
  const l2 = spring({frame: frame - 40, fps, config: {damping: 12, stiffness: 190}});
  const chip = spring({frame: frame - 70, fps, config: {damping: 12, stiffness: 200}});
  return (
    <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 40}}>
      <div
        style={{
          transform: `perspective(1400px) rotateY(${interpolate(flip, [0, 1], [-70, 0])}deg)`,
          opacity: flip,
          background: '#f2f4f5',
          borderRadius: 24,
          width: 860,
          padding: '44px 54px',
          boxShadow: '0 30px 90px rgba(0,0,0,0.55)',
          borderTop: `10px solid ${TEAL_DEEP}`,
        }}
      >
        <div style={{fontFamily: anton.fontFamily, fontSize: 48, color: '#0e2a30', letterSpacing: 1}}>{title}</div>
        <div style={{height: 3, background: '#c9d4da', margin: '20px 0 26px'}} />
        <div style={{display: 'flex', alignItems: 'center', gap: 22}}>
          <div style={{width: 64, height: 64, borderRadius: 999, background: CYAN, flexShrink: 0}} />
          <div style={{fontFamily: archivo.fontFamily, fontWeight: 700, fontSize: 44, color: '#1c3a42'}}>{line1}</div>
        </div>
        <div style={{display: 'flex', alignItems: 'center', gap: 22, marginTop: 22, opacity: l2, transform: `translateX(${interpolate(l2, [0, 1], [40, 0])}px)`}}>
          <div style={{width: 64, height: 64, borderRadius: 999, background: TEAL_DEEP, flexShrink: 0}} />
          <div>
            <div style={{fontFamily: archivo.fontFamily, fontWeight: 700, fontSize: 44, color: '#1c3a42'}}>{line2}</div>
            <div style={{display: 'inline-block', marginTop: 8, background: AMBER, borderRadius: 999, padding: '6px 20px', fontFamily: anton.fontFamily, fontSize: 28, letterSpacing: 2, color: '#1a1206'}}>{tag}</div>
          </div>
        </div>
      </div>
      <div
        style={{
          opacity: chip,
          transform: `translateY(${interpolate(chip, [0, 1], [30, 0])}px)`,
          display: 'flex',
          alignItems: 'center',
          gap: 18,
          background: 'rgba(10,18,24,0.92)',
          border: `3px solid ${TEAL}`,
          borderRadius: 999,
          padding: '14px 34px',
          maxWidth: 960,
        }}
      >
        <div style={{width: 34, height: 34, borderRadius: 999, background: TEAL, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: anton.fontFamily, fontSize: 24, color: '#04262b', flexShrink: 0}}>{'✓'}</div>
        <div style={{fontFamily: anton.fontFamily, fontSize: 30, letterSpacing: 2, color: TEAL, flexShrink: 0}}>{sourceLabel}</div>
        <div style={{fontFamily: archivo.fontFamily, fontWeight: 700, fontSize: 26, color: MUTED}}>{source}</div>
      </div>
    </div>
  );
};

// Beat 3: bacteria try to multiply; the preservative field suppresses new ones.
const Job: React.FC<{chip: string}> = ({chip}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const s = spring({frame, fps, config: {damping: 13, stiffness: 150}});
  const field = interpolate(frame, [45, 75], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const c = spring({frame: frame - 80, fps, config: {damping: 11, stiffness: 220}});
  const total = 30;
  const visibleWithout = Math.min(total, 3 + Math.floor(frame / 3));
  const visibleWith = Math.min(total, 3 + Math.floor(45 / 3) + Math.floor(Math.max(0, frame - 45) / 40));
  const visible = frame < 45 ? visibleWithout : visibleWith;
  return (
    <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 36, opacity: s}}>
      <div style={{position: 'relative', width: 560, height: 620}}>
        <svg width={560} height={620} style={{position: 'absolute', inset: 0}}>
          <rect x={60} y={40} width={440} height={540} rx={60} fill="rgba(127,230,242,0.05)" stroke={CYAN} strokeWidth={6} />
          <rect x={64} y={44} width={432} height={532} rx={56} fill={TEAL} opacity={field * 0.18} />
          {Array.from({length: visible}).map((_, i) => {
            const x = 110 + random(`bx${i}`) * 340;
            const y = 100 + random(`by${i}`) * 420;
            const r = 12 + random(`br${i}`) * 8;
            return <ellipse key={i} cx={x} cy={y} rx={r} ry={r * 0.7} fill={AMBER} opacity={0.85} transform={`rotate(${random(`bt${i}`) * 180} ${x} ${y})`} />;
          })}
        </svg>
      </div>
      <div style={{opacity: c, transform: `scale(${interpolate(c, [0, 1], [0.6, 1])})`, background: '#0a1218', border: `4px solid ${TEAL}`, borderRadius: 999, padding: '16px 42px', fontFamily: archivo.fontFamily, fontWeight: 700, fontSize: 38, color: WHITE}}>{chip}</div>
    </div>
  );
};

// Beat 4: two label cards side by side.
const Compare: React.FC<{bAt: number; aTitle: string; aLine1: string; aLine2: string; bTitle: string; bLine1: string; bLine2: string}> = ({bAt, aTitle, aLine1, aLine2, bTitle, bLine1, bLine2}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const a = spring({frame, fps, config: {damping: 13, stiffness: 160}});
  const b = spring({frame: frame - bAt, fps, config: {damping: 13, stiffness: 160}});
  const card = (title: string, l1: string, l2: string, color: string, sp: number): React.ReactElement => (
    <div style={{opacity: sp, transform: `translateY(${interpolate(sp, [0, 1], [80, 0])}px)`, width: 460, background: '#f2f4f5', borderRadius: 24, overflow: 'hidden', boxShadow: '0 24px 70px rgba(0,0,0,0.5)'}}>
      <div style={{background: color, padding: '22px 28px', fontFamily: anton.fontFamily, fontSize: 40, lineHeight: 1.1, color: '#04262b'}}>{title}</div>
      <div style={{padding: '26px 28px', display: 'flex', flexDirection: 'column', gap: 18}}>
        <div style={{fontFamily: archivo.fontFamily, fontWeight: 700, fontSize: 36, color: '#1c3a42'}}>{l1}</div>
        <div style={{fontFamily: archivo.fontFamily, fontWeight: 700, fontSize: 36, color: '#1c3a42'}}>{l2}</div>
      </div>
    </div>
  );
  return (
    <div style={{display: 'flex', gap: 40, alignItems: 'flex-start'}}>
      {card(aTitle, aLine1, aLine2, TEAL, a)}
      {card(bTitle, bLine1, bLine2, '#c9d4da', b)}
    </div>
  );
};

// Beat 5: microbiology clock lights up with a chip.
const MicroWorks: React.FC<{label: string; chip: string}> = ({label, chip}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const s = spring({frame, fps, config: {damping: 13, stiffness: 150}});
  const c = spring({frame: frame - 20, fps, config: {damping: 11, stiffness: 220}});
  return (
    <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 26, opacity: s}}>
      <div style={{border: `4px solid ${CYAN}`, borderRadius: 999, padding: '14px 46px', fontFamily: anton.fontFamily, fontSize: 46, letterSpacing: 3, color: CYAN}}>{label}</div>
      <ClockFace R={250} color={CYAN} speed={3.4} />
      <div style={{opacity: c, transform: `scale(${interpolate(c, [0, 1], [0.6, 1])})`, background: TEAL_DEEP, border: `4px solid ${TEAL}`, borderRadius: 999, padding: '16px 44px', fontFamily: anton.fontFamily, fontSize: 44, letterSpacing: 2, color: WHITE, boxShadow: '0 0 70px rgba(42,182,201,0.4)'}}>{chip}</div>
    </div>
  );
};

// Beat 6: what it does not do. Chemistry clock keeps sweeping.
const Nots: React.FC<{chemLabel: string; chips: string[]; chipAt: number[]}> = ({chemLabel, chips, chipAt}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const s = spring({frame, fps, config: {damping: 13, stiffness: 150}});
  return (
    <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 34, opacity: s}}>
      <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14}}>
        <div style={{fontFamily: anton.fontFamily, fontSize: 38, letterSpacing: 2, color: TEAL}}>{chemLabel}</div>
        <ClockFace R={150} color={TEAL} speed={2.2} />
      </div>
      <div style={{display: 'flex', flexDirection: 'column', gap: 22, alignItems: 'stretch'}}>
        {chips.map((t, i) => {
          const d = spring({frame: frame - chipAt[i], fps, config: {damping: 10, stiffness: 240}});
          return (
            <div key={i} style={{opacity: d, transform: `scale(${interpolate(d, [0, 1], [1.6, 1])})`, display: 'flex', alignItems: 'center', gap: 22, background: '#1a1206', border: `4px solid ${AMBER}`, borderRadius: 999, padding: '16px 38px'}}>
              <div style={{fontFamily: anton.fontFamily, fontSize: 48, color: AMBER, lineHeight: 1}}>{'✕'}</div>
              <div style={{fontFamily: anton.fontFamily, fontSize: 40, letterSpacing: 1, color: WHITE}}>{t}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const Verdict: React.FC<{line1: string; line2: string}> = ({line1, line2}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const s = spring({frame, fps, config: {damping: 11, stiffness: 190}});
  const l2 = spring({frame: frame - 30, fps, config: {damping: 11, stiffness: 190}});
  return (
    <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 30}}>
      <div style={{opacity: s, transform: `scale(${interpolate(s, [0, 1], [0.6, 1])})`, background: TEAL_DEEP, border: `5px solid ${TEAL}`, borderRadius: 30, padding: '34px 80px', fontFamily: anton.fontFamily, fontSize: 110, color: WHITE, boxShadow: '0 0 90px rgba(42,182,201,0.45)'}}>{line1}</div>
      <div style={{opacity: l2, transform: `scale(${interpolate(l2, [0, 1], [0.7, 1])})`, background: '#1a1206', border: `5px solid ${AMBER}`, borderRadius: 30, padding: '24px 44px', fontFamily: archivo.fontFamily, fontWeight: 700, fontSize: 40, color: AMBER, textAlign: 'center', maxWidth: 900}}>{line2}</div>
    </div>
  );
};

export const S2Day4: React.FC<{locale: S2Day4Config}> = ({locale}) => {
  const frame = useCurrentFrame();
  const sec = (s: number) => Math.round(s * FPS);
  const L = locale;
  const span = (x: Span) => ({from: sec(x.from), durationInFrames: sec(x.to - x.from)});

  return (
    <AbsoluteFill style={{background: BG}}>
      <Audio src={staticFile(L.voFile)} />
      <Audio src={staticFile('music.wav')} volume={0.45} />
      <Glow />

      {L.clips.map((c) => (
        <Sequence key={c.src + c.from} from={sec(c.from)} durationInFrames={sec(c.dur)}>
          <Cinematic src={c.src} shrink={L.clipMode === 'shrink'} />
        </Sequence>
      ))}

      <Sequence {...span(L.hook)}>
        <AbsoluteFill style={{alignItems: 'center', paddingTop: 600}}>
          <Hook />
        </AbsoluteFill>
      </Sequence>

      <Sequence {...span(L.ingredients)}>
        <AbsoluteFill style={{alignItems: 'center', paddingTop: 640}}>
          <Ingredients title={L.ingredients.title} line1={L.ingredients.line1} line2={L.ingredients.line2} tag={L.ingredients.tag} sourceLabel={L.ingredients.sourceLabel} source={L.ingredients.source} />
        </AbsoluteFill>
      </Sequence>

      <Sequence {...span(L.job)}>
        <AbsoluteFill style={{alignItems: 'center', paddingTop: 600}}>
          <Job chip={L.job.chip} />
        </AbsoluteFill>
      </Sequence>

      <Sequence {...span(L.compare)}>
        <AbsoluteFill style={{alignItems: 'center', paddingTop: 700}}>
          <Compare bAt={sec(L.compare.bAt - L.compare.from)} aTitle={L.compare.aTitle} aLine1={L.compare.aLine1} aLine2={L.compare.aLine2} bTitle={L.compare.bTitle} bLine1={L.compare.bLine1} bLine2={L.compare.bLine2} />
        </AbsoluteFill>
      </Sequence>

      <Sequence {...span(L.micro)}>
        <AbsoluteFill style={{alignItems: 'center', paddingTop: 620}}>
          <MicroWorks label={L.micro.label} chip={L.micro.chip} />
        </AbsoluteFill>
      </Sequence>

      <Sequence {...span(L.nots)}>
        <AbsoluteFill style={{alignItems: 'center', paddingTop: 600}}>
          <Nots chemLabel={L.nots.chemLabel} chips={L.nots.chips} chipAt={L.nots.chipAt.map((t) => sec(t - L.nots.from))} />
        </AbsoluteFill>
      </Sequence>

      <Sequence {...span(L.verdict)}>
        <AbsoluteFill style={{alignItems: 'center', paddingTop: 760}}>
          <Verdict line1={L.verdict.line1} line2={L.verdict.line2} />
        </AbsoluteFill>
      </Sequence>

      <AbsoluteFill style={{alignItems: 'center', paddingTop: 90}}>
        <Logo small />
      </AbsoluteFill>
      <Flag code={L.flag} />

      {L.cues.map((cue) => (
        <Sequence key={cue.from} from={sec(cue.from)} durationInFrames={sec(cue.to - cue.from)}>
          <Caption cue={cue} />
        </Sequence>
      ))}

      <Sequence from={sec(L.endFrom)}>
        <AbsoluteFill style={{background: BG}}>
          <Glow />
          <Flag code={L.flag} />
          <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center', gap: 42}}>
            <div
              style={{
                border: `3px solid ${TEAL}`,
                borderRadius: 999,
                padding: '18px 48px',
                fontFamily: anton.fontFamily,
                fontSize: 54,
                color: TEAL,
                letterSpacing: 2,
                opacity: interpolate(frame, [sec(L.dayChip.from), sec(L.dayChip.from + 0.5)], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}),
              }}
            >
              {L.dayChip.label}
            </div>
            <Buddy size={440} />
            <Logo />
            <div
              style={{
                background: TEAL_DEEP,
                borderRadius: 999,
                padding: '28px 66px',
                fontFamily: archivo.fontFamily,
                fontWeight: 700,
                fontSize: 56,
                color: WHITE,
                opacity: interpolate(frame, [sec(L.endFrom + 0.4), sec(L.endFrom + 1)], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}),
              }}
            >
              buddypept.com
            </div>
            <div
              style={{
                fontFamily: archivo.fontFamily,
                fontSize: 30,
                color: '#5d7078',
                opacity: interpolate(frame, [sec(L.endFrom + 1.4), sec(L.endFrom + 2)], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}),
              }}
            >
              {L.disclaimer}
            </div>
          </AbsoluteFill>
        </AbsoluteFill>
      </Sequence>
    </AbsoluteFill>
  );
};

export const S2DAY4_EN: S2Day4Config = {
  id: 'S2Day4EN',
  flag: 'us',
  voFile: 's2-d4-vo-en.mp3',
  clipMode: 'shrink',
  cues: [
    {from: 0.05, to: 4.73, lines: ['BACTERIOSTATIC WATER.', 'IT SOUNDS LIKE A SHIELD.'], teal: 1},
    {from: 4.73, to: 6.93, lines: ['IT HAS', 'ONE JOB.']},
    {from: 6.93, to: 12.73, lines: ['STERILE WATER +', '0.9% BENZYL ALCOHOL.'], teal: 1},
    {from: 12.73, to: 15.32, lines: ['BENZYL ALCOHOL =', 'A PRESERVATIVE.']},
    {from: 15.32, to: 20.32, lines: ['IT HELPS SUPPRESS', 'BACTERIAL GROWTH.'], teal: 1},
    {from: 20.32, to: 26.64, lines: ['MULTI-DOSE', 'VS SINGLE-USE.']},
    {from: 26.64, to: 30.73, lines: ['IT WORKS ON THE', 'MICROBIOLOGY CLOCK.'], teal: 1},
    {from: 30.73, to: 40.17, lines: ['WHAT IT', 'DOES NOT DO.']},
    {from: 40.17, to: 43.09, lines: ['ONE JOB.', 'SUPPRESS GROWTH.'], teal: 1},
    {from: 43.09, to: 47.41, lines: ['EVERYTHING ELSE:', 'LABEL, TEMP, HANDLING.']},
    {from: 47.41, to: 50.76, lines: ['DAY 4 OF 10.', 'THE MATH DOESN’T LIE.'], teal: 1},
  ],
  clips: [{src: 's2-clip4.mp4', from: 47.41, dur: 3.35}],
  hook: {from: 0, to: 6.93},
  ingredients: {
    from: 6.93,
    to: 15.32,
    title: 'BACTERIOSTATIC WATER',
    line1: 'Sterile water',
    line2: '0.9% benzyl alcohol',
    tag: 'PRESERVATIVE',
    sourceLabel: 'SOURCE VERIFIED',
    source: 'Bacteriostatic Water for Injection, USP label (DailyMed)',
  },
  job: {from: 15.32, to: 20.32, chip: 'helps suppress bacterial growth'},
  compare: {
    from: 20.32,
    to: 26.64,
    bAt: 21.47,
    aTitle: 'BACTERIOSTATIC WATER',
    aLine1: 'Contains a preservative',
    aLine2: 'Labeled multi-dose',
    bTitle: 'STERILE WATER FOR INJECTION',
    bLine1: 'No preservative',
    bLine2: 'Single use',
  },
  micro: {from: 26.64, to: 30.73, label: 'MICROBIOLOGY', chip: 'BAC WATER WORKS HERE'},
  nots: {
    from: 30.73,
    to: 40.17,
    chemLabel: 'CHEMISTRY',
    chips: ["DOESN'T STOP THE CHEMISTRY CLOCK", "DOESN'T EXTEND PEPTIDE LIFE", 'NOT COMPLETE PROTECTION'],
    chipAt: [31.6, 34.27, 36.7],
  },
  verdict: {from: 40.17, to: 47.41, line1: 'ONE JOB.', line2: 'the label, temperature, and handling decide the rest'},
  endFrom: 50.76,
  dayChip: {from: 50.76, label: 'DAY 4 OF 10'},
  disclaimer: 'Educational tool. Not medical advice. For research purposes only.',
  durationSec: 56,
};


export const S2DAY4_PT: S2Day4Config = {
  id: 'S2Day4PT',
  flag: 'br',
  voFile: 's2-d4-vo-pt.mp3',
  clipMode: 'shrink',
  cues: [
    {from: 0.05, to: 4.28, lines: ['ÁGUA BACTERIOSTÁTICA.', 'PARECE UM ESCUDO.'], teal: 1},
    {from: 4.28, to: 7.03, lines: ['ELA TEM', 'UMA FUNÇÃO.']},
    {from: 7.03, to: 12.28, lines: ['ÁGUA ESTÉRIL +', '0,9% ÁLCOOL BENZÍLICO.'], teal: 1},
    {from: 12.28, to: 14.79, lines: ['ÁLCOOL BENZÍLICO =', 'CONSERVANTE.']},
    {from: 14.79, to: 20.25, lines: ['AJUDA A SUPRIMIR O', 'CRESCIMENTO BACTERIANO.'], teal: 1},
    {from: 20.25, to: 25.9, lines: ['MULTIDOSE', 'VS USO ÚNICO.']},
    {from: 25.9, to: 29.83, lines: ['ATUA NO RELÓGIO', 'DA MICROBIOLOGIA.'], teal: 1},
    {from: 29.83, to: 38.64, lines: ['O QUE ELA', 'NÃO FAZ.']},
    {from: 38.64, to: 41.99, lines: ['UMA FUNÇÃO.', 'SUPRIMIR O CRESCIMENTO.'], teal: 1},
    {from: 41.99, to: 46.39, lines: ['O RESTO: RÓTULO,', 'TEMPERATURA, MANUSEIO.']},
    {from: 46.39, to: 50.25, lines: ['DIA 4 DE 10.', 'A MATEMÁTICA NÃO MENTE.'], teal: 1},
  ],
  clips: [{src: 's2-clip4.mp4', from: 46.39, dur: 3.86}],
  hook: {from: 0, to: 7.03},
  ingredients: {
    from: 7.03,
    to: 14.79,
    title: 'ÁGUA BACTERIOSTÁTICA',
    line1: 'Água estéril',
    line2: '0,9% álcool benzílico',
    tag: 'CONSERVANTE',
    sourceLabel: 'FONTE VERIFICADA',
    source: 'Rótulo USP da Água Bacteriostática para Injeção (DailyMed)',
  },
  job: {from: 14.79, to: 20.25, chip: 'ajuda a suprimir o crescimento bacteriano'},
  compare: {
    from: 20.25,
    to: 25.9,
    bAt: 21.49,
    aTitle: 'ÁGUA BACTERIOSTÁTICA',
    aLine1: 'Contém conservante',
    aLine2: 'Rótulo multidose',
    bTitle: 'ÁGUA ESTÉRIL PARA INJEÇÃO',
    bLine1: 'Sem conservante',
    bLine2: 'Uso único',
  },
  micro: {from: 25.9, to: 29.83, label: 'MICROBIOLOGIA', chip: 'A ÁGUA BAC ATUA AQUI'},
  nots: {
    from: 29.83,
    to: 38.64,
    chemLabel: 'QUÍMICA',
    chips: ['NÃO PARA O RELÓGIO DA QUÍMICA', 'NÃO PROLONGA A VIDA DO PEPTÍDEO', 'NÃO É PROTEÇÃO COMPLETA'],
    chipAt: [31.0, 33.1, 35.43],
  },
  verdict: {from: 38.64, to: 46.39, line1: 'UMA FUNÇÃO.', line2: 'o rótulo, a temperatura e o manuseio decidem o resto'},
  endFrom: 50.25,
  dayChip: {from: 50.25, label: 'DIA 4 DE 10'},
  disclaimer: 'Ferramenta educacional. Não é orientação médica. Somente para fins de pesquisa.',
  durationSec: 56,
};

export const S2DAY4_ES: S2Day4Config = {
  id: 'S2Day4ES',
  flag: 'mx',
  voFile: 's2-d4-vo-es.mp3',
  clipMode: 'shrink',
  cues: [
    {from: 0.05, to: 5.57, lines: ['AGUA BACTERIOSTÁTICA.', 'SUENA A ESCUDO.'], teal: 1},
    {from: 5.57, to: 9.45, lines: ['TIENE UN', 'SOLO TRABAJO.']},
    {from: 9.45, to: 15.57, lines: ['AGUA ESTÉRIL +', '0.9% ALCOHOL BENCÍLICO.'], teal: 1},
    {from: 15.57, to: 18.83, lines: ['ALCOHOL BENCÍLICO =', 'CONSERVADOR.']},
    {from: 18.83, to: 25.25, lines: ['AYUDA A SUPRIMIR EL', 'CRECIMIENTO BACTERIANO.'], teal: 1},
    {from: 25.25, to: 33.22, lines: ['MULTIDOSIS', 'VS UN SOLO USO.']},
    {from: 33.22, to: 38.14, lines: ['ACTÚA EN EL RELOJ', 'DE LA MICROBIOLOGÍA.'], teal: 1},
    {from: 38.14, to: 49.0, lines: ['LO QUE', 'NO HACE.']},
    {from: 49.0, to: 53.97, lines: ['UN SOLO TRABAJO.', 'SUPRIMIR EL CRECIMIENTO.'], teal: 1},
    {from: 53.97, to: 59.31, lines: ['LO DEMÁS: ETIQUETA,', 'TEMPERATURA, MANEJO.']},
    {from: 59.31, to: 64.78, lines: ['DÍA 4 DE 10.', 'LAS CUENTAS NO MIENTEN.'], teal: 1},
  ],
  clips: [{src: 's2-clip4.mp4', from: 59.31, dur: 5.47}],
  hook: {from: 0, to: 9.45},
  ingredients: {
    from: 9.45,
    to: 18.83,
    title: 'AGUA BACTERIOSTÁTICA',
    line1: 'Agua estéril',
    line2: '0.9% alcohol bencílico',
    tag: 'CONSERVADOR',
    sourceLabel: 'FUENTE VERIFICADA',
    source: 'Etiqueta USP del Agua Bacteriostática para Inyección (DailyMed)',
  },
  job: {from: 18.83, to: 25.25, chip: 'ayuda a suprimir el crecimiento bacteriano'},
  compare: {
    from: 25.25,
    to: 33.22,
    bAt: 27.14,
    aTitle: 'AGUA BACTERIOSTÁTICA',
    aLine1: 'Contiene conservador',
    aLine2: 'Etiqueta multidosis',
    bTitle: 'AGUA ESTÉRIL PARA INYECCIÓN',
    bLine1: 'Sin conservador',
    bLine2: 'Un solo uso',
  },
  micro: {from: 33.22, to: 38.14, label: 'MICROBIOLOGÍA', chip: 'EL AGUA BAC ACTÚA AQUÍ'},
  nots: {
    from: 38.14,
    to: 49.0,
    chemLabel: 'QUÍMICA',
    chips: ['NO DETIENE EL RELOJ DE LA QUÍMICA', 'NO ALARGA LA VIDA DEL PÉPTIDO', 'NO ES PROTECCIÓN COMPLETA'],
    chipAt: [39.6, 42.02, 44.9],
  },
  verdict: {from: 49.0, to: 59.31, line1: 'UN SOLO TRABAJO.', line2: 'la etiqueta, la temperatura y el manejo deciden el resto'},
  endFrom: 64.78,
  dayChip: {from: 64.78, label: 'DÍA 4 DE 10'},
  disclaimer: 'Herramienta educativa. No es consejo médico. Solo con fines de investigación.',
  durationSec: 70,
};
