import React from 'react';
import {
  AbsoluteFill,
  Audio,
  interpolate,
  Sequence,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import {loadFont as loadAnton} from '@remotion/google-fonts/Anton';
import {loadFont as loadArchivo} from '@remotion/google-fonts/Archivo';
import type {Cue} from './locales';
import {BG, Buddy, Caption, FPS, Flag, Glow, Logo, TEAL, TEAL_DEEP, WHITE} from './Video';

const anton = loadAnton();
const archivo = loadArchivo();

type Day5Config = {
  id: string;
  flag: 'us' | 'mx' | 'br';
  voFile: string;
  cues: Cue[];
  triangle: {from: number; to: number; topAt: number; bottomAt: number; labels: [string, string, string]};
  formulas: {aAt: number; bAt: number; a: string; b: string};
  example: {from: number; to: number; top: string; mid: string; bottom: string};
  buddy: {from: number; to: number};
  endFrom: number;
  dayChip: {from: number; label: string};
  disclaimer: string;
  durationSec: number;
};

// The concentration triangle: mg on top, mg/mL and mL below, built in steps.
const Triangle: React.FC<{
  topAt: number; // frames rel. to sequence start
  bottomAt: number;
  labels: [string, string, string];
  fAAt: number;
  fBAt: number;
  fA: string;
  fB: string;
}> = ({topAt, bottomAt, labels, fAAt, fBAt, fA, fB}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const outline = spring({frame, fps, config: {damping: 14, stiffness: 160}});
  const top = spring({frame: frame - topAt, fps, config: {damping: 12, stiffness: 200}});
  const bottom = spring({frame: frame - bottomAt, fps, config: {damping: 12, stiffness: 200}});
  const chipA = spring({frame: frame - fAAt, fps, config: {damping: 13, stiffness: 200}});
  const chipB = spring({frame: frame - fBAt, fps, config: {damping: 13, stiffness: 200}});
  const node = (label: string, s: number, filled?: boolean): React.ReactElement => (
    <div
      style={{
        opacity: s,
        transform: `scale(${interpolate(s, [0, 1], [0.5, 1])})`,
        background: filled ? TEAL_DEEP : '#0a1218',
        border: `4px solid ${filled ? TEAL : '#14424f'}`,
        borderRadius: 28,
        padding: '22px 44px',
        fontFamily: anton.fontFamily,
        fontSize: 64,
        color: WHITE,
        boxShadow: filled ? '0 0 70px rgba(42,182,201,0.35)' : 'none',
      }}
    >
      {label}
    </div>
  );
  return (
    <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
      <div style={{position: 'relative', width: 760, height: 420}}>
        <svg
          width={760}
          height={420}
          style={{position: 'absolute', inset: 0, opacity: outline}}
        >
          <path
            d="M380 60 L120 340 L640 340 Z"
            fill="none"
            stroke="#14424f"
            strokeWidth={6}
            strokeLinejoin="round"
          />
          <line x1={198} y1={340} x2={562} y2={340} stroke={TEAL} strokeWidth={5} opacity={0.5} />
        </svg>
        <div style={{position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)'}}>
          {node(labels[0], top, true)}
        </div>
        <div style={{position: 'absolute', bottom: 0, left: 8}}>{node(labels[1], bottom)}</div>
        <div style={{position: 'absolute', bottom: 0, right: 8}}>{node(labels[2], bottom)}</div>
      </div>
      <div style={{display: 'flex', gap: 30, marginTop: 44}}>
        <div
          style={{
            opacity: chipA,
            transform: `scale(${interpolate(chipA, [0, 1], [0.6, 1])})`,
            background: '#0a1218',
            border: '3px solid #14424f',
            borderRadius: 999,
            padding: '18px 40px',
            fontFamily: archivo.fontFamily,
            fontWeight: 700,
            fontSize: 40,
            color: TEAL,
          }}
        >
          {fA}
        </div>
        <div
          style={{
            opacity: chipB,
            transform: `scale(${interpolate(chipB, [0, 1], [0.6, 1])})`,
            background: '#0a1218',
            border: '3px solid #14424f',
            borderRadius: 999,
            padding: '18px 40px',
            fontFamily: archivo.fontFamily,
            fontWeight: 700,
            fontSize: 40,
            color: TEAL,
          }}
        >
          {fB}
        </div>
      </div>
    </div>
  );
};

const ExampleCard: React.FC<{top: string; mid: string; bottom: string}> = ({top, mid, bottom}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const s = spring({frame, fps, config: {damping: 12, stiffness: 200}});
  return (
    <div
      style={{
        opacity: s,
        transform: `scale(${interpolate(s, [0, 1], [0.8, 1])})`,
        background: TEAL_DEEP,
        borderRadius: 36,
        padding: '50px 70px',
        textAlign: 'center',
        boxShadow: '0 0 120px rgba(42,182,201,0.35)',
        maxWidth: 880,
      }}
    >
      <div style={{fontFamily: archivo.fontFamily, fontSize: 36, color: '#d8f6fa', marginBottom: 10}}>{top}</div>
      <div style={{fontFamily: anton.fontFamily, fontSize: 96, color: WHITE, lineHeight: 1.05}}>{mid}</div>
      <div style={{fontFamily: archivo.fontFamily, fontWeight: 600, fontSize: 38, color: '#d8f6fa', marginTop: 16}}>
        {bottom}
      </div>
    </div>
  );
};

export const Day5: React.FC<{locale: Day5Config}> = ({locale}) => {
  const frame = useCurrentFrame();
  const sec = (s: number) => Math.round(s * FPS);
  const L = locale;

  return (
    <AbsoluteFill style={{background: BG}}>
      <Audio src={staticFile(L.voFile)} />
      <Audio src={staticFile('music.wav')} volume={0.55} />
      <Glow />

      <AbsoluteFill style={{alignItems: 'center', paddingTop: 90}}>
        <Logo small />
      </AbsoluteFill>
      <Flag code={L.flag} />

      {L.cues.map((cue) => (
        <Sequence key={cue.from} from={sec(cue.from)} durationInFrames={sec(cue.to - cue.from)}>
          <Caption cue={cue} />
        </Sequence>
      ))}

      {/* Buddy in the bottom zone */}
      <Sequence from={sec(L.buddy.from)} durationInFrames={sec(L.buddy.to - L.buddy.from)}>
        <AbsoluteFill style={{justifyContent: 'flex-end', alignItems: 'center', paddingBottom: 60}}>
          <Buddy size={330} />
        </AbsoluteFill>
      </Sequence>

      {/* Triangle diagram in the middle band */}
      <Sequence from={sec(L.triangle.from)} durationInFrames={sec(L.triangle.to - L.triangle.from)}>
        <AbsoluteFill style={{alignItems: 'center', paddingTop: 700}}>
          <Triangle
            topAt={sec(L.triangle.topAt - L.triangle.from)}
            bottomAt={sec(L.triangle.bottomAt - L.triangle.from)}
            labels={L.triangle.labels}
            fAAt={sec(L.formulas.aAt - L.triangle.from)}
            fBAt={sec(L.formulas.bAt - L.triangle.from)}
            fA={L.formulas.a}
            fB={L.formulas.b}
          />
        </AbsoluteFill>
      </Sequence>

      {/* Worked example card */}
      <Sequence from={sec(L.example.from)} durationInFrames={sec(L.example.to - L.example.from)}>
        <AbsoluteFill style={{alignItems: 'center', paddingTop: 840}}>
          <ExampleCard top={L.example.top} mid={L.example.mid} bottom={L.example.bottom} />
        </AbsoluteFill>
      </Sequence>

      {/* End card with day counter */}
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
                opacity: interpolate(frame, [sec(L.endFrom + 0.5), sec(L.endFrom + 1.1)], [0, 1], {
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
                opacity: interpolate(frame, [sec(L.endFrom + 1.9), sec(L.endFrom + 2.5)], [0, 1], {
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

export const DAY5_EN: Day5Config = {
  id: 'Day5EN',
  flag: 'us',
  voFile: 'd5-vo-en.mp3',
  cues: [
    {from: 0.05, to: 5.68, lines: ['3 NUMBERS RUN', 'EVERY VIAL.'], teal: 1},
    {from: 5.68, to: 7.2, lines: ['THEY FORM', 'A TRIANGLE.']},
    {from: 7.2, to: 8.67, lines: ['MG ON TOP.'], teal: 1},
    {from: 8.67, to: 11.18, lines: ['MG/ML AND ML', 'BELOW.']},
    {from: 11.18, to: 14.39, lines: ['COVER ONE,', 'THE OTHER TWO GIVE IT.'], teal: 1},
    {from: 14.39, to: 18.23, lines: ['MG ÷ ML', '= MG/ML'], teal: 1},
    {from: 18.23, to: 21.91, lines: ['MG/ML × ML', '= MG'], teal: 1},
    {from: 21.91, to: 26.41, lines: ['5 MG IN 2 ML?', '2.5 MG/ML.'], teal: 1},
    {from: 26.41, to: 27.41, lines: ['EVERY TIME.']},
    {from: 27.41, to: 29.84, lines: ['BUDDYPEPT RUNS', 'THE TRIANGLE.'], teal: 1},
  ],
  triangle: {
    from: 5.68,
    to: 21.91,
    topAt: 7.2,
    bottomAt: 8.67,
    labels: ['mg', 'mg/mL', 'mL'],
  },
  formulas: {aAt: 14.39, bAt: 18.23, a: 'mg ÷ mL = mg/mL', b: 'mg/mL × mL = mg'},
  example: {
    from: 21.91,
    to: 29.84,
    top: 'The triangle at work',
    mid: '5 MG ÷ 2 ML = 2.5 MG/ML',
    bottom: 'Every time',
  },
  buddy: {from: 27.41, to: 29.84},
  endFrom: 29.84,
  dayChip: {from: 32.1, label: 'DAY 5 OF 10'},
  disclaimer: 'Educational tool. Not medical advice. For research purposes only.',
  durationSec: 49,
};

export const DAY5_PT: Day5Config = {
  id: 'Day5PT',
  flag: 'br',
  voFile: 'd5-vo-pt.mp3',
  cues: [
    {from: 0.1, to: 4.61, lines: ['3 NÚMEROS COMANDAM', 'TODO FRASCO.'], teal: 1},
    {from: 4.61, to: 6.22, lines: ['ELES FORMAM', 'UM TRIÂNGULO.']},
    {from: 6.22, to: 7.72, lines: ['MG EM CIMA.'], teal: 1},
    {from: 7.72, to: 10.01, lines: ['MG/ML E ML', 'EMBAIXO.']},
    {from: 10.01, to: 13.66, lines: ['CUBRA UM,', 'OS OUTROS DOIS ENTREGAM.'], teal: 1},
    {from: 13.66, to: 17.18, lines: ['MG ÷ ML', '= MG/ML'], teal: 1},
    {from: 17.18, to: 20.46, lines: ['MG/ML × ML', '= MG'], teal: 1},
    {from: 20.46, to: 25.1, lines: ['5 MG EM 2 ML?', '2.5 MG/ML.'], teal: 1},
    {from: 25.1, to: 25.99, lines: ['SEMPRE.']},
    {from: 25.99, to: 28.69, lines: ['O BUDDYPEPT RODA', 'O TRIÂNGULO.'], teal: 1},
  ],
  triangle: {
    from: 4.61,
    to: 20.46,
    topAt: 6.22,
    bottomAt: 7.72,
    labels: ['mg', 'mg/mL', 'mL'],
  },
  formulas: {aAt: 13.66, bAt: 17.18, a: 'mg ÷ mL = mg/mL', b: 'mg/mL × mL = mg'},
  example: {
    from: 20.46,
    to: 28.69,
    top: 'O triângulo em ação',
    mid: '5 MG ÷ 2 ML = 2.5 MG/ML',
    bottom: 'Sempre',
  },
  buddy: {from: 25.99, to: 28.69},
  endFrom: 28.69,
  dayChip: {from: 31.06, label: 'DIA 5 DE 10'},
  disclaimer: 'Ferramenta educacional. Não é orientação médica. Somente para fins de pesquisa.',
  durationSec: 49,
};

export const DAY5_ES: Day5Config = {
  id: 'Day5ES',
  flag: 'mx',
  voFile: 'd5-vo-es.mp3',
  cues: [
    {from: 0.1, to: 5.88, lines: ['3 NÚMEROS GOBIERNAN', 'TODO VIAL.'], teal: 1},
    {from: 5.88, to: 8.02, lines: ['FORMAN UN', 'TRIÁNGULO.']},
    {from: 8.02, to: 10.12, lines: ['MG ARRIBA.'], teal: 1},
    {from: 10.12, to: 13.01, lines: ['MG/ML Y ML', 'ABAJO.']},
    {from: 13.01, to: 16.7, lines: ['CUBRE UNO,', 'LOS OTROS DOS TE LO DAN.'], teal: 1},
    {from: 16.7, to: 21.42, lines: ['MG ÷ ML', '= MG/ML'], teal: 1},
    {from: 21.42, to: 25.7, lines: ['MG/ML × ML', '= MG'], teal: 1},
    {from: 25.7, to: 31.72, lines: ['¿5 MG EN 2 ML?', '2.5 MG/ML.'], teal: 1},
    {from: 31.72, to: 33.28, lines: ['SIEMPRE.']},
    {from: 33.28, to: 36.5, lines: ['BUDDYPEPT CORRE', 'EL TRIÁNGULO.'], teal: 1},
  ],
  triangle: {
    from: 5.88,
    to: 25.7,
    topAt: 8.02,
    bottomAt: 10.12,
    labels: ['mg', 'mg/mL', 'mL'],
  },
  formulas: {aAt: 16.7, bAt: 21.42, a: 'mg ÷ mL = mg/mL', b: 'mg/mL × mL = mg'},
  example: {
    from: 25.7,
    to: 36.5,
    top: 'El triángulo en acción',
    mid: '5 MG ÷ 2 ML = 2.5 MG/ML',
    bottom: 'Siempre',
  },
  buddy: {from: 33.28, to: 36.5},
  endFrom: 36.5,
  dayChip: {from: 39.6, label: 'DÍA 5 DE 10'},
  disclaimer: 'Herramienta educativa. No es consejo médico. Solo con fines de investigación.',
  durationSec: 63,
};
