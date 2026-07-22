/**
 * Deterministic linguistic analysis of a real transcript (server-side).
 *
 * Everything here is computed from the actual words the user said:
 * word count, pace, filler words, sentence lengths, discourse markers,
 * structure detection, hedging, evidence usage, repetition.
 *
 * The AI providers build on these facts: the OpenAI provider passes them to
 * the LLM as ground truth; the heuristic provider turns them directly into
 * scores and content-referencing feedback.
 */

import type { PaceVerdict, SpeechLanguage } from "@/types";

/* ── Lexicons ────────────────────────────────────────────────────────── */

const FILLERS: Record<SpeechLanguage, string[]> = {
  es: [
    "eh",
    "ehh",
    "em",
    "mmm",
    "este",
    "vale",
    "o sea",
    "en plan",
    "pues",
    "bueno",
    "básicamente",
    "es decir",
    "digamos",
    "como que",
    "ya sabes",
    "no sé",
    "entonces nada",
  ],
  en: [
    "um",
    "uh",
    "erm",
    "hmm",
    "like",
    "you know",
    "i mean",
    "so yeah",
    "basically",
    "actually",
    "literally",
    "kind of",
    "sort of",
    "right",
    "well",
  ],
};

const CONNECTORS: Record<SpeechLanguage, string[]> = {
  es: [
    "primero",
    "en primer lugar",
    "segundo",
    "además",
    "por otro lado",
    "sin embargo",
    "por ejemplo",
    "por eso",
    "por lo tanto",
    "finalmente",
    "por último",
    "en resumen",
  ],
  en: [
    "first",
    "firstly",
    "second",
    "in addition",
    "moreover",
    "however",
    "for example",
    "therefore",
    "as a result",
    "finally",
    "lastly",
    "in summary",
  ],
};

const INTRO_MARKERS: Record<SpeechLanguage, string[]> = {
  es: [
    "hola",
    "buenos días",
    "buenas tardes",
    "me llamo",
    "soy",
    "hoy voy a",
    "hoy quiero",
    "os voy a hablar",
    "les voy a hablar",
    "voy a presentar",
    "el tema de",
    "quiero empezar",
  ],
  en: [
    "hello",
    "hi everyone",
    "good morning",
    "good afternoon",
    "my name is",
    "i'm going to",
    "today i",
    "i want to talk",
    "i'll be presenting",
    "let me start",
  ],
};

const CLOSING_MARKERS: Record<SpeechLanguage, string[]> = {
  es: [
    "en conclusión",
    "para terminar",
    "para concluir",
    "en resumen",
    "en definitiva",
    "finalmente",
    "por último",
    "gracias",
    "muchas gracias",
  ],
  en: [
    "in conclusion",
    "to conclude",
    "to sum up",
    "in summary",
    "finally",
    "lastly",
    "thank you",
    "thanks for listening",
  ],
};

const HEDGES: Record<SpeechLanguage, string[]> = {
  es: ["creo que", "quizás", "quizá", "a lo mejor", "supongo", "no estoy seguro", "más o menos", "un poco"],
  en: ["i think", "maybe", "perhaps", "i guess", "i suppose", "not sure", "more or less", "a little bit"],
};

const EVIDENCE_MARKERS: Record<SpeechLanguage, string[]> = {
  es: ["por ejemplo", "porque", "datos", "según", "un caso", "demuestra", "resultado"],
  en: ["for example", "because", "data", "according to", "a case", "shows", "result"],
};

const STOPWORDS: Record<SpeechLanguage, Set<string>> = {
  es: new Set(
    "el la los las un una unos unas y o pero de del a al en que se por con para es son está están como más su sus lo mi nos si no ya muy este esta esto eso esa hay fue ser han he tiene tienen también cuando donde entre sobre les nosotros vosotros ellos yo tú usted".split(
      " ",
    ),
  ),
  en: new Set(
    "the a an and or but of to in that it is are was were be been i you he she we they this these those my your our their as at by for with on so not have has had do does did will would can could about from there here what which who when where".split(
      " ",
    ),
  ),
};

/* ── Stats model ─────────────────────────────────────────────────────── */

export interface FillerHit {
  word: string;
  count: number;
}

export interface TranscriptStats {
  wordCount: number;
  wordsPerMinute: number;
  paceVerdict: PaceVerdict;
  sentences: string[];
  avgSentenceLength: number;
  longestSentence: string;
  longestSentenceWords: number;
  longSentenceCount: number; // > 30 words
  fillerTotal: number;
  fillerPerMinute: number;
  fillerTop: FillerHit[];
  uniqueWordRatio: number; // 0–1
  repeatedWords: FillerHit[]; // most repeated non-stopwords
  connectorCount: number;
  hedgeCount: number;
  evidenceCount: number;
  questionCount: number;
  numberCount: number;
  hasIntro: boolean;
  hasBody: boolean;
  hasConclusion: boolean;
  firstSentence: string;
  lastSentence: string;
}

/* ── Helpers ─────────────────────────────────────────────────────────── */

function normalize(text: string): string {
  return text.toLowerCase().replace(/\s+/g, " ").trim();
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** Counts standalone occurrences of a word/phrase (unicode-aware). */
export function countPhrase(normalizedText: string, phrase: string): number {
  const pattern = new RegExp(
    `(?<=^|[^\\p{L}])${escapeRegExp(phrase)}(?=$|[^\\p{L}])`,
    "gu",
  );
  return (normalizedText.match(pattern) ?? []).length;
}

function countAny(normalizedText: string, phrases: string[]): number {
  return phrases.reduce((sum, p) => sum + countPhrase(normalizedText, p), 0);
}

export function shortQuote(sentence: string, maxChars = 70): string {
  const clean = sentence.trim();
  return clean.length <= maxChars ? clean : `${clean.slice(0, maxChars).trimEnd()}…`;
}

export function clampScore(value: number): number {
  return Math.max(5, Math.min(100, Math.round(value)));
}

/* ── Main analyzer ───────────────────────────────────────────────────── */

export function analyzeTranscript(
  transcript: string,
  language: SpeechLanguage,
  durationSeconds: number,
): TranscriptStats {
  const text = normalize(transcript);
  const words = text.split(" ").filter(Boolean);
  const wordCount = words.length;
  const minutes = Math.max(durationSeconds / 60, 1 / 60);
  const wordsPerMinute = Math.round(wordCount / minutes);

  const paceVerdict: PaceVerdict =
    wordsPerMinute < 110 ? "slow" : wordsPerMinute > 165 ? "fast" : "ideal";

  // Sentences: split on punctuation; live-STT rarely punctuates, so fall
  // back to fixed-size chunks to keep length metrics meaningful.
  let sentences = transcript
    .split(/(?<=[.!?…])\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 1);
  if (sentences.length <= 1 && wordCount > 40) {
    const chunkSize = 18;
    const raw = transcript.trim().split(/\s+/);
    sentences = [];
    for (let i = 0; i < raw.length; i += chunkSize) {
      sentences.push(raw.slice(i, i + chunkSize).join(" "));
    }
  }
  if (sentences.length === 0) sentences = [transcript.trim()];

  const sentenceLengths = sentences.map((s) => s.split(/\s+/).length);
  const avgSentenceLength =
    sentenceLengths.reduce((a, b) => a + b, 0) / sentenceLengths.length;
  const longestIndex = sentenceLengths.indexOf(Math.max(...sentenceLengths));
  const longSentenceCount = sentenceLengths.filter((l) => l > 30).length;

  // Filler words — count each lexicon entry, keep the top offenders.
  const fillerHits: FillerHit[] = FILLERS[language]
    .map((word) => ({ word, count: countPhrase(text, word) }))
    .filter((hit) => hit.count > 0)
    .sort((a, b) => b.count - a.count);
  const fillerTotal = fillerHits.reduce((sum, hit) => sum + hit.count, 0);

  // Vocabulary richness + repetition (excluding stopwords and fillers).
  const stop = STOPWORDS[language];
  const freq = new Map<string, number>();
  for (const word of words) {
    if (word.length < 4 || stop.has(word)) continue;
    freq.set(word, (freq.get(word) ?? 0) + 1);
  }
  const repeatedWords = [...freq.entries()]
    .filter(([, count]) => count >= 4)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([word, count]) => ({ word, count }));
  const uniqueWordRatio =
    wordCount === 0 ? 0 : new Set(words).size / wordCount;

  // Structure detection: markers in the first / last 20% of the speech.
  const head = normalize(sentences.slice(0, Math.max(1, Math.ceil(sentences.length * 0.2))).join(" "));
  const tail = normalize(sentences.slice(-Math.max(1, Math.ceil(sentences.length * 0.2))).join(" "));
  const hasIntro = countAny(head, INTRO_MARKERS[language]) > 0;
  const hasConclusion = countAny(tail, CLOSING_MARKERS[language]) > 0;
  const hasBody = wordCount >= 60;

  return {
    wordCount,
    wordsPerMinute,
    paceVerdict,
    sentences,
    avgSentenceLength,
    longestSentence: sentences[longestIndex] ?? "",
    longestSentenceWords: sentenceLengths[longestIndex] ?? 0,
    longSentenceCount,
    fillerTotal,
    fillerPerMinute: Math.round((fillerTotal / minutes) * 10) / 10,
    fillerTop: fillerHits.slice(0, 5),
    uniqueWordRatio,
    repeatedWords,
    connectorCount: countAny(text, CONNECTORS[language]),
    hedgeCount: countAny(text, HEDGES[language]),
    evidenceCount:
      countAny(text, EVIDENCE_MARKERS[language]) +
      (transcript.match(/\d+/g)?.length ?? 0),
    questionCount: (transcript.match(/\?/g) ?? []).length,
    numberCount: transcript.match(/\d+/g)?.length ?? 0,
    hasIntro,
    hasBody,
    hasConclusion,
    firstSentence: sentences[0] ?? "",
    lastSentence: sentences[sentences.length - 1] ?? "",
  };
}

/** Removes fillers and tidies spacing/capitalization — used by the
 *  heuristic improved version and offered to the LLM as a starting point. */
export function cleanTranscript(
  transcript: string,
  language: SpeechLanguage,
): string {
  let result = ` ${transcript.trim()} `;
  for (const filler of FILLERS[language]) {
    // Fillers are usually set off by commas ("um,", ", like,"): strip the
    // surrounding comma too, or removal just leaves an orphaned ",,".
    const pattern = new RegExp(
      `,?\\s*(?<=^|[^\\p{L}])${escapeRegExp(filler)}(?=$|[^\\p{L}])\\s*,?`,
      "giu",
    );
    result = result.replace(pattern, " ");
  }
  result = result
    .replace(/\s+([,.!?…])/g, "$1") // drop space before punctuation
    .replace(/,{2,}/g, ",") // collapse repeated commas
    .replace(/([.!?…]),+/g, "$1") // comma directly after a terminator
    .replace(/^\s*,\s*/g, "") // stray leading comma
    .replace(/(^|[.!?…]\s+),\s*/g, "$1") // stray comma opening a sentence
    .replace(/\s+/g, " ")
    .trim();
  // Capitalize sentence starts.
  result = result.replace(
    /(^|[.!?…]\s+)(\p{Ll})/gu,
    (_, prefix: string, letter: string) => prefix + letter.toUpperCase(),
  );
  if (result && !/[.!?…]$/.test(result)) result += ".";
  return result;
}
