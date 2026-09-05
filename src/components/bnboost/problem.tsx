"use client";

import { motion } from "framer-motion";
import { ImageOff, Layers, TrendingDown } from "lucide-react";
import { BnboostSection } from "./section";

const cards = [
  {
    icon: ImageOff,
    text: "Fotos estáticas que no transmiten experiencia.",
  },
  {
    icon: Layers,
    text: "Miles de anuncios compitiendo por la misma atención.",
  },
  {
    icon: TrendingDown,
    text: "Menos confianza = menos reservas.",
  },
];

export function BnboostProblem() {
  return (
    <BnboostSection title="Hoy todos los Airbnb parecen iguales.">
      <div className="grid gap-5 sm:grid-cols-3">
        {cards.map((card, i) => (
          <motion.div
            key={card.text}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.6, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="rounded-3xl border border-neutral-200 bg-white p-8"
          >
            <card.icon className="h-6 w-6 text-neutral-400" strokeWidth={1.5} />
            <p className="mt-6 text-lg leading-snug text-neutral-800">
              {card.text}
            </p>
          </motion.div>
        ))}
      </div>
    </BnboostSection>
  );
}
