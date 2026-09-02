"use client";

import Link from "next/link";
import { Award, BookMarked, BookOpen, ArrowRight } from "lucide-react";
import { Section } from "./section";

const EXAMS = [
  {
    icon: BookOpen,
    name: "L'oral du Brevet",
    description:
      "Entraîne-toi à présenter ton projet devant le jury : structure, clarté, réponses aux questions.",
    mode: "brevet-oral",
  },
  {
    icon: BookMarked,
    name: "L'oral du Bac de Français",
    description:
      "Travaille ton explication linéaire et ton entretien avant le jour J, avec un vrai retour sur ta prestation.",
    mode: "bac-francais-oral",
  },
  {
    icon: Award,
    name: "Le Grand Oral",
    description:
      "Répète la défense de ta question devant un jury simulé : rythme, assurance, structure de l'argumentation.",
    mode: "grand-oral",
  },
] as const;

/**
 * Marketing section for French Bac/Brevet students — always in French,
 * regardless of the site's EN/ES UI toggle, since that's the language
 * this audience searches and reads in. Each card deep-links straight into
 * /practice with the matching exam mode and French pre-selected.
 */
export function FrenchExams() {
  return (
    <Section
      id="french-exams"
      eyebrow="Spécial Bac & Brevet"
      title="Tu prépares un oral important ?"
      description="Eloq AI propose un entraînement dédié à l'oral du Brevet, à l'oral du Bac de Français et au Grand Oral — gratuit pour commencer, sans inscription."
    >
      <div className="grid gap-4 md:grid-cols-3">
        {EXAMS.map((exam) => (
          <div
            key={exam.mode}
            className="flex flex-col rounded-2xl border border-border bg-surface p-6"
          >
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent-soft text-accent">
              <exam.icon className="h-5 w-5" />
            </span>
            <h3 className="mt-4 font-semibold">{exam.name}</h3>
            <p className="mt-2 flex-1 text-sm text-muted">
              {exam.description}
            </p>
            <Link
              href={`/practice?mode=${exam.mode}&lang=fr`}
              className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-accent hover:underline"
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
