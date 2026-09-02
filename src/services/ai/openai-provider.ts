import type { AnalysisResult, MetricKey, SpeechLanguage } from "@/types";
import { METRIC_KEYS } from "@/types";
import { analyzeTranscript } from "@/services/analysis/engine";
import type { AnalysisProvider, AnalysisRequest } from "./provider";
import { HeuristicAnalysisProvider } from "./heuristic-provider";

/**
 * OpenAI-backed coach. Sends the real transcript plus objective transcript
 * statistics (computed by services/analysis/engine.ts) and asks the model
 * for structured JSON matching AnalysisResult's narrative fields. Falls back
 * to the heuristic provider if the API call fails or returns malformed data
 * — the user never sees a broken result screen.
 */

const MODEL = "gpt-4o-mini";

const MODE_LABELS: Record<SpeechLanguage, Record<string, string>> = {
  fr: {
    presentation: "présentation libre",
    "startup-pitch": "pitch de startup devant des investisseurs",
    interview: "entretien d'embauche",
    "oral-exam": "examen oral académique",
    "project-defense": "soutenance de projet",
  },
  es: {
    presentation: "presentación libre",
    "startup-pitch": "pitch de startup ante inversores",
    interview: "entrevista de trabajo",
    "oral-exam": "examen oral académico",
    "project-defense": "defensa de proyecto",
  },
  en: {
    presentation: "open presentation",
    "startup-pitch": "startup pitch to investors",
    interview: "job interview",
    "oral-exam": "academic oral exam",
    "project-defense": "project defense",
  },
};

function systemPrompt(language: SpeechLanguage): string {
  if (language === "es") {
    return `Eres un coach profesional de comunicación y oratoria con 20 años de experiencia. Analizas transcripciones reales de discursos y das feedback específico, honesto y accionable — nunca genérico. Siempre citas o parafraseas fragmentos reales de la transcripción para justificar tus puntuaciones. Respondes ÚNICAMENTE con JSON válido que cumpla el esquema indicado, sin texto adicional.`;
  }
  if (language === "fr") {
    return `Vous êtes un coach professionnel en communication et prise de parole en public avec 20 ans d'expérience. Vous analysez de vraies transcriptions de discours et donnez un retour spécifique, honnête et actionnable — jamais générique. Vous citez ou paraphrasez toujours de vrais extraits de la transcription pour justifier vos notes. Vous répondez UNIQUEMENT avec du JSON valide respectant le schéma indiqué, sans texte supplémentaire.`;
  }
  return `You are a professional communication and public-speaking coach with 20 years of experience. You analyze real speech transcripts and give specific, honest, actionable feedback — never generic. You always quote or paraphrase real fragments from the transcript to justify your scores. You respond ONLY with valid JSON matching the given schema, no extra text.`;
}

function userPrompt(request: AnalysisRequest): string {
  const stats = analyzeTranscript(
    request.transcript,
    request.language,
    request.durationSeconds,
  );
  const modeLabel =
    MODE_LABELS[request.language][request.mode] ?? request.mode;

  const metricList = METRIC_KEYS.join(", ");

  if (request.language === "es") {
    return `MODO: ${modeLabel}
TÍTULO: ${request.title}
TEMA: ${request.topic || "(no especificado)"}
DURACIÓN OBJETIVO: ${request.targetDurationMinutes} minutos
DURACIÓN REAL: ${Math.round(request.durationSeconds)} segundos

DATOS OBJETIVOS YA CALCULADOS (úsalos, no los recalcules):
- Palabras totales: ${stats.wordCount}
- Palabras por minuto: ${stats.wordsPerMinute} (veredicto: ${stats.paceVerdict})
- Muletillas detectadas: ${stats.fillerTotal} (${stats.fillerPerMinute}/min). Top: ${stats.fillerTop.map((f) => `"${f.word}"×${f.count}`).join(", ") || "ninguna"}
- Longitud media de frase: ${Math.round(stats.avgSentenceLength)} palabras. Frase más larga: ${stats.longestSentenceWords} palabras.
- Introducción detectada: ${stats.hasIntro ? "sí" : "no"}. Conclusión detectada: ${stats.hasConclusion ? "sí" : "no"}.
- Primera frase: "${stats.firstSentence}"
- Última frase: "${stats.lastSentence}"

TRANSCRIPCIÓN COMPLETA:
"""
${request.transcript}
"""

Evalúa estas 13 dimensiones (0-100 cada una), cada una con feedback que cite contenido REAL de la transcripción: ${metricList}.
(clarity=claridad, confidence=confianza, structure=estructura, pace=ritmo, fluency=fluidez, fillerUsage=uso de muletillas donde 100=sin muletillas, sentenceLength=longitud de frases, organization=organización, persuasion=persuasión, naturalness=naturalidad, precision=precisión del lenguaje, openingStrength=fuerza de apertura, closingQuality=calidad del cierre)

Responde con este JSON exacto (sin markdown, sin comentarios):
{
  "overallScore": number,
  "metrics": { "<cada clave de arriba>": { "score": number, "feedback": "string citando contenido real" } },
  "summary": "string: resumen ejecutivo del análisis, 2-3 frases, con datos concretos",
  "highlights": ["3 puntos fuertes específicos citando la transcripción"],
  "weaknesses": ["3 puntos débiles específicos citando la transcripción"],
  "recommendations": ["exactamente 5 acciones MUY concretas y específicas, no genéricas"],
  "improvedVersion": "reescritura completa del discurso, mismo idioma, misma idea, mucho mejor redactada y estructurada, longitud similar",
  "audienceQuestions": ["entre 5 y 10 preguntas que haría un profesor/inversor/entrevistador/tribunal según el modo, específicas al contenido real"]
}`;
  }

  if (request.language === "fr") {
    return `MODE : ${modeLabel}
TITRE : ${request.title}
SUJET : ${request.topic || "(non spécifié)"}
DURÉE VISÉE : ${request.targetDurationMinutes} minutes
DURÉE RÉELLE : ${Math.round(request.durationSeconds)} secondes

DONNÉES OBJECTIVES DÉJÀ CALCULÉES (utilisez-les, ne les recalculez pas) :
- Mots au total : ${stats.wordCount}
- Mots par minute : ${stats.wordsPerMinute} (verdict : ${stats.paceVerdict})
- Tics de langage détectés : ${stats.fillerTotal} (${stats.fillerPerMinute}/min). Top : ${stats.fillerTop.map((f) => `"${f.word}"×${f.count}`).join(", ") || "aucun"}
- Longueur moyenne des phrases : ${Math.round(stats.avgSentenceLength)} mots. Phrase la plus longue : ${stats.longestSentenceWords} mots.
- Introduction détectée : ${stats.hasIntro ? "oui" : "non"}. Conclusion détectée : ${stats.hasConclusion ? "oui" : "non"}.
- Première phrase : "${stats.firstSentence}"
- Dernière phrase : "${stats.lastSentence}"

TRANSCRIPTION COMPLÈTE :
"""
${request.transcript}
"""

Évaluez ces 13 dimensions (0-100 chacune), chacune avec un retour citant du contenu RÉEL de la transcription : ${metricList}.
(clarity=clarté, confidence=confiance, structure=structure, pace=rythme, fluency=fluidité, fillerUsage=usage des tics de langage où 100=aucun tic, sentenceLength=longueur des phrases, organization=organisation, persuasion=persuasion, naturalness=naturel, precision=précision du langage, openingStrength=force de l'ouverture, closingQuality=qualité de la conclusion)

Répondez avec ce JSON exact (sans markdown, sans commentaires) :
{
  "overallScore": number,
  "metrics": { "<chaque clé ci-dessus>": { "score": number, "feedback": "string citant du contenu réel" } },
  "summary": "string : résumé exécutif de l'analyse, 2-3 phrases, avec des données concrètes",
  "highlights": ["3 points forts spécifiques citant la transcription"],
  "weaknesses": ["3 points faibles spécifiques citant la transcription"],
  "recommendations": ["exactement 5 actions TRÈS concrètes et spécifiques, jamais génériques"],
  "improvedVersion": "réécriture complète du discours, même langue, même idée, bien mieux rédigée et structurée, longueur similaire",
  "audienceQuestions": ["entre 5 et 10 questions qu'un professeur/investisseur/recruteur/jury poserait selon le mode, spécifiques au contenu réel"]
}`;
  }

  return `MODE: ${modeLabel}
TITLE: ${request.title}
TOPIC: ${request.topic || "(not specified)"}
TARGET DURATION: ${request.targetDurationMinutes} minutes
ACTUAL DURATION: ${Math.round(request.durationSeconds)} seconds

OBJECTIVE DATA ALREADY COMPUTED (use it, do not recompute):
- Total words: ${stats.wordCount}
- Words per minute: ${stats.wordsPerMinute} (verdict: ${stats.paceVerdict})
- Filler words detected: ${stats.fillerTotal} (${stats.fillerPerMinute}/min). Top: ${stats.fillerTop.map((f) => `"${f.word}"×${f.count}`).join(", ") || "none"}
- Average sentence length: ${Math.round(stats.avgSentenceLength)} words. Longest sentence: ${stats.longestSentenceWords} words.
- Introduction detected: ${stats.hasIntro ? "yes" : "no"}. Conclusion detected: ${stats.hasConclusion ? "yes" : "no"}.
- First sentence: "${stats.firstSentence}"
- Last sentence: "${stats.lastSentence}"

FULL TRANSCRIPT:
"""
${request.transcript}
"""

Score these 13 dimensions (0-100 each), each with feedback quoting REAL content from the transcript: ${metricList}.

Respond with this exact JSON (no markdown, no comments):
{
  "overallScore": number,
  "metrics": { "<each key above>": { "score": number, "feedback": "string quoting real content" } },
  "summary": "string: 2-3 sentence executive summary with concrete data",
  "highlights": ["3 specific strengths quoting the transcript"],
  "weaknesses": ["3 specific weaknesses quoting the transcript"],
  "recommendations": ["exactly 5 very concrete, specific actions, never generic"],
  "improvedVersion": "full rewrite of the speech, same language, same idea, much better written and structured, similar length",
  "audienceQuestions": ["5 to 10 questions a professor/investor/interviewer/panel would ask given the mode, specific to the real content"]
}`;
}

interface OpenAIJsonShape {
  overallScore: number;
  metrics: Record<string, { score: number; feedback: string }>;
  summary: string;
  highlights: string[];
  weaknesses: string[];
  recommendations: string[];
  improvedVersion: string;
  audienceQuestions: string[];
}

function isValidShape(value: unknown): value is OpenAIJsonShape {
  if (!value || typeof value !== "object") return false;
  const v = value as Record<string, unknown>;
  if (typeof v.overallScore !== "number") return false;
  if (!v.metrics || typeof v.metrics !== "object") return false;
  for (const key of METRIC_KEYS) {
    const m = (v.metrics as Record<string, unknown>)[key];
    if (
      !m ||
      typeof (m as { score?: unknown }).score !== "number" ||
      typeof (m as { feedback?: unknown }).feedback !== "string"
    ) {
      return false;
    }
  }
  return (
    typeof v.summary === "string" &&
    Array.isArray(v.highlights) &&
    Array.isArray(v.weaknesses) &&
    Array.isArray(v.recommendations) &&
    typeof v.improvedVersion === "string" &&
    Array.isArray(v.audienceQuestions)
  );
}

export class OpenAIAnalysisProvider implements AnalysisProvider {
  readonly name = "openai";
  private readonly fallback = new HeuristicAnalysisProvider();

  constructor(private readonly apiKey: string) {}

  async analyze(request: AnalysisRequest): Promise<AnalysisResult> {
    try {
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: MODEL,
          response_format: { type: "json_object" },
          temperature: 0.4,
          messages: [
            { role: "system", content: systemPrompt(request.language) },
            { role: "user", content: userPrompt(request) },
          ],
        }),
        signal: AbortSignal.timeout(45_000),
      });

      if (!response.ok) {
        throw new Error(`OpenAI API responded ${response.status}`);
      }

      const payload = await response.json();
      const raw = payload?.choices?.[0]?.message?.content;
      if (typeof raw !== "string") throw new Error("Empty OpenAI response");

      const parsed: unknown = JSON.parse(raw);
      if (!isValidShape(parsed)) {
        throw new Error("OpenAI response did not match the expected schema");
      }

      const stats = analyzeTranscript(
        request.transcript,
        request.language,
        request.durationSeconds,
      );

      const metrics = {} as AnalysisResult["metrics"];
      for (const key of METRIC_KEYS) {
        const m = parsed.metrics[key];
        metrics[key] = {
          score: Math.max(0, Math.min(100, Math.round(m.score))),
          feedback: m.feedback,
        };
      }

      return {
        version: 2,
        provider: "openai",
        language: request.language,
        overallScore: Math.max(0, Math.min(100, Math.round(parsed.overallScore))),
        metrics,
        wordCount: stats.wordCount,
        wordsPerMinute: stats.wordsPerMinute,
        paceVerdict: stats.paceVerdict,
        fillerWords: {
          total: stats.fillerTotal,
          perMinute: stats.fillerPerMinute,
          top: stats.fillerTop,
        },
        structure: {
          hasIntro: stats.hasIntro,
          hasBody: stats.hasBody,
          hasConclusion: stats.hasConclusion,
          commentary: metrics.structure.feedback,
        },
        summary: parsed.summary,
        highlights: parsed.highlights.slice(0, 5),
        weaknesses: parsed.weaknesses.slice(0, 5),
        recommendations: parsed.recommendations.slice(0, 5),
        improvedVersion: parsed.improvedVersion,
        audienceQuestions: parsed.audienceQuestions.slice(0, 10),
        transcript: request.transcript,
      };
    } catch (error) {
      console.error("[openai-provider] falling back to heuristic:", error);
      return this.fallback.analyze(request);
    }
  }
}

// Re-exported so callers can type-check without importing METRIC_KEYS twice.
export type { MetricKey };
