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

type ClipCfg = {src: string; from: number; dur: number};

type S2Day1Config = {
  id: string;
  flag: 'us' | 'mx' | 'br';
  voFile: string;
  cues: Cue[];
  clips: ClipCfg[];
  paused: {from: number; to: number; label1: string; label2: string};
  worlds: {from: number; to: number; chipBAt: number; dry: string; wet: string; chipA: string; chipB: string};
  clockBeat: {from: number; to: number};
  endFrom: number;
  dayChip: {from: number; label: string};
  disclaimer: string;
  durationSec: number;
};

// Full-bleed cinematic clip layer with a short fade-in.
const Cinematic: React.FC<{src: string}> = ({src}) => {
  const frame = useCurrentFrame();
  const fade = interpolate(frame, [0, 10], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return (
    <AbsoluteFill style={{opacity: fade}}>
      <OffthreadVideo src={staticFile(src)} muted style={{width: '100%', height: '100%', objectFit: 'cover'}} />
    </AbsoluteFill>
  );
};

// The paused molecule: a rigid strand inside an ice frame with a frozen mini clock.
const PausedDiagram: React.FC<{label1: string; label2: string}> = ({label1, label2}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const s = spring({frame, fps, config: {damping: 13, stiffness: 160}});
  const R = 90;
  return (
    <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 40, opacity: s, transform: `scale(${interpolate(s, [0, 1], [0.8, 1])})`}}>
      <div
        style={{
          border: '4px solid #4aa8b8',
          background: 'rgba(10,26,32,0.85)',
          borderRadius: 36,
          padding: '56px 70px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 34,
          boxShadow: '0 0 90px rgba(74,168,184,0.25)',
        }}
      >
        <svg width={620} height={120}>
          {Array.from({length: 9}).map((_, i) => (
            <g key={i}>
              {i < 8 ? <line x1={60 + i * 64} y1={60} x2={124 + i * 64} y2={60} stroke="#7fd4e0" strokeWidth={7} /> : null}
              <circle cx={60 + i * 64} cy={60} r={22} fill={i % 2 === 0 ? TEAL : '#dff5f8'} stroke="#0a3038" strokeWidth={3} />
            </g>
          ))}
        </svg>
        <div style={{display: 'flex', alignItems: 'center', gap: 30}}>
          <svg width={R} height={R}>
            <circle cx={R / 2} cy={R / 2} r={R / 2 - 4} fill="none" stroke={TEAL} strokeWidth={5} />
            <line x1={R / 2} y1={R / 2} x2={R / 2} y2={12} stroke={TEAL} strokeWidth={5} strokeLinecap="round" />
            <line x1={R / 2} y1={R / 2} x2={R / 2} y2={22} stroke="#7fe6f2" strokeWidth={7} strokeLinecap="round" />
          </svg>
          <div style={{display: 'flex', gap: 12}}>
            <div style={{width: 22, height: 74, background: WHITE, borderRadius: 6}} />
            <div style={{width: 22, height: 74, background: WHITE, borderRadius: 6}} />
          </div>
        </div>
      </div>
      <div style={{textAlign: 'center'}}>
        <div style={{fontFamily: anton.fontFamily, fontSize: 54, color: WHITE}}>{label1}</div>
        <div style={{fontFamily: archivo.fontFamily, fontWeight: 700, fontSize: 36, color: MUTED, marginTop: 8}}>{label2}</div>
      </div>
    </div>
  );
};

// Two worlds: dry state vs in solution, then the wait/use chips.
const TwoWorlds: React.FC<{dry: string; wet: string; chipA: string; chipB: string; chipBAt: number}> = ({dry, wet, chipA, chipB, chipBAt}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const s = spring({frame, fps, config: {damping: 13, stiffness: 160}});
  const cA = spring({frame: frame - chipBAt + 20, fps, config: {damping: 11, stiffness: 220}});
  const cB = spring({frame: frame - chipBAt, fps, config: {damping: 11, stiffness: 220}});
  const card = (title: string, liquid: boolean): React.ReactElement => (
    <div
      style={{
        background: '#0a1218',
        border: `4px solid ${liquid ? TEAL : '#4aa8b8'}`,
        borderRadius: 32,
        width: 430,
        padding: '30px 0 34px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 22,
      }}
    >
      <div style={{fontFamily: anton.fontFamily, fontSize: 40, letterSpacing: 2, color: liquid ? TEAL : '#9fd4dd'}}>{title}</div>
      <Img
        src={staticFile(liquid ? 'vial-liquid.png' : 'vial-large.png')}
        style={{height: 300, borderRadius: 10, WebkitMaskImage: 'linear-gradient(to right, transparent 0%, black 12%, black 88%, transparent 100%)', maskImage: 'linear-gradient(to right, transparent 0%, black 12%, black 88%, transparent 100%)'}}
      />
    </div>
  );
  return (
    <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 34, opacity: s, transform: `scale(${interpolate(s, [0, 1], [0.85, 1])})`}}>
      <div style={{display: 'flex', gap: 44, alignItems: 'flex-start'}}>
        {card(dry, false)}
        {card(wet, true)}
      </div>
      <div style={{display: 'flex', gap: 36}}>
        <div style={{opacity: cA, transform: `scale(${interpolate(cA, [0, 1], [0.6, 1])})`, border: '4px solid #4aa8b8', borderRadius: 999, padding: '16px 40px', fontFamily: anton.fontFamily, fontSize: 40, color: '#9fd4dd'}}>{chipA}</div>
        <div style={{opacity: cB, transform: `scale(${interpolate(cB, [0, 1], [0.6, 1])})`, border: `4px solid ${TEAL}`, borderRadius: 999, padding: '16px 40px', fontFamily: anton.fontFamily, fontSize: 40, color: TEAL, boxShadow: '0 0 60px rgba(42,182,201,0.35)'}}>{chipB}</div>
      </div>
    </div>
  );
};

// The running brand clock around the liquid vial (native Remotion, exact design).
const RunningClock: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const s = spring({frame, fps, config: {damping: 14, stiffness: 130}});
  const minuteAngle = 132 + frame * 2.2;
  const R = 360;
  return (
    <div style={{position: 'relative', width: R * 2, height: R * 2, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: s}}>
      <svg width={R * 2} height={R * 2} style={{position: 'absolute', inset: 0, opacity: 0.85}}>
        <circle cx={R} cy={R} r={R - 8} fill="none" stroke={TEAL} strokeWidth={7} style={{filter: 'drop-shadow(0 0 26px rgba(42,182,201,0.65))'}} />
        {Array.from({length: 12}).map((_, i) => {
          const a = (i / 12) * Math.PI * 2;
          return (
            <line
              key={i}
              x1={R + Math.sin(a) * (R - 18)}
              y1={R - Math.cos(a) * (R - 18)}
              x2={R + Math.sin(a) * (R - 44)}
              y2={R - Math.cos(a) * (R - 44)}
              stroke={TEAL}
              strokeWidth={i % 3 === 0 ? 10 : 4.5}
            />
          );
        })}
        <line x1={R} y1={R} x2={R + Math.sin((minuteAngle * Math.PI) / 180) * (R - 76)} y2={R - Math.cos((minuteAngle * Math.PI) / 180) * (R - 76)} stroke={TEAL} strokeWidth={10} strokeLinecap="round" />
        <line x1={R} y1={R} x2={R + Math.sin(((minuteAngle / 12) * Math.PI) / 180) * (R - 170)} y2={R - Math.cos(((minuteAngle / 12) * Math.PI) / 180) * (R - 170)} stroke="#7fe6f2" strokeWidth={14} strokeLinecap="round" />
        <circle cx={R} cy={R} r={16} fill={TEAL} />
      </svg>
      <Img
        src={staticFile('vial-liquid.png')}
        style={{height: 360, borderRadius: 12, WebkitMaskImage: 'linear-gradient(to right, transparent 0%, black 10%, black 90%, transparent 100%)', maskImage: 'linear-gradient(to right, transparent 0%, black 10%, black 90%, transparent 100%)', filter: 'drop-shadow(0 0 70px rgba(42,182,201,0.3))'}}
      />
    </div>
  );
};

export const S2Day1: React.FC<{locale: S2Day1Config}> = ({locale}) => {
  const frame = useCurrentFrame();
  const sec = (s: number) => Math.round(s * FPS);
  const L = locale;

  return (
    <AbsoluteFill style={{background: BG}}>
      <Audio src={staticFile(L.voFile)} />
      <Audio src={staticFile('music.wav')} volume={0.45} />
      <Glow />

      {/* Cinematic clip layers */}
      {L.clips.map((c) => (
        <Sequence key={c.src} from={sec(c.from)} durationInFrames={sec(c.dur)}>
          <Cinematic src={c.src} />
        </Sequence>
      ))}

      {/* Paused diagram beat */}
      <Sequence from={sec(L.paused.from)} durationInFrames={sec(L.paused.to - L.paused.from)}>
        <AbsoluteFill style={{alignItems: 'center', paddingTop: 640}}>
          <PausedDiagram label1={L.paused.label1} label2={L.paused.label2} />
        </AbsoluteFill>
      </Sequence>

      {/* Two worlds beat */}
      <Sequence from={sec(L.worlds.from)} durationInFrames={sec(L.worlds.to - L.worlds.from)}>
        <AbsoluteFill style={{alignItems: 'center', paddingTop: 620}}>
          <TwoWorlds
            dry={L.worlds.dry}
            wet={L.worlds.wet}
            chipA={L.worlds.chipA}
            chipB={L.worlds.chipB}
            chipBAt={sec(L.worlds.chipBAt - L.worlds.from)}
          />
        </AbsoluteFill>
      </Sequence>

      {/* The clock is running beat */}
      <Sequence from={sec(L.clockBeat.from)} durationInFrames={sec(L.clockBeat.to - L.clockBeat.from)}>
        <AbsoluteFill style={{alignItems: 'center', paddingTop: 600}}>
          <RunningClock />
        </AbsoluteFill>
      </Sequence>

      {/* Brand chrome above the footage */}
      <AbsoluteFill style={{alignItems: 'center', paddingTop: 90}}>
        <Logo small />
      </AbsoluteFill>
      <Flag code={L.flag} />

      {L.cues.map((cue) => (
        <Sequence key={cue.from} from={sec(cue.from)} durationInFrames={sec(cue.to - cue.from)}>
          <Caption cue={cue} />
        </Sequence>
      ))}

      {/* End card */}
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
                opacity: interpolate(frame, [sec(L.dayChip.from), sec(L.dayChip.from + 0.5)], [0, 1], {
                  extrapolateLeft: 'clamp',
                  extrapolateRight: 'clamp',
                }),
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
                opacity: interpolate(frame, [sec(L.endFrom + 0.4), sec(L.endFrom + 1)], [0, 1], {
                  extrapolateLeft: 'clamp',
                  extrapolateRight: 'clamp',
                }),
              }}
            >
              buddypept.com
            </div>
            <div
              style={{
                fontFamily: archivo.fontFamily,
                fontSize: 30,
                color: '#5d7078',
                opacity: interpolate(frame, [sec(L.endFrom + 1.4), sec(L.endFrom + 2)], [0, 1], {
                  extrapolateLeft: 'clamp',
                  extrapolateRight: 'clamp',
                }),
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

export const S2DAY1_EN: S2Day1Config = {
  id: 'S2Day1EN',
  flag: 'us',
  voFile: 's2-d1-vo-en.mp3',
  cues: [
    {from: 0.05, to: 4.48, lines: ['ONCE THE WATER GOES IN,', 'THE CLOCK STARTS.'], teal: 1},
    {from: 4.48, to: 8.97, lines: ["HERE'S WHY.", 'INSIDE: DRY POWDER.']},
    {from: 8.97, to: 13.89, lines: ['FREEZE-DRIED.', 'ALMOST NOTHING MOVES.'], teal: 1},
    {from: 13.89, to: 15.76, lines: ['THE MOLECULE', 'IS ON PAUSE.'], teal: 1},
    {from: 15.76, to: 18.74, lines: ['THEN WATER GOES IN.', 'EVERYTHING CHANGES.']},
    {from: 18.74, to: 23.88, lines: ['MOLECULES MOVE AGAIN.', 'CHEMISTRY IS BACK.'], teal: 1},
    {from: 23.88, to: 27.19, lines: ['DRY AND SOLUTION:', 'TWO DIFFERENT WORLDS.'], teal: 1},
    {from: 27.19, to: 30.26, lines: ['BUILT TO WAIT.', 'BUILT TO BE USED.']},
    {from: 30.26, to: 33.49, lines: ['THAT WAS THE MOMENT', 'THE CLOCK STARTED.'], teal: 1},
    {from: 33.49, to: 36.24, lines: ["BUT THERE ISN'T", 'JUST ONE CLOCK.']},
    {from: 36.24, to: 38.72, lines: ['TWO CLOCKS?', 'TOMORROW: DAY 2.'], teal: 1},
  ],
  clips: [
    {src: 's2-clip1.mp4', from: 0, dur: 5.04},
    {src: 's2-clip2.mp4', from: 5.43, dur: 6.04},
    {src: 's2-clip3.mp4', from: 15.76, dur: 8.04},
    {src: 's2-clip4.mp4', from: 33.49, dur: 5.04},
  ],
  paused: {from: 11.52, to: 15.76, label1: 'NO WATER, NO REACTIONS', label2: 'the molecule is on pause'},
  worlds: {
    from: 23.88,
    to: 30.26,
    chipBAt: 28.62,
    dry: 'DRY STATE',
    wet: 'IN SOLUTION',
    chipA: 'BUILT TO WAIT',
    chipB: 'BUILT TO BE USED',
  },
  clockBeat: {from: 30.26, to: 33.49},
  endFrom: 38.72,
  dayChip: {from: 38.72, label: 'DAY 1 OF 10'},
  disclaimer: 'Educational tool. Not medical advice. For research purposes only.',
  durationSec: 46,
};

export const S2DAY1_PT: S2Day1Config = {
  id: 'S2Day1PT',
  flag: 'br',
  voFile: 's2-d1-vo-pt.mp3',
  cues: [
    {from: 0.1, to: 4.15, lines: ['DEPOIS QUE A ÁGUA ENTRA,', 'O RELÓGIO COMEÇA.'], teal: 1},
    {from: 4.15, to: 8.31, lines: ['AQUI ESTÁ O PORQUÊ.', 'DENTRO: PÓ SECO.']},
    {from: 8.31, to: 12.97, lines: ['LIOFILIZADO.', 'QUASE NADA SE MOVE.'], teal: 1},
    {from: 12.97, to: 14.71, lines: ['A MOLÉCULA', 'ESTÁ EM PAUSA.'], teal: 1},
    {from: 14.71, to: 17.24, lines: ['ENTÃO A ÁGUA ENTRA.', 'TUDO MUDA.']},
    {from: 17.24, to: 22.06, lines: ['AS MOLÉCULAS SE MOVEM.', 'A QUÍMICA VOLTA.'], teal: 1},
    {from: 22.06, to: 25.16, lines: ['PÓ E SOLUÇÃO:', 'DOIS MUNDOS DIFERENTES.'], teal: 1},
    {from: 25.16, to: 28.89, lines: ['FEITO PARA ESPERAR.', 'FEITO PARA SER USADO.']},
    {from: 28.89, to: 32.66, lines: ['ESSE FOI O MOMENTO EM QUE', 'O RELÓGIO COMEÇOU.'], teal: 1},
    {from: 32.66, to: 35.56, lines: ['MAS NÃO EXISTE', 'SÓ UM RELÓGIO.']},
    {from: 35.56, to: 38.59, lines: ['DOIS RELÓGIOS?', 'AMANHÃ: DIA 2.'], teal: 1},
  ],
  clips: [
    {src: 's2-clip1.mp4', from: 0, dur: 5.04},
    {src: 's2-clip2.mp4', from: 5.49, dur: 6.04},
    {src: 's2-clip3.mp4', from: 14.71, dur: 8.04},
    {src: 's2-clip4.mp4', from: 32.66, dur: 5.04},
  ],
  paused: {from: 11.53, to: 14.71, label1: 'SEM ÁGUA, SEM REAÇÕES', label2: 'a molécula está em pausa'},
  worlds: {
    from: 22.06,
    to: 28.89,
    chipBAt: 26.82,
    dry: 'PÓ SECO',
    wet: 'EM SOLUÇÃO',
    chipA: 'FEITO PARA ESPERAR',
    chipB: 'FEITO PARA USAR',
  },
  clockBeat: {from: 28.89, to: 32.66},
  endFrom: 38.59,
  dayChip: {from: 38.59, label: 'DIA 1 DE 10'},
  disclaimer: 'Ferramenta educacional. Não é orientação médica. Somente para fins de pesquisa.',
  durationSec: 46,
};

export const S2DAY1_ES: S2Day1Config = {
  id: 'S2Day1ES',
  flag: 'mx',
  voFile: 's2-d1-vo-es.mp3',
  cues: [
    {from: 0.1, to: 5.03, lines: ['CUANDO ENTRA EL AGUA,', 'EL RELOJ EMPIEZA.'], teal: 1},
    {from: 5.03, to: 11.05, lines: ['AQUÍ ESTÁ EL PORQUÉ.', 'ADENTRO: POLVO SECO.']},
    {from: 11.05, to: 17.94, lines: ['LIOFILIZADO.', 'CASI NADA SE MUEVE.'], teal: 1},
    {from: 17.94, to: 20.36, lines: ['LA MOLÉCULA', 'ESTÁ EN PAUSA.'], teal: 1},
    {from: 20.36, to: 24.57, lines: ['ENTONCES ENTRA EL AGUA.', 'TODO CAMBIA.']},
    {from: 24.57, to: 30.35, lines: ['LAS MOLÉCULAS SE MUEVEN.', 'LA QUÍMICA VUELVE.'], teal: 1},
    {from: 30.35, to: 34.26, lines: ['POLVO Y SOLUCIÓN:', 'DOS MUNDOS DIFERENTES.'], teal: 1},
    {from: 34.26, to: 39.47, lines: ['HECHO PARA ESPERAR.', 'HECHO PARA USARSE.']},
    {from: 39.47, to: 42.67, lines: ['ESE FUE EL MOMENTO EN QUE', 'EL RELOJ EMPEZÓ.'], teal: 1},
    {from: 42.67, to: 49.1, lines: ['PERO NO EXISTE', 'UN SOLO RELOJ.']},
    {from: 49.1, to: 53.61, lines: ['¿DOS RELOJES?', 'MAÑANA: DÍA 2.'], teal: 1},
  ],
  clips: [
    {src: 's2-clip1.mp4', from: 0, dur: 5.04},
    {src: 's2-clip2.mp4', from: 7.13, dur: 6.04},
    {src: 's2-clip3.mp4', from: 20.36, dur: 8.04},
    {src: 's2-clip4.mp4', from: 42.67, dur: 5.04},
  ],
  paused: {from: 13.17, to: 20.36, label1: 'SIN AGUA, NO HAY REACCIONES', label2: 'la molécula está en pausa'},
  worlds: {
    from: 30.35,
    to: 39.47,
    chipBAt: 36.74,
    dry: 'POLVO SECO',
    wet: 'EN SOLUCIÓN',
    chipA: 'HECHO PARA ESPERAR',
    chipB: 'HECHO PARA USARSE',
  },
  clockBeat: {from: 39.47, to: 42.67},
  endFrom: 53.61,
  dayChip: {from: 53.61, label: 'DÍA 1 DE 10'},
  disclaimer: 'Herramienta educativa. No es consejo médico. Solo con fines de investigación.',
  durationSec: 61,
};
