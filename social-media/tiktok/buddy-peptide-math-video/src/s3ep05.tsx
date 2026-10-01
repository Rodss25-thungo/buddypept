import React from 'react';
import {AbsoluteFill, Audio, interpolate, OffthreadVideo, Sequence, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {loadFont as loadAnton} from '@remotion/google-fonts/Anton';
import {loadFont as loadArchivo} from '@remotion/google-fonts/Archivo';
import type {Cue} from './locales';
import {BG, Buddy, Caption, FPS, Flag, Glow, Logo, TEAL, TEAL_DEEP, WHITE} from './Video';
import {AMBER} from './s3ep01';

const anton = loadAnton();
const archivo = loadArchivo();
const VIOLET = '#a78bfa';

type Span = {from: number; to: number};

type S3Ep5Config = {
  id: string;
  flag: 'us' | 'mx' | 'br';
  voFile: string;
  cues: Cue[];
  letters: string[]; // chain A, 6 one-letter codes
  swapIndex: number; // which bead changes
  swapTo: string; // chain B's letter at that index
  chainReveal: Span;
  isolate: Span & {label: string};
  swap: Span & {flipAt: number};
  compare: Span & {labelA: string; labelB: string};
  verdict: Span & {line2At: number; line1: string; line2: string};
  endFrom: number;
  seriesChip: string;
  disclaimer: string;
  durationSec: number;
};

// One letter-labeled bead. `state` picks the glow color; `scale` lets a single bead pop out.
const Bead: React.FC<{x: number; y: number; letter: string; state: 'teal' | 'amber' | 'violet' | 'dim'; r?: number; scale?: number}> = ({x, y, letter, state, r = 46, scale = 1}) => {
  const color = state === 'violet' ? VIOLET : state === 'amber' ? AMBER : TEAL;
  const opacity = state === 'dim' ? 0.35 : 1;
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`} opacity={opacity}>
      <circle r={r} fill={BG} stroke={color} strokeWidth={6} style={{filter: `drop-shadow(0 0 10px ${color})`}} />
      <text y={anton.fontFamily ? 14 : 14} textAnchor="middle" fontFamily={anton.fontFamily} fontSize={38} fill={color}>
        {letter}
      </text>
    </g>
  );
};

// A horizontal row of lettered beads connected by a line.
const LetterChain: React.FC<{letters: string[]; width: number; cy: number; r?: number; highlight?: number; highlightState?: 'amber' | 'violet'; dimOthers?: boolean}> = ({letters, width, cy, r = 46, highlight, highlightState, dimOthers}) => {
  const frame = useCurrentFrame();
  const n = letters.length;
  const pts = letters.map((_, i) => ({x: 60 + (i * (width - 120)) / (n - 1), y: cy + Math.sin(i * 0.9 + frame / 24) * 10}));
  return (
    <g>
      <polyline points={pts.map((p) => `${p.x},${p.y}`).join(' ')} fill="none" stroke={TEAL} strokeWidth={5} opacity={0.45} />
      {letters.map((l, i) => (
        <Bead key={i} x={pts[i].x} y={pts[i].y} letter={l} r={r} state={i === highlight ? highlightState ?? 'amber' : dimOthers && highlight !== undefined ? 'dim' : 'teal'} scale={i === highlight ? 1.25 : 1} />
      ))}
    </g>
  );
};

const ChainReveal: React.FC<{letters: string[]}> = ({letters}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const s = spring({frame, fps, config: {damping: 13, stiffness: 140}});
  return (
    <div style={{opacity: s}}>
      <svg width={980} height={220}>
        <LetterChain letters={letters} width={940} cy={110} />
      </svg>
    </div>
  );
};

const Isolate: React.FC<{letters: string[]; index: number; label: string}> = ({letters, index, label}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const s = spring({frame, fps, config: {damping: 13, stiffness: 140}});
  const pop = spring({frame: frame - 10, fps, config: {damping: 10, stiffness: 160}});
  return (
    <div style={{opacity: s}}>
      <svg width={980} height={260}>
        <LetterChain letters={letters} width={940} cy={110} highlight={index} highlightState="amber" dimOthers r={46} />
      </svg>
      <div style={{display: 'flex', justifyContent: 'center', marginTop: 30, opacity: pop}}>
        <div style={{background: '#1a1206', border: `5px solid ${AMBER}`, borderRadius: 999, padding: '14px 40px', fontFamily: anton.fontFamily, fontSize: 32, letterSpacing: 2, color: AMBER}}>{label}</div>
      </div>
    </div>
  );
};

// The Runway swap clip, with the actual letter change added as a crisp text overlay timed to the flash.
const SwapShot: React.FC<{letterFrom: string; letterTo: string; flipAtFrame: number}> = ({letterFrom, letterTo, flipAtFrame}) => {
  const frame = useCurrentFrame();
  const before = interpolate(frame, [flipAtFrame - 10, flipAtFrame - 2], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const after = interpolate(frame, [flipAtFrame + 2, flipAtFrame + 10], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return (
    <AbsoluteFill style={{background: BG}}>
      <OffthreadVideo src={staticFile('s3-e05-swap.mp4')} muted style={{width: '100%', height: '100%', objectFit: 'cover'}} />
      <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center'}}>
        <div style={{position: 'relative', width: 120, height: 120}}>
          <div style={{position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: before, fontFamily: anton.fontFamily, fontSize: 72, color: WHITE, textShadow: '0 0 20px rgba(0,0,0,0.8)'}}>{letterFrom}</div>
          <div style={{position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: after, fontFamily: anton.fontFamily, fontSize: 72, color: WHITE, textShadow: '0 0 20px rgba(0,0,0,0.8)'}}>{letterTo}</div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

const Compare: React.FC<{letters: string[]; swapIndex: number; swapTo: string; labelA: string; labelB: string}> = ({letters, swapIndex, swapTo, labelA, labelB}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const s = spring({frame, fps, config: {damping: 13, stiffness: 140}});
  const lettersB = letters.map((l, i) => (i === swapIndex ? swapTo : l));
  return (
    <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 50, opacity: s}}>
      <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 18}}>
        <svg width={980} height={180}>
          <LetterChain letters={letters} width={880} cy={90} r={38} highlight={swapIndex} highlightState="amber" />
        </svg>
        <div style={{fontFamily: anton.fontFamily, fontSize: 36, letterSpacing: 2, color: TEAL}}>{labelA}</div>
      </div>
      <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 18}}>
        <svg width={980} height={180}>
          <LetterChain letters={lettersB} width={880} cy={90} r={38} highlight={swapIndex} highlightState="violet" />
        </svg>
        <div style={{fontFamily: anton.fontFamily, fontSize: 36, letterSpacing: 2, color: VIOLET}}>{labelB}</div>
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
      <div style={{opacity: s, transform: `scale(${interpolate(s, [0, 1], [0.6, 1])})`, background: TEAL_DEEP, border: `5px solid ${TEAL}`, borderRadius: 30, padding: '30px 60px', fontFamily: anton.fontFamily, fontSize: 72, color: WHITE, textAlign: 'center', maxWidth: 980, boxShadow: '0 0 90px rgba(42,182,201,0.45)'}}>{line1}</div>
      <div style={{opacity: l2, transform: `scale(${interpolate(l2, [0, 1], [0.7, 1])})`, background: '#1a1206', border: `5px solid ${AMBER}`, borderRadius: 30, padding: '22px 50px', fontFamily: anton.fontFamily, fontSize: 54, color: AMBER, textAlign: 'center', maxWidth: 980}}>{line2}</div>
    </div>
  );
};

export const S3Ep5: React.FC<{locale: S3Ep5Config}> = ({locale}) => {
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

      <Sequence {...span(L.chainReveal)}>
        <AbsoluteFill style={{alignItems: 'center', paddingTop: 780}}>
          <ChainReveal letters={L.letters} />
        </AbsoluteFill>
      </Sequence>

      <Sequence {...span(L.isolate)}>
        <AbsoluteFill style={{alignItems: 'center', paddingTop: 740}}>
          <Isolate letters={L.letters} index={L.swapIndex} label={L.isolate.label} />
        </AbsoluteFill>
      </Sequence>

      <Sequence {...span(L.swap)}>
        <SwapShot letterFrom={L.letters[L.swapIndex]} letterTo={L.swapTo} flipAtFrame={rel(L.swap.flipAt, L.swap)} />
      </Sequence>

      <Sequence {...span(L.compare)}>
        <AbsoluteFill style={{alignItems: 'center', paddingTop: 560}}>
          <Compare letters={L.letters} swapIndex={L.swapIndex} swapTo={L.swapTo} labelA={L.compare.labelA} labelB={L.compare.labelB} />
        </AbsoluteFill>
      </Sequence>

      <Sequence {...span(L.verdict)}>
        <AbsoluteFill style={{alignItems: 'center', paddingTop: 780}}>
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

export const S3EP5_EN: S3Ep5Config = {
  id: 'S3Ep5EN',
  flag: 'us',
  voFile: 's3-e05-vo-en.mp3',
  cues: [
    {from: 0.05, to: 1.59, lines: ['HERE IS A', 'PEPTIDE CHAIN.'], teal: 1},
    {from: 1.59, to: 5.95, lines: ['TWENTY LETTERS TO CHOOSE FROM.', 'THIS ONE HAS ITS OWN ORDER.']},
    {from: 5.95, to: 7.37, lines: ['CHANGE JUST', 'ONE LINK.'], teal: 1},
    {from: 7.37, to: 9.43, lines: ['NOT THE WHOLE CHAIN,', 'JUST ONE.']},
    {from: 9.43, to: 10.74, lines: ['NOT A TYPO.'], teal: 1},
    {from: 10.74, to: 12.27, lines: ['NOT CLOSE', 'ENOUGH.']},
    {from: 12.27, to: 15.14, lines: ['A DIFFERENT MOLECULE,', 'A DIFFERENT NAME.'], teal: 1},
    {from: 15.14, to: 18.48, lines: ['ONE LETTER SWAPPED:', 'EVERYTHING DOWNSTREAM CHANGES.']},
    {from: 18.48, to: 21.04, lines: ['THAT’S HOW SENSITIVE', 'THE ORDER REALLY IS.'], teal: 1},
    {from: 21.04, to: 22.97, lines: ['FOLLOW FOR MORE', 'PEPTIDE MATH.'], teal: 1},
  ],
  letters: ['F', 'L', 'Q', 'K', 'V', 'N'],
  swapIndex: 2,
  swapTo: 'R',
  chainReveal: {from: 0, to: 5.95},
  isolate: {from: 5.95, to: 10.74, label: 'THIS ONE'},
  swap: {from: 10.74, to: 15.77, flipAt: 13.29},
  compare: {from: 15.77, to: 18.48, labelA: 'CHAIN A', labelB: 'CHAIN B'},
  verdict: {from: 18.48, to: 22.97, line2At: 21.04, line1: 'ONE LETTER CHANGES EVERYTHING.', line2: 'SEQUENCE IS THE NAME.'},
  endFrom: 22.97,
  seriesChip: 'INSIDE THE VIAL',
  disclaimer: 'Educational tool. Not medical advice. For research purposes only.',
  durationSec: 29,
};

export const S3EP5_PT: S3Ep5Config = {
  id: 'S3Ep5PT',
  flag: 'br',
  voFile: 's3-e05-vo-pt.mp3',
  cues: [
    {from: 0.1, to: 2.26, lines: ['AQUI ESTÁ UMA', 'CADEIA DE PEPTÍDEO.'], teal: 1},
    {from: 2.21, to: 6.44, lines: ['VINTE LETRAS PARA ESCOLHER.', 'ESTA TEM SUA PRÓPRIA ORDEM.']},
    {from: 6.44, to: 7.79, lines: ['MUDE SÓ', 'UM ELO.'], teal: 1},
    {from: 7.79, to: 9.65, lines: ['NÃO A CADEIA TODA,', 'SÓ UM.']},
    {from: 9.65, to: 11.47, lines: ['NÃO É UM', 'ERRO DE DIGITAÇÃO.'], teal: 1},
    {from: 11.47, to: 13.41, lines: ['NÃO É PARECIDO', 'O SUFICIENTE.']},
    {from: 13.41, to: 16.29, lines: ['UMA MOLÉCULA DIFERENTE,', 'UM NOME DIFERENTE.'], teal: 1},
    {from: 16.29, to: 19.36, lines: ['UMA LETRA TROCADA:', 'TUDO MUDA A PARTIR DAÍ.']},
    {from: 19.36, to: 21.46, lines: ['É ASSIM QUE A ORDEM', 'É SENSÍVEL.'], teal: 1},
    {from: 21.46, to: 25.01, lines: ['SIGA PARA MAIS', 'MATEMÁTICA DOS PEPTÍDEOS.'], teal: 1},
  ],
  letters: ['F', 'L', 'Q', 'K', 'V', 'N'],
  swapIndex: 2,
  swapTo: 'R',
  chainReveal: {from: 0, to: 6.44},
  isolate: {from: 6.44, to: 11.47, label: 'ESTE AQUI'},
  swap: {from: 11.47, to: 16.5, flipAt: 14.02},
  compare: {from: 16.5, to: 19.36, labelA: 'CADEIA A', labelB: 'CADEIA B'},
  verdict: {from: 19.36, to: 25.01, line2At: 21.46, line1: 'UMA LETRA MUDA TUDO.', line2: 'A SEQUÊNCIA É O NOME.'},
  endFrom: 25.01,
  seriesChip: 'DENTRO DO FRASCO',
  disclaimer: 'Ferramenta educacional. Não é orientação médica. Somente para fins de pesquisa.',
  durationSec: 31,
};

export const S3EP5_ES: S3Ep5Config = {
  id: 'S3Ep5ES',
  flag: 'mx',
  voFile: 's3-e05-vo-es.mp3',
  cues: [
    {from: 0.1, to: 2.78, lines: ['AQUÍ HAY UNA', 'CADENA DE PÉPTIDO.'], teal: 1},
    {from: 2.73, to: 7.75, lines: ['VEINTE LETRAS PARA ELEGIR.', 'ESTA TIENE SU PROPIO ORDEN.']},
    {from: 7.75, to: 10.1, lines: ['CAMBIA SOLO', 'UN ESLABÓN.'], teal: 1},
    {from: 10.1, to: 13.06, lines: ['NO TODA LA CADENA,', 'SOLO UNO.']},
    {from: 13.06, to: 15.57, lines: ['NO ES UN ERROR', 'DE ESCRITURA.'], teal: 1},
    {from: 15.57, to: 18.58, lines: ['NO ES LO SUFICIENTEMENTE', 'PARECIDO.']},
    {from: 18.58, to: 22.46, lines: ['UNA MOLÉCULA DISTINTA,', 'UN NOMBRE DISTINTO.'], teal: 1},
    {from: 22.46, to: 26.13, lines: ['UNA LETRA CAMBIADA:', 'TODO LO DEMÁS CAMBIA.']},
    {from: 26.13, to: 28.79, lines: ['ASÍ DE SENSIBLE', 'ES EL ORDEN.'], teal: 1},
    {from: 28.79, to: 32.25, lines: ['SÍGUENOS PARA MÁS', 'MATEMÁTICA DE PÉPTIDOS.'], teal: 1},
  ],
  letters: ['F', 'L', 'Q', 'K', 'V', 'N'],
  swapIndex: 2,
  swapTo: 'R',
  chainReveal: {from: 0, to: 7.75},
  isolate: {from: 7.75, to: 15.57, label: 'ESTE AQUÍ'},
  swap: {from: 15.57, to: 20.6, flipAt: 18.12},
  compare: {from: 20.6, to: 22.46, labelA: 'CADENA A', labelB: 'CADENA B'},
  verdict: {from: 22.46, to: 32.25, line2At: 28.79, line1: 'UNA LETRA LO CAMBIA TODO.', line2: 'LA SECUENCIA ES EL NOMBRE.'},
  endFrom: 32.25,
  seriesChip: 'DENTRO DEL VIAL',
  disclaimer: 'Herramienta educativa. No es consejo médico. Solo con fines de investigación.',
  durationSec: 38,
};
