import React from "react";
import { Composition, Still, staticFile } from "remotion";
import { getAudioDurationInSeconds } from "@remotion/media-utils";
import { EloqAd } from "./EloqAd";
import { Lectura, lecturaSeconds, type LecturaProps } from "./Lectura";
import { Promo, PromoCover } from "./promo/Promo";
import { PROMO_FPS, PROMO_SECONDS } from "./promo/timeline";
import { FPS, totalSeconds } from "./timing";
import type { AdProps } from "./types";
import example from "../props/nadie-nace-sabiendo.json";
import lecturaExample from "../props/lectura-hablar-despacio.json";

export const RemotionRoot: React.FC = () => (
  <>
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
    <Composition
      id="Lectura"
      component={Lectura}
      width={1080}
      height={1920}
      fps={FPS}
      durationInFrames={FPS * 10}
      defaultProps={lecturaExample as LecturaProps}
      calculateMetadata={async ({ props }) => {
        // With a voice-over, the title holds exactly as long as the voice
        // plus a short breath, so voice and text never overlap.
        let next = props;
        if (props.voice) {
          const voiceSeconds = await getAudioDurationInSeconds(staticFile(props.voice));
          next = { ...props, introSeconds: voiceSeconds + (props.voiceGapSeconds ?? 0.6) };
        }
        return {
          props: next,
          durationInFrames: Math.ceil(lecturaSeconds(next) * FPS),
        };
      }}
    />
    <Composition
      id="Promo"
      component={Promo}
      width={1080}
      height={1920}
      fps={PROMO_FPS}
      durationInFrames={PROMO_FPS * PROMO_SECONDS}
      defaultProps={{ music: true }}
    />
    <Still id="PromoCover" component={PromoCover} width={1080} height={1920} />
  </>
);
