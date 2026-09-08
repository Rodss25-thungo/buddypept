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
import {BG, Buddy, Caption, FPS, Flag, Glow, Logo, MUTED, TEAL, TEAL_DEEP, WHITE} from './Video';
import {Syringe} from './day06';

const anton = loadAnton();
const archivo = loadArchivo();

const AMBER = '#f59e0b';

type MixCfg = {
  title: string;
  mix: string;
  conc: string;
  units: number;
  unitsLabel: string;
};

type Day10Config = {
  id: string;
  flag: 'us' | 'mx' | 'br';
  voFile: string;
  cues: Cue[];
  panels: {from: number; to: number; bFrom: number; a: MixCfg; b: MixCfg};
  equal: {from: number; to: number; line1: string; line2: string};
  interlude: {from: number; to: number; chip: string};
  bridge: {from: number; to: number; phrase: string; seriesChip: string; chipAt: number};
  endFrom: number;
  dayChip: {from: number; label: string};
  disclaimer: string;
  durationSec: number;
};

// Same panel language as Day 8: header, mix, concentration, syringe fill.
const MixPanel: React.FC<{cfg: MixCfg; accent: string}> = ({cfg, accent}) => {
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

// Teal verdict chip: both vials hold the same number of doses.
const EqualChip: React.FC<{line1: string; line2: string}> = ({line1, line2}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const s = spring({frame, fps, config: {damping: 10, stiffness: 220}});
  return (
    <div
      style={{
        opacity: s,
        transform: `scale(${interpolate(s, [0, 1], [0.6, 1])})`,
        background: TEAL_DEEP,
        border: `5px solid ${TEAL}`,
        borderRadius: 28,
        padding: '26px 52px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 6,
        boxShadow: '0 0 90px rgba(42,182,201,0.45)',
      }}
    >
      <div style={{fontFamily: anton.fontFamily, fontSize: 62, color: WHITE}}>{line1}</div>
      <div style={{fontFamily: archivo.fontFamily, fontWeight: 700, fontSize: 34, color: '#d9f6fa'}}>{line2}</div>
    </div>
  );
};

// The clock returns: full-size vial and clock with the series-two question.
const ClockBridge: React.FC<{phrase: string; seriesChip: string; chipAt: number}> = ({phrase, seriesChip, chipAt}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const s = spring({frame, fps, config: {damping: 14, stiffness: 120}});
  const clockIn = interpolate(frame, [8, 34], [0, 0.85], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const textIn = interpolate(frame, [26, 46], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const chip = spring({frame: frame - chipAt, fps, config: {damping: 10, stiffness: 220}});
  const minuteAngle = frame * 2.4;
  const R = 330;
  return (
    <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24, opacity: s}}>
      <div style={{position: 'relative', width: R * 2, height: R * 2, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
        <svg width={R * 2} height={R * 2} style={{position: 'absolute', inset: 0, opacity: clockIn}}>
          <circle cx={R} cy={R} r={R - 6} fill="none" stroke={TEAL} strokeWidth={6} style={{filter: 'drop-shadow(0 0 22px rgba(42,182,201,0.65))'}} />
          {Array.from({length: 12}).map((_, i) => {
            const a = (i / 12) * Math.PI * 2;
            return (
              <line
                key={i}
                x1={R + Math.sin(a) * (R - 14)}
                y1={R - Math.cos(a) * (R - 14)}
                x2={R + Math.sin(a) * (R - 34)}
                y2={R - Math.cos(a) * (R - 34)}
                stroke={TEAL}
                strokeWidth={i % 3 === 0 ? 8 : 3.5}
              />
            );
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
      <div
        style={{
          opacity: chip,
          transform: `scale(${interpolate(chip, [0, 1], [0.5, 1])})`,
          border: `4px solid ${AMBER}`,
          background: '#1a1206',
          borderRadius: 999,
          padding: '18px 52px',
          fontFamily: anton.fontFamily,
          fontSize: 52,
          letterSpacing: 3,
          color: AMBER,
        }}
      >
        {seriesChip}
      </div>
    </div>
  );
};

export const Day10: React.FC<{locale: Day10Config}> = ({locale}) => {
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

      {/* Two mixes of the same 5 mg vial */}
      <Sequence from={sec(L.panels.from)} durationInFrames={sec(L.panels.to - L.panels.from)}>
        <AbsoluteFill style={{alignItems: 'center', paddingTop: 690}}>
          <div style={{display: 'flex', gap: 44, alignItems: 'flex-start'}}>
            <MixPanel cfg={L.panels.a} accent={TEAL} />
            <Sequence from={sec(L.panels.bFrom - L.panels.from)} layout="none">
              <MixPanel cfg={L.panels.b} accent={TEAL_DEEP} />
            </Sequence>
          </div>
        </AbsoluteFill>
      </Sequence>

      {/* Verdict: same dose count either way */}
      <Sequence from={sec(L.equal.from)} durationInFrames={sec(L.equal.to - L.equal.from)}>
        <AbsoluteFill style={{alignItems: 'center', paddingTop: 900}}>
          <EqualChip line1={L.equal.line1} line2={L.equal.line2} />
        </AbsoluteFill>
      </Sequence>

      {/* Interlude: the series wraps */}
      <Sequence from={sec(L.interlude.from)} durationInFrames={sec(L.interlude.to - L.interlude.from)}>
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
            }}
          >
            {L.interlude.chip}
          </div>
          <Buddy size={380} />
          <Logo />
        </AbsoluteFill>
      </Sequence>

      {/* The bridge: the clock is already running */}
      <Sequence from={sec(L.bridge.from)} durationInFrames={sec(L.bridge.to - L.bridge.from)}>
        <AbsoluteFill style={{alignItems: 'center', paddingTop: 680}}>
          <ClockBridge
            phrase={L.bridge.phrase}
            seriesChip={L.bridge.seriesChip}
            chipAt={sec(L.bridge.chipAt - L.bridge.from)}
          />
        </AbsoluteFill>
      </Sequence>

      {/* Final end card */}
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

export const DAY10_EN: Day10Config = {
  id: 'Day10EN',
  flag: 'us',
  voFile: 'd10-vo-en.mp3',
  cues: [
    {from: 0.05, to: 2.04, lines: ['LAST LESSON.', 'THE FINALE.']},
    {from: 2.04, to: 7.9, lines: ['5 MG, TWO VIALS.', '2 ML VS 5 ML.'], teal: 1},
    {from: 7.9, to: 12.36, lines: ['MORE DOSES? NEITHER.', 'WATER ADDS NO PEPTIDE.']},
    {from: 12.36, to: 16.95, lines: ['AT 2 ML: 250 MCG', '= 10 UNITS.'], teal: 1},
    {from: 16.95, to: 21.09, lines: ['AT 5 ML: 250 MCG', '= 25 UNITS.'], teal: 1},
    {from: 21.09, to: 24.32, lines: ['BIGGER DRAW,', 'SAME DOSE.'], teal: 1},
    {from: 24.32, to: 30.18, lines: ['5000 MCG ÷ 250', '= 20 DOSES. EITHER WAY.'], teal: 1},
    {from: 30.18, to: 34.01, lines: ['MORE LIQUID PER DOSE.', 'NEVER MORE DOSES.']},
    {from: 38.81, to: 43.93, lines: ['THE MOMENT WATER WENT IN,', 'A CLOCK STARTED.']},
    {from: 43.93, to: 48.35, lines: ['HOW LONG DOES IT', 'STAY GOOD?'], teal: 1},
  ],
  panels: {
    from: 4.44,
    to: 23.03,
    bFrom: 6.74,
    a: {title: '2 ML', mix: '5 mg + 2 mL', conc: '2.5 mg/mL', units: 10, unitsLabel: '10 units'},
    b: {title: '5 ML', mix: '5 mg + 5 mL', conc: '1 mg/mL', units: 25, unitsLabel: '25 units'},
  },
  equal: {from: 23.03, to: 34.01, line1: '20 DOSES = 20 DOSES', line2: 'water changes the draw, not the count'},
  interlude: {from: 34.01, to: 38.81, chip: 'DAY 10 OF 10'},
  bridge: {
    from: 38.81,
    to: 48.35,
    phrase: 'once the water goes in, the clock starts',
    seriesChip: 'SERIES 2',
    chipAt: 47.04,
  },
  endFrom: 48.35,
  dayChip: {from: 48.35, label: 'DAY 10 OF 10'},
  disclaimer: 'Educational tool. Not medical advice. For research purposes only.',
  durationSec: 60,
};

export const DAY10_PT: Day10Config = {
  id: 'Day10PT',
  flag: 'br',
  voFile: 'd10-vo-pt.mp3',
  cues: [
    {from: 0.1, to: 2.39, lines: ['ÚLTIMA LIÇÃO.', 'A GRANDE FINAL.']},
    {from: 2.39, to: 8.68, lines: ['5 MG, DOIS FRASCOS.', '2 ML VS 5 ML.'], teal: 1},
    {from: 8.68, to: 13.3, lines: ['MAIS DOSES? NENHUM.', 'ÁGUA NÃO ADICIONA PEPTÍDEO.']},
    {from: 13.3, to: 17.8, lines: ['COM 2 ML: 250 MCG', '= 10 UNIDADES.'], teal: 1},
    {from: 17.8, to: 21.7, lines: ['COM 5 ML: 250 MCG', '= 25 UNIDADES.'], teal: 1},
    {from: 21.7, to: 25.05, lines: ['PUXADA MAIOR,', 'MESMA DOSE.'], teal: 1},
    {from: 25.05, to: 31.35, lines: ['5000 MCG ÷ 250', '= 20 DOSES. SEMPRE.'], teal: 1},
    {from: 31.35, to: 35.25, lines: ['MAIS LÍQUIDO POR DOSE.', 'NUNCA MAIS DOSES.']},
    {from: 40.62, to: 46.09, lines: ['QUANDO A ÁGUA ENTROU,', 'UM RELÓGIO COMEÇOU.']},
    {from: 46.09, to: 50.86, lines: ['QUANTO TEMPO ELE', 'CONTINUA BOM?'], teal: 1},
  ],
  panels: {
    from: 4.78,
    to: 23.81,
    bFrom: 7.03,
    a: {title: '2 ML', mix: '5 mg + 2 mL', conc: '2.5 mg/mL', units: 10, unitsLabel: '10 unidades'},
    b: {title: '5 ML', mix: '5 mg + 5 mL', conc: '1 mg/mL', units: 25, unitsLabel: '25 unidades'},
  },
  equal: {from: 23.81, to: 35.25, line1: '20 DOSES = 20 DOSES', line2: 'a água muda a puxada, não a contagem'},
  interlude: {from: 35.25, to: 40.62, chip: 'DIA 10 DE 10'},
  bridge: {
    from: 40.62,
    to: 50.86,
    phrase: 'depois que a água entra, o relógio começa a contar',
    seriesChip: 'SÉRIE 2',
    chipAt: 49.34,
  },
  endFrom: 50.86,
  dayChip: {from: 50.86, label: 'DIA 10 DE 10'},
  disclaimer: 'Ferramenta educacional. Não é orientação médica. Somente para fins de pesquisa.',
  durationSec: 62,
};

export const DAY10_ES: Day10Config = {
  id: 'Day10ES',
  flag: 'mx',
  voFile: 'd10-vo-es.mp3',
  cues: [
    {from: 0.1, to: 3.78, lines: ['ÚLTIMA LECCIÓN.', 'LA GRAN FINAL.']},
    {from: 3.78, to: 12.27, lines: ['5 MG, DOS VIALES.', '2 ML VS 5 ML.'], teal: 1},
    {from: 12.27, to: 18.93, lines: ['¿MÁS DOSIS? NINGUNO.', 'EL AGUA NO AGREGA PÉPTIDO.']},
    {from: 18.93, to: 24.2, lines: ['CON 2 ML: 250 MCG', '= 10 UNIDADES.'], teal: 1},
    {from: 24.2, to: 29.19, lines: ['CON 5 ML: 250 MCG', '= 25 UNIDADES.'], teal: 1},
    {from: 29.19, to: 34.49, lines: ['EXTRACCIÓN MÁS GRANDE,', 'MISMA DOSIS.'], teal: 1},
    {from: 34.49, to: 42.33, lines: ['5000 MCG ÷ 250', '= 20 DOSIS. SIEMPRE.'], teal: 1},
    {from: 42.33, to: 47.32, lines: ['MÁS LÍQUIDO POR DOSIS.', 'NUNCA MÁS DOSIS.']},
    {from: 54.47, to: 61.69, lines: ['CUANDO ENTRÓ EL AGUA,', 'UN RELOJ EMPEZÓ.']},
    {from: 61.69, to: 67.76, lines: ['¿CUÁNTO TIEMPO', 'SIGUE BUENO?'], teal: 1},
  ],
  panels: {
    from: 6.97,
    to: 29.19,
    bFrom: 9.92,
    a: {title: '2 ML', mix: '5 mg + 2 mL', conc: '2.5 mg/mL', units: 10, unitsLabel: '10 unidades'},
    b: {title: '5 ML', mix: '5 mg + 5 mL', conc: '1 mg/mL', units: 25, unitsLabel: '25 unidades'},
  },
  equal: {from: 29.19, to: 47.32, line1: '20 DOSIS = 20 DOSIS', line2: 'el agua cambia la extracción, no la cuenta'},
  interlude: {from: 47.32, to: 54.47, chip: 'DÍA 10 DE 10'},
  bridge: {
    from: 54.47,
    to: 67.76,
    phrase: 'cuando entra el agua, el reloj empieza a correr',
    seriesChip: 'SERIE 2',
    chipAt: 65.39,
  },
  endFrom: 67.76,
  dayChip: {from: 67.76, label: 'DÍA 10 DE 10'},
  disclaimer: 'Herramienta educativa. No es consejo médico. Solo con fines de investigación.',
  durationSec: 83,
};
