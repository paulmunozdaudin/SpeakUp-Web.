"use client";

import { motion } from "framer-motion";
import { Clock3, GraduationCap } from "lucide-react";
import { useDict } from "@/lib/i18n";
import { cn } from "@/utils/cn";
import { scoreTone, SCORE_TONE_TEXT } from "@/utils/score";

/** Under 5min total reads as rushed, over 20min as running long — a
 *  reasonable range now that the simulation includes a full presentation
 *  (5-10min) plus the jury's follow-up questions. */
const EXPECTED_MIN_SECONDS = 300;
const EXPECTED_MAX_SECONDS = 1200;

/**
 * Shown at the top of the results page only for the three French exam
 * modes (Brevet, Bac de Français, Grand Oral) — translates the generic
 * 0-100 overall score into the /20 grading students actually think in,
 * plus a quick read on their time management during the simulation.
 */
export function ExamGradeCard({
  overallScore,
  durationSeconds,
  /** Bac de Français: the dedicated literary-rubric grade, preferred over
   *  the generic overallScore/5 conversion when available. */
  grade20,
}: {
  overallScore: number;
  durationSeconds: number;
  grade20?: number;
}) {
  const d = useDict();
  const grade = (grade20 ?? overallScore / 5).toFixed(1);
  const tone = scoreTone(grade20 !== undefined ? grade20 * 5 : overallScore);

  const timeVerdict =
    durationSeconds < EXPECTED_MIN_SECONDS
      ? d.examMode.timeShort
      : durationSeconds > EXPECTED_MAX_SECONDS
        ? d.examMode.timeLong
        : d.examMode.timeGood;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.05 }}
      className="grid gap-4 rounded-3xl border border-border bg-surface p-6 sm:grid-cols-2 sm:p-8"
    >
      <div className="flex items-center gap-4">
        <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-accent-soft text-accent">
          <GraduationCap className="h-6 w-6" />
        </span>
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-muted">
            {d.examMode.gradeLabel}
          </p>
          <p className={cn("text-3xl font-semibold tabular-nums tracking-tight", SCORE_TONE_TEXT[tone])}>
            {grade}
            <span className="text-lg text-muted">{d.examMode.outOf20}</span>
          </p>
        </div>
      </div>
      <div className="flex items-center gap-4 sm:border-l sm:border-border sm:pl-6">
        <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-surface-muted text-muted">
          <Clock3 className="h-6 w-6" />
        </span>
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-muted">
            {d.examMode.timeManagementLabel}
          </p>
          <p className="mt-1 text-sm leading-relaxed">{timeVerdict}</p>
        </div>
      </div>
    </motion.div>
  );
}
