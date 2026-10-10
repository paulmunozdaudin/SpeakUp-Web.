"use client";

import { motion } from "framer-motion";
import { BnboostButton } from "./button";

export function BnboostFinalCta() {
  return (
    <section id="cta" className="bg-white py-24 sm:py-32">
      <div className="mx-auto max-w-3xl px-6 text-center sm:px-8">
        <motion.h2
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="text-balance text-4xl font-semibold tracking-tight text-neutral-900 sm:text-5xl md:text-6xl"
        >
          Haz que tu propiedad sea la primera que recuerden.
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="mx-auto mt-6 max-w-xl text-pretty text-lg text-neutral-500"
        >
          Empieza con un vídeo de muestra y descubre cómo puede cambiar la
          percepción de tu alojamiento.
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.6, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="mt-10"
        >
          <BnboostButton size="lg">Solicitar mi vídeo</BnboostButton>
        </motion.div>
      </div>
    </section>
  );
}
