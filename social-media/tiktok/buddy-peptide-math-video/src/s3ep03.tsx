import React from 'react';
import {AbsoluteFill, Audio, interpolate, OffthreadVideo, Sequence, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {loadFont as loadAnton} from '@remotion/google-fonts/Anton';
import {loadFont as loadArchivo} from '@remotion/google-fonts/Archivo';
import type {Cue} from './locales';
import {BG, Buddy, Caption, FPS, Flag, Glow, Logo, TEAL, TEAL_DEEP, WHITE} from './Video';
import {AMBER, Pill} from './s3ep01';

const anton = loadAnton();
const archivo = loadArchivo();

type ClipCfg = {src: string; from: number; dur: number; muted?: boolean};
type Span = {from: number; to: number};

type S3Ep3Config = {
  id: string;
  flag: 'us' | 'mx' | 'br';
  voFile: string;
  cues: Cue[];
  clips: ClipCfg[];
  single: Span & {label: string};
  growPeptide: Span & {countTo: number; chip: string};
  growProtein: Span & {countTo: number; chip: string; note: string; noteAt: number};
  compare: Span & {pepCount: number; protCount: number; pepLabel: string; protLabel: string; pepAt: number; protAt: number};
  verdict: Span & {line2At: number; line1: string; line2: string};
  buddyClip: string;
  endFrom: number;
  seriesChip: string;
  disclaimer: string;
  durationSec: number;
};

const Cinematic: React.FC<{src: string; muted?: boolean}> = ({src, muted = true}) => {
  const frame = useCurrentFrame();
  const fade = interpolate(frame, [0, 10], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return (
    <AbsoluteFill style={{opacity: fade, alignItems: 'center', paddingTop: 300}}>
      <div style={{width: 900, height: 1600, borderRadius: 36, overflow: 'hidden', WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, black 6%, black 90%, transparent 100%)'}}>
        <OffthreadVideo src={staticFile(src)} muted={muted} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
      </div>
    </AbsoluteFill>
  );
};

// Looping insert of Buddy pointing up at the verdict labels, sized and placed so his raised arm reads as pointing at the cards above.
const BuddyPointClip: React.FC<{src: string}> = ({src}) => {
  const frame = useCurrentFrame();
  const fade = interpolate(frame, [0, 12], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return (
    <AbsoluteFill style={{justifyContent: 'flex-end', alignItems: 'center', paddingBottom: 210, opacity: fade}}>
      <div style={{width: 460, height: 460, marginLeft: 130, borderRadius: '50%', overflow: 'hidden', WebkitMaskImage: 'radial-gradient(circle, black 55%, transparent 78%)'}}>
        <OffthreadVideo src={staticFile(src)} muted style={{width: '100%', height: '100%', objectFit: 'cover'}} />
      </div>
    </AbsoluteFill>
  );
};

// A row of n beads evenly spaced across `width`, connected by a line. n === 1 centers a lone bead.
const BeadRow: React.FC<{n: number; width: number; cy: number; r?: number; color?: string}> = ({n, width, cy, r = 30, color = TEAL}) => {
  const frame = useCurrentFrame();
  const pts = n <= 1 ? [{x: width / 2, y: cy}] : Array.from({length: n}).map((_, i) => ({x: 50 + (i * (width - 100)) / (n - 1), y: cy + Math.sin(i * 0.9 + frame / 22) * 12}));
  return (
    <g>
      {n > 1 ? <polyline points={pts.map((p) => `${p.x},${p.y}`).join(' ')} fill="none" stroke={color} strokeWidth={5} opacity={0.5} /> : null}
      {pts.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r={r} fill={BG} stroke={color} strokeWidth={6} style={{filter: `drop-shadow(0 0 8px ${color})`}} />
      ))}
    </g>
  );
};

// Beat 2: one amino acid, alone.
const SingleBead: React.FC<{label: string}> = ({label}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const s = spring({frame, fps, config: {damping: 13, stiffness: 150}});
  const c = spring({frame: frame - 14, fps, config: {damping: 12, stiffness: 190}});
  return (
    <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 44, opacity: s}}>
      <svg width={300} height={300}>
        <BeadRow n={1} width={300} cy={150} r={70} color={TEAL} />
      </svg>
      <Pill text={label} color={TEAL} sp={c} bg={TEAL_DEEP} />
    </div>
  );
};

// Beats 3-4: the chain grows from countFrom to countTo across the sequence, a chip labels the result.
const GrowChain: React.FC<{countFrom: number; countTo: number; chip: string; chipColor: string; rows?: number}> = ({countFrom, countTo, chip, chipColor, rows = 1}) => {
  const frame = useCurrentFrame();
  const {fps, durationInFrames} = useVideoConfig();
  const s = spring({frame, fps, config: {damping: 13, stiffness: 140}});
  const n = Math.max(1, Math.round(interpolate(frame, [0, durationInFrames * 0.7], [countFrom, countTo], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})));
  const c = spring({frame: frame - durationInFrames * 0.6, fps, config: {damping: 12, stiffness: 190}});
  const perRow = Math.ceil(n / rows);
  return (
    <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 40, opacity: s}}>
      <svg width={980} height={rows * 130}>
        {Array.from({length: rows}).map((_, r) => {
          const rowN = Math.max(0, Math.min(perRow, n - r * perRow));
          if (rowN <= 0) return null;
          return <BeadRow key={r} n={rowN} width={940} cy={65 + r * 130} r={rows > 1 ? 20 : 32} color={rowN < countTo && r === rows - 1 && rowN === perRow ? TEAL : TEAL} />;
        })}
      </svg>
      <Pill text={chip} color={chipColor} sp={c} bg={chipColor === TEAL ? TEAL_DEEP : '#1a1206'} />
    </div>
  );
};

// Beats 5-6: short chain vs long chain, stacked for direct comparison.
const Compare: React.FC<{pepCount: number; protCount: number; pepLabel: string; protLabel: string; pepAt: number; protAt: number}> = ({pepCount, protCount, pepLabel, protLabel, pepAt, protAt}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const s = spring({frame, fps, config: {damping: 13, stiffness: 140}});
  const pep = interpolate(frame, [pepAt, pepAt + 12], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const prot = interpolate(frame, [protAt, protAt + 12], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return (
    <div style={{position: 'relative', width: 980, height: 640, opacity: s}}>
      <svg width={760} height={260} style={{position: 'absolute', left: 110, top: 0}}>
        <BeadRow n={pepCount} width={760} cy={100} r={34} color={TEAL} />
      </svg>
      <div style={{position: 'absolute', left: 0, right: 0, top: 220, display: 'flex', justifyContent: 'center', opacity: pep, transform: `scale(${interpolate(pep, [0, 1], [0.7, 1])})`}}>
        <Pill text={pepLabel} color={TEAL} sp={1} bg={TEAL_DEEP} />
      </div>
      <svg width={900} height={280} style={{position: 'absolute', left: 40, top: 340}}>
        <BeadRow n={protCount} width={900} cy={120} r={17} color={AMBER} />
      </svg>
      <div style={{position: 'absolute', left: 0, right: 0, top: 570, display: 'flex', justifyContent: 'center', opacity: prot, transform: `scale(${interpolate(prot, [0, 1], [0.7, 1])})`}}>
        <Pill text={protLabel} color={AMBER} sp={1} bg="#1a1206" />
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
    <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 70}}>
      <div style={{opacity: s, transform: `scale(${interpolate(s, [0, 1], [0.6, 1])})`, background: TEAL_DEEP, border: `5px solid ${TEAL}`, borderRadius: 30, padding: '30px 60px', fontFamily: anton.fontFamily, fontSize: 80, color: WHITE, textAlign: 'center', maxWidth: 980, boxShadow: '0 0 90px rgba(42,182,201,0.45)'}}>{line1}</div>
      <div style={{opacity: l2, transform: `scale(${interpolate(l2, [0, 1], [0.7, 1])})`, background: '#1a1206', border: `5px solid ${AMBER}`, borderRadius: 30, padding: '22px 50px', fontFamily: anton.fontFamily, fontSize: 54, color: AMBER, textAlign: 'center', maxWidth: 980}}>{line2}</div>
    </div>
  );
};

export const S3Ep3: React.FC<{locale: S3Ep3Config}> = ({locale}) => {
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
          <Cinematic src={c.src} muted={c.muted} />
        </Sequence>
      ))}

      <Sequence {...span(L.single)}>
        <AbsoluteFill style={{alignItems: 'center', paddingTop: 780}}>
          <SingleBead label={L.single.label} />
        </AbsoluteFill>
      </Sequence>

      <Sequence {...span(L.growPeptide)}>
        <AbsoluteFill style={{alignItems: 'center', paddingTop: 780}}>
          <GrowChain countFrom={1} countTo={L.growPeptide.countTo} chip={L.growPeptide.chip} chipColor={TEAL} />
        </AbsoluteFill>
      </Sequence>

      <Sequence {...span(L.growProtein)}>
        <AbsoluteFill style={{alignItems: 'center', paddingTop: 640}}>
          <GrowChain countFrom={L.growPeptide.countTo} countTo={L.growProtein.countTo} chip={L.growProtein.chip} chipColor={AMBER} rows={3} />
        </AbsoluteFill>
      </Sequence>

      <Sequence {...span(L.compare)}>
        <AbsoluteFill style={{alignItems: 'center', paddingTop: 620}}>
          <Compare pepCount={L.compare.pepCount} protCount={L.compare.protCount} pepLabel={L.compare.pepLabel} protLabel={L.compare.protLabel} pepAt={rel(L.compare.pepAt, L.compare)} protAt={rel(L.compare.protAt, L.compare)} />
        </AbsoluteFill>
      </Sequence>

      <Sequence {...span(L.verdict)}>
        <AbsoluteFill style={{alignItems: 'center', paddingTop: 560}}>
          <Verdict line2At={rel(L.verdict.line2At, L.verdict)} line1={L.verdict.line1} line2={L.verdict.line2} />
        </AbsoluteFill>
      </Sequence>

      <Sequence {...span(L.verdict)}>
        <BuddyPointClip src={L.buddyClip} />
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

export const S3EP3_EN: S3Ep3Config = {
  id: 'S3Ep3EN',
  flag: 'us',
  voFile: 's3-e03-vo-en.mp3',
  cues: [
    {from: 0.05, to: 1.86, lines: ['THIS IS AN', 'AMINO-CHAIN.'], teal: 1},
    {from: 1.86, to: 7.03, lines: ['JUST AMINO ACIDS,', 'LINKED ONE AFTER ANOTHER.']},
    {from: 7.03, to: 9.71, lines: ['ONE ALONE', 'DOESN’T DO MUCH.'], teal: 1},
    {from: 9.71, to: 12.41, lines: ['A FEW LINKED:', 'THAT’S A PEPTIDE.']},
    {from: 12.41, to: 16.26, lines: ['KEEP LINKING:', 'IT BECOMES A PROTEIN.'], teal: 1},
    {from: 16.26, to: 18.53, lines: ['SAME BUILDING', 'BLOCKS, EVERY TIME.']},
    {from: 18.53, to: 23.09, lines: ['THE ONLY DIFFERENCE:', 'HOW MANY, AND WHAT ORDER.'], teal: 1},
    {from: 23.09, to: 25.09, lines: ['SHORT CHAIN:', 'PEPTIDE.']},
    {from: 25.09, to: 27.19, lines: ['LONG CHAIN:', 'PROTEIN.'], teal: 1},
    {from: 27.19, to: 28.58, lines: ['THAT’S THE', 'WHOLE IDEA.'], teal: 1},
    {from: 28.58, to: 30.51, lines: ['FOLLOW FOR MORE', 'PEPTIDE MATH.'], teal: 1},
  ],
  clips: [
    {src: 's3-e03-chain-hero.mp4', from: 0, dur: 5.03},
  ],
  single: {from: 5.03, to: 9.71, label: 'AMINO ACID'},
  growPeptide: {from: 9.71, to: 12.41, countTo: 4, chip: 'PEPTIDE'},
  growProtein: {from: 12.41, to: 18.53, countTo: 16, chip: 'PROTEIN', note: 'SAME BUILDING BLOCKS', noteAt: 16.26},
  compare: {from: 18.53, to: 27.19, pepCount: 4, protCount: 16, pepLabel: 'PEPTIDE', protLabel: 'PROTEIN', pepAt: 23.09, protAt: 25.09},
  verdict: {from: 27.19, to: 30.51, line2At: 28.58, line1: 'SAME BUILDING BLOCKS.', line2: 'LENGTH DECIDES THE NAME.'},
  buddyClip: 's3-e03-buddy-point.mp4',
  endFrom: 30.51,
  seriesChip: 'INSIDE THE VIAL',
  disclaimer: 'Educational tool. Not medical advice. For research purposes only.',
  durationSec: 36,
};

export const S3EP3_PT: S3Ep3Config = {
  id: 'S3Ep3PT',
  flag: 'br',
  voFile: 's3-e03-vo-pt.mp3',
  cues: [
    {from: 0.1, to: 2.29, lines: ['ISTO É UMA', 'CADEIA DE AMINOÁCIDOS.'], teal: 1},
    {from: 2.24, to: 6.76, lines: ['É SÓ AMINOÁCIDOS,', 'LIGADOS UM APÓS O OUTRO.']},
    {from: 6.76, to: 9.49, lines: ['UM SOZINHO', 'NÃO FAZ MUITA COISA.'], teal: 1},
    {from: 9.49, to: 11.91, lines: ['ALGUNS LIGADOS:', 'É UM PEPTÍDEO.']},
    {from: 11.91, to: 15.62, lines: ['CONTINUE LIGANDO:', 'VIRA UMA PROTEÍNA.'], teal: 1},
    {from: 15.62, to: 17.54, lines: ['OS MESMOS BLOCOS,', 'SEMPRE.']},
    {from: 17.54, to: 22.26, lines: ['A ÚNICA DIFERENÇA:', 'QUANTOS ELOS, E EM QUE ORDEM.'], teal: 1},
    {from: 22.26, to: 24.29, lines: ['CADEIA CURTA:', 'PEPTÍDEO.']},
    {from: 24.29, to: 26.2, lines: ['CADEIA LONGA:', 'PROTEÍNA.'], teal: 1},
    {from: 26.2, to: 27.65, lines: ['ESSA É', 'TODA A IDEIA.'], teal: 1},
    {from: 27.65, to: 31.2, lines: ['SIGA PARA MAIS', 'MATEMÁTICA DOS PEPTÍDEOS.'], teal: 1},
  ],
  clips: [{src: 's3-e03-chain-hero.mp4', from: 0, dur: 5.03}],
  single: {from: 5.03, to: 9.49, label: 'AMINOÁCIDO'},
  growPeptide: {from: 9.49, to: 11.91, countTo: 4, chip: 'PEPTÍDEO'},
  growProtein: {from: 11.91, to: 17.54, countTo: 16, chip: 'PROTEÍNA', note: 'OS MESMOS BLOCOS', noteAt: 15.62},
  compare: {from: 17.54, to: 26.2, pepCount: 4, protCount: 16, pepLabel: 'PEPTÍDEO', protLabel: 'PROTEÍNA', pepAt: 22.26, protAt: 24.29},
  verdict: {from: 26.2, to: 31.2, line2At: 27.65, line1: 'OS MESMOS BLOCOS.', line2: 'O TAMANHO DEFINE O NOME.'},
  buddyClip: 's3-e03-buddy-point.mp4',
  endFrom: 31.2,
  seriesChip: 'DENTRO DO FRASCO',
  disclaimer: 'Ferramenta educacional. Não é orientação médica. Somente para fins de pesquisa.',
  durationSec: 37,
};

export const S3EP3_ES: S3Ep3Config = {
  id: 'S3Ep3ES',
  flag: 'mx',
  voFile: 's3-e03-vo-es.mp3',
  cues: [
    {from: 0.1, to: 2.99, lines: ['ESTO ES UNA', 'CADENA DE AMINOÁCIDOS.'], teal: 1},
    {from: 2.99, to: 8.28, lines: ['SON SOLO AMINOÁCIDOS,', 'UNIDOS UNO TRAS OTRO.']},
    {from: 8.28, to: 11.22, lines: ['UNO SOLO', 'NO HACE MUCHO.'], teal: 1},
    {from: 11.22, to: 14.65, lines: ['UNE UNOS CUANTOS:', 'ES UN PÉPTIDO.']},
    {from: 14.65, to: 20.08, lines: ['SIGUE UNIENDO:', 'SE CONVIERTE EN PROTEÍNA.'], teal: 1},
    {from: 20.08, to: 22.97, lines: ['LOS MISMOS BLOQUES,', 'SIEMPRE.']},
    {from: 22.97, to: 28.31, lines: ['LA ÚNICA DIFERENCIA:', 'CUÁNTOS ESLABONES, Y EN QUÉ ORDEN.'], teal: 1},
    {from: 28.31, to: 30.98, lines: ['CADENA CORTA:', 'PÉPTIDO.']},
    {from: 30.98, to: 33.75, lines: ['CADENA LARGA:', 'PROTEÍNA.'], teal: 1},
    {from: 33.75, to: 36.05, lines: ['ESA ES', 'TODA LA IDEA.'], teal: 1},
    {from: 36.05, to: 39.52, lines: ['SÍGUENOS PARA MÁS', 'MATEMÁTICA DE PÉPTIDOS.'], teal: 1},
  ],
  clips: [{src: 's3-e03-chain-hero.mp4', from: 0, dur: 5.03}],
  single: {from: 5.03, to: 11.22, label: 'AMINOÁCIDO'},
  growPeptide: {from: 11.22, to: 14.65, countTo: 4, chip: 'PÉPTIDO'},
  growProtein: {from: 14.65, to: 22.97, countTo: 16, chip: 'PROTEÍNA', note: 'LOS MISMOS BLOQUES', noteAt: 20.08},
  compare: {from: 22.97, to: 33.75, pepCount: 4, protCount: 16, pepLabel: 'PÉPTIDO', protLabel: 'PROTEÍNA', pepAt: 28.31, protAt: 30.98},
  verdict: {from: 33.75, to: 39.52, line2At: 36.05, line1: 'LOS MISMOS BLOQUES.', line2: 'EL TAMAÑO DEFINE EL NOMBRE.'},
  buddyClip: 's3-e03-buddy-point.mp4',
  endFrom: 39.52,
  seriesChip: 'DENTRO DEL VIAL',
  disclaimer: 'Herramienta educativa. No es consejo médico. Solo con fines de investigación.',
  durationSec: 45,
};
