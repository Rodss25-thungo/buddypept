import React from 'react';
import {AbsoluteFill, Audio, Composition, interpolate, staticFile, useCurrentFrame} from 'remotion';
import {loadFont as loadAnton} from '@remotion/google-fonts/Anton';
import {loadFont as loadArchivo} from '@remotion/google-fonts/Archivo';
import {BG, Buddy, FPS, Flag, Glow, Logo, TEAL, TEAL_DEEP, WHITE} from './Video';

const anton = loadAnton();
const archivo = loadArchivo();

const AMBER = '#f59e0b';
const PANEL = '#0b161b';

// Start time of each scene (from redo04/vo-en.srt, plus the 1.0 s pre-roll in redo04-vo-en.mp3).
const CUES = [1.05, 5.74, 10.62, 13.76, 18.51, 21.70, 27.64, 32.55, 37.09];
const VO_END = 45.62;
export const REDO04_DURATION = Math.ceil(VO_END + 1);

const LABELS = [
  'LABEL VS VIAL',
  'QUICK QUIZ',
  '1 MG = 1000 MCG',
  '250 MCG IN MG',
  'THE 10X MISTAKE',
  'CONCENTRATION',
  'VOLUME',
  'THE U-100 SCALE',
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

const Vial: React.FC<{inner: string}> = ({inner}) => (
  <svg width={380} height={520} viewBox="0 0 380 520">
    <defs>
      <clipPath id="clip-v">
        <rect x={70} y={110} width={240} height={390} rx={34} />
      </clipPath>
    </defs>
    <rect x={120} y={40} width={140} height={74} rx={14} fill="#1b2d34" stroke={TEAL} strokeWidth={6} />
    <rect x={70} y={110} width={240} height={390} rx={34} fill="#05090c" stroke={TEAL} strokeWidth={8} />
    <g clipPath="url(#clip-v)">
      <rect x={70} y={126} width={240} height={378} fill={TEAL} opacity={0.5} />
    </g>
    <text x={190} y={250} textAnchor="middle" fontFamily={anton.fontFamily} fontSize={84} fill={WHITE}>{inner}</text>
    <text x={190} y={360} textAnchor="middle" fontFamily={anton.fontFamily} fontSize={64} fill={WHITE}>+ 5 ML</text>
  </svg>
);

export const Redo04: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / FPS;

  let scene = 0;
  CUES.forEach((c, i) => {
    if (t >= c) scene = i;
  });
  const since = t - CUES[scene];
  const enter = Math.max(0, Math.min(1, since / 0.4));
  const showEnd = scene === 8;
  const endOp = fade(t, CUES[8] - 0.1, 0.5);
  const label = LABELS[Math.min(scene, 7)];

  const big: React.CSSProperties = {fontFamily: anton.fontFamily, fontSize: 64, color: WHITE, textAlign: 'center', whiteSpace: 'nowrap', lineHeight: 1.1};
  const note: React.CSSProperties = {fontFamily: archivo.fontFamily, fontWeight: 700, fontSize: 42, color: AMBER, textAlign: 'center'};
  const tag: React.CSSProperties = {fontFamily: archivo.fontFamily, fontWeight: 700, fontSize: 42, color: '#9fb4bc', letterSpacing: 2};

  const body = (() => {
    switch (scene) {
      case 0:
        return (
          <Card>
            <Logo />
            <div style={{...big, fontSize: 96, opacity: fade(since, 0.1)}}>LABEL: <span style={{color: TEAL}}>250 MCG</span></div>
            <div style={{...big, fontSize: 96, opacity: fade(since, 2.6)}}>VIAL: <span style={{color: TEAL}}>MG</span></div>
          </Card>
        );
      case 1:
        return (
          <Card>
            <div style={{...big, fontSize: 80}}>250 MCG = ?</div>
            <div style={{opacity: fade(since, 1.6)}}><Option text="0.25 MG" /></div>
            <div style={{...big, fontSize: 50, color: '#9fb4bc', opacity: fade(since, 2.4)}}>OR</div>
            <div style={{opacity: fade(since, 3.0)}}><Option text="2.5 MG" /></div>
          </Card>
        );
      case 2: {
        const split = fade(since, 1.6, 0.4);
        return (
          <Card>
            <div style={{...tag}}>1 MG</div>
            <div style={{position: 'relative'}}>
              <MeasureBar value={1000} max={1000} ticks={[0, 250, 500, 750, 1000]} />
              <svg width={W + 80} height={190} viewBox={`-40 0 ${W + 80} 190`} style={{position: 'absolute', left: 0, top: 0, opacity: split}}>
                {[250, 500, 750].map((tk) => (
                  <line key={tk} x1={(tk / 1000) * W} x2={(tk / 1000) * W} y1={40} y2={96} stroke="#05090c" strokeWidth={8} />
                ))}
              </svg>
            </div>
            <div style={{...big, fontSize: 76}}>1 MG = <span style={{color: TEAL}}>1000 MCG</span></div>
            <div style={{...big, fontSize: 50, color: '#9fb4bc', opacity: split}}>4 PARTS OF 250 MCG</div>
          </Card>
        );
      }
      case 3:
        return (
          <Card>
            <div style={{...tag}}>1 MG, IN 4 PARTS</div>
            <div style={{position: 'relative'}}>
              <MeasureBar value={250} max={1000} fill={AMBER} ticks={[0, 250, 500, 750, 1000]} p={fade(since, 0.2, 0.5)} />
              <svg width={W + 80} height={190} viewBox={`-40 0 ${W + 80} 190`} style={{position: 'absolute', left: 0, top: 0}}>
                {[250, 500, 750].map((tk) => (
                  <line key={tk} x1={(tk / 1000) * W} x2={(tk / 1000) * W} y1={40} y2={96} stroke="#05090c" strokeWidth={8} />
                ))}
              </svg>
            </div>
            <div style={{...big, fontSize: 76, opacity: fade(since, 0.8)}}>250 MCG = <span style={{color: AMBER}}>0.25 MG</span></div>
          </Card>
        );
      case 4:
        return (
          <Card>
            <div style={{...tag}}>0.25 MG</div>
            <MeasureBar value={0.25} max={3} ticks={[0, 1, 2, 3]} tickFmt={(n) => n + ' mg'} p={fade(since, 0.2, 0.5)} />
            <div style={{...tag, opacity: fade(since, 1.2)}}>2.5 MG</div>
            <div style={{opacity: fade(since, 1.2)}}><MeasureBar value={2.5} max={3} fill={AMBER} ticks={[0, 1, 2, 3]} tickFmt={(n) => n + ' mg'} p={fade(since, 1.2, 0.6)} /></div>
            <div style={{...big, color: AMBER, fontSize: 80, opacity: fade(since, 2.2)}}>OFF BY 10X</div>
          </Card>
        );
      case 5:
        return (
          <Card>
            <Vial inner="10 MG" />
            <div style={{...big, opacity: fade(since, 1.3)}}>10 MG ÷ 5 ML = <span style={{color: TEAL}}>2 MG/ML</span></div>
          </Card>
        );
      case 6:
        return (
          <Card>
            <div style={{...big, opacity: fade(since, 0.2)}}>0.25 MG ÷ 2 MG/ML</div>
            <div style={{...big, opacity: fade(since, 1.4)}}>= <span style={{color: TEAL}}>0.125 ML</span></div>
            <div style={{opacity: fade(since, 2.8)}}>
              <div style={{...tag, textAlign: 'center'}}>1 ML SYRINGE SCALE</div>
              <MeasureBar value={0.125} max={1} ticks={[0, 0.25, 0.5, 0.75, 1]} tickFmt={(n) => n + ' mL'} p={fade(since, 2.8, 0.8)} />
            </div>
          </Card>
        );
      case 7:
        return (
          <Card>
            <div style={{...big, opacity: fade(since, 0.2)}}>0.125 ML</div>
            <div style={{opacity: fade(since, 1.0)}}>
              <div style={{...tag, textAlign: 'center'}}>U-100 SCALE</div>
              <MeasureBar value={12.5} max={100} ticks={[0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100]} p={fade(since, 1.0, 0.8)} />
            </div>
            <div style={{...note, fontSize: 52, opacity: fade(since, 2.6)}}>reads as 12.5 units</div>
            <div style={{...note, fontSize: 36, color: '#9fb4bc', opacity: fade(since, 3.4)}}>12.5, not 12. No silent rounding.</div>
          </Card>
        );
      default:
        return null;
    }
  })();

  return (
    <AbsoluteFill style={{background: BG}}>
      <Audio src={staticFile('redo04-vo-en.mp3')} />
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
            <div style={{background: TEAL_DEEP, border: `6px solid ${TEAL}`, borderRadius: 40, padding: '26px 56px', fontFamily: anton.fontFamily, fontSize: 60, color: WHITE, textAlign: 'center', maxWidth: 980, lineHeight: 1.1}}>BUDDYPEPT CONVERTS<br />MCG AND MG</div>
            <Logo />
            <div style={{background: TEAL_DEEP, borderRadius: 999, padding: '24px 60px', fontFamily: archivo.fontFamily, fontWeight: 700, fontSize: 52, color: WHITE, opacity: fade(t, CUES[8] + 3.4)}}>buddypept.com</div>
            <div style={{background: TEAL_DEEP, border: `4px solid ${TEAL}`, borderRadius: 999, padding: '14px 44px', fontFamily: anton.fontFamily, fontSize: 44, letterSpacing: 2, color: WHITE, opacity: fade(t, CUES[8] + 7.1)}}>FOLLOW US FOR MORE</div>
            <div style={{fontFamily: archivo.fontFamily, fontSize: 28, color: '#5d7078', opacity: fade(t, CUES[8] + 4.4)}}>Educational tool. Not medical advice. For research purposes only.</div>
          </AbsoluteFill>
        </AbsoluteFill>
      ) : null}
    </AbsoluteFill>
  );
};

export const Redo04Root: React.FC = () => (
  <>
    <Composition id="Redo04" component={Redo04} durationInFrames={FPS * REDO04_DURATION} fps={FPS} width={1080} height={1920} />
  </>
);
