import React from 'react';
import {AbsoluteFill, Audio, Composition, interpolate, staticFile, useCurrentFrame} from 'remotion';
import {loadFont as loadAnton} from '@remotion/google-fonts/Anton';
import {loadFont as loadArchivo} from '@remotion/google-fonts/Archivo';
import {BG, Buddy, FPS, Flag, Glow, Logo, TEAL, TEAL_DEEP, WHITE} from './Video';

const anton = loadAnton();
const archivo = loadArchivo();

const AMBER = '#f59e0b';
const PANEL = '#0b161b';

// Start time of each scene (from redo05/vo-en.srt, plus the 1.0 s pre-roll in redo05-vo-en.mp3).
const CUES = [1.05, 4.36, 5.91, 11.40, 14.48, 18.39, 21.40, 27.68, 33.47, 35.49];
const VO_END = 43.67;
export const REDO05_DURATION = Math.ceil(VO_END + 1);

const LABELS = [
  'U-100 SCALE',
  'WHAT IS A UNIT?',
  '1 UNIT',
  '10 UNITS',
  'THE CATCH',
  'CONCENTRATION',
  'VIAL A: 2 MG/ML',
  'VIAL B: 5 MG/ML',
  'SAME UNITS',
];

const fade = (t: number, a: number, d = 0.35) => interpolate(t, [a, a + d], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});

const Card: React.FC<{children: React.ReactNode; height?: number}> = ({children, height = 1000}) => (
  <div style={{width: 900, height, background: PANEL, border: `5px solid ${TEAL}`, borderRadius: 44, padding: 40, boxSizing: 'border-box', boxShadow: '0 0 70px rgba(42,182,201,0.28)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 34}}>
    {children}
  </div>
);

const W = 760;

const Option: React.FC<{text: string}> = ({text}) => (
  <div style={{width: 700, minHeight: 150, borderRadius: 30, border: '6px solid #27414a', background: '#05090c', display: 'flex', alignItems: 'center', justifyContent: 'center', boxSizing: 'border-box'}}>
    <span style={{fontFamily: anton.fontFamily, fontSize: 92, color: WHITE, whiteSpace: 'nowrap'}}>{text}</span>
  </div>
);

// A horizontal bar from 0 to `max` of some unit, filled to `value`, with optional dividers.
const MeasureBar: React.FC<{value: number; max: number; fill?: string; ticks?: number[]; tickFmt?: (n: number) => string; p?: number}> = ({value, max, fill = TEAL, ticks = [], tickFmt = String, p = 1}) => {
  const x = (u: number) => (u / max) * W;
  return (
    <svg width={W + 80} height={190} viewBox={`-40 0 ${W + 80} 190`}>
      <rect x={0} y={40} width={W} height={56} rx={14} fill="#05090c" stroke="#27414a" strokeWidth={4} />
      <rect x={0} y={40} width={Math.max(0.01, x(value) * p)} height={56} rx={14} fill={fill} />
      {ticks.map((tk) => (
        <g key={tk}>
          <line x1={x(tk)} x2={x(tk)} y1={104} y2={124} stroke="#9fb4bc" strokeWidth={4} />
          <text x={x(tk)} y={166} textAnchor="middle" fontFamily={archivo.fontFamily} fontWeight={700} fontSize={30} fill="#9fb4bc">{tickFmt(tk)}</text>
        </g>
      ))}
    </svg>
  );
};

export const Redo05: React.FC = () => {
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
  const note: React.CSSProperties = {fontFamily: archivo.fontFamily, fontWeight: 700, fontSize: 42, color: AMBER, textAlign: 'center'};
  const tag: React.CSSProperties = {fontFamily: archivo.fontFamily, fontWeight: 700, fontSize: 42, color: '#9fb4bc', letterSpacing: 2};

  const body = (() => {
    switch (scene) {
      case 0:
        return (
          <Card>
            <Logo />
            <div style={{...tag, textAlign: 'center'}}>U-100 SCALE</div>
            <MeasureBar value={100} max={100} ticks={[0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100]} p={fade(since, 0.3, 0.9)} />
            <div style={{...big, fontSize: 80, opacity: fade(since, 1.0)}}>100 UNITS = <span style={{color: TEAL}}>1 ML</span></div>
          </Card>
        );
      case 1:
        return (
          <Card>
            <div style={{...big, fontSize: 90}}>WHAT IS A</div>
            <div style={{...big, fontSize: 90, color: TEAL}}>UNIT?</div>
            <div style={{...big, fontSize: 260, color: AMBER, opacity: fade(since, 0.6)}}>?</div>
          </Card>
        );
      case 2:
        return (
          <Card>
            <div style={{...tag, textAlign: 'center'}}>1 UNIT ON THE SCALE</div>
            <MeasureBar value={1} max={100} ticks={[0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100]} p={fade(since, 0.3, 0.6)} />
            <div style={{...big, fontSize: 70, opacity: fade(since, 1.6)}}>1 UNIT = 1/100 OF A ML</div>
            <div style={{...big, fontSize: 90, color: TEAL, opacity: fade(since, 3.2)}}>= 0.01 ML</div>
            <div style={{...big, fontSize: 60, color: AMBER, opacity: fade(since, 4.7)}}>THAT&apos;S IT.</div>
          </Card>
        );
      case 3:
        return (
          <Card>
            <div style={{...tag, textAlign: 'center'}}>10 UNITS ON THE SCALE</div>
            <MeasureBar value={10} max={100} ticks={[0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100]} p={fade(since, 0.3, 0.8)} />
            <div style={{...big, fontSize: 84, opacity: fade(since, 1.2)}}>10 UNITS = <span style={{color: TEAL}}>0.1 ML</span></div>
          </Card>
        );
      case 4:
        return (
          <Card>
            <div style={{...tag, textAlign: 'center'}}>HERE IS THE CATCH</div>
            <div style={{...big, fontSize: 96, color: TEAL, opacity: fade(since, 0.3)}}>UNITS = VOLUME</div>
            <div style={{...big, fontSize: 96, color: AMBER, opacity: fade(since, 2.4)}}>NOT PEPTIDE</div>
          </Card>
        );
      case 5:
        return (
          <Card>
            <div style={{...big, fontSize: 78, opacity: fade(since, 0.2)}}>THE AMOUNT OF<br />PEPTIDE DEPENDS ON</div>
            <div style={{...big, fontSize: 96, color: TEAL, opacity: fade(since, 1.8)}}>CONCENTRATION</div>
          </Card>
        );
      case 6:
        return (
          <Card>
            <div style={{...tag, textAlign: 'center'}}>2 MG/ML</div>
            <div style={{...big, fontSize: 80, opacity: fade(since, 0.3)}}>0.1 ML X 2 MG/ML</div>
            <div style={{...big, fontSize: 100, color: TEAL, opacity: fade(since, 4.6)}}>= 0.2 MG</div>
          </Card>
        );
      case 7:
        return (
          <Card>
            <div style={{...tag, textAlign: 'center'}}>5 MG/ML</div>
            <div style={{...big, fontSize: 80, opacity: fade(since, 0.3)}}>0.1 ML X 5 MG/ML</div>
            <div style={{...big, fontSize: 100, color: AMBER, opacity: fade(since, 4.0)}}>= 0.5 MG</div>
          </Card>
        );
      case 8:
        return (
          <Card>
            <div style={{...big, fontSize: 70, color: AMBER, opacity: fade(since, 0.1)}}>SAME 10 UNITS</div>
            <div style={{...big, fontSize: 60, opacity: fade(since, 0.5)}}>AT 2 MG/ML: <span style={{color: TEAL}}>0.2 MG</span></div>
            <div style={{...big, fontSize: 60, opacity: fade(since, 1.0)}}>AT 5 MG/ML: <span style={{color: AMBER}}>0.5 MG</span></div>
            <div style={{...big, fontSize: 70, opacity: fade(since, 1.6)}}>DIFFERENT AMOUNT</div>
          </Card>
        );
      default:
        return null;
    }
  })();

  return (
    <AbsoluteFill style={{background: BG}}>
      <Audio src={staticFile('redo05-vo-en.mp3')} />
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
            <div style={{background: TEAL_DEEP, border: `6px solid ${TEAL}`, borderRadius: 40, padding: '26px 56px', fontFamily: anton.fontFamily, fontSize: 60, color: WHITE, textAlign: 'center', maxWidth: 980, lineHeight: 1.1}}>BUDDYPEPT CONVERTS<br />UNITS TO MG</div>
            <Logo />
            <div style={{background: TEAL_DEEP, borderRadius: 999, padding: '24px 60px', fontFamily: archivo.fontFamily, fontWeight: 700, fontSize: 52, color: WHITE, opacity: fade(t, CUES[9] + 3.0)}}>buddypept.com</div>
            <div style={{background: TEAL_DEEP, border: `4px solid ${TEAL}`, borderRadius: 999, padding: '14px 44px', fontFamily: anton.fontFamily, fontSize: 44, letterSpacing: 2, color: WHITE, opacity: fade(t, CUES[9] + 6.8)}}>FOLLOW US FOR MORE</div>
            <div style={{fontFamily: archivo.fontFamily, fontSize: 28, color: '#5d7078', opacity: fade(t, CUES[9] + 4.0)}}>Educational tool. Not medical advice. For research purposes only.</div>
          </AbsoluteFill>
        </AbsoluteFill>
      ) : null}
    </AbsoluteFill>
  );
};

export const Redo05Root: React.FC = () => (
  <>
    <Composition id="Redo05" component={Redo05} durationInFrames={FPS * REDO05_DURATION} fps={FPS} width={1080} height={1920} />
  </>
);
