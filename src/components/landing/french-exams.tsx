"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Award, BookMarked, BookOpen, ArrowRight, GraduationCap } from "lucide-react";

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
 * audience searches and reads in. Given its own larger, distinctly framed
 * treatment (not the generic <Section> shell) because it's the product's
 * current flagship line, not just another feature row. Each card deep-links
 * into the dedicated turn-based "Mode Examinateur IA" flow (/exam), not the
 * generic single-shot /practice recorder.
 */
export function FrenchExams() {
  return (
    <section
      id="french-exams"
      className="relative overflow-hidden border-y border-accent/15 py-24 sm:py-32"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,var(--accent-soft),transparent)]"
      />

      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5 }}
          className="mx-auto max-w-2xl text-center"
        >
          <span className="inline-flex items-center gap-2 rounded-full border border-accent/25 bg-surface px-4 py-1.5 text-sm font-semibold tracking-wide text-accent shadow-sm">
            <GraduationCap className="h-4 w-4" />
            PRÉPARE TON ORAL 🇫🇷
          </span>
          <h2 className="text-balance mt-6 text-4xl font-semibold tracking-tight sm:text-5xl">
            Un examinateur IA disponible 24/7
          </h2>
          <p className="text-pretty mt-5 text-lg leading-relaxed text-muted">
            Eloq AI ne fait pas l&apos;examen à ta place : il t&apos;entraîne pour que tu
            sois prêt(e) le jour J. Parle, réponds aux relances du jury, et sais
            exactement quelle note tu obtiendrais — gratuit pour commencer, sans
            inscription.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5, delay: 0.12 }}
          className="mt-16 grid gap-6 md:grid-cols-3"
        >
          {EXAMS.map((exam) => (
            <div
              key={exam.mode}
              className="group flex flex-col rounded-3xl border border-border bg-surface p-8 shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:border-accent/30 hover:shadow-xl hover:shadow-accent/10"
            >
              <div className="flex items-center justify-between">
                <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-accent-soft text-accent transition-colors group-hover:bg-accent group-hover:text-white">
                  <exam.icon className="h-6 w-6" />
                </span>
                <span className="rounded-full bg-surface-muted px-3 py-1 text-xs font-semibold text-muted">
                  {exam.level}
                </span>
              </div>
              <h3 className="mt-6 text-base font-bold tracking-wide">{exam.name}</h3>
              <p className="mt-3 flex-1 text-sm leading-relaxed text-muted">
                {exam.description}
              </p>
              <span className="mt-5 inline-flex w-fit items-center gap-1.5 rounded-full bg-accent-soft px-3 py-1 text-xs font-semibold text-accent">
                <GraduationCap className="h-3.5 w-3.5" />
                Mode Examinateur IA
              </span>
              <Link
                href={`/exam?mode=${exam.mode}`}
                className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-accent transition-transform group-hover:translate-x-0.5 hover:underline"
              >
                S&apos;entraîner maintenant
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
