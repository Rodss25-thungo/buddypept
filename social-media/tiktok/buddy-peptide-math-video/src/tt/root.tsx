import React from 'react';
import {Composition} from 'remotion';
import {BuddyMath} from '../Video';
import {Day1} from '../day01';
import {Day5} from '../day05';
import {Day9} from '../day09';
import {Day6} from './tt-day06';
import {Day7} from './tt-day07';
import {Day8} from './tt-day08';
import {Day10} from './tt-day10';
import {
  TT01_EN,
  TT02_EN,
  TT03_EN,
  TT04_EN,
  TT05_EN,
  TT06_EN,
  TT07_EN,
  TT08_EN,
  TT09_EN,
  TT10_EN,
} from './configs';

// TikTok-only entry point. Kept separate from src/Root.tsx so Instagram
// compositions are never touched. Render with: remotion render src/tt/index.ts TT01EN
const size = {fps: 30, width: 1080, height: 1920} as const;

export const TikTokRoot: React.FC = () => (
  <>
    <Composition id={TT01_EN.id} component={BuddyMath} defaultProps={{locale: TT01_EN}} durationInFrames={30 * TT01_EN.durationSec} {...size} />
    <Composition id={TT02_EN.id} component={Day1} defaultProps={{locale: TT02_EN}} durationInFrames={30 * TT02_EN.durationSec} {...size} />
    <Composition id={TT03_EN.id} component={Day1} defaultProps={{locale: TT03_EN}} durationInFrames={30 * TT03_EN.durationSec} {...size} />
    <Composition id={TT04_EN.id} component={Day1} defaultProps={{locale: TT04_EN}} durationInFrames={30 * TT04_EN.durationSec} {...size} />
    <Composition id={TT05_EN.id} component={Day5} defaultProps={{locale: TT05_EN}} durationInFrames={30 * TT05_EN.durationSec} {...size} />
    <Composition id={TT06_EN.id} component={Day6} defaultProps={{locale: TT06_EN}} durationInFrames={30 * TT06_EN.durationSec} {...size} />
    <Composition id={TT07_EN.id} component={Day7} defaultProps={{locale: TT07_EN}} durationInFrames={30 * TT07_EN.durationSec} {...size} />
    <Composition id={TT08_EN.id} component={Day8} defaultProps={{locale: TT08_EN}} durationInFrames={30 * TT08_EN.durationSec} {...size} />
    <Composition id={TT09_EN.id} component={Day9} defaultProps={{locale: TT09_EN}} durationInFrames={30 * TT09_EN.durationSec} {...size} />
    <Composition id={TT10_EN.id} component={Day10} defaultProps={{locale: TT10_EN}} durationInFrames={30 * TT10_EN.durationSec} {...size} />
  </>
);
