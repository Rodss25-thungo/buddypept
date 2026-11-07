import React from 'react';
import {AbsoluteFill, Audio, Composition, interpolate, staticFile, useCurrentFrame} from 'remotion';
import {loadFont as loadAnton} from '@remotion/google-fonts/Anton';
import {loadFont as loadArchivo} from '@remotion/google-fonts/Archivo';
import {BG, Buddy, FPS, Flag, Glow, Logo, TEAL, TEAL_DEEP, WHITE} from './Video';

const anton = loadAnton();
const archivo = loadArchivo();

const AMBER = '#f59e0b';
const PANEL = '#0b161b';

// Start time of each scene (from redo08/vo-en.srt, plus the 1.0 s pre-roll in redo08-vo-en.mp3).
const CUES = [1.05, 4.91, 9.76, 14.16, 17.52, 19.64, 23.73, 28.38, 34.57, 43.38];
const VO_END = 46.12;
export const REDO08_DURATION = Math.ceil(VO_END + 1);

const LABELS = [
  'ONE CLOCK?',
  'CLOCK 1: CHEMISTRY',
  'NEVER FULLY STOPS',
  'COLD SLOWS IT',
  'CLOCK 2: MICROBIOLOGY',
  'WHEN A VIAL IS OPENED',
  'PRESERVATIVES',
  'TWO CLOCKS, TWO RISKS',
  'THE TRAP',
];

const fade = (t: number, a: number, d = 0.35) => interpolate(t, [a, a + d], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});

const Card: React.FC<{children: React.ReactNode; height?: number}> = ({children, height = 1000}) => (
  <div style={{width: 900, height, background: PANEL, border: `5px solid ${TEAL}`, borderRadius: 44, padding: 40, boxSizing: 'border-box', boxShadow: '0 0 70px rgba(42,182,201,0.28)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 30}}>
    {children}
  </div>
);

const Clock: React.FC<{angle: number; R?: number; color?: string; hand?: string}> = ({angle, R = 230, color = TEAL, hand = '#7fe6f2'}) => {
  const a = (angle * Math.PI) / 180;
  return (
    <svg width={R * 2} height={R * 2}>
      <circle cx={R} cy={R} r={R - 6} fill="none" stroke={color} strokeWidth={6} style={{filter: `drop-shadow(0 0 22px ${color}99)`}} />
      {Array.from({length: 12}).map((_, i) => {
        const g = (i / 12) * Math.PI * 2;
        return <line key={i} x1={R + Math.sin(g) * (R - 14)} y1={R - Math.cos(g) * (R - 14)} x2={R + Math.sin(g) * (R - 34)} y2={R - Math.cos(g) * (R - 34)} stroke={color} strokeWidth={i % 3 === 0 ? 8 : 3.5} />;
      })}
      <line x1={R} y1={R} x2={R + Math.sin(a) * (R - 50)} y2={R - Math.cos(a) * (R - 50)} stroke={color} strokeWidth={8} strokeLinecap="round" />
      <line x1={R} y1={R} x2={R + Math.sin(a / 12) * (R - 110)} y2={R - Math.cos(a / 12) * (R - 110)} stroke={hand} strokeWidth={11} strokeLinecap="round" />
      <circle cx={R} cy={R} r={13} fill={color} />
    </svg>
  );
};

const Chip: React.FC<{text: string; color?: string; op?: number}> = ({text, color = TEAL, op = 1}) => (
  <div style={{border: `4px solid ${color}`, background: '#05090c', borderRadius: 999, padding: '12px 36px', fontFamily: anton.fontFamily, fontSize: 48, letterSpacing: 2, color: WHITE, opacity: op, whiteSpace: 'nowrap'}}>{text}</div>
);

const hash = (i: number) => {
  const x = Math.sin(i * 12.9898 + 4.1414) * 43758.5453;
  return x - Math.floor(x);
};
const clamp01 = (x: number) => Math.max(0, Math.min(1, x));

const OPEN_AT = [0.5, 1.8, 3.1];
const OPEN_DUR = 0.8;

// Idea 1: every opening lifts the cap and lets a few specks drift in. A tally counts the openings.
const OpeningVial: React.FC<{since: number}> = ({since}) => {
  const openNow = OPEN_AT.some((a) => since >= a && since < a + OPEN_DUR);
  const lift = OPEN_AT.reduce((m, a) => {
    const u = (since - a) / OPEN_DUR;
    return u >= 0 && u <= 1 ? Math.max(m, Math.sin(u * Math.PI)) : m;
  }, 0);
  const count = OPEN_AT.filter((a) => since >= a).length;
  const specks: React.ReactNode[] = [];
  OPEN_AT.forEach((a, k) => {
    for (let j = 0; j < 4; j++) {
      const id = k * 4 + j;
      const u = clamp01((since - a - j * 0.08) / 0.9);
      if (since < a) continue;
      const sx = 40 + hash(id + 3) * 160 + (hash(id + 11) > 0.5 ? 380 : 0);
      const sy = 30 + hash(id + 5) * 60;
      const ex = 150 + hash(id + 9) * 160 + 70;
      const ey = 290 + hash(id + 13) * 170;
      const e = u * u * (3 - 2 * u);
      const wob = Math.sin(since * 4 + id) * 6 * (1 - u * 0.5);
      specks.push(<circle key={id} cx={sx + (ex - sx) * e + wob} cy={sy + (ey - sy) * e} r={9} fill={AMBER} opacity={0.95} />);
    }
  });
  return (
    <svg width={820} height={561} viewBox="0 0 760 520">
      <defs>
        <clipPath id="oc"><rect x={140} y={110} width={240} height={390} rx={34} /></clipPath>
      </defs>
      <rect x={190} y={40 - lift * 46} width={140} height={74} rx={14} fill="#1b2d34" stroke={openNow ? AMBER : '#4a6a75'} strokeWidth={6} />
      <rect x={140} y={110} width={240} height={390} rx={34} fill="#05090c" stroke="#4a6a75" strokeWidth={6} />
      <g clipPath="url(#oc)"><rect x={140} y={330} width={240} height={176} fill={TEAL} opacity={0.4} /></g>
      <text x={260} y={235} textAnchor="middle" fontFamily={anton.fontFamily} fontSize={44} fill={WHITE}>AMINO-CHAIN</text>
      {specks}
      <text x={600} y={160} textAnchor="middle" fontFamily={archivo.fontFamily} fontWeight={700} fontSize={34} fill="#9fb4bc" letterSpacing={2}>OPENED</text>
      <text x={600} y={260} textAnchor="middle" fontFamily={anton.fontFamily} fontSize={110} fill={count > 0 ? AMBER : '#27414a'}>{count}x</text>
    </svg>
  );
};

// Idea 3: a preservative shield turns specks away at the neck, while the clock inside keeps running.
const ShieldVial: React.FC<{since: number; frame: number}> = ({since, frame}) => {
  const specks: React.ReactNode[] = [];
  for (let i = 0; i < 7; i++) {
    const side = i % 2 === 0 ? -1 : 1;
    const sx = 260 + side * (190 + hash(i + 2) * 90);
    const sy = 20 + hash(i + 4) * 90;
    const tx = 260 + side * 22;
    const ty = 70;
    const ph = (since * 0.55 + hash(i + 8)) % 1;
    const p = ph < 0.5 ? ph / 0.5 : 1 - (ph - 0.5) / 0.5;
    const e = p * p * (3 - 2 * p);
    specks.push(<circle key={i} cx={sx + (tx - sx) * e} cy={sy + (ty - sy) * e} r={9} fill={AMBER} opacity={since > 0.2 ? 0.95 : 0} />);
  }
  const a = (frame * 2.4 * Math.PI) / 180;
  const cx = 260;
  const cy = 360;
  const R = 74;
  const showStill = fade(since, 3.0);
  return (
    <svg width={820} height={561} viewBox="0 0 760 520">
      <defs>
        <clipPath id="sc"><rect x={140} y={110} width={240} height={390} rx={34} /></clipPath>
      </defs>
      <rect x={190} y={40} width={140} height={74} rx={14} fill="#1b2d34" stroke="#4a6a75" strokeWidth={6} />
      <rect x={140} y={110} width={240} height={390} rx={34} fill="#05090c" stroke="#4a6a75" strokeWidth={6} />
      <g clipPath="url(#sc)"><rect x={140} y={330} width={240} height={176} fill={TEAL} opacity={0.3} /></g>
      <circle cx={cx} cy={cy} r={R} fill="#05090c" stroke={TEAL} strokeWidth={6} />
      <line x1={cx} y1={cy} x2={cx + Math.sin(a) * (R - 14)} y2={cy - Math.cos(a) * (R - 14)} stroke={TEAL} strokeWidth={6} strokeLinecap="round" />
      <line x1={cx} y1={cy} x2={cx + Math.sin(a / 12) * (R - 34)} y2={cy - Math.cos(a / 12) * (R - 34)} stroke="#7fe6f2" strokeWidth={8} strokeLinecap="round" />
      <circle cx={cx} cy={cy} r={8} fill={TEAL} />
      {/* shield across the neck */}
      <g opacity={fade(since, 0.1)} transform="translate(260 90) scale(1.3) translate(-260 -90)">
        <path d="M260 30 L318 52 L318 92 Q318 126 260 148 Q202 126 202 92 L202 52 Z" fill={TEAL} fillOpacity={0.25} stroke={TEAL} strokeWidth={7} />
        <text x={260} y={102} textAnchor="middle" fontFamily={anton.fontFamily} fontSize={34} fill={WHITE}>BLOCK</text>
      </g>
      {specks}
      <g opacity={showStill}>
        <rect x={470} y={330} width={250} height={64} rx={32} fill="#05090c" stroke={TEAL} strokeWidth={5} />
        <text x={595} y={374} textAnchor="middle" fontFamily={anton.fontFamily} fontSize={38} fill={WHITE} letterSpacing={2}>STILL RUNNING</text>
        <line x1={470} y1={362} x2={338} y2={362} stroke={TEAL} strokeWidth={4} strokeDasharray="8 8" />
      </g>
    </svg>
  );
};

export const Redo08: React.FC = () => {
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

  const A = frame * 2.4; // base clock angle
  const big: React.CSSProperties = {fontFamily: anton.fontFamily, fontSize: 64, color: WHITE, textAlign: 'center', whiteSpace: 'nowrap', lineHeight: 1.1};
  const col: React.CSSProperties = {display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, width: 410};

  const body = (() => {
    switch (scene) {
      case 0:
        return (
          <Card>
            {since < 2.7 ? (
              <>
                <Clock angle={A} R={230} />
                <div style={{...big, fontSize: 56, opacity: fade(since, 0.3)}}>A VIAL OF SOLUTION HAS...</div>
                <div style={{...big, fontSize: 80, color: TEAL, opacity: fade(since, 1.3)}}>ONE CLOCK?</div>
              </>
            ) : (
              <>
                <div style={{display: 'flex', gap: 20}}>
                  <Clock angle={A} R={190} />
                  <Clock angle={A * 1.3} R={190} color={AMBER} hand="#fcd34d" />
                </div>
                <div style={{...big, fontSize: 110, color: AMBER}}>IT HAS TWO</div>
              </>
            )}
          </Card>
        );
      case 1:
        return (
          <Card>
            <Clock angle={A} R={230} />
            <div style={{...big, fontSize: 76, color: TEAL}}>CLOCK 1: CHEMISTRY</div>
            <div style={{...big, fontSize: 48, opacity: fade(since, 1.8)}}>THE PEPTIDE SLOWLY CHANGES</div>
          </Card>
        );
      case 2:
        return (
          <Card>
            <Clock angle={A} R={170} />
            <Chip text="HYDROLYSIS" op={fade(since, 0.3)} />
            <Chip text="OXIDATION" op={fade(since, 1.3)} />
            <div style={{...big, fontSize: 56, color: AMBER, opacity: fade(since, 2.6)}}>NEVER FULLY STOP</div>
          </Card>
        );
      case 3:
        return (
          <Card>
            <Clock angle={A * 0.3} R={190} />
            <div style={{...big, fontSize: 64, color: TEAL, opacity: fade(since, 0.1)}}>COLD SLOWS IT DOWN</div>
            <div style={{...big, fontSize: 80, color: AMBER, opacity: fade(since, 1.8)}}>BUT IT NEVER RESETS</div>
          </Card>
        );
      case 4:
        return (
          <Card>
            <Clock angle={A * 1.3} R={230} color={AMBER} hand="#fcd34d" />
            <div style={{...big, fontSize: 70, color: AMBER}}>CLOCK 2: MICROBIOLOGY</div>
          </Card>
        );
      case 5:
        return (
          <Card>
            <OpeningVial since={since} />
            <div style={{...big, fontSize: 56, opacity: fade(since, 0.2)}}>EVERY TIME A VIAL IS OPENED</div>
            <div style={{...big, fontSize: 52, color: AMBER, opacity: fade(since, 2.2)}}>CONTAMINATION BECOMES POSSIBLE</div>
          </Card>
        );
      case 6:
        return (
          <Card>
            <ShieldVial since={since} frame={frame} />
            <div style={{...big, fontSize: 48, opacity: fade(since, 0.2)}}>PRESERVATIVES HELP SUPPRESS<br />BACTERIAL GROWTH</div>
            <div style={{...big, fontSize: 50, color: TEAL, opacity: fade(since, 3.0)}}>THEY DON&apos;T STOP THE CHEMISTRY</div>
          </Card>
        );
      case 7:
        return (
          <Card>
            <div style={{display: 'flex', gap: 20}}>
              <div style={col}>
                <Clock angle={A} R={190} />
                <div style={{...big, fontSize: 44, color: TEAL}}>CHEMISTRY</div>
                <div style={{...big, fontSize: 34, opacity: fade(since, 2.4)}}>CHANGES THE MOLECULE</div>
              </div>
              <div style={col}>
                <Clock angle={A * 1.3} R={190} color={AMBER} hand="#fcd34d" />
                <div style={{...big, fontSize: 44, color: AMBER}}>MICROBIOLOGY</div>
                <div style={{...big, fontSize: 34, opacity: fade(since, 4.2)}}>CONTAMINATES THE VIAL</div>
              </div>
            </div>
            <div style={{...big, fontSize: 60, opacity: fade(since, 0.1)}}>TWO CLOCKS. TWO RISKS.</div>
          </Card>
        );
      case 8:
        return (
          <Card>
            <div style={{...big, fontSize: 56, opacity: fade(since, 1.2)}}>THE FAMOUS 28 DAYS?</div>
            <div style={{display: 'flex', gap: 20}}>
              <div style={{...col, position: 'relative'}}>
                <Clock angle={A} R={190} />
                <div style={{...big, fontSize: 44, color: TEAL}}>CHEMISTRY</div>
                <div style={{position: 'absolute', top: 120, left: 0, right: 0, textAlign: 'center', fontFamily: anton.fontFamily, fontSize: 150, color: AMBER, opacity: fade(since, 6.2, 0.4)}}>?</div>
              </div>
              <div style={{...col, position: 'relative'}}>
                <Clock angle={A * 1.3} R={190} color={AMBER} hand="#fcd34d" />
                <div style={{...big, fontSize: 44, color: AMBER}}>MICROBIOLOGY</div>
                <div style={{position: 'absolute', top: 110, left: 0, right: 0, display: 'flex', justifyContent: 'center', opacity: fade(since, 3.1, 0.3), transform: 'rotate(-10deg)'}}>
                  <div style={{background: AMBER, color: '#1a1206', fontFamily: anton.fontFamily, fontSize: 84, padding: '4px 30px', borderRadius: 12}}>28 DAYS</div>
                </div>
              </div>
            </div>
            <div style={{...big, fontSize: 46, opacity: fade(since, 3.1)}}>BELONGS TO THE MICROBIOLOGY CLOCK</div>
            <div style={{...big, fontSize: 46, color: TEAL, opacity: fade(since, 6.2)}}>SAYS NOTHING ABOUT THE CHEMISTRY</div>
          </Card>
        );
      default:
        return null;
    }
  })();

  return (
    <AbsoluteFill style={{background: BG}}>
      <Audio src={staticFile('redo08-vo-en.mp3')} />
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
            <div style={{background: TEAL_DEEP, border: `6px solid ${TEAL}`, borderRadius: 40, padding: '26px 56px', fontFamily: anton.fontFamily, fontSize: 62, color: WHITE, textAlign: 'center', maxWidth: 980, lineHeight: 1.1}}>BOTH CLOCKS<br />ARE RUNNING</div>
            <Logo />
            <div style={{background: TEAL_DEEP, borderRadius: 999, padding: '24px 60px', fontFamily: archivo.fontFamily, fontWeight: 700, fontSize: 52, color: WHITE, opacity: fade(t, CUES[9] + 0.6)}}>buddypept.com</div>
            <div style={{background: TEAL_DEEP, border: `4px solid ${TEAL}`, borderRadius: 999, padding: '14px 44px', fontFamily: anton.fontFamily, fontSize: 44, letterSpacing: 2, color: WHITE, opacity: fade(t, CUES[9] + 1.4)}}>FOLLOW US FOR MORE</div>
            <div style={{fontFamily: archivo.fontFamily, fontSize: 28, color: '#5d7078', opacity: fade(t, CUES[9] + 2.0)}}>Educational content. Not medical advice. For research purposes only.</div>
          </AbsoluteFill>
        </AbsoluteFill>
      ) : null}
    </AbsoluteFill>
  );
};

export const Redo08Root: React.FC = () => (
  <>
    <Composition id="Redo08" component={Redo08} durationInFrames={FPS * REDO08_DURATION} fps={FPS} width={1080} height={1920} />
  </>
);
