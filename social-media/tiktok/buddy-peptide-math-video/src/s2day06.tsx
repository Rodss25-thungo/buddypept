import React from 'react';
import {
  AbsoluteFill,
  Audio,
  Img,
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
const VIOLET = '#a78bfa';

type ClipCfg = {src: string; from: number; dur: number};
type Span = {from: number; to: number};

type S2Day6Config = {
  id: string;
  flag: 'us' | 'mx' | 'br';
  voFile: string;
  cues: Cue[];
  clips: ClipCfg[];
  chain: Span & {photonsAt: number; litAt: number; oxAt: number; trp: string; tyr: string; oxChip: string};
  seq: Span & {chip: string; chipAt: number};
  label: Span & {title: string; line1: string; line2: string; cartonAt: number; boxLabel: string; sourceLabel: string; source: string};
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

// Falling light rays; `stopY` clips them (used by the carton beat).
const Photons: React.FC<{w: number; h: number; start: number; stopY?: number; n?: number}> = ({w, h, start, stopY, n = 14}) => {
  const frame = useCurrentFrame();
  if (frame < start) return null;
  const t = frame - start;
  return (
    <svg width={w} height={h} style={{position: 'absolute', left: 0, top: 0}}>
      {Array.from({length: n}).map((_, i) => {
        const x = 40 + random(`px${i}`) * (w - 80);
        const speed = 14 + random(`ps${i}`) * 10;
        const y = ((t * speed + random(`po${i}`) * h) % (h + 120)) - 120;
        const limit = stopY ?? h;
        if (y > limit) return null;
        const y2 = Math.min(y + 90, limit);
        const c = i % 3 === 0 ? VIOLET : AMBER;
        return <line key={i} x1={x} y1={y} x2={x - 18} y2={y2} stroke={c} strokeWidth={6} strokeLinecap="round" opacity={0.85} style={{filter: `drop-shadow(0 0 8px ${c})`}} />;
      })}
    </svg>
  );
};

// Beats 2-4: amino-acid chain; two sensitive links light up, then oxidize.
const Chain: React.FC<{photonsAt: number; litAt: number; oxAt: number; trp: string; tyr: string; oxChip: string}> = ({photonsAt, litAt, oxAt, trp, tyr, oxChip}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const s = spring({frame, fps, config: {damping: 13, stiffness: 140}});
  const lit = interpolate(frame, [litAt, litAt + 12], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const ox = spring({frame: frame - oxAt, fps, config: {damping: 11, stiffness: 200}});
  const W = 960;
  const H = 760;
  const beads = 8;
  const sensitive: Record<number, string> = {2: trp, 5: tyr};
  const pts = Array.from({length: beads}).map((_, i) => ({
    x: 90 + (i * (W - 180)) / (beads - 1),
    y: 470 + Math.sin(i * 0.9 + frame / 25) * 60,
  }));
  return (
    <div style={{position: 'relative', width: W, height: H, opacity: s}}>
      <Photons w={W} h={H} start={photonsAt} />
      <svg width={W} height={H} style={{position: 'absolute', left: 0, top: 0}}>
        <polyline points={pts.map((p) => `${p.x},${p.y}`).join(' ')} fill="none" stroke={TEAL} strokeWidth={8} opacity={0.6} />
        {pts.map((p, i) => {
          const sens = sensitive[i] !== undefined;
          const col = sens ? (ox > 0.5 ? VIOLET : lit > 0 ? AMBER : TEAL) : TEAL;
          const glow = sens ? lit : 0;
          return (
            <g key={i}>
              <circle cx={p.x} cy={p.y} r={46} fill={BG} stroke={col} strokeWidth={8} style={{filter: `drop-shadow(0 0 ${10 + glow * 30}px ${col})`}} />
              <circle cx={p.x} cy={p.y} r={22} fill={col} opacity={0.5 + glow * 0.5} />
              {sens ? (
                <text x={p.x} y={p.y - 80} textAnchor="middle" fontFamily={anton.fontFamily} fontSize={44} fill={AMBER} opacity={lit}>
                  {sensitive[i]}
                </text>
              ) : null}
              {sens ? (
                <g opacity={ox} transform={`translate(${p.x + 38} ${p.y + 38}) scale(${ox})`}>
                  <circle r={26} fill={VIOLET} />
                  <text y={12} textAnchor="middle" fontFamily={anton.fontFamily} fontSize={34} fill="#1b1030">O</text>
                </g>
              ) : null}
            </g>
          );
        })}
      </svg>
      <div style={{position: 'absolute', left: 0, right: 0, bottom: 0, display: 'flex', justifyContent: 'center'}}>
        <div style={{opacity: ox, transform: `scale(${interpolate(ox, [0, 1], [0.6, 1])})`, background: '#1b1030', border: `4px solid ${VIOLET}`, borderRadius: 999, padding: '14px 48px', fontFamily: anton.fontFamily, fontSize: 48, letterSpacing: 3, color: WHITE}}>{oxChip}</div>
      </div>
    </div>
  );
};

// Beat 5: three chains, different sequences, different numbers of sensitive links.
const Seq: React.FC<{chip: string; chipAt: number}> = ({chip, chipAt}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const rows = [[], [3], [1, 3, 5, 6]];
  const c = spring({frame: frame - chipAt, fps, config: {damping: 11, stiffness: 220}});
  return (
    <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 56}}>
      {rows.map((sens, r) => {
        const sp = spring({frame: frame - r * 8, fps, config: {damping: 13, stiffness: 150}});
        return (
          <svg key={r} width={900} height={120} style={{opacity: sp, transform: `translateX(${interpolate(sp, [0, 1], [r % 2 ? 120 : -120, 0])}px)`}}>
            <line x1={60} y1={60} x2={840} y2={60} stroke={TEAL} strokeWidth={6} opacity={0.5} />
            {Array.from({length: 8}).map((_, i) => {
              const hot = sens.includes(i);
              const col = hot ? AMBER : TEAL;
              return <circle key={i} cx={60 + (i * 780) / 7} cy={60} r={38} fill={BG} stroke={col} strokeWidth={7} style={{filter: `drop-shadow(0 0 ${hot ? 22 : 8}px ${col})`}} />;
            })}
          </svg>
        );
      })}
      <div style={{opacity: c, transform: `scale(${interpolate(c, [0, 1], [0.6, 1])})`, background: TEAL_DEEP, border: `4px solid ${TEAL}`, borderRadius: 999, padding: '16px 44px', fontFamily: anton.fontFamily, fontSize: 46, letterSpacing: 2, color: WHITE, boxShadow: '0 0 70px rgba(42,182,201,0.4)'}}>{chip}</div>
    </div>
  );
};

// Beat 6: label card, SOURCE VERIFIED, and a carton that closes over the pen and blocks light.
const LabelCarton: React.FC<{title: string; line1: string; line2: string; cartonAt: number; boxLabel: string; sourceLabel: string; source: string}> = ({title, line1, line2, cartonAt, boxLabel, sourceLabel, source}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const flip = spring({frame, fps, config: {damping: 14, stiffness: 120}});
  const chip = spring({frame: frame - 40, fps, config: {damping: 12, stiffness: 200}});
  const carton = spring({frame: frame - cartonAt, fps, config: {damping: 14, stiffness: 140}});
  const boxW = 520;
  const boxH = 380;
  return (
    <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 34}}>
      <div style={{transform: `perspective(1400px) rotateY(${interpolate(flip, [0, 1], [-70, 0])}deg)`, opacity: flip, background: '#f2f4f5', borderRadius: 24, width: 880, padding: '36px 50px', boxShadow: '0 30px 90px rgba(0,0,0,0.55)', borderTop: `10px solid ${AMBER}`}}>
        <div style={{fontFamily: anton.fontFamily, fontSize: 50, color: '#0e2a30', letterSpacing: 1}}>{title}</div>
        <div style={{height: 3, background: '#c9d4da', margin: '16px 0 20px'}} />
        <div style={{fontFamily: archivo.fontFamily, fontWeight: 700, fontSize: 42, color: '#1c3a42'}}>{line1}</div>
        <div style={{fontFamily: archivo.fontFamily, fontWeight: 700, fontSize: 42, color: '#1c3a42', marginTop: 12}}>{line2}</div>
      </div>
      <div style={{opacity: chip, transform: `translateY(${interpolate(chip, [0, 1], [30, 0])}px)`, display: 'flex', alignItems: 'center', gap: 18, background: 'rgba(10,18,24,0.92)', border: `3px solid ${TEAL}`, borderRadius: 999, padding: '14px 34px', maxWidth: 960}}>
        <div style={{width: 34, height: 34, borderRadius: 999, background: TEAL, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: anton.fontFamily, fontSize: 24, color: '#04262b', flexShrink: 0}}>{'✓'}</div>
        <div style={{fontFamily: anton.fontFamily, fontSize: 30, letterSpacing: 2, color: TEAL, flexShrink: 0}}>{sourceLabel}</div>
        <div style={{fontFamily: archivo.fontFamily, fontWeight: 700, fontSize: 26, color: MUTED}}>{source}</div>
      </div>
      <div style={{position: 'relative', width: 900, height: boxH + 60, opacity: chip}}>
        <Photons w={900} h={boxH + 60} start={0} stopY={carton > 0.5 ? 40 : undefined} n={12} />
        <svg width={900} height={boxH + 60} style={{position: 'absolute', left: 0, top: 0}}>
          <rect x={450 - 40} y={150} width={80} height={250} rx={36} fill="#dfe7ea" stroke={TEAL} strokeWidth={6} />
          <rect x={450 - 40} y={150} width={80} height={56} rx={20} fill={TEAL_DEEP} />
        </svg>
        <div
          style={{
            position: 'absolute',
            left: 450 - boxW / 2,
            top: interpolate(carton, [0, 1], [-280, 40]),
            width: boxW,
            height: boxH,
            opacity: carton,
            borderRadius: 18,
            border: '8px solid ' + TEAL,
            background: 'linear-gradient(180deg, rgba(10,30,36,0.74), rgba(10,30,36,0.52))',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            padding: 20,
          }}
        >
          <div style={{borderBottom: '4px solid rgba(42,182,201,0.5)', paddingBottom: 12, fontFamily: anton.fontFamily, fontSize: 34, letterSpacing: 3, color: TEAL}}>{boxLabel}</div>
          <div style={{display: 'flex', justifyContent: 'flex-end'}}>
            <Img src={staticFile('mutoryx-white.png')} style={{width: 150, opacity: 0.85}} />
          </div>
        </div>
      </div>
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
      <div style={{opacity: s, transform: `scale(${interpolate(s, [0, 1], [0.6, 1])})`, background: TEAL_DEEP, border: `5px solid ${TEAL}`, borderRadius: 30, padding: '28px 70px', fontFamily: anton.fontFamily, fontSize: 96, color: WHITE, boxShadow: '0 0 90px rgba(42,182,201,0.45)'}}>{line1}</div>
      <div style={{opacity: l2, transform: `scale(${interpolate(l2, [0, 1], [0.7, 1])})`, background: '#1a1206', border: `5px solid ${AMBER}`, borderRadius: 30, padding: '20px 60px', fontFamily: anton.fontFamily, fontSize: 72, color: AMBER}}>{line2}</div>
    </div>
  );
};

export const S2Day6: React.FC<{locale: S2Day6Config}> = ({locale}) => {
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

      <Sequence {...span(L.chain)}>
        <AbsoluteFill style={{alignItems: 'center', paddingTop: 620}}>
          <Chain photonsAt={rel(L.chain.photonsAt, L.chain)} litAt={rel(L.chain.litAt, L.chain)} oxAt={rel(L.chain.oxAt, L.chain)} trp={L.chain.trp} tyr={L.chain.tyr} oxChip={L.chain.oxChip} />
        </AbsoluteFill>
      </Sequence>

      <Sequence {...span(L.seq)}>
        <AbsoluteFill style={{alignItems: 'center', paddingTop: 700}}>
          <Seq chip={L.seq.chip} chipAt={rel(L.seq.chipAt, L.seq)} />
        </AbsoluteFill>
      </Sequence>

      <Sequence {...span(L.label)}>
        <AbsoluteFill style={{alignItems: 'center', paddingTop: 620}}>
          <LabelCarton title={L.label.title} line1={L.label.line1} line2={L.label.line2} cartonAt={rel(L.label.cartonAt, L.label)} boxLabel={L.label.boxLabel} sourceLabel={L.label.sourceLabel} source={L.label.source} />
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

export const S2DAY6_EN: S2Day6Config = {
  id: 'S2Day6EN',
  flag: 'us',
  voFile: 's2-d6-vo-en.mp3',
  cues: [
    {from: 0.05, to: 3.46, lines: ['NOT JUST', 'TEMPERATURE.']},
    {from: 3.46, to: 4.47, lines: ['LIGHT', 'TOO.'], teal: 1},
    {from: 4.47, to: 7.19, lines: ['A PEPTIDE IS A CHAIN', 'OF AMINO ACIDS.'], teal: 1},
    {from: 7.19, to: 11.61, lines: ['SOME LINKS', 'ABSORB LIGHT.']},
    {from: 11.61, to: 14.38, lines: ['TRYPTOPHAN.', 'TYROSINE.'], teal: 1},
    {from: 14.38, to: 18.11, lines: ['THEY CAN', 'OXIDIZE.']},
    {from: 18.11, to: 21.93, lines: ['SAME LOOK.', 'CHANGED MOLECULE.'], teal: 1},
    {from: 21.93, to: 26.59, lines: ['NOT EVERY PEPTIDE', 'IS EQUALLY SENSITIVE.']},
    {from: 26.59, to: 30.68, lines: ['WHICH CHAINS?', 'STAY TUNED.'], teal: 1},
    {from: 30.68, to: 34.02, lines: ['MANY LABELS SAY:', 'PROTECT FROM LIGHT.'], teal: 1},
    {from: 34.02, to: 38.28, lines: ['THE BOX IS PART', 'OF THE INSTRUCTIONS.']},
    {from: 38.28, to: 40.36, lines: ['LIGHT IS A CLOCK', 'YOU CANNOT SEE.'], teal: 1},
    {from: 40.36, to: 43.75, lines: ['DAY 6 OF 10.', 'THE MATH DOESN’T LIE.'], teal: 1},
  ],
  clips: [
    {src: 's2-clip6.mp4', from: 0, dur: 4.47},
    {src: 's2-clip4.mp4', from: 40.36, dur: 3.39},
  ],
  chain: {from: 4.47, to: 21.93, photonsAt: 7.19, litAt: 11.61, oxAt: 14.9, trp: 'TRP', tyr: 'TYR', oxChip: 'OXIDATION'},
  seq: {from: 21.93, to: 30.68, chip: 'DEPENDS ON THE SEQUENCE', chipAt: 24.86},
  label: {
    from: 30.68,
    to: 38.28,
    title: 'MANY PEPTIDE LABELS',
    line1: 'Protect from light',
    line2: 'Keep it in the outer box until use',
    cartonAt: 34.02,
    boxLabel: 'OUTER BOX',
    sourceLabel: 'SOURCE VERIFIED',
    source: 'Kerwin & Remmele, J Pharm Sci 2007 (photo-oxidation)',
  },
  verdict: {from: 38.28, to: 40.36, line1: 'LIGHT IS A CLOCK', line2: 'YOU CANNOT SEE'},
  endFrom: 43.75,
  dayChip: {from: 43.75, label: 'DAY 6 OF 10'},
  disclaimer: 'Educational tool. Not medical advice. For research purposes only.',
  durationSec: 50,
};

export const S2DAY6_PT: S2Day6Config = {
  id: 'S2Day6PT',
  flag: 'br',
  voFile: 's2-d6-vo-pt.mp3',
  cues: [
    {from: 0.05, to: 3.24, lines: ['NÃO É SÓ A', 'TEMPERATURA.']},
    {from: 3.24, to: 4.65, lines: ['A LUZ', 'TAMBÉM.'], teal: 1},
    {from: 4.65, to: 7.2, lines: ['UM PEPTÍDEO É UMA CADEIA', 'DE AMINOÁCIDOS.'], teal: 1},
    {from: 7.2, to: 11.93, lines: ['ALGUNS ELOS', 'ABSORVEM LUZ.']},
    {from: 11.93, to: 14.61, lines: ['TRIPTOFANO.', 'TIROSINA.'], teal: 1},
    {from: 14.61, to: 18.16, lines: ['ELES PODEM', 'OXIDAR.']},
    {from: 18.16, to: 21.71, lines: ['MESMA APARÊNCIA.', 'MOLÉCULA MUDADA.'], teal: 1},
    {from: 21.71, to: 26.07, lines: ['NEM TODO PEPTÍDEO', 'É IGUALMENTE SENSÍVEL.']},
    {from: 26.07, to: 30.57, lines: ['QUAIS CADEIAS?', 'FIQUE LIGADO.'], teal: 1},
    {from: 30.57, to: 34.56, lines: ['MUITOS RÓTULOS DIZEM:', 'PROTEGER DA LUZ.'], teal: 1},
    {from: 34.56, to: 39.17, lines: ['A CAIXA FAZ PARTE', 'DAS INSTRUÇÕES.']},
    {from: 39.17, to: 41.94, lines: ['A LUZ É UM RELÓGIO', 'QUE VOCÊ NÃO VÊ.'], teal: 1},
    {from: 41.94, to: 45.7, lines: ['DIA 6 DE 10.', 'A MATEMÁTICA NÃO MENTE.'], teal: 1},
  ],
  clips: [
    {src: 's2-clip6.mp4', from: 0, dur: 4.65},
    {src: 's2-clip4.mp4', from: 41.94, dur: 3.76},
  ],
  chain: {from: 4.65, to: 21.71, photonsAt: 7.2, litAt: 11.93, oxAt: 15.1, trp: 'TRP', tyr: 'TIR', oxChip: 'OXIDAÇÃO'},
  seq: {from: 21.71, to: 30.57, chip: 'DEPENDE DA SEQUÊNCIA', chipAt: 24.46},
  label: {
    from: 30.57,
    to: 39.17,
    title: 'MUITOS RÓTULOS DE PEPTÍDEOS',
    line1: 'Proteger da luz',
    line2: 'Manter na caixa externa até o uso',
    cartonAt: 34.56,
    boxLabel: 'CAIXA EXTERNA',
    sourceLabel: 'FONTE VERIFICADA',
    source: 'Kerwin & Remmele, J Pharm Sci 2007 (fotooxidação)',
  },
  verdict: {from: 39.17, to: 41.94, line1: 'A LUZ É UM RELÓGIO', line2: 'QUE VOCÊ NÃO VÊ'},
  endFrom: 45.7,
  dayChip: {from: 45.7, label: 'DIA 6 DE 10'},
  disclaimer: 'Ferramenta educacional. Não é orientação médica. Somente para fins de pesquisa.',
  durationSec: 52,
};

export const S2DAY6_ES: S2Day6Config = {
  id: 'S2Day6ES',
  flag: 'mx',
  voFile: 's2-d6-vo-es.mp3',
  cues: [
    {from: 0.05, to: 3.84, lines: ['NO SOLO LA', 'TEMPERATURA.']},
    {from: 3.84, to: 5.72, lines: ['LA LUZ', 'TAMBIÉN.'], teal: 1},
    {from: 5.72, to: 9.0, lines: ['UN PÉPTIDO ES UNA CADENA', 'DE AMINOÁCIDOS.'], teal: 1},
    {from: 9.0, to: 14.56, lines: ['ALGUNOS ESLABONES', 'ABSORBEN LUZ.']},
    {from: 14.56, to: 18.24, lines: ['TRIPTÓFANO.', 'TIROSINA.'], teal: 1},
    {from: 18.24, to: 22.58, lines: ['PUEDEN', 'OXIDARSE.']},
    {from: 22.58, to: 27.06, lines: ['SE VE IGUAL.', 'MOLÉCULA CAMBIADA.'], teal: 1},
    {from: 27.06, to: 32.92, lines: ['NO TODOS LOS PÉPTIDOS', 'SON IGUAL DE SENSIBLES.']},
    {from: 32.92, to: 38.26, lines: ['¿QUÉ CADENAS?', 'MANTENTE ATENTO.'], teal: 1},
    {from: 38.26, to: 43.09, lines: ['MUCHAS ETIQUETAS DICEN:', 'PROTEGER DE LA LUZ.'], teal: 1},
    {from: 43.09, to: 49.08, lines: ['LA CAJA ES PARTE', 'DE LAS INSTRUCCIONES.']},
    {from: 49.08, to: 52.1, lines: ['LA LUZ ES UN RELOJ', 'QUE NO PUEDES VER.'], teal: 1},
    {from: 52.1, to: 57.33, lines: ['DÍA 6 DE 10.', 'LAS CUENTAS NO MIENTEN.'], teal: 1},
  ],
  clips: [
    {src: 's2-clip6.mp4', from: 0, dur: 5.72},
    {src: 's2-clip4.mp4', from: 52.1, dur: 5.23},
  ],
  chain: {from: 5.72, to: 27.06, photonsAt: 9.0, litAt: 14.56, oxAt: 18.9, trp: 'TRP', tyr: 'TIR', oxChip: 'OXIDACIÓN'},
  seq: {from: 27.06, to: 38.26, chip: 'DEPENDE DE LA SECUENCIA', chipAt: 30.61},
  label: {
    from: 38.26,
    to: 49.08,
    title: 'MUCHAS ETIQUETAS DE PÉPTIDOS',
    line1: 'Proteger de la luz',
    line2: 'Guardar en la caja exterior hasta su uso',
    cartonAt: 43.09,
    boxLabel: 'CAJA EXTERIOR',
    sourceLabel: 'FUENTE VERIFICADA',
    source: 'Kerwin & Remmele, J Pharm Sci 2007 (fotooxidación)',
  },
  verdict: {from: 49.08, to: 52.1, line1: 'LA LUZ ES UN RELOJ', line2: 'QUE NO PUEDES VER'},
  endFrom: 57.33,
  dayChip: {from: 57.33, label: 'DÍA 6 DE 10'},
  disclaimer: 'Herramienta educativa. No es consejo médico. Solo con fines de investigación.',
  durationSec: 63,
};
