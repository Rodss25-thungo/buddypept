import React from 'react';
import {AbsoluteFill, Audio, Composition, Easing, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {loadFont as loadAnton} from '@remotion/google-fonts/Anton';
import {loadFont as loadArchivo} from '@remotion/google-fonts/Archivo';
import {BG, Buddy, FPS, Flag, Glow, Logo, TEAL, TEAL_DEEP, WHITE} from './Video';

const anton = loadAnton();
const archivo = loadArchivo();

const AMBER = '#f59e0b';
const PANEL = '#0b161b';

// Start time of each spoken sentence (from redo01/vo-en.srt, plus the 1.0 s pre-roll in redo01-vo-en.mp3).
const CUES = [1.05, 2.97, 5.36, 8.46, 13.67, 17.46, 21.0, 24.2, 27.5, 34.72];
const VO_END = 36.06;
export const REDO01_DURATION = Math.ceil(VO_END + 1);

const LABELS = [
  'THE CALCULATOR, STEP BY STEP',
  '1. OPEN THE CALCULATOR',
  '2. CHOOSE THE COMPOUND',
  '3. POWDER OR LIQUID?',
  '4. VIAL: 10 MG',
  '5. WATER: 2 ML',
  '6. SCALE: 1 ML',
  '7. TARGET AMOUNT: 1 MG',
  'THE RESULT',
];

const fade = (t: number, a: number, d = 0.35) => interpolate(t, [a, a + d], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});

const Card: React.FC<{children: React.ReactNode; height?: number}> = ({children, height = 1000}) => (
  <div style={{width: 900, height, background: PANEL, border: `5px solid ${TEAL}`, borderRadius: 44, padding: 54, boxSizing: 'border-box', boxShadow: '0 0 70px rgba(42,182,201,0.28)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 36}}>
    {children}
  </div>
);

const Field: React.FC<{label: string; value: string; unit: string; since: number}> = ({label, value, unit, since}) => {
  const shown = Math.max(0, Math.min(value.length, Math.floor((since - 0.5) * 6)));
  return (
    <>
      <div style={{fontFamily: archivo.fontFamily, fontWeight: 700, fontSize: 44, color: '#9fb4bc', letterSpacing: 3}}>{label}</div>
      <div style={{width: 700, height: 230, borderRadius: 30, border: `6px solid ${TEAL}`, background: '#05090c', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 54px', boxSizing: 'border-box'}}>
        <span style={{fontFamily: anton.fontFamily, fontSize: 150, color: WHITE}}>{value.slice(0, shown)}</span>
        <span style={{fontFamily: archivo.fontFamily, fontWeight: 700, fontSize: 64, color: '#9fb4bc'}}>{unit}</span>
      </div>
    </>
  );
};

const Option: React.FC<{text: string; on?: boolean; w?: number}> = ({text, on, w = 700}) => (
  <div style={{width: w, minHeight: 150, borderRadius: 30, border: `6px solid ${on ? TEAL : '#27414a'}`, background: on ? TEAL_DEEP : '#05090c', display: 'flex', alignItems: 'center', justifyContent: w < 400 ? 'center' : 'space-between', padding: '0 28px', boxSizing: 'border-box'}}>
    <span style={{fontFamily: archivo.fontFamily, fontWeight: 700, fontSize: w < 400 ? 48 : 56, color: WHITE, whiteSpace: 'nowrap'}}>{text}</span>
    {w >= 400 ? <span style={{width: 44, height: 44, borderRadius: 22, border: `5px solid ${on ? WHITE : '#27414a'}`, background: on ? WHITE : 'transparent'}} /> : null}
  </div>
);

const Ruler: React.FC<{p: number}> = ({p}) => {
  const W = 760;
  const x = (u: number) => (u / 100) * W;
  return (
    <svg width={W + 40} height={230} viewBox={`-20 0 ${W + 40} 230`}>
      <rect x={0} y={70} width={W} height={52} rx={14} fill="#05090c" stroke="#27414a" strokeWidth={4} />
      <rect x={0} y={70} width={x(20) * p} height={52} rx={14} fill={TEAL} />
      {Array.from({length: 11}).map((_, i) => (
        <g key={i}>
          <line x1={x(i * 10)} x2={x(i * 10)} y1={130} y2={150} stroke="#9fb4bc" strokeWidth={4} />
          <text x={x(i * 10)} y={192} textAnchor="middle" fontFamily={archivo.fontFamily} fontWeight={700} fontSize={30} fill="#9fb4bc">{i * 10}</text>
        </g>
      ))}
      <g opacity={p}>
        <polygon points={`${x(20) - 16},40 ${x(20) + 16},40 ${x(20)},68`} fill={AMBER} />
      </g>
    </svg>
  );
};

export const Redo01: React.FC = () => {
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

  const recap: {k: string; v: string; from: number}[] = [
    {k: 'VIAL', v: '10 MG', from: CUES[4] + 2.0},
    {k: 'WATER', v: '2 ML', from: CUES[5] + 2.0},
    {k: 'SCALE', v: '1 ML', from: CUES[6] + 2.0},
    {k: 'TARGET', v: '1 MG', from: CUES[7] + 2.0},
  ];

  const body = (() => {
    switch (scene) {
      case 0:
        return (
          <Card>
            <Logo />
            <div style={{fontFamily: anton.fontFamily, fontSize: 96, color: WHITE, textAlign: 'center', lineHeight: 1.05}}>FREE PEPTIDE<br />CALCULATOR</div>
            <div style={{fontFamily: archivo.fontFamily, fontWeight: 700, fontSize: 48, color: '#9fb4bc', textAlign: 'center'}}>Seven inputs. One result.</div>
          </Card>
        );
      case 1:
        return (
          <Card>
            <div style={{fontFamily: anton.fontFamily, fontSize: 84, color: WHITE, textAlign: 'center'}}>CALCULATOR</div>
            <div style={{background: TEAL, borderRadius: 999, padding: '34px 56px', fontFamily: archivo.fontFamily, fontWeight: 700, fontSize: 54, color: '#04181c', whiteSpace: 'nowrap'}}>Open the calculator →</div>
          </Card>
        );
      case 2:
        return (
          <Card>
            <div style={{width: 700, height: 120, borderRadius: 30, border: `6px solid ${TEAL}`, background: '#05090c', display: 'flex', alignItems: 'center', padding: '0 46px', boxSizing: 'border-box', fontFamily: archivo.fontFamily, fontWeight: 700, fontSize: 50, color: '#9fb4bc'}}>Pick from the list</div>
            <Option text="Compound A" on={since > 1.2} />
            <Option text="Compound B" />
            <Option text="Other compound" />
          </Card>
        );
      case 3:
        return (
          <Card>
            <Option text="A powder to mix" on={since > 1.5} />
            <Option text="Already liquid" />
          </Card>
        );
      case 4:
        return (
          <Card>
            <Field label="VIAL" value="10" unit="mg" since={since} />
          </Card>
        );
      case 5:
        return (
          <Card>
            <Field label="WATER ADDED" value="2" unit="mL" since={since} />
          </Card>
        );
      case 6:
        return (
          <Card>
            <div style={{fontFamily: archivo.fontFamily, fontWeight: 700, fontSize: 44, color: '#9fb4bc', letterSpacing: 3}}>SCALE</div>
            <div style={{display: 'flex', gap: 18}}>
              <Option text="0.3 mL" w={262} />
              <Option text="0.5 mL" w={262} />
              <Option text="1 mL" w={262} on={since > 1.5} />
            </div>
          </Card>
        );
      case 7:
        return (
          <Card>
            <Field label="TARGET AMOUNT" value="1" unit="mg" since={since} />
          </Card>
        );
      case 8: {
        const r1 = fade(since, 0.4);
        const r2 = fade(since, 2.0);
        const r3 = fade(since, 4.2);
        const row: React.CSSProperties = {fontFamily: anton.fontFamily, fontSize: 70, color: WHITE, textAlign: 'center', lineHeight: 1.1};
        return (
          <Card height={1060}>
            <div style={{...row, opacity: r1}}>10 MG ÷ 2 ML = <span style={{color: TEAL}}>5 MG/ML</span></div>
            <div style={{...row, opacity: r2}}>1 MG ÷ 5 MG/ML = <span style={{color: TEAL}}>0.2 ML</span></div>
            <div style={{opacity: r3}}>
              <Ruler p={r3} />
              <div style={{fontFamily: archivo.fontFamily, fontWeight: 700, fontSize: 44, color: AMBER, textAlign: 'center', marginTop: 6}}>0.2 mL reads as 20 units on a U-100 scale</div>
            </div>
          </Card>
        );
      }
      default:
        return null;
    }
  })();

  return (
    <AbsoluteFill style={{background: BG}}>
      <Audio src={staticFile('redo01-vo-en.mp3')} />
      <Audio src={staticFile('music.wav')} volume={0.4} />
      <Glow />
      <AbsoluteFill style={{alignItems: 'center', paddingTop: 90}}>
        <Logo small />
      </AbsoluteFill>
      <Flag code="us" />

      <AbsoluteFill style={{opacity: 1 - endOp}}>
        <AbsoluteFill style={{alignItems: 'center', paddingTop: 205}}>
          <div style={{transform: enter >= 1 ? 'none' : `scale(${interpolate(enter, [0, 1], [0.85, 1])})`, opacity: enter, background: scene === 8 ? '#1a1206' : TEAL_DEEP, border: `5px solid ${scene === 8 ? AMBER : TEAL}`, borderRadius: 999, padding: '14px 52px', fontFamily: anton.fontFamily, fontSize: 58, letterSpacing: 2, color: scene === 8 ? AMBER : WHITE, textAlign: 'center', maxWidth: 1000}}>{label}</div>
        </AbsoluteFill>
        <AbsoluteFill style={{alignItems: 'center', paddingTop: 320}}>
          <div style={{transform: enter >= 1 ? 'none' : `scale(${interpolate(enter, [0, 1], [0.94, 1])})`, opacity: enter}}>{body}</div>
        </AbsoluteFill>
        <AbsoluteFill style={{alignItems: 'center', justifyContent: 'flex-end', paddingBottom: 440}}>
          <div style={{display: 'flex', gap: 10, flexWrap: 'nowrap'}}>
            {recap.map((r) => (
              <div key={r.k} style={{opacity: fade(t, r.from), background: TEAL_DEEP, border: `4px solid ${TEAL}`, borderRadius: 999, padding: '10px 18px', fontFamily: archivo.fontFamily, fontWeight: 700, fontSize: 30, color: WHITE, whiteSpace: 'nowrap'}}>
                {r.k} {r.v}
              </div>
            ))}
          </div>
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
            <div style={{background: TEAL_DEEP, borderRadius: 999, padding: '16px 50px', fontFamily: anton.fontFamily, fontSize: 46, color: WHITE, letterSpacing: 3}}>CALCULATOR GUIDE</div>
            <Buddy size={420} />
            <div style={{background: TEAL_DEEP, border: `6px solid ${TEAL}`, borderRadius: 40, padding: '26px 56px', fontFamily: anton.fontFamily, fontSize: 70, color: WHITE, textAlign: 'center', maxWidth: 980, lineHeight: 1.1}}>FOLLOW US FOR MORE</div>
            <Logo />
            <div style={{background: TEAL_DEEP, borderRadius: 999, padding: '24px 60px', fontFamily: archivo.fontFamily, fontWeight: 700, fontSize: 52, color: WHITE, opacity: fade(t, CUES[9] + 0.8)}}>buddypept.com</div>
            <div style={{fontFamily: archivo.fontFamily, fontSize: 28, color: '#5d7078', opacity: fade(t, CUES[9] + 1.6)}}>Educational tool. Not medical advice. For research purposes only.</div>
          </AbsoluteFill>
        </AbsoluteFill>
      ) : null}
    </AbsoluteFill>
  );
};

export const Redo01Root: React.FC = () => (
  <>
    <Composition id="Redo01" component={Redo01} durationInFrames={FPS * REDO01_DURATION} fps={FPS} width={1080} height={1920} />
  </>
);
