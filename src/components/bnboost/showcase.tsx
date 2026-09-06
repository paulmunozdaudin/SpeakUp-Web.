"use client";

import { motion } from "framer-motion";
import { Play } from "lucide-react";
import { BnboostSection } from "./section";

const phones = [
  { name: "Loft Gran Vía", gradient: "from-[#1a1a1f] via-[#2c2440] to-[#0a0a0a]" },
  { name: "Villa Cala Vista", gradient: "from-[#101820] via-[#1e3a5f] to-[#0a0a0a]" },
  { name: "Chalet Nórdico", gradient: "from-[#1c1c1c] via-[#3a2f27] to-[#0a0a0a]" },
];

export function BnboostShowcase() {
  return (
    <BnboostSection
      id="ejemplos"
      eyebrow="Showcase"
      title="Pensado para vender una experiencia."
      description="Cada vídeo está pensado para vender una experiencia, no solo un espacio."
    >
      <div className="flex flex-wrap items-end justify-center gap-6 sm:gap-8">
        {phones.map((phone, i) => (
          <motion.div
            key={phone.name}
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.7, delay: i * 0.12, ease: [0.16, 1, 0.3, 1] }}
            className={i === 1 ? "w-[220px] sm:w-[250px]" : "w-[190px] sm:w-[210px]"}
          >
            <div className="relative overflow-hidden rounded-[2.2rem] border-[6px] border-neutral-900 bg-neutral-900 shadow-xl shadow-neutral-900/15">
              <div
                className={`relative aspect-[9/19.5] w-full bg-gradient-to-b ${phone.gradient}`}
              >
                <div className="absolute left-1/2 top-2 h-4 w-20 -translate-x-1/2 rounded-full bg-neutral-900" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="flex h-11 w-11 items-center justify-center rounded-full bg-white/10 backdrop-blur-md">
                    <Play className="ml-0.5 h-4 w-4 fill-white text-white" />
                  </span>
                </div>
                <div className="absolute bottom-4 left-4 right-4 text-[11px] font-medium text-white/90">
                  {phone.name}
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </BnboostSection>
  );
}
