"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, GraduationCap, Mic } from "lucide-react";
import { useDict } from "@/lib/i18n";

/**
 * The two-path chooser shown right under the hero: "Pratiquer" vs.
 * "Préparer un examen". Deliberately just two cards — this is the whole
 * point of the simplified IA, so it must read in one glance, not become
 * another feature grid.
 */
export function TwoPaths() {
  const d = useDict();

  const paths = [
    {
      href: "/practice",
      icon: Mic,
      title: d.landing.twoPathsPractice.title,
      description: d.landing.twoPathsPractice.description,
      cta: d.landing.twoPathsPractice.cta,
    },
    {
      href: "/exam",
      icon: GraduationCap,
      title: d.landing.twoPathsExam.title,
      description: d.landing.twoPathsExam.description,
      cta: d.landing.twoPathsExam.cta,
    },
  ];

  return (
    <section className="py-16 sm:py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <motion.h2
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5 }}
          className="text-balance text-center text-2xl font-semibold tracking-tight sm:text-3xl"
        >
          {d.landing.twoPathsTitle}
        </motion.h2>

        <div className="mx-auto mt-10 grid max-w-3xl gap-5 sm:grid-cols-2">
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
                className="group flex h-full flex-col rounded-3xl border border-border bg-surface p-7 transition-all duration-300 hover:-translate-y-1 hover:border-accent/40 hover:shadow-xl hover:shadow-accent/10"
              >
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-accent-soft text-accent transition-colors group-hover:bg-accent group-hover:text-white">
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
      </div>
    </section>
  );
}
