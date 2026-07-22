import type { AnalysisResult } from "@/types";
import type {
  AnalysisLocale,
  AnalysisProvider,
  AnalysisRequest,
} from "./provider";

/**
 * Mock provider: produces realistic, deterministic-per-input feedback so the
 * whole product loop (practice → analyze → improve) works before the real
 * AI integration lands. Feedback copy is localized per request.locale —
 * the real provider will instead instruct the LLM to answer in that language.
 */

/** Tiny seeded PRNG so the same recording metadata yields the same report. */
function createRandom(seed: number) {
  let state = seed || 1;
  return () => {
    state = (state * 1664525 + 1013904223) % 4294967296;
    return state / 4294967296;
  };
}

function hashString(value: string): number {
  let hash = 0;
  for (let i = 0; i < value.length; i++) {
    hash = (hash << 5) - hash + value.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

interface MockCopy {
  clarityHigh: string;
  clarityLow: string;
  confidenceHigh: string;
  confidenceLow: string;
  paceFast: (wpm: number) => string;
  paceSlow: (wpm: number) => string;
  paceIdeal: (wpm: number) => string;
  structureHigh: string;
  structureLow: string;
  persuasionHigh: string;
  persuasionLow: string;
  vocabularyHigh: string;
  vocabularyLow: string;
  fillerWords: [string, string, string, string];
  summary: (args: {
    strong: boolean;
    minutes: number;
    topic: string;
    overall: number;
    standout: string;
    focus: string;
  }) => string;
  standoutStructure: string;
  standoutClarity: string;
  focusFillers: string;
  focusPacing: string;
  strengths: {
    clarity: string;
    energy: string;
    structure: string;
    tone: string;
    vocabulary: string;
    command: string;
  };
  weaknesses: {
    fillers: (count: number) => string;
    monotone: string;
    pacing: string;
    endings: string;
  };
  tips: string[];
  exercises: string[];
}

const COPY: Record<AnalysisLocale, MockCopy> = {
  en: {
    clarityHigh:
      "Your articulation is clear and easy to follow. Sentences land cleanly.",
    clarityLow:
      "Some passages were hard to follow. Slow down on key points and articulate word endings.",
    confidenceHigh: "You sound assured — steady volume and few hesitations.",
    confidenceLow:
      "Hesitations and a falling volume at sentence ends make you sound unsure. Finish sentences with energy.",
    paceFast: (wpm) =>
      `You averaged ${wpm} words per minute — a bit fast. Aim for 130–150 and pause after key ideas.`,
    paceSlow: (wpm) =>
      `You averaged ${wpm} words per minute — a bit slow. Tighten transitions to keep energy up.`,
    paceIdeal: (wpm) =>
      `You averaged ${wpm} words per minute — right in the ideal range.`,
    structureHigh:
      "Clear opening, body and close. Your ideas build on each other logically.",
    structureLow:
      "The talk would benefit from a sharper structure: preview your main points early, then close by echoing them.",
    persuasionHigh: "Strong use of evidence and emphasis on benefits.",
    persuasionLow:
      "Add concrete examples or data to back your claims — specifics persuade more than adjectives.",
    vocabularyHigh:
      "Varied, precise word choice appropriate for your audience.",
    vocabularyLow:
      'Some repetitive wording. Swap generic verbs ("do", "get") for more precise alternatives.',
    fillerWords: ["um", "like", "you know", "so"],
    summary: ({ strong, minutes, topic, overall, standout, focus }) =>
      `A ${strong ? "strong" : "promising"} ${minutes}-minute practice on “${topic}”. Overall you scored ${overall}/100, with ${standout} as your standout strength. Focus next on ${focus} to reach the next level.`,
    standoutStructure: "structure",
    standoutClarity: "clarity",
    focusFillers: "reducing filler words",
    focusPacing: "pacing your key moments",
    strengths: {
      clarity: "Clear articulation of main ideas",
      energy: "Consistent energy throughout",
      structure: "Logical, easy-to-follow structure",
      tone: "Natural, conversational tone",
      vocabulary: "Precise and varied vocabulary",
      command: "Good topic command",
    },
    weaknesses: {
      fillers: (count) => `${count} filler words detected`,
      monotone: "Occasional monotone stretches",
      pacing: "Uneven pacing between sections",
      endings: "Endings of sentences lose volume",
    },
    tips: [
      "Pause for a full second after your most important point — silence creates emphasis.",
      "Record your opening 3 times in a row; first impressions drive audience attention.",
      "Replace filler words with a short pause: it feels long to you, natural to listeners.",
    ],
    exercises: [
      "60-second elevator pitch on the same topic",
      "Re-deliver only your conclusion, twice as slow",
      "One-breath exercise: one idea per breath, no fillers",
    ],
  },
  es: {
    clarityHigh:
      "Tu articulación es clara y fácil de seguir. Las frases se entienden a la primera.",
    clarityLow:
      "Algunos pasajes costaban de seguir. Frena en los puntos clave y articula los finales de palabra.",
    confidenceHigh:
      "Suenas con seguridad: volumen estable y pocas vacilaciones.",
    confidenceLow:
      "Las vacilaciones y el volumen que cae al final de las frases te hacen sonar inseguro. Termina las frases con energía.",
    paceFast: (wpm) =>
      `Tu media fue de ${wpm} palabras por minuto — algo rápido. Apunta a 130–150 y haz pausas tras las ideas clave.`,
    paceSlow: (wpm) =>
      `Tu media fue de ${wpm} palabras por minuto — algo lento. Aprieta las transiciones para mantener la energía.`,
    paceIdeal: (wpm) =>
      `Tu media fue de ${wpm} palabras por minuto — justo en el rango ideal.`,
    structureHigh:
      "Apertura, desarrollo y cierre claros. Tus ideas se construyen unas sobre otras con lógica.",
    structureLow:
      "La charla ganaría con una estructura más nítida: anticipa tus puntos clave al principio y cierra recordándolos.",
    persuasionHigh: "Buen uso de evidencias y énfasis en los beneficios.",
    persuasionLow:
      "Añade ejemplos concretos o datos que respalden tus afirmaciones — lo específico persuade más que los adjetivos.",
    vocabularyHigh:
      "Vocabulario variado y preciso, adecuado para tu audiencia.",
    vocabularyLow:
      "Hay palabras repetidas. Cambia verbos genéricos («hacer», «tener») por alternativas más precisas.",
    fillerWords: ["eh", "o sea", "¿sabes?", "bueno"],
    summary: ({ strong, minutes, topic, overall, standout, focus }) =>
      `Una práctica ${strong ? "sólida" : "prometedora"} de ${minutes} minutos sobre «${topic}». Puntuación global de ${overall}/100, con ${standout} como tu punto fuerte destacado. Céntrate ahora en ${focus} para subir de nivel.`,
    standoutStructure: "la estructura",
    standoutClarity: "la claridad",
    focusFillers: "reducir las muletillas",
    focusPacing: "dosificar el ritmo en tus momentos clave",
    strengths: {
      clarity: "Articulación clara de las ideas principales",
      energy: "Energía constante de principio a fin",
      structure: "Estructura lógica y fácil de seguir",
      tone: "Tono natural y conversacional",
      vocabulary: "Vocabulario preciso y variado",
      command: "Buen dominio del tema",
    },
    weaknesses: {
      fillers: (count) => `${count} muletillas detectadas`,
      monotone: "Tramos ocasionalmente monótonos",
      pacing: "Ritmo desigual entre secciones",
      endings: "Los finales de frase pierden volumen",
    },
    tips: [
      "Haz una pausa de un segundo entero tras tu punto más importante — el silencio crea énfasis.",
      "Graba tu apertura 3 veces seguidas; la primera impresión captura la atención de la audiencia.",
      "Sustituye las muletillas por una pausa corta: a ti te parece larga, al oyente le suena natural.",
    ],
    exercises: [
      "Elevator pitch de 60 segundos sobre el mismo tema",
      "Repite solo tu conclusión, al doble de lento",
      "Ejercicio de una respiración: una idea por respiración, sin muletillas",
    ],
  },
};

export class MockAnalysisProvider implements AnalysisProvider {
  readonly name = "mock";

  async analyze(request: AnalysisRequest): Promise<AnalysisResult> {
    // Simulate model latency so loading states are honest.
    await new Promise((resolve) => setTimeout(resolve, 2500));

    const copy = COPY[request.locale] ?? COPY.en;
    const random = createRandom(
      hashString(request.topic) + Math.round(request.durationSeconds),
    );
    const score = (min: number, max: number) =>
      Math.round(min + random() * (max - min));

    const clarity = score(55, 95);
    const confidence = score(50, 92);
    const pace = score(50, 90);
    const structure = score(55, 95);
    const persuasiveness = score(50, 90);
    const vocabulary = score(55, 92);
    const fillerScore = score(45, 95);
    const overall = Math.round(
      (clarity + confidence + pace + structure + persuasiveness + vocabulary) /
        6,
    );
    const wpm = score(110, 175);
    const fillerCount = Math.max(
      0,
      Math.round(((100 - fillerScore) / 100) * (request.durationSeconds / 10)),
    );

    return {
      overallScore: overall,
      clarity: {
        score: clarity,
        feedback: clarity >= 75 ? copy.clarityHigh : copy.clarityLow,
      },
      confidence: {
        score: confidence,
        feedback: confidence >= 75 ? copy.confidenceHigh : copy.confidenceLow,
      },
      pace: {
        score: pace,
        wordsPerMinute: wpm,
        feedback:
          wpm > 160
            ? copy.paceFast(wpm)
            : wpm < 120
              ? copy.paceSlow(wpm)
              : copy.paceIdeal(wpm),
      },
      structure: {
        score: structure,
        feedback: structure >= 75 ? copy.structureHigh : copy.structureLow,
      },
      persuasiveness: {
        score: persuasiveness,
        feedback:
          persuasiveness >= 75 ? copy.persuasionHigh : copy.persuasionLow,
      },
      vocabulary: {
        score: vocabulary,
        feedback: vocabulary >= 75 ? copy.vocabularyHigh : copy.vocabularyLow,
      },
      fillerWords: {
        score: fillerScore,
        count: fillerCount,
        words: [
          { word: copy.fillerWords[0], count: Math.ceil(fillerCount * 0.4) },
          { word: copy.fillerWords[1], count: Math.ceil(fillerCount * 0.3) },
          { word: copy.fillerWords[2], count: Math.floor(fillerCount * 0.2) },
          { word: copy.fillerWords[3], count: Math.floor(fillerCount * 0.1) },
        ].filter((w) => w.count > 0),
      },
      summary: copy.summary({
        strong: overall >= 75,
        minutes: Math.max(1, Math.round(request.durationSeconds / 60)),
        topic: request.topic,
        overall,
        standout:
          structure >= clarity ? copy.standoutStructure : copy.standoutClarity,
        focus: fillerScore < 70 ? copy.focusFillers : copy.focusPacing,
      }),
      strengths: [
        clarity >= 70 ? copy.strengths.clarity : copy.strengths.energy,
        structure >= 70 ? copy.strengths.structure : copy.strengths.tone,
        vocabulary >= 70 ? copy.strengths.vocabulary : copy.strengths.command,
      ],
      weaknesses: [
        fillerScore < 80
          ? copy.weaknesses.fillers(fillerCount)
          : copy.weaknesses.monotone,
        pace < 70 ? copy.weaknesses.pacing : copy.weaknesses.endings,
      ],
      tips: copy.tips,
      nextExercises: copy.exercises,
      /* TODO(ai): real transcript will come from the speech-to-text step. */
      transcript: undefined,
    };
  }
}
