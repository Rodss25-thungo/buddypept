// TikTok-only configs for Series 1 EN, posts 1-10. Built on top of the Instagram
// configs without modifying them: ids, audio, and approved wording change here.
import {EN} from '../locales';
import {DAY1_EN} from '../day01';
import {DAY3_EN} from '../day03';
import {DAY4_EN} from '../day04';
import {DAY5_EN} from '../day05';
import {DAY9_EN} from '../day09';
import {DAY6_EN} from './tt-day06';
import {DAY7_EN} from './tt-day07';
import {DAY8_EN} from './tt-day08';
import {DAY10_EN} from './tt-day10';
import {WARPS, type Warp} from './timings';

// Keys that hold absolute seconds on the voiceover timeline. `delay` is relative
// and `durationSec` keeps its tail, so neither is shifted.
const TIME_KEYS = new Set(['from', 'to', 'bFrom', 'endFrom', 'revealAt', 'bAt', 'splitAt', 'chipAt']);

const warpTime = (w: Warp, t: number): number => {
  const {old: o, new: n} = w;
  if (t <= o[0]) return Math.max(0, t + (n[0] - o[0]));
  for (let i = 1; i < o.length; i++) {
    if (t <= o[i]) {
      const k = (t - o[i - 1]) / (o[i] - o[i - 1]);
      return Math.round((n[i - 1] + k * (n[i] - n[i - 1])) * 1000) / 1000;
    }
  }
  return Math.round((t + (n[n.length - 1] - o[o.length - 1])) * 1000) / 1000;
};

const warpDeep = <T>(value: T, w: Warp): T => {
  if (Array.isArray(value)) return value.map((v) => warpDeep(v, w)) as T;
  if (value && typeof value === 'object') {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value)) {
      out[k] = typeof v === 'number' && TIME_KEYS.has(k) ? warpTime(w, v) : warpDeep(v, w);
    }
    return out as T;
  }
  return value;
};

const withCue = <T extends {cues: {lines: [string, string?]}[]}>(cfg: T, index: number, lines: [string, string?]): T => ({
  ...cfg,
  cues: cfg.cues.map((c, i) => (i === index ? {...c, lines} : c)),
});

// Post 1: exact units on a 100-unit scale (re-voiced).
const tt01Base = warpDeep(EN, WARPS.tt01);
export const TT01_EN = withCue(
  {
    ...tt01Base,
    id: 'TT01EN',
    voFile: 'tt01-vo-en.mp3',
    result: {...tt01Base.result, top: 'Read', bottom: 'on a 100-unit scale'},
  },
  8,
  ['EXACT UNITS ON', 'A 100-UNIT SCALE.'],
);

// Post 2: 1 MG is 1 MG (visuals and audio unchanged).
export const TT02_EN = {...DAY1_EN, id: 'TT02EN'};

// Post 3: still 5 MG (unchanged).
export const TT03_EN = {...DAY3_EN, id: 'TT03EN'};

// Post 4: units = volume (re-voiced).
const tt04Base = warpDeep(DAY4_EN, WARPS.tt04);
export const TT04_EN = withCue(
  withCue(
    {
      ...tt04Base,
      id: 'TT04EN',
      voFile: 'tt04-vo-en.mp3',
      cards: {
        ...tt04Base.cards,
        a: {...tt04Base.cards.a, sub: 'on a 100-unit scale'},
        b: {...tt04Base.cards.b, sub: 'on a 100-unit scale'},
      },
    },
    0,
    ['YOUR SCALE', 'SAYS 100 UNITS.'],
  ),
  2,
  ['1 UNIT ON A 100-UNIT', 'SCALE = 0.01 ML'],
);

// Post 5: MG/ML x ML = MG (unchanged).
export const TT05_EN = {...DAY5_EN, id: 'TT05EN'};

// Post 6: 20 MG vial = 5 units (re-voiced, unit scale).
const tt06Base = warpDeep(DAY6_EN, WARPS.tt06);
export const TT06_EN = {
  ...tt06Base,
  id: 'TT06EN',
  voFile: 'tt06-vo-en.mp3',
  info: {...tt06Base.info, bottom: "The scale number changed. The amount didn't."},
};

// Post 7: 250 MCG = 12.5 units (audio unchanged, unit scale).
export const TT07_EN = {...DAY7_EN, id: 'TT07EN'};

// Post 8: same 250 MCG = 6.25 units (re-voiced, unit scale).
export const TT08_EN = {...warpDeep(DAY8_EN, WARPS.tt08), id: 'TT08EN', voFile: 'tt08-vo-en.mp3'};

// Post 9: dose / unit mix log (unchanged).
export const TT09_EN = {...DAY9_EN, id: 'TT09EN'};

// Post 10: 20 doses either way (audio unchanged, unit scale).
export const TT10_EN = {...DAY10_EN, id: 'TT10EN'};
