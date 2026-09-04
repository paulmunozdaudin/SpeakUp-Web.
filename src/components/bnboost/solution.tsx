"use client";

import { motion } from "framer-motion";
import { Clapperboard, Target, Timer } from "lucide-react";
import { BnboostSection } from "./section";

const columns = [
  {
    icon: Clapperboard,
    title: "Cinematográfico",
    text: "Vídeos que parecen producidos por una agencia de lujo.",
  },
  {
    icon: Target,
    title: "Optimizado para reservar",
    text: "Diseñados para captar atención en Airbnb, Instagram y TikTok.",
  },
  {
    icon: Timer,
    title: "Entrega en 48 horas",
    text: "Sin sesiones de grabación ni complicaciones.",
  },
];

export function BnboostSolution() {
  return (
    <BnboostSection
      className="bg-neutral-50"
      eyebrow="La solución BNBoost"
      title="Hacemos que tu alojamiento destaque."
    >
      <div className="grid gap-10 sm:grid-cols-3">
        {columns.map((col, i) => (
          <motion.div
            key={col.title}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.6, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="text-center sm:text-left"
          >
            <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-neutral-200 bg-white">
              <col.icon className="h-5 w-5 text-blue-600" strokeWidth={1.5} />
            </span>
            <h3 className="mt-5 text-xl font-semibold tracking-tight text-neutral-900">
              {col.title}
            </h3>
            <p className="mt-2.5 text-[15px] leading-relaxed text-neutral-500">
              {col.text}
            </p>
          </motion.div>
        ))}
      </div>
    </BnboostSection>
  );
}
