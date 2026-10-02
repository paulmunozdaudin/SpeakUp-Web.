"use client";

import { Clock3, Sparkles } from "lucide-react";
import type { AnalysisResult } from "@/types";
import { Card, CardTitle } from "@/components/ui/card";
import { useDict } from "@/lib/i18n";
import { formatDuration } from "@/utils/format";

/** Long mid-speech silences — only rendered when `pauses` was actually
 *  measured (see AnalysisResult.pauses doc); never shown as a zeroed-out
 *  placeholder when the browser couldn't monitor audio for real. */
export function PauseCard({
  pauses,
}: {
  pauses: NonNullable<AnalysisResult["pauses"]>;
}) {
  const d = useDict();

  return (
    <Card>
      <CardTitle>{d.results.pausesTitle}</CardTitle>

      {pauses.count === 0 ? (
        <div className="mt-4 flex items-center gap-2.5 text-sm text-success">
          <Sparkles className="h-4 w-4" />
          {d.results.noPauses}
        </div>
      ) : (
        <>
          <div className="mt-3 flex items-baseline gap-4">
            <div>
              <span className="text-3xl font-semibold tabular-nums">
                {pauses.count}
              </span>
              <span className="ml-1.5 text-xs text-muted">
                {d.results.pausesCount}
              </span>
            </div>
            <div>
              <span className="text-3xl font-semibold tabular-nums">
                {pauses.longestSeconds.toFixed(1)}s
              </span>
              <span className="ml-1.5 text-xs text-muted">
                {d.results.pausesLongest}
              </span>
            </div>
          </div>
          <div className="mt-5 space-y-2">
            {pauses.events.map((event) => (
              <div
                key={event.timestampSeconds}
                className="flex items-center justify-between rounded-xl bg-surface-muted px-3.5 py-2.5 text-sm"
              >
                <span className="flex items-center gap-2 text-muted">
                  <Clock3 className="h-3.5 w-3.5" />
                  {formatDuration(event.timestampSeconds)}
                </span>
                <span className="font-medium tabular-nums">
                  {event.durationSeconds.toFixed(1)}s
                </span>
              </div>
            ))}
          </div>
        </>
      )}
    </Card>
  );
}
