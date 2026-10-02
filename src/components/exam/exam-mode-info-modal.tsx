"use client";

import { motion } from "framer-motion";
import { CheckCircle2, X, type LucideIcon } from "lucide-react";
import type { Dictionary } from "@/lib/i18n/translations";

type ExamInfoMode = "brevet-oral" | "bac-francais-oral" | "grand-oral";

/** Explains, in plain terms, what each of the three French oral exam
 *  simulations involves and how Eloq evaluates it — triggered by the info
 *  button on each mode card in the /exam setup step. */
export function ExamModeInfoModal({
  mode,
  icon: Icon,
  dict,
  onClose,
}: {
  mode: ExamInfoMode;
  icon: LucideIcon;
  dict: Dictionary;
  onClose: () => void;
}) {
  const info = dict.examMode.modeInfo.modes[mode];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, y: 12, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
        onClick={(event) => event.stopPropagation()}
        className="relative w-full max-w-md rounded-3xl border border-border bg-surface p-6 shadow-2xl"
      >
        <button
          type="button"
          onClick={onClose}
          aria-label={dict.examMode.modeInfo.modalCloseLabel}
          className="absolute right-4 top-4 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full text-muted transition-colors hover:bg-surface-muted hover:text-foreground"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="flex items-center gap-3 pr-8">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,var(--accent-hover),var(--accent))] text-white shadow-[0_8px_20px_-6px_var(--accent)]">
            <Icon className="h-5 w-5" />
          </span>
          <div>
            <h3 className="text-lg font-semibold tracking-tight">{dict.modes[mode]}</h3>
            <p className="mt-0.5 text-sm text-muted">{info.tagline}</p>
          </div>
        </div>

        <div className="mt-6">
          <h4 className="text-xs font-semibold uppercase tracking-wide text-muted">
            {dict.examMode.modeInfo.howItWorksLabel}
          </h4>
          <ol className="mt-3 space-y-2.5">
            {info.steps.map((step, i) => (
              <li key={step} className="flex items-start gap-3 text-sm leading-relaxed">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-accent-soft text-[11px] font-semibold text-accent">
                  {i + 1}
                </span>
                {step}
              </li>
            ))}
          </ol>
        </div>

        <div className="mt-6">
          <h4 className="text-xs font-semibold uppercase tracking-wide text-muted">
            {dict.examMode.modeInfo.whatWeCheckLabel}
          </h4>
          <ul className="mt-3 space-y-2">
            {info.analyzes.map((item) => (
              <li key={item} className="flex items-start gap-2.5 text-sm text-muted">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </motion.div>
    </motion.div>
  );
}
