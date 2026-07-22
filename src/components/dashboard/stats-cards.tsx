"use client";

import { Flame, Mic, Trophy } from "lucide-react";
import type { UserStats } from "@/types";
import { Card, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useDict } from "@/lib/i18n";
import { scoreLabelKey } from "@/utils/score";

export function StatsCards({
  stats,
  loading,
}: {
  stats: UserStats;
  loading?: boolean;
}) {
  const d = useDict();

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
      title: d.dashboard.totalPractices,
      value: stats.totalSessions.toString(),
      hint:
        stats.totalSessions === 0 ? d.dashboard.startFirst : d.dashboard.keepItUp,
    },
    {
      icon: Trophy,
      title: d.dashboard.averageScore,
      value: stats.totalSessions === 0 ? "—" : `${stats.averageScore}`,
      hint:
        stats.totalSessions === 0
          ? d.dashboard.noSessionsYet
          : d.scoreLabels[scoreLabelKey(stats.averageScore)],
    },
    {
      icon: Flame,
      title: d.dashboard.currentStreak,
      value:
        stats.currentStreakDays === 0
          ? "—"
          : `${stats.currentStreakDays} ${
              stats.currentStreakDays === 1 ? d.dashboard.day : d.dashboard.days
            }`,
      hint:
        stats.currentStreakDays === 0
          ? d.dashboard.practiceToday
          : d.dashboard.dontBreakChain,
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
