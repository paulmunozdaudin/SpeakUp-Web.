import { Flame, Mic, Trophy } from "lucide-react";
import type { UserStats } from "@/types";
import { Card, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { scoreLabel } from "@/utils/score";

export function StatsCards({
  stats,
  loading,
}: {
  stats: UserStats;
  loading?: boolean;
}) {
  if (loading) {
    return (
      <div className="grid gap-4 sm:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <Skeleton key={i} className="h-28" />
        ))}
      </div>
    );
  }

  const cards = [
    {
      icon: Mic,
      title: "Total practices",
      value: stats.totalSessions.toString(),
      hint: stats.totalSessions === 0 ? "Start your first one" : "Keep it up",
    },
    {
      icon: Trophy,
      title: "Average score",
      value: stats.totalSessions === 0 ? "—" : `${stats.averageScore}`,
      hint:
        stats.totalSessions === 0
          ? "No sessions yet"
          : scoreLabel(stats.averageScore),
    },
    {
      icon: Flame,
      title: "Current streak",
      value:
        stats.currentStreakDays === 0
          ? "—"
          : `${stats.currentStreakDays} day${stats.currentStreakDays === 1 ? "" : "s"}`,
      hint:
        stats.currentStreakDays === 0
          ? "Practice today to start one"
          : "Don't break the chain",
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-3">
      {cards.map((card) => (
        <Card key={card.title} className="flex items-start gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-accent-soft text-accent">
            <card.icon className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <CardTitle>{card.title}</CardTitle>
            <p className="mt-1 text-2xl font-semibold tabular-nums tracking-tight">
              {card.value}
            </p>
            <p className="mt-0.5 truncate text-xs text-muted">{card.hint}</p>
          </div>
        </Card>
      ))}
    </div>
  );
}
