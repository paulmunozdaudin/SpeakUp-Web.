"use client";

import {
  AudioLines,
  BookOpenCheck,
  DoorOpen,
  FlagTriangleRight,
  Gauge,
  LayoutList,
  ListTree,
  Megaphone,
  MessageSquareOff,
  Rows3,
  ShieldCheck,
  Sparkles,
  Waves,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { AnalysisResult, MetricKey } from "@/types";
import { METRIC_KEYS } from "@/types";
import { MetricCard } from "./metric-card";
import { useDict } from "@/lib/i18n";

const METRIC_ICONS: Record<MetricKey, LucideIcon> = {
  clarity: AudioLines,
  confidence: ShieldCheck,
  structure: LayoutList,
  pace: Gauge,
  fluency: Waves,
  fillerUsage: MessageSquareOff,
  sentenceLength: Rows3,
  organization: ListTree,
  persuasion: Megaphone,
  naturalness: Sparkles,
  precision: BookOpenCheck,
  openingStrength: DoorOpen,
  closingQuality: FlagTriangleRight,
};

export function MetricsGrid({ metrics }: { metrics: AnalysisResult["metrics"] }) {
  const d = useDict();

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {METRIC_KEYS.map((key, index) => (
        <MetricCard
          key={key}
          icon={METRIC_ICONS[key]}
          label={d.metrics[key]}
          score={metrics[key].score}
          feedback={metrics[key].feedback}
          delay={index * 0.04}
        />
      ))}
    </div>
  );
}
