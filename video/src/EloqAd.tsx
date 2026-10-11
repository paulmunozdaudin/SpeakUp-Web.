import React from "react";
import {
  AbsoluteFill,
  Audio,
  Img,
  interpolate,
  Sequence,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { loadFont } from "@remotion/fonts";
import type { AdLine, AdProps } from "./types";
import { END_CARD_SECONDS, layoutLines, type TimedLine, type TimedWord } from "./timing";

// Bundled locally (public/fonts, Inter variable) so renders never depend
// on reaching Google Fonts.
const fontFamily = "Inter";
for (const subset of ["latin", "latin-ext"]) {
  loadFont({
    family: fontFamily,
    url: staticFile(`fonts/inter-${subset}.woff2`),
    weight: "100 900",
  });
}

const ACCENT = "#818cf8";
const ACCENT_DEEP = "#4f46e5";

function normalizeWord(word: string): string {
  return word
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^\p{L}\p{N}]/gu, "");
}

/** Slow Ken Burns push-in on a black & white, darkened photo. */
const Background: React.FC<{ line: AdLine; durationInFrames: number; index: number }> = ({
  line,
  durationInFrames,
  index,
}) => {
  const frame = useCurrentFrame();
  const progress = frame / Math.max(durationInFrames, 1);
  const scale = interpolate(progress, [0, 1], [1.08, 1.2]);
  const drift = interpolate(progress, [0, 1], [0, index % 2 === 0 ? -30 : 30]);

  if (!line.image) {
    const hue = interpolate(frame, [0, durationInFrames], [0, 25]);
    return (
      <AbsoluteFill
        style={{
          background: `radial-gradient(circle at ${45 + (index % 3) * 10}% 35%, rgba(79,70,229,0.45), transparent 55%), radial-gradient(circle at 70% 85%, rgba(129,140,248,${0.15 + (hue / 250)}), transparent 50%), #050507`,
          transform: `scale(${scale})`,
        }}
      />
    );
  }

  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      <Img
        src={staticFile(`images/${line.image}`)}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          transform: `scale(${scale}) translateX(${drift}px)`,
          filter: "grayscale(1) contrast(1.18) brightness(0.55)",
        }}
      />
    </AbsoluteFill>
  );
};

/** Film grain + vignette, shared by every shot. */
const Texture: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <>
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(ellipse at center, transparent 35%, rgba(0,0,0,0.75) 100%)",
        }}
      />
      <AbsoluteFill style={{ opacity: 0.13, mixBlendMode: "overlay" }}>
        <svg width="100%" height="100%">
          <filter id="grain">
            <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed={frame % 12} />
          </filter>
          <rect width="100%" height="100%" filter="url(#grain)" />
        </svg>
      </AbsoluteFill>
    </>
  );
};

const MAX_CHUNK_WORDS = 3;
const MAX_CHUNK_CHARS = 18;

/** Splits a line into short caption chunks (2–3 words), breaking early at
 *  punctuation — the classic TikTok caption rhythm. */
function chunkWords(words: TimedWord[]): TimedWord[][] {
  const chunks: TimedWord[][] = [];
  let current: TimedWord[] = [];
  for (const word of words) {
    const chars = current.reduce((n, w) => n + w.text.length + 1, 0) + word.text.length;
    if (current.length > 0 && (current.length >= MAX_CHUNK_WORDS || chars > MAX_CHUNK_CHARS)) {
      chunks.push(current);
      current = [];
    }
    current.push(word);
    if (/[.,:;!?…]$/.test(word.text)) {
      chunks.push(current);
      current = [];
    }
  }
  if (current.length) chunks.push(current);
  return chunks;
}

/** TikTok-style captions: one short chunk at a time, popping in when its
 *  first word is said, with the word being spoken right now lit up. */
const Captions: React.FC<{ line: TimedLine; emphasis: string[] }> = ({ line, emphasis }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const now = line.start + frame / fps;
  const emphasized = new Set(emphasis.map(normalizeWord));
  const chunks = chunkWords(line.words);

  let active = 0;
  chunks.forEach((chunk, i) => {
    if (now >= chunk[0].start - 0.05) active = i;
  });
  const chunk = chunks[active] ?? [];
  const chunkStart = chunk[0] ? (chunk[0].start - line.start) * fps : 0;
  const pop = spring({ frame: frame - chunkStart, fps, config: { damping: 13, mass: 0.55 } });

  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", padding: "0 80px" }}>
      <div
        style={{
          fontFamily,
          fontWeight: 900,
          fontSize: 112,
          lineHeight: 1.08,
          letterSpacing: "-0.025em",
          textAlign: "center",
          color: "white",
          textShadow: "0 6px 30px rgba(0,0,0,0.7)",
          transform: `scale(${interpolate(pop, [0, 1], [0.86, 1])}) translateY(${interpolate(pop, [0, 1], [24, 0])}px)`,
          opacity: interpolate(pop, [0, 0.4], [0, 1], { extrapolateRight: "clamp" }),
        }}
      >
        {chunk.map((word, i) => {
          const speaking = now >= word.start - 0.03;
          const isEmphasis = emphasized.has(normalizeWord(word.text));
          return (
            <React.Fragment key={i}>
              <span
                style={{
                  color: isEmphasis ? ACCENT : "white",
                  opacity: speaking ? 1 : 0.55,
                  textShadow: isEmphasis
                    ? `0 0 44px ${ACCENT_DEEP}, 0 6px 30px rgba(0,0,0,0.7)`
                    : undefined,
                }}
              >
                {word.text}
              </span>{" "}
            </React.Fragment>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

/** Concentric-rings mark, echoing the Eloq logo. */
const EloqMark: React.FC<{ size: number; progress: number }> = ({ size, progress }) => (
  <svg width={size} height={size} viewBox="0 0 100 100">
    <rect width="100" height="100" rx="24" fill="#0b0b12" stroke="rgba(129,140,248,0.35)" />
    {[34, 25, 16, 7].map((r, i) => (
      <circle
        key={r}
        cx="50"
        cy="50"
        r={r * interpolate(progress, [0, 1], [0.6, 1])}
        fill="none"
        stroke={i === 3 ? "white" : ACCENT}
        strokeWidth={i === 3 ? 4 : 2.5}
        opacity={0.35 + i * 0.2}
      />
    ))}
  </svg>
);

const EndCard: React.FC<{ endCard: AdProps["endCard"] }> = ({ endCard }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const enter = spring({ frame, fps, config: { damping: 16 } });
  const subtitleIn = spring({ frame: frame - 10, fps, config: { damping: 18 } });
  return (
    <AbsoluteFill
      style={{
        background: "radial-gradient(circle at 50% 40%, rgba(79,70,229,0.35), #050507 60%)",
        justifyContent: "center",
        alignItems: "center",
        fontFamily,
        color: "white",
        textAlign: "center",
      }}
    >
      <div style={{ transform: `scale(${interpolate(enter, [0, 1], [0.8, 1])})`, opacity: enter }}>
        <EloqMark size={200} progress={enter} />
      </div>
      <div
        style={{
          marginTop: 48,
          fontSize: 150,
          fontWeight: 900,
          letterSpacing: "-0.04em",
          opacity: enter,
        }}
      >
        {endCard.title}
      </div>
      <div
        style={{
          marginTop: 18,
          fontSize: 58,
          fontWeight: 600,
          color: ACCENT,
          opacity: subtitleIn,
          transform: `translateY(${interpolate(subtitleIn, [0, 1], [20, 0])}px)`,
        }}
      >
        {endCard.subtitle}
      </div>
      <div style={{ marginTop: 80, fontSize: 42, fontWeight: 600, opacity: subtitleIn * 0.7 }}>
        {endCard.url}
      </div>
    </AbsoluteFill>
  );
};

export const EloqAd: React.FC<AdProps> = (props) => {
  const { fps } = useVideoConfig();
  const lines = layoutLines(props);
  const last = lines[lines.length - 1];
  const endStart = Math.round((last?.end ?? 0) * fps);

  return (
    <AbsoluteFill style={{ backgroundColor: "#050507" }}>
      {lines.map((line) => {
        const from = Math.round(line.start * fps);
        const duration = Math.max(1, Math.round(line.end * fps) - from);
        const source = props.lines[line.index];
        return (
          <Sequence key={line.index} from={from} durationInFrames={duration}>
            <Background line={source} durationInFrames={duration} index={line.index} />
            <Texture />
            <Captions line={line} emphasis={source.emphasis ?? []} />
          </Sequence>
        );
      })}

      <Sequence from={endStart} durationInFrames={Math.round(END_CARD_SECONDS * fps)}>
        <EndCard endCard={props.endCard} />
      </Sequence>

      {props.voice && <Audio src={staticFile(props.voice)} />}
      {props.music && <Audio src={staticFile(props.music)} volume={props.musicVolume ?? 0.12} />}
    </AbsoluteFill>
  );
};
