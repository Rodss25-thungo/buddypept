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
import type {Cue} from '../locales';
import {BG, Buddy, Caption, FPS, Flag, Glow, Logo, MUTED, TEAL, TEAL_DEEP, WHITE} from '../Video';
import {UnitScale as Syringe} from './unit-scale';

const anton = loadAnton();
const archivo = loadArchivo();

type SideCfg = {title: string; sub: string; units: number};

type Day6Config = {
  id: string;
  flag: 'us' | 'mx' | 'br';
  voFile: string;
  cues: Cue[];
  vials: {from: number; to: number; bFrom: number; aLabel: string; bLabel: string};
  sides: {from: number; to: number; a: SideCfg; b: SideCfg; bFrom: number};
  unitsWord: string;
  info: {from: number; to: number; top: string; mid: string; bottom: string};
  buddy: {from: number; to: number};
  endFrom: number;
  dayChip: {from: number; label: string};
  disclaimer: string;
  durationSec: number;
};


// Realistic vial render with a clean overlay label so the amount always matches the script.
const Vial: React.FC<{src: string; h: number; label: string; delay: number}> = ({src, h, label, delay}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const s = spring({frame: frame - delay, fps, config: {damping: 12, stiffness: 190}});
  const labelTop = h * 0.36;
  const labelH = h * 0.38;
  return (
    <div
      style={{
        position: 'relative',
        opacity: s,
        transform: 'scale(' + interpolate(s, [0, 1], [0.7, 1]) + ')',
      }}
    >
      <Img src={staticFile(src)} style={{height: h, borderRadius: 10}} />
      <div
        style={{
          position: 'absolute',
          top: labelTop,
          left: '6%',
          width: '88%',
          height: labelH,
          background: '#f2f4f5',
          borderRadius: 8,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderTop: '4px solid ' + TEAL_DEEP,
          borderBottom: '4px solid ' + TEAL_DEEP,
        }}
      >
        <span style={{fontFamily: anton.fontFamily, fontSize: h * 0.11, color: '#0e2a30'}}>{label}</span>
      </div>
    </div>
  );
};

const SideCard: React.FC<{cfg: SideCfg; unitsWord: string}> = ({cfg, unitsWord}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const s = spring({frame, fps, config: {damping: 13, stiffness: 190}});
  return (
    <div
      style={{
        opacity: s,
        transform: `scale(${interpolate(s, [0, 1], [0.85, 1])})`,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 6,
      }}
    >
      <div
        style={{
          background: '#0a1218',
          border: '4px solid #14424f',
          borderRadius: 32,
          padding: '24px 30px',
          width: 400,
          textAlign: 'center',
        }}
      >
        <div style={{fontFamily: anton.fontFamily, fontSize: 68, color: WHITE, lineHeight: 1}}>{cfg.title}</div>
        <div style={{fontFamily: archivo.fontFamily, fontSize: 31, color: MUTED, marginTop: 8}}>{cfg.sub}</div>
      </div>
      <Syringe units={cfg.units} label={cfg.units + ' ' + unitsWord} />
    </div>
  );
};

export const Day6: React.FC<{locale: Day6Config}> = ({locale}) => {
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

      {/* Vial renders pop in during the intro */}
      <Sequence from={sec(L.vials.from)} durationInFrames={sec(L.vials.to - L.vials.from)}>
        <AbsoluteFill style={{alignItems: 'center', paddingTop: 780}}>
          <div style={{display: 'flex', gap: 70, alignItems: 'flex-end'}}>
            <Vial src="vial-large.png" h={460} label={L.vials.aLabel} delay={0} />
            <Vial src="vial-large.png" h={460} label={L.vials.bLabel} delay={sec(L.vials.bFrom - L.vials.from)} />
          </div>
        </AbsoluteFill>
      </Sequence>

      {/* Cards with syringes in the middle band */}
      <Sequence from={sec(L.sides.from)} durationInFrames={sec(L.sides.to - L.sides.from)}>
        <AbsoluteFill style={{alignItems: 'center', paddingTop: 720}}>
          <div style={{display: 'flex', gap: 50}}>
            <SideCard cfg={L.sides.a} unitsWord={L.unitsWord} />
            <Sequence from={sec(L.sides.bFrom - L.sides.from)} layout="none">
              <SideCard cfg={L.sides.b} unitsWord={L.unitsWord} />
            </Sequence>
          </div>
        </AbsoluteFill>
      </Sequence>

      {/* Buddy appears with the takeaway */}
      <Sequence from={sec(L.buddy.from)} durationInFrames={sec(L.buddy.to - L.buddy.from)}>
        <AbsoluteFill style={{justifyContent: 'flex-end', alignItems: 'center', paddingBottom: 60}}>
          <Buddy size={330} />
        </AbsoluteFill>
      </Sequence>

      {/* Teal takeaway card */}
      <Sequence from={sec(L.info.from)} durationInFrames={sec(L.info.to - L.info.from)}>
        <AbsoluteFill style={{alignItems: 'center', paddingTop: 840}}>
          <div
            style={{
              background: TEAL_DEEP,
              borderRadius: 36,
              padding: '50px 70px',
              textAlign: 'center',
              boxShadow: '0 0 120px rgba(42,182,201,0.35)',
              maxWidth: 880,
            }}
          >
            <div style={{fontFamily: archivo.fontFamily, fontSize: 36, color: '#d8f6fa', marginBottom: 10}}>
              {L.info.top}
            </div>
            <div style={{fontFamily: anton.fontFamily, fontSize: 110, color: WHITE, lineHeight: 1}}>{L.info.mid}</div>
            <div style={{fontFamily: archivo.fontFamily, fontWeight: 600, fontSize: 36, color: '#d8f6fa', marginTop: 16}}>
              {L.info.bottom}
            </div>
          </div>
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

export const DAY6_EN: Day6Config = {
  id: 'Day6EN',
  flag: 'us',
  voFile: 'd6-vo-en.mp3',
  cues: [
    {from: 0.05, to: 2.27, lines: ['TWO VIALS.', 'SAME PEPTIDE.']},
    {from: 2.27, to: 6.24, lines: ['10 MG AND 20 MG.', 'SAME 2 ML OF WATER.'], teal: 1},
    {from: 6.24, to: 9.45, lines: ['NOW WATCH THE SAME', '0.5 MG DRAW.'], teal: 1},
    {from: 9.45, to: 14.36, lines: ['10 MG VIAL: 5 MG/ML', '= 10 UNITS.'], teal: 1},
    {from: 14.36, to: 18.84, lines: ['20 MG VIAL: 10 MG/ML', '= 5 UNITS.'], teal: 1},
    {from: 18.84, to: 21.65, lines: ['SAME PEPTIDE,', 'HALF THE UNITS.'], teal: 1},
    {from: 21.65, to: 24.58, lines: ['THE NUMBER CHANGED.', "THE AMOUNT DIDN'T."]},
    {from: 24.58, to: 26.43, lines: ['BUDDYPEPT', 'CATCHES THIS.'], teal: 1},
  ],
  vials: {from: 2.27, to: 9.45, bFrom: 3.2, aLabel: '10 mg', bLabel: '20 mg'},
  sides: {
    from: 9.45,
    to: 18.84,
    a: {title: '10 mg', sub: '+ 2 mL = 5 mg/mL', units: 10},
    b: {title: '20 mg', sub: '+ 2 mL = 10 mg/mL', units: 5},
    bFrom: 14.36,
  },
  unitsWord: 'units',
  info: {
    from: 18.84,
    to: 26.43,
    top: 'The same 0.5 mg draw',
    mid: '10 VS 5 UNITS',
    bottom: "The syringe number changed. The amount didn't.",
  },
  buddy: {from: 18.84, to: 26.43},
  endFrom: 26.43,
  dayChip: {from: 28.68, label: 'DAY 6 OF 10'},
  disclaimer: 'Educational tool. Not medical advice. For research purposes only.',
  durationSec: 45,
};

export const DAY6_PT: Day6Config = {
  id: 'Day6PT',
  flag: 'br',
  voFile: 'd6-vo-pt.mp3',
  cues: [
    {from: 0.1, to: 2.76, lines: ['DOIS FRASCOS.', 'O MESMO PEPTÍDEO.']},
    {from: 2.76, to: 6.86, lines: ['10 MG E 20 MG.', 'A MESMA ÁGUA: 2 ML.'], teal: 1},
    {from: 6.86, to: 10.82, lines: ['VEJA A MESMA RETIRADA', 'DE 0.5 MG.'], teal: 1},
    {from: 10.82, to: 15.84, lines: ['FRASCO DE 10 MG: 5 MG/ML', '= 10 UNIDADES.'], teal: 1},
    {from: 15.84, to: 20.34, lines: ['FRASCO DE 20 MG: 10 MG/ML', '= 5 UNIDADES.'], teal: 1},
    {from: 20.34, to: 23.77, lines: ['O MESMO PEPTÍDEO,', 'METADE DAS UNIDADES.'], teal: 1},
    {from: 23.77, to: 26.75, lines: ['O NÚMERO MUDOU.', 'A QUANTIDADE NÃO.']},
    {from: 26.75, to: 28.95, lines: ['O BUDDYPEPT', 'PEGA ISSO.'], teal: 1},
  ],
  vials: {from: 2.76, to: 10.82, bFrom: 3.7, aLabel: '10 mg', bLabel: '20 mg'},
  sides: {
    from: 10.82,
    to: 20.34,
    a: {title: '10 mg', sub: '+ 2 mL = 5 mg/mL', units: 10},
    b: {title: '20 mg', sub: '+ 2 mL = 10 mg/mL', units: 5},
    bFrom: 15.84,
  },
  unitsWord: 'unidades',
  info: {
    from: 20.34,
    to: 28.95,
    top: 'A mesma retirada de 0.5 mg',
    mid: '10 VS 5 UNIDADES',
    bottom: 'O número da seringa mudou. A quantidade não.',
  },
  buddy: {from: 20.34, to: 28.95},
  endFrom: 28.95,
  dayChip: {from: 31.32, label: 'DIA 6 DE 10'},
  disclaimer: 'Ferramenta educacional. Não é orientação médica. Somente para fins de pesquisa.',
  durationSec: 50,
};

export const DAY6_ES: Day6Config = {
  id: 'Day6ES',
  flag: 'mx',
  voFile: 'd6-vo-es.mp3',
  cues: [
    {from: 0.1, to: 3.94, lines: ['DOS VIALES.', 'EL MISMO PÉPTIDO.']},
    {from: 3.94, to: 9.52, lines: ['10 MG Y 20 MG.', 'LA MISMA AGUA: 2 ML.'], teal: 1},
    {from: 9.52, to: 14.05, lines: ['MIRA LA MISMA EXTRACCIÓN', 'DE 0.5 MG.'], teal: 1},
    {from: 14.05, to: 20.57, lines: ['VIAL DE 10 MG: 5 MG/ML', '= 10 UNIDADES.'], teal: 1},
    {from: 20.57, to: 27.0, lines: ['VIAL DE 20 MG: 10 MG/ML', '= 5 UNIDADES.'], teal: 1},
    {from: 27.0, to: 31.37, lines: ['EL MISMO PÉPTIDO,', 'LA MITAD DE UNIDADES.'], teal: 1},
    {from: 31.37, to: 36.0, lines: ['EL NÚMERO CAMBIÓ.', 'LA CANTIDAD NO.']},
    {from: 36.0, to: 38.76, lines: ['BUDDYPEPT', 'DETECTA ESTO.'], teal: 1},
  ],
  vials: {from: 3.94, to: 14.05, bFrom: 5.2, aLabel: '10 mg', bLabel: '20 mg'},
  sides: {
    from: 14.05,
    to: 27.0,
    a: {title: '10 mg', sub: '+ 2 mL = 5 mg/mL', units: 10},
    b: {title: '20 mg', sub: '+ 2 mL = 10 mg/mL', units: 5},
    bFrom: 20.57,
  },
  unitsWord: 'unidades',
  info: {
    from: 27.0,
    to: 38.76,
    top: 'La misma extracción de 0.5 mg',
    mid: '10 VS 5 UNIDADES',
    bottom: 'El número de la jeringa cambió. La cantidad no.',
  },
  buddy: {from: 27.0, to: 38.76},
  endFrom: 38.76,
  dayChip: {from: 41.86, label: 'DÍA 6 DE 10'},
  disclaimer: 'Herramienta educativa. No es consejo médico. Solo con fines de investigación.',
  durationSec: 66,
};
