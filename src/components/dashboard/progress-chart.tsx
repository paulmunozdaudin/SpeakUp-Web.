"use client";

import { TrendingUp } from "lucide-react";
import { Card, CardTitle } from "@/components/ui/card";
import { formatDate } from "@/utils/format";

interface ProgressChartProps {
  trend: { date: string; score: number }[];
}

const WIDTH = 600;
const HEIGHT = 180;
const PADDING = 12;

/**
 * Lightweight SVG line chart of overall scores over time.
 * TODO(charts): swap for a full charting library (e.g. recharts) when we add
 * per-metric trends and tooltips.
 */
export function ProgressChart({ trend }: ProgressChartProps) {
  if (trend.length < 2) {
    return (
      <Card>
        <CardTitle>Progress</CardTitle>
        <div className="mt-6 flex h-40 flex-col items-center justify-center text-center">
          <TrendingUp className="mb-2 h-6 w-6 text-muted/50" />
          <p className="text-sm text-muted">
            Complete at least two practices to see your progress curve.
          </p>
        </div>
      </Card>
    );
  }

  const points = trend.map((point, index) => ({
    x:
      PADDING + (index / (trend.length - 1)) * (WIDTH - PADDING * 2),
    y:
      HEIGHT - PADDING - (point.score / 100) * (HEIGHT - PADDING * 2),
  }));

  const line = points.map((p) => `${p.x},${p.y}`).join(" ");
  const area = `${PADDING},${HEIGHT - PADDING} ${line} ${WIDTH - PADDING},${HEIGHT - PADDING}`;

  const first = trend[0];
  const last = trend[trend.length - 1];
  const delta = last.score - first.score;

  return (
    <Card>
      <div className="flex items-center justify-between">
        <CardTitle>Progress</CardTitle>
        <span
          className={
            delta >= 0 ? "text-sm font-medium text-success" : "text-sm font-medium text-danger"
          }
        >
          {delta >= 0 ? "+" : ""}
          {delta} pts
        </span>
      </div>
      <svg
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        className="mt-4 w-full"
        role="img"
        aria-label="Score progress over time"
      >
        <defs>
          <linearGradient id="chart-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.25" />
            <stop offset="100%" stopColor="var(--accent)" stopOpacity="0" />
          </linearGradient>
        </defs>
        <polygon points={area} fill="url(#chart-fill)" />
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
    </Card>
  );
}
