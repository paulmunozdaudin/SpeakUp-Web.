export interface AdLine {
  /** What's said (and shown as captions) during this shot. */
  text: string;
  /** File in public/images/ for the background of this shot. Optional —
   *  without one, an animated dark gradient is used. */
  image?: string;
  /** Words to highlight in the brand color (matched case-insensitively). */
  emphasis?: string[];
}

export interface WordTiming {
  word: string;
  start: number;
  end: number;
}

export interface AdProps {
  lines: AdLine[];
  /** File in public/ — written by `npm run voice`. */
  voice?: string;
  /** Per-word timings from ElevenLabs — written by `npm run voice`. */
  timings?: WordTiming[];
  /** Optional background music file in public/. */
  music?: string;
  musicVolume?: number;
  endCard: { title: string; subtitle: string; url: string };
  [key: string]: unknown;
}
