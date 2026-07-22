import type { PracticeMode, SpeechLanguage } from "@/types";

/**
 * Mode-specific audience questions used by the heuristic provider
 * ({topic} is replaced with the session's topic). The OpenAI provider
 * generates its own tailored questions from the transcript instead.
 */
export const AUDIENCE_QUESTIONS: Record<
  SpeechLanguage,
  Record<PracticeMode, string[]>
> = {
  es: {
    presentation: [
      "¿Cuál es la idea principal que quieres que recordemos sobre {topic}?",
      "¿Qué fuentes respaldan lo que has contado?",
      "¿Cómo afecta {topic} a tu audiencia en el día a día?",
      "¿Qué parte de tu presentación consideras más discutible y por qué?",
      "Si tuvieras solo 30 segundos, ¿cómo resumirías tu mensaje?",
      "¿Qué aprendiste al preparar esta presentación?",
      "¿Qué preguntas esperabas que te hiciéramos?",
    ],
    "startup-pitch": [
      "¿Cuál es el tamaño real de tu mercado y cómo lo has calculado?",
      "¿Qué te diferencia de la competencia que ya existe en {topic}?",
      "¿Cuál es tu modelo de ingresos y tu coste de adquisición de clientes?",
      "¿Qué tracción tenéis hasta hoy: usuarios, ingresos, acuerdos?",
      "¿Por qué tu equipo es el adecuado para ejecutar esto?",
      "¿Cuánto capital buscáis y en qué lo vais a gastar?",
      "¿Cuál es el mayor riesgo del proyecto y cómo lo mitigáis?",
      "¿Qué pasa si un gigante del sector copia vuestra idea?",
    ],
    interview: [
      "¿Por qué quieres trabajar exactamente en este puesto?",
      "Cuéntame un problema difícil que resolviste y cómo lo hiciste.",
      "¿Cuál consideras tu mayor debilidad y qué haces al respecto?",
      "¿Dónde te ves dentro de cinco años?",
      "Describe una situación de conflicto en equipo y cómo la gestionaste.",
      "¿Qué te diferencia del resto de candidaturas?",
      "¿Qué preguntas tienes tú para nosotros?",
    ],
    "oral-exam": [
      "Define los conceptos clave de {topic} con tus propias palabras.",
      "¿Qué autores o teorías fundamentan tu exposición?",
      "Pon un ejemplo práctico que ilustre lo que has explicado.",
      "¿Qué limitaciones tiene el enfoque que has presentado?",
      "¿Cómo se relaciona {topic} con el resto del temario?",
      "Si repitieras la exposición, ¿qué cambiarías?",
      "Explica la parte que consideres más compleja, paso a paso.",
    ],
    "project-defense": [
      "¿Qué problema concreto resuelve tu proyecto y para quién?",
      "Justifica las decisiones metodológicas que tomaste en {topic}.",
      "¿Qué alternativas descartaste y por qué?",
      "¿Cuáles son las principales limitaciones de tus resultados?",
      "¿Cómo validaste que tu solución funciona?",
      "¿Qué harías diferente si empezaras de nuevo?",
      "¿Qué líneas futuras de trabajo propone tu proyecto?",
      "¿Qué aportación original hace tu trabajo frente a lo existente?",
    ],
  },
  en: {
    presentation: [
      "What is the one idea you want us to remember about {topic}?",
      "What sources back up what you presented?",
      "How does {topic} affect your audience day to day?",
      "Which part of your talk is most debatable, and why?",
      "If you had only 30 seconds, how would you summarize your message?",
      "What did you learn while preparing this presentation?",
      "What questions were you expecting from us?",
    ],
    "startup-pitch": [
      "What is your real market size and how did you calculate it?",
      "What differentiates you from existing competitors in {topic}?",
      "What is your revenue model and customer acquisition cost?",
      "What traction do you have today — users, revenue, deals?",
      "Why is your team the right one to execute this?",
      "How much are you raising and what will you spend it on?",
      "What is the biggest risk, and how do you mitigate it?",
      "What happens if an incumbent copies your idea?",
    ],
    interview: [
      "Why do you want this specific role?",
      "Tell me about a hard problem you solved and how.",
      "What is your biggest weakness and what are you doing about it?",
      "Where do you see yourself in five years?",
      "Describe a team conflict and how you handled it.",
      "What sets you apart from other candidates?",
      "What questions do you have for us?",
    ],
    "oral-exam": [
      "Define the key concepts of {topic} in your own words.",
      "Which authors or theories underpin your presentation?",
      "Give a practical example that illustrates what you explained.",
      "What are the limitations of the approach you presented?",
      "How does {topic} relate to the rest of the syllabus?",
      "If you repeated the presentation, what would you change?",
      "Walk me through the most complex part, step by step.",
    ],
    "project-defense": [
      "What concrete problem does your project solve, and for whom?",
      "Justify the methodological choices you made in {topic}.",
      "Which alternatives did you discard, and why?",
      "What are the main limitations of your results?",
      "How did you validate that your solution works?",
      "What would you do differently if you started over?",
      "What future work does your project propose?",
      "What original contribution does your work make?",
    ],
  },
};
