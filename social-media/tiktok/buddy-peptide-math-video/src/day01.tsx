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
import {BG, Buddy, Caption, FPS, Flag, Glow, Logo, MUTED, TEAL, TEAL_DEEP, WHITE} from './Video';

const anton = loadAnton();
const archivo = loadArchivo();

type Card = {title: string; sub: string; value: string};

type Day1Config = {
  id: string;
  flag: 'us' | 'mx' | 'br';
  voFile: string;
  cues: Cue[];
  cards: {from: number; to: number; a: Card; b: Card; bFrom: number};
  info: {from: number; to: number; top: string; mid: string; bottom: string};
  buddy: {from: number; to: number};
  endFrom: number;
  dayChip: {from: number; label: string};
  disclaimer: string;
  durationSec: number;
};

const VialCard: React.FC<Card> = ({title, sub, value}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const s = spring({frame, fps, config: {damping: 13, stiffness: 190}});
  return (
    <div
      style={{
        opacity: s,
        transform: `scale(${interpolate(s, [0, 1], [0.8, 1])})`,
        background: '#0a1218',
        border: '4px solid #14424f',
        borderRadius: 32,
        padding: '40px 36px',
        width: 400,
        textAlign: 'center',
      }}
    >
      <div style={{fontFamily: anton.fontFamily, fontSize: 84, color: WHITE, lineHeight: 1}}>{title}</div>
      <div style={{fontFamily: archivo.fontFamily, fontSize: 34, color: MUTED, marginTop: 10}}>{sub}</div>
      <div style={{fontFamily: anton.fontFamily, fontSize: 60, color: TEAL, marginTop: 22}}>{value}</div>
    </div>
  );
};

const InfoCard: React.FC<{top: string; mid: string; bottom: string}> = ({top, mid, bottom}) => {
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
        maxWidth: 860,
      }}
    >
      <div style={{fontFamily: archivo.fontFamily, fontSize: 36, color: '#d8f6fa', marginBottom: 10}}>{top}</div>
      <div style={{fontFamily: anton.fontFamily, fontSize: 120, color: WHITE, lineHeight: 1}}>{mid}</div>
      <div style={{fontFamily: archivo.fontFamily, fontWeight: 600, fontSize: 38, color: '#d8f6fa', marginTop: 16}}>
        {bottom}
      </div>
    </div>
  );
};

export const Day1: React.FC<{locale: Day1Config}> = ({locale}) => {
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
        <AbsoluteFill style={{justifyContent: 'flex-end', alignItems: 'center', paddingBottom: 70}}>
          <Buddy size={380} />
        </AbsoluteFill>
      </Sequence>

      {/* Draw-count cards in the middle band */}
      <Sequence from={sec(L.cards.from)} durationInFrames={sec(L.cards.to - L.cards.from)}>
        <AbsoluteFill style={{alignItems: 'center', paddingTop: 800}}>
          <div style={{display: 'flex', gap: 40}}>
            <VialCard {...L.cards.a} />
            <Sequence from={sec(L.cards.bFrom - L.cards.from)} layout="none">
              <VialCard {...L.cards.b} />
            </Sequence>
          </div>
        </AbsoluteFill>
      </Sequence>

      {/* Teal takeaway card */}
      <Sequence from={sec(L.info.from)} durationInFrames={sec(L.info.to - L.info.from)}>
        <AbsoluteFill style={{alignItems: 'center', paddingTop: 840}}>
          <InfoCard top={L.info.top} mid={L.info.mid} bottom={L.info.bottom} />
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

export const DAY1_EN: Day1Config = {
  id: 'Day1EN',
  flag: 'us',
  voFile: 'd1-vo-en.mp3',
  cues: [
    {from: 0.05, to: 3.65, lines: ['WHICH VIAL', 'IS STRONGER?'], teal: 1},
    {from: 3.65, to: 4.73, lines: ['TRICK QUESTION.']},
    {from: 4.73, to: 6.41, lines: ['A VIAL HAS', 'NO STRENGTH.'], teal: 1},
    {from: 6.41, to: 9.11, lines: ['10 MG IS SIMPLY', 'MORE PEPTIDE.']},
    {from: 9.11, to: 12.46, lines: ['1 MG PER DRAW', '= 10 DRAWS.'], teal: 1},
    {from: 12.46, to: 14.53, lines: ['5 MG = 5 DRAWS.']},
    {from: 14.53, to: 17.08, lines: ['WATER NEVER CHANGES', 'THE AMOUNT.']},
    {from: 17.08, to: 19.38, lines: ['1 MG IS 1 MG.'], teal: 1},
    {from: 19.38, to: 23.67, lines: ['MORE WATER =', 'MORE UNITS PER DRAW.'], teal: 1},
    {from: 23.67, to: 25.89, lines: ['BUDDYPEPT', 'DOES THE MATH.'], teal: 1},
  ],
  cards: {
    from: 9.11,
    to: 17.08,
    a: {title: '10 mg', sub: '1 mg per draw', value: '10 DRAWS'},
    b: {title: '5 mg', sub: '1 mg per draw', value: '5 DRAWS'},
    bFrom: 12.46,
  },
  info: {
    from: 17.08,
    to: 25.89,
    top: 'Water never changes the amount',
    mid: '1 MG = 1 MG',
    bottom: 'More water = more units per draw',
  },
  buddy: {from: 4.73, to: 25.89},
  endFrom: 25.89,
  dayChip: {from: 28.14, label: 'DAY 2 OF 10'},
  disclaimer: 'Educational tool. Not medical advice. For research purposes only.',
  durationSec: 44,
};

export const DAY1_ES: Day1Config = {
  id: 'Day1ES',
  flag: 'mx',
  voFile: 'd1-vo-es.mp3',
  cues: [
    {from: 0.1, to: 3.85, lines: ['¿QUÉ VIAL ES', 'MÁS FUERTE?'], teal: 1},
    {from: 3.85, to: 5.88, lines: ['PREGUNTA CAPCIOSA.']},
    {from: 5.88, to: 8.26, lines: ['UN VIAL NO', 'TIENE FUERZA.'], teal: 1},
    {from: 8.26, to: 11.72, lines: ['10 MG ES SIMPLEMENTE', 'MÁS PÉPTIDO.']},
    {from: 11.72, to: 15.57, lines: ['1 MG POR VEZ', '= 10 VECES.'], teal: 1},
    {from: 15.57, to: 18.91, lines: ['5 MG = 5 VECES.']},
    {from: 18.91, to: 21.93, lines: ['EL AGUA NUNCA', 'CAMBIA LA CANTIDAD.']},
    {from: 21.93, to: 24.56, lines: ['1 MG ES 1 MG.'], teal: 1},
    {from: 24.56, to: 29.53, lines: ['MÁS AGUA =', 'MÁS UNIDADES POR VEZ.'], teal: 1},
    {from: 29.53, to: 32.79, lines: ['BUDDYPEPT', 'HACE LA MATEMÁTICA.'], teal: 1},
  ],
  cards: {
    from: 11.72,
    to: 18.91,
    a: {title: '10 mg', sub: '1 mg por vez', value: '10 VECES'},
    b: {title: '5 mg', sub: '1 mg por vez', value: '5 VECES'},
    bFrom: 15.57,
  },
  info: {
    from: 18.91,
    to: 32.79,
    top: 'El agua nunca cambia la cantidad',
    mid: '1 MG = 1 MG',
    bottom: 'Más agua = más unidades por vez',
  },
  buddy: {from: 5.88, to: 32.79},
  endFrom: 32.79,
  dayChip: {from: 35.88, label: 'DÍA 2 DE 10'},
  disclaimer: 'Herramienta educativa. No es consejo médico. Solo con fines de investigación.',
  durationSec: 59,
};

export const DAY1_PT: Day1Config = {
  id: 'Day1PT',
  flag: 'br',
  voFile: 'd1-vo-pt.mp3',
  cues: [
    {from: 0.1, to: 3.38, lines: ['QUAL FRASCO É', 'MAIS FORTE?'], teal: 1},
    {from: 3.38, to: 4.38, lines: ['PEGADINHA.']},
    {from: 4.38, to: 6.14, lines: ['UM FRASCO NÃO', 'TEM FORÇA.'], teal: 1},
    {from: 6.14, to: 9.14, lines: ['10 MG É SIMPLESMENTE', 'MAIS PEPTÍDEO.']},
    {from: 9.14, to: 11.91, lines: ['1 MG POR VEZ', '= 10 VEZES.'], teal: 1},
    {from: 11.91, to: 14.28, lines: ['5 MG = 5 VEZES.']},
    {from: 14.28, to: 16.5, lines: ['A ÁGUA NUNCA MUDA', 'A QUANTIDADE.']},
    {from: 16.5, to: 18.21, lines: ['1 MG É 1 MG.'], teal: 1},
    {from: 18.21, to: 22.51, lines: ['MAIS ÁGUA =', 'MAIS UNIDADES POR VEZ.'], teal: 1},
    {from: 22.51, to: 25.36, lines: ['O BUDDYPEPT', 'FAZ A MATEMÁTICA.'], teal: 1},
  ],
  cards: {
    from: 9.14,
    to: 14.28,
    a: {title: '10 mg', sub: '1 mg por vez', value: '10 VEZES'},
    b: {title: '5 mg', sub: '1 mg por vez', value: '5 VEZES'},
    bFrom: 11.91,
  },
  info: {
    from: 14.28,
    to: 25.36,
    top: 'A água nunca muda a quantidade',
    mid: '1 MG = 1 MG',
    bottom: 'Mais água = mais unidades por vez',
  },
  buddy: {from: 4.38, to: 25.36},
  endFrom: 25.36,
  dayChip: {from: 27.74, label: 'DIA 2 DE 10'},
  disclaimer: 'Ferramenta educacional. Não é orientação médica. Somente para fins de pesquisa.',
  durationSec: 46,
};
