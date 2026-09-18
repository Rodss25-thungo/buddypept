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

type S2Day7Config = {
  id: string;
  flag: 'us' | 'mx' | 'br';
  voFile: string;
  cues: Cue[];
  clips: ClipCfg[];
  fold: Span & {label: string};
  shake: Span & {labelAt: number; unfoldAt: number; clumpAt: number; air: string; water: string; chip: string};
  lab: Span & {tag: string; sourceLabel: string; source: string};
  swirl: Span & {labelAt: number; chip: string; title: string; line1: string; line2: string; sourceLabel: string; source: string};
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

// A bead chain that morphs from a folded coil (unfold=0) to an open line (unfold=1).
const Coil: React.FC<{cx: number; cy: number; unfold: number; color: string; spin: number; scale?: number}> = ({cx, cy, unfold, color, spin, scale = 1}) => {
  const n = 10;
  const pts = Array.from({length: n}).map((_, i) => {
    const a = (i / n) * Math.PI * 2 * 1.3 + spin;
    const r = (40 + i * 7) * scale;
    const fx = cx + Math.cos(a) * r;
    const fy = cy + Math.sin(a) * r;
    const lx = cx + (i - (n - 1) / 2) * 52 * scale;
    const ly = cy + Math.sin(i * 1.1 + spin * 2) * 16 * scale;
    return {x: fx + (lx - fx) * unfold, y: fy + (ly - fy) * unfold};
  });
  return (
    <g>
      <polyline points={pts.map((p) => `${p.x},${p.y}`).join(' ')} fill="none" stroke={color} strokeWidth={6 * scale} opacity={0.6} />
      {pts.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r={17 * scale} fill={BG} stroke={color} strokeWidth={6 * scale} style={{filter: `drop-shadow(0 0 8px ${color})`}} />
      ))}
    </g>
  );
};

// Beat 2: the folded amino-chain drifting calmly.
const Fold: React.FC<{label: string}> = ({label}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const s = spring({frame, fps, config: {damping: 13, stiffness: 140}});
  const l = spring({frame: frame - 25, fps, config: {damping: 12, stiffness: 200}});
  return (
    <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 30, opacity: s}}>
      <svg width={900} height={620}>
        <Coil cx={450} cy={310} unfold={0} color={TEAL} spin={frame / 60} scale={1.8} />
      </svg>
      <div style={{opacity: l, transform: `scale(${interpolate(l, [0, 1], [0.6, 1])})`, background: TEAL_DEEP, border: `4px solid ${TEAL}`, borderRadius: 999, padding: '14px 44px', fontFamily: anton.fontFamily, fontSize: 46, letterSpacing: 3, color: WHITE}}>{label}</div>
    </div>
  );
};

// Beats 3-5: bubbles form, a chain unfolds at the air-water surface, unfolded chains clump.
const Shake: React.FC<{labelAt: number; unfoldAt: number; clumpAt: number; air: string; water: string; chip: string}> = ({labelAt, unfoldAt, clumpAt, air, water, chip}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const W = 960;
  const H = 820;
  const jitter = (k: string) => Math.sin(frame * 1.9 + random(k) * 10) * 6;
  const nb = Math.min(22, 3 + Math.floor(frame / 3));
  const lab = spring({frame: frame - labelAt, fps, config: {damping: 12, stiffness: 180}});
  const unf = interpolate(frame, [unfoldAt, unfoldAt + 40], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const clump = interpolate(frame, [clumpAt, clumpAt + 45], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const c = spring({frame: frame - clumpAt - 30, fps, config: {damping: 11, stiffness: 220}});
  const colA = unf > 0.3 ? AMBER : TEAL;
  return (
    <div style={{position: 'relative', width: W, height: H}}>
      <svg width={W} height={H}>
        {Array.from({length: nb}).map((_, i) => {
          const x = 70 + random(`bx${i}`) * (W - 140);
          const y = 60 + random(`by${i}`) * (H - 220);
          const r = 22 + random(`br${i}`) * 40;
          return <circle key={i} cx={x + jitter(`j${i}`)} cy={y + jitter(`k${i}`)} r={r} fill="rgba(127,230,242,0.06)" stroke={CYAN} strokeWidth={3} opacity={0.7} />;
        })}
        <circle cx={300} cy={300} r={150} fill="rgba(127,230,242,0.05)" stroke={CYAN} strokeWidth={6} opacity={lab} />
        <Coil cx={interpolate(clump, [0, 1], [320, 470])} cy={interpolate(clump, [0, 1], [470, 590])} unfold={unf} color={colA} spin={frame / 30} />
        <Coil cx={interpolate(clump, [0, 1], [700, 520])} cy={interpolate(clump, [0, 1], [560, 610])} unfold={clump} color={clump > 0.3 ? AMBER : TEAL} spin={-frame / 30} />
      </svg>
      <div style={{position: 'absolute', left: 230, top: 250, opacity: lab, fontFamily: anton.fontFamily, fontSize: 40, color: CYAN}}>{air}</div>
      <div style={{position: 'absolute', left: 470, top: 250, opacity: lab, fontFamily: anton.fontFamily, fontSize: 40, color: TEAL}}>{water}</div>
      <div style={{position: 'absolute', left: 0, right: 0, bottom: 0, display: 'flex', justifyContent: 'center'}}>
        <div style={{opacity: c, transform: `scale(${interpolate(c, [0, 1], [1.5, 1])})`, background: '#1a1206', border: `4px solid ${AMBER}`, borderRadius: 999, padding: '14px 48px', fontFamily: anton.fontFamily, fontSize: 48, letterSpacing: 3, color: AMBER}}>{chip}</div>
      </div>
    </div>
  );
};

// Beat 6: labs shake on purpose.
const Lab: React.FC<{tag: string; sourceLabel: string; source: string}> = ({tag, sourceLabel, source}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const s = spring({frame, fps, config: {damping: 12, stiffness: 180}});
  const src = spring({frame: frame - 25, fps, config: {damping: 12, stiffness: 200}});
  const wob = Math.sin(frame * 1.6) * 14;
  return (
    <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 40}}>
      <svg width={300} height={440} style={{transform: `rotate(${wob}deg)`}}>
        <rect x={100} y={20} width={100} height={46} rx={10} fill={TEAL_DEEP} />
        <rect x={80} y={66} width={140} height={340} rx={24} fill="rgba(127,230,242,0.08)" stroke={CYAN} strokeWidth={7} />
        {Array.from({length: 9}).map((_, i) => (
          <circle key={i} cx={110 + random(`lb${i}`) * 80} cy={120 + random(`lc${i}`) * 260} r={8 + random(`lr${i}`) * 12} fill="none" stroke={CYAN} strokeWidth={3} />
        ))}
      </svg>
      <div style={{opacity: s, transform: `scale(${interpolate(s, [0, 1], [0.6, 1])})`, background: '#1a1206', border: `4px solid ${AMBER}`, borderRadius: 999, padding: '16px 44px', fontFamily: anton.fontFamily, fontSize: 44, letterSpacing: 2, color: AMBER}}>{tag}</div>
      <SourceChip label={sourceLabel} source={source} sp={src} />
    </div>
  );
};

// Beat 7: gentle swirl keeps chains folded, then the generic label card.
const Swirl: React.FC<{labelAt: number; chip: string; title: string; line1: string; line2: string; sourceLabel: string; source: string}> = ({labelAt, chip, title, line1, line2, sourceLabel, source}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const s = spring({frame, fps, config: {damping: 13, stiffness: 140}});
  const card = spring({frame: frame - labelAt, fps, config: {damping: 14, stiffness: 120}});
  const src = spring({frame: frame - labelAt - 30, fps, config: {damping: 12, stiffness: 200}});
  const ch = spring({frame: frame - 25, fps, config: {damping: 11, stiffness: 220}});
  const rot = frame * 1.2;
  return (
    <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 30}}>
      <div style={{position: 'relative', width: 700, height: 460, opacity: s * interpolate(card, [0, 1], [1, 0.35])}}>
        <svg width={700} height={460}>
          <g transform={`rotate(${rot} 350 230)`}>
            <path d="M 350 40 A 190 190 0 0 1 540 230" fill="none" stroke={TEAL} strokeWidth={8} strokeLinecap="round" opacity={0.7} />
            <path d="M 350 420 A 190 190 0 0 1 160 230" fill="none" stroke={TEAL} strokeWidth={8} strokeLinecap="round" opacity={0.7} />
          </g>
          <Coil cx={260} cy={230} unfold={0} color={TEAL} spin={frame / 45} />
          <Coil cx={450} cy={240} unfold={0} color={TEAL} spin={-frame / 50} />
        </svg>
        <div style={{position: 'absolute', left: 0, right: 0, bottom: -10, display: 'flex', justifyContent: 'center'}}>
          <div style={{opacity: ch, background: TEAL_DEEP, border: `4px solid ${TEAL}`, borderRadius: 999, padding: '12px 40px', fontFamily: anton.fontFamily, fontSize: 40, letterSpacing: 2, color: WHITE}}>{chip}</div>
        </div>
      </div>
      <div style={{opacity: card, transform: `perspective(1400px) rotateY(${interpolate(card, [0, 1], [-70, 0])}deg)`, marginTop: -330, background: '#f2f4f5', borderRadius: 24, width: 880, padding: '36px 50px', boxShadow: '0 30px 90px rgba(0,0,0,0.55)', borderTop: `10px solid ${TEAL}`}}>
        <div style={{fontFamily: anton.fontFamily, fontSize: 50, color: '#0e2a30', letterSpacing: 1}}>{title}</div>
        <div style={{height: 3, background: '#c9d4da', margin: '16px 0 20px'}} />
        <div style={{fontFamily: archivo.fontFamily, fontWeight: 700, fontSize: 46, color: '#1c3a42'}}>{line1}</div>
        <div style={{fontFamily: archivo.fontFamily, fontWeight: 700, fontSize: 46, color: '#1c3a42', marginTop: 10}}>{line2}</div>
      </div>
      <SourceChip label={sourceLabel} source={source} sp={src} />
    </div>
  );
};

const Verdict: React.FC<{line1: string; line2: string}> = ({line1, line2}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const s = spring({frame, fps, config: {damping: 11, stiffness: 190}});
  const l2 = spring({frame: frame - 18, fps, config: {damping: 11, stiffness: 190}});
  return (
    <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 30}}>
      <div style={{opacity: s, transform: `scale(${interpolate(s, [0, 1], [0.6, 1])})`, background: TEAL_DEEP, border: `5px solid ${TEAL}`, borderRadius: 30, padding: '28px 80px', fontFamily: anton.fontFamily, fontSize: 110, color: WHITE, boxShadow: '0 0 90px rgba(42,182,201,0.45)'}}>{line1}</div>
      <div style={{opacity: l2, transform: `scale(${interpolate(l2, [0, 1], [0.7, 1])})`, background: '#1a1206', border: `5px solid ${AMBER}`, borderRadius: 30, padding: '20px 50px', fontFamily: anton.fontFamily, fontSize: 64, color: AMBER, textAlign: 'center', maxWidth: 960}}>{line2}</div>
    </div>
  );
};

export const S2Day7: React.FC<{locale: S2Day7Config}> = ({locale}) => {
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

      <Sequence {...span(L.fold)}>
        <AbsoluteFill style={{alignItems: 'center', paddingTop: 640}}>
          <Fold label={L.fold.label} />
        </AbsoluteFill>
      </Sequence>

      <Sequence {...span(L.shake)}>
        <AbsoluteFill style={{alignItems: 'center', paddingTop: 600}}>
          <Shake labelAt={rel(L.shake.labelAt, L.shake)} unfoldAt={rel(L.shake.unfoldAt, L.shake)} clumpAt={rel(L.shake.clumpAt, L.shake)} air={L.shake.air} water={L.shake.water} chip={L.shake.chip} />
        </AbsoluteFill>
      </Sequence>

      <Sequence {...span(L.lab)}>
        <AbsoluteFill style={{alignItems: 'center', paddingTop: 640}}>
          <Lab tag={L.lab.tag} sourceLabel={L.lab.sourceLabel} source={L.lab.source} />
        </AbsoluteFill>
      </Sequence>

      <Sequence {...span(L.swirl)}>
        <AbsoluteFill style={{alignItems: 'center', paddingTop: 640}}>
          <Swirl labelAt={rel(L.swirl.labelAt, L.swirl)} chip={L.swirl.chip} title={L.swirl.title} line1={L.swirl.line1} line2={L.swirl.line2} sourceLabel={L.swirl.sourceLabel} source={L.swirl.source} />
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

export const S2DAY7_EN: S2Day7Config = {
  id: 'S2Day7EN',
  flag: 'us',
  voFile: 's2-d7-vo-en.mp3',
  cues: [
    {from: 0.05, to: 3.24, lines: ['SHAKE IT?', 'OR SWIRL IT?'], teal: 1},
    {from: 3.24, to: 4.22, lines: ['HERE IS', 'WHY.']},
    {from: 4.22, to: 10.01, lines: ['THE AMINO-CHAIN,', 'A FOLDED PEPTIDE.'], teal: 1},
    {from: 10.01, to: 12.81, lines: ['SHAKING MAKES', 'BUBBLES.']},
    {from: 12.81, to: 16.35, lines: ['BUBBLES = NEW', 'AIR-WATER SURFACE.'], teal: 1},
    {from: 16.35, to: 20.04, lines: ['SOME CHAINS', 'PARTLY UNFOLD.']},
    {from: 20.04, to: 24.95, lines: ['THEY CAN STICK', 'TOGETHER.'], teal: 1},
    {from: 24.95, to: 30.4, lines: ['LABS SHAKE', 'ON PURPOSE.']},
    {from: 30.4, to: 35.68, lines: ['A GENTLE SWIRL:', 'ALMOST NO BUBBLES.'], teal: 1},
    {from: 35.68, to: 40.98, lines: ['THE LABEL', 'SPELLS IT OUT.']},
    {from: 40.98, to: 44.36, lines: ['GENTLE IS', 'THE METHOD.'], teal: 1},
    {from: 44.36, to: 47.63, lines: ['DAY 7 OF 10.', 'THE MATH DOESN’T LIE.'], teal: 1},
  ],
  clips: [
    {src: 's2-clip7.mp4', from: 0, dur: 4.22},
    {src: 's2-clip-cradle.mp4', from: 44.36, dur: 3.27},
  ],
  fold: {from: 4.22, to: 10.01, label: 'FOLDED'},
  shake: {from: 10.01, to: 24.95, labelAt: 12.81, unfoldAt: 16.35, clumpAt: 20.04, air: 'AIR', water: 'WATER', chip: 'AGGREGATES'},
  lab: {from: 24.95, to: 30.4, tag: 'SHAKING = A STANDARD STRESS TEST', sourceLabel: 'SOURCE VERIFIED', source: 'J Pharm Sci agitation-aggregation studies, 2020-2023'},
  swirl: {
    from: 30.4,
    to: 40.98,
    labelAt: 35.68,
    chip: 'CHAINS STAY FOLDED',
    title: 'SOME LABELS SAY',
    line1: 'Swirl the vial gently',
    line2: 'until fully dissolved',
    sourceLabel: 'SOURCE VERIFIED',
    source: 'Glucagon for Injection label (DailyMed)',
  },
  verdict: {from: 40.98, to: 44.36, line1: 'GENTLE', line2: 'IS PART OF THE METHOD'},
  endFrom: 47.63,
  dayChip: {from: 47.63, label: 'DAY 7 OF 10'},
  disclaimer: 'Educational tool. Not medical advice. For research purposes only.',
  durationSec: 54,
};

export const S2DAY7_PT: S2Day7Config = {
  id: 'S2Day7PT',
  flag: 'br',
  voFile: 's2-d7-vo-pt.mp3',
  cues: [
    {from: 0.05, to: 3.01, lines: ['AGITAR?', 'OU GIRAR?'], teal: 1},
    {from: 3.01, to: 4.12, lines: ['VEJA', 'POR QUÊ.']},
    {from: 4.12, to: 9.64, lines: ['A CADEIA,', 'UM PEPTÍDEO DOBRADO.'], teal: 1},
    {from: 9.64, to: 12.35, lines: ['AGITAR CRIA', 'BOLHAS.']},
    {from: 12.35, to: 15.76, lines: ['BOLHA = NOVA', 'SUPERFÍCIE AR-ÁGUA.'], teal: 1},
    {from: 15.76, to: 19.8, lines: ['ALGUMAS CADEIAS', 'SE DESDOBRAM.']},
    {from: 19.8, to: 25.6, lines: ['ELAS PODEM', 'GRUDAR.'], teal: 1},
    {from: 25.6, to: 31.51, lines: ['LABORATÓRIOS AGITAM', 'DE PROPÓSITO.']},
    {from: 31.51, to: 36.6, lines: ['GIRO SUAVE:', 'QUASE SEM BOLHAS.'], teal: 1},
    {from: 36.6, to: 42.26, lines: ['O RÓTULO', 'DEIXA CLARO.']},
    {from: 42.26, to: 45.84, lines: ['SUAVE É', 'O MÉTODO.'], teal: 1},
    {from: 45.84, to: 49.6, lines: ['DIA 7 DE 10.', 'A MATEMÁTICA NÃO MENTE.'], teal: 1},
  ],
  clips: [
    {src: 's2-clip7.mp4', from: 0, dur: 4.12},
    {src: 's2-clip-cradle.mp4', from: 45.84, dur: 3.76},
  ],
  fold: {from: 4.12, to: 9.64, label: 'DOBRADA'},
  shake: {from: 9.64, to: 25.6, labelAt: 12.35, unfoldAt: 15.76, clumpAt: 19.8, air: 'AR', water: 'ÁGUA', chip: 'AGREGADOS'},
  lab: {from: 25.6, to: 31.51, tag: 'AGITAR = TESTE DE ESTRESSE PADRÃO', sourceLabel: 'FONTE VERIFICADA', source: 'Estudos de agitação e agregação, J Pharm Sci, 2020-2023'},
  swirl: {
    from: 31.51,
    to: 42.26,
    labelAt: 36.6,
    chip: 'CADEIAS DOBRADAS',
    title: 'ALGUNS RÓTULOS DIZEM',
    line1: 'Gire o frasco suavemente',
    line2: 'até dissolver por completo',
    sourceLabel: 'FONTE VERIFICADA',
    source: 'Rótulo do Glucagon para Injeção (DailyMed)',
  },
  verdict: {from: 42.26, to: 45.84, line1: 'SUAVE', line2: 'FAZ PARTE DO MÉTODO'},
  endFrom: 49.6,
  dayChip: {from: 49.6, label: 'DIA 7 DE 10'},
  disclaimer: 'Ferramenta educacional. Não é orientação médica. Somente para fins de pesquisa.',
  durationSec: 56,
};

export const S2DAY7_ES: S2Day7Config = {
  id: 'S2Day7ES',
  flag: 'mx',
  voFile: 's2-d7-vo-es.mp3',
  cues: [
    {from: 0.05, to: 4.66, lines: ['¿AGITAR?', '¿O GIRAR?'], teal: 1},
    {from: 4.66, to: 6.77, lines: ['AQUÍ ESTÁ', 'EL PORQUÉ.']},
    {from: 6.77, to: 13.23, lines: ['LA CADENA,', 'UN PÉPTIDO DOBLADO.'], teal: 1},
    {from: 13.23, to: 16.76, lines: ['AGITAR CREA', 'BURBUJAS.']},
    {from: 16.76, to: 21.26, lines: ['BURBUJA = NUEVA', 'SUPERFICIE AIRE-AGUA.'], teal: 1},
    {from: 21.26, to: 26.07, lines: ['ALGUNAS CADENAS', 'SE DESDOBLAN.']},
    {from: 26.07, to: 32.03, lines: ['PUEDEN', 'PEGARSE.'], teal: 1},
    {from: 32.03, to: 39.2, lines: ['LOS LABORATORIOS', 'AGITAN A PROPÓSITO.']},
    {from: 39.2, to: 45.06, lines: ['GIRO SUAVE:', 'CASI SIN BURBUJAS.'], teal: 1},
    {from: 45.06, to: 51.31, lines: ['LA ETIQUETA', 'LO DICE CLARO.']},
    {from: 51.31, to: 56.15, lines: ['SUAVE ES', 'EL MÉTODO.'], teal: 1},
    {from: 56.15, to: 61.45, lines: ['DÍA 7 DE 10.', 'LAS CUENTAS NO MIENTEN.'], teal: 1},
  ],
  clips: [
    {src: 's2-clip7.mp4', from: 0, dur: 6.77},
    {src: 's2-clip-cradle.mp4', from: 56.15, dur: 5.0},
  ],
  fold: {from: 6.77, to: 13.23, label: 'DOBLADA'},
  shake: {from: 13.23, to: 32.03, labelAt: 16.76, unfoldAt: 21.26, clumpAt: 26.07, air: 'AIRE', water: 'AGUA', chip: 'AGREGADOS'},
  lab: {from: 32.03, to: 39.2, tag: 'AGITAR = PRUEBA DE ESTRÉS ESTÁNDAR', sourceLabel: 'FUENTE VERIFICADA', source: 'Estudios de agitación y agregación, J Pharm Sci, 2020-2023'},
  swirl: {
    from: 39.2,
    to: 51.31,
    labelAt: 45.06,
    chip: 'CADENAS DOBLADAS',
    title: 'ALGUNAS ETIQUETAS DICEN',
    line1: 'Gira el vial suavemente',
    line2: 'hasta disolver por completo',
    sourceLabel: 'FUENTE VERIFICADA',
    source: 'Etiqueta de Glucagón para Inyección (DailyMed)',
  },
  verdict: {from: 51.31, to: 56.15, line1: 'SUAVE', line2: 'ES PARTE DEL MÉTODO'},
  endFrom: 61.45,
  dayChip: {from: 61.45, label: 'DÍA 7 DE 10'},
  disclaimer: 'Herramienta educativa. No es consejo médico. Solo con fines de investigación.',
  durationSec: 68,
};
