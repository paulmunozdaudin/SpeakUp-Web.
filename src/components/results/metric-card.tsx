"use client";

import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/card";
import { scoreTone } from "@/utils/score";
import { cn } from "@/utils/cn";

const TONE_BAR: Record<ReturnType<typeof scoreTone>, string> = {
  success: "bg-success",
  warning: "bg-warning",
  danger: "bg-danger",
};

interface MetricCardProps {
  icon: LucideIcon;
  label: string;
  score: number;
  feedback: string;
  /** Extra line under the label, e.g. "142 words/min". */
  detail?: string;
  delay?: number;
}

/** One analysis dimension: score bar + AI feedback. */
export function MetricCard({
  icon: Icon,
  label,
  score,
  feedback,
  detail,
  delay = 0,
}: MetricCardProps) {
  const tone = scoreTone(score);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
    >
      <Card className="h-full">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-surface-muted text-muted">
              <Icon className="h-4.5 w-4.5" />
            </div>
            <div>
              <h3 className="text-sm font-medium">{label}</h3>
              {detail && <p className="text-xs text-muted">{detail}</p>}
            </div>
          </div>
          <span className="text-xl font-semibold tabular-nums">{score}</span>
        </div>
        <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-surface-muted">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${score}%` }}
            transition={{ duration: 0.8, delay: delay + 0.2, ease: "easeOut" }}
            className={cn("h-full rounded-full", TONE_BAR[tone])}
          />
        </div>
        <p className="mt-3 text-sm leading-relaxed text-muted">{feedback}</p>
      </Card>
    </motion.div>
  );
}
