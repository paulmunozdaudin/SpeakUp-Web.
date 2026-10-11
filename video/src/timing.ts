import type { AdProps } from "./types";

export const FPS = 30;
export const END_CARD_SECONDS = 2.8;
/** Used only when there's no ElevenLabs timing data yet (draft renders). */
const ESTIMATED_WORDS_PER_SECOND = 2.6;
const ESTIMATED_LINE_GAP_SECONDS = 0.35;

export interface TimedWord {
  text: string;
  start: number;
  end: number;
}

export interface TimedLine {
  index: number;
  start: number;
  end: number;
  words: TimedWord[];
}

export function splitWords(text: string): string[] {
  return text.split(/\s+/).filter(Boolean);
}

/** Lays every line and word on the timeline — from the real ElevenLabs
 *  word timings when present, otherwise from an estimated speaking pace. */
export function layoutLines(props: AdProps): TimedLine[] {
  const lines: TimedLine[] = [];
  let wordIndex = 0;
  let cursor = 0.3;

  props.lines.forEach((line, index) => {
    const words = splitWords(line.text);
    const timed: TimedWord[] = words.map((text) => {
      const real = props.timings?.[wordIndex];
      wordIndex += 1;
      if (real) return { text, start: real.start, end: real.end };
      const start = cursor;
      cursor += 1 / ESTIMATED_WORDS_PER_SECOND;
      return { text, start, end: cursor };
    });
    if (!props.timings) cursor += ESTIMATED_LINE_GAP_SECONDS;
    lines.push({ index, start: timed[0]?.start ?? cursor, end: 0, words: timed });
  });

  // Each line stays on screen until the next one starts.
  lines.forEach((line, i) => {
    const next = lines[i + 1];
    const lastWord = line.words[line.words.length - 1];
    line.end = next ? next.start : (lastWord?.end ?? line.start) + 0.6;
  });
  if (lines[0]) lines[0].start = 0;
  return lines;
}

export function totalSeconds(props: AdProps): number {
  const lines = layoutLines(props);
  const last = lines[lines.length - 1];
  return (last?.end ?? 0) + END_CARD_SECONDS;
}
