import React from 'react';
import {AbsoluteFill, Audio, Composition, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {loadFont as loadAnton} from '@remotion/google-fonts/Anton';
import {loadFont as loadArchivo} from '@remotion/google-fonts/Archivo';
import {BG, Buddy, FPS, Flag, Glow, Logo, TEAL, TEAL_DEEP, WHITE} from './Video';

const anton = loadAnton();
const archivo = loadArchivo();

const AMBER = '#f59e0b';
const PANEL = '#0b161b';

// Start time of each scene (from redo03/vo-en.srt, plus the 1.0 s pre-roll in redo03-vo-en.mp3).
const CUES = [1.05, 3.27, 5.10, 7.24, 9.75, 13.54, 19.19, 22.17, 26.94, 32.59];
const VO_END = 39.52;
export const REDO03_DURATION = Math.ceil(VO_END + 1);

const LABELS = [
  'PEPTIDE MATH',
  'TWO VIALS: 10 MG AND 20 MG',
  'SAME 2 ML OF WATER',
  'SAME 0.5 MG PORTION',
  '10 MG VIAL',
  '10 MG VIAL: THE PORTION',
  '20 MG VIAL',
  '20 MG VIAL: THE PORTION',
  'SAME AMOUNT, HALF THE UNITS',
];

const clamp01 = (x: number) => Math.max(0, Math.min(1, x));
const fade = (t: number, a: number, d = 0.35) => interpolate(t, [a, a + d], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});

const Card: React.FC<{children: React.ReactNode; height?: number}> = ({children, height = 1000}) => (
  <div style={{width: 900, height, background: PANEL, border: `5px solid ${TEAL}`, borderRadius: 44, padding: 40, boxSizing: 'border-box', boxShadow: '0 0 70px rgba(42,182,201,0.28)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 30}}>
    {children}
  </div>
);

const Vial: React.FC<{fill: number; vol: number; powder: number; hi: boolean; id: string; inner: string}> = ({fill, vol, powder, hi, id, inner}) => {
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
      <text x={190} y={250} textAnchor="middle" fontFamily={anton.fontFamily} fontSize={84} fill={WHITE}>{inner}</text>
    </svg>
  );
};

const Pair: React.FC<{pa: number; pb: number; powder: number; hiA: boolean; hiB: boolean; labelA: string; labelB: string; labelOp: number}> = ({pa, pb, powder, hiA, hiB, labelA, labelB, labelOp}) => {
  const lab: React.CSSProperties = {fontFamily: anton.fontFamily, fontSize: 70, color: WHITE, opacity: labelOp, height: 80, textAlign: 'center', whiteSpace: 'nowrap'};
  return (
    <div style={{display: 'flex', gap: 10}}>
      <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
        <Vial id="a" fill={pa} vol={2} powder={powder * (1 - pa)} hi={hiA} inner="10 MG" />
        <div style={lab}>{labelA}</div>
      </div>
      <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
        <Vial id="b" fill={pb} vol={2} powder={powder * (1 - pb)} hi={hiB} inner="20 MG" />
        <div style={lab}>{labelB}</div>
      </div>
    </div>
  );
};

const UnitsRuler: React.FC<{units: number; p: number; tag?: string}> = ({units, p, tag}) => {
  const W = 760;
  const x = (u: number) => (u / 100) * W;
  return (
    <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
      {tag ? <div style={{fontFamily: archivo.fontFamily, fontWeight: 700, fontSize: 42, color: '#9fb4bc', letterSpacing: 2}}>{tag}</div> : null}
      <svg width={W + 80} height={200} viewBox={`-40 0 ${W + 80} 200`}>
        <rect x={0} y={50} width={W} height={52} rx={14} fill="#05090c" stroke="#27414a" strokeWidth={4} />
        <rect x={0} y={50} width={Math.max(0.01, x(units) * p)} height={52} rx={14} fill={TEAL} />
        {Array.from({length: 11}).map((_, i) => (
          <g key={i}>
            <line x1={x(i * 10)} x2={x(i * 10)} y1={110} y2={130} stroke="#9fb4bc" strokeWidth={4} />
            <text x={x(i * 10)} y={172} textAnchor="middle" fontFamily={archivo.fontFamily} fontWeight={700} fontSize={30} fill="#9fb4bc">{i * 10}</text>
          </g>
        ))}
        <g opacity={p}>
          <polygon points={`${x(units) - 16},18 ${x(units) + 16},18 ${x(units)},48`} fill={AMBER} />
        </g>
      </svg>
    </div>
  );
};

export const Redo03: React.FC = () => {
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
  const showEnd = scene === 9;
  const endOp = fade(t, CUES[9] - 0.1, 0.5);
  const label = LABELS[Math.min(scene, 8)];

  const big: React.CSSProperties = {fontFamily: anton.fontFamily, fontSize: 64, color: WHITE, textAlign: 'center', whiteSpace: 'nowrap', lineHeight: 1.1};

  const note: React.CSSProperties = {fontFamily: archivo.fontFamily, fontWeight: 700, fontSize: 42, color: AMBER, textAlign: 'center'};
  const body = (() => {
    switch (scene) {
      case 0:
        return (
          <Card>
            <Logo />
            <div style={{fontFamily: anton.fontFamily, fontSize: 110, color: WHITE, textAlign: 'center', lineHeight: 1.05}}>TWO VIALS<br />ONE PEPTIDE</div>
            <div style={{fontFamily: archivo.fontFamily, fontWeight: 700, fontSize: 46, color: '#9fb4bc', textAlign: 'center'}}>Peptide math</div>
          </Card>
        );
      case 1:
        return (
          <Card>
            <Pair pa={0} pb={0} powder={1} hiA={false} hiB={false} labelA="VIAL A" labelB="VIAL B" labelOp={1} />
            <div style={big}>SAME PEPTIDE</div>
          </Card>
        );
      case 2: {
        const p = clamp01((since - 0.4) / 1.4);
        return (
          <Card>
            <Pair pa={p} pb={p} powder={1} hiA={false} hiB={false} labelA={p > 0.9 ? '+ 2 ML' : ''} labelB={p > 0.9 ? '+ 2 ML' : ''} labelOp={1} />
            <div style={big}>SAME 2 ML OF WATER</div>
          </Card>
        );
      }
      case 3:
        return (
          <Card>
            <Pair pa={1} pb={1} powder={0} hiA={false} hiB={false} labelA="+ 2 ML" labelB="+ 2 ML" labelOp={1} />
            <div style={{...big, color: AMBER, opacity: fade(since, 0.4)}}>SAME 0.5 MG PORTION</div>
          </Card>
        );
      case 4:
        return (
          <Card>
            <Pair pa={1} pb={1} powder={0} hiA hiB={false} labelA="+ 2 ML" labelB="+ 2 ML" labelOp={1} />
            <div style={{...big, opacity: fade(since, 0.5)}}>10 MG ÷ 2 ML = <span style={{color: TEAL}}>5 MG/ML</span></div>
          </Card>
        );
      case 5:
        return (
          <Card>
            <div style={{...big, opacity: fade(since, 0.2)}}>0.5 MG ÷ 5 MG/ML</div>
            <div style={{...big, opacity: fade(since, 1.2)}}>= <span style={{color: TEAL}}>0.1 ML</span></div>
            <div style={{opacity: fade(since, 2.4)}}><UnitsRuler units={10} p={fade(since, 2.4, 0.8)} tag="U-100 SCALE" /></div>
            <div style={{...note, opacity: fade(since, 3.4)}}>0.1 mL reads as 10 units</div>
          </Card>
        );
      case 6:
        return (
          <Card>
            <Pair pa={1} pb={1} powder={0} hiA={false} hiB labelA="+ 2 ML" labelB="+ 2 ML" labelOp={1} />
            <div style={{...big, opacity: fade(since, 0.5)}}>20 MG ÷ 2 ML = <span style={{color: TEAL}}>10 MG/ML</span></div>
          </Card>
        );
      case 7:
        return (
          <Card>
            <div style={{...big, opacity: fade(since, 0.2)}}>0.5 MG ÷ 10 MG/ML</div>
            <div style={{...big, opacity: fade(since, 1.2)}}>= <span style={{color: TEAL}}>0.05 ML</span></div>
            <div style={{opacity: fade(since, 2.4)}}><UnitsRuler units={5} p={fade(since, 2.4, 0.8)} tag="U-100 SCALE" /></div>
            <div style={{...note, opacity: fade(since, 3.4)}}>0.05 mL reads as 5 units</div>
          </Card>
        );
      case 8:
        return (
          <Card>
            <div style={{opacity: fade(since, 0.2)}}><UnitsRuler units={10} p={1} tag="10 MG VIAL: 10 UNITS" /></div>
            <div style={{opacity: fade(since, 1.0)}}><UnitsRuler units={5} p={1} tag="20 MG VIAL: 5 UNITS" /></div>
            <div style={{...big, color: AMBER, fontSize: 56, opacity: fade(since, 2.0)}}>SAME 0.5 MG. HALF THE UNITS.</div>
            <div style={{...big, fontSize: 44, opacity: fade(since, 2.9)}}>THE SCALE NUMBER CHANGED.<br />THE AMOUNT DIDN&apos;T.</div>
          </Card>
        );
      default:
        return null;
    }
  })();

  return (
    <AbsoluteFill style={{background: BG}}>
      <Audio src={staticFile('redo03-vo-en.mp3')} />
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
            <div style={{background: TEAL_DEEP, border: `6px solid ${TEAL}`, borderRadius: 40, padding: '26px 56px', fontFamily: anton.fontFamily, fontSize: 62, color: WHITE, textAlign: 'center', maxWidth: 980, lineHeight: 1.1}}>BUDDYPEPT CATCHES THIS FOR YOU</div>
            <Logo />
            <div style={{background: TEAL_DEEP, borderRadius: 999, padding: '24px 60px', fontFamily: archivo.fontFamily, fontWeight: 700, fontSize: 52, color: WHITE, opacity: fade(t, CUES[9] + 1.8)}}>buddypept.com</div>
            <div style={{background: TEAL_DEEP, border: `4px solid ${TEAL}`, borderRadius: 999, padding: '14px 44px', fontFamily: anton.fontFamily, fontSize: 44, letterSpacing: 2, color: WHITE, opacity: fade(t, CUES[9] + 5.6)}}>FOLLOW US FOR MORE</div>
            <div style={{fontFamily: archivo.fontFamily, fontSize: 28, color: '#5d7078', opacity: fade(t, CUES[9] + 3.0)}}>Educational tool. Not medical advice. For research purposes only.</div>
          </AbsoluteFill>
        </AbsoluteFill>
      ) : null}
    </AbsoluteFill>
  );
};

export const Redo03Root: React.FC = () => (
  <>
    <Composition id="Redo03" component={Redo03} durationInFrames={FPS * REDO03_DURATION} fps={FPS} width={1080} height={1920} />
  </>
);
