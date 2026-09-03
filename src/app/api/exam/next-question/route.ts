import { NextResponse } from "next/server";
import type { SpeechLanguage } from "@/types";
import { AUDIENCE_QUESTIONS } from "@/services/ai/question-bank";

export const runtime = "nodejs";

const EXAM_MODES = ["brevet-oral", "bac-francais-oral", "grand-oral"] as const;
type ExamMode = (typeof EXAM_MODES)[number];

interface Turn {
  question: string;
  answer: string;
}

interface NextQuestionBody {
  mode: ExamMode;
  language: SpeechLanguage;
  topic: string;
  history: Turn[];
}

function isValidBody(body: unknown): body is NextQuestionBody {
  if (!body || typeof body !== "object") return false;
  const b = body as Record<string, unknown>;
  return (
    typeof b.mode === "string" &&
    (EXAM_MODES as readonly string[]).includes(b.mode) &&
    (b.language === "es" || b.language === "en" || b.language === "fr") &&
    typeof b.topic === "string" &&
    Array.isArray(b.history) &&
    b.history.every(
      (t) =>
        t &&
        typeof t === "object" &&
        typeof (t as Turn).question === "string" &&
        typeof (t as Turn).answer === "string",
    )
  );
}

/** Short description of the examiner's role, used to prime the LLM. */
const EXAMINER_ROLE: Record<SpeechLanguage, Record<ExamMode, string>> = {
  fr: {
    "brevet-oral": "un membre du jury de l'oral du Brevet (soutenance de projet en classe de 3e)",
    "bac-francais-oral": "un examinateur du Bac de Français (explication linéaire et entretien)",
    "grand-oral": "un membre du jury du Grand Oral du Baccalauréat",
  },
  es: {
    "brevet-oral": "un miembro del tribunal del oral del Brevet francés (defensa de proyecto)",
    "bac-francais-oral": "un examinador del Bac de Francés (explicación de texto y entrevista)",
    "grand-oral": "un miembro del tribunal del Grand Oral del Bachillerato francés",
  },
  en: {
    "brevet-oral": "a panel member for the French Brevet oral (middle-school project defense)",
    "bac-francais-oral": "an examiner for the French Bac de Français oral (text explication and interview)",
    "grand-oral": "a panel member for the French Bac Grand Oral",
  },
};

function systemPrompt(language: SpeechLanguage, mode: ExamMode): string {
  const role = EXAMINER_ROLE[language][mode];
  if (language === "fr") {
    return `Tu es ${role}. Tu interroges un(e) élève à l'oral comme le ferait un vrai jury : à partir de ce que l'élève vient de répondre, tu poses UNE SEULE question de relance, courte et naturelle, pour vérifier qu'il/elle maîtrise vraiment son sujet et peut le défendre. Tu ne donnes jamais la réponse, tu ne commentes pas, tu ne félicites pas, tu ne dis pas bonjour : juste la question, directement, maximum 2 phrases.`;
  }
  if (language === "es") {
    return `Eres ${role}. Interrogas a un(a) estudiante en un examen oral como lo haría un tribunal real: a partir de lo que acaba de responder, formulas UNA SOLA pregunta de repregunta, corta y natural, para comprobar que domina de verdad su tema y puede defenderlo. Nunca das la respuesta, no comentas, no felicitas, no saludas: solo la pregunta, directamente, máximo 2 frases.`;
  }
  return `You are ${role}. You are questioning a student in a real oral exam, the way a real panel would: based on what they just answered, ask exactly ONE short, natural follow-up question to check they truly master their topic and can defend it. Never give the answer, never comment, never praise, never greet: just the question, directly, at most 2 sentences.`;
}

function userPrompt(topic: string, history: Turn[], language: SpeechLanguage): string {
  const exchange = history
    .map((t, i) => `Q${i + 1}: ${t.question}\nR${i + 1}: ${t.answer}`)
    .join("\n\n");

  if (language === "fr") {
    return `SUJET : ${topic || "(non précisé)"}\n\nÉCHANGE JUSQU'ICI :\n${exchange}\n\nPose la question de relance suivante (une seule question, sans préambule ni guillemets).`;
  }
  if (language === "es") {
    return `TEMA: ${topic || "(no especificado)"}\n\nCONVERSACIÓN HASTA AHORA:\n${exchange}\n\nFormula la siguiente pregunta de repregunta (una sola pregunta, sin preámbulo ni comillas).`;
  }
  return `TOPIC: ${topic || "(not specified)"}\n\nEXCHANGE SO FAR:\n${exchange}\n\nAsk the next follow-up question (one question only, no preamble or quotation marks).`;
}

async function generateWithOpenAI(
  apiKey: string,
  mode: ExamMode,
  language: SpeechLanguage,
  topic: string,
  history: Turn[],
): Promise<string | null> {
  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        temperature: 0.6,
        messages: [
          { role: "system", content: systemPrompt(language, mode) },
          { role: "user", content: userPrompt(topic, history, language) },
        ],
      }),
      signal: AbortSignal.timeout(20_000),
    });

    if (!response.ok) return null;
    const payload = await response.json();
    const raw = payload?.choices?.[0]?.message?.content;
    if (typeof raw !== "string") return null;

    const question = raw.trim().replace(/^["']|["']$/g, "");
    return question || null;
  } catch (error) {
    console.error("[api/exam/next-question] OpenAI call failed:", error);
    return null;
  }
}

function heuristicNextQuestion(
  mode: ExamMode,
  language: SpeechLanguage,
  topic: string,
  history: Turn[],
): string {
  const bank = AUDIENCE_QUESTIONS[language][mode];
  const question = bank[history.length % bank.length];
  return question.replace("{topic}", topic || "");
}

/**
 * POST /api/exam/next-question
 * Body: { mode, language, topic, history }. Given the exam so far, returns
 * the examiner's next follow-up question — generated live by OpenAI when
 * configured (so it actually probes what the student just said), or picked
 * from the mode's question bank otherwise. The opening question never hits
 * this endpoint — the client picks it straight from the question bank.
 */
export async function POST(request: Request) {
  try {
    const body: unknown = await request.json();
    if (!isValidBody(body)) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    const apiKey = process.env.OPENAI_API_KEY;
    const question =
      (apiKey &&
        (await generateWithOpenAI(apiKey, body.mode, body.language, body.topic, body.history))) ||
      heuristicNextQuestion(body.mode, body.language, body.topic, body.history);

    return NextResponse.json({ question });
  } catch (error) {
    console.error("[api/exam/next-question] failed:", error);
    return NextResponse.json({ error: "Could not generate the next question." }, { status: 500 });
  }
}
