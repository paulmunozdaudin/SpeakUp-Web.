"use client";

import { motion } from "framer-motion";
import { cn } from "@/utils/cn";
import { scoreTone, SCORE_TONE_STROKE, SCORE_TONE_TEXT } from "@/utils/score";

interface ScoreRingProps {
  score: number; // 0–100
  size?: number; // px
  strokeWidth?: number;
  label?: string;
  className?: string;
}

/** Animated circular score indicator used on results & dashboard. */
export function ScoreRing({
  score,
  size = 120,
  strokeWidth = 8,
  label,
  className,
}: ScoreRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const tone = scoreTone(score);

  return (
    <div
      className={cn("relative inline-flex items-center justify-center", className)}
      style={{ width: size, height: size }}
    >
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={strokeWidth}
          className="stroke-surface-muted"
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{
            strokeDashoffset: circumference * (1 - score / 100),
          }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          className={SCORE_TONE_STROKE[tone]}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span
          className={cn(
            "font-semibold tabular-nums",
            SCORE_TONE_TEXT[tone],
            size >= 100 ? "text-3xl" : "text-lg",
          )}
        >
          {Math.round(score)}
        </span>
        {label && <span className="text-xs text-muted">{label}</span>}
      </div>
    </div>
  );
}
