import React from 'react';
import {Composition} from 'remotion';
import {BuddyMath} from './Video';
import {EN, ES, PT} from './locales';
import {Day1, DAY1_EN, DAY1_ES, DAY1_PT} from './day01';
import {DAY3_EN, DAY3_ES, DAY3_PT} from './day03';
import {DAY4_EN, DAY4_ES, DAY4_PT} from './day04';
import {Day5, DAY5_EN, DAY5_ES, DAY5_PT} from './day05';
import {Day6, DAY6_EN, DAY6_ES, DAY6_PT} from './day06';
import {Day7, DAY7_EN, DAY7_ES, DAY7_PT} from './day07';
import {Day8, DAY8_EN, DAY8_ES, DAY8_PT} from './day08';
import {DAY2_EN, DAY2_ES, DAY2_PT} from './day02';

export const RemotionRoot: React.FC = () => (
  <>
    {[EN, ES, PT].map((L) => (
      <Composition
        key={L.id}
        id={L.id}
        component={BuddyMath}
        defaultProps={{locale: L}}
        durationInFrames={30 * L.durationSec}
        fps={30}
        width={1080}
        height={1920}
      />
    ))}
    {[DAY1_EN, DAY1_ES, DAY1_PT, DAY3_EN, DAY3_ES, DAY3_PT, DAY4_EN, DAY4_ES, DAY4_PT].map((L) => (
      <Composition
        key={L.id}
        id={L.id}
        component={Day1}
        defaultProps={{locale: L}}
        durationInFrames={30 * L.durationSec}
        fps={30}
        width={1080}
        height={1920}
      />
    ))}
    {[DAY2_EN, DAY2_ES, DAY2_PT].map((L) => (
      <Composition
        key={L.id}
        id={L.id}
        component={Day1}
        defaultProps={{locale: L}}
        durationInFrames={30 * L.durationSec}
        fps={30}
        width={1080}
        height={1920}
      />
    ))}
    {[DAY8_EN, DAY8_ES, DAY8_PT].map((L) => (
      <Composition
        key={L.id}
        id={L.id}
        component={Day8}
        defaultProps={{locale: L}}
        durationInFrames={30 * L.durationSec}
        fps={30}
        width={1080}
        height={1920}
      />
    ))}
    {[DAY7_EN, DAY7_ES, DAY7_PT].map((L) => (
      <Composition
        key={L.id}
        id={L.id}
        component={Day7}
        defaultProps={{locale: L}}
        durationInFrames={30 * L.durationSec}
        fps={30}
        width={1080}
        height={1920}
      />
    ))}
    {[DAY6_EN, DAY6_ES, DAY6_PT].map((L) => (
      <Composition
        key={L.id}
        id={L.id}
        component={Day6}
        defaultProps={{locale: L}}
        durationInFrames={30 * L.durationSec}
        fps={30}
        width={1080}
        height={1920}
      />
    ))}
    {[DAY5_EN, DAY5_ES, DAY5_PT].map((L) => (
      <Composition
        key={L.id}
        id={L.id}
        component={Day5}
        defaultProps={{locale: L}}
        durationInFrames={30 * L.durationSec}
        fps={30}
        width={1080}
        height={1920}
      />
    ))}
  </>
);
