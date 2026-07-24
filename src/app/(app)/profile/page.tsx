"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Award,
  Flame,
  LogIn,
  Lock,
  Mic,
  Sparkles,
  Trophy,
  User as UserIcon,
} from "lucide-react";
import { useUser } from "@/hooks/use-user";
import { useProfile } from "@/hooks/use-profile";
import { useSessions } from "@/hooks/use-sessions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useDict } from "@/lib/i18n";
import { scoreLabelKey } from "@/utils/score";
import { startProCheckout, openBillingPortal } from "@/services/billing.service";

export default function ProfilePage() {
  const d = useDict();
  const { user, loading: userLoading } = useUser();
  const { subscriptionStatus, loading: profileLoading } = useProfile();
  const { stats, loading: sessionsLoading } = useSessions();
  const [billingPending, setBillingPending] = useState(false);
  const [billingError, setBillingError] = useState<string | null>(null);

  const fullName =
    (user?.user_metadata?.full_name as string | undefined) || d.profile.guestName;
  const isPro = subscriptionStatus === "pro";

  async function handleBillingClick() {
    setBillingError(null);
    setBillingPending(true);
    const result = isPro ? await openBillingPortal() : await startProCheckout();
    if (!result.ok) {
      setBillingError(result.error ?? d.billing.checkoutError);
      setBillingPending(false);
    }
  }

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
          ) : user ? (
            fullName.charAt(0).toUpperCase()
          ) : (
            <UserIcon className="h-8 w-8" />
          )}
        </div>
        <div className="min-w-0 flex-1">
          {userLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-6 w-40" />
              <Skeleton className="h-4 w-56" />
            </div>
          ) : user ? (
            <>
              <div className="flex flex-wrap items-center gap-2.5">
                <h2 className="text-xl font-semibold">{fullName}</h2>
                {profileLoading ? (
                  <Skeleton className="h-5 w-16" />
                ) : (
                  <Badge tone={isPro ? "accent" : undefined}>
                    {isPro ? d.profile.proPlan : d.profile.freePlan}
                  </Badge>
                )}
              </div>
              <p className="mt-1 flex items-center gap-1.5 text-sm text-muted">
                {user.email}
              </p>
            </>
          ) : (
            <>
              <div className="flex flex-wrap items-center gap-2.5">
                <h2 className="text-xl font-semibold">{d.profile.guestName}</h2>
                <Badge>{d.profile.guestBadge}</Badge>
              </div>
              <p className="mt-1 max-w-sm text-sm text-muted">
                {d.profile.guestExplainer}
              </p>
            </>
          )}
        </div>
        {!userLoading && !user && (
          <Link href="/login" className="shrink-0">
            <Button variant="secondary">
              <LogIn className="h-4 w-4" />
              {d.common.logIn}
            </Button>
          </Link>
        )}
        {!userLoading && user && !profileLoading && (
          <div className="shrink-0 text-right">
            <Button
              variant={isPro ? "secondary" : "primary"}
              loading={billingPending}
              onClick={handleBillingClick}
            >
              {!billingPending && !isPro && <Sparkles className="h-4 w-4" />}
              {billingPending
                ? d.profile.redirecting
                : isPro
                  ? d.profile.manageSubscription
                  : d.profile.upgradeToPro}
            </Button>
            {billingError && (
              <p className="mt-2 max-w-56 text-xs text-red-500">
                {billingError}
              </p>
            )}
          </div>
        )}
      </Card>

      {/* Stats — these already work for guests via on-device storage. */}
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
