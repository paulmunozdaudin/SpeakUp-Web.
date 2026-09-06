"use client";

import { motion } from "framer-motion";
import { BnboostSection } from "./section";

const metrics = [
  { value: "48h", label: "Entrega media" },
  { value: "9:16", label: "Formato optimizado" },
  { value: "4K", label: "Calidad premium" },
  { value: "∞", label: "Uso ilimitado del contenido" },
];

export function BnboostResults() {
  return (
    <BnboostSection id="resultados" className="bg-neutral-950" title={
      <span className="text-white">Resultados que se notan.</span>
    }>
      <div className="grid grid-cols-2 gap-10 sm:grid-cols-4">
        {metrics.map((metric, i) => (
          <motion.div
            key={metric.label}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.6, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] }}
            className="text-center"
          >
            <p className="text-4xl font-semibold tracking-tight text-white sm:text-5xl">
              {metric.value}
            </p>
            <p className="mt-2 text-sm text-neutral-400">{metric.label}</p>
          </motion.div>
        ))}
      </div>
    </BnboostSection>
  );
}
