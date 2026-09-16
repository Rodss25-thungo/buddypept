import React from 'react';
import {
  AbsoluteFill,
  Audio,
  Img,
  interpolate,
  OffthreadVideo,
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
const COLD = '#6fb8ff';

type ClipCfg = {src: string; from: number; dur: number};
type Span = {from: number; to: number};

type S2Day5Config = {
  id: string;
  flag: 'us' | 'mx' | 'br';
  voFile: string;
  vialImg: string;
  cues: Cue[];
  clips: ClipCfg[];
  hook: Span & {splitAt: number; coldLabel: string; warmLabel: string};
  chem: Span & {chips: string[]; chipAt: number[]};
  rate: Span & {stepAt: number[]; tag: string; tagAt: number; sourceLabel: string; source: string};
  roomFridge: Span & {roomLabel: string; fridgeLabel: string; fridgeAt: number; chip: string; chipAt: number};
  label: Span & {title: string; line1: string; line2: string; sourceLabel: string; source: string};
  verdict: Span & {line1: string; line2: string};
  endFrom: number;
  dayChip: {from: number; label: string};
  disclaimer: string;
  durationSec: number;
};

const Cinematic: React.FC<{src: string}> = ({src}) => {
  const frame = useCurrentFrame();
  const fade = interpolate(frame, [0, 10], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return (
    <AbsoluteFill style={{opacity: fade, alignItems: 'center', paddingTop: 500}}>
      <div style={{width: 792, height: 1408, borderRadius: 36, overflow: 'hidden', WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, black 8%, black 88%, transparent 100%)'}}>
        <OffthreadVideo src={staticFile(src)} muted style={{width: '100%', height: '100%', objectFit: 'cover'}} />
      </div>
    </AbsoluteFill>
  );
};

// Clock face; pass `angle` to drive the hand directly, otherwise it sweeps at `speed` degrees per frame.
const ClockFace: React.FC<{R: number; color: string; speed?: number; angle?: number}> = ({R, color, speed = 2, angle}) => {
  const frame = useCurrentFrame();
  const a = angle ?? 40 + frame * speed;
  return (
    <svg width={R * 2} height={R * 2}>
      <circle cx={R} cy={R} r={R - 6} fill="none" stroke={color} strokeWidth={Math.max(4, R * 0.02)} style={{filter: `drop-shadow(0 0 ${R * 0.07}px ${color})`}} />
      {Array.from({length: 12}).map((_, i) => {
        const t = (i / 12) * Math.PI * 2;
        return (
          <line
            key={i}
            x1={R + Math.sin(t) * (R - 12)}
            y1={R - Math.cos(t) * (R - 12)}
            x2={R + Math.sin(t) * (R - 12 - R * 0.09)}
            y2={R - Math.cos(t) * (R - 12 - R * 0.09)}
            stroke={color}
            strokeWidth={i % 3 === 0 ? Math.max(4, R * 0.028) : Math.max(2, R * 0.014)}
          />
        );
      })}
      <line x1={R} y1={R} x2={R + Math.sin((a * Math.PI) / 180) * (R * 0.72)} y2={R - Math.cos((a * Math.PI) / 180) * (R * 0.72)} stroke={color} strokeWidth={Math.max(4, R * 0.028)} strokeLinecap="round" />
      <circle cx={R} cy={R} r={Math.max(6, R * 0.045)} fill={color} />
    </svg>
  );
};

const SourceChip: React.FC<{label: string; source: string; sp: number}> = ({label, source, sp}) => (
  <div
    style={{
      opacity: sp,
      transform: `translateY(${interpolate(sp, [0, 1], [30, 0])}px)`,
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
    <div style={{fontFamily: anton.fontFamily, fontSize: 30, letterSpacing: 2, color: TEAL, flexShrink: 0}}>{label}</div>
    <div style={{fontFamily: archivo.fontFamily, fontWeight: 700, fontSize: 26, color: MUTED}}>{source}</div>
  </div>
);

// Liquid-only vial with a colored glow behind it.
const GlowVial: React.FC<{color: string; glow: number; h: number; img: string}> = ({color, glow, h, img}) => (
  <div style={{position: 'relative', width: h * 0.62, height: h, display: 'flex', justifyContent: 'center'}}>
    <div style={{position: 'absolute', inset: '-10% -40%', borderRadius: 999, background: `radial-gradient(closest-side, ${color}, transparent)`, opacity: glow * 0.55}} />
    <Img src={staticFile(img)} style={{position: 'relative', height: h, WebkitMaskImage: 'linear-gradient(to right, transparent 0%, black 14%, black 86%, transparent 100%)'}} />
  </div>
);

// Beat 1-2: same vial twice, a slow teal clock and a fast amber clock; cold/warm glows arrive at splitAt.
const Hook: React.FC<{splitAt: number; coldLabel: string; warmLabel: string; img: string}> = ({splitAt, coldLabel, warmLabel, img}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const s = spring({frame, fps, config: {damping: 13, stiffness: 150}});
  const g = interpolate(frame, [splitAt, splitAt + 15], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const side = (color: string, clockColor: string, speed: number, label: string): React.ReactElement => (
    <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 26}}>
      <ClockFace R={150} color={clockColor} speed={speed} />
      <GlowVial color={color} glow={g} h={600} img={img} />
      <div style={{opacity: g, fontFamily: anton.fontFamily, fontSize: 44, letterSpacing: 2, color}}>{label}</div>
    </div>
  );
  return (
    <div style={{display: 'flex', gap: 90, opacity: s, transform: `scale(${interpolate(s, [0, 1], [0.85, 1])})`}}>
      {side(COLD, TEAL, 1, coldLabel)}
      {side(AMBER, AMBER, 7, warmLabel)}
    </div>
  );
};

// Beat 3: degradation routes drift in around the running chemistry clock.
const Chem: React.FC<{chips: string[]; chipAt: number[]}> = ({chips, chipAt}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const s = spring({frame, fps, config: {damping: 13, stiffness: 150}});
  return (
    <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 44, opacity: s}}>
      <ClockFace R={230} color={TEAL} speed={3} />
      <div style={{display: 'flex', flexDirection: 'column', gap: 22, alignItems: 'center'}}>
        {chips.map((t, i) => {
          const d = spring({frame: frame - chipAt[i], fps, config: {damping: 11, stiffness: 200}});
          return (
            <div key={i} style={{opacity: d, transform: `translateX(${interpolate(d, [0, 1], [i % 2 ? 160 : -160, 0])}px)`, background: '#1a1206', border: `4px solid ${AMBER}`, borderRadius: 999, padding: '14px 48px', fontFamily: anton.fontFamily, fontSize: 46, letterSpacing: 3, color: WHITE}}>
              {t}
            </div>
          );
        })}
      </div>
    </div>
  );
};

// Beat 4: rate bars double with each +10 C step. Rule of thumb tag and source.
const Rate: React.FC<{stepAt: number[]; tag: string; tagAt: number; sourceLabel: string; source: string}> = ({stepAt, tag, tagAt, sourceLabel, source}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const steps = [
    {t: '15 °C', m: '1x', h: 90, c: TEAL},
    {t: '25 °C', m: '2x', h: 180, c: '#c9a13a'},
    {t: '35 °C', m: '4x', h: 360, c: AMBER},
  ];
  const tg = spring({frame: frame - tagAt, fps, config: {damping: 10, stiffness: 220}});
  const src = spring({frame: frame - stepAt[0] - 20, fps, config: {damping: 12, stiffness: 200}});
  return (
    <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 40}}>
      <div style={{display: 'flex', gap: 60, alignItems: 'flex-end', height: 480}}>
        {steps.map((st, i) => {
          const g = spring({frame: frame - stepAt[i], fps, config: {damping: 14, stiffness: 120}});
          return (
            <div key={i} style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14, opacity: g}}>
              <div style={{fontFamily: anton.fontFamily, fontSize: 64, color: st.c}}>{st.m}</div>
              <div style={{width: 170, height: st.h * g, background: st.c, borderRadius: 18, boxShadow: `0 0 50px ${st.c}66`}} />
              <div style={{fontFamily: anton.fontFamily, fontSize: 48, color: WHITE}}>{st.t}</div>
            </div>
          );
        })}
      </div>
      <div style={{opacity: tg, transform: `scale(${interpolate(tg, [0, 1], [1.5, 1])})`, background: '#1a1206', border: `4px solid ${AMBER}`, borderRadius: 999, padding: '14px 44px', fontFamily: anton.fontFamily, fontSize: 44, letterSpacing: 2, color: AMBER}}>{tag}</div>
      <SourceChip label={sourceLabel} source={source} sp={src} />
    </div>
  );
};

const Thermo: React.FC<{level: number; color: string}> = ({level, color}) => (
  <svg width={90} height={300} viewBox="0 0 90 300">
    <rect x={27} y={10} width={36} height={220} rx={18} fill="rgba(255,255,255,0.06)" stroke={MUTED} strokeWidth={4} />
    <rect x={35} y={10 + 212 * (1 - level)} width={20} height={212 * level + 20} rx={10} fill={color} />
    <circle cx={45} cy={255} r={36} fill={color} stroke={MUTED} strokeWidth={4} />
  </svg>
);

// Beat 5: room vs fridge, each with its own clock.
const RoomFridge: React.FC<{roomLabel: string; fridgeLabel: string; fridgeAt: number; chip: string; chipAt: number}> = ({roomLabel, fridgeLabel, fridgeAt, chip, chipAt}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const a = spring({frame, fps, config: {damping: 13, stiffness: 150}});
  const b = spring({frame: frame - fridgeAt, fps, config: {damping: 13, stiffness: 150}});
  const c = spring({frame: frame - chipAt, fps, config: {damping: 11, stiffness: 220}});
  const col = (label: string, color: string, level: number, speed: number, sp: number): React.ReactElement => (
    <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 22, opacity: sp, transform: `translateY(${interpolate(sp, [0, 1], [60, 0])}px)`}}>
      <Thermo level={level} color={color} />
      <div style={{fontFamily: anton.fontFamily, fontSize: 46, letterSpacing: 1, color}}>{label}</div>
      <ClockFace R={150} color={color} speed={speed} />
    </div>
  );
  return (
    <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 46}}>
      <div style={{display: 'flex', gap: 110}}>
        {col(roomLabel, AMBER, 0.7, 6, a)}
        {col(fridgeLabel, COLD, 0.2, 1, b)}
      </div>
      <div style={{opacity: c, transform: `scale(${interpolate(c, [0, 1], [0.6, 1])})`, background: TEAL_DEEP, border: `4px solid ${TEAL}`, borderRadius: 999, padding: '16px 44px', fontFamily: anton.fontFamily, fontSize: 44, letterSpacing: 2, color: WHITE, boxShadow: '0 0 70px rgba(42,182,201,0.4)'}}>{chip}</div>
    </div>
  );
};

// Beat 6: label card with SOURCE VERIFIED.
const LabelCard: React.FC<{title: string; line1: string; line2: string; sourceLabel: string; source: string}> = ({title, line1, line2, sourceLabel, source}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const flip = spring({frame, fps, config: {damping: 14, stiffness: 120}});
  const chip = spring({frame: frame - 40, fps, config: {damping: 12, stiffness: 200}});
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
          borderTop: `10px solid ${COLD}`,
        }}
      >
        <div style={{fontFamily: anton.fontFamily, fontSize: 52, color: '#0e2a30', letterSpacing: 1}}>{title}</div>
        <div style={{height: 3, background: '#c9d4da', margin: '20px 0 26px'}} />
        <div style={{fontFamily: archivo.fontFamily, fontWeight: 700, fontSize: 48, color: '#1c3a42'}}>{line1}</div>
        <div style={{display: 'inline-block', marginTop: 20, background: COLD, borderRadius: 999, padding: '8px 28px', fontFamily: anton.fontFamily, fontSize: 40, letterSpacing: 2, color: '#04203a'}}>{line2}</div>
      </div>
      <SourceChip label={sourceLabel} source={source} sp={chip} />
      <div style={{opacity: chip}}>
        <ClockFace R={190} color={COLD} speed={0.8} />
      </div>
    </div>
  );
};

// Beat 7: the cold clock slows toward a stop but never fully stops.
const Verdict: React.FC<{line1: string; line2: string}> = ({line1, line2}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const s = spring({frame, fps, config: {damping: 11, stiffness: 190}});
  const l2 = spring({frame: frame - 30, fps, config: {damping: 11, stiffness: 190}});
  const angle = 40 + 260 * (1 - Math.exp(-frame / 30)) + frame * 0.25;
  return (
    <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 34}}>
      <ClockFace R={170} color={COLD} angle={angle} />
      <div style={{opacity: s, transform: `scale(${interpolate(s, [0, 1], [0.6, 1])})`, background: TEAL_DEEP, border: `5px solid ${TEAL}`, borderRadius: 30, padding: '28px 80px', fontFamily: anton.fontFamily, fontSize: 100, color: WHITE, boxShadow: '0 0 90px rgba(42,182,201,0.45)'}}>{line1}</div>
      <div style={{opacity: l2, transform: `scale(${interpolate(l2, [0, 1], [0.7, 1])})`, background: '#1a1206', border: `5px solid ${AMBER}`, borderRadius: 30, padding: '20px 60px', fontFamily: anton.fontFamily, fontSize: 72, color: AMBER}}>{line2}</div>
    </div>
  );
};

export const S2Day5: React.FC<{locale: S2Day5Config}> = ({locale}) => {
  const frame = useCurrentFrame();
  const sec = (s: number) => Math.round(s * FPS);
  const L = locale;
  const span = (x: Span) => ({from: sec(x.from), durationInFrames: sec(x.to - x.from)});
  const rel = (t: number, base: Span) => sec(t - base.from);

  return (
    <AbsoluteFill style={{background: BG}}>
      <Audio src={staticFile(L.voFile)} />
      <Audio src={staticFile('music.wav')} volume={0.45} />
      <Glow />

      {L.clips.map((c) => (
        <Sequence key={c.src + c.from} from={sec(c.from)} durationInFrames={sec(c.dur)}>
          <Cinematic src={c.src} />
        </Sequence>
      ))}

      <Sequence {...span(L.hook)}>
        <AbsoluteFill style={{alignItems: 'center', paddingTop: 600}}>
          <Hook splitAt={rel(L.hook.splitAt, L.hook)} coldLabel={L.hook.coldLabel} warmLabel={L.hook.warmLabel} img={L.vialImg} />
        </AbsoluteFill>
      </Sequence>

      <Sequence {...span(L.chem)}>
        <AbsoluteFill style={{alignItems: 'center', paddingTop: 620}}>
          <Chem chips={L.chem.chips} chipAt={L.chem.chipAt.map((t) => rel(t, L.chem))} />
        </AbsoluteFill>
      </Sequence>

      <Sequence {...span(L.rate)}>
        <AbsoluteFill style={{alignItems: 'center', paddingTop: 640}}>
          <Rate stepAt={L.rate.stepAt.map((t) => rel(t, L.rate))} tag={L.rate.tag} tagAt={rel(L.rate.tagAt, L.rate)} sourceLabel={L.rate.sourceLabel} source={L.rate.source} />
        </AbsoluteFill>
      </Sequence>

      <Sequence {...span(L.roomFridge)}>
        <AbsoluteFill style={{alignItems: 'center', paddingTop: 620}}>
          <RoomFridge roomLabel={L.roomFridge.roomLabel} fridgeLabel={L.roomFridge.fridgeLabel} fridgeAt={rel(L.roomFridge.fridgeAt, L.roomFridge)} chip={L.roomFridge.chip} chipAt={rel(L.roomFridge.chipAt, L.roomFridge)} />
        </AbsoluteFill>
      </Sequence>

      <Sequence {...span(L.label)}>
        <AbsoluteFill style={{alignItems: 'center', paddingTop: 700}}>
          <LabelCard title={L.label.title} line1={L.label.line1} line2={L.label.line2} sourceLabel={L.label.sourceLabel} source={L.label.source} />
        </AbsoluteFill>
      </Sequence>

      <Sequence {...span(L.verdict)}>
        <AbsoluteFill style={{alignItems: 'center', paddingTop: 620}}>
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

export const S2DAY5_EN: S2Day5Config = {
  id: 'S2Day5EN',
  flag: 'us',
  voFile: 's2-d5-vo-en.mp3',
  vialImg: 'vial-liquid-peptide-en.png',
  cues: [
    {from: 0.05, to: 2.24, lines: ['SAME VIAL.', 'SAME PEPTIDE.'], teal: 1},
    {from: 2.24, to: 3.54, lines: ['TWO DIFFERENT', 'CLOCKS.']},
    {from: 3.54, to: 5.46, lines: ['THE ONLY DIFFERENCE:', 'TEMPERATURE.'], teal: 1},
    {from: 5.46, to: 13.15, lines: ['IN WATER, THE CHEMISTRY', 'KEEPS RUNNING.'], teal: 1},
    {from: 13.15, to: 15.05, lines: ['HEAT SPEEDS', 'IT UP.']},
    {from: 15.05, to: 21.93, lines: ['~2X FASTER', 'PER +10 °C.'], teal: 1},
    {from: 21.93, to: 25.04, lines: ['A RULE OF THUMB.', 'NOT A LAW.']},
    {from: 25.04, to: 27.67, lines: ['COLD SLOWS', 'THE CLOCK.'], teal: 1},
    {from: 27.67, to: 32.1, lines: ['ROOM ~25 °C.', 'FRIDGE 2-8 °C.']},
    {from: 32.1, to: 36.8, lines: ['SEVERAL TIMES', 'SLOWER IN THE COLD.'], teal: 1},
    {from: 36.8, to: 44.48, lines: ['THE LABEL', 'AGREES.'], teal: 1},
    {from: 44.48, to: 47.93, lines: ['COLD SLOWS IT.', 'IT DOES NOT STOP IT.'], teal: 1},
    {from: 47.93, to: 51.42, lines: ['DAY 5 OF 10.', 'THE MATH DOESN’T LIE.'], teal: 1},
  ],
  clips: [{src: 's2-clip4.mp4', from: 47.93, dur: 3.49}],
  hook: {from: 0, to: 5.46, splitAt: 3.54, coldLabel: 'COLD', warmLabel: 'WARM'},
  chem: {from: 5.46, to: 15.05, chips: ['HYDROLYSIS', 'DEAMIDATION', 'OXIDATION'], chipAt: [10.2, 11.3, 12.4]},
  rate: {
    from: 15.05,
    to: 25.04,
    stepAt: [16.0, 18.2, 20.2],
    tag: 'RULE OF THUMB, NOT A LAW',
    tagAt: 21.93,
    sourceLabel: 'SOURCE VERIFIED',
    source: 'Manning et al., Pharm Res 2010',
  },
  roomFridge: {from: 25.04, to: 36.8, roomLabel: 'ROOM ~25 °C', fridgeLabel: 'FRIDGE 2-8 °C', fridgeAt: 30.43, chip: 'SEVERAL TIMES SLOWER', chipAt: 33.5},
  label: {
    from: 36.8,
    to: 44.48,
    title: 'OZEMPIC PEN LABEL',
    line1: 'New pen: store in the refrigerator',
    line2: '2-8 °C · DO NOT FREEZE',
    sourceLabel: 'SOURCE VERIFIED',
    source: 'Ozempic prescribing information (Novo Nordisk, DailyMed)',
  },
  verdict: {from: 44.48, to: 47.93, line1: 'SLOWER.', line2: 'NOT STOPPED.'},
  endFrom: 51.42,
  dayChip: {from: 51.42, label: 'DAY 5 OF 10'},
  disclaimer: 'Educational tool. Not medical advice. For research purposes only.',
  durationSec: 57,
};

export const S2DAY5_PT: S2Day5Config = {
  id: 'S2Day5PT',
  flag: 'br',
  voFile: 's2-d5-vo-pt.mp3',
  vialImg: 'vial-liquid-peptide-pt.png',
  cues: [
    {from: 0.05, to: 2.69, lines: ['MESMO FRASCO.', 'MESMO PEPTÍDEO.'], teal: 1},
    {from: 2.69, to: 4.54, lines: ['DOIS RELÓGIOS', 'DIFERENTES.']},
    {from: 4.54, to: 6.84, lines: ['A ÚNICA DIFERENÇA:', 'TEMPERATURA.'], teal: 1},
    {from: 6.84, to: 13.51, lines: ['NA ÁGUA, A QUÍMICA', 'CONTINUA FUNCIONANDO.'], teal: 1},
    {from: 13.51, to: 15.43, lines: ['O CALOR', 'ACELERA.']},
    {from: 15.43, to: 23.19, lines: ['~2X MAIS RÁPIDO', 'A CADA +10 °C.'], teal: 1},
    {from: 23.19, to: 25.86, lines: ['REGRA PRÁTICA.', 'NÃO É LEI.']},
    {from: 25.86, to: 28.79, lines: ['O FRIO DESACELERA', 'O RELÓGIO.'], teal: 1},
    {from: 28.79, to: 34.83, lines: ['AMBIENTE ~25 °C.', 'GELADEIRA 2-8 °C.']},
    {from: 34.83, to: 40.04, lines: ['VÁRIAS VEZES MAIS', 'DEVAGAR NO FRIO.'], teal: 1},
    {from: 40.04, to: 48.11, lines: ['O RÓTULO', 'CONCORDA.'], teal: 1},
    {from: 48.11, to: 52.33, lines: ['O FRIO DESACELERA.', 'NÃO PARA.'], teal: 1},
    {from: 52.33, to: 56.11, lines: ['DIA 5 DE 10.', 'A MATEMÁTICA NÃO MENTE.'], teal: 1},
  ],
  clips: [{src: 's2-clip4.mp4', from: 52.33, dur: 3.78}],
  hook: {from: 0, to: 6.84, splitAt: 4.54, coldLabel: 'FRIO', warmLabel: 'QUENTE'},
  chem: {from: 6.84, to: 15.43, chips: ['HIDRÓLISE', 'DESAMIDAÇÃO', 'OXIDAÇÃO'], chipAt: [10.8, 11.9, 12.9]},
  rate: {
    from: 15.43,
    to: 25.86,
    stepAt: [16.4, 18.8, 21.2],
    tag: 'REGRA PRÁTICA, NÃO LEI',
    tagAt: 23.19,
    sourceLabel: 'FONTE VERIFICADA',
    source: 'Manning et al., Pharm Res 2010',
  },
  roomFridge: {from: 25.86, to: 40.04, roomLabel: 'AMBIENTE ~25 °C', fridgeLabel: 'GELADEIRA 2-8 °C', fridgeAt: 32.4, chip: 'VÁRIAS VEZES MAIS LENTO', chipAt: 36.5},
  label: {
    from: 40.04,
    to: 48.11,
    title: 'RÓTULO DA CANETA OZEMPIC',
    line1: 'Caneta nova: guardar na geladeira',
    line2: '2-8 °C · NÃO CONGELAR',
    sourceLabel: 'FONTE VERIFICADA',
    source: 'Bula do Ozempic (Novo Nordisk, DailyMed)',
  },
  verdict: {from: 48.11, to: 52.33, line1: 'MAIS LENTO.', line2: 'NÃO PARADO.'},
  endFrom: 56.11,
  dayChip: {from: 56.11, label: 'DIA 5 DE 10'},
  disclaimer: 'Ferramenta educacional. Não é orientação médica. Somente para fins de pesquisa.',
  durationSec: 62,
};

export const S2DAY5_ES: S2Day5Config = {
  id: 'S2Day5ES',
  flag: 'mx',
  voFile: 's2-d5-vo-es.mp3',
  vialImg: 'vial-liquid-peptide-es.png',
  cues: [
    {from: 0.05, to: 3.75, lines: ['MISMO VIAL.', 'MISMO PÉPTIDO.'], teal: 1},
    {from: 3.75, to: 6.21, lines: ['DOS RELOJES', 'DIFERENTES.']},
    {from: 6.21, to: 9.32, lines: ['LA ÚNICA DIFERENCIA:', 'TEMPERATURA.'], teal: 1},
    {from: 9.32, to: 17.07, lines: ['EN EL AGUA, LA QUÍMICA', 'SIGUE EN MARCHA.'], teal: 1},
    {from: 17.07, to: 19.92, lines: ['EL CALOR', 'LA ACELERA.']},
    {from: 19.92, to: 28.2, lines: ['~2X MÁS RÁPIDO', 'POR CADA +10 °C.'], teal: 1},
    {from: 28.2, to: 32.03, lines: ['REGLA PRÁCTICA.', 'NO ES LEY.']},
    {from: 32.03, to: 35.82, lines: ['EL FRÍO HACE LENTO', 'EL RELOJ.'], teal: 1},
    {from: 35.82, to: 43.01, lines: ['AMBIENTE ~25 °C.', 'REFRIGERADOR 2-8 °C.']},
    {from: 43.01, to: 49.13, lines: ['VARIAS VECES MÁS', 'LENTO EN EL FRÍO.'], teal: 1},
    {from: 49.13, to: 59.91, lines: ['LA ETIQUETA', 'COINCIDE.'], teal: 1},
    {from: 59.91, to: 65.39, lines: ['EL FRÍO LO HACE LENTO.', 'NO LO DETIENE.'], teal: 1},
    {from: 65.39, to: 70.85, lines: ['DÍA 5 DE 10.', 'LAS CUENTAS NO MIENTEN.'], teal: 1},
  ],
  clips: [{src: 's2-clip4.mp4', from: 65.39, dur: 5.46}],
  hook: {from: 0, to: 9.32, splitAt: 6.21, coldLabel: 'FRÍO', warmLabel: 'CALOR'},
  chem: {from: 9.32, to: 19.92, chips: ['HIDRÓLISIS', 'DESAMIDACIÓN', 'OXIDACIÓN'], chipAt: [13.9, 15.2, 16.3]},
  rate: {
    from: 19.92,
    to: 32.03,
    stepAt: [21.0, 23.6, 26.0],
    tag: 'REGLA PRÁCTICA, NO LEY',
    tagAt: 28.2,
    sourceLabel: 'FUENTE VERIFICADA',
    source: 'Manning et al., Pharm Res 2010',
  },
  roomFridge: {from: 32.03, to: 49.13, roomLabel: 'AMBIENTE ~25 °C', fridgeLabel: 'REFRIGERADOR 2-8 °C', fridgeAt: 39.75, chip: 'VARIAS VECES MÁS LENTO', chipAt: 44.5},
  label: {
    from: 49.13,
    to: 59.91,
    title: 'ETIQUETA DE LA PLUMA OZEMPIC',
    line1: 'Pluma nueva: guardar en el refrigerador',
    line2: '2-8 °C · NO CONGELAR',
    sourceLabel: 'FUENTE VERIFICADA',
    source: 'Información de prescripción de Ozempic (Novo Nordisk, DailyMed)',
  },
  verdict: {from: 59.91, to: 65.39, line1: 'MÁS LENTO.', line2: 'NO DETENIDO.'},
  endFrom: 70.85,
  dayChip: {from: 70.85, label: 'DÍA 5 DE 10'},
  disclaimer: 'Herramienta educativa. No es consejo médico. Solo con fines de investigación.',
  durationSec: 76,
};
