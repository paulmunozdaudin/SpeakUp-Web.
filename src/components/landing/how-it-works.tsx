"use client";

import { motion } from "framer-motion";
import { useDict } from "@/lib/i18n";

/** Three big numbered steps on a connecting line (horizontal on desktop,
 *  vertical on mobile) — no cards. */
export function HowItWorks() {
  const d = useDict();

  return (
    <section id="how-it-works" className="scroll-mt-24 py-24 sm:py-32">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5 }}
        >
          <p className="mb-4 text-sm font-semibold uppercase tracking-wider text-accent">
            {d.landing.howEyebrow}
          </p>
          <h2 className="max-w-2xl text-balance text-4xl font-semibold leading-[1.05] tracking-tight sm:text-5xl">
            {d.landing.howTitle}
          </h2>
        </motion.div>

        <ol className="relative mt-16 grid gap-12 md:grid-cols-3 md:gap-10">
          <div
            aria-hidden
            className="absolute bottom-3 left-[11px] top-3 w-px bg-[linear-gradient(to_bottom,var(--accent),transparent)] md:bottom-auto md:left-0 md:right-0 md:top-[11px] md:h-px md:w-auto md:bg-[linear-gradient(to_right,var(--accent),color-mix(in_srgb,var(--accent)_20%,transparent))]"
          />
          {d.landing.howSteps.map((step, index) => (
            <motion.li
              key={step.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.5, delay: index * 0.12 }}
              className="relative pl-12 md:pl-0 md:pt-14"
            >
              <span className="absolute left-0 top-0 flex h-6 w-6 items-center justify-center rounded-full bg-accent ring-8 ring-background">
                <span className="h-2 w-2 rounded-full bg-white" />
              </span>
              <span className="block bg-[linear-gradient(135deg,var(--accent-hover),var(--accent))] bg-clip-text text-7xl font-semibold leading-none tracking-tighter text-transparent sm:text-8xl">
                {String(index + 1).padStart(2, "0")}
              </span>
              <h3 className="mt-5 text-2xl font-semibold tracking-tight">
                {step.title}
              </h3>
              <p className="mt-2 max-w-xs text-[15px] leading-relaxed text-muted">
                {step.description}
              </p>
            </motion.li>
          ))}
        </ol>
      </div>
    </section>
  );
}
