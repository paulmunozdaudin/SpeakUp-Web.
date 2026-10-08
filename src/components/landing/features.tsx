"use client";

import { motion } from "framer-motion";
import { Brain, Presentation, Trophy, Zap } from "lucide-react";
import { useDict } from "@/lib/i18n";

const ICONS = [Zap, Brain, Trophy, Presentation];

/** Editorial layout — heading on the left, features as a ruled list on the
 *  right. Deliberately no cards: the boxed grid read as generic. */
export function Features() {
  const d = useDict();

  return (
    <section id="features" className="scroll-mt-24 py-24 sm:py-32">
      <div className="mx-auto grid max-w-6xl gap-14 px-4 sm:px-6 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5 }}
        >
          <p className="mb-4 text-sm font-semibold uppercase tracking-wider text-accent">
            {d.landing.featuresEyebrow}
          </p>
          <h2 className="text-balance text-4xl font-semibold leading-[1.05] tracking-tight sm:text-5xl">
            {d.landing.featuresTitle}
          </h2>
          <p className="mt-5 max-w-sm text-pretty text-muted">
            {d.landing.featuresSubtitle}
          </p>
        </motion.div>

        <div className="grid gap-x-12 sm:grid-cols-2">
          {d.landing.features.map((feature, index) => {
            const Icon = ICONS[index];
            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.5, delay: index * 0.08 }}
                className="border-t border-border py-8"
              >
                <Icon className="h-7 w-7 text-accent" strokeWidth={1.75} />
                <h3 className="mt-5 text-xl font-semibold tracking-tight">
                  {feature.title}
                </h3>
                <p className="mt-2 text-[15px] leading-relaxed text-muted">
                  {feature.description}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
