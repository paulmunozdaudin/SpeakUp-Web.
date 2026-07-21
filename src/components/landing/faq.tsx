"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { Section } from "./section";
import { cn } from "@/utils/cn";

const faqs = [
  {
    question: "How does the AI feedback work?",
    answer:
      "Your recording is transcribed and analyzed by speech AI models that evaluate clarity, pacing, structure, vocabulary, confidence and filler words. You get scores plus concrete, personalized suggestions.",
  },
  {
    question: "Is my audio private?",
    answer:
      "Yes. Your recordings belong to you, are stored securely, and are never used to train models or shared with anyone. You can delete any session at any time.",
  },
  {
    question: "What can I practice?",
    answer:
      "Anything spoken: class presentations, thesis defenses, startup pitches, job interviews, sales calls, conference talks, wedding speeches — pick a mode and start.",
  },
  {
    question: "Do I need special equipment?",
    answer:
      "No. Any laptop or phone microphone works. You can also upload audio files recorded elsewhere.",
  },
  {
    question: "Will there be video analysis?",
    answer:
      "It's on the roadmap. Eye contact and body language analysis are coming — your account will be ready for it the day it ships.",
  },
];

export function Faq() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <Section id="faq" eyebrow="FAQ" title="Frequently asked questions">
      <div className="mx-auto max-w-2xl divide-y divide-border rounded-2xl border border-border bg-surface">
        {faqs.map((faq, index) => {
          const isOpen = open === index;
          return (
            <div key={faq.question}>
              <button
                type="button"
                onClick={() => setOpen(isOpen ? null : index)}
                className="flex w-full cursor-pointer items-center justify-between gap-4 px-6 py-5 text-left"
                aria-expanded={isOpen}
              >
                <span className="text-sm font-medium">{faq.question}</span>
                <ChevronDown
                  className={cn(
                    "h-4 w-4 shrink-0 text-muted transition-transform duration-300",
                    isOpen && "rotate-180",
                  )}
                />
              </button>
              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25, ease: "easeInOut" }}
                    className="overflow-hidden"
                  >
                    <p className="px-6 pb-5 text-sm leading-relaxed text-muted">
                      {faq.answer}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </Section>
  );
}
