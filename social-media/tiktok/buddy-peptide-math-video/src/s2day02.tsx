import React from 'react';
import {
  AbsoluteFill,
  Audio,
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
import {BG, Buddy, Caption, FPS, Flag, Glow, Logo, TEAL, TEAL_DEEP, WHITE} from './Video';

const anton = loadAnton();
const archivo = loadArchivo();

const AMBER = '#f59e0b';
const CYAN = '#7fe6f2';

type ClipCfg = {src: string; from: number; dur: number};

type S2Day2Config = {
  id: string;
  flag: 'us' | 'mx' | 'br';
  voFile: string;
  cues: Cue[];
  clips: ClipCfg[];
  split: {from: number; to: number};
  chem: {from: number; to: number; label: string; chipAt: number; chip: string};
  micro: {from: number; to: number; label: string; chipAt: number; chip: string};
  duo: {from: number; to: number; labelA: string; labelB: string; riskAt: number; riskA: string; riskB: string};
  trap: {from: number; to: number; stamp: string; labelA: string; labelB: string; qAt: number};
  endFrom: number;
  dayChip: {from: number; label: string};
  disclaimer: string;
  durationSec: number;
};

const Cinematic: React.FC<{src: string}> = ({src}) => {
  const frame = useCurrentFrame();
  const fade = interpolate(frame, [0, 10], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return (
    <AbsoluteFill style={{opacity: fade}}>
      <OffthreadVideo src={staticFile(src)} muted style={{width: '100%', height: '100%', objectFit: 'cover'}} />
    </AbsoluteFill>
  );
};

// The brand clock face, reusable at any size/speed/color.
const ClockFace: React.FC<{R: number; color: string; speed: number; startAngle?: number; glow?: boolean}> = ({R, color, speed, startAngle = 132, glow = true}) => {
  const frame = useCurrentFrame();
  const minuteAngle = startAngle + frame * speed;
  return (
    <svg width={R * 2} height={R * 2}>
      <circle cx={R} cy={R} r={R - 6} fill="none" stroke={color} strokeWidth={Math.max(4, R * 0.02)} style={glow ? {filter: `drop-shadow(0 0 ${R * 0.07}px ${color})`} : undefined} />
      {Array.from({length: 12}).map((_, i) => {
        const a = (i / 12) * Math.PI * 2;
        return (
          <line
            key={i}
            x1={R + Math.sin(a) * (R - 12)}
            y1={R - Math.cos(a) * (R - 12)}
            x2={R + Math.sin(a) * (R - 12 - R * 0.09)}
            y2={R - Math.cos(a) * (R - 12 - R * 0.09)}
            stroke={color}
            strokeWidth={i % 3 === 0 ? Math.max(4, R * 0.028) : Math.max(2, R * 0.014)}
          />
        );
      })}
      <line x1={R} y1={R} x2={R + Math.sin((minuteAngle * Math.PI) / 180) * (R * 0.72)} y2={R - Math.cos((minuteAngle * Math.PI) / 180) * (R * 0.72)} stroke={color} strokeWidth={Math.max(4, R * 0.028)} strokeLinecap="round" />
      <line x1={R} y1={R} x2={R + Math.sin(((minuteAngle / 12) * Math.PI) / 180) * (R * 0.45)} y2={R - Math.cos(((minuteAngle / 12) * Math.PI) / 180) * (R * 0.45)} stroke={CYAN} strokeWidth={Math.max(5, R * 0.038)} strokeLinecap="round" />
      <circle cx={R} cy={R} r={Math.max(6, R * 0.045)} fill={color} />
    </svg>
  );
};

// Beat 2: one clock splits into two.
const SplitBeat: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const s = spring({frame, fps, config: {damping: 13, stiffness: 150}});
  const apart = spring({frame: frame - 22, fps, config: {damping: 15, stiffness: 90}});
  const dx = interpolate(apart, [0, 1], [0, 235]);
  return (
    <div style={{position: 'relative', width: 1080, height: 700, opacity: s}}>
      <div style={{position: 'absolute', left: 540 - 210 - dx, top: 140}}>
        <ClockFace R={210} color={TEAL} speed={2.2} />
      </div>
      <div style={{position: 'absolute', left: 540 - 210 + dx, top: 140, opacity: interpolate(apart, [0, 0.15, 1], [0, 1, 1])}}>
        <ClockFace R={210} color={CYAN} speed={3.4} startAngle={40} />
      </div>
    </div>
  );
};

// A labeled clock panel with an inner illustration slot and a pop-in chip.
const ClockPanel: React.FC<{label: string; color: string; speed: number; chip: string; chipAt: number; inner: React.ReactNode}> = ({label, color, speed, chip, chipAt, inner}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const s = spring({frame, fps, config: {damping: 13, stiffness: 150}});
  const c = spring({frame: frame - chipAt, fps, config: {damping: 11, stiffness: 220}});
  return (
    <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 30, opacity: s, transform: `scale(${interpolate(s, [0, 1], [0.85, 1])})`}}>
      <div style={{border: `4px solid ${color}`, borderRadius: 999, padding: '14px 46px', fontFamily: anton.fontFamily, fontSize: 46, letterSpacing: 3, color}}>{label}</div>
      <div style={{position: 'relative', width: 520, height: 520, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
        <div style={{position: 'absolute', inset: 0}}>
          <ClockFace R={260} color={color} speed={speed} />
        </div>
        {inner}
      </div>
      <div style={{opacity: c, transform: `scale(${interpolate(c, [0, 1], [0.6, 1])})`, background: '#0a1218', border: `4px solid ${color}`, borderRadius: 999, padding: '16px 42px', fontFamily: archivo.fontFamily, fontWeight: 700, fontSize: 36, color: WHITE}}>{chip}</div>
    </div>
  );
};

// Chemistry inner: molecule strand that slowly loses its last bead.
const ChemInner: React.FC = () => {
  const frame = useCurrentFrame();
  const drop = interpolate(frame, [70, 160], [0, 140], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const fadeBead = interpolate(frame, [70, 160], [1, 0.15], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return (
    <svg width={380} height={200}>
      {Array.from({length: 5}).map((_, i) => (
        <g key={i}>
          {i < 4 ? <line x1={50 + i * 70} y1={90} x2={120 + i * 70} y2={90} stroke="#7fd4e0" strokeWidth={6} opacity={i === 3 ? fadeBead : 1} /> : null}
          <circle cx={50 + i * 70} cy={i === 4 ? 90 + drop : 90} r={20} fill={i % 2 === 0 ? TEAL : '#dff5f8'} stroke="#0a3038" strokeWidth={3} opacity={i === 4 ? fadeBead : 1} />
        </g>
      ))}
    </svg>
  );
};

// Microbiology inner: vial top with a puncture counter ticking up.
const MicroInner: React.FC = () => {
  const frame = useCurrentFrame();
  const count = Math.min(3, 1 + Math.floor(frame / 55));
  return (
    <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14}}>
      <svg width={200} height={130}>
        <rect x={55} y={10} width={90} height={34} rx={8} fill={TEAL_DEEP} />
        <rect x={45} y={44} width={110} height={26} rx={6} fill="#8fa0a8" />
        <rect x={62} y={70} width={76} height={50} rx={10} fill="none" stroke={CYAN} strokeWidth={4} />
        {Array.from({length: count}).map((_, i) => (
          <line key={i} x1={85 + i * 15} y1={18} x2={85 + i * 15} y2={38} stroke={AMBER} strokeWidth={4} strokeLinecap="round" />
        ))}
      </svg>
      <div style={{fontFamily: anton.fontFamily, fontSize: 44, color: CYAN}}>{'×'}{count}</div>
    </div>
  );
};

// Beat 5: both clocks side by side with risk chips.
const DuoBeat: React.FC<{labelA: string; labelB: string; riskAt: number; riskA: string; riskB: string}> = ({labelA, labelB, riskAt, riskA, riskB}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const s = spring({frame, fps, config: {damping: 13, stiffness: 150}});
  const r = spring({frame: frame - riskAt, fps, config: {damping: 11, stiffness: 220}});
  const col = (label: string, color: string, speed: number, risk: string): React.ReactElement => (
    <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24}}>
      <div style={{fontFamily: anton.fontFamily, fontSize: 38, letterSpacing: 2, color}}>{label}</div>
      <ClockFace R={170} color={color} speed={speed} />
      <div style={{opacity: r, transform: `scale(${interpolate(r, [0, 1], [0.6, 1])})`, background: '#0a1218', border: `3px solid ${color}`, borderRadius: 999, padding: '12px 26px', fontFamily: archivo.fontFamily, fontWeight: 700, fontSize: 28, color: WHITE, textAlign: 'center', maxWidth: 400}}>{risk}</div>
    </div>
  );
  return (
    <div style={{display: 'flex', gap: 60, opacity: s, transform: `scale(${interpolate(s, [0, 1], [0.85, 1])})`}}>
      {col(labelA, TEAL, 2.2, riskA)}
      {col(labelB, CYAN, 3.4, riskB)}
    </div>
  );
};

// Beat 6: the amber 28-days stamp slams onto the microbiology clock only.
const TrapBeat: React.FC<{stamp: string; labelA: string; labelB: string; qAt: number}> = ({stamp, labelA, labelB, qAt}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const s = spring({frame, fps, config: {damping: 13, stiffness: 150}});
  const slam = spring({frame: frame - 14, fps, config: {damping: 10, stiffness: 260}});
  const q = spring({frame: frame - qAt, fps, config: {damping: 11, stiffness: 220}});
  return (
    <div style={{display: 'flex', gap: 60, opacity: s}}>
      <div style={{position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20}}>
        <div style={{fontFamily: anton.fontFamily, fontSize: 38, letterSpacing: 2, color: TEAL}}>{labelA}</div>
        <ClockFace R={170} color={TEAL} speed={2.2} />
        <div style={{position: 'absolute', top: 220, opacity: q, transform: `scale(${interpolate(q, [0, 1], [0.4, 1])})`, fontFamily: anton.fontFamily, fontSize: 130, color: AMBER, textShadow: '0 0 50px rgba(245,158,11,0.6)'}}>?</div>
      </div>
      <div style={{position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20}}>
        <div style={{fontFamily: anton.fontFamily, fontSize: 38, letterSpacing: 2, color: CYAN}}>{labelB}</div>
        <div style={{opacity: 0.55}}>
          <ClockFace R={170} color={CYAN} speed={3.4} />
        </div>
        <div
          style={{
            position: 'absolute',
            top: 200,
            transform: `rotate(-12deg) scale(${interpolate(slam, [0, 1], [2.2, 1])})`,
            opacity: slam,
            border: `6px solid ${AMBER}`,
            background: 'rgba(26,18,6,0.9)',
            borderRadius: 20,
            padding: '18px 34px',
            fontFamily: anton.fontFamily,
            fontSize: 64,
            letterSpacing: 3,
            color: AMBER,
            boxShadow: '0 0 90px rgba(245,158,11,0.45)',
          }}
        >
          {stamp}
        </div>
      </div>
    </div>
  );
};

export const S2Day2: React.FC<{locale: S2Day2Config}> = ({locale}) => {
  const frame = useCurrentFrame();
  const sec = (s: number) => Math.round(s * FPS);
  const L = locale;

  return (
    <AbsoluteFill style={{background: BG}}>
      <Audio src={staticFile(L.voFile)} />
      <Audio src={staticFile('music.wav')} volume={0.45} />
      <Glow />

      {L.clips.map((c) => (
        <Sequence key={c.src + c.from} from={sec(c.from)} durationInFrames={sec(c.dur)}>
          <Cinematic src={c.src} />
        </Sequence>
      ))}

      {/* Beat 2: the split */}
      <Sequence from={sec(L.split.from)} durationInFrames={sec(L.split.to - L.split.from)}>
        <AbsoluteFill style={{alignItems: 'center', paddingTop: 620}}>
          <SplitBeat />
        </AbsoluteFill>
      </Sequence>

      {/* Beat 3: chemistry clock */}
      <Sequence from={sec(L.chem.from)} durationInFrames={sec(L.chem.to - L.chem.from)}>
        <AbsoluteFill style={{alignItems: 'center', paddingTop: 600}}>
          <ClockPanel label={L.chem.label} color={TEAL} speed={2.2} chip={L.chem.chip} chipAt={sec(L.chem.chipAt - L.chem.from)} inner={<ChemInner />} />
        </AbsoluteFill>
      </Sequence>

      {/* Beat 4: microbiology clock */}
      <Sequence from={sec(L.micro.from)} durationInFrames={sec(L.micro.to - L.micro.from)}>
        <AbsoluteFill style={{alignItems: 'center', paddingTop: 600}}>
          <ClockPanel label={L.micro.label} color={CYAN} speed={3.4} chip={L.micro.chip} chipAt={sec(L.micro.chipAt - L.micro.from)} inner={<MicroInner />} />
        </AbsoluteFill>
      </Sequence>

      {/* Beat 5: two clocks, two risks */}
      <Sequence from={sec(L.duo.from)} durationInFrames={sec(L.duo.to - L.duo.from)}>
        <AbsoluteFill style={{alignItems: 'center', paddingTop: 680}}>
          <DuoBeat labelA={L.duo.labelA} labelB={L.duo.labelB} riskAt={sec(L.duo.riskAt - L.duo.from)} riskA={L.duo.riskA} riskB={L.duo.riskB} />
        </AbsoluteFill>
      </Sequence>

      {/* Beat 6-7: the 28-day trap and the tease */}
      <Sequence from={sec(L.trap.from)} durationInFrames={sec(L.trap.to - L.trap.from)}>
        <AbsoluteFill style={{alignItems: 'center', paddingTop: 680}}>
          <TrapBeat stamp={L.trap.stamp} labelA={L.trap.labelA} labelB={L.trap.labelB} qAt={sec(L.trap.qAt - L.trap.from)} />
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
                opacity: interpolate(frame, [sec(L.dayChip.from), sec(L.dayChip.from + 0.5)], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}),
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
                opacity: interpolate(frame, [sec(L.endFrom + 0.4), sec(L.endFrom + 1)], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}),
              }}
            >
              buddypept.com
            </div>
            <div
              style={{
                fontFamily: archivo.fontFamily,
                fontSize: 30,
                color: '#5d7078',
                opacity: interpolate(frame, [sec(L.endFrom + 1.4), sec(L.endFrom + 2)], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}),
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

export const S2DAY2_EN: S2Day2Config = {
  id: 'S2Day2EN',
  flag: 'us',
  voFile: 's2-d2-vo-en.mp3',
  cues: [
    {from: 0.05, to: 3.63, lines: ['YESTERDAY, THE CLOCK', 'STARTED. LOOK CLOSER.'], teal: 1},
    {from: 3.63, to: 6.78, lines: ['NOT ONE CLOCK.', 'TWO.']},
    {from: 6.78, to: 11.64, lines: ['CLOCK 1:', 'CHEMISTRY.'], teal: 1},
    {from: 11.64, to: 16.04, lines: ['HYDROLYSIS. OXIDATION.', 'THEY NEVER FULLY STOP.']},
    {from: 16.04, to: 19.4, lines: ['COLD SLOWS IT.', 'IT NEVER RESETS.'], teal: 1},
    {from: 19.4, to: 21.52, lines: ['CLOCK 2:', 'MICROBIOLOGY.'], teal: 1},
    {from: 21.52, to: 25.61, lines: ['EVERY OPEN =', 'A CHANCE IN.']},
    {from: 25.61, to: 30.26, lines: ['PRESERVATIVES SUPPRESS', 'GROWTH. NOT CHEMISTRY.'], teal: 1},
    {from: 30.26, to: 32.72, lines: ['TWO CLOCKS.', 'TWO DIFFERENT RISKS.'], teal: 1},
    {from: 32.72, to: 36.45, lines: ['ONE CHANGES THE MOLECULE.', 'ONE CONTAMINATES THE VIAL.']},
    {from: 36.45, to: 42.68, lines: ['THE FAMOUS 28 DAYS?', 'MICROBIOLOGY CLOCK.']},
    {from: 42.68, to: 46.35, lines: ['IT SAYS NOTHING ABOUT', 'THE CHEMISTRY. TOMORROW.'], teal: 1},
    {from: 46.35, to: 49.06, lines: ['DAY 2 OF 10.', 'BOTH CLOCKS RUNNING.'], teal: 1},
  ],
  clips: [
    {src: 's2-clip3.mp4', from: 0, dur: 5.6},
    {src: 's2-clip4.mp4', from: 44.0, dur: 5.04},
  ],
  split: {from: 5.69, to: 8.62},
  chem: {from: 8.62, to: 19.4, label: 'CHEMISTRY', chipAt: 16.04, chip: 'cold slows it, never resets'},
  micro: {from: 19.4, to: 30.26, label: 'MICROBIOLOGY', chipAt: 25.61, chip: 'suppresses growth, not chemistry'},
  duo: {
    from: 30.26,
    to: 36.45,
    labelA: 'CHEMISTRY',
    labelB: 'MICROBIOLOGY',
    riskAt: 32.72,
    riskA: 'changes the molecule',
    riskB: 'contaminates the vial',
  },
  trap: {from: 36.45, to: 44.0, stamp: '28 DAYS', labelA: 'CHEMISTRY', labelB: 'MICROBIOLOGY', qAt: 42.68},
  endFrom: 49.06,
  dayChip: {from: 49.06, label: 'DAY 2 OF 10'},
  disclaimer: 'Educational tool. Not medical advice. For research purposes only.',
  durationSec: 56,
};

export const S2DAY2_PT: S2Day2Config = {
  id: 'S2Day2PT',
  flag: 'br',
  voFile: 's2-d2-vo-pt.mp3',
  cues: [
    {from: 0.1, to: 3.81, lines: ['ONTEM, O RELÓGIO COMEÇOU.', 'OLHE MAIS DE PERTO.'], teal: 1},
    {from: 3.81, to: 6.75, lines: ['NÃO É UM RELÓGIO.', 'SÃO DOIS.']},
    {from: 6.75, to: 11.31, lines: ['RELÓGIO 1:', 'QUÍMICA.'], teal: 1},
    {from: 11.31, to: 14.96, lines: ['HIDRÓLISE. OXIDAÇÃO.', 'NUNCA PARAM TOTALMENTE.']},
    {from: 14.96, to: 18.57, lines: ['O FRIO DESACELERA.', 'MAS NUNCA ZERA.'], teal: 1},
    {from: 18.57, to: 20.94, lines: ['RELÓGIO 2:', 'MICROBIOLOGIA.'], teal: 1},
    {from: 20.94, to: 25.05, lines: ['CADA ABERTURA =', 'UMA CHANCE DE ENTRAR.']},
    {from: 25.05, to: 30.44, lines: ['CONSERVANTES SUPRIMEM', 'BACTÉRIAS. NÃO A QUÍMICA.'], teal: 1},
    {from: 30.44, to: 33.45, lines: ['DOIS RELÓGIOS.', 'DOIS RISCOS DIFERENTES.'], teal: 1},
    {from: 33.45, to: 36.65, lines: ['UM MUDA A MOLÉCULA.', 'O OUTRO CONTAMINA O FRASCO.']},
    {from: 36.65, to: 43.46, lines: ['OS FAMOSOS 28 DIAS?', 'RELÓGIO DA MICROBIOLOGIA.']},
    {from: 43.46, to: 47.44, lines: ['NÃO DIZ NADA SOBRE', 'A QUÍMICA. AMANHÃ.'], teal: 1},
    {from: 47.44, to: 50.98, lines: ['DIA 2 DE 10.', 'OS DOIS RELÓGIOS CORRENDO.'], teal: 1},
  ],
  clips: [
    {src: 's2-clip3.mp4', from: 0, dur: 5.7},
    {src: 's2-clip4.mp4', from: 44.6, dur: 5.04},
  ],
  split: {from: 5.81, to: 8.49},
  chem: {from: 8.49, to: 18.57, label: 'QUÍMICA', chipAt: 14.96, chip: 'o frio desacelera, nunca zera'},
  micro: {from: 18.57, to: 30.44, label: 'MICROBIOLOGIA', chipAt: 25.05, chip: 'suprime bactérias, não a química'},
  duo: {
    from: 30.44,
    to: 36.65,
    labelA: 'QUÍMICA',
    labelB: 'MICROBIOLOGIA',
    riskAt: 33.45,
    riskA: 'muda a molécula',
    riskB: 'contamina o frasco',
  },
  trap: {from: 36.65, to: 44.6, stamp: '28 DIAS', labelA: 'QUÍMICA', labelB: 'MICROBIOLOGIA', qAt: 43.46},
  endFrom: 50.98,
  dayChip: {from: 50.98, label: 'DIA 2 DE 10'},
  disclaimer: 'Ferramenta educacional. Não é orientação médica. Somente para fins de pesquisa.',
  durationSec: 58,
};

export const S2DAY2_ES: S2Day2Config = {
  id: 'S2Day2ES',
  flag: 'mx',
  voFile: 's2-d2-vo-es.mp3',
  cues: [
    {from: 0.1, to: 5.52, lines: ['AYER, EL RELOJ EMPEZÓ.', 'MIRA MÁS DE CERCA.'], teal: 1},
    {from: 5.52, to: 9.63, lines: ['NO ES UN RELOJ.', 'SON DOS.']},
    {from: 9.63, to: 16.03, lines: ['RELOJ 1:', 'QUÍMICA.'], teal: 1},
    {from: 16.03, to: 21.25, lines: ['HIDRÓLISIS. OXIDACIÓN.', 'NUNCA SE DETIENEN.']},
    {from: 21.25, to: 26.45, lines: ['EL FRÍO LO DESACELERA.', 'NUNCA SE REINICIA.'], teal: 1},
    {from: 26.45, to: 29.44, lines: ['RELOJ 2:', 'MICROBIOLOGÍA.'], teal: 1},
    {from: 29.44, to: 34.19, lines: ['CADA APERTURA =', 'UNA POSIBLE ENTRADA.']},
    {from: 34.19, to: 40.94, lines: ['LOS CONSERVANTES SUPRIMEN', 'BACTERIAS. NO LA QUÍMICA.'], teal: 1},
    {from: 40.94, to: 45.23, lines: ['DOS RELOJES.', 'DOS RIESGOS DIFERENTES.'], teal: 1},
    {from: 45.23, to: 49.91, lines: ['UNO CAMBIA LA MOLÉCULA.', 'EL OTRO CONTAMINA EL VIAL.']},
    {from: 49.91, to: 58.83, lines: ['¿LOS FAMOSOS 28 DÍAS?', 'RELOJ DE LA MICROBIOLOGÍA.']},
    {from: 58.83, to: 64.24, lines: ['NO DICE NADA SOBRE', 'LA QUÍMICA. MAÑANA.'], teal: 1},
    {from: 64.24, to: 69.15, lines: ['DÍA 2 DE 10.', 'LOS DOS RELOJES CORRIENDO.'], teal: 1},
  ],
  clips: [
    {src: 's2-clip3.mp4', from: 0, dur: 5.5},
    {src: 's2-clip4.mp4', from: 63.2, dur: 5.04},
  ],
  split: {from: 5.52, to: 9.63},
  chem: {from: 9.63, to: 26.45, label: 'QUÍMICA', chipAt: 21.25, chip: 'el frío lo desacelera, nunca se reinicia'},
  micro: {from: 26.45, to: 40.94, label: 'MICROBIOLOGÍA', chipAt: 34.19, chip: 'suprime bacterias, no la química'},
  duo: {
    from: 40.94,
    to: 49.91,
    labelA: 'QUÍMICA',
    labelB: 'MICROBIOLOGÍA',
    riskAt: 45.23,
    riskA: 'cambia la molécula',
    riskB: 'contamina el vial',
  },
  trap: {from: 49.91, to: 63.2, stamp: '28 DÍAS', labelA: 'QUÍMICA', labelB: 'MICROBIOLOGÍA', qAt: 58.83},
  endFrom: 69.15,
  dayChip: {from: 69.15, label: 'DÍA 2 DE 10'},
  disclaimer: 'Herramienta educativa. No es consejo médico. Solo con fines de investigación.',
  durationSec: 78,
};
