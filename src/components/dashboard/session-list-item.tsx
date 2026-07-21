import Link from "next/link";
import { ChevronRight, Clock } from "lucide-react";
import type { PracticeSessionSummary } from "@/types";
import { Badge } from "@/components/ui/badge";
import { PRACTICE_MODE_LABELS } from "@/types";
import { formatDate, formatDuration } from "@/utils/format";
import { scoreTone, SCORE_TONE_TEXT } from "@/utils/score";
import { cn } from "@/utils/cn";

/** Compact row used by dashboard "recent" list and the history page. */
export function SessionListItem({
  session,
  children,
}: {
  session: PracticeSessionSummary;
  children?: React.ReactNode; // extra actions (e.g. delete button in history)
}) {
  return (
    <div className="group flex items-center gap-4 rounded-2xl border border-border bg-surface p-4 transition-all hover:border-accent/40 hover:shadow-sm">
      <div
        className={cn(
          "flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-surface-muted text-lg font-semibold tabular-nums",
          SCORE_TONE_TEXT[scoreTone(session.overallScore)],
        )}
      >
        {session.overallScore}
      </div>
      <Link
        href={`/results/${session.id}`}
        className="min-w-0 flex-1"
      >
        <p className="truncate text-sm font-medium">{session.topic}</p>
        <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted">
          <Badge tone="accent">{PRACTICE_MODE_LABELS[session.mode]}</Badge>
          <span>{formatDate(session.createdAt)}</span>
          <span className="inline-flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {formatDuration(session.durationSeconds)}
          </span>
        </div>
      </Link>
      {children}
      <Link
        href={`/results/${session.id}`}
        aria-label="Open report"
        className="text-muted transition-transform group-hover:translate-x-0.5 group-hover:text-foreground"
      >
        <ChevronRight className="h-5 w-5" />
      </Link>
    </div>
  );
}
