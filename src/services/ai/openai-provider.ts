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
    "brevet-oral": "oral du Brevet (soutenance de projet devant un jury de collège)",
    "bac-francais-oral": "oral du Bac de Français (explication linéaire et entretien)",
    "grand-oral": "Grand Oral du Bac (soutenance d'une question devant un jury)",
  },
  es: {
    presentation: "presentación libre",
    "startup-pitch": "pitch de startup ante inversores",
    interview: "entrevista de trabajo",
    "oral-exam": "examen oral académico",
    "project-defense": "defensa de proyecto",
    "brevet-oral": "oral del Brevet francés (defensa de proyecto ante un jurado de secundaria)",
    "bac-francais-oral": "oral del Bac de Francés (explicación de texto y entrevista)",
    "grand-oral": "Grand Oral del Bachillerato francés (defensa de una pregunta ante un jurado)",
  },
  en: {
    presentation: "open presentation",
    "startup-pitch": "startup pitch to investors",
    interview: "job interview",
    "oral-exam": "academic oral exam",
    "project-defense": "project defense",
    "brevet-oral": "French Brevet oral exam (project defense before a middle-school panel)",
    "bac-francais-oral": "French Bac de Français oral exam (text explication and interview)",
    "grand-oral": "French Bac Grand Oral (defending a prepared question before a panel)",
  },
};

function systemPrompt(language: SpeechLanguage): string {
  if (language === "es") {
    return `Eres un coach profesional de comunicación y oratoria con 20 años de experiencia. Analizas transcripciones reales de discursos y das feedback específico, honesto y accionable — nunca genérico. Siempre citas o parafraseas fragmentos reales de la transcripción para justificar tus puntuaciones. Eres exigente: nunca inflas una nota por amabilidad. Cuando la prestación es realmente floja (muletillas frecuentes, sin estructura, discurso inconexo o fuera de tema), pones una nota baja (30-50/100) sin dudarlo — una nota alta debe ganarse. Respondes ÚNICAMENTE con JSON válido que cumpla el esquema indicado, sin texto adicional.`;
  }
  if (language === "fr") {
    return `Vous êtes un coach professionnel en communication et prise de parole en public avec 20 ans d'expérience. Vous analysez de vraies transcriptions de discours et donnez un retour spécifique, honnête et actionnable — jamais générique. Vous citez ou paraphrasez toujours de vrais extraits de la transcription pour justifier vos notes. Vous êtes exigeant : vous ne gonflez jamais une note par gentillesse. Quand la prestation est réellement faible (tics de langage fréquents, absence de structure, discours décousu ou hors-sujet), vous donnez une note basse (30-50/100) sans hésiter — une note élevée doit se mériter. Vous répondez UNIQUEMENT avec du JSON valide respectant le schéma indiqué, sans texte supplémentaire.`;
  }
  return `You are a professional communication and public-speaking coach with 20 years of experience. You analyze real speech transcripts and give specific, honest, actionable feedback — never generic. You always quote or paraphrase real fragments from the transcript to justify your scores. You are demanding: you never inflate a score to be kind. When a performance is genuinely weak (frequent filler words, no structure, rambling or off-topic content), you give a low score (30-50/100) without hesitation — a high score must be earned. You respond ONLY with valid JSON matching the given schema, no extra text.`;
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

BAREMO ESTRICTO para overallScore y para cada métrica — respétalo, no pongas notas intermedias por defecto:
- 90-100: excepcional, prácticamente sin defectos, nivel profesional.
- 75-89: bueno, estructura clara, defectos menores.
- 55-74: mediocre, defectos notables (muletillas frecuentes, estructura floja, ritmo inadecuado) que perjudican claramente el discurso.
- 30-54: flojo, varios problemas serios acumulados (fuera de tema, inconexo, muletillas muy frecuentes, duración muy inadecuada, sin estructura).
- 0-29: muy flojo o inaprovechable (discurso incoherente, totalmente fuera de tema, casi vacío).
No pongas 65-75 por defecto ni por amabilidad: si la prestación acumula varios problemas serios, pon una nota baja (30-54) sin dudarlo. Usa todo el rango.

REQUISITOS ESTRICTOS para "improvedVersion" — el resultado debe ser perfecto y tener sentido de principio a fin:
- Reescritura COMPLETA y autónoma, lista para leerse en voz alta tal cual — nunca un resumen, ni puntos sueltos, ni un texto cortado a mitad de frase.
- Conserva exactamente los mismos argumentos, datos y ejemplos del original — no inventes contenido nuevo ni añadas información que el hablante no dijo.
- Estructura clara y explícita: una apertura que enganche, un desarrollo organizado en 2-4 ideas distintas bien enlazadas entre sí, y un cierre que resuma y remate.
- Frases cortas y directas (máximo ~20-25 palabras de media); ninguna frase debe superar las 35 palabras — divide cualquier frase larga o inconexa del original.
- Elimina todas las muletillas, titubeos y repeticiones de palabras; varía el vocabulario donde el original repite un término.
- Mantén la voz y el tema del hablante — nunca un tono robótico o de manual genérico.
- Longitud similar al original (±20%). Revisa el resultado antes de responder: si no tiene sentido de principio a fin o queda incompleto, corrígelo.

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

BARÈME STRICT pour overallScore et pour chaque métrique — à respecter, ne mettez pas une note intermédiaire par défaut :
- 90-100 : exceptionnel, quasi aucun défaut, niveau professionnel.
- 75-89 : bon, structure claire, défauts mineurs.
- 55-74 : moyen, défauts notables (tics fréquents, structure faible, rythme inadapté) qui nuisent clairement au discours.
- 30-54 : faible, plusieurs problèmes sérieux cumulés (hors-sujet, décousu, tics très fréquents, durée très inadaptée, absence de structure).
- 0-29 : très faible ou inexploitable (discours incohérent, totalement hors-sujet, quasi vide).
Ne mettez PAS 65-75 par défaut ou par gentillesse : si la prestation cumule plusieurs problèmes sérieux, donnez une note basse (30-54) sans hésiter. Utilisez tout le barème.

EXIGENCES STRICTES pour "improvedVersion" — le résultat doit être parfait et avoir du sens de bout en bout :
- Réécriture COMPLÈTE et autonome, prête à être lue à voix haute telle quelle — jamais un résumé, des points isolés, ou un texte coupé en plein milieu d'une phrase.
- Conserve exactement les mêmes arguments, faits et exemples que l'original — n'invente RIEN de nouveau, n'ajoute aucune information que la personne n'a pas dite.
- Structure claire et explicite : une accroche qui capte l'attention, un développement organisé en 2-4 idées distinctes bien enchaînées, une conclusion qui résume et clôt le propos.
- Phrases courtes et directes (20-25 mots en moyenne maximum) ; aucune phrase ne doit dépasser 35 mots — divisez toute phrase longue ou décousue de l'original.
- Éliminez tous les tics de langage, hésitations et répétitions de mots ; variez le vocabulaire là où l'original répète un même terme.
- Gardez la voix et le sujet du locuteur — jamais un ton robotique ou de manuel générique.
- Longueur similaire à l'original (±20 %). Relisez le résultat avant de répondre : s'il n'a pas de sens de bout en bout ou semble incomplet, corrigez-le.

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

STRICT GRADING SCALE for overallScore and every metric — follow it, do not default to a middling score:
- 90-100: exceptional, virtually no flaws, professional level.
- 75-89: good, clear structure, minor flaws.
- 55-74: mediocre, notable flaws (frequent filler words, weak structure, poor pacing) that clearly hurt the speech.
- 30-54: weak, several serious compounding problems (off-topic, rambling, very frequent filler words, duration far off target, no structure).
- 0-29: very weak or unusable (incoherent, completely off-topic, nearly empty).
Do NOT default to 65-75 out of kindness: if the performance stacks up several serious problems, give a low score (30-54) without hesitation. Use the full range.

STRICT REQUIREMENTS for "improvedVersion" — the result must be perfect and make sense from start to finish:
- A COMPLETE, self-contained rewrite, ready to be read aloud as-is — never a summary, bullet points, or text cut off mid-sentence.
- Keep exactly the same arguments, facts and examples as the original — invent NOTHING new, add no information the speaker didn't say.
- Clear, explicit structure: an opening that hooks the listener, a body organized into 2-4 distinct, well-connected ideas, and a closing that summarizes and lands.
- Short, direct sentences (20-25 words on average, max); no sentence should exceed 35 words — split up any long or rambling sentence from the original.
- Remove every filler word, hesitation and repeated word; vary the vocabulary wherever the original repeats a term.
- Keep the speaker's voice and topic — never a robotic or generic textbook tone.
- Similar length to the original (±20%). Reread the result before answering: if it doesn't make sense start to finish or looks incomplete, fix it.

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
          max_tokens: 6000,
          messages: [
            { role: "system", content: systemPrompt(request.language) },
            { role: "user", content: userPrompt(request) },
          ],
        }),
        signal: AbortSignal.timeout(60_000),
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
