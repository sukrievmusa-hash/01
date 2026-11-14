import React from 'react';
import { Composition } from 'remotion';
import { Demo4 } from './Demo4';
import tl from './tl.json';

export const RemotionRoot: React.FC = () => (
  <Composition id="Demo4" component={Demo4} durationInFrames={Math.ceil(tl.total * 30)} fps={30} width={1080} height={1920} />
);
