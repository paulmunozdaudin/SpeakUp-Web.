/**
 * Promo variants: timings (seconds), on-screen texts and which captures to
 * use. The soundtrack (scripts/make-promo-audio.py) is cut to the same
 * marks at 120 BPM, so keep the two in sync.
 */
import framesFr from "../../public/promo/frames.json";
import framesEs from "../../public/promo-es/frames.json";

export const PROMO_FPS = 30;

export interface Caption {
  from: number;
  to: number;
  lines: string[];
  /** Small numbered pill above the caption (demo steps). */
  step?: string;
  /** Words to paint with the brand gradient. */
  accent?: string[];
}

export interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

/** What the phone shows during a stretch of time. */
export type Screen =
  | { from: number; to: number; kind: "still"; file: string }
  | { from: number; to: number; kind: "scroll"; file: string; height: number; scrollFrom: number; scrollTo: number; over: [number, number] };

export interface PromoConfig {
  /** Folder under public/ holding this variant's captures and audio. */
  dir: string;
  seconds: number;
  /** Voice-over: phrases cut from one recording (seconds in the file) and
   *  placed on the timeline. */
  voice?: { file: string; clips: { from: number; to: number; at: number }[] };
  frames: {
    recording: { file: string; t: number }[];
    analysing: { file: string; t: number }[];
    rects: Record<string, Rect>;
    chrome: { header: number; nav: number };
  };
  setupHeight: number;
  metricsHeight: number;
  T: {
    hook: number;
    hookLine2: number;
    problem: number;
    problemPart2: number;
    reveal: number; // the beat drops
    phoneIn: number;
    setup: number;
    demo: number;
    tapStart: number;
    recIdle: number;
    tapRecord: number;
    recording: number;
    recLate: number;
    tapStop: number;
    analysing: number;
    results: number;
    metrics: number;
    callouts: number[];
    /** Camera-mode card, when the variant shows it. */
    camera?: number;
    /** End of the results part: the last scenes before the CTA start here. */
    tail: number;
    cta: number;
    ctaButton: number;
  };
  /** Metric cards pulled out of the results screen, in order. */
  calloutKeys: string[];
  /** The "voice + camera" option card in setup-long.png. */
  cameraRect?: Rect;
  /** Screens between the results and the call to action. */
  tailScreens: Screen[];
  /** Taps on the screen, in capture pixels. */
  taps: { at: number; x: number; y: number }[];
  captions: Caption[];
  text: {
    hook1: { lines: string[]; accent: string[]; size: number };
    hook2: { lines: string[]; accent: string[]; size: number };
    problem1: { lines: string[]; accent: string[]; size: number };
    problem2: { lines: string[]; accent: string[]; size: number };
    noteLabel: string;
    noteTitles: string[];
    fillers: string[];
    reveal: string[];
    stepLabel: string;
    cta: { lines: string[]; accent: string[]; size: number };
    ctaButton: string;
    ctaUrlPrefix: string;
  };
}

// ── French — 34.5 s, students preparing an oral exam ─────────────────────────
// Timed to the voice-over (public/promo/voice.wav): each scene starts with
// its sentence.
const FR_T = {
  hook: 0,
  hookLine2: 1.6,
  problem: 3.9,
  problemPart2: 5.9,
  reveal: 8.0,
  phoneIn: 9.6,
  setup: 10.8,
  demo: 12.2,
  tapStart: 12.8,
  recIdle: 13.2,
  tapRecord: 13.8,
  recording: 13.92,
  recLate: 15.6,
  tapStop: 16.3,
  analysing: 16.4,
  results: 18.0,
  metrics: 19.2,
  callouts: [19.5, 20.25, 21.0, 21.6, 22.45],
  camera: 23.3,
  tail: 24.5,
  cta: 28.5,
  ctaButton: 30.8,
};
const FR_EXAM_TAPS = [25.65, 26.6, 27.5];

/** One spoken phrase: where it sits in the voice file and when it plays. */
const say = (from: number, to: number, at: number) => ({ from: from - 0.06, to: to + 0.12, at: at - 0.06 });

export const PROMO_FR: PromoConfig = {
  dir: "promo",
  seconds: 34.5,
  voice: {
    file: "voice.wav",
    clips: [
      say(0.07, 1.09, 0.1), // Tu as un oral à passer ?
      say(1.53, 3.73, 1.6), // Ne découvre pas ton niveau le jour de l'examen.
      say(4.33, 5.95, 4.05), // Tu peux connaître ton sujet par cœur…
      say(6.3, 8.34, 5.95), // et pourtant avoir du mal à le présenter.
      say(8.71, 10.15, 8.12), // Découvre Eloq AI :
      say(10.47, 12.69, 9.75), // ton coach personnel pour progresser à l'oral.
      say(13.0, 13.89, 12.3), // Lance un entraînement,
      say(14.12, 14.91, 13.75), // enregistre-toi,
      say(15.1, 16.66, 16.4), // et l'IA analyse ton discours.
      say(16.98, 18.39, 18.05), // Tu reçois une analyse détaillée :
      say(18.79, 22.41, 19.6), // clarté, confiance, rythme, structure, tics de langage.
      say(22.73, 25.62, 24.6), // Prépare ton Brevet, ton Bac de Français et ton Grand Oral.
      say(25.94, 27.63, 28.95), // Le jour de ton oral, sois prêt.
      say(27.99, 30.8, 30.85), // Commence gratuitement sur eloq-oral.com.
    ],
  },
  frames: framesFr,
  setupHeight: 5616,
  metricsHeight: 10035,
  T: FR_T,
  calloutKeys: ["Clarté", "Confiance", "Rythme", "Structure", "Maîtrise des tics de langage"],
  cameraRect: { x: 48, y: 1512, w: 1104, h: 552 },
  tailScreens: [
    { from: FR_T.tail, to: FR_EXAM_TAPS[0] + 0.1, kind: "still", file: "exam-brevet.png" },
    { from: FR_EXAM_TAPS[0] + 0.1, to: FR_EXAM_TAPS[1] + 0.1, kind: "still", file: "exam-bac.png" },
    { from: FR_EXAM_TAPS[1] + 0.1, to: FR_EXAM_TAPS[2] + 0.12, kind: "still", file: "exam-grand-oral.png" },
    { from: FR_EXAM_TAPS[2] + 0.12, to: FR_T.cta + 0.6, kind: "still", file: "exam-grand-oral-info.png" },
  ],
  taps: [
    { at: FR_T.tapStart, x: 600, y: 1932 },
    { at: FR_T.tapRecord, x: 600, y: 1012 },
    { at: FR_T.tapStop, x: 600, y: 1012 },
    { at: FR_EXAM_TAPS[0], x: 600, y: 1143 },
    { at: FR_EXAM_TAPS[1], x: 980, y: 1143 },
    { at: FR_EXAM_TAPS[2], x: 879, y: 1012 },
  ],
  captions: [
    { from: FR_T.phoneIn, to: FR_T.demo, lines: ["Ton coach personnel", "pour progresser à l'oral."], accent: ["coach", "personnel"] },
    { from: FR_T.demo, to: FR_T.recIdle + 0.5, step: "1", lines: ["Lance un entraînement."] },
    { from: FR_T.recIdle + 0.5, to: FR_T.analysing, step: "2", lines: ["Enregistre-toi."] },
    { from: FR_T.analysing, to: FR_T.results, step: "3", lines: ["L'IA analyse ton discours."], accent: ["L'IA"] },
    { from: FR_T.results, to: FR_T.camera, step: "4", lines: ["Reçois une analyse", "détaillée."], accent: ["détaillée."] },
    { from: FR_T.camera, to: FR_T.tail, lines: ["Avec la caméra : regard,", "posture et gestes."], accent: ["caméra"] },
    {
      from: FR_T.tail,
      to: FR_T.cta,
      lines: ["Prépare ton Brevet,", "ton Bac de Français", "et ton Grand Oral."],
      accent: ["Brevet,", "Bac", "Français", "Grand", "Oral."],
    },
  ],
  text: {
    hook1: { lines: ["Tu as un oral", "à passer ?"], accent: ["oral"], size: 138 },
    hook2: { lines: ["Ne découvre pas", "ton niveau", "le jour de l'examen."], accent: ["le", "jour", "de", "l'examen."], size: 98 },
    problem1: { lines: ["Tu peux connaître", "ton sujet par cœur…"], accent: ["par", "cœur…"], size: 86 },
    problem2: { lines: ["…et pourtant avoir du mal", "à le présenter."], accent: ["du", "mal"], size: 70 },
    noteLabel: "Fiche",
    noteTitles: ["Introduction", "Arguments", "Conclusion"],
    fillers: ["« euh… »", "« du coup… »", "« en fait… »"],
    reveal: ["Découvre", "Eloq AI."],
    stepLabel: "ÉTAPE",
    cta: { lines: ["Le jour de ton oral,", "sois prêt."], accent: ["sois", "prêt."], size: 112 },
    ctaButton: "Commence gratuitement",
    ctaUrlPrefix: "sur",
  },
};

// ── Spanish — 30 s, presentations, pitches, interviews and challenges ──────
const ES_T = {
  hook: 0,
  hookLine2: 1.75,
  problem: 3.5,
  problemPart2: 5.25,
  reveal: 7.0,
  phoneIn: 8.0,
  setup: 9.2,
  demo: 10.5,
  tapStart: 11.0,
  recIdle: 11.4,
  tapRecord: 11.9,
  recording: 12.0,
  recLate: 13.6,
  tapStop: 14.2,
  analysing: 14.3,
  results: 15.3,
  metrics: 16.2,
  callouts: [16.5, 17.1, 17.7, 18.3, 18.9],
  tail: 19.5,
  cta: 25.5,
  ctaButton: 27.0,
};
const ES_PITCH = 20.5;
const ES_INTERVIEW = 21.5;
const ES_CHALLENGES = 22.5;

export const PROMO_ES: PromoConfig = {
  dir: "promo-es",
  seconds: 30,
  frames: framesEs,
  setupHeight: framesEs.heights.setup,
  metricsHeight: framesEs.heights.metrics,
  T: ES_T,
  calloutKeys: ["Claridad", "Confianza", "Ritmo", "Estructura", "Control de muletillas"],
  tailScreens: [
    { from: ES_T.tail, to: ES_PITCH + 0.1, kind: "still", file: "uc-presentation.png" },
    { from: ES_PITCH + 0.1, to: ES_INTERVIEW, kind: "still", file: "uc-pitch.png" },
    { from: ES_INTERVIEW, to: ES_CHALLENGES, kind: "still", file: "interview.png" },
    {
      from: ES_CHALLENGES,
      to: ES_T.cta + 0.6,
      kind: "scroll",
      file: "challenges-long.png",
      height: framesEs.heights.challenges,
      scrollFrom: 0,
      scrollTo: 2250,
      over: [ES_CHALLENGES + 0.7, ES_T.cta - 0.2],
    },
  ],
  taps: [
    { at: ES_T.tapStart, x: 600, y: 1932 },
    { at: ES_T.tapRecord, x: 600, y: 1012 },
    { at: ES_T.tapStop, x: 600, y: 1012 },
    { at: ES_PITCH, x: 600, y: 1532 },
  ],
  captions: [
    { from: ES_T.phoneIn, to: ES_T.demo, lines: ["Tu coach personal", "para hablar mejor."], accent: ["coach", "personal"] },
    { from: ES_T.demo, to: ES_T.recIdle + 0.4, step: "1", lines: ["Lanza un entrenamiento."] },
    { from: ES_T.recIdle + 0.4, to: ES_T.analysing, step: "2", lines: ["Grábate."] },
    { from: ES_T.analysing, to: ES_T.results, step: "3", lines: ["La IA analiza tu discurso."], accent: ["IA"] },
    { from: ES_T.results, to: ES_T.tail, step: "4", lines: ["Recibe un análisis", "detallado."], accent: ["detallado."] },
    {
      from: ES_T.tail,
      to: ES_CHALLENGES,
      lines: ["Para presentaciones,", "pitch para inversores", "y entrevistas."],
      accent: ["presentaciones,", "pitch", "inversores", "entrevistas."],
    },
    { from: ES_CHALLENGES, to: ES_T.cta, lines: ["Y retos diarios", "de 1 minuto."], accent: ["retos", "diarios"] },
  ],
  text: {
    hook1: { lines: ["¿Tienes que hablar", "en público?"], accent: ["en", "público?"], size: 100 },
    hook2: { lines: ["No descubras", "tu nivel", "delante de todos."], accent: ["delante", "de", "todos."], size: 104 },
    problem1: { lines: ["Puedes saberte el tema", "de memoria…"], accent: ["de", "memoria…"], size: 80 },
    problem2: { lines: ["…y aun así", "quedarte en blanco."], accent: ["en", "blanco."], size: 84 },
    noteLabel: "Ficha",
    noteTitles: ["Introducción", "Argumentos", "Conclusión"],
    fillers: ["«eh…»", "«o sea…»", "«en plan…»"],
    reveal: ["Descubre", "Eloq AI."],
    stepLabel: "PASO",
    cta: { lines: ["Habla para que", "te escuchen."], accent: ["te", "escuchen."], size: 116 },
    ctaButton: "Empieza gratis",
    ctaUrlPrefix: "en",
  },
};

export const PROMO_VARIANTS = { fr: PROMO_FR, es: PROMO_ES } as const;
export type PromoLocale = keyof typeof PROMO_VARIANTS;
