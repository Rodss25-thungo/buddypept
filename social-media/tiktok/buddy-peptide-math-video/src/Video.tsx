import React from 'react';
import {
  AbsoluteFill,
  Audio,
  Img,
  interpolate,
  Sequence,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import {loadFont as loadAnton} from '@remotion/google-fonts/Anton';
import {loadFont as loadArchivo} from '@remotion/google-fonts/Archivo';

const anton = loadAnton();
const archivo = loadArchivo();

const FPS = 30;
const WHITE = '#F5F7FA';
const TEAL = '#2ab6c9';
const TEAL_DEEP = '#0C8092';
const BG = '#05090c';
const MUTED = '#c9d4da';

// Caption cues from the voiceover srt (seconds)
type Cue = {from: number; to: number; lines: [string, string?]; teal?: 0 | 1};
const CUES: Cue[] = [
  {from: 0.05, to: 3.03, lines: ['STARTING YOUR RESEARCH?', 'THE VIAL JUST ARRIVED.'], teal: 1},
  {from: 3.03, to: 3.87, lines: ['NOW WHAT?']},
  {from: 3.87, to: 7.96, lines: ['5 MG OF POWDER', "DOESN'T TELL YOU UNITS."], teal: 1},
  {from: 7.96, to: 9.01, lines: ["THAT'S MATH."]},
  {from: 9.01, to: 10.66, lines: ['BUDDYPEPT', 'DOES IT FOR YOU.'], teal: 1},
  {from: 10.66, to: 11.82, lines: ['ENTER THE VIAL.']},
  {from: 11.82, to: 12.75, lines: ['THE WATER.']},
  {from: 12.75, to: 13.98, lines: ['THE TARGET AMOUNT.']},
  {from: 13.98, to: 17.64, lines: ['EXACT UNITS ON', 'A U-100 SYRINGE.'], teal: 1},
  {from: 17.64, to: 18.88, lines: ['STEP BY STEP.']},
  {from: 18.88, to: 19.86, lines: ['EXPLAINED.']},
  {from: 19.86, to: 20.6, lines: ['FREE.']},
  {from: 20.6, to: 21.73, lines: ['NO PAYWALL.']},
  {from: 21.73, to: 22.47, lines: ['EVER.'], teal: 1},
];

// Captions live in a fixed TOP zone (below the logo, above all visuals)
const Caption: React.FC<{cue: Cue}> = ({cue}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const pop = spring({frame, fps, config: {damping: 14, stiffness: 220}});
  const scale = interpolate(pop, [0, 1], [0.7, 1]);
  const single = !cue.lines[1];
  return (
    <AbsoluteFill style={{alignItems: 'center', paddingTop: 330}}>
      <div
        style={{
          transform: `scale(${scale})`,
          fontFamily: anton.fontFamily,
          fontSize: single ? 132 : 100,
          lineHeight: 1.04,
          textAlign: 'center',
          color: WHITE,
          textShadow: '0 6px 40px rgba(0,0,0,0.8)',
          padding: '0 60px',
        }}
      >
        <div>{cue.lines[0]}</div>
        {cue.lines[1] ? (
          <div style={{color: cue.teal ? TEAL : WHITE}}>{cue.lines[1]}</div>
        ) : null}
      </div>
    </AbsoluteFill>
  );
};

// Fake calculator rows during the "enter your..." section
const CalcRow: React.FC<{label: string; value: string; delay: number}> = ({label, value, delay}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const s = spring({frame: frame - delay, fps, config: {damping: 16, stiffness: 180}});
  return (
    <div
      style={{
        opacity: s,
        transform: `translateY(${interpolate(s, [0, 1], [40, 0])}px)`,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        background: '#0a1218',
        border: `3px solid #14424f`,
        borderRadius: 28,
        padding: '34px 44px',
        marginBottom: 30,
        width: 820,
      }}
    >
      <span style={{fontFamily: archivo.fontFamily, fontSize: 40, color: MUTED}}>{label}</span>
      <span style={{fontFamily: archivo.fontFamily, fontWeight: 700, fontSize: 44, color: TEAL}}>{value}</span>
    </div>
  );
};

const ResultCard: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const s = spring({frame, fps, config: {damping: 12, stiffness: 200}});
  return (
    <div
      style={{
        opacity: s,
        transform: `scale(${interpolate(s, [0, 1], [0.8, 1])})`,
        background: TEAL_DEEP,
        borderRadius: 36,
        padding: '50px 80px',
        textAlign: 'center',
        boxShadow: '0 0 120px rgba(42,182,201,0.35)',
      }}
    >
      <div style={{fontFamily: archivo.fontFamily, fontSize: 38, color: '#d8f6fa', marginBottom: 10}}>
        Draw to
      </div>
      <div style={{fontFamily: anton.fontFamily, fontSize: 150, color: WHITE, lineHeight: 1}}>
        10 UNITS
      </div>
      <div style={{fontFamily: archivo.fontFamily, fontSize: 36, color: '#d8f6fa', marginTop: 12}}>
        on a U-100 syringe
      </div>
    </div>
  );
};

// Lively Buddy: spring entrance, continuous hop with squash-and-stretch,
// and a gentle side-to-side sway so he reads as alive, not a sticker.
const Buddy: React.FC<{size?: number}> = ({size = 480}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const s = spring({frame, fps, config: {damping: 10, stiffness: 150}});
  // Hop cycle: parabolic-ish bounce every ~0.8s
  const cycle = (frame % 24) / 24;
  const hop = Math.sin(cycle * Math.PI) * 34;
  // Squash on landing, stretch at hop peak
  const squash = 1 + Math.sin(cycle * Math.PI * 2) * 0.05;
  const sway = Math.sin(frame / 26) * 5;
  const tilt = Math.sin(frame / 19) * 3.5;
  return (
    <Img
      src={staticFile('buddy.png')}
      style={{
        width: size,
        transformOrigin: '50% 100%',
        transform: `scale(${s}) translateX(${sway * 6}px) translateY(${-hop}px) rotate(${tilt}deg) scaleX(${2 - squash}) scaleY(${squash})`,
        WebkitMaskImage:
          'radial-gradient(ellipse 60% 60% at 50% 48%, black 62%, transparent 88%)',
        maskImage:
          'radial-gradient(ellipse 60% 60% at 50% 48%, black 62%, transparent 88%)',
      }}
    />
  );
};

const Glow: React.FC = () => {
  const frame = useCurrentFrame();
  const pulse = 0.16 + 0.05 * Math.sin(frame / 20);
  return (
    <AbsoluteFill
      style={{
        background: `radial-gradient(ellipse 80% 45% at 50% 105%, rgba(24,141,211,${pulse}), rgba(5,9,12,0) 65%)`,
      }}
    />
  );
};

const Logo: React.FC<{small?: boolean}> = ({small}) => (
  <div style={{display: 'flex', alignItems: 'center', gap: 20}}>
    <div
      style={{
        width: small ? 64 : 96,
        height: small ? 64 : 96,
        borderRadius: small ? 16 : 24,
        background: WHITE,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <svg width={small ? 34 : 52} height={small ? 42 : 64} viewBox="0 0 34 42" fill="none">
        <path
          d="M17 1 C17 1 32 19 32 28 C32 36.3 25.3 41 17 41 C8.7 41 2 36.3 2 28 C2 19 17 1 17 1 Z"
          fill={TEAL_DEEP}
        />
      </svg>
    </div>
    <div style={{fontFamily: archivo.fontFamily, fontWeight: 700, fontSize: small ? 52 : 76}}>
      <span style={{color: WHITE}}>Buddy</span>
      <span style={{color: '#63E8F2'}}>Pept</span>
    </div>
  </div>
);

export const BuddyMath: React.FC = () => {
  const frame = useCurrentFrame();
  const sec = (s: number) => Math.round(s * FPS);

  return (
    <AbsoluteFill style={{background: BG}}>
      <Audio src={staticFile('voiceover.mp3')} />
      <Audio src={staticFile('music.wav')} volume={0.55} />
      <Glow />

      {/* Persistent logo top */}
      <AbsoluteFill style={{alignItems: 'center', paddingTop: 90}}>
        <Logo small />
      </AbsoluteFill>

      {/* Captions */}
      {CUES.map((cue) => (
        <Sequence key={cue.from} from={sec(cue.from)} durationInFrames={sec(cue.to - cue.from)}>
          <Caption cue={cue} />
        </Sequence>
      ))}

      {/* Buddy lives in the bottom zone (below y=1450), clear of cards and captions */}
      <Sequence from={sec(9.01)} durationInFrames={sec(22.47 - 9.01)}>
        <AbsoluteFill style={{justifyContent: 'flex-end', alignItems: 'center', paddingBottom: 70}}>
          <Buddy size={380} />
        </AbsoluteFill>
      </Sequence>

      {/* Calculator rows in the middle band (y ~800-1300) */}
      <Sequence from={sec(10.66)} durationInFrames={sec(13.98 - 10.66) + 8}>
        <AbsoluteFill style={{alignItems: 'center', paddingTop: 800}}>
          <div>
            <CalcRow label="Vial" value="5 mg" delay={0} />
            <CalcRow label="Bac water" value="2 mL" delay={sec(1.16)} />
            <CalcRow label="Target amount" value="0.25 mg" delay={sec(2.09)} />
          </div>
        </AbsoluteFill>
      </Sequence>

      {/* Result card in the middle band */}
      <Sequence from={sec(13.98)} durationInFrames={sec(19.86 - 13.98)}>
        <AbsoluteFill style={{alignItems: 'center', paddingTop: 840}}>
          <ResultCard />
        </AbsoluteFill>
      </Sequence>

      {/* End card from 22.99 */}
      <Sequence from={sec(22.47)}>
        <AbsoluteFill style={{background: BG}}>
          <Glow />
          <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center', gap: 50}}>
            <Buddy size={520} />
            <Logo />
            <div
              style={{
                background: TEAL_DEEP,
                borderRadius: 999,
                padding: '30px 70px',
                fontFamily: archivo.fontFamily,
                fontWeight: 700,
                fontSize: 58,
                color: WHITE,
                opacity: interpolate(frame, [sec(23.0), sec(23.6)], [0, 1], {
                  extrapolateLeft: 'clamp',
                  extrapolateRight: 'clamp',
                }),
              }}
            >
              buddypept.com
            </div>
            <div
              style={{
                fontFamily: archivo.fontFamily,
                fontSize: 30,
                color: '#5d7078',
                opacity: interpolate(frame, [sec(24.4), sec(25.0)], [0, 1], {
                  extrapolateLeft: 'clamp',
                  extrapolateRight: 'clamp',
                }),
              }}
            >
              Educational tool. Not medical advice. Research use only.
            </div>
          </AbsoluteFill>
        </AbsoluteFill>
      </Sequence>
    </AbsoluteFill>
  );
};
