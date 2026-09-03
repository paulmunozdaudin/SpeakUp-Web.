"use client";

import Link from "next/link";
import { Award, BookMarked, BookOpen, ArrowRight, GraduationCap } from "lucide-react";
import { Section } from "./section";

const EXAMS = [
  {
    icon: BookOpen,
    name: "ORAL DU BREVET",
    level: "3e",
    description:
      "Un examinateur IA t'interroge sur ton projet comme le ferait le jury : questions, relances, mise en situation réelle.",
    mode: "brevet-oral",
  },
  {
    icon: BookMarked,
    name: "ORAL DU BAC DE FRANÇAIS",
    level: "1ère",
    description:
      "Simule ton explication linéaire et ton entretien, avec un vrai retour sur ta prestation avant le jour J.",
    mode: "bac-francais-oral",
  },
  {
    icon: Award,
    name: "GRAND ORAL",
    level: "Terminale",
    description:
      "Défends ta question devant un jury simulé qui rebondit sur tes réponses : rythme, assurance, argumentation.",
    mode: "grand-oral",
  },
] as const;

/**
 * Marketing vertical for French Bac/Brevet students — always in French,
 * regardless of the site's EN/ES UI toggle, since that's the language this
 * audience searches and reads in. Each card deep-links into the dedicated
 * turn-based "Mode Examinateur IA" flow (/exam), not the generic single-shot
 * /practice recorder.
 */
export function FrenchExams() {
  return (
    <Section
      id="french-exams"
      eyebrow="PRÉPARE TON ORAL 🇫🇷"
      title="Un examinateur IA disponible 24/7"
      description="Eloq AI ne fait pas l'examen à ta place : il t'entraîne pour que tu sois prêt(e) le jour J. Parle, réponds aux relances du jury, et sais exactement quelle note tu obtiendrais — gratuit pour commencer, sans inscription."
    >
      <div className="grid gap-4 md:grid-cols-3">
        {EXAMS.map((exam) => (
          <div
            key={exam.mode}
            className="flex flex-col rounded-2xl border border-border bg-surface p-6"
          >
            <div className="flex items-center justify-between">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent-soft text-accent">
                <exam.icon className="h-5 w-5" />
              </span>
              <span className="rounded-full bg-surface-muted px-2.5 py-1 text-xs font-medium text-muted">
                {exam.level}
              </span>
            </div>
            <h3 className="mt-4 text-sm font-bold tracking-wide">{exam.name}</h3>
            <p className="mt-2 flex-1 text-sm text-muted">{exam.description}</p>
            <span className="mt-4 inline-flex items-center gap-1.5 text-xs font-medium text-accent">
              <GraduationCap className="h-3.5 w-3.5" />
              Mode Examinateur IA
            </span>
            <Link
              href={`/exam?mode=${exam.mode}&lang=fr`}
              className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-accent hover:underline"
            >
              {"S'entraîner maintenant"}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        ))}
      </div>
    </Section>
  );
}
