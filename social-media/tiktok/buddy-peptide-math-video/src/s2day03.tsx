import React from 'react';
import {
  AbsoluteFill,
  Audio,
  Img,
  interpolate,
  OffthreadVideo,
  Sequence,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import {loadFont as loadAnton} from '@remotion/google-fonts/Anton';
import {loadFont as loadArchivo} from '@remotion/google-fonts/Archivo';
import type {Cue} from './locales';
import {BG, Buddy, Caption, FPS, Flag, Glow, Logo, MUTED, TEAL, TEAL_DEEP, WHITE} from './Video';

const anton = loadAnton();
const archivo = loadArchivo();

const AMBER = '#f59e0b';
const CYAN = '#7fe6f2';

type ClipCfg = {src: string; from: number; dur: number};

type S2Day3Config = {
  id: string;
  flag: 'us' | 'mx' | 'br';
  voFile: string;
  cues: Cue[];
  clips: ClipCfg[];
  hook: {from: number; to: number};
  rule: {from: number; to: number; title: string; body: string; source: string; maxNote: string};
  micro: {from: number; to: number; label: string; stamp: string};
  unknowns: {from: number; to: number; chips: string[]; chipAt: number[]};
  label: {from: number; to: number; title: string; example: string; exampleAt: number};
  verdict: {from: number; to: number; line1: string; line2: string};
  endFrom: number;
  dayChip: {from: number; label: string};
  disclaimer: string;
  durationSec: number;
};

const Cinematic: React.FC<{src: string}> = ({src}) => {
  const frame = useCurrentFrame();
  const fade = interpolate(frame, [0, 10], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return (
    <AbsoluteFill style={{opacity: fade}}>
      <OffthreadVideo src={staticFile(src)} muted style={{width: '100%', height: '100%', objectFit: 'cover'}} />
    </AbsoluteFill>
  );
};

const ClockFace: React.FC<{R: number; color: string; speed: number}> = ({R, color, speed}) => {
  const frame = useCurrentFrame();
  const minuteAngle = 40 + frame * speed;
  return (
    <svg width={R * 2} height={R * 2}>
      <circle cx={R} cy={R} r={R - 6} fill="none" stroke={color} strokeWidth={Math.max(4, R * 0.02)} style={{filter: `drop-shadow(0 0 ${R * 0.07}px ${color})`}} />
      {Array.from({length: 12}).map((_, i) => {
        const a = (i / 12) * Math.PI * 2;
        return (
          <line
            key={i}
            x1={R + Math.sin(a) * (R - 12)}
            y1={R - Math.cos(a) * (R - 12)}
            x2={R + Math.sin(a) * (R - 12 - R * 0.09)}
            y2={R - Math.cos(a) * (R - 12 - R * 0.09)}
            stroke={color}
            strokeWidth={i % 3 === 0 ? Math.max(4, R * 0.028) : Math.max(2, R * 0.014)}
          />
        );
      })}
      <line x1={R} y1={R} x2={R + Math.sin((minuteAngle * Math.PI) / 180) * (R * 0.72)} y2={R - Math.cos((minuteAngle * Math.PI) / 180) * (R * 0.72)} stroke={color} strokeWidth={Math.max(4, R * 0.028)} strokeLinecap="round" />
      <circle cx={R} cy={R} r={Math.max(6, R * 0.045)} fill={color} />
    </svg>
  );
};

// Beat 1-2: giant amber 28 with orbiting quote marks.
const Hook: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const s = spring({frame, fps, config: {damping: 9, stiffness: 180}});
  const pulse = 1 + 0.03 * Math.sin(frame / 5);
  return (
    <div style={{position: 'relative', width: 900, height: 760, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
      {Array.from({length: 6}).map((_, i) => {
        const a = (i / 6) * Math.PI * 2 + frame / 40;
        const d = spring({frame: frame - 10 - i * 6, fps, config: {damping: 12, stiffness: 160}});
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: 450 + Math.cos(a) * 340 - 40,
              top: 380 + Math.sin(a) * 300 - 50,
              opacity: d * 0.7,
              fontFamily: anton.fontFamily,
              fontSize: 90,
              color: '#5d7078',
            }}
          >
            {'“'}
          </div>
        );
      })}
      <div
        style={{
          opacity: s,
          transform: `scale(${interpolate(s, [0, 1], [2, 1]) * pulse})`,
          fontFamily: anton.fontFamily,
          fontSize: 420,
          lineHeight: 1,
          color: AMBER,
          textShadow: '0 0 120px rgba(245,158,11,0.45)',
        }}
      >
        28
      </div>
    </div>
  );
};

// Beat 3: the rule card with the SOURCE VERIFIED lower-third.
const RuleCard: React.FC<{title: string; body: string; source: string; maxNote: string}> = ({title, body, source, maxNote}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const flip = spring({frame, fps, config: {damping: 14, stiffness: 120}});
  const chip = spring({frame: frame - 45, fps, config: {damping: 12, stiffness: 200}});
  return (
    <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 40}}>
      <div
        style={{
          transform: `perspective(1400px) rotateY(${interpolate(flip, [0, 1], [-70, 0])}deg)`,
          opacity: flip,
          background: '#f2f4f5',
          borderRadius: 24,
          width: 860,
          padding: '44px 54px',
          boxShadow: '0 30px 90px rgba(0,0,0,0.55)',
          borderTop: `10px solid ${TEAL_DEEP}`,
        }}
      >
        <div style={{fontFamily: anton.fontFamily, fontSize: 50, color: '#0e2a30', letterSpacing: 1}}>{title}</div>
        <div style={{height: 3, background: '#c9d4da', margin: '20px 0'}} />
        <div style={{fontFamily: archivo.fontFamily, fontWeight: 700, fontSize: 40, lineHeight: 1.35, color: '#1c3a42'}}>{body}</div>
        <div style={{marginTop: 26, display: 'flex', alignItems: 'center', gap: 16}}>
          <div style={{background: AMBER, borderRadius: 12, padding: '10px 22px', fontFamily: anton.fontFamily, fontSize: 64, color: '#1a1206'}}>28</div>
          <div style={{fontFamily: archivo.fontFamily, fontWeight: 700, fontSize: 32, color: '#5d7078'}}>{maxNote}</div>
        </div>
      </div>
      <div
        style={{
          opacity: chip,
          transform: `translateY(${interpolate(chip, [0, 1], [30, 0])}px)`,
          display: 'flex',
          alignItems: 'center',
          gap: 18,
          background: 'rgba(10,18,24,0.92)',
          border: `3px solid ${TEAL}`,
          borderRadius: 999,
          padding: '14px 34px',
        }}
      >
        <div style={{width: 34, height: 34, borderRadius: 999, background: TEAL, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: anton.fontFamily, fontSize: 24, color: '#04262b'}}>{'✓'}</div>
        <div style={{fontFamily: anton.fontFamily, fontSize: 30, letterSpacing: 2, color: TEAL}}>SOURCE VERIFIED</div>
        <div style={{fontFamily: archivo.fontFamily, fontWeight: 700, fontSize: 28, color: MUTED}}>{source}</div>
      </div>
    </div>
  );
};

// Beat 4: the 28 stamp lands on the microbiology clock.
const MicroHome: React.FC<{label: string; stamp: string}> = ({label, stamp}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const s = spring({frame, fps, config: {damping: 13, stiffness: 150}});
  const slam = spring({frame: frame - 18, fps, config: {damping: 10, stiffness: 260}});
  return (
    <div style={{position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 26, opacity: s}}>
      <div style={{border: `4px solid ${CYAN}`, borderRadius: 999, padding: '14px 46px', fontFamily: anton.fontFamily, fontSize: 46, letterSpacing: 3, color: CYAN}}>{label}</div>
      <ClockFace R={260} color={CYAN} speed={3.4} />
      <div
        style={{
          position: 'absolute',
          top: 330,
          transform: `rotate(-12deg) scale(${interpolate(slam, [0, 1], [2.2, 1])})`,
          opacity: slam,
          border: `6px solid ${AMBER}`,
          background: 'rgba(26,18,6,0.92)',
          borderRadius: 20,
          padding: '18px 38px',
          fontFamily: anton.fontFamily,
          fontSize: 76,
          letterSpacing: 3,
          color: AMBER,
          boxShadow: '0 0 90px rgba(245,158,11,0.45)',
        }}
      >
        {stamp}
      </div>
    </div>
  );
};

// Beat 5: three things the 28 days doesn't know, around a vial.
const Unknowns: React.FC<{chips: string[]; chipAt: number[]}> = ({chips, chipAt}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const s = spring({frame, fps, config: {damping: 13, stiffness: 150}});
  const pos = [
    {left: 40, top: 60},
    {left: 560, top: 260},
    {left: 60, top: 520},
  ];
  return (
    <div style={{position: 'relative', width: 1000, height: 760, opacity: s}}>
      <div style={{position: 'absolute', left: 390, top: 110}}>
        <Img
          src={staticFile('vial-liquid.png')}
          style={{height: 520, borderRadius: 12, opacity: 0.85, WebkitMaskImage: 'linear-gradient(to right, transparent 0%, black 10%, black 90%, transparent 100%)', maskImage: 'linear-gradient(to right, transparent 0%, black 10%, black 90%, transparent 100%)'}}
        />
      </div>
      {chips.map((c, i) => {
        const d = spring({frame: frame - chipAt[i], fps, config: {damping: 11, stiffness: 220}});
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: pos[i].left,
              top: pos[i].top,
              opacity: d,
              transform: `scale(${interpolate(d, [0, 1], [0.5, 1])})`,
              display: 'flex',
              alignItems: 'center',
              gap: 16,
              background: '#1a1206',
              border: `4px solid ${AMBER}`,
              borderRadius: 999,
              padding: '16px 34px',
            }}
          >
            <div style={{fontFamily: anton.fontFamily, fontSize: 44, color: AMBER}}>?</div>
            <div style={{fontFamily: anton.fontFamily, fontSize: 40, letterSpacing: 1, color: WHITE}}>{c}</div>
          </div>
        );
      })}
    </div>
  );
};

// Beat 6: the label card wins.
const LabelWins: React.FC<{title: string; example: string; exampleAt: number}> = ({title, example, exampleAt}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const s = spring({frame, fps, config: {damping: 12, stiffness: 170}});
  const e = spring({frame: frame - exampleAt, fps, config: {damping: 11, stiffness: 220}});
  return (
    <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 36}}>
      <div
        style={{
          opacity: s,
          transform: `translateY(${interpolate(s, [0, 1], [120, 0])}px)`,
          background: '#f2f4f5',
          borderRadius: 24,
          width: 780,
          padding: '40px 50px',
          borderLeft: `14px solid ${TEAL}`,
          boxShadow: '0 30px 90px rgba(42,182,201,0.3)',
        }}
      >
        <div style={{fontFamily: archivo.fontFamily, fontWeight: 700, fontSize: 28, letterSpacing: 3, color: '#5d7078'}}>PRODUCT LABEL</div>
        <div style={{fontFamily: anton.fontFamily, fontSize: 70, color: '#0e2a30', marginTop: 10, lineHeight: 1.1}}>{title}</div>
        <div style={{marginTop: 22, display: 'flex', flexDirection: 'column', gap: 12}}>
          {[0, 1, 2].map((i) => (
            <div key={i} style={{height: 16, width: `${90 - i * 18}%`, background: '#c9d4da', borderRadius: 8}} />
          ))}
        </div>
      </div>
      <div style={{opacity: e, transform: `scale(${interpolate(e, [0, 1], [0.6, 1])})`, background: '#0a1218', border: `4px solid ${AMBER}`, borderRadius: 999, padding: '16px 40px', fontFamily: archivo.fontFamily, fontWeight: 700, fontSize: 36, color: AMBER}}>{example}</div>
    </div>
  );
};

// Beat 7: the verdict card.
const Verdict: React.FC<{line1: string; line2: string}> = ({line1, line2}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const s = spring({frame, fps, config: {damping: 11, stiffness: 190}});
  const l2 = spring({frame: frame - 30, fps, config: {damping: 11, stiffness: 190}});
  return (
    <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 28}}>
      <div style={{opacity: s, transform: `scale(${interpolate(s, [0, 1], [0.7, 1])})`, background: TEAL_DEEP, border: `5px solid ${TEAL}`, borderRadius: 30, padding: '34px 50px', fontFamily: anton.fontFamily, fontSize: 64, color: WHITE, textAlign: 'center', boxShadow: '0 0 90px rgba(42,182,201,0.45)'}}>{line1}</div>
      <div style={{opacity: l2, transform: `scale(${interpolate(l2, [0, 1], [0.7, 1])})`, background: '#1a1206', border: `5px solid ${AMBER}`, borderRadius: 30, padding: '26px 44px', fontFamily: anton.fontFamily, fontSize: 52, color: AMBER, textAlign: 'center'}}>{line2}</div>
    </div>
  );
};

export const S2Day3: React.FC<{locale: S2Day3Config}> = ({locale}) => {
  const frame = useCurrentFrame();
  const sec = (s: number) => Math.round(s * FPS);
  const L = locale;

  return (
    <AbsoluteFill style={{background: BG}}>
      <Audio src={staticFile(L.voFile)} />
      <Audio src={staticFile('music.wav')} volume={0.45} />
      <Glow />

      {L.clips.map((c) => (
        <Sequence key={c.src + c.from} from={sec(c.from)} durationInFrames={sec(c.dur)}>
          <Cinematic src={c.src} />
        </Sequence>
      ))}

      <Sequence from={sec(L.hook.from)} durationInFrames={sec(L.hook.to - L.hook.from)}>
        <AbsoluteFill style={{alignItems: 'center', paddingTop: 620}}>
          <Hook />
        </AbsoluteFill>
      </Sequence>

      <Sequence from={sec(L.rule.from)} durationInFrames={sec(L.rule.to - L.rule.from)}>
        <AbsoluteFill style={{alignItems: 'center', paddingTop: 640}}>
          <RuleCard title={L.rule.title} body={L.rule.body} source={L.rule.source} maxNote={L.rule.maxNote} />
        </AbsoluteFill>
      </Sequence>

      <Sequence from={sec(L.micro.from)} durationInFrames={sec(L.micro.to - L.micro.from)}>
        <AbsoluteFill style={{alignItems: 'center', paddingTop: 620}}>
          <MicroHome label={L.micro.label} stamp={L.micro.stamp} />
        </AbsoluteFill>
      </Sequence>

      <Sequence from={sec(L.unknowns.from)} durationInFrames={sec(L.unknowns.to - L.unknowns.from)}>
        <AbsoluteFill style={{alignItems: 'center', paddingTop: 600}}>
          <Unknowns chips={L.unknowns.chips} chipAt={L.unknowns.chipAt.map((t) => sec(t - L.unknowns.from))} />
        </AbsoluteFill>
      </Sequence>

      <Sequence from={sec(L.label.from)} durationInFrames={sec(L.label.to - L.label.from)}>
        <AbsoluteFill style={{alignItems: 'center', paddingTop: 680}}>
          <LabelWins title={L.label.title} example={L.label.example} exampleAt={sec(L.label.exampleAt - L.label.from)} />
        </AbsoluteFill>
      </Sequence>

      <Sequence from={sec(L.verdict.from)} durationInFrames={sec(L.verdict.to - L.verdict.from)}>
        <AbsoluteFill style={{alignItems: 'center', paddingTop: 760}}>
          <Verdict line1={L.verdict.line1} line2={L.verdict.line2} />
        </AbsoluteFill>
      </Sequence>

      <AbsoluteFill style={{alignItems: 'center', paddingTop: 90}}>
        <Logo small />
      </AbsoluteFill>
      <Flag code={L.flag} />

      {L.cues.map((cue) => (
        <Sequence key={cue.from} from={sec(cue.from)} durationInFrames={sec(cue.to - cue.from)}>
          <Caption cue={cue} />
        </Sequence>
      ))}

      <Sequence from={sec(L.endFrom)}>
        <AbsoluteFill style={{background: BG}}>
          <Glow />
          <Flag code={L.flag} />
          <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center', gap: 42}}>
            <div
              style={{
                border: `3px solid ${TEAL}`,
                borderRadius: 999,
                padding: '18px 48px',
                fontFamily: anton.fontFamily,
                fontSize: 54,
                color: TEAL,
                letterSpacing: 2,
                opacity: interpolate(frame, [sec(L.dayChip.from), sec(L.dayChip.from + 0.5)], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}),
              }}
            >
              {L.dayChip.label}
            </div>
            <Buddy size={440} />
            <Logo />
            <div
              style={{
                background: TEAL_DEEP,
                borderRadius: 999,
                padding: '28px 66px',
                fontFamily: archivo.fontFamily,
                fontWeight: 700,
                fontSize: 56,
                color: WHITE,
                opacity: interpolate(frame, [sec(L.endFrom + 0.4), sec(L.endFrom + 1)], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}),
              }}
            >
              buddypept.com
            </div>
            <div
              style={{
                fontFamily: archivo.fontFamily,
                fontSize: 30,
                color: '#5d7078',
                opacity: interpolate(frame, [sec(L.endFrom + 1.4), sec(L.endFrom + 2)], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}),
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

export const S2DAY3_EN: S2Day3Config = {
  id: 'S2Day3EN',
  flag: 'us',
  voFile: 's2-d3-vo-en.mp3',
  cues: [
    {from: 0.05, to: 2.54, lines: ['28 DAYS.', 'EVERYONE QUOTES IT.'], teal: 1},
    {from: 2.54, to: 6.2, lines: ['ALMOST NOBODY KNOWS', "WHERE IT'S FROM."]},
    {from: 6.2, to: 13.36, lines: ['A PHARMACY RULE FOR', 'OPENED MULTI-DOSE VIALS.'], teal: 1},
    {from: 13.36, to: 20.59, lines: ['PUNCTURED VIAL: DISCARD', 'WITHIN 28 DAYS.']},
    {from: 20.59, to: 25.26, lines: ["IT'S ABOUT CONTAMINATION.", 'THE MICROBIOLOGY CLOCK.'], teal: 1},
    {from: 25.26, to: 31.18, lines: ['NEVER A MEASUREMENT', 'OF YOUR PEPTIDE.']},
    {from: 31.18, to: 35.31, lines: ["28 DAYS DOESN'T KNOW", "WHAT'S IN YOUR VIAL."], teal: 1},
    {from: 35.31, to: 41.34, lines: ['WHAT DECIDES?', 'THE LABEL ALWAYS WINS.'], teal: 1},
    {from: 41.34, to: 46.22, lines: ['A CEILING FOR THE VIAL.', 'NEVER A PROMISE.']},
    {from: 46.22, to: 50.83, lines: ['DAY 3 OF 10.', "SOURCES DON'T LIE."], teal: 1},
  ],
  clips: [{src: 's2-clip4.mp4', from: 46.22, dur: 4.61}],
  hook: {from: 0, to: 6.2},
  rule: {
    from: 6.2,
    to: 21.37,
    title: 'OPENED MULTI-DOSE VIAL',
    body: 'Once punctured, discard within 28 days, unless the manufacturer specifies otherwise.',
    source: 'USP <797> + CDC injection safety',
    maxNote: 'days max, opened vial',
  },
  micro: {from: 21.37, to: 25.26, label: 'MICROBIOLOGY', stamp: '28 DAYS'},
  unknowns: {
    from: 25.26,
    to: 35.31,
    chips: ['YOUR MOLECULE', 'YOUR TEMPERATURE', 'YOUR HANDLING'],
    chipAt: [28.0, 32.0, 33.6],
  },
  label: {from: 35.31, to: 41.34, title: 'THE LABEL WINS', example: 'some labels say: use immediately', exampleAt: 38.57},
  verdict: {from: 41.34, to: 46.22, line1: '28 DAYS = A CEILING FOR THE VIAL', line2: 'NEVER A PROMISE FOR THE CHEMISTRY'},
  endFrom: 50.83,
  dayChip: {from: 50.83, label: 'DAY 3 OF 10'},
  disclaimer: 'Educational tool. Not medical advice. For research purposes only.',
  durationSec: 56,
};

export const S2DAY3_PT: S2Day3Config = {
  id: 'S2Day3PT',
  flag: 'br',
  voFile: 's2-d3-vo-pt.mp3',
  cues: [
    {from: 0.1, to: 2.99, lines: ['28 DIAS.', 'TODO MUNDO REPETE.'], teal: 1},
    {from: 2.99, to: 6.65, lines: ['QUASE NINGUÉM SABE', 'DE ONDE VEM.']},
    {from: 6.65, to: 14.31, lines: ['UMA REGRA DE FARMÁCIA PARA', 'FRASCOS MULTIDOSE ABERTOS.'], teal: 1},
    {from: 14.31, to: 21.73, lines: ['PERFURADO: DESCARTE', 'EM ATÉ 28 DIAS.']},
    {from: 21.73, to: 26.66, lines: ['É SOBRE CONTAMINAÇÃO.', 'O RELÓGIO DA MICROBIOLOGIA.'], teal: 1},
    {from: 26.66, to: 32.61, lines: ['NUNCA FOI UMA MEDIDA', 'DO SEU PEPTÍDEO.']},
    {from: 32.61, to: 36.77, lines: ['28 DIAS NÃO SABEM', 'O QUE HÁ NO FRASCO.'], teal: 1},
    {from: 36.77, to: 44.48, lines: ['O QUE DECIDE?', 'O RÓTULO SEMPRE VENCE.'], teal: 1},
    {from: 44.48, to: 49.21, lines: ['UM LIMITE PARA O FRASCO.', 'NUNCA UMA PROMESSA.']},
    {from: 49.21, to: 53.65, lines: ['DIA 3 DE 10.', 'AS FONTES NÃO MENTEM.'], teal: 1},
  ],
  clips: [{src: 's2-clip4.mp4', from: 49.21, dur: 4.44}],
  hook: {from: 0, to: 6.65},
  rule: {
    from: 6.65,
    to: 22.69,
    title: 'FRASCO MULTIDOSE ABERTO',
    body: 'Depois de perfurado, descarte em até 28 dias, a menos que o fabricante especifique outro prazo.',
    source: 'USP <797> + CDC segurança em injeções',
    maxNote: 'dias no máximo, frasco aberto',
  },
  micro: {from: 22.69, to: 26.66, label: 'MICROBIOLOGIA', stamp: '28 DIAS'},
  unknowns: {
    from: 26.66,
    to: 36.77,
    chips: ['SUA MOLÉCULA', 'SUA TEMPERATURA', 'SEU MANUSEIO'],
    chipAt: [29.5, 33.6, 35.2],
  },
  label: {from: 36.77, to: 44.48, title: 'O RÓTULO VENCE', example: 'alguns rótulos dizem: use imediatamente', exampleAt: 41.02},
  verdict: {from: 44.48, to: 49.21, line1: '28 DIAS = LIMITE PARA O FRASCO', line2: 'NUNCA UMA PROMESSA PARA A QUÍMICA'},
  endFrom: 53.65,
  dayChip: {from: 53.65, label: 'DIA 3 DE 10'},
  disclaimer: 'Ferramenta educacional. Não é orientação médica. Somente para fins de pesquisa.',
  durationSec: 60,
};

export const S2DAY3_ES: S2Day3Config = {
  id: 'S2Day3ES',
  flag: 'mx',
  voFile: 's2-d3-vo-es.mp3',
  cues: [
    {from: 0.1, to: 4.32, lines: ['28 DÍAS.', 'TODO EL MUNDO LO REPITE.'], teal: 1},
    {from: 4.32, to: 9.6, lines: ['CASI NADIE SABE', 'DE DÓNDE VIENE.']},
    {from: 9.6, to: 18.79, lines: ['UNA REGLA DE FARMACIA PARA', 'VIALES MULTIDOSIS ABIERTOS.'], teal: 1},
    {from: 18.79, to: 27.1, lines: ['VIAL PERFORADO: DESECHAR', 'DENTRO DE 28 DÍAS.']},
    {from: 27.1, to: 34.74, lines: ['SE TRATA DE CONTAMINACIÓN.', 'EL RELOJ DE LA MICROBIOLOGÍA.'], teal: 1},
    {from: 34.74, to: 41.74, lines: ['NUNCA FUE UNA MEDIDA', 'DE TU PÉPTIDO.']},
    {from: 41.74, to: 46.33, lines: ['28 DÍAS NO SABEN', 'QUÉ HAY EN TU VIAL.'], teal: 1},
    {from: 46.33, to: 56.38, lines: ['¿QUÉ DECIDE?', 'LA ETIQUETA SIEMPRE GANA.'], teal: 1},
    {from: 56.38, to: 62.58, lines: ['UN LÍMITE PARA EL VIAL.', 'NUNCA UNA PROMESA.']},
    {from: 62.58, to: 68.81, lines: ['DÍA 3 DE 10.', 'LAS FUENTES NO MIENTEN.'], teal: 1},
  ],
  clips: [{src: 's2-clip4.mp4', from: 62.58, dur: 5.04}],
  hook: {from: 0, to: 9.6},
  rule: {
    from: 9.6,
    to: 28.88,
    title: 'VIAL MULTIDOSIS ABIERTO',
    body: 'Una vez perforado, desechar dentro de 28 días, salvo que el fabricante especifique otro plazo.',
    source: 'USP <797> + CDC seguridad en inyecciones',
    maxNote: 'días como máximo, vial abierto',
  },
  micro: {from: 28.88, to: 34.74, label: 'MICROBIOLOGÍA', stamp: '28 DÍAS'},
  unknowns: {
    from: 34.74,
    to: 46.33,
    chips: ['TU MOLÉCULA', 'TU TEMPERATURA', 'TU MANEJO'],
    chipAt: [38.5, 43.0, 44.8],
  },
  label: {from: 46.33, to: 56.38, title: 'LA ETIQUETA GANA', example: 'algunas etiquetas dicen: usar de inmediato', exampleAt: 52.27},
  verdict: {from: 56.38, to: 62.58, line1: '28 DÍAS = LÍMITE PARA EL VIAL', line2: 'NUNCA UNA PROMESA PARA LA QUÍMICA'},
  endFrom: 68.81,
  dayChip: {from: 68.81, label: 'DÍA 3 DE 10'},
  disclaimer: 'Herramienta educativa. No es consejo médico. Solo con fines de investigación.',
  durationSec: 76,
};
