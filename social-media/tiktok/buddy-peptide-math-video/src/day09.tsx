import React from 'react';
import {
  AbsoluteFill,
  Audio,
  Img,
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

const AMBER = '#f59e0b';

type Day9Config = {
  id: string;
  flag: 'us' | 'mx' | 'br';
  voFile: string;
  cues: Cue[];
  badNote: {from: number; to: number; value: string; guesses: {label: string; at: number}[]};
  log: {from: number; to: number; title: string; lines: {text: string; at: number}[]};
  teaser: {from: number; to: number; phrase: string};
  buddy: {from: number; to: number};
  endFrom: number;
  dayChip: {from: number; label: string};
  disclaimer: string;
  durationSec: number;
};

// The failing note: a big bare "250" with amber guesses popping around it.
const BadNote: React.FC<{value: string; guesses: {label: string; at: number}[]}> = ({value, guesses}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const s = spring({frame, fps, config: {damping: 12, stiffness: 190}});
  return (
    <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 34}}>
      <div
        style={{
          opacity: s,
          transform: `scale(${interpolate(s, [0, 1], [0.7, 1])}) rotate(-2deg)`,
          background: '#f2f4f5',
          borderRadius: 18,
          padding: '34px 90px',
          boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
        }}
      >
        <span style={{fontFamily: anton.fontFamily, fontSize: 120, color: '#0e2a30'}}>{value}</span>
        <span style={{fontFamily: anton.fontFamily, fontSize: 120, color: AMBER}}> ?</span>
      </div>
      <div style={{display: 'flex', gap: 26}}>
        {guesses.map((g, i) => {
          const d = spring({frame: frame - g.at, fps, config: {damping: 11, stiffness: 220}});
          return (
            <div
              key={i}
              style={{
                opacity: d,
                transform: `scale(${interpolate(d, [0, 1], [0.5, 1])})`,
                border: `4px solid ${AMBER}`,
                background: '#1a1206',
                borderRadius: 999,
                padding: '16px 36px',
                fontFamily: anton.fontFamily,
                fontSize: 44,
                color: AMBER,
              }}
            >
              {g.label}
            </div>
          );
        })}
      </div>
    </div>
  );
};

// The mix log, filled line by line in sync with the voiceover.
const SyncedLog: React.FC<{title: string; lines: {text: string; at: number}[]}> = ({title, lines}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const s = spring({frame, fps, config: {damping: 13, stiffness: 170}});
  return (
    <div
      style={{
        opacity: s,
        transform: `scale(${interpolate(s, [0, 1], [0.8, 1])})`,
        background: '#0a1218',
        border: '4px solid #14424f',
        borderRadius: 32,
        width: 830,
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          background: TEAL_DEEP,
          padding: '18px 0',
          textAlign: 'center',
          fontFamily: anton.fontFamily,
          fontSize: 42,
          letterSpacing: 3,
          color: WHITE,
        }}
      >
        {title}
      </div>
      <div style={{padding: '18px 44px 28px'}}>
        {lines.map((line, i) => {
          const d = spring({frame: frame - line.at, fps, config: {damping: 13, stiffness: 200}});
          return (
            <div
              key={i}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 26,
                padding: '16px 0',
                borderBottom: i < lines.length - 1 ? '2px solid #14424f' : 'none',
                opacity: d,
                transform: `translateX(${interpolate(d, [0, 1], [40, 0])}px)`,
              }}
            >
              <div
                style={{
                  width: 50,
                  height: 50,
                  borderRadius: 12,
                  border: `3px solid ${TEAL}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontFamily: anton.fontFamily,
                  fontSize: 32,
                  color: TEAL,
                  flexShrink: 0,
                }}
              >
                {'✓'}
              </div>
              <span style={{fontFamily: archivo.fontFamily, fontWeight: 700, fontSize: 42, color: WHITE}}>
                {line.text}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};


// Series-two plant: a soft clock face fades in behind the vial while the phrase
// settles underneath. Once the water goes in, the clock starts.
const VialClock: React.FC<{phrase: string}> = ({phrase}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const s = spring({frame, fps, config: {damping: 14, stiffness: 120}});
  const clockIn = interpolate(frame, [10, 40], [0, 0.85], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const textIn = interpolate(frame, [30, 52], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const minuteAngle = frame * 1.2;
  const R = 330;
  return (
    <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 26, opacity: s}}>
      <div style={{position: 'relative', width: R * 2, height: R * 2, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
        <svg width={R * 2} height={R * 2} style={{position: 'absolute', inset: 0, opacity: clockIn}}>
          <circle cx={R} cy={R} r={R - 6} fill="none" stroke={TEAL} strokeWidth={6} style={{filter: "drop-shadow(0 0 22px rgba(42,182,201,0.65))"}} />
          {Array.from({length: 12}).map((_, i) => {
            const a = (i / 12) * Math.PI * 2;
            const x1 = R + Math.sin(a) * (R - 14);
            const y1 = R - Math.cos(a) * (R - 14);
            const x2 = R + Math.sin(a) * (R - 34);
            const y2 = R - Math.cos(a) * (R - 34);
            return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke={TEAL} strokeWidth={i % 3 === 0 ? 8 : 3.5} />;
          })}
          <line
            x1={R}
            y1={R}
            x2={R + Math.sin((minuteAngle * Math.PI) / 180) * (R - 60)}
            y2={R - Math.cos((minuteAngle * Math.PI) / 180) * (R - 60)}
            stroke={TEAL}
            strokeWidth={8}
            strokeLinecap="round"
          />
          <line
            x1={R}
            y1={R}
            x2={R + Math.sin((minuteAngle / 12) * (Math.PI / 180)) * (R - 130)}
            y2={R - Math.cos((minuteAngle / 12) * (Math.PI / 180)) * (R - 130)}
            stroke="#7fe6f2"
            strokeWidth={11}
            strokeLinecap="round"
          />
          <circle cx={R} cy={R} r={13} fill={TEAL} />
        </svg>
        <Img src={staticFile('vial-large.png')} style={{height: 330, borderRadius: 10, transform: `scale(${interpolate(s, [0, 1], [0.8, 1])})`}} />
      </div>
      <div
        style={{
          opacity: textIn,
          fontFamily: archivo.fontFamily,
          fontStyle: 'italic',
          fontWeight: 700,
          fontSize: 40,
          color: '#c9d4da',
          textAlign: 'center',
        }}
      >
        {phrase}
      </div>
    </div>
  );
};

export const Day9: React.FC<{locale: Day9Config}> = ({locale}) => {
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

      {/* The bare "250" note that cannot answer */}
      <Sequence from={sec(L.badNote.from)} durationInFrames={sec(L.badNote.to - L.badNote.from)}>
        <AbsoluteFill style={{alignItems: 'center', paddingTop: 760}}>
          <BadNote
            value={L.badNote.value}
            guesses={L.badNote.guesses.map((g) => ({label: g.label, at: sec(g.at - L.badNote.from)}))}
          />
        </AbsoluteFill>
      </Sequence>

      {/* The mix log fills in, one line per beat */}
      <Sequence from={sec(L.log.from)} durationInFrames={sec(L.log.to - L.log.from)}>
        <AbsoluteFill style={{alignItems: 'center', paddingTop: 700}}>
          <SyncedLog
            title={L.log.title}
            lines={L.log.lines.map((l) => ({text: l.text, at: sec(l.at - L.log.from)}))}
          />
        </AbsoluteFill>
      </Sequence>

      {/* Day 10 plant: the vial and the clock */}
      <Sequence from={sec(L.teaser.from)} durationInFrames={sec(L.teaser.to - L.teaser.from)}>
        <AbsoluteFill style={{alignItems: 'center', paddingTop: 560}}>
          <VialClock phrase={L.teaser.phrase} />
        </AbsoluteFill>
      </Sequence>

      {/* Buddy in the bottom zone */}
      <Sequence from={sec(L.buddy.from)} durationInFrames={sec(L.buddy.to - L.buddy.from)}>
        <AbsoluteFill style={{justifyContent: 'flex-end', alignItems: 'center', paddingBottom: 40}}>
          <Buddy size={300} />
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

export const DAY9_EN: Day9Config = {
  id: 'Day9EN',
  flag: 'us',
  voFile: 'd9-vo-en.mp3',
  cues: [
    {from: 0.05, to: 2.96, lines: ['QUICK TEST. YOUR', 'NOTE SAYS "250".']},
    {from: 2.96, to: 7.37, lines: ['250 WHAT?', 'MCG? UNITS? MG?'], teal: 1},
    {from: 7.37, to: 9.96, lines: ["IF IT CAN'T ANSWER,", 'THE NOTE FAILED.']},
    {from: 9.96, to: 12.36, lines: ['WRITE THIS DOWN', 'ON EVERY MIX:'], teal: 1},
    {from: 12.36, to: 15.57, lines: ['1. VIAL SIZE:', '10 MG.'], teal: 1},
    {from: 15.57, to: 19.6, lines: ['2. WATER IN:', '2.5 ML.'], teal: 1},
    {from: 19.6, to: 23.24, lines: ['3. CONCENTRATION:', '4 MG/ML.'], teal: 1},
    {from: 23.24, to: 29.78, lines: ['4. DOSE + UNIT:', '250 MCG = 6.25 UNITS.'], teal: 1},
    {from: 29.78, to: 32.93, lines: ['DATE IT. NO NUMBER', 'WITHOUT ITS UNIT.']},
    {from: 32.93, to: 38.83, lines: ['BUDDYPEPT KEEPS EVERY', 'NUMBER STRAIGHT. FREE.'], teal: 1},
  ],
  badNote: {
    from: 1.09,
    to: 9.96,
    value: '250',
    guesses: [
      {label: 'MCG?', at: 4.17},
      {label: 'UNITS?', at: 5.36},
      {label: 'MG?', at: 6.25},
    ],
  },
  log: {
    from: 9.96,
    to: 32.93,
    title: 'THE MIX LOG',
    lines: [
      {text: '1. Vial: 10 mg', at: 12.36},
      {text: '2. Water: 2.5 mL', at: 15.57},
      {text: '3. Concentration: 4 mg/mL', at: 19.6},
      {text: '4. Dose: 250 mcg = 6.25 units', at: 23.24},
      {text: '5. Date: every mix, every time', at: 29.78},
    ],
  },
  teaser: {from: 32.93, to: 38.83, phrase: 'once the water goes in, the clock starts'},
  buddy: {from: 32.93, to: 38.83},
  endFrom: 38.83,
  dayChip: {from: 40.39, label: 'DAY 9 OF 10'},
  disclaimer: 'Educational tool. Not medical advice. For research purposes only.',
  durationSec: 54,
};

export const DAY9_PT: Day9Config = {
  id: 'Day9PT',
  flag: 'br',
  voFile: 'd9-vo-pt.mp3',
  cues: [
    {from: 0.1, to: 3.79, lines: ['TESTE RÁPIDO. SUA', 'ANOTAÇÃO DIZ "250".']},
    {from: 3.79, to: 9.01, lines: ['250 O QUÊ?', 'MCG? UNIDADES? MG?'], teal: 1},
    {from: 9.01, to: 11.91, lines: ['SE NÃO RESPONDE,', 'A ANOTAÇÃO FALHOU.']},
    {from: 11.91, to: 14.36, lines: ['ANOTE ISTO EM', 'TODA MISTURA:'], teal: 1},
    {from: 14.36, to: 17.75, lines: ['1. FRASCO:', '10 MG.'], teal: 1},
    {from: 17.75, to: 21.75, lines: ['2. ÁGUA:', '2.5 ML.'], teal: 1},
    {from: 21.75, to: 25.61, lines: ['3. CONCENTRAÇÃO:', '4 MG/ML.'], teal: 1},
    {from: 25.61, to: 32.46, lines: ['4. DOSE + UNIDADE:', '250 MCG = 6.25 UNIDADES.'], teal: 1},
    {from: 32.46, to: 36.26, lines: ['DATE. NENHUM NÚMERO', 'SEM A UNIDADE.']},
    {from: 36.26, to: 41.5, lines: ['O BUDDYPEPT MANTÉM', 'TUDO CERTO. GRÁTIS.'], teal: 1},
  ],
  badNote: {
    from: 1.15,
    to: 11.91,
    value: '250',
    guesses: [
      {label: 'MCG?', at: 5.58},
      {label: 'UNIDADES?', at: 6.79},
      {label: 'MG?', at: 7.86},
    ],
  },
  log: {
    from: 11.91,
    to: 36.26,
    title: 'REGISTRO DA MISTURA',
    lines: [
      {text: '1. Frasco: 10 mg', at: 14.36},
      {text: '2. Água: 2.5 mL', at: 17.75},
      {text: '3. Concentração: 4 mg/mL', at: 21.75},
      {text: '4. Dose: 250 mcg = 6.25 unidades', at: 25.61},
      {text: '5. Data: toda mistura, sempre', at: 32.46},
    ],
  },
  teaser: {from: 36.26, to: 41.5, phrase: 'depois que a água entra, o relógio começa a contar'},
  buddy: {from: 36.26, to: 41.5},
  endFrom: 41.5,
  dayChip: {from: 42.2, label: 'DIA 9 DE 10'},
  disclaimer: 'Ferramenta educacional. Não é orientação médica. Somente para fins de pesquisa.',
  durationSec: 56,
};

export const DAY9_ES: Day9Config = {
  id: 'Day9ES',
  flag: 'mx',
  voFile: 'd9-vo-es.mp3',
  cues: [
    {from: 0.1, to: 4.62, lines: ['PRUEBA RÁPIDA. TU', 'NOTA DICE "250".']},
    {from: 4.62, to: 12.38, lines: ['¿250 QUÉ?', '¿MCG? ¿UNIDADES? ¿MG?'], teal: 1},
    {from: 12.38, to: 16.28, lines: ['SI NO PUEDE RESPONDER,', 'LA NOTA FALLÓ.']},
    {from: 16.28, to: 19.49, lines: ['ANOTA ESTO EN', 'CADA MEZCLA:'], teal: 1},
    {from: 19.49, to: 24.35, lines: ['1. VIAL:', '10 MG.'], teal: 1},
    {from: 24.35, to: 29.83, lines: ['2. AGUA:', '2.5 ML.'], teal: 1},
    {from: 29.83, to: 35.23, lines: ['3. CONCENTRACIÓN:', '4 MG/ML.'], teal: 1},
    {from: 35.23, to: 43.35, lines: ['4. DOSIS + UNIDAD:', '250 MCG = 6.25 UNIDADES.'], teal: 1},
    {from: 43.35, to: 48.37, lines: ['PONLE FECHA. NINGÚN', 'NÚMERO SIN SU UNIDAD.']},
    {from: 48.37, to: 55.53, lines: ['BUDDYPEPT MANTIENE TODO', 'EN ORDEN. GRATIS.'], teal: 1},
  ],
  badNote: {
    from: 1.82,
    to: 16.28,
    value: '250',
    guesses: [
      {label: '¿MCG?', at: 6.89},
      {label: '¿UNIDADES?', at: 8.78},
      {label: '¿MG?', at: 10.51},
    ],
  },
  log: {
    from: 16.28,
    to: 48.37,
    title: 'REGISTRO DE LA MEZCLA',
    lines: [
      {text: '1. Vial: 10 mg', at: 19.49},
      {text: '2. Agua: 2.5 mL', at: 24.35},
      {text: '3. Concentración: 4 mg/mL', at: 29.83},
      {text: '4. Dosis: 250 mcg = 6.25 unidades', at: 35.23},
      {text: '5. Fecha: cada mezcla, siempre', at: 43.35},
    ],
  },
  teaser: {from: 48.37, to: 55.53, phrase: 'cuando entra el agua, el reloj empieza a correr'},
  buddy: {from: 48.37, to: 55.53},
  endFrom: 55.53,
  dayChip: {from: 56.2, label: 'DÍA 9 DE 10'},
  disclaimer: 'Herramienta educativa. No es consejo médico. Solo con fines de investigación.',
  durationSec: 73,
};
