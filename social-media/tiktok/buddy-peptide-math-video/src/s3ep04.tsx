import React from 'react';
import {AbsoluteFill, Audio, Img, interpolate, OffthreadVideo, Sequence, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {loadFont as loadAnton} from '@remotion/google-fonts/Anton';
import {loadFont as loadArchivo} from '@remotion/google-fonts/Archivo';
import type {Cue} from './locales';
import {BG, Buddy, Caption, FPS, Flag, Glow, Logo, TEAL, TEAL_DEEP, WHITE} from './Video';
import {AMBER} from './s3ep01';

const anton = loadAnton();
const archivo = loadArchivo();

type Span = {from: number; to: number};

type ChainBeat = {videoSrc: string; holdSrc: string; from: number; videoDur: number; to: number; name: string; nameAt: number; seq: string};

type S3Ep4Config = {
  id: string;
  flag: 'us' | 'mx' | 'br';
  voFile: string;
  cues: Cue[];
  beats: [ChainBeat, ChainBeat, ChainBeat];
  verdict: Span & {line2At: number; line1: string; line2: string};
  endFrom: number;
  seriesChip: string;
  disclaimer: string;
  durationSec: number;
};

// One organize beat: plays the Runway clip, then freezes on its last frame while the name chip and its real sequence snippet fade in.
const ShotBeat: React.FC<{videoSrc: string; holdSrc: string; videoDurFrames: number; nameAtFrame: number; name: string; seq: string}> = ({videoSrc, holdSrc, videoDurFrames, nameAtFrame, name, seq}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const c = spring({frame: frame - nameAtFrame, fps, config: {damping: 10, stiffness: 210}});
  const s = spring({frame: frame - nameAtFrame - 8, fps, config: {damping: 12, stiffness: 190}});
  return (
    <AbsoluteFill style={{background: BG}}>
      {frame < videoDurFrames ? (
        <OffthreadVideo src={staticFile(videoSrc)} muted style={{width: '100%', height: '100%', objectFit: 'cover'}} />
      ) : (
        <Img src={staticFile(holdSrc)} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
      )}
      <AbsoluteFill style={{alignItems: 'center', justifyContent: 'flex-end', paddingBottom: 200}}>
        <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 26}}>
          <div style={{opacity: c, transform: `scale(${interpolate(c, [0, 1], [0.4, 1])})`, background: '#1a1206', border: `9px solid ${AMBER}`, borderRadius: 999, padding: '32px 68px', boxShadow: `0 0 100px rgba(245,158,11,0.65)`}}>
            <span style={{fontFamily: anton.fontFamily, fontSize: 92, letterSpacing: 2, color: AMBER}}>{name}</span>
          </div>
          <div style={{opacity: s, transform: `translateY(${interpolate(s, [0, 1], [14, 0])}px)`, background: 'rgba(10,8,4,0.7)', borderRadius: 16, padding: '10px 28px', fontFamily: archivo.fontFamily, fontWeight: 700, fontSize: 42, letterSpacing: 4, color: '#f5dba3'}}>{seq}</div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// Looping insert of Buddy pointing up, reused from Episode 3, sized large and shifted slightly right so his raised arm reads as pointing at the verdict card above.
const BuddyPointClip: React.FC = () => {
  const frame = useCurrentFrame();
  const fade = interpolate(frame, [0, 12], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return (
    <AbsoluteFill style={{justifyContent: 'flex-end', alignItems: 'center', paddingBottom: 190, opacity: fade}}>
      <div style={{width: 460, height: 460, marginLeft: 130, borderRadius: '50%', overflow: 'hidden', WebkitMaskImage: 'radial-gradient(circle, black 55%, transparent 78%)'}}>
        <OffthreadVideo src={staticFile('s3-e03-buddy-point.mp4')} muted style={{width: '100%', height: '100%', objectFit: 'cover'}} />
      </div>
    </AbsoluteFill>
  );
};

const Verdict: React.FC<{line2At: number; line1: string; line2: string}> = ({line2At, line1, line2}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const s = spring({frame, fps, config: {damping: 11, stiffness: 190}});
  const l2 = spring({frame: frame - line2At, fps, config: {damping: 11, stiffness: 190}});
  return (
    <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 30}}>
      <div style={{opacity: s, transform: `scale(${interpolate(s, [0, 1], [0.6, 1])})`, background: TEAL_DEEP, border: `5px solid ${TEAL}`, borderRadius: 30, padding: '30px 60px', fontFamily: anton.fontFamily, fontSize: 76, color: WHITE, textAlign: 'center', maxWidth: 980, boxShadow: '0 0 90px rgba(42,182,201,0.45)'}}>{line1}</div>
      <div style={{opacity: l2, transform: `scale(${interpolate(l2, [0, 1], [0.7, 1])})`, background: '#1a1206', border: `5px solid ${AMBER}`, borderRadius: 30, padding: '22px 50px', fontFamily: anton.fontFamily, fontSize: 54, color: AMBER, textAlign: 'center', maxWidth: 980}}>{line2}</div>
    </div>
  );
};

export const S3Ep4: React.FC<{locale: S3Ep4Config}> = ({locale}) => {
  const frame = useCurrentFrame();
  const sec = (s: number) => Math.round(s * FPS);
  const L = locale;
  const span = (x: Span) => ({from: sec(x.from), durationInFrames: sec(x.to - x.from)});
  const rel = (t: number, base: Span) => sec(t - base.from);

  return (
    <AbsoluteFill style={{background: BG}}>
      <Audio src={staticFile(L.voFile)} />
      <Audio src={staticFile('music.wav')} volume={0.45} />
      <Glow />

      {L.beats.map((b, i) => (
        <Sequence key={i} {...span(b)}>
          <ShotBeat videoSrc={b.videoSrc} holdSrc={b.holdSrc} videoDurFrames={sec(b.videoDur)} nameAtFrame={rel(b.nameAt, b)} name={b.name} seq={b.seq} />
        </Sequence>
      ))}

      <Sequence {...span(L.verdict)}>
        <AbsoluteFill style={{alignItems: 'center', paddingTop: 560}}>
          <Verdict line2At={rel(L.verdict.line2At, L.verdict)} line1={L.verdict.line1} line2={L.verdict.line2} />
        </AbsoluteFill>
      </Sequence>

      <Sequence {...span(L.verdict)}>
        <BuddyPointClip />
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
            <div style={{background: TEAL_DEEP, borderRadius: 999, padding: '18px 52px', fontFamily: anton.fontFamily, fontSize: 50, color: WHITE, letterSpacing: 3, opacity: interpolate(frame, [sec(L.endFrom), sec(L.endFrom + 0.5)], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})}}>{L.seriesChip}</div>
            <Buddy size={440} />
            <Logo />
            <div style={{background: TEAL_DEEP, borderRadius: 999, padding: '28px 66px', fontFamily: archivo.fontFamily, fontWeight: 700, fontSize: 56, color: WHITE, opacity: interpolate(frame, [sec(L.endFrom + 0.4), sec(L.endFrom + 1)], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})}}>buddypept.com</div>
            <div style={{fontFamily: archivo.fontFamily, fontSize: 30, color: '#5d7078', opacity: interpolate(frame, [sec(L.endFrom + 1.4), sec(L.endFrom + 2)], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})}}>{L.disclaimer}</div>
          </AbsoluteFill>
        </AbsoluteFill>
      </Sequence>
    </AbsoluteFill>
  );
};

export const S3EP4_EN: S3Ep4Config = {
  id: 'S3Ep4EN',
  flag: 'us',
  voFile: 's3-e04-vo-en.mp3',
  cues: [
    {from: 0.05, to: 3.25, lines: ['EVERY AMINO-CHAIN IS', 'BUILT FROM THE SAME ALPHABET.'], teal: 1},
    {from: 3.25, to: 4.33, lines: ['NOT', 'LETTERS.']},
    {from: 4.33, to: 6.07, lines: ['TWENTY', 'AMINO ACIDS.'], teal: 1},
    {from: 6.07, to: 10.43, lines: ['EACH ONE GETS A CODE,', 'LIKE A LETTER IN A WORD.']},
    {from: 10.43, to: 13.63, lines: ['PUT THEM IN', 'THIS ORDER:'], teal: 1},
    {from: 13.63, to: 17.84, lines: ['MIX THEM, DIFFERENT ORDER:']},
    {from: 17.84, to: 22.04, lines: ['DIFFERENT ORDER', 'AGAIN:'], teal: 1},
    {from: 22.04, to: 24.74, lines: ['SAME 20 LETTERS,', 'EVERY SINGLE TIME.']},
    {from: 24.74, to: 26.90, lines: ['NOT ABOUT WHICH', 'LETTERS EXIST.'], teal: 1},
    {from: 26.90, to: 28.80, lines: ['ABOUT THE ORDER', 'YOU PUT THEM IN.']},
    {from: 28.80, to: 30.94, lines: ['FOLLOW FOR MORE', 'PEPTIDE SCIENCE.'], teal: 1},
  ],
  beats: [
    {videoSrc: 's3-e04-shot1.mp4', holdSrc: 's3-e04-shot1-hold.png', from: 0, videoDur: 5.03, to: 13.63, name: 'MOTS-C', nameAt: 12.0, seq: 'M-R-W-Q-E-M...'},
    {videoSrc: 's3-e04-shot2.mp4', holdSrc: 's3-e04-shot2-hold.png', from: 13.63, videoDur: 5.03, to: 18.66, name: 'RETATRUTIDE', nameAt: 17.42, seq: 'Y-X-Q-G-T-F...'},
    {videoSrc: 's3-e04-shot3.mp4', holdSrc: 's3-e04-shot3-hold.png', from: 18.66, videoDur: 5.03, to: 24.74, name: 'BPC-157', nameAt: 22.82, seq: 'G-E-P-P-P-G...'},
  ],
  verdict: {from: 24.74, to: 30.94, line2At: 26.90, line1: 'SAME 20 LETTERS.', line2: 'THE ORDER IS THE IDENTITY.'},
  endFrom: 30.94,
  seriesChip: 'INSIDE THE VIAL',
  disclaimer: 'Educational tool. Not medical advice. For research purposes only.',
  durationSec: 37,
};

export const S3EP4_PT: S3Ep4Config = {
  id: 'S3Ep4PT',
  flag: 'br',
  voFile: 's3-e04-vo-pt.mp3',
  cues: [
    {from: 0.1, to: 4.26, lines: ['TODA CADEIA É CONSTRUÍDA', 'A PARTIR DO MESMO ALFABETO.'], teal: 1},
    {from: 4.21, to: 5.3, lines: ['NÃO', 'LETRAS.']},
    {from: 5.3, to: 6.8, lines: ['VINTE', 'AMINOÁCIDOS.'], teal: 1},
    {from: 6.8, to: 11.75, lines: ['CADA UM TEM UM CÓDIGO,', 'COMO UMA LETRA EM UMA PALAVRA.']},
    {from: 11.75, to: 15.22, lines: ['COLOQUE NESTA', 'ORDEM:'], teal: 1},
    {from: 15.22, to: 19.55, lines: ['MISTURE, ORDEM DIFERENTE:']},
    {from: 19.55, to: 23.54, lines: ['ORDEM DIFERENTE', 'DE NOVO:'], teal: 1},
    {from: 23.54, to: 25.69, lines: ['MESMAS 20 LETRAS,', 'SEMPRE.']},
    {from: 25.69, to: 27.94, lines: ['NÃO É SOBRE QUAIS', 'LETRAS EXISTEM.'], teal: 1},
    {from: 27.94, to: 30.25, lines: ['É SOBRE A ORDEM', 'EM QUE VOCÊ AS COLOCA.']},
    {from: 30.25, to: 33.44, lines: ['SIGA PARA MAIS', 'CIÊNCIA DOS PEPTÍDEOS.'], teal: 1},
  ],
  beats: [
    {videoSrc: 's3-e04-shot1.mp4', holdSrc: 's3-e04-shot1-hold.png', from: 0, videoDur: 5.03, to: 15.22, name: 'MOTS-C', nameAt: 13.4, seq: 'M-R-W-Q-E-M...'},
    {videoSrc: 's3-e04-shot2.mp4', holdSrc: 's3-e04-shot2-hold.png', from: 15.22, videoDur: 5.03, to: 20.25, name: 'RETATRUTIDE', nameAt: 19.01, seq: 'Y-X-Q-G-T-F...'},
    {videoSrc: 's3-e04-shot3.mp4', holdSrc: 's3-e04-shot3-hold.png', from: 20.25, videoDur: 5.03, to: 25.69, name: 'BPC-157', nameAt: 24.41, seq: 'G-E-P-P-P-G...'},
  ],
  verdict: {from: 25.69, to: 33.44, line2At: 27.94, line1: 'MESMAS 20 LETRAS.', line2: 'A ORDEM É A IDENTIDADE.'},
  endFrom: 33.44,
  seriesChip: 'DENTRO DO FRASCO',
  disclaimer: 'Ferramenta educacional. Não é orientação médica. Somente para fins de pesquisa.',
  durationSec: 40,
};

export const S3EP4_ES: S3Ep4Config = {
  id: 'S3Ep4ES',
  flag: 'mx',
  voFile: 's3-e04-vo-es.mp3',
  cues: [
    {from: 0.1, to: 5.05, lines: ['TODA CADENA SE CONSTRUYE', 'DESDE EL MISMO ALFABETO.'], teal: 1},
    {from: 5.0, to: 6.8, lines: ['NO', 'LETRAS.']},
    {from: 6.8, to: 8.91, lines: ['VEINTE', 'AMINOÁCIDOS.'], teal: 1},
    {from: 8.91, to: 15.25, lines: ['CADA UNO TIENE UN CÓDIGO,', 'COMO UNA LETRA EN UNA PALABRA.']},
    {from: 15.25, to: 19.23, lines: ['PONLAS EN ESTE', 'ORDEN:'], teal: 1},
    {from: 19.23, to: 24.39, lines: ['MÉZCLALAS, ORDEN DISTINTO:']},
    {from: 24.39, to: 29.65, lines: ['OTRO ORDEN', 'DISTINTO:'], teal: 1},
    {from: 29.65, to: 32.7, lines: ['MISMAS 20 LETRAS,', 'SIEMPRE.']},
    {from: 32.7, to: 35.64, lines: ['NO SE TRATA DE QUÉ', 'LETRAS EXISTEN.'], teal: 1},
    {from: 35.64, to: 38.66, lines: ['SE TRATA DEL ORDEN', 'EN QUE LAS PONES.']},
    {from: 38.66, to: 41.88, lines: ['SÍGUENOS PARA MÁS', 'CIENCIA DE PÉPTIDOS.'], teal: 1},
  ],
  beats: [
    {videoSrc: 's3-e04-shot1.mp4', holdSrc: 's3-e04-shot1-hold.png', from: 0, videoDur: 5.03, to: 19.23, name: 'MOTS-C', nameAt: 16.9, seq: 'M-R-W-Q-E-M...'},
    {videoSrc: 's3-e04-shot2.mp4', holdSrc: 's3-e04-shot2-hold.png', from: 19.23, videoDur: 5.03, to: 24.26, name: 'RETATRUTIDE', nameAt: 23.02, seq: 'Y-X-Q-G-T-F...'},
    {videoSrc: 's3-e04-shot3.mp4', holdSrc: 's3-e04-shot3-hold.png', from: 24.26, videoDur: 5.03, to: 32.7, name: 'BPC-157', nameAt: 28.42, seq: 'G-E-P-P-P-G...'},
  ],
  verdict: {from: 32.7, to: 41.88, line2At: 35.64, line1: 'MISMAS 20 LETRAS.', line2: 'EL ORDEN ES LA IDENTIDAD.'},
  endFrom: 41.88,
  seriesChip: 'DENTRO DEL VIAL',
  disclaimer: 'Herramienta educativa. No es consejo médico. Solo con fines de investigación.',
  durationSec: 48,
};
