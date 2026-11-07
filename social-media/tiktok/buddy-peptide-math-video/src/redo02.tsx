import React from 'react';
import {AbsoluteFill, Audio, Composition, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {loadFont as loadAnton} from '@remotion/google-fonts/Anton';
import {loadFont as loadArchivo} from '@remotion/google-fonts/Archivo';
import {BG, Buddy, FPS, Flag, Glow, Logo, TEAL, TEAL_DEEP, WHITE} from './Video';

const anton = loadAnton();
const archivo = loadArchivo();

const AMBER = '#f59e0b';
const PANEL = '#0b161b';

// Start time of each scene (from redo02/vo-en.srt, plus the 1.0 s pre-roll in redo02-vo-en.mp3).
const CUES = [1.05, 3.64, 7.30, 11.77, 17.17, 20.88, 28.88, 36.47, 40.95];
const VO_END = 47.1;
export const REDO02_DURATION = Math.ceil(VO_END + 1);

const LABELS = [
  'TWO VIALS, 5 MG EACH',
  'DIFFERENT WATER',
  'WHICH HOLDS MORE?',
  'VIAL A: 2 ML OF WATER',
  'VIAL B: 5 ML OF WATER',
  'VOLUME PER 250 MCG',
  'DIVIDE IT OUT',
  'THE RULE',
];

const clamp01 = (x: number) => Math.max(0, Math.min(1, x));
const fade = (t: number, a: number, d = 0.35) => interpolate(t, [a, a + d], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});

const Card: React.FC<{children: React.ReactNode; height?: number}> = ({children, height = 1000}) => (
  <div style={{width: 900, height, background: PANEL, border: `5px solid ${TEAL}`, borderRadius: 44, padding: 40, boxSizing: 'border-box', boxShadow: '0 0 70px rgba(42,182,201,0.28)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 30}}>
    {children}
  </div>
);

const Vial: React.FC<{fill: number; vol: number; powder: number; hi: boolean; id: string}> = ({fill, vol, powder, hi, id}) => {
  const bodyTop = 110;
  const bodyBottom = 500;
  const maxH = 370;
  const h = maxH * (vol / 5) * fill;
  const stroke = hi ? TEAL : '#4a6a75';
  return (
    <svg width={380} height={520} viewBox="0 0 380 520">
      <defs>
        <clipPath id={`clip-${id}`}>
          <rect x={70} y={bodyTop} width={240} height={bodyBottom - bodyTop} rx={34} />
        </clipPath>
      </defs>
      <rect x={120} y={40} width={140} height={74} rx={14} fill="#1b2d34" stroke={stroke} strokeWidth={6} />
      <rect x={70} y={bodyTop} width={240} height={bodyBottom - bodyTop} rx={34} fill="#05090c" stroke={stroke} strokeWidth={hi ? 10 : 6} />
      <g clipPath={`url(#clip-${id})`}>
        <rect x={70} y={bodyBottom - 4 - h} width={240} height={h + 4} fill={TEAL} opacity={0.5} />
        <ellipse cx={190} cy={bodyBottom - 18} rx={96} ry={26} fill="#e6eef1" opacity={powder} />
      </g>
      <text x={190} y={250} textAnchor="middle" fontFamily={anton.fontFamily} fontSize={84} fill={WHITE}>5 MG</text>
    </svg>
  );
};

const Pair: React.FC<{pa: number; pb: number; powder: number; hiA: boolean; hiB: boolean; labelA: string; labelB: string; labelOp: number}> = ({pa, pb, powder, hiA, hiB, labelA, labelB, labelOp}) => {
  const lab: React.CSSProperties = {fontFamily: anton.fontFamily, fontSize: 70, color: WHITE, opacity: labelOp, height: 80, textAlign: 'center', whiteSpace: 'nowrap'};
  return (
    <div style={{display: 'flex', gap: 10}}>
      <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
        <Vial id="a" fill={pa} vol={2} powder={powder * (1 - pa)} hi={hiA} />
        <div style={lab}>{labelA}</div>
      </div>
      <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
        <Vial id="b" fill={pb} vol={5} powder={powder * (1 - pb)} hi={hiB} />
        <div style={lab}>{labelB}</div>
      </div>
    </div>
  );
};

const Portions: React.FC<{t: number}> = ({t}) => {
  const grid = (row: number) => (
    <div style={{display: 'grid', gridTemplateColumns: 'repeat(10, 74px)', gap: 8}}>
      {Array.from({length: 20}).map((_, i) => (
        <div key={i} style={{height: 74, borderRadius: 14, background: TEAL, opacity: fade(t, 1.3 + i * 0.2 + row * 0.05, 0.2), display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: archivo.fontFamily, fontWeight: 700, fontSize: 30, color: '#04181c'}}>{i + 1}</div>
      ))}
    </div>
  );
  return (
    <>
      <div style={{fontFamily: archivo.fontFamily, fontWeight: 700, fontSize: 42, color: '#9fb4bc', letterSpacing: 2}}>VIAL A, 2 ML</div>
      {grid(0)}
      <div style={{fontFamily: archivo.fontFamily, fontWeight: 700, fontSize: 42, color: '#9fb4bc', letterSpacing: 2}}>VIAL B, 5 ML</div>
      {grid(1)}
    </>
  );
};

const Bar: React.FC<{label: string; math: string; ml: number; p: number}> = ({label, math, ml, p}) => {
  const W = 760;
  return (
    <div style={{opacity: p, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10}}>
      <div style={{fontFamily: archivo.fontFamily, fontWeight: 700, fontSize: 42, color: '#9fb4bc', letterSpacing: 2}}>{label}</div>
      <div style={{fontFamily: anton.fontFamily, fontSize: 56, color: WHITE, whiteSpace: 'nowrap'}}>{math}</div>
      <div style={{width: W, height: 56, borderRadius: 16, background: '#05090c', border: '4px solid #27414a', position: 'relative'}}>
        <div style={{position: 'absolute', left: 0, top: 0, bottom: 0, width: (ml / 0.3) * W * p, borderRadius: 12, background: TEAL}} />
      </div>
    </div>
  );
};

const Clock: React.FC<{frame: number}> = ({frame}) => {
  const R = 250;
  const a = (frame * 2.4 * Math.PI) / 180;
  return (
    <svg width={R * 2} height={R * 2}>
      <circle cx={R} cy={R} r={R - 6} fill="none" stroke={TEAL} strokeWidth={6} style={{filter: 'drop-shadow(0 0 22px rgba(42,182,201,0.65))'}} />
      {Array.from({length: 12}).map((_, i) => {
        const g = (i / 12) * Math.PI * 2;
        return <line key={i} x1={R + Math.sin(g) * (R - 14)} y1={R - Math.cos(g) * (R - 14)} x2={R + Math.sin(g) * (R - 34)} y2={R - Math.cos(g) * (R - 34)} stroke={TEAL} strokeWidth={i % 3 === 0 ? 8 : 3.5} />;
      })}
      <line x1={R} y1={R} x2={R + Math.sin(a) * (R - 50)} y2={R - Math.cos(a) * (R - 50)} stroke={TEAL} strokeWidth={8} strokeLinecap="round" />
      <line x1={R} y1={R} x2={R + Math.sin(a / 12) * (R - 110)} y2={R - Math.cos(a / 12) * (R - 110)} stroke="#7fe6f2" strokeWidth={11} strokeLinecap="round" />
      <circle cx={R} cy={R} r={13} fill={TEAL} />
    </svg>
  );
};

export const Redo02: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = frame / FPS;

  let scene = 0;
  CUES.forEach((c, i) => {
    if (t >= c) scene = i;
  });
  const since = t - CUES[scene];
  const pop = spring({frame: frame - Math.round(CUES[scene] * FPS), fps, config: {damping: 14, stiffness: 170}});
  const enter = Math.max(0, Math.min(1, since / 0.4));
  const showEnd = scene === 8;
  const endOp = fade(t, CUES[8] - 0.1, 0.5);
  const label = LABELS[Math.min(scene, 7)];

  const big: React.CSSProperties = {fontFamily: anton.fontFamily, fontSize: 64, color: WHITE, textAlign: 'center', whiteSpace: 'nowrap', lineHeight: 1.1};

  const body = (() => {
    switch (scene) {
      case 0:
        return (
          <Card>
            <Pair pa={0} pb={0} powder={1} hiA={false} hiB={false} labelA="VIAL A" labelB="VIAL B" labelOp={1} />
            <div style={big}>SAME AMOUNT IN EACH</div>
          </Card>
        );
      case 1: {
        const pa = clamp01((since - 0.3) / 1.2);
        const pb = clamp01((since - 2.3) / 1.3);
        return (
          <Card>
            <Pair pa={pa} pb={pb} powder={1} hiA={false} hiB={false} labelA={pa > 0.9 ? '2 ML' : ''} labelB={pb > 0.9 ? '5 ML' : ''} labelOp={1} />
            <div style={big}>DIFFERENT WATER</div>
          </Card>
        );
      }
      case 2:
        return (
          <Card>
            <Pair pa={1} pb={1} powder={0} hiA={false} hiB={false} labelA="2 ML" labelB="5 ML" labelOp={1} />
            {since < 1.9 ? (
              <div style={big}>WHICH HOLDS MORE PEPTIDE?</div>
            ) : (
              <>
                <div style={{...big, color: TEAL, fontSize: 80}}>NEITHER.</div>
                <div style={{...big, fontSize: 54, opacity: fade(since, 2.7)}}>WATER NEVER ADDS PEPTIDE</div>
              </>
            )}
          </Card>
        );
      case 3:
        return (
          <Card>
            <Pair pa={1} pb={1} powder={0} hiA hiB={false} labelA="2 ML" labelB="5 ML" labelOp={1} />
            <div style={{...big, opacity: fade(since, 0.6)}}>5 MG ÷ 2 ML = <span style={{color: TEAL}}>2.5 MG/ML</span></div>
          </Card>
        );
      case 4:
        return (
          <Card>
            <Pair pa={1} pb={1} powder={0} hiA={false} hiB labelA="2 ML" labelB="5 ML" labelOp={1} />
            <div style={{...big, opacity: fade(since, 0.6)}}>5 MG ÷ 5 ML = <span style={{color: TEAL}}>1 MG/ML</span></div>
          </Card>
        );
      case 5:
        return (
          <Card>
            <Bar label="VIAL A" math="0.25 MG ÷ 2.5 MG/ML = 0.1 ML" ml={0.1} p={fade(since, 0.3, 0.8)} />
            <Bar label="VIAL B" math="0.25 MG ÷ 1 MG/ML = 0.25 ML" ml={0.25} p={fade(since, 4.2, 0.8)} />
            <div style={{fontFamily: archivo.fontFamily, fontWeight: 700, fontSize: 40, color: AMBER, textAlign: 'center', opacity: fade(since, 6.0)}}>0.1 mL and 0.25 mL read as 10 and 25 units on a U-100 scale</div>
          </Card>
        );
      case 6:
        return (
          <Card height={1060}>
            <div style={{...big, fontSize: 54, opacity: fade(since, 0.1)}}>5000 MCG ÷ 250 MCG = <span style={{color: TEAL}}>20</span></div>
            <Portions t={since} />
            <div style={{...big, color: AMBER, fontSize: 70, opacity: fade(since, 6.7)}}>20 PORTIONS EITHER WAY</div>
          </Card>
        );
      case 7:
        return (
          <Card>
            <div style={{...big, fontSize: 68, opacity: fade(since, 0.2)}}>MORE WATER</div>
            <div style={{...big, fontSize: 68, color: TEAL, opacity: fade(since, 1.2)}}>= MORE VOLUME PER PORTION</div>
            <div style={{...big, fontSize: 68, color: AMBER, opacity: fade(since, 3.4)}}>NEVER MORE PORTIONS</div>
          </Card>
        );
      default:
        return null;
    }
  })();

  return (
    <AbsoluteFill style={{background: BG}}>
      <Audio src={staticFile('redo02-vo-en.mp3')} />
      <Audio src={staticFile('music.wav')} volume={0.4} />
      <Glow />
      <AbsoluteFill style={{alignItems: 'center', paddingTop: 90}}>
        <Logo small />
      </AbsoluteFill>
      <Flag code="us" />

      <AbsoluteFill style={{opacity: 1 - endOp}}>
        <AbsoluteFill style={{alignItems: 'center', paddingTop: 205}}>
          <div style={{transform: enter >= 1 ? 'none' : `scale(${interpolate(enter, [0, 1], [0.85, 1])})`, opacity: enter, background: TEAL_DEEP, border: `5px solid ${TEAL}`, borderRadius: 999, padding: '14px 44px', fontFamily: anton.fontFamily, fontSize: 52, letterSpacing: 2, color: WHITE, textAlign: 'center', whiteSpace: 'nowrap'}}>{label}</div>
        </AbsoluteFill>
        <AbsoluteFill style={{alignItems: 'center', paddingTop: 320}}>
          <div style={{transform: enter >= 1 ? 'none' : `scale(${interpolate(enter, [0, 1], [0.94, 1])})`, opacity: enter}}>{body}</div>
        </AbsoluteFill>
        <AbsoluteFill style={{alignItems: 'center', justifyContent: 'flex-end', paddingBottom: 6}}>
          <Buddy size={380} />
        </AbsoluteFill>
      </AbsoluteFill>

      {showEnd || endOp > 0 ? (
        <AbsoluteFill style={{opacity: endOp, background: BG}}>
          <Glow />
          <Flag code="us" />
          <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center', gap: 44}}>
            <div style={{background: TEAL_DEEP, borderRadius: 999, padding: '16px 50px', fontFamily: anton.fontFamily, fontSize: 46, color: WHITE, letterSpacing: 3}}>PEPTIDE MATH</div>
            <Buddy size={420} />
            <div style={{background: TEAL_DEEP, border: `6px solid ${TEAL}`, borderRadius: 40, padding: '26px 56px', fontFamily: anton.fontFamily, fontSize: 70, color: WHITE, textAlign: 'center', maxWidth: 980, lineHeight: 1.1}}>THE MATH DOESN&apos;T LIE</div>
            <Logo />
            <div style={{background: TEAL_DEEP, borderRadius: 999, padding: '24px 60px', fontFamily: archivo.fontFamily, fontWeight: 700, fontSize: 52, color: WHITE, opacity: fade(t, CUES[8] + 1.5)}}>buddypept.com</div>
            <div style={{background: TEAL_DEEP, border: `4px solid ${TEAL}`, borderRadius: 999, padding: '14px 44px', fontFamily: anton.fontFamily, fontSize: 44, letterSpacing: 2, color: WHITE, opacity: fade(t, CUES[8] + 4.7)}}>FOLLOW US FOR MORE</div>
            <div style={{fontFamily: archivo.fontFamily, fontSize: 28, color: '#5d7078', opacity: fade(t, CUES[8] + 2.5)}}>Educational tool. Not medical advice. For research purposes only.</div>
          </AbsoluteFill>
        </AbsoluteFill>
      ) : null}
    </AbsoluteFill>
  );
};

export const Redo02Root: React.FC = () => (
  <>
    <Composition id="Redo02" component={Redo02} durationInFrames={FPS * REDO02_DURATION} fps={FPS} width={1080} height={1920} />
  </>
);
