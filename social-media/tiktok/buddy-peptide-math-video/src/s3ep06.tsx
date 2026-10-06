import React from 'react';
import {AbsoluteFill, Audio, Img, interpolate, OffthreadVideo, Sequence, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {loadFont as loadAnton} from '@remotion/google-fonts/Anton';
import {loadFont as loadArchivo} from '@remotion/google-fonts/Archivo';
import type {Cue} from './locales';
import {BG, Buddy, Caption, FPS, Flag, Glow, Logo, TEAL, TEAL_DEEP, WHITE} from './Video';
import {AMBER} from './s3ep01';

const anton = loadAnton();
const archivo = loadArchivo();

type Span = {from: number; to: number};

type S3Ep6Config = {
  id: string;
  flag: 'us' | 'mx' | 'br';
  voFile: string;
  cues: Cue[];
  build: Span & {rate: number; cycleAt: number[]; beadLabel: string; beadLabelTo: number; cycleLabels: [string, string, string]};
  holdA: Span;
  yieldScene: Span & {example: string; perStep: string; links: string; kept: string; startAt: number};
  skip: Span & {closeAt: number; labelFull: string; labelShort: string; labelSkipped: string};
  holdB: Span;
  release: Span & {rate: number};
  endFrom: number;
  seriesChip: string;
  disclaimer: string;
  durationSec: number;
};

const SHOT1_SEC = 5.033;
const STEP = 0.99;
const LINKS = 30;
const KEPT = Math.round(100 * Math.pow(STEP, LINKS));

const fade = (frame: number, a: number, b: number, c: number, d: number) =>
  interpolate(frame, [a, b, c, d], [0, 1, 1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});

const TopScrim: React.FC = () => (
  <AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(5,9,12,0.92) 0%, rgba(5,9,12,0.85) 22%, rgba(5,9,12,0) 42%)'}} />
);

const ResinLabel: React.FC<{text: string; toFrame: number; totalFrames: number}> = ({text, toFrame, totalFrames}) => {
  const frame = useCurrentFrame();
  const p = Math.min(1, frame / totalFrames);
  const tipX = interpolate(p, [0, 1], [790, 755]);
  const tipY = interpolate(p, [0, 1], [1330, 1800]);
  const op = fade(frame, 12, 24, toFrame - 12, toFrame);
  const pillX = tipX + 80;
  const pillY = tipY - 120;
  return (
    <AbsoluteFill style={{opacity: op}}>
      <svg width={1080} height={1920} style={{position: 'absolute', left: 0, top: 0}}>
        <line x1={pillX - 30} y1={pillY + 36} x2={tipX} y2={tipY} stroke={WHITE} strokeWidth={5} strokeLinecap="round" />
        <circle cx={tipX} cy={tipY} r={11} fill={WHITE} />
      </svg>
      <div style={{position: 'absolute', left: pillX - 160, top: pillY - 36, width: 320, display: 'flex', justifyContent: 'center'}}>
        <div style={{background: 'rgba(5,9,12,0.82)', border: `5px solid ${WHITE}`, borderRadius: 999, padding: '10px 34px', fontFamily: anton.fontFamily, fontSize: 40, letterSpacing: 2, color: WHITE, whiteSpace: 'nowrap'}}>{text}</div>
      </div>
    </AbsoluteFill>
  );
};

const CycleChips: React.FC<{labels: [string, string, string]; at: number[]; total: number}> = ({labels, at, total}) => {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  const order = [0, 1, 2, 0];
  let active = 0;
  at.forEach((a, i) => {
    if (t >= a) active = order[i];
  });
  const op = interpolate(frame, [0, 10, total - 10, total], [0, 1, 1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return (
    <AbsoluteFill style={{opacity: op}}>
      <div style={{position: 'absolute', left: 54, top: 780, display: 'flex', flexDirection: 'column', gap: 22}}>
        {labels.map((l, i) => {
          const on = i === active;
          return (
            <div key={l} style={{background: on ? TEAL_DEEP : 'rgba(5,9,12,0.7)', border: `5px solid ${on ? WHITE : TEAL}`, borderRadius: 999, padding: '12px 36px', fontFamily: anton.fontFamily, fontSize: 44, letterSpacing: 2, color: on ? WHITE : TEAL, opacity: on ? 1 : 0.55, boxShadow: on ? '0 0 40px rgba(42,182,201,0.6)' : 'none', textAlign: 'center', minWidth: 230}}>{l}</div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

const HoldStill: React.FC<{dur: number; fadeIn?: boolean; fadeOut?: boolean}> = ({dur, fadeIn, fadeOut}) => {
  const frame = useCurrentFrame();
  const a = fadeIn ? interpolate(frame, [0, 12], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}) : 1;
  const b = fadeOut ? interpolate(frame, [dur - 12, dur], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}) : 1;
  const scale = interpolate(frame, [0, dur], [1, 1.04]);
  return (
    <AbsoluteFill style={{background: BG, opacity: Math.min(a, b)}}>
      <Img src={staticFile('s3-e06-shot1-last.png')} style={{width: '100%', height: '100%', objectFit: 'cover', transform: `scale(${scale})`}} />
      <TopScrim />
    </AbsoluteFill>
  );
};

const Yield: React.FC<{example: string; perStep: string; links: string; kept: string; startAt: number}> = ({example, perStep, links, kept, startAt}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const s1 = spring({frame: frame - 6, fps, config: {damping: 13, stiffness: 150}});
  const s2 = spring({frame: frame - 24, fps, config: {damping: 13, stiffness: 150}});
  const s3 = spring({frame: frame - 40, fps, config: {damping: 13, stiffness: 150}});
  const p = interpolate(frame, [startAt * FPS, (startAt + 2.2) * FPS], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const pct = 100 - (100 - KEPT) * p;
  const done = p >= 1;
  return (
    <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 34, width: 980}}>
      <div style={{opacity: s1, background: '#1a1206', border: `5px solid ${AMBER}`, borderRadius: 999, padding: '10px 40px', fontFamily: anton.fontFamily, fontSize: 40, letterSpacing: 3, color: AMBER}}>{example}</div>
      <div style={{display: 'flex', gap: 28}}>
        <div style={{opacity: s2, transform: `scale(${interpolate(s2, [0, 1], [0.7, 1])})`, background: TEAL_DEEP, border: `5px solid ${TEAL}`, borderRadius: 26, padding: '18px 40px', fontFamily: anton.fontFamily, fontSize: 60, color: WHITE}}>{perStep}</div>
        <div style={{opacity: s3, transform: `scale(${interpolate(s3, [0, 1], [0.7, 1])})`, background: TEAL_DEEP, border: `5px solid ${TEAL}`, borderRadius: 26, padding: '18px 40px', fontFamily: anton.fontFamily, fontSize: 60, color: WHITE}}>{links}</div>
      </div>
      <div style={{width: 880, height: 84, borderRadius: 42, background: '#0e1a20', border: `4px solid ${TEAL}`, overflow: 'hidden', opacity: s3}}>
        <div style={{width: `${pct}%`, height: '100%', background: `linear-gradient(90deg, ${TEAL_DEEP}, ${TEAL})`, boxShadow: '0 0 40px rgba(42,182,201,0.6)'}} />
      </div>
      <div style={{fontFamily: anton.fontFamily, fontSize: 120, color: done ? WHITE : TEAL, opacity: s3, minHeight: 140}}>
        {done ? kept : `${Math.round(pct)}%`}
      </div>
    </div>
  );
};

const Bead: React.FC<{x: number; y: number; r?: number}> = ({x, y, r = 42}) => (
  <g transform={`translate(${x} ${y})`}>
    <circle r={r} fill={BG} stroke={TEAL} strokeWidth={6} style={{filter: `drop-shadow(0 0 10px ${TEAL})`}} />
    <circle r={r * 0.4} fill={AMBER} style={{filter: `drop-shadow(0 0 8px ${AMBER})`}} />
  </g>
);

const SkipScene: React.FC<{closeAt: number; labelFull: string; labelShort: string; labelSkipped: string}> = ({closeAt, labelFull, labelShort, labelSkipped}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const s = spring({frame, fps, config: {damping: 13, stiffness: 140}});
  const gap = 120;
  const W = 980;
  const n = 8;
  const x0A = (W - (n - 1) * gap) / 2;
  const slotX = (i: number) => x0A + i * gap;
  const skipIdx = 2;
  const x0B = (W - (n - 2) * gap) / 2;
  const close = spring({frame: frame - closeAt * FPS, fps, config: {damping: 16, stiffness: 90}});
  const gapOp = interpolate(frame, [18, 30], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}) * (1 - close);
  const shortOp = interpolate(frame, [(closeAt + 0.6) * FPS, (closeAt + 1.1) * FPS], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const bPts = Array.from({length: n - 1}, (_, j) => {
    const orig = j < skipIdx ? j : j + 1;
    return {x: interpolate(close, [0, 1], [slotX(orig), x0B + j * gap])};
  });
  const rowA = Array.from({length: n}, (_, i) => ({x: slotX(i)}));
  return (
    <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 60, opacity: s}}>
      <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16}}>
        <svg width={W} height={100}>
          <polyline points={rowA.map((p) => `${p.x},50`).join(' ')} fill="none" stroke={TEAL} strokeWidth={5} opacity={0.45} />
          {rowA.map((p, i) => (
            <Bead key={i} x={p.x} y={50} />
          ))}
        </svg>
        <div style={{fontFamily: anton.fontFamily, fontSize: 38, letterSpacing: 2, color: TEAL}}>{labelFull}</div>
      </div>
      <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16}}>
        <svg width={W} height={100}>
          <polyline points={bPts.map((p) => `${p.x},50`).join(' ')} fill="none" stroke={TEAL} strokeWidth={5} opacity={0.45} />
          {bPts.map((p, i) => (
            <Bead key={i} x={p.x} y={50} />
          ))}
          <circle cx={slotX(skipIdx)} cy={50} r={42} fill="none" stroke={AMBER} strokeWidth={5} strokeDasharray="10 9" opacity={gapOp} />
        </svg>
        <div style={{position: 'relative', height: 52, width: W, display: 'flex', justifyContent: 'center'}}>
          <div style={{position: 'absolute', opacity: gapOp, fontFamily: anton.fontFamily, fontSize: 38, letterSpacing: 2, color: AMBER}}>{labelSkipped}</div>
          <div style={{position: 'absolute', opacity: shortOp, fontFamily: anton.fontFamily, fontSize: 38, letterSpacing: 2, color: AMBER}}>{labelShort}</div>
        </div>
      </div>
    </div>
  );
};

export const S3Ep6: React.FC<{locale: S3Ep6Config}> = ({locale}) => {
  const frame = useCurrentFrame();
  const sec = (s: number) => Math.round(s * FPS);
  const L = locale;
  const span = (x: Span) => ({from: sec(x.from), durationInFrames: sec(x.to - x.from)});
  const dur = (x: Span) => sec(x.to - x.from);

  return (
    <AbsoluteFill style={{background: BG}}>
      <Audio src={staticFile(L.voFile)} />
      <Audio src={staticFile('music.wav')} volume={0.45} />
      <Glow />

      <Sequence {...span(L.build)}>
        <AbsoluteFill style={{background: BG}}>
          <Img src={staticFile('s3-e06-shot1-last.png')} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
          <Sequence durationInFrames={Math.min(dur(L.build), Math.round((SHOT1_SEC / L.build.rate) * FPS))}>
            <OffthreadVideo src={staticFile('s3-e06-shot1.mp4')} muted playbackRate={L.build.rate} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
          </Sequence>
          <TopScrim />
          <ResinLabel text={L.build.beadLabel} toFrame={sec(L.build.beadLabelTo - L.build.from)} totalFrames={Math.round((SHOT1_SEC / L.build.rate) * FPS)} />
          <Sequence from={sec(L.build.cycleAt[0] - L.build.from)} durationInFrames={dur(L.build) - sec(L.build.cycleAt[0] - L.build.from)}>
            <CycleChips labels={L.build.cycleLabels} at={L.build.cycleAt.map((a) => a - L.build.cycleAt[0])} total={dur(L.build) - sec(L.build.cycleAt[0] - L.build.from)} />
          </Sequence>
        </AbsoluteFill>
      </Sequence>

      <Sequence {...span(L.holdA)}>
        <HoldStill dur={dur(L.holdA)} fadeOut />
      </Sequence>

      <Sequence {...span(L.yieldScene)}>
        <AbsoluteFill style={{alignItems: 'center', paddingTop: 760}}>
          <Yield example={L.yieldScene.example} perStep={L.yieldScene.perStep} links={L.yieldScene.links} kept={L.yieldScene.kept} startAt={L.yieldScene.startAt} />
        </AbsoluteFill>
      </Sequence>

      <Sequence {...span(L.skip)}>
        <AbsoluteFill style={{alignItems: 'center', paddingTop: 800}}>
          <SkipScene closeAt={L.skip.closeAt} labelFull={L.skip.labelFull} labelShort={L.skip.labelShort} labelSkipped={L.skip.labelSkipped} />
        </AbsoluteFill>
      </Sequence>

      <Sequence {...span(L.holdB)}>
        <HoldStill dur={dur(L.holdB)} fadeIn />
      </Sequence>

      <Sequence {...span(L.release)}>
        <AbsoluteFill style={{background: BG}}>
          <OffthreadVideo src={staticFile('s3-e06-shot2.mp4')} muted playbackRate={L.release.rate} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
          <TopScrim />
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

export const S3EP6_EN: S3Ep6Config = {
  id: 'S3Ep6EN',
  flag: 'us',
  voFile: 's3-e06-vo-en.mp3',
  cues: [
    {from: 0.05, to: 2.94, lines: ['A PEPTIDE CHAIN IS', 'BUILT ON A TINY BEAD.']},
    {from: 2.94, to: 4.28, lines: ['ONE LINK', 'AT A TIME.'], teal: 1},
    {from: 4.28, to: 8.35, lines: ['ADD A LINK. WASH.', 'UNLOCK. ADD THE NEXT.']},
    {from: 8.35, to: 10.46, lines: ['EVERY CYCLE IS', 'CLOSE TO PERFECT.']},
    {from: 10.46, to: 11.63, lines: ['NEVER PERFECT.'], teal: 1},
    {from: 11.63, to: 16.72, lines: ['AT 99% PER STEP,', '30 LINKS: ABOUT 74%.']},
    {from: 16.72, to: 20.85, lines: ['SKIP ONE LINK: A SHORTER', 'CHAIN, ALMOST THE SAME.']},
    {from: 20.85, to: 23.33, lines: ['THAT IS WHY A VIAL HOLDS', 'MORE THAN ONE THING.'], teal: 1},
    {from: 23.33, to: 26.9, lines: ['DONE? THE CHAIN IS', 'CUT FREE FROM THE BEAD.']},
    {from: 26.9, to: 29.04, lines: ['FOLLOW FOR MORE', 'PEPTIDE SCIENCE.'], teal: 1},
  ],
  build: {from: 0, to: 8.35, rate: 0.6, cycleAt: [4.28, 5.5, 6.5, 7.5], beadLabel: 'RESIN BEAD', beadLabelTo: 6.4, cycleLabels: ['ADD', 'WASH', 'UNLOCK']},
  holdA: {from: 8.35, to: 11.63},
  yieldScene: {from: 11.63, to: 16.72, example: 'EXAMPLE', perStep: '99% PER STEP', links: '30 LINKS', kept: `ABOUT ${KEPT}%`, startAt: 1.4},
  skip: {from: 16.72, to: 23.33, closeAt: 2.4, labelFull: 'FULL CHAIN', labelShort: 'SHORTER CHAIN', labelSkipped: 'SKIPPED'},
  holdB: {from: 23.33, to: 25.2},
  release: {from: 25.2, to: 29.4, rate: 1.2},
  endFrom: 29.4,
  seriesChip: 'INSIDE THE VIAL',
  disclaimer: 'Educational tool. Not medical advice. For research purposes only.',
  durationSec: 36,
};

export const S3EP6_PT: S3Ep6Config = {
  id: 'S3Ep6PT',
  flag: 'br',
  voFile: 's3-e06-vo-pt.mp3',
  cues: [
    {from: 0.10, to: 3.89, lines: ['A CADEIA É CONSTRUÍDA', 'SOBRE UMA ESFERA.']},
    {from: 3.84, to: 5.38, lines: ['UM ELO', 'DE CADA VEZ.'], teal: 1},
    {from: 5.38, to: 9.93, lines: ['ADICIONE. LAVE.', 'DESBLOQUEIE. ADICIONE.']},
    {from: 9.93, to: 11.94, lines: ['CADA CICLO É', 'QUASE PERFEITO.']},
    {from: 11.94, to: 13.25, lines: ['NUNCA PERFEITO.'], teal: 1},
    {from: 13.25, to: 18.95, lines: ['A 99% POR ETAPA,', '30 ELOS: CERCA DE 74%.']},
    {from: 18.95, to: 22.98, lines: ['PULE UM ELO: UMA CADEIA', 'MAIS CURTA, QUASE IGUAL.']},
    {from: 22.98, to: 25.80, lines: ['POR ISSO UM FRASCO TEM', 'MAIS DE UMA COISA.'], teal: 1},
    {from: 25.80, to: 29.51, lines: ['PRONTO? A CADEIA É', 'CORTADA DA ESFERA.']},
    {from: 29.51, to: 32.70, lines: ['SIGA PARA MAIS', 'CIÊNCIA DOS PEPTÍDEOS.'], teal: 1},
  ],
  build: {from: 0, to: 9.93, rate: 0.6, cycleAt: [5.38, 6.75, 7.88, 9.02], beadLabel: 'ESFERA DE RESINA', beadLabelTo: 7.48, cycleLabels: ['ADICIONAR', 'LAVAR', 'DESBLOQUEAR']},
  holdA: {from: 9.93, to: 13.25},
  yieldScene: {from: 13.25, to: 18.95, example: 'EXEMPLO', perStep: '99% POR ETAPA', links: '30 ELOS', kept: `CERCA DE ${KEPT}%`, startAt: 1.4},
  skip: {from: 18.95, to: 25.80, closeAt: 2.49, labelFull: 'CADEIA COMPLETA', labelShort: 'CADEIA MAIS CURTA', labelSkipped: 'PULADO'},
  holdB: {from: 25.80, to: 27.63},
  release: {from: 27.63, to: 33.10, rate: 0.92},
  endFrom: 33.10,
  seriesChip: 'DENTRO DO FRASCO',
  disclaimer: 'Ferramenta educacional. Não é orientação médica. Somente para fins de pesquisa.',
  durationSec: 40,
};

export const S3EP6_ES: S3Ep6Config = {
  id: 'S3Ep6ES',
  flag: 'mx',
  voFile: 's3-e06-vo-es.mp3',
  cues: [
    {from: 0.10, to: 4.42, lines: ['LA CADENA SE CONSTRUYE', 'SOBRE UNA ESFERA.']},
    {from: 4.38, to: 6.51, lines: ['UN ESLABÓN', 'A LA VEZ.'], teal: 1},
    {from: 6.51, to: 12.21, lines: ['AGREGA. LAVA.', 'DESBLOQUEA. AGREGA.']},
    {from: 12.21, to: 14.89, lines: ['CADA CICLO ES', 'CASI PERFECTO.']},
    {from: 14.89, to: 16.78, lines: ['NUNCA PERFECTO.'], teal: 1},
    {from: 16.78, to: 23.91, lines: ['A 99% POR PASO, 30', 'ESLABONES: UNOS 74%.']},
    {from: 23.91, to: 29.28, lines: ['OMITE UN ESLABÓN:', 'MÁS CORTA, CASI IGUAL.']},
    {from: 29.28, to: 32.49, lines: ['POR ESO UN VIAL CONTIENE', 'MÁS DE UNA COSA.'], teal: 1},
    {from: 32.49, to: 36.85, lines: ['SE CORTA Y SE LIBERA', 'DE LA ESFERA.']},
    {from: 36.85, to: 40.06, lines: ['SÍGUENOS PARA MÁS', 'CIENCIA DE PÉPTIDOS.'], teal: 1},
  ],
  build: {from: 0, to: 12.21, rate: 0.6, cycleAt: [6.51, 8.22, 9.64, 11.07], beadLabel: 'ESFERA DE RESINA', beadLabelTo: 8.61, cycleLabels: ['AGREGAR', 'LAVAR', 'DESBLOQUEAR']},
  holdA: {from: 12.21, to: 16.78},
  yieldScene: {from: 16.78, to: 23.91, example: 'EJEMPLO', perStep: '99% POR PASO', links: '30 ESLABONES', kept: `UNOS ${KEPT}%`, startAt: 1.4},
  skip: {from: 23.91, to: 32.49, closeAt: 3.11, labelFull: 'CADENA COMPLETA', labelShort: 'CADENA MÁS CORTA', labelSkipped: 'OMITIDO'},
  holdB: {from: 32.49, to: 34.71},
  release: {from: 34.71, to: 40.43, rate: 0.88},
  endFrom: 40.43,
  seriesChip: 'DENTRO DEL VIAL',
  disclaimer: 'Herramienta educativa. No es consejo médico. Solo con fines de investigación.',
  durationSec: 47,
};
