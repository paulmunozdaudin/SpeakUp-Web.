"use client";

import { Award, Flame, Lock, Mail, Mic, Trophy, User as UserIcon } from "lucide-react";
import { useUser } from "@/hooks/use-user";
import { useSessions } from "@/hooks/use-sessions";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { Badge } from "@/components/ui/badge";
import { Card, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { scoreLabel } from "@/utils/score";

/* TODO(achievements): replace with real, unlockable achievements. */
const upcomingAchievements = [
  { name: "First Words", description: "Complete your first practice" },
  { name: "On Fire", description: "Practice 7 days in a row" },
  { name: "Smooth Talker", description: "Score 90+ on clarity" },
  { name: "Marathon Speaker", description: "Complete 50 practices" },
];

export default function ProfilePage() {
  const { user, loading: userLoading } = useUser();
  const { stats, loading: sessionsLoading } = useSessions();

  const fullName =
    (user?.user_metadata?.full_name as string | undefined) ??
    (isSupabaseConfigured ? "—" : "Demo user");
  const email = user?.email ?? (isSupabaseConfigured ? "—" : "demo@speakup.app");

  const statItems = [
    {
      icon: Mic,
      label: "Total practices",
      value: stats.totalSessions.toString(),
    },
    {
      icon: Trophy,
      label: "Average score",
      value:
        stats.totalSessions === 0
          ? "—"
          : `${stats.averageScore} · ${scoreLabel(stats.averageScore)}`,
    },
    {
      icon: Flame,
      label: "Current streak",
      value:
        stats.currentStreakDays === 0
          ? "—"
          : `${stats.currentStreakDays} day${stats.currentStreakDays === 1 ? "" : "s"}`,
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
          Profile
        </h1>
        <p className="mt-1 text-sm text-muted">
          Your account and speaking journey at a glance.
        </p>
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
                <Badge tone="accent">Free plan</Badge>
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
      <section>
        <div className="mb-3 flex items-center gap-2">
          <h2 className="text-sm font-medium text-muted">Achievements</h2>
          <Badge>Coming soon</Badge>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {upcomingAchievements.map((achievement) => (
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
