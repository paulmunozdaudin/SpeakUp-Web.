import React from "react";
import { Composition } from "remotion";
import { EloqAd } from "./EloqAd";
import { FPS, totalSeconds } from "./timing";
import type { AdProps } from "./types";
import example from "../props/nadie-nace-sabiendo.json";

export const RemotionRoot: React.FC = () => (
  <Composition
    id="EloqAd"
    component={EloqAd}
    width={1080}
    height={1920}
    fps={FPS}
    durationInFrames={FPS * 10}
    defaultProps={example as AdProps}
    calculateMetadata={({ props }) => ({
      durationInFrames: Math.ceil(totalSeconds(props) * FPS),
    })}
  />
);
