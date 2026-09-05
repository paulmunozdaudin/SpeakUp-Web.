import { NextResponse } from "next/server";
import type { SpeechLanguage } from "@/types";
import { AUDIENCE_QUESTIONS } from "@/services/ai/question-bank";

export const runtime = "nodejs";

interface Turn {
  question: string;
  answer: string;
}

interface NextQuestionBody {
  language: SpeechLanguage;
  /** The role being interviewed for, e.g. "Frontend Developer". */
  role: string;
  /** Optional company/context the candidate provided. */
  company?: string;
  history: Turn[];
}

const MAX_ROLE_CHARS = 200;
const MAX_COMPANY_CHARS = 200;

function isValidBody(body: unknown): body is NextQuestionBody {
  if (!body || typeof body !== "object") return false;
  const b = body as Record<string, unknown>;
  return (
    (b.language === "es" || b.language === "en" || b.language === "fr") &&
    typeof b.role === "string" &&
    (b.company === undefined || typeof b.company === "string") &&
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

function systemPrompt(language: SpeechLanguage): string {
  if (language === "fr") {
    return `Tu es un(e) responsable du recrutement expérimenté(e), en train de mener un véritable entretien d'embauche. À chaque tour, en te basant sur ce que le/la candidat(e) vient de répondre, tu poses UNE SEULE question naturelle — une relance sur sa dernière réponse, une question comportementale, ou une question liée au poste — comme le ferait un vrai recruteur. Tu ne donnes jamais ton avis, tu ne commentes pas, tu ne félicites pas, tu ne dis pas bonjour : juste la question, directement, maximum 2 phrases.`;
  }
  if (language === "es") {
    return `Eres un(a) responsable de contratación con experiencia, realizando una entrevista de trabajo real. En cada turno, basándote en lo que el/la candidato/a acaba de responder, formulas UNA SOLA pregunta natural — una repregunta sobre su última respuesta, una pregunta de comportamiento, o una pregunta relacionada con el puesto — como haría un reclutador real. Nunca das tu opinión, no comentas, no felicitas, no saludas: solo la pregunta, directamente, máximo 2 frases.`;
  }
  return `You are an experienced hiring manager conducting a real job interview. Each turn, based on what the candidate just answered, ask exactly ONE natural question — a follow-up on their last answer, a behavioral question, or a role-specific question — the way a real interviewer would. Never give your opinion, never comment, never praise, never greet: just the question, directly, at most 2 sentences.`;
}

function userPrompt(role: string, company: string | undefined, history: Turn[], language: SpeechLanguage): string {
  const exchange = history
    .map((t, i) => `Q${i + 1}: ${t.question}\nR${i + 1}: ${t.answer}`)
    .join("\n\n");

  if (language === "fr") {
    return `POSTE : ${role || "(non précisé)"}${company ? `\nENTREPRISE : ${company}` : ""}\n\nENTRETIEN JUSQU'ICI :\n${exchange || "(aucun pour l'instant, c'est ta première question)"}\n\nPose la question suivante (une seule question, sans préambule ni guillemets).`;
  }
  if (language === "es") {
    return `PUESTO: ${role || "(no especificado)"}${company ? `\nEMPRESA: ${company}` : ""}\n\nENTREVISTA HASTA AHORA:\n${exchange || "(ninguna todavía, es tu primera pregunta)"}\n\nFormula la siguiente pregunta (una sola pregunta, sin preámbulo ni comillas).`;
  }
  return `ROLE: ${role || "(not specified)"}${company ? `\nCOMPANY: ${company}` : ""}\n\nINTERVIEW SO FAR:\n${exchange || "(none yet, this is your first question)"}\n\nAsk the next question (one question only, no preamble or quotation marks).`;
}

async function generateWithOpenAI(
  apiKey: string,
  language: SpeechLanguage,
  role: string,
  company: string | undefined,
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
          { role: "system", content: systemPrompt(language) },
          { role: "user", content: userPrompt(role, company, history, language) },
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
    console.error("[api/interview/next-question] OpenAI call failed:", error);
    return null;
  }
}

/** Without OpenAI, questions can't be tailored to the actual conversation,
 *  so we fall back to the generic interview question bank, cycling turn
 *  by turn — same graceful-degradation pattern as the rest of the app. */
function heuristicNextQuestion(language: SpeechLanguage, historyLength: number): string {
  const bank = AUDIENCE_QUESTIONS[language].interview;
  return bank[historyLength % bank.length];
}

/**
 * POST /api/interview/next-question
 * Body: { language, role, company, history }. Returns the interviewer's
 * next question, grounded in the actual conversation when OpenAI is
 * configured, or picked from the question bank otherwise.
 */
export async function POST(request: Request) {
  try {
    const body: unknown = await request.json();
    if (!isValidBody(body)) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    const role = body.role.slice(0, MAX_ROLE_CHARS);
    const company = body.company?.slice(0, MAX_COMPANY_CHARS);
    const apiKey = process.env.OPENAI_API_KEY;
    const question =
      (apiKey && (await generateWithOpenAI(apiKey, body.language, role, company, body.history))) ||
      heuristicNextQuestion(body.language, body.history.length);

    return NextResponse.json({ question });
  } catch (error) {
    console.error("[api/interview/next-question] failed:", error);
    return NextResponse.json({ error: "Could not generate the next question." }, { status: 500 });
  }
}
