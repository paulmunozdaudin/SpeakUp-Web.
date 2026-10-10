import type {
  AnalysisResult,
  ChallengeDimension,
  ChallengeEvaluation,
  ChallengeType,
  MetricKey,
  SpeechLanguage,
} from "@/types";
import { CHALLENGE_DIMENSIONS } from "@/types";
import { analyzeTranscript, countPhrase, FILLERS } from "@/services/analysis/engine";
import { en, es, fr } from "@/lib/i18n/translations";

const DICTS = { en, es, fr };

const SUMMARY: Record<
  SpeechLanguage,
  (score: number, challenge: string, best: string, worst: string | null) => string
> = {
  es: (score, challenge, best, worst) =>
    `${score}/100 en «${challenge}». Tu punto más fuerte: ${best.toLowerCase()}.${worst ? ` Donde más puedes mejorar: ${worst.toLowerCase()}.` : ""}`,
  en: (score, challenge, best, worst) =>
    `${score}/100 on "${challenge}". Your strongest point: ${best.toLowerCase()}.${worst ? ` Where you can improve most: ${worst.toLowerCase()}.` : ""}`,
  fr: (score, challenge, best, worst) =>
    `${score}/100 sur « ${challenge} ». Ton point fort : ${best.toLowerCase()}.${worst ? ` Là où tu peux le plus progresser : ${worst.toLowerCase()}.` : ""}`,
};

/**
 * Challenge-specific evaluation. A 1-minute challenge isn't a presentation:
 * a surprise reading is judged on accuracy and delivery (the words aren't
 * the speaker's, so "your introduction is weak" would be nonsense), a
 * zero-fillers challenge lives or dies on the filler count, a story on its
 * hook and ending. Measurable dimensions (reading accuracy, reading pace,
 * fillers, blanks) are computed here and never left to the model; the
 * rest are judged by the LLM against a rubric written for that challenge.
 */

interface EvaluateInput {
  type: ChallengeType;
  transcript: string;
  language: SpeechLanguage;
  durationSeconds: number;
  /** The surprise topic (or the reading text's title). */
  prompt: string;
  /** "reading" only: the text that had to be read aloud. */
  sourceText?: string;
  /** Long blanks measured from the mic; undefined when not measured. */
  blanks?: number;
  /** The generic analysis (running concurrently), only awaited as a
   *  fallback if the LLM call fails. */
  generic: Promise<AnalysisResult>;
}

const LANGUAGE_NAME: Record<SpeechLanguage, string> = {
  es: "Spanish",
  en: "English",
  fr: "French (use 'tu', informal)",
};

const RUBRIC: Record<ChallengeType, string> = {
  improvise:
    "IMPROVISATION: a 1-minute talk on a surprise topic the speaker saw seconds before. It is NOT a prepared presentation: don't expect a formal introduction. Judge onTopic (answers and stays on the topic), structure (a quick structure under pressure: one clear idea, an example, a closing line), fluency (flow, restarts, hesitations, fillers), vocabulary (precision and variety of words), confidence (assertive phrasing vs hedging and apologizing).",
  reading:
    "SURPRISE READING ALOUD: the speaker read a text they had never seen. The words are NOT theirs: NEVER comment on content, ideas, introduction, structure or conclusion. Judge delivery only: accuracy (MEASURED, given below), fluency (smooth reading without restarts, repeated or stumbled words — compare the transcript with the text), pace (MEASURED; a good reading-aloud pace is 130-170 words/min), pauses (MEASURED long blanks). The transcript comes from speech-to-text, so you cannot hear intonation or tone: never comment on them.",
  explain:
    "EXPLAIN IT SIMPLY: explaining a complex concept so a 12-year-old understands. Judge simplicity (plain words, no unexplained jargon, short sentences), analogy (uses a comparison or a concrete everyday example), correctness (the explanation is factually right — point out any error), clarity (logical order; would a 12-year-old get it?).",
  noFillers:
    "ZERO FILLERS: talking for 1 minute about a topic without filler words. The main goal is the filler count. Judge fillers (MEASURED, given below), blanks (MEASURED long silences), fluency (keeps talking smoothly, no restarts), content (says something coherent about the topic rather than empty talk).",
  story:
    "TELL A STORY: a short personal anecdote. Judge hook (does the first sentence grab attention?), narrative (clear sequence: situation, problem or tension, resolution), details (vivid, concrete details, dialogue, sensations), ending (a satisfying ending, punchline or lesson), fluency (flow, restarts, fillers).",
};

/** Dimensions computed from measurements — the model writes feedback for
 *  them but never sets their score. */
const MEASURED: Partial<Record<ChallengeType, ChallengeDimension[]>> = {
  reading: ["accuracy", "pace", "pauses"],
  noFillers: ["fillers", "blanks"],
};

/** Overall score weights; dimensions not listed share the rest equally. */
const WEIGHTS: Partial<Record<ChallengeType, Partial<Record<ChallengeDimension, number>>>> = {
  reading: { accuracy: 0.35, fluency: 0.25, pace: 0.2, pauses: 0.2 },
  noFillers: { fillers: 0.5, blanks: 0.2, fluency: 0.15, content: 0.15 },
};

/** Generic metric used as the fallback score/feedback per dimension. */
const FALLBACK_METRIC: Record<ChallengeDimension, MetricKey> = {
  onTopic: "clarity",
  structure: "structure",
  fluency: "fluency",
  vocabulary: "precision",
  confidence: "confidence",
  accuracy: "precision",
  pace: "pace",
  pauses: "fluency",
  simplicity: "clarity",
  analogy: "persuasion",
  correctness: "precision",
  clarity: "clarity",
  fillers: "fillerUsage",
  blanks: "fluency",
  content: "clarity",
  hook: "openingStrength",
  narrative: "organization",
  details: "precision",
  ending: "closingQuality",
};

const clamp = (n: number) => Math.max(0, Math.min(100, Math.round(n)));

function words(text: string): string[] {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .split(/[^\p{L}\p{N}']+/u)
    .filter(Boolean);
}

/** Word-level LCS between the text and what was read: which words of the
 *  source were read, and which spoken words weren't in the text. */
function alignReading(source: string, transcript: string) {
  const displayWords = source.split(/\s+/).filter(Boolean);
  const src = displayWords.map((w) => words(w).join(""));
  const spoken = words(transcript);
  const n = src.length;
  const m = spoken.length;
  const dp: number[][] = Array.from({ length: n + 1 }, () => new Array(m + 1).fill(0));
  for (let i = n - 1; i >= 0; i--) {
    for (let j = m - 1; j >= 0; j--) {
      dp[i][j] =
        src[i] && src[i] === spoken[j]
          ? dp[i + 1][j + 1] + 1
          : Math.max(dp[i + 1][j], dp[i][j + 1]);
    }
  }
  const read = new Array(n).fill(false);
  const inserted: string[] = [];
  let i = 0;
  let j = 0;
  while (i < n && j < m) {
    if (src[i] && src[i] === spoken[j]) {
      read[i] = true;
      i++;
      j++;
    } else if (dp[i + 1][j] >= dp[i][j + 1]) {
      i++;
    } else {
      inserted.push(spoken[j]);
      j++;
    }
  }
  inserted.push(...spoken.slice(j));
  const counted = src.filter(Boolean).length;
  const matched = read.filter((r, k) => r && src[k]).length;
  return {
    accuracy: counted === 0 ? 0 : clamp((matched / counted) * 100),
    words: displayWords.map((text, k) => ({ text, read: read[k] || !src[k] })),
    missed: displayWords.filter((_, k) => !read[k] && src[k]),
    inserted,
  };
}

function readingPaceScore(wpm: number): number {
  if (wpm >= 130 && wpm <= 170) return 100;
  const distance = wpm < 130 ? 130 - wpm : wpm - 170;
  return clamp(100 - distance * 1.5);
}

function blanksScore(blanks: number): number {
  return clamp(100 - blanks * 18);
}

function fillersScore(perMinute: number): number {
  return clamp(100 - perMinute * 15);
}

const MEASURED_FEEDBACK: Record<
  SpeechLanguage,
  {
    accuracy: (pct: number, missed: string[]) => string;
    pace: (wpm: number) => string;
    blanks: (n: number | undefined) => string;
    fillers: (n: number, perMin: number, top: string) => string;
  }
> = {
  es: {
    accuracy: (pct, missed) =>
      missed.length === 0
        ? `Has leído el ${pct}% del texto, sin saltarte palabras.`
        : `Has leído el ${pct}% del texto. Palabras que no se han detectado: ${missed.slice(0, 6).map((w) => `«${w}»`).join(", ")}.`,
    pace: (wpm) =>
      `${wpm} palabras por minuto. Para leer en voz alta, lo ideal es entre 130 y 170: ${wpm < 130 ? "puedes ir algo más rápido" : wpm > 170 ? "frena un poco para que se entienda" : "estás en el rango ideal"}.`,
    blanks: (n) =>
      n === undefined
        ? "No se han podido medir los silencios en este navegador."
        : n === 0
          ? "Ningún bloqueo largo: has mantenido el ritmo de principio a fin."
          : `${n} silencio(s) de más de 2 segundos en mitad del reto.`,
    fillers: (n, perMin, top) =>
      n === 0
        ? "Cero muletillas. Reto cumplido."
        : `${n} muletilla(s) (${perMin}/min)${top ? `, sobre todo ${top}` : ""}. Cámbialas por un silencio breve.`,
  },
  en: {
    accuracy: (pct, missed) =>
      missed.length === 0
        ? `You read ${pct}% of the text without skipping words.`
        : `You read ${pct}% of the text. Words that weren't detected: ${missed.slice(0, 6).map((w) => `"${w}"`).join(", ")}.`,
    pace: (wpm) =>
      `${wpm} words per minute. For reading aloud, 130–170 is ideal: ${wpm < 130 ? "you can go a bit faster" : wpm > 170 ? "slow down a little so it lands" : "you're right in the ideal range"}.`,
    blanks: (n) =>
      n === undefined
        ? "Silences couldn't be measured in this browser."
        : n === 0
          ? "No long blanks: you kept the flow from start to finish."
          : `${n} silence(s) longer than 2 seconds mid-challenge.`,
    fillers: (n, perMin, top) =>
      n === 0
        ? "Zero filler words. Challenge completed."
        : `${n} filler word(s) (${perMin}/min)${top ? `, mostly ${top}` : ""}. Replace them with a short pause.`,
  },
  fr: {
    accuracy: (pct, missed) =>
      missed.length === 0
        ? `Tu as lu ${pct} % du texte, sans sauter de mots.`
        : `Tu as lu ${pct} % du texte. Mots non détectés : ${missed.slice(0, 6).map((w) => `« ${w} »`).join(", ")}.`,
    pace: (wpm) =>
      `${wpm} mots par minute. Pour lire à voix haute, l'idéal est entre 130 et 170 : ${wpm < 130 ? "tu peux aller un peu plus vite" : wpm > 170 ? "ralentis un peu pour qu'on te suive" : "tu es pile dans la bonne zone"}.`,
    blanks: (n) =>
      n === undefined
        ? "Les silences n'ont pas pu être mesurés sur ce navigateur."
        : n === 0
          ? "Aucun blanc : tu as gardé le rythme du début à la fin."
          : `${n} silence(s) de plus de 2 secondes en plein défi.`,
    fillers: (n, perMin, top) =>
      n === 0
        ? "Zéro tic de langage. Défi réussi."
        : `${n} tic(s) de langage (${perMin}/min)${top ? `, surtout ${top}` : ""}. Remplace-les par un court silence.`,
  },
};

const FALLBACK_TIP: Record<SpeechLanguage, Record<ChallengeType, string>> = {
  es: {
    improvise: "Antes de hablar, decide en 3 segundos tu idea principal y el ejemplo que vas a usar.",
    reading: "Echa un vistazo a la frase siguiente mientras terminas la actual: así no te trabas.",
    explain: "Empieza por una comparación con algo cotidiano y luego da el detalle.",
    noFillers: "Cuando notes que viene un «eh», cierra la boca un segundo: el silencio suena mucho mejor.",
    story: "Empieza por el momento más tenso de la historia, no por el principio.",
  },
  en: {
    improvise: "Before speaking, pick your main idea and one example in 3 seconds.",
    reading: "Glance at the next sentence while finishing the current one so you don't stumble.",
    explain: "Start with an everyday comparison, then add the detail.",
    noFillers: "When you feel an \"um\" coming, close your mouth for a second: silence sounds far better.",
    story: "Open with the most tense moment of the story, not with the beginning.",
  },
  fr: {
    improvise: "Avant de parler, choisis en 3 secondes ton idée principale et ton exemple.",
    reading: "Jette un œil à la phrase suivante pendant que tu finis la précédente : tu bloqueras moins.",
    explain: "Commence par une comparaison avec quelque chose du quotidien, puis donne le détail.",
    noFillers: "Quand tu sens un « euh » arriver, ferme la bouche une seconde : le silence sonne bien mieux.",
    story: "Commence par le moment le plus tendu de l'histoire, pas par le début.",
  },
};

interface LlmShape {
  dimensions: Record<string, { score: number; feedback: string }>;
  summary: string;
  strengths: string[];
  improvements: string[];
  nextTip: string;
}

function isLlmShape(value: unknown, keys: readonly string[]): value is LlmShape {
  if (!value || typeof value !== "object") return false;
  const v = value as Record<string, unknown>;
  if (!v.dimensions || typeof v.dimensions !== "object") return false;
  for (const key of keys) {
    const dim = (v.dimensions as Record<string, unknown>)[key] as
      | { score?: unknown; feedback?: unknown }
      | undefined;
    if (!dim || typeof dim.score !== "number" || typeof dim.feedback !== "string") return false;
  }
  return (
    typeof v.summary === "string" &&
    Array.isArray(v.strengths) &&
    Array.isArray(v.improvements) &&
    typeof v.nextTip === "string"
  );
}

async function judgeWithOpenAI(
  apiKey: string,
  input: EvaluateInput,
  measuredFacts: string,
): Promise<LlmShape | null> {
  const keys = CHALLENGE_DIMENSIONS[input.type];
  const system = `You are a demanding but encouraging speaking coach scoring a short communication challenge. ${RUBRIC[input.type]}
Quote or paraphrase what the speaker actually said to justify each score. Be honest: weak performances get low scores. Write every text field in ${LANGUAGE_NAME[input.language]}, addressing the speaker directly. Respond ONLY with valid JSON.`;
  const user = `CHALLENGE TOPIC / TEXT TITLE: ${input.prompt}
${input.sourceText ? `TEXT TO READ ALOUD:\n"""\n${input.sourceText}\n"""\n` : ""}DURATION: ${Math.round(input.durationSeconds)} s
MEASURED FACTS (ground truth, do not contradict):
${measuredFacts}

TRANSCRIPT (speech-to-text):
"""
${input.transcript}
"""

Return this JSON:
{
  "dimensions": { ${keys.map((k) => `"${k}": { "score": 0-100, "feedback": "1-2 sentences, specific" }`).join(", ")} },
  "summary": "2 sentences: the overall verdict for THIS challenge",
  "strengths": ["2 specific strengths"],
  "improvements": ["2 specific things to improve"],
  "nextTip": "one concrete thing to try in the next challenge"
}`;

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        response_format: { type: "json_object" },
        temperature: 0.4,
        messages: [
          { role: "system", content: system },
          { role: "user", content: user },
        ],
      }),
      signal: AbortSignal.timeout(40_000),
    });
    if (!response.ok) {
      console.error("[challenge-evaluator] OpenAI responded", response.status);
      return null;
    }
    const payload = await response.json();
    const raw = payload?.choices?.[0]?.message?.content;
    if (typeof raw !== "string") return null;
    const parsed: unknown = JSON.parse(raw);
    return isLlmShape(parsed, keys) ? parsed : null;
  } catch (error) {
    console.error("[challenge-evaluator] OpenAI call failed:", error);
    return null;
  }
}

/** Returns the evaluation plus a summary of it — the model's when it ran,
 *  otherwise one built from the challenge's own dimensions (never the
 *  generic presentation summary). */
export async function evaluateChallenge(
  input: EvaluateInput,
): Promise<{ evaluation: ChallengeEvaluation; summary: string }> {
  const { type, language } = input;
  const keys = CHALLENGE_DIMENSIONS[type] as readonly ChallengeDimension[];
  const fb = MEASURED_FEEDBACK[language];
  const minutes = Math.max(input.durationSeconds / 60, 1 / 60);

  const reading =
    type === "reading" && input.sourceText ? alignReading(input.sourceText, input.transcript) : null;

  // In a reading, words like "pues" or "bueno" may be part of the text —
  // only words the reader ADDED count as fillers.
  const stats = analyzeTranscript(input.transcript, language, input.durationSeconds);
  let fillerTotal = stats.fillerTotal;
  let fillerTop = stats.fillerTop;
  if (reading) {
    const addedText = reading.inserted.join(" ");
    fillerTop = FILLERS[language]
      .map((word) => ({ word, count: countPhrase(addedText, word) }))
      .filter((hit) => hit.count > 0)
      .sort((a, b) => b.count - a.count);
    fillerTotal = fillerTop.reduce((sum, hit) => sum + hit.count, 0);
  }
  const fillerPerMinute = Math.round((fillerTotal / minutes) * 10) / 10;
  const topFillers = fillerTop.slice(0, 2).map((f) => `"${f.word}"`).join(", ");

  const measured: Partial<Record<ChallengeDimension, { score: number; feedback: string }>> = {};
  if (reading) {
    measured.accuracy = { score: reading.accuracy, feedback: fb.accuracy(reading.accuracy, reading.missed) };
    measured.pace = { score: readingPaceScore(stats.wordsPerMinute), feedback: fb.pace(stats.wordsPerMinute) };
  }
  if (input.blanks !== undefined) {
    measured.pauses = { score: blanksScore(input.blanks), feedback: fb.blanks(input.blanks) };
    measured.blanks = measured.pauses;
  }
  measured.fillers = {
    score: fillersScore(fillerPerMinute),
    feedback: fb.fillers(fillerTotal, fillerPerMinute, topFillers),
  };

  const facts = [
    `- words per minute: ${stats.wordsPerMinute}`,
    `- filler words: ${fillerTotal} (${fillerPerMinute}/min)${topFillers ? `, top: ${topFillers}` : ""}`,
    `- long blanks (>2 s): ${input.blanks ?? "not measured"}`,
    reading
      ? `- reading accuracy: ${reading.accuracy}% of the text's words were read; missed: ${reading.missed.slice(0, 15).join(", ") || "none"}`
      : "",
  ]
    .filter(Boolean)
    .join("\n");

  const apiKey = process.env.OPENAI_API_KEY;
  const llm = apiKey ? await judgeWithOpenAI(apiKey, input, facts) : null;

  const generic = llm ? null : await input.generic;
  const fixed = MEASURED[type] ?? [];
  const dimensions = keys.map((key) => {
    const measuredDim = measured[key];
    if (measuredDim && (fixed.includes(key) || !llm)) {
      // Measured score always wins; keep the model's feedback when it has
      // one (it's more specific), else the measured explanation.
      return {
        key,
        score: measuredDim.score,
        feedback: llm?.dimensions[key]?.feedback ?? measuredDim.feedback,
      };
    }
    if (llm) {
      const dim = llm.dimensions[key];
      return { key, score: clamp(dim.score), feedback: dim.feedback };
    }
    const metric = generic!.metrics[FALLBACK_METRIC[key]];
    return { key, score: clamp(metric.score), feedback: metric.feedback };
  });

  const weights = WEIGHTS[type] ?? {};
  const score = clamp(
    dimensions.reduce((sum, d) => sum + d.score * (weights[d.key] ?? 1 / dimensions.length), 0),
  );

  const evaluation: ChallengeEvaluation = {
    type,
    score,
    dimensions,
    strengths: llm?.strengths.slice(0, 3) ?? [],
    improvements: llm?.improvements.slice(0, 3) ?? [],
    nextTip: llm?.nextTip ?? FALLBACK_TIP[language][type],
    stats: {
      wordsPerMinute: stats.wordsPerMinute,
      fillerTotal,
      fillerPerMinute,
      blanks: input.blanks ?? null,
    },
    ...(reading ? { reading: { accuracy: reading.accuracy, words: reading.words } } : {}),
  };
  const dict = DICTS[language];
  const sorted = [...dimensions].sort((a, b) => b.score - a.score);
  const best = dict.challenges.dimensions[sorted[0].key];
  const worstDim = sorted[sorted.length - 1];
  const worst =
    worstDim.score < sorted[0].score ? dict.challenges.dimensions[worstDim.key] : null;
  const fallbackSummary = SUMMARY[language](score, dict.challenges.types[type].name, best, worst);
  return { evaluation, summary: llm?.summary ?? fallbackSummary };
}
