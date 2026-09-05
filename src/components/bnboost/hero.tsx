"use client";

import { motion } from "framer-motion";
import { Play, Sparkles } from "lucide-react";
import { BnboostButton } from "./button";

const easeOut = [0.16, 1, 0.3, 1] as const;

export function BnboostHero() {
  return (
    <section className="relative overflow-hidden bg-white">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-[560px] bg-[radial-gradient(ellipse_at_top,rgba(37,99,235,0.06),transparent_65%)]"
      />

      <div className="relative mx-auto flex max-w-4xl flex-col items-center px-6 pb-20 pt-28 text-center sm:pt-36">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: easeOut }}
          className="mb-7 inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-white px-4 py-1.5 text-xs font-medium text-neutral-500"
        >
          <Sparkles className="h-3.5 w-3.5 text-blue-600" />
          Vídeos premium para alojamientos que quieren destacar
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.08, ease: easeOut }}
          className="text-balance text-5xl font-semibold leading-[1.05] tracking-tight text-neutral-900 sm:text-6xl md:text-7xl"
        >
          Convierte tu Airbnb en una propiedad irresistible.
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.18, ease: easeOut }}
          className="mt-7 max-w-xl text-pretty text-lg leading-relaxed text-neutral-500"
        >
          Vídeos premium diseñados para aumentar reservas y elevar el valor
          percibido de tu alojamiento.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.28, ease: easeOut }}
          className="mt-10 flex flex-col items-center gap-3 sm:flex-row"
        >
          <a href="#cta">
            <BnboostButton size="lg">Solicitar un vídeo</BnboostButton>
          </a>
          <a href="#ejemplos">
            <BnboostButton size="lg" variant="secondary">
              <Play className="h-4 w-4" />
              Ver ejemplos
            </BnboostButton>
          </a>
        </motion.div>

        {/* Stylised "video" preview — swap for a real muted loop of the property when available */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.4, ease: easeOut }}
          className="relative mt-20 w-full"
        >
          <div className="relative mx-auto aspect-video max-w-3xl overflow-hidden rounded-3xl border border-neutral-200 bg-neutral-950 shadow-2xl shadow-neutral-900/10">
            <motion.div
              aria-hidden
              className="absolute inset-0"
              style={{
                background:
                  "linear-gradient(120deg, #0a0a0a 0%, #1c1c22 35%, #26314f 60%, #0a0a0a 100%)",
                backgroundSize: "220% 220%",
              }}
              animate={{ backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }}
              transition={{ duration: 14, repeat: Infinity, ease: "linear" }}
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="flex h-16 w-16 items-center justify-center rounded-full bg-white/10 backdrop-blur-md">
                <Play className="ml-1 h-6 w-6 fill-white text-white" />
              </span>
            </div>
            <div className="absolute bottom-5 left-5 rounded-full bg-black/40 px-3 py-1 text-xs font-medium text-white backdrop-blur-md">
              Villa Cala Vista · 0:24
            </div>
          </div>

          <div className="mx-auto mt-8 flex max-w-md items-center justify-center gap-4 text-left">
            <span className="text-4xl font-semibold tracking-tight text-neutral-900">
              +3s
            </span>
            <span className="text-sm leading-snug text-neutral-500">
              es el tiempo que necesitas para captar la atención de un
              huésped.
            </span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
