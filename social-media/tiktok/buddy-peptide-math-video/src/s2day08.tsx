import React from 'react';
import {
  AbsoluteFill,
  Audio,
  Img,
  interpolate,
  OffthreadVideo,
  random,
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

const AMBER = '#f59e0b';
const VIOLET = '#a78bfa';
const VIAL = 'vial-liquid-peptide-en.png';

type ClipCfg = {src: string; from: number; dur: number};
type Span = {from: number; to: number};

type S2Day8Config = {
  id: string;
  flag: 'us' | 'mx' | 'br';
  voFile: string;
  cues: Cue[];
  clips: ClipCfg[];
  hook: Span & {eyeAt: number; eyeChip: string};
  cloudy: Span & {chipAt: number; chip: string; sourceLabel: string; source: string};
  inside: Span & {oxAt: number; chip: string};
  tiny: Span & {chip: string; sourceLabel: string; source: string};
  stamp: Span & {text: string};
  verdict: Span & {line2At: number; chipsAt: number; line1: string; line2: string; chips: string[]};
  endFrom: number;
  dayChip: {from: number; label: string};
  disclaimer: string;
  durationSec: number;
};

const Cinematic: React.FC<{src: string}> = ({src}) => {
  const frame = useCurrentFrame();
  const fade = interpolate(frame, [0, 10], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return (
    <AbsoluteFill style={{opacity: fade, alignItems: 'center', paddingTop: 500}}>
      <div style={{width: 792, height: 1408, borderRadius: 36, overflow: 'hidden', WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, black 8%, black 88%, transparent 100%)'}}>
        <OffthreadVideo src={staticFile(src)} muted style={{width: '100%', height: '100%', objectFit: 'cover'}} />
      </div>
    </AbsoluteFill>
  );
};

const SourceChip: React.FC<{label: string; source: string; sp: number}> = ({label, source, sp}) => (
  <div style={{opacity: sp, transform: `translateY(${interpolate(sp, [0, 1], [30, 0])}px)`, display: 'flex', alignItems: 'center', gap: 18, background: 'rgba(10,18,24,0.92)', border: `3px solid ${TEAL}`, borderRadius: 999, padding: '14px 34px', maxWidth: 960}}>
    <div style={{width: 34, height: 34, borderRadius: 999, background: TEAL, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: anton.fontFamily, fontSize: 24, color: '#04262b', flexShrink: 0}}>{'✓'}</div>
    <div style={{fontFamily: anton.fontFamily, fontSize: 30, letterSpacing: 2, color: TEAL, flexShrink: 0}}>{label}</div>
    <div style={{fontFamily: archivo.fontFamily, fontWeight: 700, fontSize: 26, color: MUTED}}>{source}</div>
  </div>
);

// Liquid-only vial; `haze` 0..1 clouds the liquid and adds drifting flakes.
const Vial: React.FC<{h: number; haze?: number}> = ({h, haze = 0}) => {
  const frame = useCurrentFrame();
  const w = h * 0.448;
  return (
    <div style={{position: 'relative', width: w, height: h}}>
      <Img src={staticFile(VIAL)} style={{height: h, WebkitMaskImage: 'linear-gradient(to right, transparent 0%, black 14%, black 86%, transparent 100%)'}} />
      {haze > 0 ? (
        <div style={{position: 'absolute', left: '12%', right: '12%', top: '35%', bottom: '4%', borderRadius: 16, background: `rgba(225,232,236,${0.55 * haze})`, filter: 'blur(6px)'}} />
      ) : null}
      {haze > 0 ? (
        <svg width={w} height={h} style={{position: 'absolute', left: 0, top: 0, opacity: haze}}>
          {Array.from({length: 18}).map((_, i) => {
            const x = w * (0.2 + random(`fx${i}`) * 0.6);
            const y = h * (0.38 + ((random(`fy${i}`) + frame / 400) % 1) * 0.55);
            return <rect key={i} x={x} y={y} width={5 + random(`fw${i}`) * 7} height={3 + random(`fh${i}`) * 5} rx={2} fill="#f5f5f0" opacity={0.9} transform={`rotate(${random(`fr${i}`) * 180} ${x} ${y})`} />;
          })}
        </svg>
      ) : null}
    </div>
  );
};

// Beat 1-2: two clear vials, a question mark, then an eye that can't tell.
const Hook: React.FC<{eyeAt: number; eyeChip: string}> = ({eyeAt, eyeChip}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const s = spring({frame, fps, config: {damping: 13, stiffness: 150}});
  const eye = spring({frame: frame - eyeAt, fps, config: {damping: 12, stiffness: 190}});
  const pulse = 1 + Math.sin(frame / 6) * 0.06;
  return (
    <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 30, opacity: s}}>
      <div style={{display: 'flex', alignItems: 'center', gap: 40}}>
        <Vial h={640} />
        <div style={{fontFamily: anton.fontFamily, fontSize: 140, color: AMBER, transform: `scale(${pulse})`}}>?</div>
        <Vial h={640} />
      </div>
      <div style={{opacity: eye, transform: `scale(${interpolate(eye, [0, 1], [0.6, 1])})`, display: 'flex', alignItems: 'center', gap: 18, background: '#1a1206', border: `4px solid ${AMBER}`, borderRadius: 999, padding: '14px 40px'}}>
        <svg width={60} height={36} viewBox="0 0 60 36">
          <path d="M2 18 C 15 2, 45 2, 58 18 C 45 34, 15 34, 2 18 Z" fill="none" stroke={AMBER} strokeWidth={4} />
          <circle cx={30} cy={18} r={8} fill={AMBER} />
        </svg>
        <div style={{fontFamily: anton.fontFamily, fontSize: 44, letterSpacing: 2, color: AMBER}}>{eyeChip}</div>
      </div>
    </div>
  );
};

// Beat 3: a vial goes hazy with flakes; reject chip and source.
const Cloudy: React.FC<{chipAt: number; chip: string; sourceLabel: string; source: string}> = ({chipAt, chip, sourceLabel, source}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const haze = interpolate(frame, [10, 60], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const c = spring({frame: frame - chipAt, fps, config: {damping: 10, stiffness: 220}});
  const src = spring({frame: frame - chipAt - 20, fps, config: {damping: 12, stiffness: 200}});
  return (
    <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 30}}>
      <Vial h={680} haze={haze} />
      <div style={{opacity: c, transform: `scale(${interpolate(c, [0, 1], [1.5, 1])})`, background: '#1a1206', border: `4px solid ${AMBER}`, borderRadius: 999, padding: '14px 44px', fontFamily: anton.fontFamily, fontSize: 46, letterSpacing: 2, color: AMBER}}>{chip}</div>
      <SourceChip label={sourceLabel} source={source} sp={src} />
    </div>
  );
};

// Beat 4: inside a clear vial, beads quietly oxidize; the liquid does not change.
const Inside: React.FC<{oxAt: number; chip: string}> = ({oxAt, chip}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const s = spring({frame, fps, config: {damping: 13, stiffness: 140}});
  const ox = interpolate(frame, [oxAt, oxAt + 30], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const c = spring({frame: frame - oxAt - 20, fps, config: {damping: 11, stiffness: 220}});
  const rows = [0, 1, 2];
  const hot = [[2], [5, 6], [1]];
  return (
    <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 34, opacity: s}}>
      <div style={{width: 820, height: 620, borderRadius: 40, border: `6px solid rgba(127,230,242,0.5)`, background: 'rgba(127,230,242,0.05)', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 70}}>
        {rows.map((r) => (
          <svg key={r} width={820} height={100}>
            <polyline points={Array.from({length: 8}).map((_, i) => `${80 + i * 94},${50 + Math.sin(i * 0.9 + frame / 20 + r) * 18}`).join(' ')} fill="none" stroke={TEAL} strokeWidth={6} opacity={0.5} />
            {Array.from({length: 8}).map((_, i) => {
              const isHot = hot[r].includes(i);
              const col = isHot && ox > 0.5 ? VIOLET : TEAL;
              return <circle key={i} cx={80 + i * 94} cy={50 + Math.sin(i * 0.9 + frame / 20 + r) * 18} r={30} fill={BG} stroke={col} strokeWidth={7} style={{filter: `drop-shadow(0 0 ${isHot ? 10 + ox * 18 : 8}px ${col})`}} />;
            })}
          </svg>
        ))}
      </div>
      <div style={{opacity: c, transform: `scale(${interpolate(c, [0, 1], [0.6, 1])})`, background: '#1b1030', border: `4px solid ${VIOLET}`, borderRadius: 999, padding: '14px 44px', fontFamily: anton.fontFamily, fontSize: 44, letterSpacing: 2, color: WHITE}}>{chip}</div>
    </div>
  );
};

// Beat 5: magnifier reveals subvisible clusters, a counter ticks up.
const Tiny: React.FC<{chip: string; sourceLabel: string; source: string}> = ({chip, sourceLabel, source}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const s = spring({frame, fps, config: {damping: 13, stiffness: 150}});
  const count = Math.floor(interpolate(frame, [10, 110], [0, 2480], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}));
  const src = spring({frame: frame - 30, fps, config: {damping: 12, stiffness: 200}});
  const mx = 300 + Math.sin(frame / 30) * 120;
  const my = 260 + Math.cos(frame / 34) * 60;
  return (
    <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 28, opacity: s}}>
      <div style={{position: 'relative', width: 820, height: 520, borderRadius: 40, border: `6px solid rgba(127,230,242,0.5)`, background: 'rgba(127,230,242,0.05)', overflow: 'hidden'}}>
        <svg width={820} height={520} style={{position: 'absolute', left: 0, top: 0}}>
          <defs>
            <clipPath id="lens"><circle cx={mx} cy={my} r={150} /></clipPath>
          </defs>
          <g clipPath="url(#lens)">
            {Array.from({length: 40}).map((_, i) => {
              const x = random(`tx${i}`) * 820;
              const y = random(`ty${i}`) * 520;
              return (
                <g key={i}>
                  <circle cx={x} cy={y} r={9} fill={AMBER} opacity={0.85} />
                  <circle cx={x + 11} cy={y + 5} r={7} fill={AMBER} opacity={0.85} />
                  <circle cx={x + 3} cy={y + 13} r={6} fill={AMBER} opacity={0.85} />
                </g>
              );
            })}
          </g>
          <circle cx={mx} cy={my} r={150} fill="none" stroke={WHITE} strokeWidth={10} />
          <line x1={mx + 106} y1={my + 106} x2={mx + 200} y2={my + 200} stroke={WHITE} strokeWidth={22} strokeLinecap="round" />
        </svg>
      </div>
      <div style={{display: 'flex', alignItems: 'center', gap: 24}}>
        <div style={{fontFamily: anton.fontFamily, fontSize: 64, color: AMBER, minWidth: 180, textAlign: 'right'}}>{count.toLocaleString('en-US')}</div>
        <div style={{background: '#1a1206', border: `4px solid ${AMBER}`, borderRadius: 999, padding: '12px 36px', fontFamily: anton.fontFamily, fontSize: 42, letterSpacing: 2, color: AMBER}}>{chip}</div>
      </div>
      <SourceChip label={sourceLabel} source={source} sp={src} />
    </div>
  );
};

// Beat 6: a stamp slides across a clear vial.
const Stamp: React.FC<{text: string}> = ({text}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const st = spring({frame: frame - 8, fps, config: {damping: 9, stiffness: 240}});
  return (
    <div style={{position: 'relative', display: 'flex', justifyContent: 'center', width: 900}}>
      <Vial h={680} />
      <div style={{position: 'absolute', top: 300, opacity: st, transform: `rotate(-10deg) scale(${interpolate(st, [0, 1], [2, 1])})`, border: `8px solid ${AMBER}`, borderRadius: 18, padding: '16px 34px', background: 'rgba(26,18,6,0.85)', fontFamily: anton.fontFamily, fontSize: 52, letterSpacing: 2, color: AMBER, textAlign: 'center', maxWidth: 820}}>{text}</div>
    </div>
  );
};

const Verdict: React.FC<{line2At: number; chipsAt: number; line1: string; line2: string; chips: string[]}> = ({line2At, chipsAt, line1, line2, chips}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const s = spring({frame, fps, config: {damping: 11, stiffness: 190}});
  const l2 = spring({frame: frame - line2At, fps, config: {damping: 11, stiffness: 190}});
  return (
    <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 30}}>
      <div style={{opacity: s, transform: `scale(${interpolate(s, [0, 1], [0.6, 1])})`, background: TEAL_DEEP, border: `5px solid ${TEAL}`, borderRadius: 30, padding: '26px 56px', fontFamily: anton.fontFamily, fontSize: 76, color: WHITE, boxShadow: '0 0 90px rgba(42,182,201,0.45)', textAlign: 'center', maxWidth: 980}}>{line1}</div>
      <div style={{opacity: l2, transform: `scale(${interpolate(l2, [0, 1], [0.7, 1])})`, background: '#1a1206', border: `5px solid ${AMBER}`, borderRadius: 30, padding: '22px 56px', fontFamily: anton.fontFamily, fontSize: 76, color: AMBER, textAlign: 'center', maxWidth: 980}}>{line2}</div>
      <div style={{display: 'flex', gap: 22, marginTop: 10}}>
        {chips.map((t, i) => {
          const c = spring({frame: frame - chipsAt - i * 8, fps, config: {damping: 11, stiffness: 220}});
          return <div key={i} style={{opacity: c, transform: `translateY(${interpolate(c, [0, 1], [30, 0])}px)`, border: `4px solid ${TEAL}`, borderRadius: 999, padding: '12px 34px', fontFamily: anton.fontFamily, fontSize: 40, letterSpacing: 2, color: TEAL}}>{t}</div>;
        })}
      </div>
    </div>
  );
};

export const S2Day8: React.FC<{locale: S2Day8Config}> = ({locale}) => {
  const frame = useCurrentFrame();
  const sec = (s: number) => Math.round(s * FPS);
  const L = locale;
  const span = (x: Span) => ({from: sec(x.from), durationInFrames: sec(x.to - x.from)});
  const rel = (t: number, base: Span) => sec(t - base.from);

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

      <Sequence {...span(L.hook)}>
        <AbsoluteFill style={{alignItems: 'center', paddingTop: 590}}>
          <Hook eyeAt={rel(L.hook.eyeAt, L.hook)} eyeChip={L.hook.eyeChip} />
        </AbsoluteFill>
      </Sequence>

      <Sequence {...span(L.cloudy)}>
        <AbsoluteFill style={{alignItems: 'center', paddingTop: 590}}>
          <Cloudy chipAt={rel(L.cloudy.chipAt, L.cloudy)} chip={L.cloudy.chip} sourceLabel={L.cloudy.sourceLabel} source={L.cloudy.source} />
        </AbsoluteFill>
      </Sequence>

      <Sequence {...span(L.inside)}>
        <AbsoluteFill style={{alignItems: 'center', paddingTop: 640}}>
          <Inside oxAt={rel(L.inside.oxAt, L.inside)} chip={L.inside.chip} />
        </AbsoluteFill>
      </Sequence>

      <Sequence {...span(L.tiny)}>
        <AbsoluteFill style={{alignItems: 'center', paddingTop: 640}}>
          <Tiny chip={L.tiny.chip} sourceLabel={L.tiny.sourceLabel} source={L.tiny.source} />
        </AbsoluteFill>
      </Sequence>

      <Sequence {...span(L.stamp)}>
        <AbsoluteFill style={{alignItems: 'center', paddingTop: 620}}>
          <Stamp text={L.stamp.text} />
        </AbsoluteFill>
      </Sequence>

      <Sequence {...span(L.verdict)}>
        <AbsoluteFill style={{alignItems: 'center', paddingTop: 720}}>
          <Verdict line2At={rel(L.verdict.line2At, L.verdict)} chipsAt={rel(L.verdict.chipsAt, L.verdict)} line1={L.verdict.line1} line2={L.verdict.line2} chips={L.verdict.chips} />
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
            <div style={{border: `3px solid ${TEAL}`, borderRadius: 999, padding: '18px 48px', fontFamily: anton.fontFamily, fontSize: 54, color: TEAL, letterSpacing: 2, opacity: interpolate(frame, [sec(L.dayChip.from), sec(L.dayChip.from + 0.5)], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})}}>{L.dayChip.label}</div>
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

export const S2DAY8_EN: S2Day8Config = {
  id: 'S2Day8EN',
  flag: 'us',
  voFile: 's2-d8-vo-en.mp3',
  cues: [
    {from: 0.05, to: 2.85, lines: ['TWO VIALS.', 'BOTH CLEAR.'], teal: 1},
    {from: 2.85, to: 5.59, lines: ['SAME?', 'YOUR EYES CAN’T TELL.']},
    {from: 5.59, to: 10.47, lines: ['CLOUDY IS', 'A WARNING.'], teal: 1},
    {from: 10.47, to: 16.15, lines: ['VISIBLE PARTICLES:', 'REJECT THE VIAL.']},
    {from: 16.15, to: 18.46, lines: ['CLEAR DOESN’T MEAN', 'UNCHANGED.'], teal: 1},
    {from: 18.46, to: 22.99, lines: ['THE AMINO-CHAIN', 'CAN CHANGE UNSEEN.']},
    {from: 22.99, to: 27.9, lines: ['OXIDATION:', 'SAME LOOK.'], teal: 1},
    {from: 27.9, to: 32.43, lines: ['SOME CLUMPS', 'ARE INVISIBLE.']},
    {from: 32.43, to: 35.34, lines: ['CLEAR IS NOT', 'PROOF.'], teal: 1},
    {from: 35.34, to: 37.97, lines: ['CLOUDY IS A WARNING.', 'CLEAR PROVES NOTHING.'], teal: 1},
    {from: 37.97, to: 41.69, lines: ['TRUST THE LABEL,', 'STORAGE, AND TIME.']},
    {from: 41.69, to: 44.93, lines: ['DAY 8 OF 10.', 'THE MATH DOESN’T LIE.'], teal: 1},
  ],
  clips: [{src: 's2-clip4.mp4', from: 41.69, dur: 3.24}],
  hook: {from: 0, to: 5.59, eyeAt: 3.98, eyeChip: 'YOUR EYES CAN’T TELL'},
  cloudy: {from: 5.59, to: 16.15, chipAt: 10.47, chip: 'VISIBLE PARTICLES = REJECT', sourceLabel: 'SOURCE VERIFIED', source: 'USP <790> Visible Particulates in Injections'},
  inside: {from: 16.15, to: 27.9, oxAt: 22.99, chip: 'OXIDIZED, STILL CLEAR'},
  tiny: {from: 27.9, to: 32.43, chip: 'TOO SMALL TO SEE', sourceLabel: 'SOURCE VERIFIED', source: 'USP <787>/<788> Subvisible Particulate Matter'},
  stamp: {from: 32.43, to: 35.34, text: 'NOT A CLEAN BILL OF HEALTH'},
  verdict: {from: 35.34, to: 41.69, line2At: 36.67, chipsAt: 37.97, line1: 'CLOUDY IS A WARNING.', line2: 'CLEAR PROVES NOTHING.', chips: ['LABEL', 'STORAGE', 'TIME']},
  endFrom: 44.93,
  dayChip: {from: 44.93, label: 'DAY 8 OF 10'},
  disclaimer: 'Educational tool. Not medical advice. For research purposes only.',
  durationSec: 51,
};

export const S2DAY8_PT: S2Day8Config = {
  id: 'S2Day8PT',
  flag: 'br',
  voFile: 's2-d8-vo-pt.mp3',
  cues: [
    {from: 0.05, to: 4.01, lines: ['DOIS FRASCOS.', 'OS DOIS LÍMPIDOS.'], teal: 1},
    {from: 4.01, to: 7.41, lines: ['IGUAIS?', 'SEUS OLHOS NÃO SABEM.']},
    {from: 7.41, to: 12.47, lines: ['TURVO É', 'UM ALERTA.'], teal: 1},
    {from: 12.47, to: 17.81, lines: ['PARTÍCULAS VISÍVEIS:', 'REJEITAR O FRASCO.']},
    {from: 17.81, to: 20.38, lines: ['LÍMPIDO NÃO É', 'INALTERADO.'], teal: 1},
    {from: 20.38, to: 24.91, lines: ['A CADEIA PODE MUDAR', 'SEM APARECER.']},
    {from: 24.91, to: 29.19, lines: ['OXIDAÇÃO:', 'MESMA APARÊNCIA.'], teal: 1},
    {from: 29.19, to: 35.49, lines: ['ALGUNS AGLOMERADOS', 'SÃO INVISÍVEIS.']},
    {from: 35.49, to: 38.73, lines: ['LÍMPIDO NÃO É', 'PROVA.'], teal: 1},
    {from: 38.73, to: 41.66, lines: ['TURVO É UM ALERTA.', 'LÍMPIDO NÃO PROVA NADA.'], teal: 1},
    {from: 41.66, to: 45.8, lines: ['CONFIE NO RÓTULO,', 'ARMAZENAMENTO E TEMPO.']},
    {from: 45.8, to: 49.49, lines: ['DIA 8 DE 10.', 'A MATEMÁTICA NÃO MENTE.'], teal: 1},
  ],
  clips: [{src: 's2-clip4.mp4', from: 45.8, dur: 3.69}],
  hook: {from: 0, to: 7.41, eyeAt: 5.29, eyeChip: 'SEUS OLHOS NÃO SABEM'},
  cloudy: {from: 7.41, to: 17.81, chipAt: 12.47, chip: 'PARTÍCULAS VISÍVEIS = REJEITAR', sourceLabel: 'FONTE VERIFICADA', source: 'USP <790> Partículas visíveis em injetáveis'},
  inside: {from: 17.81, to: 29.19, oxAt: 24.91, chip: 'OXIDADO, AINDA LÍMPIDO'},
  tiny: {from: 29.19, to: 35.49, chip: 'PEQUENO DEMAIS PARA VER', sourceLabel: 'FONTE VERIFICADA', source: 'USP <787>/<788> Partículas subvisíveis'},
  stamp: {from: 35.49, to: 38.73, text: 'NÃO É ATESTADO DE SAÚDE'},
  verdict: {from: 38.73, to: 45.8, line2At: 40.02, chipsAt: 41.66, line1: 'TURVO É UM ALERTA.', line2: 'LÍMPIDO NÃO PROVA NADA.', chips: ['RÓTULO', 'ARMAZENAMENTO', 'TEMPO']},
  endFrom: 49.49,
  dayChip: {from: 49.49, label: 'DIA 8 DE 10'},
  disclaimer: 'Ferramenta educacional. Não é orientação médica. Somente para fins de pesquisa.',
  durationSec: 56,
};

export const S2DAY8_ES: S2Day8Config = {
  id: 'S2Day8ES',
  flag: 'mx',
  voFile: 's2-d8-vo-es.mp3',
  cues: [
    {from: 0.05, to: 5.38, lines: ['DOS VIALES.', 'LOS DOS TRANSPARENTES.'], teal: 1},
    {from: 5.38, to: 9.87, lines: ['¿IGUALES?', 'TUS OJOS NO LO SABEN.']},
    {from: 9.87, to: 15.86, lines: ['TURBIO ES', 'UNA ALERTA.'], teal: 1},
    {from: 15.86, to: 22.21, lines: ['PARTÍCULAS VISIBLES:', 'RECHAZAR EL VIAL.']},
    {from: 22.21, to: 25.72, lines: ['TRANSPARENTE NO ES', 'SIN CAMBIOS.'], teal: 1},
    {from: 25.72, to: 31.35, lines: ['LA CADENA PUEDE', 'CAMBIAR SIN VERSE.']},
    {from: 31.35, to: 36.59, lines: ['OXIDACIÓN:', 'MISMO ASPECTO.'], teal: 1},
    {from: 36.59, to: 44.77, lines: ['ALGUNOS AGREGADOS', 'SON INVISIBLES.']},
    {from: 44.77, to: 49.4, lines: ['TRANSPARENTE NO ES', 'PRUEBA.'], teal: 1},
    {from: 49.4, to: 54.2, lines: ['TURBIO ES UNA ALERTA.', 'TRANSPARENTE NO PRUEBA NADA.'], teal: 1},
    {from: 54.2, to: 59.54, lines: ['CONFÍA EN ETIQUETA,', 'ALMACENAMIENTO Y TIEMPO.']},
    {from: 59.54, to: 64.78, lines: ['DÍA 8 DE 10.', 'LAS CUENTAS NO MIENTEN.'], teal: 1},
  ],
  clips: [{src: 's2-clip4.mp4', from: 59.54, dur: 5.0}],
  hook: {from: 0, to: 9.87, eyeAt: 7.24, eyeChip: 'TUS OJOS NO LO SABEN'},
  cloudy: {from: 9.87, to: 22.21, chipAt: 15.86, chip: 'PARTÍCULAS VISIBLES = RECHAZO', sourceLabel: 'FUENTE VERIFICADA', source: 'USP <790> Partículas visibles en inyectables'},
  inside: {from: 22.21, to: 36.59, oxAt: 31.35, chip: 'OXIDADO, AÚN TRANSPARENTE'},
  tiny: {from: 36.59, to: 44.77, chip: 'DEMASIADO PEQUEÑO', sourceLabel: 'FUENTE VERIFICADA', source: 'USP <787>/<788> Partículas subvisibles'},
  stamp: {from: 44.77, to: 49.4, text: 'NO ES UN CERTIFICADO DE SALUD'},
  verdict: {from: 49.4, to: 59.54, line2At: 51.6, chipsAt: 54.2, line1: 'TURBIO ES UNA ALERTA.', line2: 'TRANSPARENTE NO PRUEBA NADA.', chips: ['ETIQUETA', 'ALMACENAMIENTO', 'TIEMPO']},
  endFrom: 64.78,
  dayChip: {from: 64.78, label: 'DÍA 8 DE 10'},
  disclaimer: 'Herramienta educativa. No es consejo médico. Solo con fines de investigación.',
  durationSec: 71,
};
