import React from 'react';
import {
  AbsoluteFill,
  Audio,
  Img,
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
type Span = {from: number; to: number};

type S2Day10Config = {
  id: string;
  flag: 'us' | 'mx' | 'br';
  voFile: string;
  vialImg: string;
  cues: Cue[];
  clips: ClipCfg[];
  recap: Span & {tags: string[]};
  vialQ: Span & {chip: string};
  stamp: Span & {text: string};
  clocks: Span & {micro: string; chem: string};
  seven: Span & {chips: string[]; chipAt: number[]};
  bubbles: Span & {items: string[]; xAt: number[]};
  verdict: Span & {line2At: number; line1: string; line2: string};
  bridge: Span & {series: string; title: string; chips: string[]; chipAt: number[]};
  endFrom: number;
  dayChip: {from: number; label: string};
  seriesChip: string;
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

const ClockFace: React.FC<{R: number; color: string; speed: number; lit?: number}> = ({R, color, speed, lit = 1}) => {
  const frame = useCurrentFrame();
  const a = 40 + frame * speed;
  return (
    <svg width={R * 2} height={R * 2} style={{opacity: 0.25 + lit * 0.75}}>
      <circle cx={R} cy={R} r={R - 5} fill="none" stroke={color} strokeWidth={Math.max(4, R * 0.03)} style={{filter: `drop-shadow(0 0 ${R * 0.08 * lit}px ${color})`}} />
      {Array.from({length: 12}).map((_, i) => {
        const t = (i / 12) * Math.PI * 2;
        return <line key={i} x1={R + Math.sin(t) * (R - 10)} y1={R - Math.cos(t) * (R - 10)} x2={R + Math.sin(t) * (R - 10 - R * 0.14)} y2={R - Math.cos(t) * (R - 10 - R * 0.14)} stroke={color} strokeWidth={i % 3 === 0 ? 5 : 2.5} />;
      })}
      <line x1={R} y1={R} x2={R + Math.sin((a * Math.PI) / 180) * R * 0.7} y2={R - Math.cos((a * Math.PI) / 180) * R * 0.7} stroke={color} strokeWidth={Math.max(4, R * 0.05)} strokeLinecap="round" />
      <circle cx={R} cy={R} r={Math.max(5, R * 0.07)} fill={color} />
    </svg>
  );
};

const Vial: React.FC<{h: number; img: string}> = ({h, img}) => (
  <Img src={staticFile(img)} style={{height: h, WebkitMaskImage: 'linear-gradient(to right, transparent 0%, black 14%, black 86%, transparent 100%)'}} />
);

// Beat 1: nine clocks light up in sequence, one per day.
const Recap: React.FC<{tags: string[]}> = ({tags}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const q = spring({frame: frame - 45, fps, config: {damping: 10, stiffness: 200}});
  return (
    <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20}}>
      <div style={{display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '26px 44px'}}>
        {tags.map((t, i) => {
          const lit = interpolate(frame, [i * 5, i * 5 + 8], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
          return (
            <div key={i} style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6}}>
              <ClockFace R={76} color={i % 2 ? TEAL : CYAN} speed={1.5 + i * 0.5} lit={lit} />
              <div style={{fontFamily: anton.fontFamily, fontSize: 34, letterSpacing: 2, color: WHITE, opacity: lit}}>{t}</div>
            </div>
          );
        })}
      </div>
      <div style={{fontFamily: anton.fontFamily, fontSize: 170, color: AMBER, opacity: q, transform: `scale(${interpolate(q, [0, 1], [0.5, 1])})`}}>?</div>
    </div>
  );
};

const VialQ: React.FC<{chip: string; img: string}> = ({chip, img}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const s = spring({frame, fps, config: {damping: 13, stiffness: 150}});
  return (
    <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 34, opacity: s}}>
      <Vial h={640} img={img} />
      <div style={{background: TEAL_DEEP, border: `5px solid ${TEAL}`, borderRadius: 30, padding: '24px 48px', fontFamily: anton.fontFamily, fontSize: 52, letterSpacing: 2, color: WHITE, textAlign: 'center', maxWidth: 940, boxShadow: '0 0 90px rgba(42,182,201,0.35)'}}>{chip}</div>
    </div>
  );
};

const Stamp: React.FC<{text: string; img: string}> = ({text, img}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const st = spring({frame: frame - 6, fps, config: {damping: 9, stiffness: 240}});
  const fontSize = text.length > 20 ? 50 : 70;
  return (
    <div style={{position: 'relative', display: 'flex', justifyContent: 'center', width: 960}}>
      <Vial h={640} img={img} />
      <div style={{position: 'absolute', top: 250, opacity: st, transform: `rotate(-9deg) scale(${interpolate(st, [0, 1], [2, 1])})`, border: `9px solid ${AMBER}`, borderRadius: 18, padding: '18px 40px', background: 'rgba(26,18,6,0.88)', fontFamily: anton.fontFamily, fontSize, letterSpacing: 3, color: AMBER, textAlign: 'center', maxWidth: 900}}>{text}</div>
    </div>
  );
};

const Clocks: React.FC<{micro: string; chem: string}> = ({micro, chem}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const s = spring({frame, fps, config: {damping: 13, stiffness: 150}});
  const col = (label: string, color: string, speed: number) => (
    <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 22}}>
      <ClockFace R={210} color={color} speed={speed} />
      <div style={{border: `4px solid ${color}`, borderRadius: 999, padding: '12px 38px', fontFamily: anton.fontFamily, fontSize: 46, letterSpacing: 3, color}}>{label}</div>
    </div>
  );
  return (
    <div style={{display: 'flex', gap: 44, opacity: s, transform: `scale(${interpolate(s, [0, 1], [0.85, 1])})`}}>
      {col(micro, CYAN, 3.4)}
      {col(chem, TEAL, 2)}
    </div>
  );
};

// Beat 5: seven chips lock around the chemistry clock; every lock changes its speed.
const Seven: React.FC<{chips: string[]; chipAt: number[]}> = ({chips, chipAt}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const locked = chipAt.filter((t) => frame >= t).length;
  const speed = [1.5, 3.5, 1.2, 5, 2, 6.5, 1, 4][locked] ?? 3;
  const W = 980;
  const H = 900;
  return (
    <div style={{position: 'relative', width: W, height: H}}>
      <div style={{position: 'absolute', left: W / 2 - 190, top: H / 2 - 190}}>
        <ClockFace R={190} color={TEAL} speed={speed} />
      </div>
      {chips.map((t, i) => {
        const s = spring({frame: frame - chipAt[i], fps, config: {damping: 11, stiffness: 200}});
        const a = (i / chips.length) * Math.PI * 2 - Math.PI / 2;
        const x = W / 2 + Math.cos(a) * 335;
        const y = H / 2 + Math.sin(a) * 350;
        return <div key={i} style={{position: 'absolute', left: x, top: y, transform: `translate(-50%,-50%) scale(${interpolate(s, [0, 1], [0.3, 1])})`, opacity: s, background: '#0a1218', border: `4px solid ${AMBER}`, borderRadius: 999, padding: '10px 26px', fontFamily: anton.fontFamily, fontSize: 36, letterSpacing: 2, color: WHITE, whiteSpace: 'nowrap', boxShadow: '0 0 30px rgba(245,158,11,0.35)'}}>{t}</div>;
      })}
    </div>
  );
};

// Beat 6: friend, forum, video bubbles each get an X.
const Bubbles: React.FC<{items: string[]; xAt: number[]}> = ({items, xAt}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  return (
    <div style={{display: 'flex', flexDirection: 'column', gap: 40, alignItems: 'center'}}>
      {items.map((t, i) => {
        const s = spring({frame: frame - i * 10, fps, config: {damping: 12, stiffness: 170}});
        const x = spring({frame: frame - xAt[i], fps, config: {damping: 9, stiffness: 240}});
        return (
          <div key={i} style={{position: 'relative', opacity: s, transform: `translateX(${interpolate(s, [0, 1], [i % 2 ? 200 : -200, 0])}px)`}}>
            <div style={{background: '#0a1218', border: `5px solid ${CYAN}`, borderRadius: 40, padding: '26px 70px', fontFamily: anton.fontFamily, fontSize: 64, letterSpacing: 3, color: WHITE}}>{t}</div>
            <svg width={560} height={120} style={{position: 'absolute', left: 0, top: 0, width: '100%', height: '100%', opacity: x, transform: `scale(${interpolate(x, [0, 1], [1.6, 1])})`}} viewBox="0 0 560 120" preserveAspectRatio="none">
              <line x1={40} y1={12} x2={520} y2={108} stroke={AMBER} strokeWidth={14} strokeLinecap="round" />
              <line x1={520} y1={12} x2={40} y2={108} stroke={AMBER} strokeWidth={14} strokeLinecap="round" />
            </svg>
          </div>
        );
      })}
    </div>
  );
};

const Verdict: React.FC<{line2At: number; line1: string; line2: string}> = ({line2At, line1, line2}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const s = spring({frame, fps, config: {damping: 11, stiffness: 190}});
  const l2 = spring({frame: frame - line2At, fps, config: {damping: 11, stiffness: 190}});
  return (
    <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 30}}>
      <div style={{opacity: s, transform: `scale(${interpolate(s, [0, 1], [0.6, 1])})`, background: TEAL_DEEP, border: `5px solid ${TEAL}`, borderRadius: 30, padding: '30px 56px', fontFamily: anton.fontFamily, fontSize: 82, color: WHITE, textAlign: 'center', maxWidth: 980, boxShadow: '0 0 90px rgba(42,182,201,0.45)'}}>{line1}</div>
      <div style={{opacity: l2, transform: `scale(${interpolate(l2, [0, 1], [0.7, 1])})`, background: '#1a1206', border: `5px solid ${AMBER}`, borderRadius: 30, padding: '22px 56px', fontFamily: anton.fontFamily, fontSize: 76, color: AMBER, textAlign: 'center', maxWidth: 980}}>{line2}</div>
    </div>
  );
};

// Beat 8: Series 3 bridge. Light blooms from the vial and four topics fly out.
const Bridge: React.FC<{series: string; title: string; chips: string[]; chipAt: number[]; img: string}> = ({series, title, chips, chipAt, img}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const s = spring({frame, fps, config: {damping: 13, stiffness: 140}});
  const bloom = interpolate(frame, [10, 60], [0.2, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const W = 980;
  const H = 860;
  const pos = [
    {x: 150, y: 150},
    {x: 830, y: 150},
    {x: 150, y: 700},
    {x: 830, y: 700},
  ];
  return (
    <div style={{position: 'relative', width: W, height: H, opacity: s}}>
      <div style={{position: 'absolute', left: W / 2 - 300, top: H / 2 - 300, width: 600, height: 600, borderRadius: 999, background: `radial-gradient(closest-side, rgba(42,182,201,${0.55 * bloom}), transparent)`}} />
      <div style={{position: 'absolute', left: 0, right: 0, top: 110, display: 'flex', justifyContent: 'center'}}>
        <Vial h={560} img={img} />
      </div>
      <div style={{position: 'absolute', left: 0, right: 0, top: -10, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6}}>
        <div style={{border: `3px solid ${AMBER}`, borderRadius: 999, padding: '6px 30px', fontFamily: anton.fontFamily, fontSize: 34, letterSpacing: 4, color: AMBER}}>{series}</div>
      </div>
      {chips.map((t, i) => {
        const c = spring({frame: frame - chipAt[i], fps, config: {damping: 11, stiffness: 200}});
        const p = pos[i];
        return <div key={i} style={{position: 'absolute', left: interpolate(c, [0, 1], [W / 2, p.x]), top: interpolate(c, [0, 1], [H / 2, p.y]), transform: 'translate(-50%,-50%)', opacity: c, background: '#0a1218', border: `4px solid ${TEAL}`, borderRadius: 999, padding: '12px 30px', fontFamily: anton.fontFamily, fontSize: 40, letterSpacing: 2, color: TEAL, whiteSpace: 'nowrap', boxShadow: '0 0 30px rgba(42,182,201,0.45)'}}>{t}</div>;
      })}
      <div style={{position: 'absolute', left: 0, right: 0, bottom: 0, textAlign: 'center', fontFamily: anton.fontFamily, fontSize: 84, color: WHITE, textShadow: '0 6px 40px rgba(0,0,0,0.8)'}}>{title}</div>
    </div>
  );
};

export const S2Day10: React.FC<{locale: S2Day10Config}> = ({locale}) => {
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

      <Sequence {...span(L.recap)}>
        <AbsoluteFill style={{alignItems: 'center', paddingTop: 570}}>
          <Recap tags={L.recap.tags} />
        </AbsoluteFill>
      </Sequence>

      <Sequence {...span(L.vialQ)}>
        <AbsoluteFill style={{alignItems: 'center', paddingTop: 600}}>
          <VialQ chip={L.vialQ.chip} img={L.vialImg} />
        </AbsoluteFill>
      </Sequence>

      <Sequence {...span(L.stamp)}>
        <AbsoluteFill style={{alignItems: 'center', paddingTop: 600}}>
          <Stamp text={L.stamp.text} img={L.vialImg} />
        </AbsoluteFill>
      </Sequence>

      <Sequence {...span(L.clocks)}>
        <AbsoluteFill style={{alignItems: 'center', paddingTop: 720}}>
          <Clocks micro={L.clocks.micro} chem={L.clocks.chem} />
        </AbsoluteFill>
      </Sequence>

      <Sequence {...span(L.seven)}>
        <AbsoluteFill style={{alignItems: 'center', paddingTop: 590}}>
          <Seven chips={L.seven.chips} chipAt={L.seven.chipAt.map((t) => rel(t, L.seven))} />
        </AbsoluteFill>
      </Sequence>

      <Sequence {...span(L.bubbles)}>
        <AbsoluteFill style={{alignItems: 'center', paddingTop: 680}}>
          <Bubbles items={L.bubbles.items} xAt={L.bubbles.xAt.map((t) => rel(t, L.bubbles))} />
        </AbsoluteFill>
      </Sequence>

      <Sequence {...span(L.verdict)}>
        <AbsoluteFill style={{alignItems: 'center', paddingTop: 730}}>
          <Verdict line2At={rel(L.verdict.line2At, L.verdict)} line1={L.verdict.line1} line2={L.verdict.line2} />
        </AbsoluteFill>
      </Sequence>

      <Sequence {...span(L.bridge)}>
        <AbsoluteFill style={{alignItems: 'center', paddingTop: 600}}>
          <Bridge series={L.bridge.series} title={L.bridge.title} chips={L.bridge.chips} chipAt={L.bridge.chipAt.map((t) => rel(t, L.bridge))} img={L.vialImg} />
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
          <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center', gap: 36}}>
            <div style={{display: 'flex', gap: 24, alignItems: 'center', opacity: interpolate(frame, [sec(L.dayChip.from), sec(L.dayChip.from + 0.5)], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})}}>
              <div style={{border: `3px solid ${TEAL}`, borderRadius: 999, padding: '18px 48px', fontFamily: anton.fontFamily, fontSize: 54, color: TEAL, letterSpacing: 2}}>{L.dayChip.label}</div>
              <div style={{background: TEAL_DEEP, borderRadius: 999, padding: '18px 40px', fontFamily: anton.fontFamily, fontSize: 40, color: WHITE, letterSpacing: 2}}>{L.seriesChip}</div>
            </div>
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

export const S2DAY10_EN: S2Day10Config = {
  id: 'S2Day10EN',
  flag: 'us',
  voFile: 's2-d10-vo-en.mp3',
  vialImg: 'vial-liquid-peptide-en.png',
  cues: [
    {from: 0.05, to: 1.04, lines: ['NINE DAYS.']},
    {from: 1.04, to: 2.08, lines: ['ONE QUESTION.'], teal: 1},
    {from: 2.08, to: 6.99, lines: ['HOW LONG DOES IT LAST', 'AFTER THE WATER?']},
    {from: 6.99, to: 8.55, lines: ['THE HONEST', 'ANSWER.'], teal: 1},
    {from: 8.55, to: 11.13, lines: ['NO UNIVERSAL', 'PEPTIDE CLOCK.'], teal: 1},
    {from: 11.13, to: 15.68, lines: ['TWO CLOCKS:', 'MICRO AND CHEMISTRY.']},
    {from: 15.68, to: 24.44, lines: ['SEVEN THINGS', 'MOVE THE CLOCK.'], teal: 1},
    {from: 24.44, to: 26.88, lines: ['CHANGE ONE,', 'THE CLOCK CHANGES.']},
    {from: 26.88, to: 32.47, lines: ['NOT A RULE', 'FOR YOUR VIAL.'], teal: 1},
    {from: 32.47, to: 35.94, lines: ['THE EXACT PRODUCT’S', 'LABEL WINS.']},
    {from: 35.94, to: 39.47, lines: ['NEVER ONE', 'MAGIC NUMBER.'], teal: 1},
    {from: 39.47, to: 41.45, lines: ['NEXT:', 'INSIDE THE VIAL.'], teal: 1},
    {from: 41.45, to: 47.43, lines: ['WHAT IT IS. HOW MADE.', 'HOW PURE. WHICH CHAINS.']},
    {from: 47.43, to: 51.28, lines: ['DAY 10 OF 10.', 'THE MATH DOESN’T LIE.'], teal: 1},
  ],
  clips: [{src: 's2-clip4.mp4', from: 47.43, dur: 3.85}],
  recap: {from: 0, to: 2.08, tags: ['START', 'TWO', '28', 'WATER', 'TEMP', 'LIGHT', 'SWIRL', 'CLEAR', 'LABEL']},
  vialQ: {from: 2.08, to: 8.55, chip: 'HOW LONG AFTER THE WATER GOES IN?'},
  stamp: {from: 8.55, to: 11.13, text: 'NO UNIVERSAL CLOCK'},
  clocks: {from: 11.13, to: 15.68, micro: 'MICROBIOLOGY', chem: 'CHEMISTRY'},
  seven: {from: 15.68, to: 26.88, chips: ['MOLECULE', 'FORMULATION', 'TEMPERATURE', 'LIGHT', 'CONTAINER', 'HANDLING', 'TIME'], chipAt: [17.4, 18.4, 19.5, 20.7, 21.8, 22.9, 24.0]},
  bubbles: {from: 26.88, to: 32.47, items: ['A FRIEND', 'A FORUM', 'A VIDEO'], xAt: [29.2, 30.2, 31.2]},
  verdict: {from: 32.47, to: 39.47, line2At: 35.94, line1: 'THE EXACT PRODUCT’S LABEL WINS.', line2: 'NEVER ONE MAGIC NUMBER.'},
  bridge: {from: 39.47, to: 47.43, series: 'SERIES 3', title: 'INSIDE THE VIAL', chips: ['WHAT IT IS', 'HOW IT’S MADE', 'HOW PURE', 'WHICH CHAINS'], chipAt: [41.5, 43.2, 44.8, 46.2]},
  endFrom: 51.28,
  dayChip: {from: 51.28, label: 'DAY 10 OF 10'},
  seriesChip: 'SERIES 2 COMPLETE',
  disclaimer: 'Educational tool. Not medical advice. For research purposes only.',
  durationSec: 57,
};

export const S2DAY10_PT: S2Day10Config = {
  id: 'S2Day10PT',
  flag: 'br',
  voFile: 's2-d10-vo-pt.mp3',
  vialImg: 'vial-liquid-peptide-pt.png',
  cues: [
    {from: 0.05, to: 1.2, lines: ['NOVE DIAS.']},
    {from: 1.2, to: 2.3, lines: ['UMA PERGUNTA.'], teal: 1},
    {from: 2.3, to: 8.95, lines: ['QUANTO DURA APÓS', 'A ÁGUA ENTRAR?']},
    {from: 8.95, to: 11.78, lines: ['NENHUM RELÓGIO', 'UNIVERSAL.'], teal: 1},
    {from: 11.78, to: 16.09, lines: ['DOIS RELÓGIOS:', 'MICRO E QUÍMICA.']},
    {from: 16.09, to: 25.88, lines: ['SETE COISAS', 'MOVEM O RELÓGIO.'], teal: 1},
    {from: 25.88, to: 31.16, lines: ['MUDE UM,', 'O RELÓGIO MUDA.']},
    {from: 31.16, to: 35.02, lines: ['NÃO É REGRA', 'PARA SEU FRASCO.'], teal: 1},
    {from: 35.02, to: 38.89, lines: ['O RÓTULO DO PRODUTO', 'EXATO VENCE.']},
    {from: 38.89, to: 40.94, lines: ['NUNCA UM NÚMERO', 'MÁGICO.'], teal: 1},
    {from: 40.94, to: 46.83, lines: ['A SEGUIR:', 'DENTRO DO FRASCO.'], teal: 1},
    {from: 46.83, to: 50.87, lines: ['DIA 10 DE 10.', 'A MATEMÁTICA NÃO MENTE.'], teal: 1},
  ],
  clips: [{src: 's2-clip4.mp4', from: 46.83, dur: 4.04}],
  recap: {from: 0, to: 2.3, tags: ['INÍCIO', 'DOIS', '28', 'ÁGUA', 'TEMP', 'LUZ', 'GIRO', 'CLARO', 'RÓTULO']},
  vialQ: {from: 2.3, to: 8.95, chip: 'QUANTO DURA APÓS A ÁGUA ENTRAR?'},
  stamp: {from: 8.95, to: 11.78, text: 'NENHUM RELÓGIO UNIVERSAL'},
  clocks: {from: 11.78, to: 16.09, micro: 'MICROBIOLOGIA', chem: 'QUÍMICA'},
  seven: {from: 16.09, to: 31.16, chips: ['MOLÉCULA', 'FORMULAÇÃO', 'TEMPERATURA', 'LUZ', 'RECIPIENTE', 'MANUSEIO', 'TEMPO'], chipAt: [17.9, 19.1, 20.3, 21.6, 22.8, 24.0, 25.2]},
  bubbles: {from: 31.16, to: 35.02, items: ['UM AMIGO', 'UM FÓRUM', 'UM VÍDEO'], xAt: [32.6, 33.4, 34.2]},
  verdict: {from: 35.02, to: 40.94, line2At: 38.89, line1: 'O RÓTULO DO PRODUTO EXATO VENCE.', line2: 'NUNCA UM NÚMERO MÁGICO.'},
  bridge: {from: 40.94, to: 46.83, series: 'SÉRIE 3', title: 'DENTRO DO FRASCO', chips: ['O QUE É', 'COMO É FEITO', 'QUÃO PURO', 'QUAIS CADEIAS'], chipAt: [42.5, 43.8, 45.1, 46.2]},
  endFrom: 50.87,
  dayChip: {from: 50.87, label: 'DIA 10 DE 10'},
  seriesChip: 'SÉRIE 2 COMPLETA',
  disclaimer: 'Ferramenta educacional. Não é orientação médica. Somente para fins de pesquisa.',
  durationSec: 56,
};

export const S2DAY10_ES: S2Day10Config = {
  id: 'S2Day10ES',
  flag: 'mx',
  voFile: 's2-d10-vo-es.mp3',
  vialImg: 'vial-liquid-peptide-es.png',
  cues: [
    {from: 0.05, to: 1.82, lines: ['NUEVE DÍAS.']},
    {from: 1.82, to: 3.58, lines: ['UNA PREGUNTA.'], teal: 1},
    {from: 3.58, to: 11.73, lines: ['¿CUÁNTO DURA TRAS', 'ENTRAR EL AGUA?']},
    {from: 11.73, to: 15.06, lines: ['NINGÚN RELOJ', 'UNIVERSAL.'], teal: 1},
    {from: 15.06, to: 20.1, lines: ['DOS RELOJES:', 'MICRO Y QUÍMICA.']},
    {from: 20.1, to: 32.3, lines: ['SIETE COSAS', 'MUEVEN EL RELOJ.'], teal: 1},
    {from: 32.3, to: 38.49, lines: ['CAMBIA UNO,', 'EL RELOJ CAMBIA.']},
    {from: 38.49, to: 42.88, lines: ['NO ES REGLA', 'PARA TU VIAL.'], teal: 1},
    {from: 42.88, to: 47.34, lines: ['LA ETIQUETA DEL PRODUCTO', 'EXACTO GANA.']},
    {from: 47.34, to: 49.95, lines: ['NUNCA UN NÚMERO', 'MÁGICO.'], teal: 1},
    {from: 49.95, to: 57.01, lines: ['SIGUE:', 'DENTRO DEL VIAL.'], teal: 1},
    {from: 57.01, to: 62.6, lines: ['DÍA 10 DE 10.', 'LAS CUENTAS NO MIENTEN.'], teal: 1},
  ],
  clips: [{src: 's2-clip4.mp4', from: 57.01, dur: 5.59}],
  recap: {from: 0, to: 3.58, tags: ['INICIO', 'DOS', '28', 'AGUA', 'TEMP', 'LUZ', 'GIRO', 'CLARO', 'ETIQUETA']},
  vialQ: {from: 3.58, to: 11.73, chip: '¿CUÁNTO DURA TRAS ENTRAR EL AGUA?'},
  stamp: {from: 11.73, to: 15.06, text: 'NINGÚN RELOJ UNIVERSAL'},
  clocks: {from: 15.06, to: 20.1, micro: 'MICROBIOLOGÍA', chem: 'QUÍMICA'},
  seven: {from: 20.1, to: 38.49, chips: ['MOLÉCULA', 'FORMULACIÓN', 'TEMPERATURA', 'LUZ', 'ENVASE', 'MANEJO', 'TIEMPO'], chipAt: [22.2, 23.8, 25.4, 27.0, 28.6, 30.2, 31.8]},
  bubbles: {from: 38.49, to: 42.88, items: ['UN AMIGO', 'UN FORO', 'UN VIDEO'], xAt: [40.1, 40.9, 41.7]},
  verdict: {from: 42.88, to: 49.95, line2At: 47.34, line1: 'LA ETIQUETA DEL PRODUCTO EXACTO GANA.', line2: 'NUNCA UN NÚMERO MÁGICO.'},
  bridge: {from: 49.95, to: 57.01, series: 'SERIE 3', title: 'DENTRO DEL VIAL', chips: ['QUÉ ES', 'CÓMO SE HACE', 'QUÉ TAN PURO', 'QUÉ CADENAS'], chipAt: [51.7, 53.2, 54.7, 55.9]},
  endFrom: 62.6,
  dayChip: {from: 62.6, label: 'DÍA 10 DE 10'},
  seriesChip: 'SERIE 2 COMPLETA',
  disclaimer: 'Herramienta educativa. No es consejo médico. Solo con fines de investigación.',
  durationSec: 68,
};
