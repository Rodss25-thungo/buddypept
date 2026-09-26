import React from 'react';
import {AbsoluteFill, Audio, Img, interpolate, OffthreadVideo, Sequence, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {loadFont as loadAnton} from '@remotion/google-fonts/Anton';
import {loadFont as loadArchivo} from '@remotion/google-fonts/Archivo';
import type {Cue} from './locales';
import {BG, Buddy, Caption, FPS, Flag, Glow, Logo, MUTED, TEAL, TEAL_DEEP, WHITE} from './Video';
import {AMBER, Pill, SourceChip} from './s3ep01';

const anton = loadAnton();
const archivo = loadArchivo();

type ClipCfg = {src: string; from: number; dur: number};
type Span = {from: number; to: number};

type S3Ep2Config = {
  id: string;
  flag: 'us' | 'mx' | 'br';
  voFile: string;
  vialImg: string;
  cues: Cue[];
  clips: ClipCfg[];
  hook: Span & {title: string; pct: string; example: string; q: string; qAt: number};
  peaks: Span & {targetAt: number; otherAt: number; target: string; other: string};
  frac: Span & {num: string; den: string; pct: string; example: string};
  sig: Span & {weight: string; signal: string; signalAt: number};
  trp: Span & {barAt: number; bond: string; trp: string; ratio: string; wave: string; sourceLabel: string; source: string};
  two: Span & {q1: string; a1: string; q2: string; a2: string; q2At: number; verdict: string; verdictAt: number};
  endFrom: number;
  seriesChip: string;
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

const GREY = '#6b7f88';
const BASE = 420;
const PEAKS: {c: number; h: number; w: number; tall: boolean}[] = [
  {c: 150, h: 50, w: 22, tall: false},
  {c: 270, h: 95, w: 20, tall: false},
  {c: 390, h: 45, w: 20, tall: false},
  {c: 560, h: 340, w: 34, tall: true},
  {c: 730, h: 75, w: 24, tall: false},
  {c: 850, h: 40, w: 20, tall: false},
];
const yAt = (x: number) => BASE - PEAKS.reduce((s, p) => s + p.h * Math.exp(-(((x - p.c) / p.w) ** 2)), 0);

// Detector trace. progress 0..1 sweeps left to right; fill shades the areas under the peaks.
const Chrom: React.FC<{progress: number; fill: boolean; showLabels?: {target: string; other: string; t: number; o: number}}> = ({progress, fill, showLabels}) => {
  const maxX = 40 + progress * 900;
  const pts: string[] = [];
  for (let x = 40; x <= maxX; x += 4) pts.push(`${x},${yAt(x)}`);
  const areaPath = (p: (typeof PEAKS)[number]) => {
    const x0 = p.c - p.w * 2.4;
    const x1 = p.c + p.w * 2.4;
    const q: string[] = [`M ${x0} ${BASE}`];
    for (let x = x0; x <= x1; x += 3) q.push(`L ${x} ${yAt(x)}`);
    q.push(`L ${x1} ${BASE} Z`);
    return q.join(' ');
  };
  return (
    <svg width={980} height={520}>
      <line x1={40} y1={BASE} x2={940} y2={BASE} stroke={MUTED} strokeWidth={3} opacity={0.6} />
      {fill
        ? PEAKS.map((p, i) => (
            <path key={i} d={areaPath(p)} fill={p.tall ? TEAL : GREY} opacity={p.tall ? 0.55 : 0.45} />
          ))
        : null}
      <polyline points={pts.join(' ')} fill="none" stroke={TEAL} strokeWidth={6} strokeLinejoin="round" style={{filter: 'drop-shadow(0 0 8px rgba(42,182,201,0.7))'}} />
      {showLabels ? (
        <g>
          <text x={560} y={70} textAnchor="middle" fontFamily={anton.fontFamily} fontSize={44} letterSpacing={2} fill={TEAL} opacity={showLabels.t}>
            {showLabels.target}
          </text>
          <text x={270} y={BASE + 60} textAnchor="middle" fontFamily={anton.fontFamily} fontSize={36} letterSpacing={2} fill={GREY} opacity={showLabels.o}>
            {showLabels.other}
          </text>
          <text x={790} y={BASE + 60} textAnchor="middle" fontFamily={anton.fontFamily} fontSize={36} letterSpacing={2} fill={GREY} opacity={showLabels.o}>
            {showLabels.other}
          </text>
        </g>
      ) : null}
    </svg>
  );
};

// Beat 1: a report says 98% pure.
const Hook: React.FC<{title: string; pct: string; example: string; q: string; qAt: number; img: string}> = ({title, pct, example, q, qAt, img}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const s = spring({frame, fps, config: {damping: 13, stiffness: 140}});
  const c = spring({frame: frame - 14, fps, config: {damping: 12, stiffness: 180}});
  const qq = spring({frame: frame - qAt, fps, config: {damping: 11, stiffness: 220}});
  return (
    <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 34, opacity: s}}>
      <Img src={staticFile(img)} style={{height: 420, WebkitMaskImage: 'linear-gradient(to right, transparent 0%, black 14%, black 86%, transparent 100%)'}} />
      <div style={{opacity: c, transform: `scale(${interpolate(c, [0, 1], [0.8, 1])})`, background: '#0a1218', border: `4px solid ${TEAL}`, borderRadius: 28, padding: '20px 60px', textAlign: 'center', position: 'relative'}}>
        <div style={{fontFamily: archivo.fontFamily, fontWeight: 800, fontSize: 32, letterSpacing: 4, color: MUTED}}>{title}</div>
        <div style={{fontFamily: anton.fontFamily, fontSize: 150, color: WHITE, lineHeight: 1.05}}>{pct}</div>
        <div style={{position: 'absolute', top: -50, right: 10, background: AMBER, color: '#1a1206', fontFamily: anton.fontFamily, fontSize: 28, letterSpacing: 3, padding: '6px 20px', borderRadius: 999}}>{example}</div>
      </div>
      <div style={{opacity: qq, transform: `scale(${interpolate(qq, [0, 1], [0.6, 1])})`}}>
        <Pill text={q} color={AMBER} sp={1} bg="#1a1206" />
      </div>
    </div>
  );
};

const Peaks: React.FC<{drawTo: number; targetAt: number; otherAt: number; target: string; other: string}> = ({drawTo, targetAt, otherAt, target, other}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const s = spring({frame, fps, config: {damping: 13, stiffness: 140}});
  const progress = interpolate(frame, [6, drawTo], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const t = interpolate(frame, [targetAt, targetAt + 10], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const o = interpolate(frame, [otherAt, otherAt + 10], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return (
    <div style={{opacity: s}}>
      <Chrom progress={progress} fill={false} showLabels={{target, other, t, o}} />
    </div>
  );
};

const Frac: React.FC<{num: string; den: string; pct: string; example: string}> = ({num, den, pct, example}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const fillOn = interpolate(frame, [4, 24], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const f = spring({frame: frame - 40, fps, config: {damping: 12, stiffness: 170}});
  return (
    <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10}}>
      <div style={{opacity: fillOn}}>
        <Chrom progress={1} fill />
      </div>
      <div style={{opacity: f, transform: `translateY(${interpolate(f, [0, 1], [30, 0])}px)`, display: 'flex', alignItems: 'center', gap: 34, background: '#0a1218', border: `4px solid ${TEAL}`, borderRadius: 28, padding: '18px 44px', position: 'relative'}}>
        <div style={{textAlign: 'center'}}>
          <div style={{fontFamily: anton.fontFamily, fontSize: 40, letterSpacing: 2, color: TEAL}}>{num}</div>
          <div style={{height: 4, background: WHITE, margin: '6px 0'}} />
          <div style={{fontFamily: anton.fontFamily, fontSize: 40, letterSpacing: 2, color: GREY}}>{den}</div>
        </div>
        <div style={{fontFamily: anton.fontFamily, fontSize: 96, color: WHITE}}>{pct}</div>
        <div style={{position: 'absolute', top: -20, right: -12, background: AMBER, color: '#1a1206', fontFamily: anton.fontFamily, fontSize: 26, letterSpacing: 3, padding: '5px 18px', borderRadius: 999}}>{example}</div>
      </div>
    </div>
  );
};

// Beat 4: a peak is a signal, not a weight.
const Sig: React.FC<{weight: string; signal: string; signalAt: number}> = ({weight, signal, signalAt}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const a = spring({frame, fps, config: {damping: 12, stiffness: 190}});
  const strike = interpolate(frame, [18, 34], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const b = spring({frame: frame - signalAt, fps, config: {damping: 11, stiffness: 200}});
  return (
    <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 44}}>
      <div style={{position: 'relative', opacity: a, transform: `scale(${interpolate(a, [0, 1], [0.6, 1])})`, background: '#1a1206', border: `5px solid ${AMBER}`, borderRadius: 30, padding: '22px 80px', fontFamily: anton.fontFamily, fontSize: 96, color: AMBER}}>
        {weight}
        <div style={{position: 'absolute', left: 30, top: '52%', height: 8, width: `${strike * 90}%`, background: WHITE, borderRadius: 4}} />
      </div>
      <div style={{opacity: b, transform: `scale(${interpolate(b, [0, 1], [0.6, 1])})`, background: TEAL_DEEP, border: `5px solid ${TEAL}`, borderRadius: 30, padding: '26px 80px', fontFamily: anton.fontFamily, fontSize: 110, color: WHITE, boxShadow: '0 0 80px rgba(42,182,201,0.45)'}}>{signal}</div>
    </div>
  );
};

// Beat 5: same weight, very different peak height (about 30x, per the cited study).
const TrpScene: React.FC<{barAt: number; bond: string; trp: string; ratio: string; wave: string; sourceLabel: string; source: string}> = ({barAt, bond, trp, ratio, wave, sourceLabel, source}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const s = spring({frame, fps, config: {damping: 13, stiffness: 140}});
  const grow = interpolate(frame, [barAt, barAt + 30], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const rp = spring({frame: frame - (barAt + 30), fps, config: {damping: 11, stiffness: 220}});
  const src = spring({frame: frame - 12, fps, config: {damping: 12, stiffness: 200}});
  const bars = [
    {x: 250, label: bond, color: TEAL, h: 12},
    {x: 730, label: trp, color: AMBER, h: 360},
  ];
  return (
    <div style={{position: 'relative', width: 980, height: 860, opacity: s}}>
      <svg width={980} height={760} style={{position: 'absolute', left: 0, top: 0}}>
        {bars.map((b) => (
          <g key={b.label}>
            <circle cx={b.x} cy={90} r={52} fill={BG} stroke={b.color} strokeWidth={8} style={{filter: `drop-shadow(0 0 14px ${b.color})`}} />
            <text x={b.x} y={190} textAnchor="middle" fontFamily={anton.fontFamily} fontSize={38} letterSpacing={2} fill={b.color}>{b.label}</text>
            <rect x={b.x - 60} y={700 - b.h * grow} width={120} height={b.h * grow} rx={8} fill={b.color} opacity={0.85} />
          </g>
        ))}
        <line x1={60} y1={700} x2={920} y2={700} stroke={MUTED} strokeWidth={3} opacity={0.6} />
        <text x={490} y={745} textAnchor="middle" fontFamily={archivo.fontFamily} fontWeight={700} fontSize={28} fill={MUTED}>{wave}</text>
      </svg>
      <div style={{position: 'absolute', left: 560, top: 250, opacity: rp, transform: `scale(${interpolate(rp, [0, 1], [0.6, 1])})`}}>
        <Pill text={ratio} color={AMBER} sp={1} bg="#1a1206" />
      </div>
      <div style={{position: 'absolute', left: 0, right: 0, bottom: 0, display: 'flex', justifyContent: 'center'}}>
        <SourceChip label={sourceLabel} source={source} sp={src} />
      </div>
    </div>
  );
};

const Card: React.FC<{sp: number; q: string; tag: string; color: string; bg: string; mark: string}> = ({sp, q, tag, color, bg, mark}) => (
  <div style={{opacity: sp, transform: `translateY(${interpolate(sp, [0, 1], [40, 0])}px)`, width: 940, background: bg, border: `5px solid ${color}`, borderRadius: 30, padding: '26px 40px', textAlign: 'center'}}>
    <div style={{fontFamily: anton.fontFamily, fontSize: 60, color: WHITE, letterSpacing: 1}}>{q}</div>
    <div style={{marginTop: 12, fontFamily: archivo.fontFamily, fontWeight: 800, fontSize: 32, letterSpacing: 2, color}}>{mark} {tag}</div>
  </div>
);

// Beat 6: two different questions.
const Two: React.FC<{q1: string; a1: string; q2: string; a2: string; q2At: number; verdict: string; verdictAt: number}> = ({q1, a1, q2, a2, q2At, verdict, verdictAt}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const a = spring({frame, fps, config: {damping: 12, stiffness: 160}});
  const b = spring({frame: frame - q2At, fps, config: {damping: 12, stiffness: 160}});
  const v = spring({frame: frame - verdictAt, fps, config: {damping: 11, stiffness: 200}});
  return (
    <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 34}}>
      <Card sp={a} q={q1} tag={a1} color={TEAL} bg={TEAL_DEEP} mark={'✓'} />
      <Card sp={b} q={q2} tag={a2} color={AMBER} bg="#1a1206" mark={'?'} />
      <div style={{opacity: v, transform: `scale(${interpolate(v, [0, 1], [0.6, 1])})`}}>
        <Pill text={verdict} color={TEAL} sp={1} bg="#0a1218" />
      </div>
    </div>
  );
};

export const S3Ep2: React.FC<{locale: S3Ep2Config}> = ({locale}) => {
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
        <AbsoluteFill style={{alignItems: 'center', paddingTop: 520}}>
          <Hook title={L.hook.title} pct={L.hook.pct} example={L.hook.example} q={L.hook.q} qAt={rel(L.hook.qAt, L.hook)} img={L.vialImg} />
        </AbsoluteFill>
      </Sequence>

      <Sequence {...span(L.peaks)}>
        <AbsoluteFill style={{alignItems: 'center', paddingTop: 700}}>
          <Peaks drawTo={rel(L.peaks.from + 3.4, L.peaks)} targetAt={rel(L.peaks.targetAt, L.peaks)} otherAt={rel(L.peaks.otherAt, L.peaks)} target={L.peaks.target} other={L.peaks.other} />
        </AbsoluteFill>
      </Sequence>

      <Sequence {...span(L.frac)}>
        <AbsoluteFill style={{alignItems: 'center', paddingTop: 640}}>
          <Frac num={L.frac.num} den={L.frac.den} pct={L.frac.pct} example={L.frac.example} />
        </AbsoluteFill>
      </Sequence>

      <Sequence {...span(L.sig)}>
        <AbsoluteFill style={{alignItems: 'center', paddingTop: 780}}>
          <Sig weight={L.sig.weight} signal={L.sig.signal} signalAt={rel(L.sig.signalAt, L.sig)} />
        </AbsoluteFill>
      </Sequence>

      <Sequence {...span(L.trp)}>
        <AbsoluteFill style={{alignItems: 'center', paddingTop: 560}}>
          <TrpScene barAt={rel(L.trp.barAt, L.trp)} bond={L.trp.bond} trp={L.trp.trp} ratio={L.trp.ratio} wave={L.trp.wave} sourceLabel={L.trp.sourceLabel} source={L.trp.source} />
        </AbsoluteFill>
      </Sequence>

      <Sequence {...span(L.two)}>
        <AbsoluteFill style={{alignItems: 'center', paddingTop: 700}}>
          <Two q1={L.two.q1} a1={L.two.a1} q2={L.two.q2} a2={L.two.a2} q2At={rel(L.two.q2At, L.two)} verdict={L.two.verdict} verdictAt={rel(L.two.verdictAt, L.two)} />
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
            <div style={{background: TEAL_DEEP, borderRadius: 999, padding: '18px 52px', fontFamily: anton.fontFamily, fontSize: 50, color: WHITE, letterSpacing: 3, opacity: interpolate(frame, [sec(L.endFrom), sec(L.endFrom + 0.5)], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})}}>{L.seriesChip}</div>
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

export const S3EP2_EN: S3Ep2Config = {
  id: 'S3Ep2EN',
  flag: 'us',
  voFile: 's3-e02-vo-en.mp3',
  vialImg: 'vial-liquid-peptide-en.png',
  cues: [
    {from: 0.05, to: 5.4, lines: ['SAY AN AMINO-CHAIN', 'IS 98% PURE.'], teal: 1},
    {from: 5.4, to: 6.73, lines: ['98% OF', 'WHAT?']},
    {from: 6.73, to: 10.46, lines: ['A DETECTOR', 'DRAWS PEAKS.'], teal: 1},
    {from: 10.46, to: 12.76, lines: ['ONE TALL PEAK:', 'THE TARGET.']},
    {from: 12.76, to: 15.17, lines: ['SMALL PEAKS:', 'EVERYTHING ELSE.'], teal: 1},
    {from: 15.17, to: 20.05, lines: ['PURITY = TALL PEAK', 'OVER ALL PEAKS.']},
    {from: 20.05, to: 22.51, lines: ['A PEAK IS A SIGNAL,', 'NOT A WEIGHT.'], teal: 1},
    {from: 22.51, to: 25.18, lines: ['PIECES ABSORB', 'LIGHT DIFFERENTLY.']},
    {from: 25.18, to: 32.32, lines: ['SAME WEIGHT.', 'DIFFERENT PEAK.'], teal: 1},
    {from: 32.32, to: 34.15, lines: ['AREA IS', 'NOT MASS.']},
    {from: 34.15, to: 36.69, lines: ['HOW CLEAN IS', 'THE SIGNAL?'], teal: 1},
    {from: 36.69, to: 39.28, lines: ['HOW MUCH OF THE', 'VIAL IS CHAIN?']},
    {from: 39.28, to: 41.07, lines: ['TWO DIFFERENT', 'QUESTIONS.'], teal: 1},
    {from: 41.07, to: 44.4, lines: ['FOLLOW FOR MORE', 'PEPTIDE MATH.'], teal: 1},
  ],
  clips: [{src: 's2-clip4.mp4', from: 41.07, dur: 3.3}],
  hook: {from: 0, to: 6.73, title: 'PURITY REPORT', pct: '98%', example: 'EXAMPLE', q: '98% OF WHAT?', qAt: 5.4},
  peaks: {from: 6.73, to: 15.17, targetAt: 10.46, otherAt: 12.76, target: 'TARGET', other: 'OTHER'},
  frac: {from: 15.17, to: 20.05, num: 'TALL PEAK AREA', den: 'ALL PEAKS AREA', pct: '= 98%', example: 'EXAMPLE'},
  sig: {from: 20.05, to: 25.18, weight: 'WEIGHT', signal: 'SIGNAL', signalAt: 21.6},
  trp: {from: 25.18, to: 34.15, barAt: 27.2, bond: 'PEPTIDE BOND', trp: 'TRP', ratio: 'ABOUT 30X', wave: 'ABSORBANCE AT 214 NM', sourceLabel: 'SOURCE VERIFIED', source: 'Kuipers & Gruppen, J Agric Food Chem 2007'},
  two: {from: 34.15, to: 41.07, q1: 'HOW CLEAN IS THE SIGNAL?', a1: 'PURITY ANSWERS THIS', q2: 'HOW MUCH OF THE VIAL IS CHAIN?', a2: 'PURITY DOES NOT', q2At: 36.69, verdict: 'TWO DIFFERENT QUESTIONS', verdictAt: 39.28},
  endFrom: 41.07,
  seriesChip: 'INSIDE THE VIAL',
  disclaimer: 'Educational tool. Not medical advice. For research purposes only.',
  durationSec: 47,
};

export const S3EP2_PT: S3Ep2Config = {
  id: 'S3Ep2PT',
  flag: 'br',
  voFile: 's3-e02-vo-pt.mp3',
  vialImg: 'vial-liquid-peptide-pt.png',
  cues: [
    {from: 0.05, to: 6.42, lines: ['DIGAMOS: UMA CADEIA', 'COM 98% DE PUREZA.'], teal: 1},
    {from: 6.42, to: 8.31, lines: ['98% DE QUÊ?']},
    {from: 8.31, to: 12.22, lines: ['UM DETECTOR', 'DESENHA PICOS.'], teal: 1},
    {from: 12.22, to: 14.24, lines: ['UM PICO ALTO:', 'A CADEIA ALVO.']},
    {from: 14.24, to: 17.05, lines: ['PICOS PEQUENOS:', 'O RESTO.'], teal: 1},
    {from: 17.05, to: 21.09, lines: ['PUREZA = PICO ALTO', 'SOBRE TODOS OS PICOS.']},
    {from: 21.09, to: 23.43, lines: ['PICO É SINAL,', 'NÃO PESO.'], teal: 1},
    {from: 23.43, to: 26.82, lines: ['PEÇAS ABSORVEM LUZ', 'DE FORMA DIFERENTE.']},
    {from: 26.82, to: 35.51, lines: ['MESMO PESO.', 'PICO DIFERENTE.'], teal: 1},
    {from: 35.51, to: 37.15, lines: ['ÁREA NÃO', 'É MASSA.']},
    {from: 37.15, to: 39.71, lines: ['QUÃO LIMPO', 'É O SINAL?'], teal: 1},
    {from: 39.71, to: 42.1, lines: ['QUANTO DO FRASCO', 'É CADEIA?']},
    {from: 42.1, to: 44.34, lines: ['DUAS PERGUNTAS', 'DIFERENTES.'], teal: 1},
    {from: 44.34, to: 47.89, lines: ['MAIS MATEMÁTICA', 'DOS PEPTÍDEOS.'], teal: 1},
  ],
  clips: [{src: 's2-clip4.mp4', from: 44.34, dur: 3.55}],
  hook: {from: 0, to: 8.31, title: 'RELATÓRIO DE PUREZA', pct: '98%', example: 'EXEMPLO', q: '98% DE QUÊ?', qAt: 6.42},
  peaks: {from: 8.31, to: 17.05, targetAt: 12.22, otherAt: 14.24, target: 'ALVO', other: 'OUTROS'},
  frac: {from: 17.05, to: 21.09, num: 'ÁREA DO PICO ALTO', den: 'ÁREA DE TODOS OS PICOS', pct: '= 98%', example: 'EXEMPLO'},
  sig: {from: 21.09, to: 26.82, weight: 'PESO', signal: 'SINAL', signalAt: 22.6},
  trp: {from: 26.82, to: 37.15, barAt: 29.0, bond: 'LIGAÇÃO PEPTÍDICA', trp: 'TRP', ratio: 'CERCA DE 30X', wave: 'ABSORÇÃO A 214 NM', sourceLabel: 'FONTE VERIFICADA', source: 'Kuipers & Gruppen, J Agric Food Chem 2007'},
  two: {from: 37.15, to: 44.34, q1: 'QUÃO LIMPO É O SINAL?', a1: 'A PUREZA RESPONDE', q2: 'QUANTO DO FRASCO É CADEIA?', a2: 'A PUREZA NÃO RESPONDE', q2At: 39.71, verdict: 'DUAS PERGUNTAS DIFERENTES', verdictAt: 42.1},
  endFrom: 44.34,
  seriesChip: 'DENTRO DO FRASCO',
  disclaimer: 'Ferramenta educacional. Não é orientação médica. Somente para fins de pesquisa.',
  durationSec: 50,
};

export const S3EP2_ES: S3Ep2Config = {
  id: 'S3Ep2ES',
  flag: 'mx',
  voFile: 's3-e02-vo-es.mp3',
  vialImg: 'vial-liquid-peptide-es.png',
  cues: [
    {from: 0.05, to: 7.41, lines: ['DIGAMOS: UNA CADENA', 'CON 98% DE PUREZA.'], teal: 1},
    {from: 7.41, to: 9.88, lines: ['¿98% DE QUÉ?']},
    {from: 9.88, to: 14.35, lines: ['UN DETECTOR', 'DIBUJA PICOS.'], teal: 1},
    {from: 14.35, to: 17.41, lines: ['UN PICO ALTO:', 'LA CADENA OBJETIVO.']},
    {from: 17.41, to: 21.03, lines: ['PICOS PEQUEÑOS:', 'TODO LO DEMÁS.'], teal: 1},
    {from: 21.03, to: 26.14, lines: ['PUREZA = PICO ALTO', 'ENTRE TODOS LOS PICOS.']},
    {from: 26.14, to: 29.54, lines: ['UN PICO ES UNA SEÑAL,', 'NO UN PESO.'], teal: 1},
    {from: 29.54, to: 33.36, lines: ['LAS PIEZAS ABSORBEN', 'LA LUZ DISTINTO.']},
    {from: 33.36, to: 42.79, lines: ['MISMO PESO.', 'PICO DISTINTO.'], teal: 1},
    {from: 42.79, to: 45.45, lines: ['EL ÁREA NO', 'ES MASA.']},
    {from: 45.45, to: 48.93, lines: ['¿QUÉ TAN LIMPIA', 'ES LA SEÑAL?'], teal: 1},
    {from: 48.93, to: 51.81, lines: ['¿CUÁNTO DEL VIAL', 'ES CADENA?']},
    {from: 51.81, to: 54.57, lines: ['DOS PREGUNTAS', 'DISTINTAS.'], teal: 1},
    {from: 54.57, to: 58.03, lines: ['MÁS MATEMÁTICA', 'DE PÉPTIDOS.'], teal: 1},
  ],
  clips: [{src: 's2-clip4.mp4', from: 54.57, dur: 3.46}],
  hook: {from: 0, to: 9.88, title: 'INFORME DE PUREZA', pct: '98%', example: 'EJEMPLO', q: '¿98% DE QUÉ?', qAt: 7.41},
  peaks: {from: 9.88, to: 21.03, targetAt: 14.35, otherAt: 17.41, target: 'OBJETIVO', other: 'OTROS'},
  frac: {from: 21.03, to: 26.14, num: 'ÁREA DEL PICO ALTO', den: 'ÁREA DE TODOS LOS PICOS', pct: '= 98%', example: 'EJEMPLO'},
  sig: {from: 26.14, to: 33.36, weight: 'PESO', signal: 'SEÑAL', signalAt: 27.9},
  trp: {from: 33.36, to: 45.45, barAt: 35.4, bond: 'ENLACE PEPTÍDICO', trp: 'TRP', ratio: 'UNAS 30X', wave: 'ABSORCIÓN A 214 NM', sourceLabel: 'FUENTE VERIFICADA', source: 'Kuipers & Gruppen, J Agric Food Chem 2007'},
  two: {from: 45.45, to: 54.57, q1: '¿QUÉ TAN LIMPIA ES LA SEÑAL?', a1: 'LA PUREZA LO RESPONDE', q2: '¿CUÁNTO DEL VIAL ES CADENA?', a2: 'LA PUREZA NO LO RESPONDE', q2At: 48.93, verdict: 'DOS PREGUNTAS DISTINTAS', verdictAt: 51.81},
  endFrom: 54.57,
  seriesChip: 'DENTRO DEL VIAL',
  disclaimer: 'Herramienta educativa. No es consejo médico. Solo con fines de investigación.',
  durationSec: 61,
};
