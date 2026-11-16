/**
 * Promo timeline, in seconds. The soundtrack (scripts/make-promo-audio.py)
 * is cut to the same marks at 120 BPM, so keep the two in sync.
 */
export const PROMO_FPS = 30;
export const PROMO_SECONDS = 33;

export const T = {
  hook: 0,
  hookLine2: 1.75,
  problem: 3.5,
  problemPart2: 5.5,
  reveal: 7.5, // "Découvre Eloq AI." — the beat drops
  phoneIn: 8.6,
  setup: 10.0,
  demo: 12.0,
  tapStart: 12.6,
  recIdle: 13.0,
  tapRecord: 13.6,
  recording: 13.72,
  recLate: 15.6,
  tapStop: 16.3,
  analysing: 16.4,
  results: 17.6,
  metrics: 18.6,
  callouts: [18.9, 19.55, 20.2, 20.85, 21.5],
  camera: 22.15,
  exams: 23.5,
  examTaps: [24.4, 25.3, 26.2],
  cta: 28.0,
  ctaButton: 29.7,
} as const;

export interface Caption {
  from: number;
  to: number;
  lines: string[];
  /** Small numbered pill above the caption (demo steps). */
  step?: string;
  /** Words to paint with the brand gradient. */
  accent?: string[];
}

/** French on-screen captions — the video has no voice-over, these carry it. */
export const CAPTIONS: Caption[] = [
  { from: T.phoneIn, to: T.demo, lines: ["Ton coach personnel", "pour progresser à l'oral."], accent: ["coach", "personnel"] },
  { from: T.demo, to: T.recIdle + 0.5, step: "1", lines: ["Lance un entraînement."] },
  { from: T.recIdle + 0.5, to: T.analysing, step: "2", lines: ["Enregistre-toi."] },
  { from: T.analysing, to: T.results, step: "3", lines: ["L'IA analyse ton discours."], accent: ["L'IA"] },
  { from: T.results, to: T.camera, step: "4", lines: ["Reçois une analyse", "détaillée."], accent: ["détaillée."] },
  { from: T.camera, to: T.exams, lines: ["Avec la caméra : regard,", "posture et gestes."], accent: ["caméra"] },
  { from: T.exams, to: T.cta, lines: ["Prépare ton Brevet,", "ton Bac de Français", "et ton Grand Oral."], accent: ["Brevet,", "Bac", "Français", "Grand", "Oral."] },
];
