import React from 'react';
import {AbsoluteFill, Audio, Composition, interpolate, staticFile, useCurrentFrame} from 'remotion';
import {loadFont as loadAnton} from '@remotion/google-fonts/Anton';
import {loadFont as loadArchivo} from '@remotion/google-fonts/Archivo';
import {BG, Buddy, FPS, Flag, Glow, Logo, TEAL, TEAL_DEEP, WHITE} from './Video';

const anton = loadAnton();
const archivo = loadArchivo();

const AMBER = '#f59e0b';
const PANEL = '#0b161b';

// Start time of each scene (from redo06/vo-en.srt, plus the 1.0 s pre-roll in redo06-vo-en.mp3).
const CUES = [1.05, 4.55, 8.34, 10.89, 15.13, 18.11, 23.25, 26.56, 29.61, 31.72];
const VO_END = 33.04;
export const REDO06_DURATION = Math.ceil(VO_END + 1);

const LABELS = [
  'THE CLOCK',
  'INSIDE THE VIAL',
  'FREEZE-DRIED',
  'ON PAUSE',
  'WATER GOES IN',
  'MOLECULES MOVE',
  'TWO DIFFERENT WORLDS',
  'WAIT VS MOVE',
  'THE CLOCK STARTS',
];

const clamp01 = (x: number) => Math.max(0, Math.min(1, x));
const fade = (t: number, a: number, d = 0.35) => interpolate(t, [a, a + d], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
const hash = (i: number) => {
  const x = Math.sin(i * 12.9898 + 4.1414) * 43758.5453;
  return x - Math.floor(x);
};

const Card: React.FC<{children: React.ReactNode; height?: number}> = ({children, height = 1000}) => (
  <div style={{width: 900, height, background: PANEL, border: `5px solid ${TEAL}`, borderRadius: 44, padding: 40, boxSizing: 'border-box', boxShadow: '0 0 70px rgba(42,182,201,0.28)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 30}}>
    {children}
  </div>
);

// One vial. powder: dry crystals resting at the bottom. water: 0..1 liquid level. motion: 0 = frozen, 1 = free.
const N = 36;
const Vial: React.FC<{id: string; t: number; water: number; motion: number; powder: number; hi?: boolean}> = ({id, t, water, motion, powder, hi}) => {
  const bodyTop = 110;
  const bodyBottom = 500;
  const liquidH = 220 * water;
  const liquidTop = bodyBottom - liquidH;
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
        <rect x={70} y={liquidTop} width={240} height={liquidH + 6} fill={TEAL} opacity={0.4} />
        {Array.from({length: N}).map((_, i) => {
          const baseX = 100 + (i % 9) * 22 + (hash(i) - 0.5) * 6;
          const baseY = 486 - Math.floor(i / 9) * 20 - hash(i + 50) * 5;
          const freeX = 100 + hash(i + 7) * 180;
          const freeY = liquidTop + 18 + hash(i + 19) * Math.max(10, liquidH - 36);
          const wx = Math.sin(t * (1.6 + hash(i + 3)) + i) * 16 * motion;
          const wy = Math.cos(t * (1.3 + hash(i + 9)) + i * 2) * 14 * motion;
          const m = motion;
          const x = baseX + (freeX - baseX) * m + wx;
          const y = baseY + (freeY - baseY) * m + wy;
          const dry = powder * (1 - m);
          return (
            <circle key={i} cx={x} cy={y} r={9} fill={dry > 0.5 ? '#e6eef1' : '#bff3fa'} opacity={Math.max(dry, m, 0.0)} />
          );
        })}
      </g>
      <text x={190} y={215} textAnchor="middle" fontFamily={anton.fontFamily} fontSize={44} fill={WHITE}>AMINO-CHAIN</text>
    </svg>
  );
};

const Clock: React.FC<{frame: number; R?: number}> = ({frame, R = 250}) => {
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

export const Redo06: React.FC = () => {
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
  const lab: React.CSSProperties = {fontFamily: anton.fontFamily, fontSize: 56, color: WHITE, height: 70, textAlign: 'center', whiteSpace: 'nowrap'};

  const body = (() => {
    switch (scene) {
      case 0:
        return (
          <Card>
            <Clock frame={frame} R={230} />
            <div style={{...big, opacity: fade(since, 0.2)}}>ONCE WATER GOES IN</div>
            <div style={{...big, color: TEAL, opacity: fade(since, 1.1)}}>A CLOCK STARTS</div>
            <div style={{...big, color: AMBER, fontSize: 56, opacity: fade(since, 2.5)}}>HERE&apos;S WHY</div>
          </Card>
        );
      case 1:
        return (
          <Card>
            <Vial id="a" t={t} water={0} motion={0} powder={1} />
            <div style={{...big, opacity: fade(since, 0.3)}}>INSIDE: DRY POWDER</div>
          </Card>
        );
      case 2:
        return (
          <Card>
            <Vial id="a" t={t} water={0} motion={0} powder={1} hi />
            <div style={{...big, color: TEAL, opacity: fade(since, 0.1)}}>FREEZE-DRIED</div>
            <div style={{...big, fontSize: 52, opacity: fade(since, 1.1)}}>ALMOST NOTHING MOVES</div>
          </Card>
        );
      case 3:
        return (
          <Card>
            <Vial id="a" t={t} water={0} motion={0} powder={1} />
            <div style={{...big, opacity: fade(since, 0.2)}}>NO WATER, NO REACTIONS</div>
            <div style={{...big, color: AMBER, opacity: fade(since, 2.4)}}>ON PAUSE</div>
          </Card>
        );
      case 4: {
        const w = clamp01((since - 0.3) / 1.6);
        const m = clamp01((since - 1.2) / 1.6);
        return (
          <Card>
            <Vial id="a" t={t} water={w} motion={m} powder={1} />
            <div style={{...big, opacity: fade(since, 0.1)}}>THEN WATER GOES IN</div>
            <div style={{...big, color: TEAL, opacity: fade(since, 1.4)}}>EVERYTHING CHANGES</div>
          </Card>
        );
      }
      case 5:
        return (
          <Card>
            <Vial id="a" t={t} water={1} motion={1} powder={1} hi />
            <div style={{...big, fontSize: 56, opacity: fade(since, 0.2)}}>THE MOLECULES CAN MOVE AGAIN</div>
            <div style={{...big, fontSize: 40, color: '#9fb4bc', opacity: fade(since, 2.8)}}>THE CHEMISTRY THAT WATER ENABLES COMES BACK</div>
          </Card>
        );
      case 6:
        return (
          <Card>
            <div style={{display: 'flex', gap: 10}}>
              <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
                <Vial id="l" t={t} water={0} motion={0} powder={1} />
                <div style={lab}>DRY POWDER</div>
              </div>
              <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
                <Vial id="r" t={t} water={1} motion={1} powder={1} />
                <div style={lab}>SOLUTION</div>
              </div>
            </div>
            <div style={{...big, opacity: fade(since, 0.4)}}>TWO DIFFERENT WORLDS</div>
          </Card>
        );
      case 7: {
        const left = since < 1.43;
        return (
          <Card>
            <div style={{display: 'flex', gap: 10}}>
              <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
                <Vial id="l" t={t} water={0} motion={0} powder={1} hi={left} />
                <div style={lab}>DRY POWDER</div>
              </div>
              <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
                <Vial id="r" t={t} water={1} motion={1} powder={1} hi={!left} />
                <div style={lab}>SOLUTION</div>
              </div>
            </div>
            <div style={{...big, color: left ? AMBER : TEAL}}>{left ? 'ONE IS BUILT TO WAIT' : 'THE OTHER IS FREE TO MOVE'}</div>
          </Card>
        );
      }
      case 8:
        return (
          <Card>
            <Clock frame={frame} R={250} />
            <div style={{...big, fontSize: 60, opacity: fade(since, 0.2)}}>THAT IS THE MOMENT</div>
            <div style={{...big, fontSize: 70, color: AMBER, opacity: fade(since, 0.8)}}>THE CLOCK STARTS</div>
          </Card>
        );
      default:
        return null;
    }
  })();

  return (
    <AbsoluteFill style={{background: BG}}>
      <Audio src={staticFile('redo06-vo-en.mp3')} />
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
            <div style={{background: TEAL_DEEP, borderRadius: 999, padding: '16px 50px', fontFamily: anton.fontFamily, fontSize: 46, color: WHITE, letterSpacing: 3}}>PEPTIDE SCIENCE</div>
            <Buddy size={420} />
            <div style={{background: TEAL_DEEP, border: `6px solid ${TEAL}`, borderRadius: 40, padding: '26px 56px', fontFamily: anton.fontFamily, fontSize: 58, color: WHITE, textAlign: 'center', maxWidth: 980, lineHeight: 1.1}}>ONCE WATER GOES IN,<br />A CLOCK STARTS</div>
            <Logo />
            <div style={{background: TEAL_DEEP, borderRadius: 999, padding: '24px 60px', fontFamily: archivo.fontFamily, fontWeight: 700, fontSize: 52, color: WHITE, opacity: fade(t, CUES[9] + 0.8)}}>buddypept.com</div>
            <div style={{background: TEAL_DEEP, border: `4px solid ${TEAL}`, borderRadius: 999, padding: '14px 44px', fontFamily: anton.fontFamily, fontSize: 44, letterSpacing: 2, color: WHITE, opacity: fade(t, CUES[9] + 0.3)}}>FOLLOW US FOR MORE</div>
            <div style={{fontFamily: archivo.fontFamily, fontSize: 28, color: '#5d7078', opacity: fade(t, CUES[9] + 1.5)}}>Educational content. Not medical advice. For research purposes only.</div>
          </AbsoluteFill>
        </AbsoluteFill>
      ) : null}
    </AbsoluteFill>
  );
};

export const Redo06Root: React.FC = () => (
  <>
    <Composition id="Redo06" component={Redo06} durationInFrames={FPS * REDO06_DURATION} fps={FPS} width={1080} height={1920} />
  </>
);
