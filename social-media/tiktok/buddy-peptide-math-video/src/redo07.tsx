import React from 'react';
import {AbsoluteFill, Audio, Composition, interpolate, staticFile, useCurrentFrame} from 'remotion';
import {loadFont as loadAnton} from '@remotion/google-fonts/Anton';
import {loadFont as loadArchivo} from '@remotion/google-fonts/Archivo';
import {BG, Buddy, FPS, Flag, Glow, Logo, TEAL, TEAL_DEEP, WHITE} from './Video';

const anton = loadAnton();
const archivo = loadArchivo();

const AMBER = '#f59e0b';
const PANEL = '#0b161b';

// Start time of each scene (from redo07/vo-en.srt, plus the 1.0 s pre-roll in redo07-vo-en.mp3).
const CUES = [1.05, 4.64, 5.73, 7.41, 10.11, 13.54, 15.57, 18.12, 20.41, 27.2];
const VO_END = 34.46;
export const REDO07_DURATION = Math.ceil(VO_END + 1);

const LABELS = [
  'WHICH VIAL IS STRONGER?',
  'TRICK QUESTION',
  'A VIAL HAS NO STRENGTH',
  'MORE PEPTIDE',
  'IN 1 MG PORTIONS',
  '5 MG HOLDS 5',
  'WATER ADDS NOTHING',
  '1 MG IS 1 MG',
  'MORE WATER',
];

const fade = (t: number, a: number, d = 0.35) => interpolate(t, [a, a + d], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});

const Card: React.FC<{children: React.ReactNode; height?: number}> = ({children, height = 1000}) => (
  <div style={{width: 900, height, background: PANEL, border: `5px solid ${TEAL}`, borderRadius: 44, padding: 40, boxSizing: 'border-box', boxShadow: '0 0 70px rgba(42,182,201,0.28)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 30}}>
    {children}
  </div>
);

const Vial: React.FC<{id: string; inner: string; hi?: boolean; dim?: boolean}> = ({id, inner, hi, dim}) => {
  const stroke = hi ? TEAL : '#4a6a75';
  return (
    <svg width={380} height={520} viewBox="0 0 380 520" style={{opacity: dim ? 0.45 : 1}}>
      <defs>
        <clipPath id={`clip-${id}`}>
          <rect x={70} y={110} width={240} height={390} rx={34} />
        </clipPath>
      </defs>
      <rect x={120} y={40} width={140} height={74} rx={14} fill="#1b2d34" stroke={stroke} strokeWidth={6} />
      <rect x={70} y={110} width={240} height={390} rx={34} fill="#05090c" stroke={stroke} strokeWidth={hi ? 10 : 6} />
      <g clipPath={`url(#clip-${id})`}>
        <rect x={70} y={330} width={240} height={176} fill={TEAL} opacity={0.4} />
      </g>
      <text x={190} y={250} textAnchor="middle" fontFamily={anton.fontFamily} fontSize={96} fill={WHITE}>{inner}</text>
    </svg>
  );
};

const Pair: React.FC<{hiA?: boolean; hiB?: boolean; dim?: boolean}> = ({hiA, hiB, dim}) => (
  <div style={{display: 'flex', gap: 10}}>
    <Vial id="a" inner="10 MG" hi={hiA} dim={dim} />
    <Vial id="b" inner="5 MG" hi={hiB} dim={dim} />
  </div>
);

const Tiles: React.FC<{n: number; since: number; color: string; start?: number}> = ({n, since, color, start = 0.3}) => (
  <div style={{display: 'flex', gap: 8}}>
    {Array.from({length: n}).map((_, i) => (
      <div key={i} style={{width: 74, height: 74, borderRadius: 14, background: color, opacity: fade(since, start + i * 0.2, 0.2), display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: archivo.fontFamily, fontWeight: 700, fontSize: 30, color: '#04181c'}}>{i + 1}</div>
    ))}
  </div>
);

const W = 760;
const UnitsBar: React.FC<{units: number; p: number}> = ({units, p}) => {
  const x = (u: number) => (u / 100) * W;
  return (
    <svg width={W + 80} height={190} viewBox={`-40 0 ${W + 80} 190`}>
      <rect x={0} y={40} width={W} height={56} rx={14} fill="#05090c" stroke="#27414a" strokeWidth={4} />
      <rect x={0} y={40} width={Math.max(0.01, x(units) * p)} height={56} rx={14} fill={TEAL} />
      {[0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100].map((tk) => (
        <g key={tk}>
          <line x1={x(tk)} x2={x(tk)} y1={104} y2={124} stroke="#9fb4bc" strokeWidth={4} />
          <text x={x(tk)} y={166} textAnchor="middle" fontFamily={archivo.fontFamily} fontWeight={700} fontSize={30} fill="#9fb4bc">{tk}</text>
        </g>
      ))}
    </svg>
  );
};

export const Redo07: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / FPS;

  let scene = 0;
  CUES.forEach((c, i) => {
    if (t >= c) scene = i;
  });
  const since = t - CUES[scene];
  const enter = Math.max(0, Math.min(1, since / 0.4));
  const showEnd = scene === 9;
  const endOp = fade(t, CUES[9] - 0.1, 0.5);
  const label = LABELS[Math.min(scene, 8)];

  const big: React.CSSProperties = {fontFamily: anton.fontFamily, fontSize: 64, color: WHITE, textAlign: 'center', whiteSpace: 'nowrap', lineHeight: 1.1};
  const tag: React.CSSProperties = {fontFamily: archivo.fontFamily, fontWeight: 700, fontSize: 42, color: '#9fb4bc', letterSpacing: 2, textAlign: 'center'};

  const body = (() => {
    switch (scene) {
      case 0:
        return (
          <Card>
            <Pair />
            <div style={{...big, fontSize: 60, opacity: fade(since, 0.3)}}>10 MG OR 5 MG?</div>
          </Card>
        );
      case 1:
        return (
          <Card>
            <Pair dim />
            <div style={{...big, fontSize: 80, color: AMBER}}>TRICK QUESTION.</div>
          </Card>
        );
      case 2:
        return (
          <Card>
            <Pair />
            <div style={{...big, fontSize: 60, color: TEAL}}>A VIAL HAS NO STRENGTH</div>
          </Card>
        );
      case 3:
        return (
          <Card>
            <Pair hiA />
            <div style={{...big, fontSize: 56}}>10 MG IS SIMPLY MORE PEPTIDE</div>
          </Card>
        );
      case 4:
        return (
          <Card>
            <div style={tag}>10 MG VIAL, 1 MG PORTIONS</div>
            <Tiles n={10} since={since} color={TEAL} />
            <div style={{...big, fontSize: 90, opacity: fade(since, 2.4)}}><span style={{color: TEAL}}>10</span> PORTIONS</div>
          </Card>
        );
      case 5:
        return (
          <Card>
            <div style={tag}>10 MG VIAL</div>
            <Tiles n={10} since={99} color={TEAL} />
            <div style={tag}>5 MG VIAL</div>
            <Tiles n={5} since={since} color={AMBER} start={0.2} />
            <div style={{...big, fontSize: 90, opacity: fade(since, 1.4)}}><span style={{color: AMBER}}>5</span> PORTIONS</div>
          </Card>
        );
      case 6:
        return (
          <Card>
            <Pair />
            <div style={{...big, fontSize: 52, opacity: fade(since, 0.2)}}>WATER NEVER CHANGES THE AMOUNT</div>
          </Card>
        );
      case 7:
        return (
          <Card>
            <div style={{...big, fontSize: 150, color: TEAL}}>1 MG</div>
            <div style={{...big, fontSize: 70, opacity: fade(since, 0.6)}}>IS</div>
            <div style={{...big, fontSize: 150, color: TEAL, opacity: fade(since, 1.0)}}>1 MG</div>
          </Card>
        );
      case 8:
        return (
          <Card>
            <div style={{...tag, opacity: fade(since, 0.2)}}>10 MG + 1 ML OF WATER</div>
            <div style={{...big, fontSize: 56, opacity: fade(since, 0.4)}}>1 MG = 0.1 ML = <span style={{color: TEAL}}>10 UNITS</span></div>
            <div style={{opacity: fade(since, 0.6)}}><UnitsBar units={10} p={fade(since, 0.6, 0.7)} /></div>
            <div style={{...tag, opacity: fade(since, 2.8)}}>10 MG + 2 ML OF WATER</div>
            <div style={{...big, fontSize: 56, opacity: fade(since, 3.0)}}>1 MG = 0.2 ML = <span style={{color: AMBER}}>20 UNITS</span></div>
            <div style={{opacity: fade(since, 3.2)}}><UnitsBar units={20} p={fade(since, 3.2, 0.7)} /></div>
            <div style={{...big, fontSize: 48, color: AMBER, opacity: fade(since, 5.2)}}>SAME 1 MG. MORE WATER, MORE UNITS.</div>
          </Card>
        );
      default:
        return null;
    }
  })();

  return (
    <AbsoluteFill style={{background: BG}}>
      <Audio src={staticFile('redo07-vo-en.mp3')} />
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
            <div style={{background: TEAL_DEEP, border: `6px solid ${TEAL}`, borderRadius: 40, padding: '26px 56px', fontFamily: anton.fontFamily, fontSize: 62, color: WHITE, textAlign: 'center', maxWidth: 980, lineHeight: 1.1}}>BUDDYPEPT DOES<br />THE MATH</div>
            <Logo />
            <div style={{background: TEAL_DEEP, borderRadius: 999, padding: '24px 60px', fontFamily: archivo.fontFamily, fontWeight: 700, fontSize: 52, color: WHITE, opacity: fade(t, CUES[9] + 2.2)}}>buddypept.com</div>
            <div style={{background: TEAL_DEEP, border: `4px solid ${TEAL}`, borderRadius: 999, padding: '14px 44px', fontFamily: anton.fontFamily, fontSize: 44, letterSpacing: 2, color: WHITE, opacity: fade(t, CUES[9] + 5.9)}}>FOLLOW US FOR MORE</div>
            <div style={{fontFamily: archivo.fontFamily, fontSize: 28, color: '#5d7078', opacity: fade(t, CUES[9] + 3.5)}}>Educational tool. Not medical advice. For research purposes only.</div>
          </AbsoluteFill>
        </AbsoluteFill>
      ) : null}
    </AbsoluteFill>
  );
};

export const Redo07Root: React.FC = () => (
  <>
    <Composition id="Redo07" component={Redo07} durationInFrames={FPS * REDO07_DURATION} fps={FPS} width={1080} height={1920} />
  </>
);
