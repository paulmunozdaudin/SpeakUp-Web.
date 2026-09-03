"use client";

import { useDict } from "@/lib/i18n";
import { formatDate } from "@/utils/format";

const WIDTH = 600;
const HEIGHT = 160;
const PADDING = 12;

/** Same line-chart shape as the dashboard's ProgressChart, but scaled to
 *  the /20 grading students preparing for a French oral actually think in
 *  (11.5 → 14.2 → 16, not 58 → 71 → 80). */
export function ExamEvolutionChart({
  sessions,
}: {
  /** Oldest first. */
  sessions: { createdAt: string; analysis: { overallScore: number } }[];
}) {
  const d = useDict();

  if (sessions.length < 2) {
    return <p className="text-sm text-muted">{d.examMode.needMoreSessions}</p>;
  }

  const grades = sessions.map((s) => ({
    date: s.createdAt,
    grade: s.analysis.overallScore / 5,
  }));

  const points = grades.map((g, index) => ({
    x: PADDING + (index / (grades.length - 1)) * (WIDTH - PADDING * 2),
    y: HEIGHT - PADDING - (g.grade / 20) * (HEIGHT - PADDING * 2),
  }));

  const line = points.map((p) => `${p.x},${p.y}`).join(" ");
  const area = `${PADDING},${HEIGHT - PADDING} ${line} ${WIDTH - PADDING},${HEIGHT - PADDING}`;

  const first = grades[0];
  const last = grades[grades.length - 1];
  const delta = Math.round((last.grade - first.grade) * 10) / 10;

  return (
    <div>
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted">
          {first.grade.toFixed(1)}
          {d.examMode.outOf20} → {last.grade.toFixed(1)}
          {d.examMode.outOf20}
        </span>
        <span
          className={
            delta >= 0 ? "text-sm font-medium text-success" : "text-sm font-medium text-danger"
          }
        >
          {delta >= 0 ? "+" : ""}
          {delta}
        </span>
      </div>
      <svg
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        className="mt-3 w-full"
        role="img"
        aria-label={d.examMode.progressPageTitle}
      >
        <defs>
          <linearGradient id="exam-chart-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.25" />
            <stop offset="100%" stopColor="var(--accent)" stopOpacity="0" />
          </linearGradient>
        </defs>
        <polygon points={area} fill="url(#exam-chart-fill)" />
        <polyline
          points={line}
          fill="none"
          stroke="var(--accent)"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {points.map((p, i) => (
          <circle
            key={i}
            cx={p.x}
            cy={p.y}
            r="3.5"
            fill="var(--surface)"
            stroke="var(--accent)"
            strokeWidth="2"
          />
        ))}
      </svg>
      <div className="mt-2 flex justify-between text-xs text-muted">
        <span>{formatDate(first.date)}</span>
        <span>{formatDate(last.date)}</span>
      </div>
    </div>
  );
}
