import type {
  AnalysisResult,
  MetricKey,
  MetricScore,
  SpeechLanguage,
} from "@/types";
import {
  analyzeTranscript,
  cleanTranscript,
  clampScore,
  shortQuote,
  type TranscriptStats,
} from "@/services/analysis/engine";
import type { AnalysisProvider, AnalysisRequest } from "./provider";
import { AUDIENCE_QUESTIONS } from "./question-bank";

/**
 * Heuristic provider: turns the real transcript statistics into scores and
 * feedback that reference the user's actual content (quotes, counts, pace).
 * No external API needed — this is the default backend until OPENAI_API_KEY
 * is configured, and the safety net if the OpenAI call fails.
 */

/* Localized feedback templates fed with REAL data from the transcript. */
function buildCopy(language: SpeechLanguage) {
  if (language === "es") {
    return {
      paceFeedback: (s: TranscriptStats) =>
        s.paceVerdict === "fast"
          ? `Has hablado a ${s.wordsPerMinute} palabras por minuto — demasiado rápido. Apunta a 120–150 y haz una pausa tras cada idea clave.`
          : s.paceVerdict === "slow"
            ? `Has hablado a ${s.wordsPerMinute} palabras por minuto — algo lento. Acorta las transiciones para mantener la atención.`
            : `Has hablado a ${s.wordsPerMinute} palabras por minuto, dentro del rango ideal (110–165).`,
      fillerFeedback: (s: TranscriptStats) =>
        s.fillerTotal === 0
          ? "No se han detectado muletillas — un discurso muy limpio."
          : `Has usado ${s.fillerTotal} muletillas (${s.fillerPerMinute}/min). La más repetida: «${s.fillerTop[0]?.word}» × ${s.fillerTop[0]?.count}. Sustitúyelas por pausas breves.`,
      sentenceFeedback: (s: TranscriptStats) =>
        s.longSentenceCount > 0
          ? `Tu frase más larga tiene ${s.longestSentenceWords} palabras («${shortQuote(s.longestSentence, 60)}»). Divídela en dos o tres ideas.`
          : `Tus frases tienen una media de ${Math.round(s.avgSentenceLength)} palabras — una longitud fácil de seguir.`,
      clarityHigh: "Las ideas se entienden a la primera; mantienes frases directas.",
      clarityLow: (s: TranscriptStats) =>
        `Hay pasajes difíciles de seguir: ${s.longSentenceCount > 0 ? "frases demasiado largas" : "ideas encadenadas sin pausa"} y ${s.fillerTotal} muletillas diluyen el mensaje.`,
      confidenceHigh: "Suenas con seguridad: pocas vacilaciones y afirmaciones directas.",
      confidenceLow: (s: TranscriptStats) =>
        s.hedgeCount > 0
          ? `Detecto ${s.hedgeCount} expresiones de duda («creo que», «quizás»…). Afirma con datos en lugar de matizar cada idea.`
          : `El ritmo de ${s.fillerPerMinute} muletillas por minuto resta seguridad a tu voz, aunque no matizas con expresiones de duda. Sustitúyelas por pausas para sonar más firme.`,
      structureFeedback: (s: TranscriptStats) => {
        const missing = [
          !s.hasIntro && "una introducción que presente el tema",
          !s.hasConclusion && "un cierre que resuma y remate",
        ].filter(Boolean);
        return missing.length === 0
          ? "El discurso tiene apertura, desarrollo y cierre reconocibles."
          : `Al discurso le falta ${missing.join(" y ")}.`;
      },
      fluencyHigh: "El discurso fluye sin interrupciones notables.",
      fluencyLow: (s: TranscriptStats) =>
        `Las ${s.fillerTotal} muletillas y los arranques cortos rompen el ritmo. Ensaya las transiciones entre ideas.`,
      organizationHigh: (s: TranscriptStats) =>
        `Usas ${s.connectorCount} conectores discursivos («primero», «además», «por último»…), lo que ordena el mensaje.`,
      organizationLow:
        "Apenas usas conectores («primero», «además», «en resumen»). Añádelos para guiar al oyente.",
      persuasionHigh: (s: TranscriptStats) =>
        `Apoyas tus ideas con ${s.evidenceCount} referencias a datos o ejemplos: eso convence.`,
      persuasionLow:
        "Faltan ejemplos y datos concretos. Una cifra o un caso real convence más que un adjetivo.",
      naturalnessHigh: "El tono es conversacional y cercano, sin sonar leído.",
      naturalnessLow: (s: TranscriptStats) =>
        s.repeatedWords.length > 0
          ? `Repites mucho «${s.repeatedWords[0].word}» (${s.repeatedWords[0].count} veces); varía el vocabulario para sonar más natural.`
          : "Algunos tramos suenan mecánicos; varía el ritmo y la entonación.",
      precisionHigh: "Vocabulario variado y preciso para el tema.",
      precisionLow: (s: TranscriptStats) =>
        s.repeatedWords.length > 0
          ? `El término «${s.repeatedWords[0].word}» aparece ${s.repeatedWords[0].count} veces. Busca sinónimos y términos más específicos.`
          : "El vocabulario es genérico; usa términos más específicos del tema.",
      openingHigh: (s: TranscriptStats) =>
        `Tu apertura («${shortQuote(s.firstSentence, 60)}») sitúa al oyente desde el primer segundo.`,
      openingLow: (s: TranscriptStats) =>
        `Tu primera frase («${shortQuote(s.firstSentence, 60)}») no engancha. Abre con una pregunta, un dato o una promesa clara.`,
      closingHigh: (s: TranscriptStats) =>
        `Cierras con una conclusión reconocible («${shortQuote(s.lastSentence, 60)}»).`,
      closingLow:
        "El discurso termina de forma abrupta, sin resumen ni llamada a la acción. Los últimos 15 segundos son los que se recuerdan.",
      summary: (s: TranscriptStats, overall: number, title: string) =>
        `Análisis de «${title}»: ${s.wordCount} palabras a ${s.wordsPerMinute} ppm con ${s.fillerTotal} muletillas. Puntuación global ${overall}/100. ${
          s.hasIntro && s.hasConclusion
            ? "La estructura está completa; el siguiente salto está en la ejecución."
            : "Lo más urgente es completar la estructura: " +
              [!s.hasIntro && "introducción", !s.hasConclusion && "cierre"]
                .filter(Boolean)
                .join(" y ") +
              "."
        }`,
      recommendations: (s: TranscriptStats): string[] => {
        const recs: string[] = [];
        if (s.fillerTotal > 2 && s.fillerTop[0])
          recs.push(
            `Graba de nuevo intentando no decir «${s.fillerTop[0].word}» (hoy: ${s.fillerTop[0].count} veces). Cuando lo notes venir, haz una pausa de un segundo.`,
          );
        if (!s.hasConclusion)
          recs.push(
            "Escribe y memoriza una frase final que empiece por «En conclusión…» y resuma tu idea central en menos de 20 palabras.",
          );
        if (!s.hasIntro)
          recs.push(
            "Prepara una apertura de 2 frases: qué vas a contar y por qué le importa a tu audiencia. Dila antes de entrar en materia.",
          );
        if (s.paceVerdict !== "ideal")
          recs.push(
            s.paceVerdict === "fast"
              ? `Baja de ${s.wordsPerMinute} a ~140 ppm: marca una pausa de 1 segundo después de cada punto y respira antes de cada idea nueva.`
              : `Sube de ${s.wordsPerMinute} a ~130 ppm: ensaya con un cronómetro y elimina los silencios entre frases.`,
          );
        if (s.longSentenceCount > 0)
          recs.push(
            `Divide tu frase más larga (${s.longestSentenceWords} palabras) en dos: una idea por frase, un punto entre cada una.`,
          );
        if (s.evidenceCount < 2)
          recs.push(
            "Añade al menos un dato numérico y un ejemplo concreto que respalden tu argumento principal.",
          );
        if (s.connectorCount < 2)
          recs.push(
            "Ordena el discurso con tres conectores explícitos: «primero», «además» y «por último».",
          );
        if (s.hedgeCount > 2)
          recs.push(
            `Elimina las ${s.hedgeCount} expresiones de duda («creo que», «quizás»): afirma y respalda con un dato.`,
          );
        recs.push(
          "Vuelve a grabar esta misma presentación mañana y compara las dos puntuaciones: la mejora medida es la que se consolida.",
        );
        return recs.slice(0, 5);
      },
      improvedIntro: (title: string, topic: string) =>
        `Hoy quiero hablaros de ${topic || title}. En los próximos minutos veréis por qué importa y qué propongo.`,
      improvedClosing: (topic: string) =>
        `En conclusión: ${topic ? `${topic} — ` : ""}esta es la idea que me gustaría que os llevarais hoy. Gracias.`,
    };
  }
  return {
    paceFeedback: (s: TranscriptStats) =>
      s.paceVerdict === "fast"
        ? `You spoke at ${s.wordsPerMinute} words per minute — too fast. Aim for 120–150 and pause after each key idea.`
        : s.paceVerdict === "slow"
          ? `You spoke at ${s.wordsPerMinute} words per minute — on the slow side. Tighten transitions to keep attention.`
          : `You spoke at ${s.wordsPerMinute} words per minute, right in the ideal range (110–165).`,
    fillerFeedback: (s: TranscriptStats) =>
      s.fillerTotal === 0
        ? "No filler words detected — a very clean delivery."
        : `You used ${s.fillerTotal} filler words (${s.fillerPerMinute}/min). Most repeated: “${s.fillerTop[0]?.word}” × ${s.fillerTop[0]?.count}. Replace them with short pauses.`,
    sentenceFeedback: (s: TranscriptStats) =>
      s.longSentenceCount > 0
        ? `Your longest sentence runs ${s.longestSentenceWords} words (“${shortQuote(s.longestSentence, 60)}”). Split it into two or three ideas.`
        : `Your sentences average ${Math.round(s.avgSentenceLength)} words — an easy-to-follow length.`,
    clarityHigh: "Ideas land on first listen; you keep sentences direct.",
    clarityLow: (s: TranscriptStats) =>
      `Some passages are hard to follow: ${s.longSentenceCount > 0 ? "overlong sentences" : "ideas chained without pauses"} plus ${s.fillerTotal} fillers dilute the message.`,
    confidenceHigh: "You sound assured: few hedges and direct statements.",
    confidenceLow: (s: TranscriptStats) =>
      s.hedgeCount > 0
        ? `I detect ${s.hedgeCount} hedging phrases (“I think”, “maybe”…). Assert with data instead of softening every idea.`
        : `${s.fillerPerMinute} filler words per minute undercut your confidence, even though you don't hedge your claims. Swap them for pauses to sound more assured.`,
    structureFeedback: (s: TranscriptStats) => {
      const missing = [
        !s.hasIntro && "an introduction that frames the topic",
        !s.hasConclusion && "a closing that summarizes and lands",
      ].filter(Boolean);
      return missing.length === 0
        ? "The speech has a recognizable opening, body and close."
        : `The speech is missing ${missing.join(" and ")}.`;
    },
    fluencyHigh: "The speech flows without noticeable breaks.",
    fluencyLow: (s: TranscriptStats) =>
      `${s.fillerTotal} fillers and short restarts break the rhythm. Rehearse the transitions between ideas.`,
    organizationHigh: (s: TranscriptStats) =>
      `You use ${s.connectorCount} discourse connectors (“first”, “moreover”, “finally”…), which keeps the message ordered.`,
    organizationLow:
      "You barely use connectors (“first”, “in addition”, “to sum up”). Add them to guide the listener.",
    persuasionHigh: (s: TranscriptStats) =>
      `You back your points with ${s.evidenceCount} references to data or examples — that persuades.`,
    persuasionLow:
      "Concrete examples and data are missing. One number or real case persuades more than an adjective.",
    naturalnessHigh: "The tone is conversational and engaging, never read-aloud.",
    naturalnessLow: (s: TranscriptStats) =>
      s.repeatedWords.length > 0
        ? `You repeat “${s.repeatedWords[0].word}” a lot (${s.repeatedWords[0].count} times); vary vocabulary to sound more natural.`
        : "Some stretches sound mechanical; vary rhythm and intonation.",
    precisionHigh: "Varied, precise vocabulary for the topic.",
    precisionLow: (s: TranscriptStats) =>
      s.repeatedWords.length > 0
        ? `The word “${s.repeatedWords[0].word}” appears ${s.repeatedWords[0].count} times. Reach for synonyms and more specific terms.`
        : "The vocabulary stays generic; use terms specific to your topic.",
    openingHigh: (s: TranscriptStats) =>
      `Your opening (“${shortQuote(s.firstSentence, 60)}”) orients the listener from the first second.`,
    openingLow: (s: TranscriptStats) =>
      `Your first sentence (“${shortQuote(s.firstSentence, 60)}”) doesn't hook. Open with a question, a number or a clear promise.`,
    closingHigh: (s: TranscriptStats) =>
      `You close with a recognizable conclusion (“${shortQuote(s.lastSentence, 60)}”).`,
    closingLow:
      "The speech ends abruptly, with no summary or call to action. The last 15 seconds are what people remember.",
    summary: (s: TranscriptStats, overall: number, title: string) =>
      `Analysis of “${title}”: ${s.wordCount} words at ${s.wordsPerMinute} wpm with ${s.fillerTotal} fillers. Overall score ${overall}/100. ${
        s.hasIntro && s.hasConclusion
          ? "The structure is complete; the next jump is in delivery."
          : "The most urgent fix is completing the structure: " +
            [!s.hasIntro && "introduction", !s.hasConclusion && "closing"]
              .filter(Boolean)
              .join(" and ") +
            "."
      }`,
    recommendations: (s: TranscriptStats): string[] => {
      const recs: string[] = [];
      if (s.fillerTotal > 2 && s.fillerTop[0])
        recs.push(
          `Re-record while banning “${s.fillerTop[0].word}” (today: ${s.fillerTop[0].count} times). When you feel it coming, hold a one-second pause instead.`,
        );
      if (!s.hasConclusion)
        recs.push(
          "Write and memorize a final line starting with “In conclusion…” that sums up your core idea in under 20 words.",
        );
      if (!s.hasIntro)
        recs.push(
          "Prepare a 2-sentence opening: what you'll cover and why your audience should care. Say it before diving in.",
        );
      if (s.paceVerdict !== "ideal")
        recs.push(
          s.paceVerdict === "fast"
            ? `Bring ${s.wordsPerMinute} wpm down to ~140: hold a 1-second pause after every period and breathe before each new idea.`
            : `Bring ${s.wordsPerMinute} wpm up to ~130: rehearse against a timer and cut the silences between sentences.`,
        );
      if (s.longSentenceCount > 0)
        recs.push(
          `Split your longest sentence (${s.longestSentenceWords} words) in two: one idea per sentence, a full stop between them.`,
        );
      if (s.evidenceCount < 2)
        recs.push(
          "Add at least one number and one concrete example supporting your main argument.",
        );
      if (s.connectorCount < 2)
        recs.push(
          "Order the speech with three explicit connectors: “first”, “in addition” and “finally”.",
        );
      if (s.hedgeCount > 2)
        recs.push(
          `Cut the ${s.hedgeCount} hedging phrases (“I think”, “maybe”): assert, then back it with a fact.`,
        );
      recs.push(
        "Re-record this same talk tomorrow and compare both scores — measured improvement is what sticks.",
      );
      return recs.slice(0, 5);
    },
    improvedIntro: (title: string, topic: string) =>
      `Today I want to talk to you about ${topic || title}. Over the next few minutes you'll see why it matters and what I propose.`,
    improvedClosing: (topic: string) =>
      `In conclusion: ${topic ? `${topic} — ` : ""}this is the one idea I'd like you to take away today. Thank you.`,
  };
}

function pickFeedback(
  score: number,
  high: string | ((s: TranscriptStats) => string),
  low: string | ((s: TranscriptStats) => string),
  stats: TranscriptStats,
): string {
  const chosen = score >= 72 ? high : low;
  return typeof chosen === "function" ? chosen(stats) : chosen;
}

export class HeuristicAnalysisProvider implements AnalysisProvider {
  readonly name = "heuristic";

  async analyze(request: AnalysisRequest): Promise<AnalysisResult> {
    const { transcript, language, durationSeconds } = request;
    const s = analyzeTranscript(transcript, language, durationSeconds);
    const copy = buildCopy(language);

    /* Scores — every formula reads a real measurement. */
    const pace = clampScore(100 - Math.min(60, Math.abs(s.wordsPerMinute - 138) * 1.1));
    const fillerUsage = clampScore(100 - Math.min(85, s.fillerPerMinute * 9));
    const sentenceLength = clampScore(
      96 - Math.abs(s.avgSentenceLength - 16) * 2.2 - s.longSentenceCount * 6,
    );
    const structure = clampScore(
      34 + (s.hasIntro ? 22 : 0) + (s.hasBody ? 22 : 0) + (s.hasConclusion ? 22 : 0),
    );
    const organization = clampScore(
      structure * 0.5 + Math.min(40, s.connectorCount * 9) + 8,
    );
    const fluency = clampScore(92 - s.fillerPerMinute * 6 - (s.avgSentenceLength < 6 ? 14 : 0));
    const clarity = clampScore(
      sentenceLength * 0.45 + fillerUsage * 0.3 + s.uniqueWordRatio * 100 * 0.25,
    );
    const confidence = clampScore(88 - s.hedgeCount * 7 - s.fillerPerMinute * 3);
    const persuasion = clampScore(
      48 + Math.min(34, s.evidenceCount * 7) + (s.questionCount > 0 ? 8 : 0) + (s.hasConclusion ? 8 : 0),
    );
    const naturalness = clampScore(
      86 - s.longSentenceCount * 7 - (s.repeatedWords[0]?.count ?? 0) * 2.5,
    );
    const precision = clampScore(
      50 + s.uniqueWordRatio * 80 - (s.repeatedWords[0]?.count ?? 0) * 3,
    );
    const openingStrength = clampScore(
      (s.hasIntro ? 74 : 48) +
        (/[?¿]/.test(s.firstSentence) ? 10 : 0) +
        (/\d/.test(s.firstSentence) ? 10 : 0),
    );
    const closingQuality = clampScore(
      (s.hasConclusion ? 78 : 42) + (/\d/.test(s.lastSentence) ? 6 : 0),
    );

    const metrics: Record<MetricKey, MetricScore> = {
      clarity: { score: clarity, feedback: pickFeedback(clarity, copy.clarityHigh, copy.clarityLow, s) },
      confidence: { score: confidence, feedback: pickFeedback(confidence, copy.confidenceHigh, copy.confidenceLow, s) },
      structure: { score: structure, feedback: copy.structureFeedback(s) },
      pace: { score: pace, feedback: copy.paceFeedback(s) },
      fluency: { score: fluency, feedback: pickFeedback(fluency, copy.fluencyHigh, copy.fluencyLow, s) },
      fillerUsage: { score: fillerUsage, feedback: copy.fillerFeedback(s) },
      sentenceLength: { score: sentenceLength, feedback: copy.sentenceFeedback(s) },
      organization: { score: organization, feedback: pickFeedback(organization, copy.organizationHigh, copy.organizationLow, s) },
      persuasion: { score: persuasion, feedback: pickFeedback(persuasion, copy.persuasionHigh, copy.persuasionLow, s) },
      naturalness: { score: naturalness, feedback: pickFeedback(naturalness, copy.naturalnessHigh, copy.naturalnessLow, s) },
      precision: { score: precision, feedback: pickFeedback(precision, copy.precisionHigh, copy.precisionLow, s) },
      openingStrength: { score: openingStrength, feedback: pickFeedback(openingStrength, copy.openingHigh, copy.openingLow, s) },
      closingQuality: { score: closingQuality, feedback: pickFeedback(closingQuality, copy.closingHigh, copy.closingLow, s) },
    };

    const weights: Record<MetricKey, number> = {
      clarity: 1.2, confidence: 1, structure: 1.2, pace: 1, fluency: 1,
      fillerUsage: 1, sentenceLength: 0.8, organization: 1, persuasion: 1,
      naturalness: 0.8, precision: 0.8, openingStrength: 0.6, closingQuality: 0.6,
    };
    const totalWeight = Object.values(weights).reduce((a, b) => a + b, 0);
    const overallScore = Math.round(
      (Object.keys(metrics) as MetricKey[]).reduce(
        (sum, key) => sum + metrics[key].score * weights[key],
        0,
      ) / totalWeight,
    );

    /* Highlights & weaknesses: best/worst dimensions with their evidence. */
    const ranked = (Object.keys(metrics) as MetricKey[]).sort(
      (a, b) => metrics[b].score - metrics[a].score,
    );
    const highlights = ranked.slice(0, 3).map((key) => metrics[key].feedback);
    const weaknesses = ranked
      .slice(-3)
      .reverse()
      .map((key) => metrics[key].feedback);

    /* Improved version: real cleanup + structural completion. */
    let improved = cleanTranscript(transcript, language);
    if (!s.hasIntro) {
      improved = `${copy.improvedIntro(request.title, request.topic)} ${improved}`;
    }
    if (!s.hasConclusion) {
      improved = `${improved} ${copy.improvedClosing(request.topic)}`;
    }

    const questions = AUDIENCE_QUESTIONS[language][request.mode].map((q) =>
      q.replaceAll("{topic}", request.topic || request.title),
    );

    return {
      version: 2,
      provider: "heuristic",
      language,
      overallScore,
      metrics,
      wordCount: s.wordCount,
      wordsPerMinute: s.wordsPerMinute,
      paceVerdict: s.paceVerdict,
      fillerWords: {
        total: s.fillerTotal,
        perMinute: s.fillerPerMinute,
        top: s.fillerTop,
      },
      structure: {
        hasIntro: s.hasIntro,
        hasBody: s.hasBody,
        hasConclusion: s.hasConclusion,
        commentary: copy.structureFeedback(s),
      },
      summary: copy.summary(s, overallScore, request.title),
      highlights,
      weaknesses,
      recommendations: copy.recommendations(s),
      improvedVersion: improved,
      audienceQuestions: questions,
      transcript,
    };
  }
}
