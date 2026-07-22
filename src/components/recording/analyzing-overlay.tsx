"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { AudioLines } from "lucide-react";
import { useDict } from "@/lib/i18n";

/** Full-screen animated state shown while the AI analyzes a recording. */
export function AnalyzingOverlay() {
  const d = useDict();
  const steps = d.practice.analyzingSteps;
  const [step, setStep] = useState(0);

  useEffect(() => {
    const interval = setInterval(
      () => setStep((s) => Math.min(s + 1, steps.length - 1)),
      1600,
    );
    return () => clearInterval(interval);
  }, [steps.length]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background/95 backdrop-blur-sm"
      role="status"
      aria-live="polite"
    >
      <div className="relative">
        <motion.div
          animate={{ scale: [1, 1.15, 1] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -inset-4 rounded-full bg-accent/15"
        />
        <motion.div
          animate={{ scale: [1, 1.25, 1] }}
          transition={{
            duration: 1.8,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 0.2,
          }}
          className="absolute -inset-8 rounded-full bg-accent/10"
        />
        <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-accent text-white shadow-xl shadow-accent/30">
          <AudioLines className="h-9 w-9" />
        </div>
      </div>

      <h2 className="mt-10 text-xl font-semibold tracking-tight">
        {d.practice.analyzing}
      </h2>
      <motion.p
        key={step}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="mt-2 text-sm text-muted"
      >
        {steps[step]}
      </motion.p>

      {/* Animated equalizer bars */}
      <div className="mt-8 flex items-end gap-1.5" aria-hidden>
        {[0, 1, 2, 3, 4].map((i) => (
          <motion.span
            key={i}
            animate={{ height: [8, 26, 8] }}
            transition={{
              duration: 0.9,
              repeat: Infinity,
              delay: i * 0.12,
              ease: "easeInOut",
            }}
            className="w-1.5 rounded-full bg-accent"
          />
        ))}
      </div>
    </motion.div>
  );
}
