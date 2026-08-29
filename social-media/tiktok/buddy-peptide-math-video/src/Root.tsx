import React from 'react';
import {Composition} from 'remotion';
import {BuddyMath} from './Video';

export const RemotionRoot: React.FC = () => (
  <Composition
    id="BuddyMath"
    component={BuddyMath}
    durationInFrames={30 * 32}
    fps={30}
    width={1080}
    height={1920}
  />
);
