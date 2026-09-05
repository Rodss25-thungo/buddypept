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

type Day7Config = {
  id: string;
  flag: 'us' | 'mx' | 'br';
  voFile: string;
  cues: Cue[];
  quiz: {from: number; to: number; bAt: number; question: string; optionA: string; optionB: string; revealAt: number};
  bar: {from: number; to: number; splitAt: number; full: string; quarter: string};
  tenx: {from: number; to: number; right: string; wrong: string};
  example: {from: number; to: number; cardTitle: string; cardSub: string; unitsWord: string};
  buddy: {from: number; to: number};
  endFrom: number;
  dayChip: {from: number; label: string};
  disclaimer: string;
  durationSec: number;
};

// A/B quiz options; at revealAt the right answer turns teal and the wrong one dims amber with a strike.
const QuizOptions: React.FC<{a: string; b: string; bAt: number; revealAt: number}> = ({a, b, bAt, revealAt}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const sA = spring({frame, fps, config: {damping: 12, stiffness: 200}});
  const sB = spring({frame: frame - bAt, fps, config: {damping: 12, stiffness: 200}});
  const revealed = frame >= revealAt;
  const pop = spring({frame: frame - revealAt, fps, config: {damping: 11, stiffness: 220}});
  const opt = (label: string, text: string, s: number, isRight: boolean): React.ReactElement => (
    <div
      style={{
        opacity: s,
        transform: `scale(${interpolate(s, [0, 1], [0.7, 1]) * (revealed && isRight ? interpolate(pop, [0, 1], [1, 1.08]) : 1)})`,
        background: revealed ? (isRight ? TEAL_DEEP : '#1a1206') : '#0a1218',
        border: `4px solid ${revealed ? (isRight ? TEAL : AMBER) : '#14424f'}`,
        borderRadius: 32,
        padding: '30px 40px',
        width: 420,
        display: 'flex',
        alignItems: 'center',
        gap: 24,
        boxShadow: revealed && isRight ? '0 0 90px rgba(42,182,201,0.4)' : 'none',
      }}
    >
      <div
        style={{
          width: 64,
          height: 64,
          borderRadius: 999,
          border: `3px solid ${revealed ? (isRight ? TEAL : AMBER) : '#5d7078'}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: anton.fontFamily,
          fontSize: 36,
          color: revealed ? (isRight ? TEAL : AMBER) : MUTED,
          flexShrink: 0,
        }}
      >
        {revealed ? (isRight ? '✓' : '✕') : label}
      </div>
      <span
        style={{
          fontFamily: anton.fontFamily,
          fontSize: 58,
          color: revealed && !isRight ? AMBER : WHITE,
          textDecoration: revealed && !isRight ? 'line-through' : 'none',
        }}
      >
        {text}
      </span>
    </div>
  );
  return (
    <div style={{display: 'flex', flexDirection: 'column', gap: 30}}>
      {opt('A', a, sA, true)}
      {opt('B', b, sB, false)}
    </div>
  );
};

// Conversion ruler: a full bar (1 mg = 1000 mcg) that splits into 4 and highlights one quarter.
const MgBar: React.FC<{splitAt: number; full: string; quarter: string}> = ({splitAt, full, quarter}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const grow = spring({frame, fps, config: {damping: 15, stiffness: 90}});
  const split = spring({frame: frame - splitAt, fps, config: {damping: 13, stiffness: 160}});
  const W = 860;
  const H = 110;
  return (
    <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 18}}>
      <div style={{fontFamily: archivo.fontFamily, fontWeight: 700, fontSize: 42, color: WHITE}}>{full}</div>
      <div style={{position: 'relative', width: W, height: H}}>
        <div
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            width: W * grow,
            height: H,
            background: '#0a1218',
            border: '4px solid #14424f',
            borderRadius: 20,
          }}
        />
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: (W / 4) * i + 4,
              top: 4,
              width: W / 4 - 8,
              height: H - 8,
              borderRadius: 14,
              background: i === 0 ? TEAL : 'transparent',
              border: `3px solid ${i === 0 ? TEAL : '#2c3d45'}`,
              opacity: split,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontFamily: archivo.fontFamily,
              fontWeight: 700,
              fontSize: 30,
              color: i === 0 ? '#04262b' : MUTED,
              boxShadow: i === 0 ? '0 0 60px rgba(42,182,201,0.45)' : 'none',
            }}
          >
            250
          </div>
        ))}
      </div>
      <div
        style={{
          opacity: split,
          fontFamily: anton.fontFamily,
          fontSize: 54,
          color: TEAL,
        }}
      >
        {quarter}
      </div>
    </div>
  );
};

// The 10x mistake: one teal block (right) next to a stack of ten amber blocks (wrong).
const TenX: React.FC<{right: string; wrong: string}> = ({right, wrong}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const s = spring({frame, fps, config: {damping: 13, stiffness: 170}});
  return (
    <div style={{display: 'flex', gap: 90, alignItems: 'flex-end', opacity: s}}>
      <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14}}>
        <div style={{width: 150, height: 56, background: TEAL, borderRadius: 12}} />
        <div style={{fontFamily: archivo.fontFamily, fontWeight: 700, fontSize: 34, color: TEAL}}>{right}</div>
      </div>
      <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14}}>
        <div style={{display: 'flex', flexDirection: 'column-reverse', gap: 6}}>
          {Array.from({length: 10}).map((_, i) => {
            const d = spring({frame: frame - 4 - i * 2, fps, config: {damping: 14, stiffness: 220}});
            return (
              <div
                key={i}
                style={{
                  width: 150,
                  height: 26,
                  background: AMBER,
                  borderRadius: 8,
                  opacity: d * 0.92,
                  transform: `scale(${interpolate(d, [0, 1], [0.6, 1])})`,
                }}
              />
            );
          })}
        </div>
        <div style={{fontFamily: archivo.fontFamily, fontWeight: 700, fontSize: 34, color: AMBER}}>{wrong}</div>
      </div>
    </div>
  );
};

export const Day7: React.FC<{locale: Day7Config}> = ({locale}) => {
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

      {/* Quiz options */}
      <Sequence from={sec(L.quiz.from)} durationInFrames={sec(L.quiz.to - L.quiz.from)}>
        <AbsoluteFill style={{alignItems: 'center', paddingTop: 820}}>
          <QuizOptions
            a={L.quiz.optionA}
            b={L.quiz.optionB}
            bAt={sec(L.quiz.bAt - L.quiz.from)}
            revealAt={sec(L.quiz.revealAt - L.quiz.from)}
          />
        </AbsoluteFill>
      </Sequence>

      {/* Conversion bar */}
      <Sequence from={sec(L.bar.from)} durationInFrames={sec(L.bar.to - L.bar.from)}>
        <AbsoluteFill style={{alignItems: 'center', paddingTop: 850}}>
          <MgBar splitAt={sec(L.bar.splitAt - L.bar.from)} full={L.bar.full} quarter={L.bar.quarter} />
        </AbsoluteFill>
      </Sequence>

      {/* 10x mistake comparison */}
      <Sequence from={sec(L.tenx.from)} durationInFrames={sec(L.tenx.to - L.tenx.from)}>
        <AbsoluteFill style={{alignItems: 'center', paddingTop: 830}}>
          <TenX right={L.tenx.right} wrong={L.tenx.wrong} />
        </AbsoluteFill>
      </Sequence>

      {/* Worked example: card + syringe to 12.5 units */}
      <Sequence from={sec(L.example.from)} durationInFrames={sec(L.example.to - L.example.from)}>
        <AbsoluteFill style={{alignItems: 'center', paddingTop: 740}}>
          <div style={{display: 'flex', alignItems: 'center', gap: 50}}>
            <div
              style={{
                background: '#0a1218',
                border: '4px solid #14424f',
                borderRadius: 32,
                padding: '34px 40px',
                width: 460,
                textAlign: 'center',
              }}
            >
              <div style={{fontFamily: anton.fontFamily, fontSize: 60, color: WHITE, lineHeight: 1.1}}>
                {L.example.cardTitle}
              </div>
              <div style={{fontFamily: archivo.fontFamily, fontSize: 34, color: MUTED, marginTop: 14}}>
                {L.example.cardSub}
              </div>
            </div>
            <Syringe units={12.5} label={'12.5 ' + L.example.unitsWord} />
          </div>
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

export const DAY7_EN: Day7Config = {
  id: 'Day7EN',
  flag: 'us',
  voFile: 'd7-vo-en.mp3',
  cues: [
    {from: 0.05, to: 3.53, lines: ['YOUR NOTE SAYS', '250 MCG.']},
    {from: 3.53, to: 5.66, lines: ['YOUR VIAL TALKS', 'IN MG.'], teal: 1},
    {from: 5.66, to: 10.55, lines: ['QUICK QUIZ:', '0.25 MG OR 2.5 MG?'], teal: 1},
    {from: 10.55, to: 13.68, lines: ['1 MG =', '1000 MCG.'], teal: 1},
    {from: 13.68, to: 18.44, lines: ['250 MCG', '= 0.25 MG.'], teal: 1},
    {from: 18.44, to: 21.63, lines: ['PICK 2.5 AND YOU ARE', 'OFF BY 10 TIMES.']},
    {from: 21.63, to: 27.28, lines: ['10 MG + 5 ML', '= 2 MG/ML.'], teal: 1},
    {from: 27.28, to: 33.74, lines: ['250 MCG = 0.125 ML', '= 12.5 UNITS.'], teal: 1},
    {from: 33.74, to: 37.2, lines: ['BUDDYPEPT CONVERTS', 'MCG AND MG.'], teal: 1},
  ],
  quiz: {from: 5.66, to: 13.68, bAt: 6.6, question: '', optionA: '0.25 mg', optionB: '2.5 mg', revealAt: 10.55},
  bar: {from: 13.68, to: 18.44, splitAt: 14.4, full: '1 mg = 1000 mcg', quarter: '250 mcg = 0.25 mg'},
  tenx: {from: 18.44, to: 21.63, right: 'right: 0.25 mg', wrong: 'wrong: 10x too much'},
  example: {
    from: 21.63,
    to: 37.2,
    cardTitle: '10 mg + 5 mL',
    cardSub: '2 mg/mL. 250 mcg = 0.125 mL',
    unitsWord: 'units',
  },
  buddy: {from: 33.74, to: 37.2},
  endFrom: 37.2,
  dayChip: {from: 39.45, label: 'DAY 7 OF 10'},
  disclaimer: 'Educational tool. Not medical advice. For research purposes only.',
  durationSec: 56,
};

export const DAY7_PT: Day7Config = {
  id: 'Day7PT',
  flag: 'br',
  voFile: 'd7-vo-pt.mp3',
  cues: [
    {from: 0.1, to: 3.35, lines: ['SUA ANOTAÇÃO DIZ', '250 MCG.']},
    {from: 3.35, to: 5.49, lines: ['SEU FRASCO FALA', 'EM MG.'], teal: 1},
    {from: 5.49, to: 10.35, lines: ['QUIZ RÁPIDO:', '0.25 MG OU 2.5 MG?'], teal: 1},
    {from: 10.35, to: 12.47, lines: ['1 MG =', '1000 MCG.'], teal: 1},
    {from: 12.47, to: 17.14, lines: ['250 MCG', '= 0.25 MG.'], teal: 1},
    {from: 17.14, to: 20.73, lines: ['ESCOLHA 2.5 E VOCÊ', 'ERRA POR 10 VEZES.']},
    {from: 20.73, to: 25.81, lines: ['10 MG + 5 ML', '= 2 MG/ML.'], teal: 1},
    {from: 25.81, to: 32.45, lines: ['250 MCG = 0.125 ML', '= 12.5 UNIDADES.'], teal: 1},
    {from: 32.45, to: 35.99, lines: ['O BUDDYPEPT CONVERTE', 'MCG E MG.'], teal: 1},
  ],
  quiz: {from: 5.49, to: 12.47, bAt: 6.4, question: '', optionA: '0.25 mg', optionB: '2.5 mg', revealAt: 10.35},
  bar: {from: 12.47, to: 17.14, splitAt: 13.2, full: '1 mg = 1000 mcg', quarter: '250 mcg = 0.25 mg'},
  tenx: {from: 17.14, to: 20.73, right: 'certo: 0.25 mg', wrong: 'errado: 10x demais'},
  example: {
    from: 20.73,
    to: 35.99,
    cardTitle: '10 mg + 5 mL',
    cardSub: '2 mg/mL. 250 mcg = 0.125 mL',
    unitsWord: 'unidades',
  },
  buddy: {from: 32.45, to: 35.99},
  endFrom: 35.99,
  dayChip: {from: 38.36, label: 'DIA 7 DE 10'},
  disclaimer: 'Ferramenta educacional. Não é orientação médica. Somente para fins de pesquisa.',
  durationSec: 57,
};

export const DAY7_ES: Day7Config = {
  id: 'Day7ES',
  flag: 'mx',
  voFile: 'd7-vo-es.mp3',
  cues: [
    {from: 0.1, to: 3.54, lines: ['TU NOTA DICE', '250 MCG.']},
    {from: 3.54, to: 6.03, lines: ['TU VIAL HABLA', 'EN MG.'], teal: 1},
    {from: 6.03, to: 11.73, lines: ['QUIZ RÁPIDO:', '¿0.25 MG O 2.5 MG?'], teal: 1},
    {from: 11.73, to: 14.73, lines: ['1 MG =', '1000 MCG.'], teal: 1},
    {from: 14.73, to: 20.13, lines: ['250 MCG', '= 0.25 MG.'], teal: 1},
    {from: 20.13, to: 24.7, lines: ['ELIGE 2.5 Y TE EQUIVOCAS', 'POR 10 VECES.']},
    {from: 24.7, to: 30.73, lines: ['10 MG + 5 ML', '= 2 MG/ML.'], teal: 1},
    {from: 30.73, to: 38.68, lines: ['250 MCG = 0.125 ML', '= 12.5 UNIDADES.'], teal: 1},
    {from: 38.68, to: 42.71, lines: ['BUDDYPEPT CONVIERTE', 'MCG Y MG.'], teal: 1},
  ],
  quiz: {from: 6.03, to: 14.73, bAt: 7.2, question: '', optionA: '0.25 mg', optionB: '2.5 mg', revealAt: 11.73},
  bar: {from: 14.73, to: 20.13, splitAt: 15.5, full: '1 mg = 1000 mcg', quarter: '250 mcg = 0.25 mg'},
  tenx: {from: 20.13, to: 24.7, right: 'correcto: 0.25 mg', wrong: 'error: 10x de más'},
  example: {
    from: 24.7,
    to: 42.71,
    cardTitle: '10 mg + 5 mL',
    cardSub: '2 mg/mL. 250 mcg = 0.125 mL',
    unitsWord: 'unidades',
  },
  buddy: {from: 38.68, to: 42.71},
  endFrom: 42.71,
  dayChip: {from: 45.81, label: 'DÍA 7 DE 10'},
  disclaimer: 'Herramienta educativa. No es consejo médico. Solo con fines de investigación.',
  durationSec: 70,
};
