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
import type {Cue, LocaleConfig} from './locales';

const anton = loadAnton();
const archivo = loadArchivo();

export const FPS = 30;
export const WHITE = '#F5F7FA';
export const TEAL = '#2ab6c9';
export const TEAL_DEEP = '#0C8092';
export const BG = '#05090c';
export const MUTED = '#c9d4da';

// Small country flag, top-left corner, legible at grid-thumbnail size
export const Flag: React.FC<{code: 'us' | 'mx' | 'br'}> = ({code}) => {
  const W = 120;
  const H = 80;
  return (
    <div
      style={{
        position: 'absolute',
        top: 70,
        left: 56,
        width: W,
        height: H,
        borderRadius: 14,
        overflow: 'hidden',
        border: '3px solid rgba(245,247,250,0.35)',
        boxShadow: '0 4px 24px rgba(0,0,0,0.6)',
      }}
    >
      {code === 'us' ? (
        <svg width={W} height={H} viewBox="0 0 120 80">
          <rect width="120" height="80" fill="#b22234" />
          {[1, 3, 5].map((i) => (
            <rect key={i} y={(i * 80) / 7} width="120" height={80 / 7} fill="#fff" />
          ))}
          <rect width="54" height={(80 / 7) * 4} fill="#3c3b6e" />
          {Array.from({length: 12}).map((_, i) => (
            <circle
              key={i}
              cx={8 + (i % 4) * 13}
              cy={9 + Math.floor(i / 4) * 13}
              r="2.6"
              fill="#fff"
            />
          ))}
        </svg>
      ) : code === 'mx' ? (
        <svg width={W} height={H} viewBox="0 0 120 80">
          <rect width="40" height="80" fill="#006847" />
          <rect x="40" width="40" height="80" fill="#fff" />
          <rect x="80" width="40" height="80" fill="#ce1126" />
          <circle cx="60" cy="40" r="11" fill="none" stroke="#8c6a1f" strokeWidth="2.5" />
          <circle cx="60" cy="40" r="5" fill="#6b4f17" />
        </svg>
      ) : (
        <svg width={W} height={H} viewBox="0 0 120 80">
          <rect width="120" height="80" fill="#009c3b" />
          <polygon points="60,8 110,40 60,72 10,40" fill="#ffdf00" />
          <circle cx="60" cy="40" r="17" fill="#002776" />
          <path d="M44 37 C 54 32, 68 33, 76 42" stroke="#fff" strokeWidth="3.4" fill="none" />
        </svg>
      )}
    </div>
  );
};

// Captions live in a fixed TOP zone (below the logo, above all visuals)
export const Caption: React.FC<{cue: Cue}> = ({cue}) => {
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
          fontSize: single ? 132 : 96,
          lineHeight: 1.06,
          textAlign: 'center',
          color: WHITE,
          textShadow: '0 6px 40px rgba(0,0,0,0.8)',
          padding: '0 50px',
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
        gap: 30,
      }}
    >
      <span style={{fontFamily: archivo.fontFamily, fontSize: 40, color: MUTED}}>{label}</span>
      <span style={{fontFamily: archivo.fontFamily, fontWeight: 700, fontSize: 44, color: TEAL}}>{value}</span>
    </div>
  );
};

const ResultCard: React.FC<{top: string; mid: string; bottom: string}> = ({top, mid, bottom}) => {
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
        {top}
      </div>
      <div style={{fontFamily: anton.fontFamily, fontSize: 140, color: WHITE, lineHeight: 1}}>
        {mid}
      </div>
      <div style={{fontFamily: archivo.fontFamily, fontSize: 36, color: '#d8f6fa', marginTop: 12}}>
        {bottom}
      </div>
    </div>
  );
};

// Lively Buddy: spring entrance, continuous hop with squash-and-stretch,
// and a gentle side-to-side sway so he reads as alive, not a sticker.
export const Buddy: React.FC<{size?: number}> = ({size = 480}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const s = spring({frame, fps, config: {damping: 10, stiffness: 150}});
  const cycle = (frame % 24) / 24;
  const hop = Math.sin(cycle * Math.PI) * 34;
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

export const Glow: React.FC = () => {
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

export const Logo: React.FC<{small?: boolean}> = ({small}) => (
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

export const BuddyMath: React.FC<{locale: LocaleConfig}> = ({locale}) => {
  const frame = useCurrentFrame();
  const sec = (s: number) => Math.round(s * FPS);
  const L = locale;

  return (
    <AbsoluteFill style={{background: BG}}>
      <Audio src={staticFile(L.voFile)} />
      <Audio src={staticFile('music.wav')} volume={0.55} />
      <Glow />

      {/* Persistent logo top + flag top-left */}
      <AbsoluteFill style={{alignItems: 'center', paddingTop: 90}}>
        <Logo small />
      </AbsoluteFill>
      <Flag code={L.flag} />

      {/* Captions */}
      {L.cues.map((cue) => (
        <Sequence key={cue.from} from={sec(cue.from)} durationInFrames={sec(cue.to - cue.from)}>
          <Caption cue={cue} />
        </Sequence>
      ))}

      {/* Buddy lives in the bottom zone, clear of cards and captions */}
      <Sequence from={sec(L.buddy.from)} durationInFrames={sec(L.buddy.to - L.buddy.from)}>
        <AbsoluteFill style={{justifyContent: 'flex-end', alignItems: 'center', paddingBottom: 70}}>
          <Buddy size={380} />
        </AbsoluteFill>
      </Sequence>

      {/* Calculator rows in the middle band */}
      <Sequence from={sec(L.calc.from)} durationInFrames={sec(L.calc.to - L.calc.from) + 8}>
        <AbsoluteFill style={{alignItems: 'center', paddingTop: 800}}>
          <div>
            {L.calc.rows.map((r) => (
              <CalcRow key={r.label} label={r.label} value={r.value} delay={sec(r.delay)} />
            ))}
          </div>
        </AbsoluteFill>
      </Sequence>

      {/* Result card in the middle band */}
      <Sequence from={sec(L.result.from)} durationInFrames={sec(L.result.to - L.result.from)}>
        <AbsoluteFill style={{alignItems: 'center', paddingTop: 840}}>
          <ResultCard top={L.result.top} mid={L.result.mid} bottom={L.result.bottom} />
        </AbsoluteFill>
      </Sequence>

      {/* End card */}
      <Sequence from={sec(L.endFrom)}>
        <AbsoluteFill style={{background: BG}}>
          <Glow />
          <Flag code={L.flag} />
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
                opacity: interpolate(
                  frame,
                  [sec(L.endFrom + 0.5), sec(L.endFrom + 1.1)],
                  [0, 1],
                  {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}
                ),
              }}
            >
              buddypept.com
            </div>
            <div
              style={{
                fontFamily: archivo.fontFamily,
                fontSize: 30,
                color: '#5d7078',
                opacity: interpolate(
                  frame,
                  [sec(L.endFrom + 1.9), sec(L.endFrom + 2.5)],
                  [0, 1],
                  {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}
                ),
              }}
            >
              {L.disclaimer}
            </div>
          </AbsoluteFill>
        </AbsoluteFill>
      </Sequence>
    </AbsoluteFill>
  );
};
