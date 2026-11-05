import React from "react";
import {
  AbsoluteFill,
  Audio,
  Easing,
  interpolate,
  Sequence,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { loadFont } from "@remotion/fonts";
import { EndCard } from "./EloqAd";
import { END_CARD_SECONDS, splitWords } from "./timing";
import type { AdProps } from "./types";

/**
 * Read-along format: a voice-over says the title, then the text scrolls up
 * like a teleprompter. Each line crosses the red guide bar at reading pace,
 * so the viewer reads it out loud as it passes.
 */
export interface LecturaProps {
  /** First white label, e.g. "Mejora tu oratoria". */
  title: string;
  /** Second white label, shown in «guillemets». */
  subtitle: string;
  /** One entry per line on screen; "" leaves a paragraph gap. Keep each
   *  line short (≲ 26 characters) so it never wraps. */
  text: string[];
  /** Reading pace in words per second (default 2.2). */
  wordsPerSecond?: number;
  /** Seconds the title is on screen alone, before the text slides in —
   *  the voice-over says the title meanwhile (default 2.6). */
  introSeconds?: number;
  /** Voice-over of the title, file in public/ (written by
   *  `npm run voice-title`). When set, introSeconds is ignored: the title
   *  holds for the voice's length plus voiceGapSeconds. */
  voice?: string;
  /** What the voice-over says (default: the title). */
  voiceText?: string;
  /** Silence between the end of the voice and the text (default 0.6). */
  voiceGapSeconds?: number;
  music?: string;
  musicVolume?: number;
  endCard: AdProps["endCard"];
  [key: string]: unknown;
}

const sans = "Inter";
const serif = "Libre Baskerville";
for (const subset of ["latin", "latin-ext"]) {
  loadFont({ family: sans, url: staticFile(`fonts/inter-${subset}.woff2`), weight: "100 900" });
  loadFont({ family: serif, url: staticFile(`fonts/baskerville-${subset}.woff2`), weight: "400" });
}

const BAR_Y = 1105; // centre of the red reading bar
const LINE_HEIGHT = 128;
const PARAGRAPH_GAP = 84;
const TEXT_LEFT = 190;
const FONT_SIZE = 62;
const HIDDEN_BELOW = 760; // first line waits just off the fade zone
const LEAD_IN_SECONDS = 0.6; // text glides up to the bar after the intro
const OUTRO_SECONDS = 1.4; // scrolling after the last line, before the end card

interface PlacedLine {
  text: string;
  y: number; // position inside the scrolling column
  at: number; // second at which it crosses the bar
}

export function layoutLectura(props: LecturaProps) {
  const wps = props.wordsPerSecond ?? 2.2;
  const intro = props.introSeconds ?? 2.6;
  // Pauses shrink with the pace so faster videos feel faster overall.
  const pauseScale = 2.2 / wps;
  const lines: PlacedLine[] = [];
  let y = 0;
  let t = intro + LEAD_IN_SECONDS;
  for (const raw of props.text) {
    const text = raw.trim();
    if (!text) {
      y += PARAGRAPH_GAP;
      t += 0.5 * pauseScale;
      continue;
    }
    lines.push({ text, y, at: t });
    y += LINE_HEIGHT;
    const words = splitWords(text).length;
    const pause = /[.!?…]$/.test(text) ? 0.45 : /[,;:]$/.test(text) ? 0.25 : 0.05;
    t += words / wps + pause * pauseScale;
  }
  const last = lines[lines.length - 1];
  const scrollEnd = (last?.at ?? intro) + OUTRO_SECONDS;
  return { lines, intro, scrollEnd, total: scrollEnd + END_CARD_SECONDS };
}

export function lecturaSeconds(props: LecturaProps): number {
  return layoutLectura(props).total;
}

/** Scroll offset at time t: each line sits on the bar exactly at its `at`. */
function scrollAt(t: number, lines: PlacedLine[], intro: number, scrollEnd: number): number {
  if (lines.length === 0) return 0;
  const first = lines[0];
  const last = lines[lines.length - 1];
  // Title alone, then the text eases up into place.
  if (t <= intro) return first.y - HIDDEN_BELOW;
  if (t < first.at) {
    return interpolate(t, [intro, first.at], [first.y - HIDDEN_BELOW, first.y], {
      easing: Easing.out(Easing.cubic),
    });
  }
  const times = lines.map((l) => l.at);
  const offsets = lines.map((l) => l.y);
  // Keep moving after the last line at the average pace.
  const pace = lines.length > 1 ? (last.y - first.y) / (last.at - first.at) : LINE_HEIGHT;
  times.push(scrollEnd);
  offsets.push(last.y + pace * (scrollEnd - last.at));
  // Strictly increasing input range for interpolate().
  for (let i = 1; i < times.length; i++) {
    if (times[i] <= times[i - 1]) times[i] = times[i - 1] + 0.001;
  }
  return interpolate(t, times, offsets, {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
}

const Label: React.FC<{ children: React.ReactNode; size: number; delay: number }> = ({
  children,
  size,
  delay,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const pop = spring({ frame: frame - delay, fps, config: { damping: 14, stiffness: 160 } });
  return (
    <div
      style={{
        background: "white",
        color: "black",
        fontFamily: sans,
        fontWeight: 700,
        fontSize: size,
        letterSpacing: "-0.01em",
        lineHeight: 1.1,
        padding: "10px 30px 14px",
        borderRadius: 14,
        opacity: pop,
        transform: `scale(${interpolate(pop, [0, 1], [0.85, 1])})`,
        whiteSpace: "nowrap",
      }}
    >
      {children}
    </div>
  );
};

export const Lectura: React.FC<LecturaProps> = (props) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { lines, intro, scrollEnd } = layoutLectura(props);
  const t = frame / fps;
  const scroll = scrollAt(t, lines, intro, scrollEnd);
  const endStart = Math.round(scrollEnd * fps);

  return (
    <AbsoluteFill style={{ backgroundColor: "black" }}>
      {/* Red reading bar */}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: BAR_Y - 14,
          height: 28,
          background: "linear-gradient(rgba(120,0,0,0), rgba(150,10,10,0.75) 30%, rgba(150,10,10,0.75) 70%, rgba(120,0,0,0))",
        }}
      />

      {/* Scrolling text */}
      {lines.map((line) => {
        const screenY = line.y - scroll + BAR_Y;
        // Fade in from the bottom, fade out before reaching the labels.
        const opacity = interpolate(screenY, [560, 720, 1560, 1760], [0, 1, 1, 0], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        });
        if (opacity <= 0) return null;
        return (
          <div
            key={`${line.y}`}
            style={{
              position: "absolute",
              left: TEXT_LEFT,
              top: screenY,
              transform: "translateY(-55%)",
              fontFamily: serif,
              fontSize: FONT_SIZE,
              color: "white",
              opacity,
              whiteSpace: "nowrap",
            }}
          >
            {line.text}
          </div>
        );
      })}

      {/* Title labels */}
      <div
        style={{
          position: "absolute",
          top: 330,
          left: 0,
          right: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 14,
        }}
      >
        <Label size={76} delay={0}>{props.title}</Label>
        <Label size={66} delay={6}>« {props.subtitle} »</Label>
      </div>

      <Sequence from={endStart} durationInFrames={Math.round(END_CARD_SECONDS * fps)}>
        <EndCard endCard={props.endCard} />
      </Sequence>

      {props.voice && <Audio src={staticFile(props.voice)} />}
      {props.music && <Audio src={staticFile(props.music)} volume={props.musicVolume ?? 0.1} />}
    </AbsoluteFill>
  );
};
