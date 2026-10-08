"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, GraduationCap, Presentation, Zap } from "lucide-react";
import { useDict } from "@/lib/i18n";
import { cn } from "@/utils/cn";

/**
 * The section chooser shown right under the hero: daily communication
 * challenges and full presentation practice side by side, as equals — the
 * two ways to get better — with the French oral exams as a smaller strip
 * underneath. Mirrors the picker at the top of /practice.
 */
export function TwoPaths() {
  const d = useDict();

  const paths = [
    {
      href: "/challenges",
      icon: Zap,
      title: d.landing.twoPathsChallenges.title,
      description: d.landing.twoPathsChallenges.description,
      cta: d.landing.twoPathsChallenges.cta,
      highlighted: true,
    },
    {
      href: "/practice?section=presentation",
      icon: Presentation,
      title: d.landing.twoPathsPractice.title,
      description: d.landing.twoPathsPractice.description,
      cta: d.landing.twoPathsPractice.cta,
      highlighted: false,
    },
  ];

  return (
    <section className="py-16 sm:py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5 }}
          className="mx-auto max-w-2xl text-center"
        >
          <h2 className="text-balance text-2xl font-semibold tracking-tight sm:text-3xl">
            {d.landing.twoPathsTitle}
          </h2>
          <p className="mt-3 text-pretty text-muted">{d.landing.twoPathsSubtitle}</p>
        </motion.div>

        <div className="mx-auto mt-10 grid max-w-4xl gap-5 sm:grid-cols-2">
          {paths.map((path, i) => (
            <motion.div
              key={path.href}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
            >
              <Link
                href={path.href}
                className={cn(
                  "group relative flex h-full flex-col rounded-3xl border p-7 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-accent/10",
                  path.highlighted
                    ? "border-accent/50 bg-[linear-gradient(165deg,color-mix(in_srgb,var(--accent)_14%,var(--surface)),var(--surface)_65%)] hover:border-accent"
                    : "border-border bg-surface hover:border-accent/40",
                )}
              >
                {path.highlighted && (
                  <span className="absolute right-6 top-6 rounded-full bg-accent px-2.5 py-1 text-[11px] font-semibold text-white">
                    {d.practice.newBadge}
                  </span>
                )}
                <span
                  className={cn(
                    "flex h-12 w-12 items-center justify-center rounded-2xl transition-colors",
                    path.highlighted
                      ? "bg-[linear-gradient(135deg,var(--accent-hover),var(--accent))] text-white shadow-[0_8px_20px_-6px_var(--accent)]"
                      : "bg-accent-soft text-accent group-hover:bg-accent group-hover:text-white",
                  )}
                >
                  <path.icon className="h-5.5 w-5.5" />
                </span>
                <h3 className="mt-5 text-xl font-semibold tracking-tight">
                  {path.title}
                </h3>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-muted">
                  {path.description}
                </p>
                <span className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-accent">
                  {path.cta}
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </span>
              </Link>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mx-auto mt-5 max-w-4xl"
        >
          <Link
            href="/exam"
            className="group flex items-center gap-4 rounded-2xl border border-border bg-surface px-5 py-4 transition-colors hover:border-accent/40"
          >
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-surface-muted text-muted group-hover:text-foreground">
              <GraduationCap className="h-5 w-5" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-semibold">
                {d.landing.twoPathsExam.title}
              </span>
              <span className="block text-xs text-muted">
                {d.landing.twoPathsExam.description}
              </span>
            </span>
            <span className="hidden shrink-0 items-center gap-1 text-sm font-medium text-accent sm:inline-flex">
              {d.landing.twoPathsExam.cta}
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </span>
            <ArrowRight className="h-4 w-4 shrink-0 text-muted sm:hidden" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
