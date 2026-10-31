"use client";

import { motion } from "framer-motion";
import { BnboostSection } from "./section";

const steps = [
  {
    number: "1",
    title: "Envíanos el enlace",
    text: "Analizamos tu propiedad.",
  },
  {
    number: "2",
    title: "Creamos el vídeo",
    text: "IA + dirección creativa + edición premium.",
  },
  {
    number: "3",
    title: "Publica y reserva más",
    text: "Recibes vídeos listos para Airbnb y redes sociales.",
  },
];

export function BnboostHowItWorks() {
  return (
    <BnboostSection id="como-funciona" eyebrow="Cómo funciona" title="Tres pasos. Cero complicaciones.">
      <div className="relative grid gap-10 sm:grid-cols-3">
        <div
          aria-hidden
          className="absolute left-0 right-0 top-6 hidden h-px bg-neutral-200 sm:block"
        />
        {steps.map((step, i) => (
          <motion.div
            key={step.number}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.6, delay: i * 0.12, ease: [0.16, 1, 0.3, 1] }}
            className="relative text-center sm:text-left"
          >
            <span className="relative z-10 inline-flex h-12 w-12 items-center justify-center rounded-full border border-neutral-200 bg-white text-sm font-semibold text-neutral-900">
              {step.number}
            </span>
            <h3 className="mt-5 text-xl font-semibold tracking-tight text-neutral-900">
              {step.title}
            </h3>
            <p className="mt-2 text-[15px] text-neutral-500">{step.text}</p>
          </motion.div>
        ))}
      </div>
    </BnboostSection>
  );
}
