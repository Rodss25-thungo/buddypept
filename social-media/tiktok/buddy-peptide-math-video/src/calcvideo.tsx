import React from 'react';
import {AbsoluteFill, Audio, Easing, Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {loadFont as loadAnton} from '@remotion/google-fonts/Anton';
import {loadFont as loadArchivo} from '@remotion/google-fonts/Archivo';
import {BG, Buddy, FPS, Flag, Glow, Logo, TEAL, TEAL_DEEP, WHITE} from './Video';
import {AMBER} from './s3ep01';
import bpc from '../public/calc-bpc/manifest.json';
import bpcPt from '../public/calc-bpc-pt/manifest.json';
import bpcEs from '../public/calc-bpc-es/manifest.json';

const anton = loadAnton();
const archivo = loadArchivo();

type Box = {x: number; y: number; w: number; h: number};
type Pt = {x: number; y: number};
type Way = {t: number; at: string | Pt; click?: boolean};
type Cap = {from: number; to: number; text: string; hot?: boolean};

type CalcVideoConfig = {
  id: string;
  flag: 'us' | 'mx' | 'br';
  voFile: string;
  dir: string;
  swaps: {t: number; i: number}[];
  way: Way[];
  caps: Cap[];
  resultAt: number;
  endAt: number;
  endBeats: {at: number; text: string; hot?: boolean}[];
  subBeat: {at: number; text: string};
  followAt: number;
  seriesChip: string;
  disclaimer: string;
  durationSec: number;
};

const MANIFESTS: Record<string, {targets: Record<string, Box>; frames: {file: string}[]}> = {'calc-bpc': bpc as never, 'calc-bpc-pt': bpcPt as never, 'calc-bpc-es': bpcEs as never};

const SCALE = 0.8;
const SCREEN_W = 1080 * SCALE;
const SCREEN_H = 1920 * SCALE;
const SCREEN_LEFT = (1080 - SCREEN_W) / 2;
const SCREEN_TOP = 330;

const resolve = (T: Record<string, Box>, at: string | Pt): Pt => {
  if (typeof at !== 'string') return at;
  const b = T[at];
  return {x: b.x + b.w / 2, y: b.y + b.h / 2};
};

const cursorAt = (way: {t: number; p: Pt}[], t: number): Pt => {
  for (let k = 0; k < way.length - 1; k++) {
    const a = way[k];
    const b = way[k + 1];
    if (t >= a.t && t <= b.t) {
      const p = Easing.inOut(Easing.cubic)((t - a.t) / Math.max(0.001, b.t - a.t));
      return {x: a.p.x + (b.p.x - a.p.x) * p, y: a.p.y + (b.p.y - a.p.y) * p};
    }
  }
  return t < way[0].t ? way[0].p : way[way.length - 1].p;
};

const Cursor: React.FC<{x: number; y: number}> = ({x, y}) => (
  <svg width={90} height={90} viewBox="0 0 24 24" style={{position: 'absolute', left: SCREEN_LEFT + x * SCALE - 6, top: SCREEN_TOP + y * SCALE - 4, filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.5))'}}>
    <path d="M3 2 L3 19 L8 14.5 L11.5 22 L14.5 20.7 L11 13.3 L18 13 Z" fill={WHITE} stroke="#0a0f12" strokeWidth={1.4} strokeLinejoin="round" />
  </svg>
);

const Ripple: React.FC<{x: number; y: number; since: number}> = ({x, y, since}) => {
  if (since < 0 || since > 0.45) return null;
  const p = since / 0.45;
  return <div style={{position: 'absolute', left: SCREEN_LEFT + x * SCALE - 60, top: SCREEN_TOP + y * SCALE - 60, width: 120, height: 120, borderRadius: 60, border: `6px solid ${TEAL}`, opacity: 1 - p, transform: `scale(${0.3 + p * 1.1})`}} />;
};

const fadeIn = (t: number, a: number, d = 0.4) => interpolate(t, [a, a + d], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});

export const CalcVideo: React.FC<{locale: CalcVideoConfig}> = ({locale: L}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = frame / FPS;
  const M = MANIFESTS[L.dir];
  const T = M.targets;

  let idx = 0;
  L.swaps.forEach((s) => {
    if (t >= s.t) idx = s.i;
  });

  const way = L.way.map((w) => ({t: w.t, p: resolve(T, w.at), click: w.click}));
  const cur = cursorAt(way, t);
  const showCursor = t < L.endAt;

  const cap = L.caps.find((c) => t >= c.from && t < c.to);
  const capIn = cap ? spring({frame: frame - Math.round(cap.from * FPS), fps, config: {damping: 14, stiffness: 200}}) : 0;

  const zoom = interpolate(t, [L.resultAt + 0.3, L.resultAt + 1.1], [1, 1.12], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.inOut(Easing.cubic)});
  const pop = t > L.resultAt ? 1 + 0.012 * Math.sin((t - L.resultAt) * 4) : 1;
  const screenOp = 1 - fadeIn(t, L.endAt - 0.2, 0.4);

  const endOp = fadeIn(t, L.endAt - 0.1, 0.5);
  const beat = [...L.endBeats].reverse().find((b) => t >= b.at) ?? L.endBeats[0];
  const beatSp = spring({frame: frame - Math.round(beat.at * FPS), fps, config: {damping: 12, stiffness: 180}});
  const subSp = spring({frame: frame - Math.round(L.subBeat.at * FPS), fps, config: {damping: 12, stiffness: 180}});
  const followed = t >= L.followAt;

  return (
    <AbsoluteFill style={{background: BG}}>
      <Audio src={staticFile(L.voFile)} />
      <Audio src={staticFile('music.wav')} volume={0.4} />
      <Glow />
      <AbsoluteFill style={{alignItems: 'center', paddingTop: 90}}>
        <Logo small />
      </AbsoluteFill>
      <Flag code={L.flag} />

      <AbsoluteFill style={{opacity: screenOp}}>
        {cap ? (
          <AbsoluteFill style={{alignItems: 'center', paddingTop: 205}}>
            <div style={{opacity: capIn, transform: `scale(${interpolate(capIn, [0, 1], [0.8, 1])})`, background: cap.hot ? '#1a1206' : TEAL_DEEP, border: `5px solid ${cap.hot ? AMBER : TEAL}`, borderRadius: 999, padding: '14px 52px', fontFamily: anton.fontFamily, fontSize: 60, letterSpacing: 2, color: cap.hot ? AMBER : WHITE, boxShadow: '0 0 60px rgba(42,182,201,0.35)', textAlign: 'center', maxWidth: 1000}}>{cap.text}</div>
          </AbsoluteFill>
        ) : null}
        <div style={{position: 'absolute', left: SCREEN_LEFT, top: SCREEN_TOP, width: SCREEN_W, height: SCREEN_H, borderRadius: 40, overflow: 'hidden', border: '6px solid rgba(245,247,250,0.25)', boxShadow: '0 20px 80px rgba(0,0,0,0.7)', transform: `scale(${pop})`}}>
          <Img src={staticFile(`${L.dir}/${M.frames[idx].file}`)} style={{width: '100%', height: '100%', transform: `scale(${zoom})`, transformOrigin: '50% 12%'}} />
        </div>
        {way.filter((w) => w.click).map((w, k) => (
          <Ripple key={k} x={w.p.x} y={w.p.y} since={t - w.t} />
        ))}
        {showCursor && zoom === 1 ? <Cursor x={cur.x} y={cur.y} /> : null}
      </AbsoluteFill>

      <AbsoluteFill style={{opacity: endOp, background: BG}}>
        <Glow />
        <Flag code={L.flag} />
        <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center', gap: 40}}>
          <div style={{background: TEAL_DEEP, borderRadius: 999, padding: '16px 50px', fontFamily: anton.fontFamily, fontSize: 46, color: WHITE, letterSpacing: 3}}>{L.seriesChip}</div>
          <Buddy size={420} />
          <div style={{opacity: beatSp, transform: `scale(${interpolate(beatSp, [0, 1], [0.8, 1])})`, background: beat.hot ? '#1a1206' : TEAL_DEEP, border: `6px solid ${beat.hot ? AMBER : TEAL}`, borderRadius: 40, padding: '26px 56px', fontFamily: anton.fontFamily, fontSize: 70, color: beat.hot ? AMBER : WHITE, textAlign: 'center', maxWidth: 980, lineHeight: 1.1}}>{beat.text}</div>
          <div style={{opacity: subSp, minHeight: 90, background: TEAL_DEEP, borderRadius: 999, padding: '16px 48px', fontFamily: anton.fontFamily, fontSize: 52, color: WHITE, letterSpacing: 2, visibility: t >= L.subBeat.at ? 'visible' : 'hidden'}}>{L.subBeat.text}</div>
          <Logo />
          <div style={{background: TEAL_DEEP, borderRadius: 999, padding: '24px 60px', fontFamily: archivo.fontFamily, fontWeight: 700, fontSize: 52, color: WHITE, opacity: followed ? fadeIn(t, L.followAt) : 0}}>buddypept.com</div>
          <div style={{fontFamily: archivo.fontFamily, fontSize: 28, color: '#5d7078', opacity: followed ? fadeIn(t, L.followAt + 1.0) : 0}}>{L.disclaimer}</div>
        </AbsoluteFill>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

const P = (x: number, y: number): Pt => ({x, y});

export const CALC_BPC_EN: CalcVideoConfig = {
  id: 'CalcBpcEN',
  flag: 'us',
  voFile: 'calc-vo-en.mp3',
  dir: 'calc-bpc',
  swaps: [
    {t: 0, i: 0}, {t: 3.7, i: 1}, {t: 5.2, i: 2},
    {t: 6.8, i: 3}, {t: 7.2, i: 4}, {t: 7.7, i: 5}, {t: 8.2, i: 6}, {t: 8.5, i: 7},
    {t: 9.15, i: 8}, {t: 9.7, i: 9},
    {t: 14.85, i: 10}, {t: 15.35, i: 11},
    {t: 17.7, i: 12}, {t: 18.0, i: 13}, {t: 18.7, i: 14},
    {t: 20.9, i: 15}, {t: 22.15, i: 16},
    {t: 24.55, i: 17}, {t: 25.25, i: 18},
    {t: 29.2, i: 19}, {t: 30.0, i: 20},
  ],
  way: [
    {t: 0.0, at: P(900, 1550)},
    {t: 1.6, at: P(760, 1250)},
    {t: 3.4, at: 'home_open'},
    {t: 3.55, at: 'home_open', click: true},
    {t: 5.0, at: 's1_input'},
    {t: 5.1, at: 's1_input', click: true},
    {t: 8.9, at: 's1_option'},
    {t: 9.05, at: 's1_option', click: true},
    {t: 9.5, at: 's1_continue'},
    {t: 9.6, at: 's1_continue', click: true},
    {t: 11.5, at: P(480, 640)},
    {t: 13.2, at: P(480, 860)},
    {t: 14.7, at: 's2_powder'},
    {t: 14.8, at: 's2_powder', click: true},
    {t: 15.2, at: 's2_continue'},
    {t: 15.3, at: 's2_continue', click: true},
    {t: 16.2, at: 's3_input'},
    {t: 16.3, at: 's3_input', click: true},
    {t: 18.5, at: 's3_continue'},
    {t: 18.6, at: 's3_continue', click: true},
    {t: 19.5, at: 's4_input'},
    {t: 19.6, at: 's4_input', click: true},
    {t: 21.9, at: 's4_continue'},
    {t: 22.05, at: 's4_continue', click: true},
    {t: 24.4, at: 's5_syringe'},
    {t: 24.5, at: 's5_syringe', click: true},
    {t: 25.1, at: 's5_continue'},
    {t: 25.15, at: 's5_continue', click: true},
    {t: 26.6, at: 's6_input'},
    {t: 26.7, at: 's6_input', click: true},
    {t: 29.8, at: 's6_calc'},
    {t: 29.9, at: 's6_calc', click: true},
    {t: 31.5, at: P(900, 1600)},
  ],
  caps: [
    {from: 0.05, to: 2.13, text: 'YOUR COMPOUND RESEARCH'},
    {from: 2.13, to: 4.26, text: '1. OPEN THE CALCULATOR'},
    {from: 4.26, to: 9.66, text: '2. CHOOSE THE COMPOUND'},
    {from: 9.66, to: 15.42, text: '3. POWDER OR LIQUID?'},
    {from: 15.42, to: 18.91, text: '4. VIAL: 10 MG'},
    {from: 18.91, to: 22.29, text: '5. WATER: 2 ML'},
    {from: 22.29, to: 25.52, text: '6. SYRINGE: 1 ML'},
    {from: 25.52, to: 30.16, text: '7. DOSE: 1 MG'},
    {from: 30.16, to: 32.5, text: 'THE MATH: 20 UNITS', hot: true},
  ],
  resultAt: 30.0,
  endAt: 32.5,
  endBeats: [
    {at: 32.5, text: 'WANT YOUR COMPOUND NEXT?'},
    {at: 34.0, text: 'DM US THE COMPOUND', hot: true},
    {at: 38.35, text: 'FOLLOW US TO LEARN MORE'},
  ],
  subBeat: {at: 36.0, text: 'WE MAKE YOUR VIDEO'},
  followAt: 38.35,
  seriesChip: 'CALCULATOR GUIDE',
  disclaimer: 'Educational tool. Not medical advice. For research purposes only.',
  durationSec: 44,
};

export const CALC_BPC_PT: CalcVideoConfig = {
  id: 'CalcBpcPT',
  flag: 'br',
  voFile: 'calc-vo-pt.mp3',
  dir: 'calc-bpc-pt',
  swaps: [{t: 0.1, i: 0}, {t: 4.6, i: 1}, {t: 6.08, i: 2}, {t: 7.64, i: 3}, {t: 8.02, i: 4}, {t: 8.5, i: 5}, {t: 8.98, i: 6}, {t: 9.27, i: 7}, {t: 9.9, i: 8}, {t: 10.43, i: 9}, {t: 15.51, i: 10}, {t: 16.11, i: 11}, {t: 18.44, i: 12}, {t: 18.76, i: 13}, {t: 19.52, i: 14}, {t: 21.73, i: 15}, {t: 23.15, i: 16}, {t: 25.55, i: 17}, {t: 26.26, i: 18}, {t: 30.45, i: 19}, {t: 31.37, i: 20}],
  way: [
    {t: 0.1, at: P(900, 1550)},
    {t: 2.27, at: P(760, 1250)},
    {t: 4.3, at: 'home_open'},
    {t: 4.45, at: 'home_open', click: true},
    {t: 5.89, at: 's1_input'},
    {t: 5.99, at: 's1_input', click: true},
    {t: 9.66, at: 's1_option'},
    {t: 9.8, at: 's1_option', click: true},
    {t: 10.24, at: 's1_continue'},
    {t: 10.33, at: 's1_continue', click: true},
    {t: 12.15, at: P(480, 640)},
    {t: 13.78, at: P(480, 860)},
    {t: 15.34, at: 's2_powder'},
    {t: 15.46, at: 's2_powder', click: true},
    {t: 15.93, at: 's2_continue'},
    {t: 16.05, at: 's2_continue', click: true},
    {t: 16.96, at: 's3_input'},
    {t: 17.05, at: 's3_input', click: true},
    {t: 19.31, at: 's3_continue'},
    {t: 19.41, at: 's3_continue', click: true},
    {t: 20.31, at: 's4_input'},
    {t: 20.41, at: 's4_input', click: true},
    {t: 22.87, at: 's4_continue'},
    {t: 23.04, at: 's4_continue', click: true},
    {t: 25.39, at: 's5_syringe'},
    {t: 25.5, at: 's5_syringe', click: true},
    {t: 26.11, at: 's5_continue'},
    {t: 26.16, at: 's5_continue', click: true},
    {t: 27.67, at: 's6_input'},
    {t: 27.77, at: 's6_input', click: true},
    {t: 31.14, at: 's6_calc'},
    {t: 31.25, at: 's6_calc', click: true},
    {t: 32.92, at: P(900, 1600)},
  ],
  caps: [
    {from: 0.1, to: 3.01, text: 'PESQUISA DO COMPOSTO'},
    {from: 3.01, to: 5.17, text: '1. ABRA A CALCULADORA'},
    {from: 5.17, to: 10.39, text: '2. ESCOLHA O COMPOSTO'},
    {from: 10.39, to: 16.19, text: '3. PÓ OU LÍQUIDO?'},
    {from: 16.19, to: 19.75, text: '4. FRASCO: 10 MG'},
    {from: 19.75, to: 23.31, text: '5. ÁGUA: 2 ML'},
    {from: 23.31, to: 26.54, text: '6. SERINGA: 1 ML'},
    {from: 26.54, to: 31.55, text: '7. DOSE: 1 MG'},
    {from: 31.55, to: 34.04, text: 'A CONTA: 20 UNIDADES', hot: true},
  ],
  resultAt: 31.37,
  endAt: 34.04,
  endBeats: [
    {at: 34.04, text: 'QUER O SEU COMPOSTO?'},
    {at: 35.75, text: 'MANDE UMA DM COM O COMPOSTO', hot: true},
    {at: 40.0, text: 'SIGA PARA SABER MAIS'},
  ],
  subBeat: {at: 37.7, text: 'A GENTE FAZ O SEU VÍDEO'},
  followAt: 40.0,
  seriesChip: 'GUIA DA CALCULADORA',
  disclaimer: 'Ferramenta educacional. Não é orientação médica. Somente para fins de pesquisa.',
  durationSec: 47,
};

export const CALC_BPC_ES: CalcVideoConfig = {
  id: 'CalcBpcES',
  flag: 'mx',
  voFile: 'calc-vo-es.mp3',
  dir: 'calc-bpc-es',
  swaps: [{t: 0.1, i: 0}, {t: 5.29, i: 1}, {t: 7.12, i: 2}, {t: 9.01, i: 3}, {t: 9.42, i: 4}, {t: 9.93, i: 5}, {t: 10.44, i: 6}, {t: 10.75, i: 7}, {t: 11.42, i: 8}, {t: 11.98, i: 9}, {t: 17.64, i: 10}, {t: 18.52, i: 11}, {t: 21.25, i: 12}, {t: 21.66, i: 13}, {t: 22.63, i: 14}, {t: 25.62, i: 15}, {t: 27.32, i: 16}, {t: 30.67, i: 17}, {t: 31.71, i: 18}, {t: 36.64, i: 19}, {t: 37.81, i: 20}],
  way: [
    {t: 0.1, at: P(900, 1550)},
    {t: 2.56, at: P(760, 1250)},
    {t: 4.93, at: 'home_open'},
    {t: 5.11, at: 'home_open', click: true},
    {t: 6.87, at: 's1_input'},
    {t: 6.99, at: 's1_input', click: true},
    {t: 11.16, at: 's1_option'},
    {t: 11.31, at: 's1_option', click: true},
    {t: 11.78, at: 's1_continue'},
    {t: 11.88, at: 's1_continue', click: true},
    {t: 13.78, at: P(480, 640)},
    {t: 15.49, at: P(480, 860)},
    {t: 17.38, at: 's2_powder'},
    {t: 17.55, at: 's2_powder', click: true},
    {t: 18.25, at: 's2_continue'},
    {t: 18.43, at: 's2_continue', click: true},
    {t: 19.52, at: 's3_input'},
    {t: 19.63, at: 's3_input', click: true},
    {t: 22.35, at: 's3_continue'},
    {t: 22.49, at: 's3_continue', click: true},
    {t: 23.72, at: 's4_input'},
    {t: 23.85, at: 's4_input', click: true},
    {t: 26.98, at: 's4_continue'},
    {t: 27.18, at: 's4_continue', click: true},
    {t: 30.44, at: 's5_syringe'},
    {t: 30.59, at: 's5_syringe', click: true},
    {t: 31.49, at: 's5_continue'},
    {t: 31.56, at: 's5_continue', click: true},
    {t: 33.39, at: 's6_input'},
    {t: 33.51, at: 's6_input', click: true},
    {t: 37.51, at: 's6_calc'},
    {t: 37.66, at: 's6_calc', click: true},
    {t: 39.94, at: P(900, 1600)},
  ],
  caps: [
    {from: 0.1, to: 3.4, text: 'INVESTIGA TU COMPUESTO'},
    {from: 3.4, to: 5.96, text: '1. ABRE LA CALCULADORA'},
    {from: 5.96, to: 11.94, text: '2. ELIGE EL COMPUESTO'},
    {from: 11.94, to: 18.64, text: '3. ¿POLVO O LÍQUIDO?'},
    {from: 18.64, to: 22.92, text: '4. VIAL: 10 MG'},
    {from: 22.92, to: 27.51, text: '5. AGUA: 2 ML'},
    {from: 27.51, to: 32.12, text: '6. JERINGA: 1 ML'},
    {from: 32.12, to: 38.04, text: '7. DOSIS: 1 MG'},
    {from: 38.04, to: 41.36, text: 'LA CUENTA: 20 UNIDADES', hot: true},
  ],
  resultAt: 37.81,
  endAt: 41.36,
  endBeats: [
    {at: 41.36, text: '¿QUIERES TU COMPUESTO?'},
    {at: 43.63, text: 'ENVÍANOS UN DM CON EL COMPUESTO', hot: true},
    {at: 48.07, text: 'SÍGUENOS PARA SABER MÁS'},
  ],
  subBeat: {at: 45.67, text: 'HACEMOS TU VIDEO'},
  followAt: 48.07,
  seriesChip: 'GUÍA DE LA CALCULADORA',
  disclaimer: 'Herramienta educativa. No es consejo médico. Solo con fines de investigación.',
  durationSec: 55,
};
