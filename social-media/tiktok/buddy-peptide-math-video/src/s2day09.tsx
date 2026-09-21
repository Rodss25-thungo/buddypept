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
const CYAN = '#7fe6f2';
const PRODUCT_COLORS = [CYAN, TEAL, AMBER];

type ClipCfg = {src: string; from: number; dur: number};
type Span = {from: number; to: number};

type CardCfg = Span & {tag: string; line: string; ringText: string; ringDays: number; sourceLabel: string; source: string};

type S2Day9Config = {
  id: string;
  flag: 'us' | 'mx' | 'br';
  voFile: string;
  vialImg: string;
  cues: Cue[];
  clips: ClipCfg[];
  hook: Span & {labels: string[]};
  xbeat: Span & {chip: string; xAt: number};
  cards: CardCfg[];
  summary: Span & {items: {tag: string; text: string}[]};
  twin: Span & {tagA: string; tagB: string; chip: string; chipAt: number};
  orbit: Span & {chips: string[]};
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

const SourceChip: React.FC<{label: string; source: string; sp: number}> = ({label, source, sp}) => (
  <div style={{opacity: sp, transform: `translateY(${interpolate(sp, [0, 1], [30, 0])}px)`, display: 'flex', alignItems: 'center', gap: 18, background: 'rgba(10,18,24,0.92)', border: `3px solid ${TEAL}`, borderRadius: 999, padding: '14px 34px', maxWidth: 960}}>
    <div style={{width: 34, height: 34, borderRadius: 999, background: TEAL, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: anton.fontFamily, fontSize: 24, color: '#04262b', flexShrink: 0}}>{'✓'}</div>
    <div style={{fontFamily: anton.fontFamily, fontSize: 30, letterSpacing: 2, color: TEAL, flexShrink: 0}}>{label}</div>
    <div style={{fontFamily: archivo.fontFamily, fontWeight: 700, fontSize: 26, color: MUTED}}>{source}</div>
  </div>
);

const ClockFace: React.FC<{R: number; color: string; speed: number}> = ({R, color, speed}) => {
  const frame = useCurrentFrame();
  const a = 40 + frame * speed;
  return (
    <svg width={R * 2} height={R * 2}>
      <circle cx={R} cy={R} r={R - 5} fill="none" stroke={color} strokeWidth={Math.max(4, R * 0.03)} style={{filter: `drop-shadow(0 0 ${R * 0.08}px ${color})`}} />
      {Array.from({length: 12}).map((_, i) => {
        const t = (i / 12) * Math.PI * 2;
        return <line key={i} x1={R + Math.sin(t) * (R - 10)} y1={R - Math.cos(t) * (R - 10)} x2={R + Math.sin(t) * (R - 10 - R * 0.14)} y2={R - Math.cos(t) * (R - 10 - R * 0.14)} stroke={color} strokeWidth={i % 3 === 0 ? 5 : 2.5} />;
      })}
      <line x1={R} y1={R} x2={R + Math.sin((a * Math.PI) / 180) * R * 0.7} y2={R - Math.cos((a * Math.PI) / 180) * R * 0.7} stroke={color} strokeWidth={Math.max(4, R * 0.05)} strokeLinecap="round" />
      <circle cx={R} cy={R} r={Math.max(5, R * 0.07)} fill={color} />
    </svg>
  );
};

const Vial: React.FC<{h: number; img: string}> = ({h, img}) => (
  <Img src={staticFile(img)} style={{height: h, WebkitMaskImage: 'linear-gradient(to right, transparent 0%, black 14%, black 86%, transparent 100%)'}} />
);

const Coil: React.FC<{cx: number; cy: number; color: string; spin: number; scale?: number}> = ({cx, cy, color, spin, scale = 1}) => {
  const n = 10;
  const pts = Array.from({length: n}).map((_, i) => {
    const a = (i / n) * Math.PI * 2 * 1.3 + spin;
    const r = (40 + i * 7) * scale;
    return {x: cx + Math.cos(a) * r, y: cy + Math.sin(a) * r};
  });
  return (
    <g>
      <polyline points={pts.map((p) => `${p.x},${p.y}`).join(' ')} fill="none" stroke={color} strokeWidth={6 * scale} opacity={0.6} />
      {pts.map((p, i) => <circle key={i} cx={p.x} cy={p.y} r={17 * scale} fill={BG} stroke={color} strokeWidth={6 * scale} style={{filter: `drop-shadow(0 0 8px ${color})`}} />)}
    </g>
  );
};

// Beat 1: one amino-chain coil splits into three vials, each with its own clock speed.
const Hook: React.FC<{labels: string[]; img: string}> = ({labels, img}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const split = spring({frame: frame - 25, fps, config: {damping: 14, stiffness: 110}});
  const coilOp = interpolate(split, [0, 1], [1, 0]);
  const speeds = [0.4, 2.2, 6];
  return (
    <div style={{position: 'relative', width: 980, height: 820}}>
      <svg width={980} height={820} style={{position: 'absolute', left: 0, top: 0, opacity: coilOp}}>
        <Coil cx={490} cy={400} color={TEAL} spin={frame / 40} scale={1.7} />
      </svg>
      <div style={{position: 'absolute', left: 0, right: 0, top: 30, display: 'flex', justifyContent: 'center', gap: 60, opacity: split}}>
        {labels.map((l, i) => (
          <div key={i} style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, transform: `translateY(${interpolate(split, [0, 1], [120, 0])}px)`}}>
            <ClockFace R={95} color={PRODUCT_COLORS[i]} speed={speeds[i]} />
            <Vial h={430} img={img} />
            <div style={{fontFamily: anton.fontFamily, fontSize: 52, letterSpacing: 2, color: PRODUCT_COLORS[i]}}>{l}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Beat 2: "one shelf life?" gets an amber X.
const XBeat: React.FC<{chip: string; xAt: number}> = ({chip, xAt}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const s = spring({frame, fps, config: {damping: 13, stiffness: 150}});
  const x = spring({frame: frame - xAt, fps, config: {damping: 9, stiffness: 240}});
  return (
    <div style={{position: 'relative', opacity: s}}>
      <div style={{background: TEAL_DEEP, border: `5px solid ${TEAL}`, borderRadius: 30, padding: '40px 60px', fontFamily: anton.fontFamily, fontSize: 68, letterSpacing: 2, color: WHITE, textAlign: 'center', maxWidth: 900, boxShadow: '0 0 90px rgba(42,182,201,0.35)'}}>{chip}</div>
      <svg width={900} height={300} style={{position: 'absolute', left: -20, top: -60, opacity: x, transform: `scale(${interpolate(x, [0, 1], [1.8, 1])})`}}>
        <line x1={80} y1={40} x2={820} y2={260} stroke={AMBER} strokeWidth={26} strokeLinecap="round" />
        <line x1={820} y1={40} x2={80} y2={260} stroke={AMBER} strokeWidth={26} strokeLinecap="round" />
      </svg>
    </div>
  );
};

// Beats 3-5: one product card each, with a ring showing its rule.
const ProductCard: React.FC<{card: CardCfg; color: string; img: string}> = ({card, color, img}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const flip = spring({frame, fps, config: {damping: 14, stiffness: 120}});
  const ring = interpolate(frame, [12, 50], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const src = spring({frame: frame - 34, fps, config: {damping: 12, stiffness: 200}});
  const R = 130;
  const C = 2 * Math.PI * R;
  const frac = card.ringDays === 0 ? 0.04 : card.ringDays / 60;
  return (
    <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 34}}>
      <div style={{display: 'flex', alignItems: 'center', gap: 50, opacity: flip, transform: `perspective(1400px) rotateY(${interpolate(flip, [0, 1], [-60, 0])}deg)`}}>
        <Vial h={420} img={img} />
        <div style={{position: 'relative', width: 300, height: 300}}>
          <svg width={300} height={300}>
            <circle cx={150} cy={150} r={R} fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth={22} />
            <circle cx={150} cy={150} r={R} fill="none" stroke={color} strokeWidth={22} strokeLinecap="round" strokeDasharray={C} strokeDashoffset={C * (1 - frac * ring)} transform="rotate(-90 150 150)" style={{filter: `drop-shadow(0 0 14px ${color})`}} />
          </svg>
          <div style={{position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: anton.fontFamily, fontSize: card.ringText.length > 3 ? 64 : 110, color: WHITE}}>{card.ringText}</div>
        </div>
      </div>
      <div style={{opacity: flip, background: '#0a1218', border: `5px solid ${color}`, borderRadius: 30, padding: '24px 44px', textAlign: 'center', maxWidth: 940}}>
        <div style={{fontFamily: anton.fontFamily, fontSize: 40, letterSpacing: 4, color}}>{card.tag}</div>
        <div style={{fontFamily: anton.fontFamily, fontSize: 60, color: WHITE, marginTop: 6}}>{card.line}</div>
      </div>
      <SourceChip label={card.sourceLabel} source={card.source} sp={src} />
    </div>
  );
};

// Summary: A / B / C side by side.
const Summary: React.FC<{items: {tag: string; text: string}[]}> = ({items}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  return (
    <div style={{display: 'flex', gap: 34}}>
      {items.map((it, i) => {
        const s = spring({frame: frame - i * 8, fps, config: {damping: 12, stiffness: 170}});
        return (
          <div key={i} style={{opacity: s, transform: `translateY(${interpolate(s, [0, 1], [70, 0])}px)`, width: 300, background: '#0a1218', border: `5px solid ${PRODUCT_COLORS[i]}`, borderRadius: 28, padding: '30px 14px', textAlign: 'center'}}>
            <div style={{fontFamily: anton.fontFamily, fontSize: 36, letterSpacing: 3, color: PRODUCT_COLORS[i]}}>{it.tag}</div>
            <div style={{fontFamily: anton.fontFamily, fontSize: 74, color: WHITE, marginTop: 10}}>{it.text}</div>
          </div>
        );
      })}
    </div>
  );
};

// Beat 6: same molecule, two products, two times.
const Twin: React.FC<{tagA: string; tagB: string; chip: string; chipAt: number; img: string}> = ({tagA, tagB, chip, chipAt, img}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const s = spring({frame, fps, config: {damping: 13, stiffness: 150}});
  const c = spring({frame: frame - chipAt, fps, config: {damping: 11, stiffness: 220}});
  const col = (tag: string, color: string) => (
    <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20}}>
      <svg width={220} height={150}><Coil cx={110} cy={75} color={TEAL} spin={frame / 40} scale={0.85} /></svg>
      <Vial h={440} img={img} />
      <div style={{background: '#1a1206', border: `4px solid ${color}`, borderRadius: 999, padding: '10px 34px', fontFamily: anton.fontFamily, fontSize: 48, color}}>{tag}</div>
    </div>
  );
  return (
    <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 30, opacity: s}}>
      <div style={{display: 'flex', alignItems: 'center', gap: 60}}>
        {col(tagA, AMBER)}
        <div style={{fontFamily: anton.fontFamily, fontSize: 120, color: TEAL}}>=</div>
        {col(tagB, CYAN)}
      </div>
      <div style={{opacity: c, transform: `scale(${interpolate(c, [0, 1], [0.6, 1])})`, background: TEAL_DEEP, border: `4px solid ${TEAL}`, borderRadius: 999, padding: '14px 44px', fontFamily: anton.fontFamily, fontSize: 44, letterSpacing: 2, color: WHITE}}>{chip}</div>
    </div>
  );
};

// Beat 7a: formulation factors orbit a vial.
const Orbit: React.FC<{chips: string[]; img: string}> = ({chips, img}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const s = spring({frame, fps, config: {damping: 13, stiffness: 140}});
  return (
    <div style={{position: 'relative', width: 960, height: 760, opacity: s}}>
      <div style={{position: 'absolute', left: 0, right: 0, top: 140, display: 'flex', justifyContent: 'center'}}>
        <Vial h={500} img={img} />
      </div>
      {chips.map((t, i) => {
        const a = (i / chips.length) * Math.PI * 2 + frame / 45;
        const x = 480 + Math.cos(a) * 400;
        const y = 390 + Math.sin(a) * 330;
        return <div key={i} style={{position: 'absolute', left: x, top: y, transform: 'translate(-50%,-50%)', background: '#0a1218', border: `4px solid ${TEAL}`, borderRadius: 999, padding: '12px 30px', fontFamily: anton.fontFamily, fontSize: 40, letterSpacing: 2, color: TEAL, boxShadow: '0 0 30px rgba(42,182,201,0.4)'}}>{t}</div>;
      })}
    </div>
  );
};

const Verdict: React.FC<{line1: string; line2: string}> = ({line1, line2}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const s = spring({frame, fps, config: {damping: 11, stiffness: 190}});
  const l2 = spring({frame: frame - 20, fps, config: {damping: 11, stiffness: 190}});
  return (
    <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 30}}>
      <div style={{opacity: s, transform: `scale(${interpolate(s, [0, 1], [0.6, 1])})`, background: TEAL_DEEP, border: `5px solid ${TEAL}`, borderRadius: 30, padding: '30px 60px', fontFamily: anton.fontFamily, fontSize: 88, color: WHITE, textAlign: 'center', maxWidth: 980, boxShadow: '0 0 90px rgba(42,182,201,0.45)'}}>{line1}</div>
      <div style={{opacity: l2, transform: `scale(${interpolate(l2, [0, 1], [0.7, 1])})`, background: '#1a1206', border: `5px solid ${AMBER}`, borderRadius: 30, padding: '20px 50px', fontFamily: archivo.fontFamily, fontWeight: 700, fontSize: 44, color: AMBER, textAlign: 'center', maxWidth: 940}}>{line2}</div>
    </div>
  );
};

export const S2Day9: React.FC<{locale: S2Day9Config}> = ({locale}) => {
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
        <AbsoluteFill style={{alignItems: 'center', paddingTop: 590}}>
          <Hook labels={L.hook.labels} img={L.vialImg} />
        </AbsoluteFill>
      </Sequence>

      <Sequence {...span(L.xbeat)}>
        <AbsoluteFill style={{alignItems: 'center', paddingTop: 820}}>
          <XBeat chip={L.xbeat.chip} xAt={rel(L.xbeat.xAt, L.xbeat)} />
        </AbsoluteFill>
      </Sequence>

      {L.cards.map((c, i) => (
        <Sequence key={i} {...span(c)}>
          <AbsoluteFill style={{alignItems: 'center', paddingTop: 640}}>
            <ProductCard card={c} color={PRODUCT_COLORS[i]} img={L.vialImg} />
          </AbsoluteFill>
        </Sequence>
      ))}

      <Sequence {...span(L.summary)}>
        <AbsoluteFill style={{alignItems: 'center', paddingTop: 800}}>
          <Summary items={L.summary.items} />
        </AbsoluteFill>
      </Sequence>

      <Sequence {...span(L.twin)}>
        <AbsoluteFill style={{alignItems: 'center', paddingTop: 590}}>
          <Twin tagA={L.twin.tagA} tagB={L.twin.tagB} chip={L.twin.chip} chipAt={rel(L.twin.chipAt, L.twin)} img={L.vialImg} />
        </AbsoluteFill>
      </Sequence>

      <Sequence {...span(L.orbit)}>
        <AbsoluteFill style={{alignItems: 'center', paddingTop: 620}}>
          <Orbit chips={L.orbit.chips} img={L.vialImg} />
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
            <div style={{border: `3px solid ${TEAL}`, borderRadius: 999, padding: '18px 48px', fontFamily: anton.fontFamily, fontSize: 54, color: TEAL, letterSpacing: 2, opacity: interpolate(frame, [sec(L.dayChip.from), sec(L.dayChip.from + 0.5)], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})}}>{L.dayChip.label}</div>
            <Buddy size={440} />
            <Logo />
            <div style={{background: TEAL_DEEP, borderRadius: 999, padding: '28px 66px', fontFamily: archivo.fontFamily, fontWeight: 700, fontSize: 56, color: WHITE, opacity: interpolate(frame, [sec(L.endFrom + 0.4), sec(L.endFrom + 1)], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})}}>buddypept.com</div>
            <div style={{fontFamily: archivo.fontFamily, fontSize: 30, color: '#5d7078', opacity: interpolate(frame, [sec(L.endFrom + 1.4), sec(L.endFrom + 2)], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})}}>{L.disclaimer}</div>
          </AbsoluteFill>
        </AbsoluteFill>
      </Sequence>
    </AbsoluteFill>
  );
};

export const S2DAY9_EN: S2Day9Config = {
  id: 'S2Day9EN',
  flag: 'us',
  voFile: 's2-d9-vo-en.mp3',
  vialImg: 'vial-liquid-peptide-en.png',
  cues: [
    {from: 0.05, to: 2.53, lines: ['SAME AMINO-CHAIN,', 'SAME PEPTIDE.'], teal: 1},
    {from: 2.53, to: 3.62, lines: ['DIFFERENT', 'RULES.']},
    {from: 3.62, to: 8.1, lines: ['ONE PEPTIDE,', 'ONE SHELF LIFE? NO.']},
    {from: 8.1, to: 12.66, lines: ['THE RULES BELONG', 'TO THE PRODUCT.'], teal: 1},
    {from: 12.66, to: 19.38, lines: ['THREE REAL LABELS.', 'PRODUCT A: NOW.']},
    {from: 19.38, to: 23.61, lines: ['PRODUCT B:', '28 DAYS.'], teal: 1},
    {from: 23.61, to: 27.0, lines: ['PRODUCT C:', '56 DAYS.']},
    {from: 27.0, to: 30.68, lines: ['DIFFERENT PRODUCTS,', 'DIFFERENT RULES.'], teal: 1},
    {from: 30.68, to: 37.05, lines: ['EVEN THE SAME', 'MOLECULE DIFFERS.']},
    {from: 37.05, to: 42.73, lines: ['THE FORMULATION', 'DECIDES.'], teal: 1},
    {from: 42.73, to: 46.96, lines: ['A NUMBER YOU HEARD', 'IS NOT YOUR VIAL’S RULE.']},
    {from: 46.96, to: 49.92, lines: ['THE LABEL', 'WINS.'], teal: 1},
    {from: 49.92, to: 53.2, lines: ['DAY 9 OF 10.', 'THE MATH DOESN’T LIE.'], teal: 1},
  ],
  clips: [{src: 's2-clip4.mp4', from: 49.92, dur: 3.27}],
  hook: {from: 0.0, to: 3.62, labels: ['A', 'B', 'C']},
  xbeat: {from: 3.62, to: 12.66, chip: 'ONE MOLECULE, ONE NUMBER?', xAt: 7.22},
  cards: [
    {from: 12.66, to: 19.38, tag: 'PRODUCT A', line: 'USE IMMEDIATELY AFTER MIXING', ringText: 'NOW', ringDays: 0, sourceLabel: 'SOURCE VERIFIED', source: 'Glucagon for Injection label (DailyMed)'},
    {from: 19.38, to: 23.61, tag: 'PRODUCT B', line: 'DISCARD 28 DAYS AFTER FIRST USE', ringText: '28', ringDays: 28, sourceLabel: 'SOURCE VERIFIED', source: 'Forteo prescribing information (Lilly, DailyMed)'},
    {from: 23.61, to: 27.0, tag: 'PRODUCT C', line: '56 DAYS AFTER FIRST USE', ringText: '56', ringDays: 56, sourceLabel: 'SOURCE VERIFIED', source: 'Ozempic prescribing information (Novo Nordisk, DailyMed)'},
  ],
  summary: {from: 27.0, to: 30.68, items: [{tag: 'PRODUCT A', text: 'NOW'}, {tag: 'PRODUCT B', text: '28 D'}, {tag: 'PRODUCT C', text: '56 D'}]},
  twin: {from: 30.68, to: 37.05, tagA: '56 DAYS', tagB: '28 DAYS', chip: 'SAME MOLECULE, DIFFERENT PRODUCTS', chipAt: 33.42},
  orbit: {from: 37.05, to: 42.73, chips: ['WATER', 'PRESERVATIVE', 'CONTAINER', 'pH']},
  verdict: {from: 42.73, to: 49.92, line1: 'THE EXACT PRODUCT WINS.', line2: 'the published label decides, not a number you heard'},
  endFrom: 53.2,
  dayChip: {from: 53.2, label: 'DAY 9 OF 10'},
  disclaimer: 'Educational tool. Not medical advice. For research purposes only.',
  durationSec: 59,
};

export const S2DAY9_PT: S2Day9Config = {
  id: 'S2Day9PT',
  flag: 'br',
  voFile: 's2-d9-vo-pt.mp3',
  vialImg: 'vial-liquid-peptide-pt.png',
  cues: [
    {from: 0.05, to: 3.08, lines: ['MESMA CADEIA,', 'MESMO PEPTÍDEO.'], teal: 1},
    {from: 3.08, to: 4.6, lines: ['REGRAS', 'DIFERENTES.']},
    {from: 4.6, to: 9.45, lines: ['UM PEPTÍDEO,', 'UM PRAZO? NÃO.']},
    {from: 9.45, to: 13.72, lines: ['AS REGRAS PERTENCEM', 'AO PRODUTO.'], teal: 1},
    {from: 13.72, to: 20.31, lines: ['TRÊS RÓTULOS REAIS.', 'PRODUTO A: AGORA.']},
    {from: 20.31, to: 25.32, lines: ['PRODUTO B:', '28 DIAS.'], teal: 1},
    {from: 25.32, to: 29.21, lines: ['PRODUTO C:', '56 DIAS.']},
    {from: 29.21, to: 33.25, lines: ['PRODUTOS DIFERENTES,', 'REGRAS DIFERENTES.'], teal: 1},
    {from: 33.25, to: 40.01, lines: ['ATÉ A MESMA', 'MOLÉCULA DIFERE.']},
    {from: 40.01, to: 44.39, lines: ['A FORMULAÇÃO', 'DECIDE.'], teal: 1},
    {from: 44.39, to: 49.29, lines: ['NÚMERO OUVIDO NÃO É', 'REGRA DO SEU FRASCO.']},
    {from: 49.29, to: 52.14, lines: ['O RÓTULO', 'VENCE.'], teal: 1},
    {from: 52.14, to: 55.93, lines: ['DIA 9 DE 10.', 'A MATEMÁTICA NÃO MENTE.'], teal: 1},
  ],
  clips: [{src: 's2-clip4.mp4', from: 52.14, dur: 3.79}],
  hook: {from: 0, to: 4.6, labels: ['A', 'B', 'C']},
  xbeat: {from: 4.6, to: 13.72, chip: 'UMA MOLÉCULA, UM NÚMERO?', xAt: 8.6},
  cards: [
    {from: 13.72, to: 20.31, tag: 'PRODUTO A', line: 'USE IMEDIATAMENTE APÓS MISTURAR', ringText: 'AGORA', ringDays: 0, sourceLabel: 'FONTE VERIFICADA', source: 'Rótulo do Glucagon para Injeção (DailyMed)'},
    {from: 20.31, to: 25.32, tag: 'PRODUTO B', line: 'DESCARTE 28 DIAS APÓS 1º USO', ringText: '28', ringDays: 28, sourceLabel: 'FONTE VERIFICADA', source: 'Bula do Forteo (Lilly, DailyMed)'},
    {from: 25.32, to: 29.21, tag: 'PRODUTO C', line: '56 DIAS APÓS O PRIMEIRO USO', ringText: '56', ringDays: 56, sourceLabel: 'FONTE VERIFICADA', source: 'Bula do Ozempic (Novo Nordisk, DailyMed)'},
  ],
  summary: {from: 29.21, to: 33.25, items: [{tag: 'PRODUTO A', text: 'AGORA'}, {tag: 'PRODUTO B', text: '28 D'}, {tag: 'PRODUTO C', text: '56 D'}]},
  twin: {from: 33.25, to: 40.01, tagA: '56 DIAS', tagB: '28 DIAS', chip: 'MESMA MOLÉCULA, PRODUTOS DIFERENTES', chipAt: 36.2},
  orbit: {from: 40.01, to: 44.39, chips: ['ÁGUA', 'CONSERVANTE', 'RECIPIENTE', 'pH']},
  verdict: {from: 44.39, to: 52.14, line1: 'O PRODUTO EXATO VENCE.', line2: 'o rótulo publicado decide, não um número que você ouviu'},
  endFrom: 55.93,
  dayChip: {from: 55.93, label: 'DIA 9 DE 10'},
  disclaimer: 'Ferramenta educacional. Não é orientação médica. Somente para fins de pesquisa.',
  durationSec: 62,
};

export const S2DAY9_ES: S2Day9Config = {
  id: 'S2Day9ES',
  flag: 'mx',
  voFile: 's2-d9-vo-es.mp3',
  vialImg: 'vial-liquid-peptide-es.png',
  cues: [
    {from: 0.05, to: 3.83, lines: ['MISMA CADENA,', 'MISMO PÉPTIDO.'], teal: 1},
    {from: 3.83, to: 5.95, lines: ['REGLAS', 'DIFERENTES.']},
    {from: 5.95, to: 11.77, lines: ['UN PÉPTIDO,', '¿UNA VIDA ÚTIL? NO.']},
    {from: 11.77, to: 17.17, lines: ['LAS REGLAS PERTENECEN', 'AL PRODUCTO.'], teal: 1},
    {from: 17.17, to: 25.59, lines: ['TRES ETIQUETAS REALES.', 'PRODUCTO A: YA.']},
    {from: 25.59, to: 31.18, lines: ['PRODUCTO B:', '28 DÍAS.'], teal: 1},
    {from: 31.18, to: 36.0, lines: ['PRODUCTO C:', '56 DÍAS.']},
    {from: 36.0, to: 41.25, lines: ['PRODUCTOS DIFERENTES,', 'REGLAS DIFERENTES.'], teal: 1},
    {from: 41.25, to: 48.72, lines: ['HASTA LA MISMA', 'MOLÉCULA DIFIERE.']},
    {from: 48.72, to: 54.84, lines: ['LA FORMULACIÓN', 'DECIDE.'], teal: 1},
    {from: 54.84, to: 60.3, lines: ['UN NÚMERO OÍDO NO ES', 'LA REGLA DE TU VIAL.']},
    {from: 60.3, to: 63.93, lines: ['LA ETIQUETA', 'GANA.'], teal: 1},
    {from: 63.93, to: 69.14, lines: ['DÍA 9 DE 10.', 'LAS CUENTAS NO MIENTEN.'], teal: 1},
  ],
  clips: [{src: 's2-clip4.mp4', from: 63.93, dur: 5.21}],
  hook: {from: 0, to: 5.95, labels: ['A', 'B', 'C']},
  xbeat: {from: 5.95, to: 17.17, chip: '¿UNA MOLÉCULA, UN NÚMERO?', xAt: 10.6},
  cards: [
    {from: 17.17, to: 25.59, tag: 'PRODUCTO A', line: 'USAR AL INSTANTE TRAS MEZCLAR', ringText: 'YA', ringDays: 0, sourceLabel: 'FUENTE VERIFICADA', source: 'Etiqueta de Glucagón para Inyección (DailyMed)'},
    {from: 25.59, to: 31.18, tag: 'PRODUCTO B', line: 'DESECHAR 28 DÍAS TRAS EL 1.º USO', ringText: '28', ringDays: 28, sourceLabel: 'FUENTE VERIFICADA', source: 'Prescripción de Forteo (Lilly, DailyMed)'},
    {from: 31.18, to: 36.0, tag: 'PRODUCTO C', line: '56 DÍAS TRAS EL PRIMER USO', ringText: '56', ringDays: 56, sourceLabel: 'FUENTE VERIFICADA', source: 'Prescripción de Ozempic (Novo Nordisk, DailyMed)'},
  ],
  summary: {from: 36.0, to: 41.25, items: [{tag: 'PRODUCTO A', text: 'YA'}, {tag: 'PRODUCTO B', text: '28 D'}, {tag: 'PRODUCTO C', text: '56 D'}]},
  twin: {from: 41.25, to: 48.72, tagA: '56 DÍAS', tagB: '28 DÍAS', chip: 'MISMA MOLÉCULA, PRODUCTOS DISTINTOS', chipAt: 44.6},
  orbit: {from: 48.72, to: 54.84, chips: ['AGUA', 'CONSERVADOR', 'ENVASE', 'pH']},
  verdict: {from: 54.84, to: 63.93, line1: 'EL PRODUCTO EXACTO GANA.', line2: 'la etiqueta publicada decide, no un número que oíste'},
  endFrom: 69.14,
  dayChip: {from: 69.14, label: 'DÍA 9 DE 10'},
  disclaimer: 'Herramienta educativa. No es consejo médico. Solo con fines de investigación.',
  durationSec: 75,
};
