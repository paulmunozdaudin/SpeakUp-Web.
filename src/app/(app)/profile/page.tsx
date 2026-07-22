"use client";

import { Award, Flame, Lock, Mail, Mic, Trophy, User as UserIcon } from "lucide-react";
import { useUser } from "@/hooks/use-user";
import { useSessions } from "@/hooks/use-sessions";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { Badge } from "@/components/ui/badge";
import { Card, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useDict } from "@/lib/i18n";
import { scoreLabelKey } from "@/utils/score";

export default function ProfilePage() {
  const d = useDict();
  const { user, loading: userLoading } = useUser();
  const { stats, loading: sessionsLoading } = useSessions();

  const fullName =
    (user?.user_metadata?.full_name as string | undefined) ??
    (isSupabaseConfigured ? "—" : d.profile.demoUser);
  const email =
    user?.email ?? (isSupabaseConfigured ? "—" : "demo@orato.ai");

  const statItems = [
    {
      icon: Mic,
      label: d.profile.totalPractices,
      value: stats.totalSessions.toString(),
    },
    {
      icon: Trophy,
      label: d.profile.averageScore,
      value:
        stats.totalSessions === 0
          ? "—"
          : `${stats.averageScore} · ${d.scoreLabels[scoreLabelKey(stats.averageScore)]}`,
    },
    {
      icon: Flame,
      label: d.profile.currentStreak,
      value:
        stats.currentStreakDays === 0
          ? "—"
          : `${stats.currentStreakDays} ${
              stats.currentStreakDays === 1 ? d.dashboard.day : d.dashboard.days
            }`,
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
          {d.profile.title}
        </h1>
        <p className="mt-1 text-sm text-muted">{d.profile.subtitle}</p>
      </div>

      {/* Identity card */}
      <Card className="flex flex-col gap-6 sm:flex-row sm:items-center sm:p-8">
        <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-accent-soft text-2xl font-semibold text-accent">
          {userLoading ? (
            <UserIcon className="h-8 w-8" />
          ) : (
            fullName.charAt(0).toUpperCase()
          )}
        </div>
        <div className="min-w-0 flex-1">
          {userLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-6 w-40" />
              <Skeleton className="h-4 w-56" />
            </div>
          ) : (
            <>
              <div className="flex flex-wrap items-center gap-2.5">
                <h2 className="text-xl font-semibold">{fullName}</h2>
                {/* TODO(stripe): read real subscription status from Stripe. */}
                <Badge tone="accent">{d.profile.freePlan}</Badge>
              </div>
              <p className="mt-1 flex items-center gap-1.5 text-sm text-muted">
                <Mail className="h-3.5 w-3.5" />
                {email}
              </p>
            </>
          )}
        </div>
      </Card>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        {statItems.map((item) =>
          sessionsLoading ? (
            <Skeleton key={item.label} className="h-24" />
          ) : (
            <Card key={item.label} className="flex items-center gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-accent-soft text-accent">
                <item.icon className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <CardTitle>{item.label}</CardTitle>
                <p className="mt-0.5 truncate text-lg font-semibold">
                  {item.value}
                </p>
              </div>
            </Card>
          ),
        )}
      </div>

      {/* Achievements (coming soon) */}
      {/* TODO(achievements): replace with real, unlockable achievements. */}
      <section>
        <div className="mb-3 flex items-center gap-2">
          <h2 className="text-sm font-medium text-muted">
            {d.profile.achievements}
          </h2>
          <Badge>{d.common.comingSoon}</Badge>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {d.profile.achievementsList.map((achievement) => (
            <Card
              key={achievement.name}
              className="flex flex-col items-center p-5 text-center opacity-60"
            >
              <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-surface-muted text-muted">
                <Award className="h-5 w-5" />
              </div>
              <p className="flex items-center gap-1.5 text-sm font-medium">
                <Lock className="h-3 w-3 text-muted" />
                {achievement.name}
              </p>
              <p className="mt-1 text-xs text-muted">
                {achievement.description}
              </p>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
