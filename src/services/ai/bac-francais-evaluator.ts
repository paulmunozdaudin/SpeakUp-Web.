import type { BacFrancaisDimension, BacFrancaisEvaluation, SpeechLanguage } from "@/types";
import { BAC_FRANCAIS_DIMENSIONS } from "@/types";
import { analyzeTranscript } from "@/services/analysis/engine";

/**
 * Dedicated evaluator for the Bac de Français oral — deliberately separate
 * from the generic AnalysisProvider (heuristic/OpenAI) used everywhere
 * else. A real Bac de Français jury doesn't score "opening strength" or
 * "persuasion"; it scores literary analysis and mastery of the specific
 * text, so this produces its own 12-dimension rubric grounded in the
 * text the student actually provided.
 */

interface EvaluateInput {
  /** The text/reference the student is being examined on. */
  textContext: string;
  /** Full session transcript — explication linéaire + entretien. */
  transcript: string;
  language: SpeechLanguage;
  durationSeconds: number;
  targetDurationMinutes: number;
}

const MAX_TEXT_CHARS = 8000;

const DIMENSION_GLOSS: Record<SpeechLanguage, Record<BacFrancaisDimension, string>> = {
  fr: {
    explicationQuality: "qualité de l'explication linéaire",
    literaryAnalysis: "analyse littéraire",
    textMastery: "maîtrise du texte",
    workMastery: "maîtrise de l'œuvre",
    answerRelevance: "pertinence des réponses",
    argumentation: "argumentation",
    oralExpression: "expression orale",
    fluency: "fluidité",
    vocabulary: "vocabulaire",
    pace: "débit",
    fillerWords: "tics de langage",
    timeManagement: "gestion du temps",
  },
  es: {
    explicationQuality: "calidad de la explicación lineal",
    literaryAnalysis: "análisis literario",
    textMastery: "dominio del texto",
    workMastery: "dominio de la obra",
    answerRelevance: "pertinencia de las respuestas",
    argumentation: "argumentación",
    oralExpression: "expresión oral",
    fluency: "fluidez",
    vocabulary: "vocabulario",
    pace: "ritmo",
    fillerWords: "muletillas",
    timeManagement: "gestión del tiempo",
  },
  en: {
    explicationQuality: "quality of the linear explication",
    literaryAnalysis: "literary analysis",
    textMastery: "mastery of the text",
    workMastery: "mastery of the work",
    answerRelevance: "relevance of the answers",
    argumentation: "argumentation",
    oralExpression: "oral expression",
    fluency: "fluency",
    vocabulary: "vocabulary",
    pace: "pace",
    fillerWords: "filler words",
    timeManagement: "time management",
  },
};

function systemPrompt(language: SpeechLanguage): string {
  if (language === "fr") {
    return `Tu es un examinateur officiel du Bac de Français, en train de noter un oral réel. Tu évalues strictement selon les critères du Bac de Français : la maîtrise du texte étudié et de l'œuvre dont il est extrait, la qualité de l'explication linéaire, l'analyse littéraire, et la qualité de l'entretien qui suit. Tu n'es PAS un coach de prise de parole générique : ne parle jamais de "pitch", d'"audience" ou de "présentation professionnelle". Tu cites toujours des passages réels du texte étudié et de ce que l'élève a réellement dit pour justifier chaque note. Tu réponds UNIQUEMENT avec du JSON valide respectant le schéma donné, sans texte supplémentaire.`;
  }
  if (language === "es") {
    return `Eres un examinador oficial del Bac de Français, evaluando un oral real. Evalúas estrictamente según los criterios del Bac de Français: el dominio del texto estudiado y de la obra de la que procede, la calidad de la explicación lineal, el análisis literario, y la calidad de la entrevista posterior. NO eres un coach genérico de oratoria: nunca hables de "pitch", "audiencia" ni "presentación profesional". Citas siempre pasajes reales del texto estudiado y de lo que el estudiante dijo para justificar cada nota. Respondes ÚNICAMENTE con JSON válido según el esquema dado, sin texto adicional.`;
  }
  return `You are an official Bac de Français examiner, grading a real oral exam. You evaluate strictly by Bac de Français criteria: mastery of the studied text and the work it comes from, the quality of the linear explication, literary analysis, and the quality of the interview that follows. You are NOT a generic public-speaking coach: never talk about "pitch", "audience" or "professional presentation". You always quote real passages from the studied text and from what the student actually said to justify each score. You respond ONLY with valid JSON matching the given schema, no extra text.`;
}

function userPrompt(input: EvaluateInput): string {
  const stats = analyzeTranscript(input.transcript, input.language, input.durationSeconds);
  const text = input.textContext.slice(0, MAX_TEXT_CHARS);
  const dimensionList = BAC_FRANCAIS_DIMENSIONS.map(
    (key) => `${key} (${DIMENSION_GLOSS[input.language][key]})`,
  ).join(", ");

  if (input.language === "fr") {
    return `TEXTE ÉTUDIÉ (fourni par l'élève) :\n"""\n${text}\n"""\n\nDURÉE VISÉE : ${input.targetDurationMinutes} minutes\nDURÉE RÉELLE : ${Math.round(input.durationSeconds)} secondes\nDÉBIT MESURÉ : ${stats.wordsPerMinute} mots/min (verdict : ${stats.paceVerdict})\nTICS DE LANGAGE DÉTECTÉS : ${stats.fillerTotal} (${stats.fillerPerMinute}/min)\n\nTRANSCRIPTION COMPLÈTE DE LA SESSION (explication linéaire puis entretien avec le jury) :\n"""\n${input.transcript}\n"""\n\nÉvalue ces 12 dimensions du Bac de Français (0-100 chacune), chacune avec un retour citant du contenu RÉEL (le texte étudié ET ce que l'élève a dit) : ${dimensionList}.\n\nRéponds avec ce JSON exact (sans markdown) :\n{\n  "grade20": number (note globale sur 20, la note qu'un vrai jury donnerait),\n  "dimensions": { "<chaque clé ci-dessus>": { "score": number, "feedback": "string citant du contenu réel" } },\n  "strengths": ["3 à 5 points forts précis, citant le texte ou les réponses"],\n  "improvements": ["3 à 5 points à améliorer précis"],\n  "priorities": ["exactement 3 priorités concrètes à travailler avant le vrai oral"]\n}`;
  }
  if (input.language === "es") {
    return `TEXTO ESTUDIADO (aportado por el estudiante):\n"""\n${text}\n"""\n\nDURACIÓN OBJETIVO: ${input.targetDurationMinutes} minutos\nDURACIÓN REAL: ${Math.round(input.durationSeconds)} segundos\nRITMO MEDIDO: ${stats.wordsPerMinute} palabras/min (veredicto: ${stats.paceVerdict})\nMULETILLAS DETECTADAS: ${stats.fillerTotal} (${stats.fillerPerMinute}/min)\n\nTRANSCRIPCIÓN COMPLETA DE LA SESIÓN (explicación lineal y luego entrevista con el tribunal):\n"""\n${input.transcript}\n"""\n\nEvalúa estas 12 dimensiones del Bac de Français (0-100 cada una), cada una con feedback citando contenido REAL (el texto estudiado Y lo que dijo el estudiante): ${dimensionList}.\n\nResponde con este JSON exacto (sin markdown):\n{\n  "grade20": number (nota global sobre 20, la que daría un tribunal real),\n  "dimensions": { "<cada clave de arriba>": { "score": number, "feedback": "string citando contenido real" } },\n  "strengths": ["3 a 5 puntos fuertes precisos, citando el texto o las respuestas"],\n  "improvements": ["3 a 5 puntos a mejorar precisos"],\n  "priorities": ["exactamente 3 prioridades concretas antes del examen real"]\n}`;
  }
  return `STUDIED TEXT (provided by the student):\n"""\n${text}\n"""\n\nTARGET DURATION: ${input.targetDurationMinutes} minutes\nACTUAL DURATION: ${Math.round(input.durationSeconds)} seconds\nMEASURED PACE: ${stats.wordsPerMinute} words/min (verdict: ${stats.paceVerdict})\nFILLER WORDS DETECTED: ${stats.fillerTotal} (${stats.fillerPerMinute}/min)\n\nFULL SESSION TRANSCRIPT (linear explication then interview with the panel):\n"""\n${input.transcript}\n"""\n\nScore these 12 Bac de Français dimensions (0-100 each), each with feedback quoting REAL content (the studied text AND what the student said): ${dimensionList}.\n\nRespond with this exact JSON (no markdown):\n{\n  "grade20": number (overall grade out of 20, what a real panel would give),\n  "dimensions": { "<each key above>": { "score": number, "feedback": "string quoting real content" } },\n  "strengths": ["3 to 5 specific strengths, quoting the text or the answers"],\n  "improvements": ["3 to 5 specific things to improve"],\n  "priorities": ["exactly 3 concrete priorities to work on before the real exam"]\n}`;
}

interface OpenAIJsonShape {
  grade20: number;
  dimensions: Record<string, { score: number; feedback: string }>;
  strengths: string[];
  improvements: string[];
  priorities: string[];
}

function isValidShape(value: unknown): value is OpenAIJsonShape {
  if (!value || typeof value !== "object") return false;
  const v = value as Record<string, unknown>;
  if (typeof v.grade20 !== "number") return false;
  if (!v.dimensions || typeof v.dimensions !== "object") return false;
  for (const key of BAC_FRANCAIS_DIMENSIONS) {
    const dim = (v.dimensions as Record<string, unknown>)[key];
    if (
      !dim ||
      typeof (dim as { score?: unknown }).score !== "number" ||
      typeof (dim as { feedback?: unknown }).feedback !== "string"
    ) {
      return false;
    }
  }
  return (
    Array.isArray(v.strengths) && Array.isArray(v.improvements) && Array.isArray(v.priorities)
  );
}

async function generateWithOpenAI(
  apiKey: string,
  input: EvaluateInput,
): Promise<BacFrancaisEvaluation | null> {
  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        response_format: { type: "json_object" },
        temperature: 0.4,
        messages: [
          { role: "system", content: systemPrompt(input.language) },
          { role: "user", content: userPrompt(input) },
        ],
      }),
      signal: AbortSignal.timeout(45_000),
    });

    if (!response.ok) return null;
    const payload = await response.json();
    const raw = payload?.choices?.[0]?.message?.content;
    if (typeof raw !== "string") return null;

    const parsed: unknown = JSON.parse(raw);
    if (!isValidShape(parsed)) return null;

    const dimensions = {} as BacFrancaisEvaluation["dimensions"];
    for (const key of BAC_FRANCAIS_DIMENSIONS) {
      const dim = parsed.dimensions[key];
      dimensions[key] = {
        score: Math.max(0, Math.min(100, Math.round(dim.score))),
        feedback: dim.feedback,
      };
    }

    return {
      grade20: Math.max(0, Math.min(20, Math.round(parsed.grade20 * 10) / 10)),
      dimensions,
      strengths: parsed.strengths.slice(0, 5),
      improvements: parsed.improvements.slice(0, 5),
      priorities: parsed.priorities.slice(0, 3),
    };
  } catch (error) {
    console.error("[bac-francais-evaluator] OpenAI call failed:", error);
    return null;
  }
}

const HONEST_LIMIT_FEEDBACK: Record<SpeechLanguage, string> = {
  fr: "Analyse littéraire détaillée non disponible sans le coach IA avancé — ce score est une estimation générique.",
  es: "Análisis literario detallado no disponible sin el coach de IA avanzado — esta nota es una estimación genérica.",
  en: "Detailed literary analysis isn't available without the advanced AI coach — this score is a generic estimate.",
};

const PACE_VERDICT_LABEL: Record<SpeechLanguage, Record<"slow" | "ideal" | "fast", string>> = {
  fr: { slow: "trop lent", ideal: "idéal", fast: "trop rapide" },
  es: { slow: "demasiado lento", ideal: "ideal", fast: "demasiado rápido" },
  en: { slow: "too slow", ideal: "ideal", fast: "too fast" },
};

/** Without OpenAI, literary judgment (analyse littéraire, maîtrise de
 *  l'œuvre…) can't genuinely be assessed — those 6 dimensions get an
 *  honest mid-range placeholder rather than a fabricated precise score.
 *  The other 6 (fluency, vocabulary, pace, fillers, time, oral expression)
 *  are genuinely measurable from the transcript, so they get real scores
 *  AND real feedback quoting the actual numbers — not the literary-judgment
 *  caveat, which would be a non-sequitur next to a real measurement. */
function heuristicEvaluation(input: EvaluateInput): BacFrancaisEvaluation {
  const stats = analyzeTranscript(input.transcript, input.language, input.durationSeconds);
  const honestFeedback = HONEST_LIMIT_FEEDBACK[input.language];
  const paceLabel = PACE_VERDICT_LABEL[input.language][stats.paceVerdict];

  const fillerScore = Math.max(15, 100 - stats.fillerPerMinute * 10);
  const paceScore = stats.paceVerdict === "ideal" ? 85 : 55;
  const fluencyScore = Math.max(25, 90 - stats.fillerPerMinute * 6);
  const uniqueWords = new Set(
    input.transcript
      .toLowerCase()
      .split(/[^a-zàâäéèêëïîôöùûüÿœæç]+/i)
      .filter((w) => w.length > 2),
  ).size;
  const totalWords = Math.max(stats.wordCount, 1);
  const vocabularyScore = Math.max(30, Math.min(90, Math.round((uniqueWords / totalWords) * 220)));

  const targetSeconds = input.targetDurationMinutes * 60;
  const actualMinutes = Math.round(input.durationSeconds / 60);
  const timeDelta = Math.abs(input.durationSeconds - targetSeconds) / Math.max(targetSeconds, 1);
  const timeManagementScore = Math.max(20, Math.round(100 - timeDelta * 100));

  const fluencyFeedback: Record<SpeechLanguage, string> = {
    fr: `${stats.fillerTotal} tic(s) de langage détecté(s) (${stats.fillerPerMinute}/min) — c'est ce qui pèse le plus sur la fluidité mesurée.`,
    es: `${stats.fillerTotal} muletilla(s) detectada(s) (${stats.fillerPerMinute}/min) — es lo que más pesa en la fluidez medida.`,
    en: `${stats.fillerTotal} filler word(s) detected (${stats.fillerPerMinute}/min) — the biggest factor weighing on measured fluency.`,
  };
  const vocabularyFeedback: Record<SpeechLanguage, string> = {
    fr: `Diversité lexicale mesurée sur ${totalWords} mots prononcés, dont ${uniqueWords} mots distincts.`,
    es: `Diversidad léxica medida sobre ${totalWords} palabras pronunciadas, de las cuales ${uniqueWords} son distintas.`,
    en: `Lexical diversity measured over ${totalWords} spoken words, of which ${uniqueWords} are distinct.`,
  };
  const paceFeedback: Record<SpeechLanguage, string> = {
    fr: `Débit mesuré : ${stats.wordsPerMinute} mots/minute (${paceLabel}).`,
    es: `Ritmo medido: ${stats.wordsPerMinute} palabras/minuto (${paceLabel}).`,
    en: `Measured pace: ${stats.wordsPerMinute} words/minute (${paceLabel}).`,
  };
  const timeManagementFeedback: Record<SpeechLanguage, string> = {
    fr: `Durée réelle : ${actualMinutes} min pour un objectif de ${input.targetDurationMinutes} min.`,
    es: `Duración real: ${actualMinutes} min para un objetivo de ${input.targetDurationMinutes} min.`,
    en: `Actual duration: ${actualMinutes} min against a ${input.targetDurationMinutes} min target.`,
  };
  const oralExpressionFeedback: Record<SpeechLanguage, string> = {
    fr: "Estimation combinant le débit et la fluidité mesurés sur la transcription.",
    es: "Estimación que combina el ritmo y la fluidez medidos en la transcripción.",
    en: "Estimate combining the measured pace and fluency from the transcript.",
  };

  const dimensions: BacFrancaisEvaluation["dimensions"] = {
    explicationQuality: { score: 60, feedback: honestFeedback },
    literaryAnalysis: { score: 55, feedback: honestFeedback },
    textMastery: { score: 60, feedback: honestFeedback },
    workMastery: { score: 55, feedback: honestFeedback },
    answerRelevance: { score: 60, feedback: honestFeedback },
    argumentation: { score: 58, feedback: honestFeedback },
    oralExpression: {
      score: Math.round((fluencyScore + paceScore) / 2),
      feedback: oralExpressionFeedback[input.language],
    },
    fluency: { score: fluencyScore, feedback: fluencyFeedback[input.language] },
    vocabulary: { score: vocabularyScore, feedback: vocabularyFeedback[input.language] },
    pace: { score: paceScore, feedback: paceFeedback[input.language] },
    fillerWords: { score: fillerScore, feedback: fluencyFeedback[input.language] },
    timeManagement: { score: timeManagementScore, feedback: timeManagementFeedback[input.language] },
  };

  const grade20 =
    Math.round(
      (Object.values(dimensions).reduce((sum, d) => sum + d.score, 0) / (BAC_FRANCAIS_DIMENSIONS.length * 5)) *
        10,
    ) / 10;

  return {
    grade20: Math.max(0, Math.min(20, grade20)),
    dimensions,
    strengths: [],
    improvements: [],
    priorities: [],
  };
}

export async function evaluateBacFrancaisOral(input: EvaluateInput): Promise<BacFrancaisEvaluation> {
  const apiKey = process.env.OPENAI_API_KEY;
  const result = apiKey ? await generateWithOpenAI(apiKey, input) : null;
  return result ?? heuristicEvaluation(input);
}
