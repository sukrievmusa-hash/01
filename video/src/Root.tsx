import React from 'react';
import { Composition } from 'remotion';
import { Demo5 } from './Demo5';
import tl from './tl.json';
import { Demo6 } from './Demo6';
import tl6 from './tl6.json';

// Demo4 (ролик «5 шагов») собирается со своим tl.json — см. pipeline/ и README.
export const RemotionRoot: React.FC = () => (
  <>
  <Composition id="Demo6" component={Demo6} durationInFrames={Math.ceil(tl6.total * 30)} fps={30} width={1080} height={1920} />
  <Composition id="Demo5" component={Demo5} durationInFrames={Math.ceil(tl.total * 30)} fps={30} width={1080} height={1920} />
  </>
);
