"use client";

import { Camera, Eye, Hand, PersonStanding, Smile } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { VideoAnalysis, VideoMetricKey } from "@/types";
import { VIDEO_METRIC_KEYS } from "@/types";
import { Card, CardTitle } from "@/components/ui/card";
import { MetricCard } from "./metric-card";
import { useDict } from "@/lib/i18n";
import { formatDuration } from "@/utils/format";

const VIDEO_METRIC_ICONS: Record<VideoMetricKey, LucideIcon> = {
  eyeContact: Eye,
  posture: PersonStanding,
  gestures: Hand,
  expressiveness: Smile,
  presence: Camera,
};

/**
 * "Tu presencia" section — only ever rendered when the session was
 * recorded with the camera AND the vision analysis actually succeeded
 * (see openai-provider.ts's analyzeVideoFrames). Reuses the same
 * MetricCard as the voice metrics so it reads as one system, not a
 * bolted-on feature.
 */
export function VideoPresenceGrid({ video }: { video: VideoAnalysis }) {
  const d = useDict();

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {VIDEO_METRIC_KEYS.map((key, index) => (
          <MetricCard
            key={key}
            icon={VIDEO_METRIC_ICONS[key]}
            label={d.videoMetrics[key]}
            score={video.metrics[key].score}
            feedback={video.metrics[key].feedback}
            delay={index * 0.04}
          />
        ))}
      </div>

      {video.observations.length > 0 && (
        <Card>
          <CardTitle>{d.results.videoObservationsTitle}</CardTitle>
          <ul className="mt-4 space-y-3">
            {video.observations.map((obs, i) => {
              const Icon = VIDEO_METRIC_ICONS[obs.category];
              return (
                <li key={i} className="flex items-start gap-3 text-sm leading-relaxed">
                  <span className="mt-0.5 flex shrink-0 items-center rounded-full bg-surface-muted px-2 py-0.5 text-xs font-medium tabular-nums text-muted">
                    {formatDuration(obs.timestampSeconds)}
                  </span>
                  <Icon className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                  <span>{obs.observation}</span>
                </li>
              );
            })}
          </ul>
        </Card>
      )}
    </div>
  );
}
