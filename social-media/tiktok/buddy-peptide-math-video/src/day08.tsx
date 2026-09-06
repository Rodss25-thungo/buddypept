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
import {Syringe} from './day06';

const anton = loadAnton();
const archivo = loadArchivo();

const AMBER = '#f59e0b';

type PanelCfg = {
  title: string;
  mix: string;
  conc: string;
  units: number;
  unitsLabel: string;
};

type Day8Config = {
  id: string;
  flag: 'us' | 'mx' | 'br';
  voFile: string;
  cues: Cue[];
  panels: {from: number; to: number; bFrom: number; a: PanelCfg; b: PanelCfg};
  alarm: {from: number; to: number; line1: string; line2: string};
  log: {from: number; to: number; title: string; lines: string[]};
  buddy: {from: number; to: number};
  endFrom: number;
  dayChip: {from: number; label: string};
  disclaimer: string;
  durationSec: number;
};

// A day panel: date-style header, the mix, the concentration, and a syringe
// filled to that mix's units for the same 250 mcg dose.
const DayPanel: React.FC<{cfg: PanelCfg; accent: string}> = ({cfg, accent}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const s = spring({frame, fps, config: {damping: 13, stiffness: 170}});
  return (
    <div
      style={{
        opacity: s,
        transform: `scale(${interpolate(s, [0, 1], [0.75, 1])})`,
        background: '#0a1218',
        border: `4px solid ${accent}`,
        borderRadius: 32,
        padding: '0 26px 20px',
        width: 440,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          alignSelf: 'stretch',
          margin: '0 -26px',
          background: accent,
          padding: '14px 0',
          textAlign: 'center',
          fontFamily: anton.fontFamily,
          fontSize: 40,
          letterSpacing: 3,
          color: '#04262b',
        }}
      >
        {cfg.title}
      </div>
      <div style={{fontFamily: anton.fontFamily, fontSize: 52, color: WHITE, marginTop: 18}}>
        {cfg.mix}
      </div>
      <div style={{fontFamily: archivo.fontFamily, fontWeight: 700, fontSize: 32, color: MUTED, marginTop: 6}}>
        {cfg.conc}
      </div>
      <div style={{marginTop: 10}}>
        <Syringe units={cfg.units} label={cfg.unitsLabel} />
      </div>
    </div>
  );
};

// Amber alarm chip: copying yesterday's number onto today's mix doubles the dose.
const CopyAlarm: React.FC<{line1: string; line2: string}> = ({line1, line2}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const s = spring({frame, fps, config: {damping: 9, stiffness: 240}});
  const pulse = 1 + 0.04 * Math.sin(frame / 3);
  return (
    <div
      style={{
        opacity: s,
        transform: `scale(${interpolate(s, [0, 1], [0.6, 1]) * pulse})`,
        background: '#1a1206',
        border: `5px solid ${AMBER}`,
        borderRadius: 28,
        padding: '26px 52px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 6,
        boxShadow: '0 0 90px rgba(245,158,11,0.35)',
      }}
    >
      <div style={{fontFamily: anton.fontFamily, fontSize: 58, color: AMBER}}>{line1}</div>
      <div style={{fontFamily: archivo.fontFamily, fontWeight: 700, fontSize: 36, color: WHITE}}>{line2}</div>
    </div>
  );
};


// Notebook-style log card: lines check off one by one with a teal tick.
const LogCard: React.FC<{title: string; lines: string[]}> = ({title, lines}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const s = spring({frame, fps, config: {damping: 13, stiffness: 170}});
  return (
    <div
      style={{
        opacity: s,
        transform: `scale(${interpolate(s, [0, 1], [0.75, 1])})`,
        background: '#0a1218',
        border: '4px solid #14424f',
        borderRadius: 32,
        width: 620,
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          background: TEAL_DEEP,
          padding: '16px 0',
          textAlign: 'center',
          fontFamily: anton.fontFamily,
          fontSize: 38,
          letterSpacing: 3,
          color: WHITE,
        }}
      >
        {title}
      </div>
      <div style={{padding: '18px 40px 26px'}}>
        {lines.map((line, i) => {
          const d = spring({frame: frame - 14 - i * 22, fps, config: {damping: 13, stiffness: 200}});
          return (
            <div
              key={i}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 24,
                padding: '14px 0',
                borderBottom: i < lines.length - 1 ? '2px solid #14424f' : 'none',
                opacity: d,
                transform: `translateX(${interpolate(d, [0, 1], [40, 0])}px)`,
              }}
            >
              <div
                style={{
                  width: 46,
                  height: 46,
                  borderRadius: 12,
                  border: `3px solid ${TEAL}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontFamily: anton.fontFamily,
                  fontSize: 30,
                  color: TEAL,
                  flexShrink: 0,
                }}
              >
                {'✓'}
              </div>
              <span style={{fontFamily: archivo.fontFamily, fontWeight: 700, fontSize: 38, color: WHITE}}>
                {line}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export const Day8: React.FC<{locale: Day8Config}> = ({locale}) => {
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

      {/* Yesterday panel, then today's panel beside it */}
      <Sequence from={sec(L.panels.from)} durationInFrames={sec(L.panels.to - L.panels.from)}>
        <AbsoluteFill style={{alignItems: 'center', paddingTop: 690}}>
          <div style={{display: 'flex', gap: 44, alignItems: 'flex-start'}}>
            <DayPanel cfg={L.panels.a} accent={TEAL} />
            <Sequence from={sec(L.panels.bFrom - L.panels.from)} layout="none">
              <DayPanel cfg={L.panels.b} accent={TEAL_DEEP} />
            </Sequence>
          </div>
        </AbsoluteFill>
      </Sequence>

      {/* Copying yesterday's number = 2x alarm */}
      <Sequence from={sec(L.alarm.from)} durationInFrames={sec(L.alarm.to - L.alarm.from)}>
        <AbsoluteFill style={{alignItems: 'center', paddingTop: 900}}>
          <CopyAlarm line1={L.alarm.line1} line2={L.alarm.line2} />
        </AbsoluteFill>
      </Sequence>

      {/* Logbook card: what gets written down for each mix */}
      <Sequence from={sec(L.log.from)} durationInFrames={sec(L.log.to - L.log.from)}>
        <AbsoluteFill style={{alignItems: 'center', paddingTop: 700}}>
          <LogCard title={L.log.title} lines={L.log.lines} />
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

export const DAY8_EN: Day8Config = {
  id: 'Day8EN',
  flag: 'us',
  voFile: 'd8-vo-en.mp3',
  cues: [
    {from: 0.05, to: 2.64, lines: ['YOU WROTE 12.5 UNITS', 'LAST TIME.']},
    {from: 2.64, to: 5.57, lines: ['NEW VIAL TODAY.', 'CAN YOU COPY IT?'], teal: 1},
    {from: 5.57, to: 7.37, lines: ['ONLY IF THE', 'WATER MATCHES.'], teal: 1},
    {from: 7.37, to: 12.57, lines: ['SAME VIAL: 10 MG.', 'LAST TIME: 5 ML.']},
    {from: 12.57, to: 18.49, lines: ['2 MG/ML. 250 MCG', '= 12.5 UNITS.'], teal: 1},
    {from: 18.49, to: 23.99, lines: ['TODAY: 2.5 ML.', '= 4 MG/ML.']},
    {from: 23.99, to: 28.82, lines: ['SAME 250 MCG', '= 6.25 UNITS.'], teal: 1},
    {from: 28.82, to: 32.81, lines: ['COPY 12.5 AND YOU', 'DOUBLED THE DOSE.']},
    {from: 32.81, to: 36.37, lines: ['THE NUMBER BELONGS TO', 'THE MIX, NOT THE PEPTIDE.'], teal: 1},
    {from: 36.37, to: 41.42, lines: ['BUDDYPEPT RECALCULATES', 'IN SECONDS. FREE.'], teal: 1},
  ],
  panels: {
    from: 7.37,
    to: 36.37,
    bFrom: 18.49,
    a: {title: 'YESTERDAY', mix: '10 mg + 5 mL', conc: '2 mg/mL', units: 12.5, unitsLabel: '12.5 units'},
    b: {title: 'TODAY', mix: '10 mg + 2.5 mL', conc: '4 mg/mL', units: 6.25, unitsLabel: '6.25 units'},
  },
  alarm: {from: 28.82, to: 32.81, line1: '12.5 UNITS TODAY = 500 MCG', line2: '2x the dose'},
  log: {from: 36.37, to: 41.42, title: 'THE MIX LOG', lines: ['Date: today', 'Vial: 10 mg', 'Water: 2.5 mL', 'Dose 250 mcg = 6.25 units']},
  buddy: {from: 36.37, to: 41.42},
  endFrom: 41.42,
  dayChip: {from: 42.9, label: 'DAY 8 OF 10'},
  disclaimer: 'Educational tool. Not medical advice. For research purposes only.',
  durationSec: 56,
};

export const DAY8_PT: Day8Config = {
  id: 'Day8PT',
  flag: 'br',
  voFile: 'd8-vo-pt.mp3',
  cues: [
    {from: 0.1, to: 3.71, lines: ['VOCÊ ANOTOU 12.5 UNIDADES', 'DA ÚLTIMA VEZ.']},
    {from: 3.71, to: 6.94, lines: ['FRASCO NOVO HOJE.', 'PODE COPIAR?'], teal: 1},
    {from: 6.94, to: 8.79, lines: ['SÓ SE A ÁGUA', 'FOR A MESMA.'], teal: 1},
    {from: 8.79, to: 13.84, lines: ['MESMO FRASCO: 10 MG.', 'DA ÚLTIMA VEZ: 5 ML.']},
    {from: 13.84, to: 20.39, lines: ['2 MG/ML. 250 MCG', '= 12.5 UNIDADES.'], teal: 1},
    {from: 20.39, to: 26.15, lines: ['HOJE: 2.5 ML.', '= 4 MG/ML.']},
    {from: 26.15, to: 31.39, lines: ['OS MESMOS 250 MCG', '= 6.25 UNIDADES.'], teal: 1},
    {from: 31.39, to: 35.75, lines: ['COPIE OS 12.5 E VOCÊ', 'DOBROU A DOSE.']},
    {from: 35.75, to: 39.2, lines: ['O NÚMERO PERTENCE À', 'MISTURA, NÃO AO PEPTÍDEO.'], teal: 1},
    {from: 39.2, to: 43.23, lines: ['O BUDDYPEPT RECALCULA', 'EM SEGUNDOS. GRÁTIS.'], teal: 1},
  ],
  panels: {
    from: 8.79,
    to: 39.2,
    bFrom: 20.39,
    a: {title: 'ONTEM', mix: '10 mg + 5 mL', conc: '2 mg/mL', units: 12.5, unitsLabel: '12.5 unidades'},
    b: {title: 'HOJE', mix: '10 mg + 2.5 mL', conc: '4 mg/mL', units: 6.25, unitsLabel: '6.25 unidades'},
  },
  alarm: {from: 31.39, to: 35.75, line1: '12.5 UNIDADES HOJE = 500 MCG', line2: '2x a dose'},
  log: {from: 39.2, to: 43.23, title: 'REGISTRO DA MISTURA', lines: ['Data: hoje', 'Frasco: 10 mg', 'Água: 2.5 mL', 'Dose 250 mcg = 6.25 unidades']},
  buddy: {from: 39.2, to: 43.23},
  endFrom: 43.23,
  dayChip: {from: 43.9, label: 'DIA 8 DE 10'},
  disclaimer: 'Ferramenta educacional. Não é orientação médica. Somente para fins de pesquisa.',
  durationSec: 57,
};

export const DAY8_ES: Day8Config = {
  id: 'Day8ES',
  flag: 'mx',
  voFile: 'd8-vo-es.mp3',
  cues: [
    {from: 0.1, to: 4.13, lines: ['ANOTASTE 12.5 UNIDADES', 'LA ÚLTIMA VEZ.']},
    {from: 4.13, to: 8.58, lines: ['HOY: VIAL NUEVO.', '¿PUEDES COPIARLO?'], teal: 1},
    {from: 8.58, to: 11.03, lines: ['SOLO SI EL AGUA', 'COINCIDE.'], teal: 1},
    {from: 11.03, to: 17.64, lines: ['MISMO VIAL: 10 MG.', 'LA ÚLTIMA VEZ: 5 ML.']},
    {from: 17.64, to: 24.92, lines: ['2 MG/ML. 250 MCG', '= 12.5 UNIDADES.'], teal: 1},
    {from: 24.92, to: 32.03, lines: ['HOY: 2.5 ML.', '= 4 MG/ML.']},
    {from: 32.03, to: 37.86, lines: ['LOS MISMOS 250 MCG', '= 6.25 UNIDADES.'], teal: 1},
    {from: 37.86, to: 42.5, lines: ['COPIA EL 12.5 Y', 'DUPLICAS LA DOSIS.']},
    {from: 42.5, to: 47.04, lines: ['EL NÚMERO PERTENECE A LA', 'MEZCLA, NO AL PÉPTIDO.'], teal: 1},
    {from: 47.04, to: 52.92, lines: ['BUDDYPEPT LO RECALCULA', 'EN SEGUNDOS. GRATIS.'], teal: 1},
  ],
  panels: {
    from: 11.03,
    to: 47.04,
    bFrom: 24.92,
    a: {title: 'AYER', mix: '10 mg + 5 mL', conc: '2 mg/mL', units: 12.5, unitsLabel: '12.5 unidades'},
    b: {title: 'HOY', mix: '10 mg + 2.5 mL', conc: '4 mg/mL', units: 6.25, unitsLabel: '6.25 unidades'},
  },
  alarm: {from: 37.86, to: 42.5, line1: '12.5 UNIDADES HOY = 500 MCG', line2: '2x la dosis'},
  log: {from: 47.04, to: 52.92, title: 'REGISTRO DE LA MEZCLA', lines: ['Fecha: hoy', 'Vial: 10 mg', 'Agua: 2.5 mL', 'Dosis 250 mcg = 6.25 unidades']},
  buddy: {from: 47.04, to: 52.92},
  endFrom: 52.92,
  dayChip: {from: 53.6, label: 'DÍA 8 DE 10'},
  disclaimer: 'Herramienta educativa. No es consejo médico. Solo con fines de investigación.',
  durationSec: 70,
};
