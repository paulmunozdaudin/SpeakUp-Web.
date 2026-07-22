"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { Section } from "./section";
import { useDict } from "@/lib/i18n";
import { cn } from "@/utils/cn";

export function Faq() {
  const d = useDict();
  const [open, setOpen] = useState<number | null>(0);

  return (
    <Section id="faq" eyebrow={d.landing.faqEyebrow} title={d.landing.faqTitle}>
      <div className="mx-auto max-w-2xl divide-y divide-border rounded-2xl border border-border bg-surface">
        {d.landing.faqs.map((faq, index) => {
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
