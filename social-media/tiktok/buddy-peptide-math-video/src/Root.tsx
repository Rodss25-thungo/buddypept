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
import {Day9, DAY9_EN, DAY9_ES, DAY9_PT} from './day09';
import {Day10, DAY10_EN, DAY10_ES, DAY10_PT} from './day10';
import {S2Seed1, S2Seed5} from './s2seeds';
import {S2Day1, S2DAY1_EN, S2DAY1_ES, S2DAY1_PT} from './s2day01';
import {S2Day2, S2DAY2_EN, S2DAY2_ES, S2DAY2_PT} from './s2day02';
import {S2Day3, S2DAY3_EN, S2DAY3_ES, S2DAY3_PT} from './s2day03';
import {S2Day4, S2DAY4_EN, S2DAY4_ES, S2DAY4_PT} from './s2day04';
import {S2Day5, S2DAY5_EN, S2DAY5_ES, S2DAY5_PT} from './s2day05';
import {S2Day6, S2DAY6_EN, S2DAY6_ES, S2DAY6_PT} from './s2day06';
import {S2Day7, S2DAY7_EN, S2DAY7_ES, S2DAY7_PT} from './s2day07';
import {S2Day8, S2DAY8_EN, S2DAY8_ES, S2DAY8_PT} from './s2day08';
import {S2Day9, S2DAY9_EN, S2DAY9_ES, S2DAY9_PT} from './s2day09';
import {S2Day10, S2DAY10_EN, S2DAY10_ES, S2DAY10_PT} from './s2day10';
import {S3Ep1, S3EP1_EN, S3EP1_ES, S3EP1_PT} from './s3ep01';
import {S3Ep2, S3EP2_EN, S3EP2_ES, S3EP2_PT} from './s3ep02';
import {S3Ep3, S3EP3_EN, S3EP3_ES, S3EP3_PT} from './s3ep03';
import {S3Ep4, S3EP4_EN, S3EP4_ES, S3EP4_PT} from './s3ep04';
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
    {[S3EP1_EN, S3EP1_ES, S3EP1_PT].map((L) => (
      <Composition key={L.id} id={L.id} component={S3Ep1} defaultProps={{locale: L}} durationInFrames={30 * L.durationSec} fps={30} width={1080} height={1920} />
    ))}
    {[S3EP2_EN, S3EP2_ES, S3EP2_PT].map((L) => (
      <Composition key={L.id} id={L.id} component={S3Ep2} defaultProps={{locale: L}} durationInFrames={30 * L.durationSec} fps={30} width={1080} height={1920} />
    ))}
    {[S3EP3_EN, S3EP3_ES, S3EP3_PT].map((L) => (
      <Composition key={L.id} id={L.id} component={S3Ep3} defaultProps={{locale: L}} durationInFrames={30 * L.durationSec} fps={30} width={1080} height={1920} />
    ))}
    {[S3EP4_EN, S3EP4_ES, S3EP4_PT].map((L) => (
      <Composition key={L.id} id={L.id} component={S3Ep4} defaultProps={{locale: L}} durationInFrames={30 * L.durationSec} fps={30} width={1080} height={1920} />
    ))}
    {[S2DAY10_EN, S2DAY10_ES, S2DAY10_PT].map((L) => (
      <Composition key={L.id} id={L.id} component={S2Day10} defaultProps={{locale: L}} durationInFrames={30 * L.durationSec} fps={30} width={1080} height={1920} />
    ))}
    {[S2DAY9_EN, S2DAY9_ES, S2DAY9_PT].map((L) => (
      <Composition key={L.id} id={L.id} component={S2Day9} defaultProps={{locale: L}} durationInFrames={30 * L.durationSec} fps={30} width={1080} height={1920} />
    ))}
    {[S2DAY8_EN, S2DAY8_ES, S2DAY8_PT].map((L) => (
      <Composition key={L.id} id={L.id} component={S2Day8} defaultProps={{locale: L}} durationInFrames={30 * L.durationSec} fps={30} width={1080} height={1920} />
    ))}
    {[S2DAY7_EN, S2DAY7_ES, S2DAY7_PT].map((L) => (
      <Composition key={L.id} id={L.id} component={S2Day7} defaultProps={{locale: L}} durationInFrames={30 * L.durationSec} fps={30} width={1080} height={1920} />
    ))}
    {[S2DAY6_EN, S2DAY6_ES, S2DAY6_PT].map((L) => (
      <Composition key={L.id} id={L.id} component={S2Day6} defaultProps={{locale: L}} durationInFrames={30 * L.durationSec} fps={30} width={1080} height={1920} />
    ))}
    {[S2DAY5_EN, S2DAY5_ES, S2DAY5_PT].map((L) => (
      <Composition key={L.id} id={L.id} component={S2Day5} defaultProps={{locale: L}} durationInFrames={30 * L.durationSec} fps={30} width={1080} height={1920} />
    ))}
    {[S2DAY4_EN, S2DAY4_ES, S2DAY4_PT].map((L) => (
      <Composition
        key={L.id}
        id={L.id}
        component={S2Day4}
        defaultProps={{locale: L}}
        durationInFrames={30 * L.durationSec}
        fps={30}
        width={1080}
        height={1920}
      />
    ))}
    {[S2DAY3_EN, S2DAY3_ES, S2DAY3_PT].map((L) => (
      <Composition
        key={L.id}
        id={L.id}
        component={S2Day3}
        defaultProps={{locale: L}}
        durationInFrames={30 * L.durationSec}
        fps={30}
        width={1080}
        height={1920}
      />
    ))}
    {[S2DAY2_EN, S2DAY2_ES, S2DAY2_PT].map((L) => (
      <Composition
        key={L.id}
        id={L.id}
        component={S2Day2}
        defaultProps={{locale: L}}
        durationInFrames={30 * L.durationSec}
        fps={30}
        width={1080}
        height={1920}
      />
    ))}
    {[S2DAY1_EN, S2DAY1_ES, S2DAY1_PT].map((L) => (
      <Composition
        key={L.id}
        id={L.id}
        component={S2Day1}
        defaultProps={{locale: L}}
        durationInFrames={30 * L.durationSec}
        fps={30}
        width={1080}
        height={1920}
      />
    ))}
    <Composition id="S2Seed1" component={S2Seed1} durationInFrames={1} fps={30} width={1080} height={1920} />
    <Composition id="S2Seed5" component={S2Seed5} durationInFrames={1} fps={30} width={1080} height={1920} />
    {[DAY10_EN, DAY10_ES, DAY10_PT].map((L) => (
      <Composition
        key={L.id}
        id={L.id}
        component={Day10}
        defaultProps={{locale: L}}
        durationInFrames={30 * L.durationSec}
        fps={30}
        width={1080}
        height={1920}
      />
    ))}
    {[DAY9_EN, DAY9_ES, DAY9_PT].map((L) => (
      <Composition
        key={L.id}
        id={L.id}
        component={Day9}
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
