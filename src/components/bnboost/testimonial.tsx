"use client";

import { motion } from "framer-motion";
import { BnboostSection } from "./section";

export function BnboostTestimonial() {
  return (
    <BnboostSection id="testimonios" className="bg-neutral-50">
      <motion.figure
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="mx-auto max-w-2xl rounded-3xl border border-neutral-200 bg-white p-10 text-center shadow-sm sm:p-14"
      >
        <blockquote className="text-balance text-2xl font-medium leading-snug tracking-tight text-neutral-900 sm:text-3xl">
          &ldquo;Las fotos mostraban el apartamento. El vídeo vendió la
          experiencia.&rdquo;
        </blockquote>
        <figcaption className="mt-6 text-sm text-neutral-500">
          — Propietario de alojamiento boutique
        </figcaption>
      </motion.figure>
    </BnboostSection>
  );
}
