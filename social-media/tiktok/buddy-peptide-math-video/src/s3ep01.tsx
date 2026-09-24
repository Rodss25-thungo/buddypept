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
const VIOLET = '#a78bfa';

type ClipCfg = {src: string; from: number; dur: number};
type Span = {from: number; to: number};

type S3Ep1Config = {
  id: string;
  flag: 'us' | 'mx' | 'br';
  voFile: string;
  vialImg: string;
  cues: Cue[];
  clips: ClipCfg[];
  res: {trp: string; tyr: string; phe: string; cys: string; his: string; ala: string};
  hook: Span & {labelA: string; labelB: string};
  vial: Span & {chip: string};
  suspects: Span & {chipAt: number[]; sourceLabel: string; source: string};
  oxid: Span & {chip: string};
  chainB: Span & {chip: string};
  neighbor: Span & {hisAt: number; aAt: number; bAt: number; rowA: string; rowB: string; sourceLabel: string; source: string};
  verdict: Span & {line2At: number; line1: string; line2: string};
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

const SourceChip: React.FC<{label: string; source: string; sp: number}> = ({label, source, sp}) => (
  <div style={{opacity: sp, transform: `translateY(${interpolate(sp, [0, 1], [30, 0])}px)`, display: 'flex', alignItems: 'center', gap: 18, background: 'rgba(10,18,24,0.92)', border: `3px solid ${TEAL}`, borderRadius: 999, padding: '14px 34px', maxWidth: 960}}>
    <div style={{width: 34, height: 34, borderRadius: 999, background: TEAL, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: anton.fontFamily, fontSize: 24, color: '#04262b', flexShrink: 0}}>{'✓'}</div>
    <div style={{fontFamily: anton.fontFamily, fontSize: 30, letterSpacing: 2, color: TEAL, flexShrink: 0}}>{label}</div>
    <div style={{fontFamily: archivo.fontFamily, fontWeight: 700, fontSize: 26, color: MUTED}}>{source}</div>
  </div>
);

// Diagonal beam of light falling from the top.
const Beam: React.FC<{w: number; h: number; on: number}> = ({w, h, on}) => (
  <svg width={w} height={h} style={{position: 'absolute', left: 0, top: 0, opacity: on, pointerEvents: 'none'}}>
    <defs>
      <linearGradient id="bm" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor={AMBER} stopOpacity={0.55} />
        <stop offset="100%" stopColor={AMBER} stopOpacity={0.05} />
      </linearGradient>
    </defs>
    <polygon points={`${w * 0.2},0 ${w * 0.8},0 ${w * 0.95},${h} ${w * 0.05},${h}`} fill="url(#bm)" />
  </svg>
);

type BeadSpec = {label?: string; state: 'teal' | 'amber' | 'violet'};

// A horizontal bead chain; each bead can carry a label and a state color.
const Chain: React.FC<{beads: BeadSpec[]; width: number; cy: number; wave?: number; r?: number}> = ({beads, width, cy, wave = 14, r = 30}) => {
  const frame = useCurrentFrame();
  const n = beads.length;
  const pts = beads.map((_, i) => ({x: 50 + (i * (width - 100)) / (n - 1), y: cy + Math.sin(i * 0.9 + frame / 22) * wave}));
  const col = (s: BeadSpec['state']) => (s === 'violet' ? VIOLET : s === 'amber' ? AMBER : TEAL);
  return (
    <g>
      <polyline points={pts.map((p) => `${p.x},${p.y}`).join(' ')} fill="none" stroke={TEAL} strokeWidth={6} opacity={0.5} />
      {beads.map((b, i) => (
        <g key={i}>
          <circle cx={pts[i].x} cy={pts[i].y} r={r} fill={BG} stroke={col(b.state)} strokeWidth={7} style={{filter: `drop-shadow(0 0 ${b.state === 'teal' ? 6 : 16}px ${col(b.state)})`}} />
          {b.state !== 'teal' ? <circle cx={pts[i].x} cy={pts[i].y} r={r * 0.45} fill={col(b.state)} opacity={0.8} /> : null}
          {b.state === 'violet' ? (
            <g transform={`translate(${pts[i].x + r * 0.9} ${pts[i].y + r * 0.9})`}>
              <circle r={17} fill={VIOLET} />
              <text y={8} textAnchor="middle" fontFamily={anton.fontFamily} fontSize={22} fill="#1b1030">O</text>
            </g>
          ) : null}
          {b.label ? (
            <text x={pts[i].x} y={pts[i].y - r - 16} textAnchor="middle" fontFamily={anton.fontFamily} fontSize={36} letterSpacing={1} fill={b.state === 'violet' ? VIOLET : AMBER}>
              {b.label}
            </text>
          ) : null}
        </g>
      ))}
    </g>
  );
};

const Pill: React.FC<{text: string; color: string; sp: number; bg?: string}> = ({text, color, sp, bg = '#0a1218'}) => (
  <div style={{opacity: sp, transform: `scale(${interpolate(sp, [0, 1], [0.6, 1])})`, background: bg, border: `4px solid ${color}`, borderRadius: 999, padding: '12px 40px', fontFamily: anton.fontFamily, fontSize: 44, letterSpacing: 2, color: WHITE, textAlign: 'center'}}>{text}</div>
);

// Beat 1: two chains under the same beam.
const Hook: React.FC<{labelA: string; labelB: string; res: S3Ep1Config['res']}> = ({labelA, labelB, res}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const s = spring({frame, fps, config: {damping: 13, stiffness: 140}});
  const on = interpolate(frame, [15, 40], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const hit = interpolate(frame, [50, 75], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const a: BeadSpec[] = Array.from({length: 9}).map((_, i) => ({state: hit > 0.5 && (i === 2 || i === 5) ? 'amber' : 'teal'}));
  const b: BeadSpec[] = Array.from({length: 9}).map(() => ({state: 'teal'}));
  void res;
  return (
    <div style={{position: 'relative', width: 980, height: 760, opacity: s}}>
      <Beam w={980} h={760} on={on} />
      <svg width={980} height={760} style={{position: 'absolute', left: 0, top: 0}}>
        <Chain beads={a} width={940} cy={230} />
        <Chain beads={b} width={940} cy={520} />
      </svg>
      <div style={{position: 'absolute', left: 30, top: 130, fontFamily: anton.fontFamily, fontSize: 40, letterSpacing: 3, color: WHITE}}>{labelA}</div>
      <div style={{position: 'absolute', left: 30, top: 420, fontFamily: anton.fontFamily, fontSize: 40, letterSpacing: 3, color: WHITE}}>{labelB}</div>
    </div>
  );
};

const VialScene: React.FC<{chip: string; img: string}> = ({chip, img}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const s = spring({frame, fps, config: {damping: 13, stiffness: 150}});
  const c = spring({frame: frame - 12, fps, config: {damping: 11, stiffness: 220}});
  return (
    <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 34, opacity: s}}>
      <Img src={staticFile(img)} style={{height: 600, WebkitMaskImage: 'linear-gradient(to right, transparent 0%, black 14%, black 86%, transparent 100%)'}} />
      <Pill text={chip} color={TEAL} sp={c} bg={TEAL_DEEP} />
    </div>
  );
};

// Beat 3: the four usual suspects light up one by one.
const Suspects: React.FC<{chipAt: number[]; res: S3Ep1Config['res']; sourceLabel: string; source: string}> = ({chipAt, res, sourceLabel, source}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const s = spring({frame, fps, config: {damping: 13, stiffness: 140}});
  const src = spring({frame: frame - chipAt[0], fps, config: {damping: 12, stiffness: 200}});
  const names = [res.trp, res.tyr, res.phe, res.cys];
  const pos = [1, 3, 5, 7];
  const beads: BeadSpec[] = Array.from({length: 9}).map((_, i) => {
    const k = pos.indexOf(i);
    if (k >= 0 && frame >= chipAt[k]) return {state: 'amber', label: names[k]};
    return {state: 'teal'};
  });
  return (
    <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 60, opacity: s}}>
      <svg width={980} height={340}>
        <Chain beads={beads} width={940} cy={190} wave={16} r={32} />
      </svg>
      <SourceChip label={sourceLabel} source={source} sp={src} />
    </div>
  );
};

// Beat 4: light hits the suspects, they oxidize.
const Oxid: React.FC<{chip: string; res: S3Ep1Config['res']}> = ({chip, res}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const on = interpolate(frame, [0, 15], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const ox = interpolate(frame, [15, 35], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const c = spring({frame: frame - 35, fps, config: {damping: 11, stiffness: 220}});
  const names = [res.trp, res.tyr, res.phe, res.cys];
  const pos = [1, 3, 5, 7];
  const beads: BeadSpec[] = Array.from({length: 9}).map((_, i) => {
    const k = pos.indexOf(i);
    if (k >= 0) return {state: ox > 0.5 ? 'violet' : 'amber', label: names[k]};
    return {state: 'teal'};
  });
  return (
    <div style={{position: 'relative', width: 980, height: 620}}>
      <Beam w={980} h={620} on={on} />
      <svg width={980} height={420} style={{position: 'absolute', left: 0, top: 0}}>
        <Chain beads={beads} width={940} cy={230} wave={16} r={32} />
      </svg>
      <div style={{position: 'absolute', left: 0, right: 0, top: 440, display: 'flex', justifyContent: 'center'}}>
        <Pill text={chip} color={VIOLET} sp={c} bg="#1b1030" />
      </div>
    </div>
  );
};

// Beat 5: a chain with no suspect links stays as it is.
const ChainB: React.FC<{chip: string}> = ({chip}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const on = interpolate(frame, [0, 12], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const c = spring({frame: frame - 30, fps, config: {damping: 11, stiffness: 220}});
  const beads: BeadSpec[] = Array.from({length: 9}).map(() => ({state: 'teal'}));
  return (
    <div style={{position: 'relative', width: 980, height: 620}}>
      <Beam w={980} h={620} on={on} />
      <svg width={980} height={420} style={{position: 'absolute', left: 0, top: 0}}>
        <Chain beads={beads} width={940} cy={230} wave={16} r={32} />
      </svg>
      <div style={{position: 'absolute', left: 0, right: 0, top: 440, display: 'flex', justifyContent: 'center'}}>
        <Pill text={chip} color={TEAL} sp={c} bg={TEAL_DEEP} />
      </div>
    </div>
  );
};

// Beat 6: neighbor effect. HIS next to TRP changes; HIS next to ALA does not.
const Neighbor: React.FC<{hisAt: number; aAt: number; bAt: number; rowA: string; rowB: string; res: S3Ep1Config['res']; sourceLabel: string; source: string}> = ({hisAt, aAt, bAt, rowA, rowB, res, sourceLabel, source}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const s = spring({frame, fps, config: {damping: 13, stiffness: 140}});
  const src = spring({frame: frame - hisAt, fps, config: {damping: 12, stiffness: 200}});
  const beam = interpolate(frame, [hisAt, hisAt + 20], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const stateA = frame >= aAt ? 'violet' : 'teal';
  const rowAbeads: BeadSpec[] = [
    {state: 'teal'},
    {state: stateA, label: res.his},
    {state: stateA, label: res.trp},
    {state: 'teal'},
    {state: 'teal'},
  ];
  const rowBbeads: BeadSpec[] = [
    {state: 'teal'},
    {state: 'teal', label: res.his},
    {state: 'teal', label: res.ala},
    {state: 'teal'},
    {state: 'teal'},
  ];
  const showB = frame >= bAt - 30;
  return (
    <div style={{position: 'relative', width: 980, height: 800, opacity: s}}>
      <Beam w={980} h={800} on={beam * 0.7} />
      <svg width={980} height={800} style={{position: 'absolute', left: 0, top: 0}}>
        <Chain beads={rowAbeads} width={760} cy={180} wave={10} r={38} />
        {showB ? <Chain beads={rowBbeads} width={760} cy={470} wave={10} r={38} /> : null}
      </svg>
      <div style={{position: 'absolute', left: 0, right: 0, top: 10, textAlign: 'center', fontFamily: anton.fontFamily, fontSize: 38, letterSpacing: 2, color: WHITE, opacity: 0.85}}>{rowA}</div>
      {showB ? <div style={{position: 'absolute', left: 0, right: 0, top: 300, textAlign: 'center', fontFamily: anton.fontFamily, fontSize: 38, letterSpacing: 2, color: WHITE, opacity: 0.85}}>{rowB}</div> : null}
      <div style={{position: 'absolute', left: 0, right: 0, bottom: 20, display: 'flex', justifyContent: 'center'}}>
        <SourceChip label={sourceLabel} source={source} sp={src} />
      </div>
    </div>
  );
};

const Verdict: React.FC<{line2At: number; line1: string; line2: string}> = ({line2At, line1, line2}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const s = spring({frame, fps, config: {damping: 11, stiffness: 190}});
  const l2 = spring({frame: frame - line2At, fps, config: {damping: 11, stiffness: 190}});
  return (
    <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 30}}>
      <div style={{opacity: s, transform: `scale(${interpolate(s, [0, 1], [0.6, 1])})`, background: TEAL_DEEP, border: `5px solid ${TEAL}`, borderRadius: 30, padding: '30px 60px', fontFamily: anton.fontFamily, fontSize: 88, color: WHITE, textAlign: 'center', maxWidth: 980, boxShadow: '0 0 90px rgba(42,182,201,0.45)'}}>{line1}</div>
      <div style={{opacity: l2, transform: `scale(${interpolate(l2, [0, 1], [0.7, 1])})`, background: '#1a1206', border: `5px solid ${AMBER}`, borderRadius: 30, padding: '22px 50px', fontFamily: anton.fontFamily, fontSize: 60, color: AMBER, textAlign: 'center', maxWidth: 980}}>{line2}</div>
    </div>
  );
};

export const S3Ep1: React.FC<{locale: S3Ep1Config}> = ({locale}) => {
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
          <Hook labelA={L.hook.labelA} labelB={L.hook.labelB} res={L.res} />
        </AbsoluteFill>
      </Sequence>

      <Sequence {...span(L.vial)}>
        <AbsoluteFill style={{alignItems: 'center', paddingTop: 600}}>
          <VialScene chip={L.vial.chip} img={L.vialImg} />
        </AbsoluteFill>
      </Sequence>

      <Sequence {...span(L.suspects)}>
        <AbsoluteFill style={{alignItems: 'center', paddingTop: 680}}>
          <Suspects chipAt={L.suspects.chipAt.map((t) => rel(t, L.suspects))} res={L.res} sourceLabel={L.suspects.sourceLabel} source={L.suspects.source} />
        </AbsoluteFill>
      </Sequence>

      <Sequence {...span(L.oxid)}>
        <AbsoluteFill style={{alignItems: 'center', paddingTop: 640}}>
          <Oxid chip={L.oxid.chip} res={L.res} />
        </AbsoluteFill>
      </Sequence>

      <Sequence {...span(L.chainB)}>
        <AbsoluteFill style={{alignItems: 'center', paddingTop: 640}}>
          <ChainB chip={L.chainB.chip} />
        </AbsoluteFill>
      </Sequence>

      <Sequence {...span(L.neighbor)}>
        <AbsoluteFill style={{alignItems: 'center', paddingTop: 600}}>
          <Neighbor hisAt={rel(L.neighbor.hisAt, L.neighbor)} aAt={rel(L.neighbor.aAt, L.neighbor)} bAt={rel(L.neighbor.bAt, L.neighbor)} rowA={L.neighbor.rowA} rowB={L.neighbor.rowB} res={L.res} sourceLabel={L.neighbor.sourceLabel} source={L.neighbor.source} />
        </AbsoluteFill>
      </Sequence>

      <Sequence {...span(L.verdict)}>
        <AbsoluteFill style={{alignItems: 'center', paddingTop: 760}}>
          <Verdict line2At={rel(L.verdict.line2At, L.verdict)} line1={L.verdict.line1} line2={L.verdict.line2} />
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

export const S3EP1_EN: S3Ep1Config = {
  id: 'S3Ep1EN',
  flag: 'us',
  voFile: 's3-e01-vo-en.mp3',
  vialImg: 'vial-liquid-peptide-en.png',
  cues: [
    {from: 0.05, to: 2.79, lines: ['LIGHT CAN CHANGE', 'AN AMINO-CHAIN.'], teal: 1},
    {from: 2.79, to: 5.17, lines: ['NOT EVERY CHAIN', 'REACTS THE SAME.']},
    {from: 5.17, to: 7.24, lines: ['IT DEPENDS ON', 'WHICH LINKS.'], teal: 1},
    {from: 7.24, to: 14.69, lines: ['THE USUAL SUSPECTS:', 'FOUR KINDS OF LINKS.']},
    {from: 14.69, to: 17.21, lines: ['LIGHT HITS.', 'THEY CAN OXIDIZE.'], teal: 1},
    {from: 17.21, to: 21.09, lines: ['FEWER SUSPECTS,', 'FEWER CHANGES.']},
    {from: 21.09, to: 24.4, lines: ['THE LINKS DON’T', 'ACT ALONE.'], teal: 1},
    {from: 24.4, to: 29.7, lines: ['HIS NEXT TO TRP:', 'OXIDIZED.']},
    {from: 29.7, to: 33.92, lines: ['TRP SWAPPED FOR ALA:', 'NOT OXIDIZED.'], teal: 1},
    {from: 33.92, to: 35.7, lines: ['THE SEQUENCE', 'DECIDES.'], teal: 1},
    {from: 35.7, to: 38.58, lines: ['SAME LIGHT.', 'DIFFERENT RESULT.']},
    {from: 38.58, to: 44.1, lines: ['NO ONE RULE FOR', 'EVERY CHAIN.'], teal: 1},
    {from: 44.1, to: 47.4, lines: ['FOLLOW FOR MORE', 'PEPTIDE MATH.'], teal: 1},
  ],
  clips: [{src: 's2-clip4.mp4', from: 44.1, dur: 3.3}],
  res: {trp: 'TRP', tyr: 'TYR', phe: 'PHE', cys: 'CYS', his: 'HIS', ala: 'ALA'},
  hook: {from: 0, to: 5.17, labelA: 'CHAIN A', labelB: 'CHAIN B'},
  vial: {from: 5.17, to: 7.24, chip: 'DEPENDS ON THE LINKS'},
  suspects: {from: 7.24, to: 14.69, chipAt: [8.3, 9.9, 11.3, 13.0], sourceLabel: 'SOURCE VERIFIED', source: 'Kerwin & Remmele, J Pharm Sci 2007'},
  oxid: {from: 14.69, to: 17.21, chip: 'OXIDIZED'},
  chainB: {from: 17.21, to: 21.09, chip: 'NO SUSPECTS, NO CHANGE'},
  neighbor: {from: 21.09, to: 33.92, hisAt: 24.4, aAt: 26.6, bAt: 30.2, rowA: 'MODEL PEPTIDE 1', rowB: 'SAME PEPTIDE, TRP SWAPPED FOR ALA', sourceLabel: 'SOURCE VERIFIED', source: 'Bane et al., Pharm Res 2017 (lab study)'},
  verdict: {from: 33.92, to: 44.1, line2At: 38.58, line1: 'THE SEQUENCE DECIDES.', line2: 'NO ONE RULE FOR EVERY CHAIN.'},
  endFrom: 47.4,
  seriesChip: 'INSIDE THE VIAL',
  disclaimer: 'Educational tool. Not medical advice. For research purposes only.',
  durationSec: 53,
};

export const S3EP1_PT: S3Ep1Config = {
  id: 'S3Ep1PT',
  flag: 'br',
  voFile: 's3-e01-vo-pt.mp3',
  vialImg: 'vial-liquid-peptide-pt.png',
  cues: [
    {from: 0.05, to: 3.69, lines: ['A LUZ PODE ALTERAR', 'UMA CADEIA.'], teal: 1},
    {from: 3.69, to: 6.49, lines: ['NEM TODA CADEIA', 'REAGE IGUAL.']},
    {from: 6.49, to: 8.53, lines: ['DEPENDE DOS', 'ELOS.'], teal: 1},
    {from: 8.53, to: 16.0, lines: ['OS SUSPEITOS:', 'QUATRO TIPOS DE ELOS.']},
    {from: 16.0, to: 18.76, lines: ['A LUZ ATINGE.', 'ELES PODEM OXIDAR.'], teal: 1},
    {from: 18.76, to: 23.25, lines: ['MENOS SUSPEITOS,', 'MENOS MUDANÇAS.']},
    {from: 23.25, to: 27.04, lines: ['OS ELOS NÃO', 'AGEM SOZINHOS.'], teal: 1},
    {from: 27.04, to: 32.04, lines: ['HIS AO LADO DE TRP:', 'OXIDADA.']},
    {from: 32.04, to: 35.86, lines: ['TRP TROCADO POR ALA:', 'NÃO OXIDOU.'], teal: 1},
    {from: 35.86, to: 37.6, lines: ['A SEQUÊNCIA', 'DECIDE.'], teal: 1},
    {from: 37.6, to: 40.88, lines: ['MESMA LUZ.', 'RESULTADO DIFERENTE.']},
    {from: 40.88, to: 47.15, lines: ['NENHUMA REGRA ÚNICA', 'PARA TODA CADEIA.'], teal: 1},
    {from: 47.15, to: 50.7, lines: ['MAIS MATEMÁTICA', 'DOS PEPTÍDEOS.'], teal: 1},
  ],
  clips: [{src: 's2-clip4.mp4', from: 47.15, dur: 3.55}],
  res: {trp: 'TRP', tyr: 'TIR', phe: 'FEN', cys: 'CIS', his: 'HIS', ala: 'ALA'},
  hook: {from: 0, to: 6.49, labelA: 'CADEIA A', labelB: 'CADEIA B'},
  vial: {from: 6.49, to: 8.53, chip: 'DEPENDE DOS ELOS'},
  suspects: {from: 8.53, to: 16.0, chipAt: [10.2, 11.9, 13.4, 15.0], sourceLabel: 'FONTE VERIFICADA', source: 'Kerwin & Remmele, J Pharm Sci 2007'},
  oxid: {from: 16.0, to: 18.76, chip: 'OXIDADO'},
  chainB: {from: 18.76, to: 23.25, chip: 'SEM SUSPEITOS, SEM MUDANÇA'},
  neighbor: {from: 23.25, to: 35.86, hisAt: 27.04, aAt: 29.6, bAt: 33.8, rowA: 'PEPTÍDEO MODELO 1', rowB: 'MESMO PEPTÍDEO, TRP TROCADO POR ALA', sourceLabel: 'FONTE VERIFICADA', source: 'Bane et al., Pharm Res 2017 (estudo de laboratório)'},
  verdict: {from: 35.86, to: 47.15, line2At: 40.88, line1: 'A SEQUÊNCIA DECIDE.', line2: 'NENHUMA REGRA ÚNICA PARA TODA CADEIA.'},
  endFrom: 50.7,
  seriesChip: 'DENTRO DO FRASCO',
  disclaimer: 'Ferramenta educacional. Não é orientação médica. Somente para fins de pesquisa.',
  durationSec: 56,
};

export const S3EP1_ES: S3Ep1Config = {
  id: 'S3Ep1ES',
  flag: 'mx',
  voFile: 's3-e01-vo-es.mp3',
  vialImg: 'vial-liquid-peptide-es.png',
  cues: [
    {from: 0.05, to: 4.47, lines: ['LA LUZ PUEDE CAMBIAR', 'UNA CADENA.'], teal: 1},
    {from: 4.47, to: 7.77, lines: ['NO TODAS LAS CADENAS', 'REACCIONAN IGUAL.']},
    {from: 7.77, to: 10.53, lines: ['DEPENDE DE', 'SUS ESLABONES.'], teal: 1},
    {from: 10.53, to: 19.83, lines: ['LOS SOSPECHOSOS:', 'CUATRO ESLABONES.']},
    {from: 19.83, to: 23.41, lines: ['LA LUZ LOS ALCANZA.', 'PUEDEN OXIDARSE.'], teal: 1},
    {from: 23.41, to: 28.89, lines: ['MENOS SOSPECHOSOS,', 'MENOS CAMBIOS.']},
    {from: 28.89, to: 34.24, lines: ['LOS ESLABONES NO', 'ACTÚAN SOLOS.'], teal: 1},
    {from: 34.24, to: 40.09, lines: ['HIS JUNTO A TRP:', 'OXIDADA.']},
    {from: 40.09, to: 44.87, lines: ['TRP CAMBIADO POR ALA:', 'NO SE OXIDÓ.'], teal: 1},
    {from: 44.87, to: 47.43, lines: ['LA SECUENCIA', 'DECIDE.'], teal: 1},
    {from: 47.43, to: 51.89, lines: ['LA MISMA LUZ.', 'DISTINTO RESULTADO.']},
    {from: 51.89, to: 59.0, lines: ['NINGUNA REGLA ÚNICA', 'PARA TODA CADENA.'], teal: 1},
    {from: 59.0, to: 62.46, lines: ['MÁS MATEMÁTICA', 'DE PÉPTIDOS.'], teal: 1},
  ],
  clips: [{src: 's2-clip4.mp4', from: 59.0, dur: 3.46}],
  res: {trp: 'TRP', tyr: 'TIR', phe: 'FEN', cys: 'CIS', his: 'HIS', ala: 'ALA'},
  hook: {from: 0, to: 7.77, labelA: 'CADENA A', labelB: 'CADENA B'},
  vial: {from: 7.77, to: 10.53, chip: 'DEPENDE DE LOS ESLABONES'},
  suspects: {from: 10.53, to: 19.83, chipAt: [12.4, 14.5, 16.4, 18.4], sourceLabel: 'FUENTE VERIFICADA', source: 'Kerwin & Remmele, J Pharm Sci 2007'},
  oxid: {from: 19.83, to: 23.41, chip: 'OXIDADO'},
  chainB: {from: 23.41, to: 28.89, chip: 'SIN SOSPECHOSOS, SIN CAMBIO'},
  neighbor: {from: 28.89, to: 44.87, hisAt: 34.24, aAt: 37.2, bAt: 42.0, rowA: 'PÉPTIDO MODELO 1', rowB: 'MISMO PÉPTIDO, TRP CAMBIADO POR ALA', sourceLabel: 'FUENTE VERIFICADA', source: 'Bane et al., Pharm Res 2017 (estudio de laboratorio)'},
  verdict: {from: 44.87, to: 59.0, line2At: 51.89, line1: 'LA SECUENCIA DECIDE.', line2: 'NINGUNA REGLA ÚNICA PARA TODA CADENA.'},
  endFrom: 62.46,
  seriesChip: 'DENTRO DEL VIAL',
  disclaimer: 'Herramienta educativa. No es consejo médico. Solo con fines de investigación.',
  durationSec: 68,
};
