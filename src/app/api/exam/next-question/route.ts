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
  /** The student's full opening presentation (exposé) — the jury's
   *  questions are grounded in what they actually said here, not just the
   *  topic string. */
  presentation: string;
  /** Bac de Français only: the actual text/reference being examined on —
   *  questions probe the text and the work, not just the exposé. */
  textContext?: string;
  history: Turn[];
}

/** Keeps the prompt bounded regardless of how long the presentation ran. */
const MAX_PRESENTATION_CHARS = 6000;
const MAX_TEXT_CONTEXT_CHARS = 6000;

function isValidBody(body: unknown): body is NextQuestionBody {
  if (!body || typeof body !== "object") return false;
  const b = body as Record<string, unknown>;
  return (
    typeof b.mode === "string" &&
    (EXAM_MODES as readonly string[]).includes(b.mode) &&
    (b.language === "es" || b.language === "en" || b.language === "fr") &&
    typeof b.topic === "string" &&
    typeof b.presentation === "string" &&
    (b.textContext === undefined || typeof b.textContext === "string") &&
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
    return `Tu es ${role}. L'élève vient de faire son exposé oral devant toi, puis a répondu à tes éventuelles questions précédentes. À chaque tour, tu poses UNE SEULE question, courte et naturelle, qui rebondit précisément sur un point réel de son exposé ou de sa dernière réponse — jamais une question générique qu'on pourrait poser à n'importe qui. Ton but est de vérifier qu'il/elle maîtrise vraiment son sujet et peut le défendre. Tu ne donnes jamais la réponse, tu ne commentes pas, tu ne félicites pas, tu ne dis pas bonjour : juste la question, directement, maximum 2 phrases.`;
  }
  if (language === "es") {
    return `Eres ${role}. El/la estudiante acaba de hacer su exposición oral delante de ti, y ha respondido a tus preguntas anteriores si las hubo. En cada turno, formulas UNA SOLA pregunta, corta y natural, que rebote específicamente sobre algo real de su exposición o de su última respuesta — nunca una pregunta genérica que valdría para cualquiera. Tu objetivo es comprobar que domina de verdad su tema y puede defenderlo. Nunca das la respuesta, no comentas, no felicitas, no saludas: solo la pregunta, directamente, máximo 2 frases.`;
  }
  return `You are ${role}. The student has just given their oral presentation in front of you, and answered any previous questions from you. Each turn, ask exactly ONE short, natural question that builds specifically on something real from their presentation or their last answer — never a generic question that could apply to anyone. Your goal is to check they truly master their topic and can defend it. Never give the answer, never comment, never praise, never greet: just the question, directly, at most 2 sentences.`;
}

function userPrompt(
  topic: string,
  presentation: string,
  textContext: string | undefined,
  history: Turn[],
  language: SpeechLanguage,
): string {
  const truncatedPresentation = presentation.slice(0, MAX_PRESENTATION_CHARS);
  const truncatedText = textContext?.trim().slice(0, MAX_TEXT_CONTEXT_CHARS);
  const exchange = history
    .map((t, i) => `Q${i + 1}: ${t.question}\nR${i + 1}: ${t.answer}`)
    .join("\n\n");

  if (language === "fr") {
    const textBlock = truncatedText ? `TEXTE ÉTUDIÉ :\n"""\n${truncatedText}\n"""\n\n` : "";
    return `SUJET : ${topic || "(non précisé)"}\n\n${textBlock}EXPOSÉ DE L'ÉLÈVE :\n"""\n${truncatedPresentation}\n"""\n\nÉCHANGE DEPUIS L'EXPOSÉ :\n${exchange || "(aucun pour l'instant, c'est ta première question)"}\n\nPose la question suivante (une seule question, sans préambule ni guillemets)${truncatedText ? ", en te basant si possible sur le texte étudié" : ""}.`;
  }
  if (language === "es") {
    const textBlock = truncatedText ? `TEXTO ESTUDIADO:\n"""\n${truncatedText}\n"""\n\n` : "";
    return `TEMA: ${topic || "(no especificado)"}\n\n${textBlock}EXPOSICIÓN DEL ESTUDIANTE:\n"""\n${truncatedPresentation}\n"""\n\nCONVERSACIÓN DESDE LA EXPOSICIÓN:\n${exchange || "(ninguna todavía, es tu primera pregunta)"}\n\nFormula la siguiente pregunta (una sola pregunta, sin preámbulo ni comillas)${truncatedText ? ", basándote si es posible en el texto estudiado" : ""}.`;
  }
  const textBlock = truncatedText ? `STUDIED TEXT:\n"""\n${truncatedText}\n"""\n\n` : "";
  return `TOPIC: ${topic || "(not specified)"}\n\n${textBlock}STUDENT'S PRESENTATION:\n"""\n${truncatedPresentation}\n"""\n\nEXCHANGE SINCE THE PRESENTATION:\n${exchange || "(none yet, this is your first question)"}\n\nAsk the next question (one question only, no preamble or quotation marks)${truncatedText ? ", grounded in the studied text where possible" : ""}.`;
}

async function generateWithOpenAI(
  apiKey: string,
  mode: ExamMode,
  language: SpeechLanguage,
  topic: string,
  presentation: string,
  textContext: string | undefined,
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
          { role: "user", content: userPrompt(topic, presentation, textContext, history, language) },
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

/** Without OpenAI configured we can't tailor a question to the actual
 *  presentation content, so we fall back to the pre-written question bank,
 *  cycling through it turn by turn. */
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
 * Body: { mode, language, topic, presentation, history }. Called once after
 * the student's opening presentation (history: []) to get the jury's first
 * question, then again after each answer for the next one. Grounded in the
 * actual presentation transcript when OpenAI is configured — the same
 * question could never be asked of a different student's exposé — or picked
 * from the mode's question bank otherwise.
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
        (await generateWithOpenAI(
          apiKey,
          body.mode,
          body.language,
          body.topic,
          body.presentation,
          body.textContext,
          body.history,
        ))) ||
      heuristicNextQuestion(body.mode, body.language, body.topic, body.history);

    return NextResponse.json({ question });
  } catch (error) {
    console.error("[api/exam/next-question] failed:", error);
    return NextResponse.json({ error: "Could not generate the next question." }, { status: 500 });
  }
}
