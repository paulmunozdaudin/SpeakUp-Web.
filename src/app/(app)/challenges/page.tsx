"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Check,
  Crown,
  Flame,
  Lock,
  Sparkles,
  Star,
  Target,
  Trophy,
  Zap,
} from "lucide-react";
import { CHALLENGE_TYPES } from "@/types";
import { useSessions } from "@/hooks/use-sessions";
import { useDict } from "@/lib/i18n";
import {
  computeChallengeProgress,
  dailyChallenge,
  DAILY_BONUS_XP,
  fill,
  LEVEL_THRESHOLDS,
} from "@/lib/challenges";
import { CHALLENGE_ICONS } from "@/components/challenges/challenge-icons";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ProgressChart } from "@/components/dashboard/progress-chart";
import { SessionListItem } from "@/components/dashboard/session-list-item";
import { toSummary } from "@/services/sessions.service";
import { cn } from "@/utils/cn";

export default function ChallengesPage() {
  const d = useDict();
  const c = d.challenges;
  const { sessions, loading } = useSessions();
  const progress = computeChallengeProgress(sessions);
  const daily = dailyChallenge();
  const DailyIcon = CHALLENGE_ICONS[daily.type];
  const levelName = c.levels[progress.level.index];
  const nextLevelName =
    progress.level.next === null ? null : c.levels[progress.level.index + 1];
  const LevelIcon = progress.level.isMax ? Crown : Trophy;

  const stats = [
    { icon: Target, label: c.statCompleted, value: progress.completed },
    {
      icon: Star,
      label: c.statAverage,
      value: progress.completed ? progress.averageScore : "—",
    },
    {
      icon: Sparkles,
      label: c.statBest,
      value: progress.completed ? progress.bestScore : "—",
    },
    {
      icon: Flame,
      label: c.statStreak,
      value: progress.streakDays
        ? `${progress.streakDays} ${progress.streakDays === 1 ? d.dashboard.day : d.dashboard.days}`
        : "—",
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3.5 py-1.5 text-xs font-medium text-muted">
          <Zap className="h-3.5 w-3.5 text-accent" />
          {c.eyebrow}
        </span>
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          {c.title}
        </h1>
        <p className="mt-2 max-w-2xl text-[15px] text-muted">{c.subtitle}</p>
      </div>

      {/* Level */}
      {loading ? (
        <Skeleton className="h-44" />
      ) : (
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
          className="relative overflow-hidden rounded-3xl border border-border bg-surface p-6 sm:p-8"
        >
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_10%_0%,var(--accent-soft),transparent_60%)]"
          />
          <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center">
            <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-3xl bg-[linear-gradient(135deg,var(--accent-hover),var(--accent))] text-white shadow-[0_16px_36px_-12px_var(--accent)]">
              <LevelIcon className="h-9 w-9" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted">
                {c.level} {progress.level.index + 1}
              </p>
              <h2 className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">
                {levelName}
              </h2>
              <div className="mt-4 flex items-center justify-between text-sm">
                <span className="font-semibold tabular-nums">
                  {progress.xp} XP
                </span>
                {progress.level.next !== null && nextLevelName && (
                  <span className="text-muted">
                    {fill(c.xpToNext, {
                      xp: progress.level.next - progress.xp,
                      level: nextLevelName,
                    })}
                  </span>
                )}
              </div>
              <div className="mt-2 h-3 overflow-hidden rounded-full bg-surface-muted">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.round(progress.level.progress * 100)}%` }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                  className="h-full rounded-full bg-[linear-gradient(90deg,var(--accent-hover),var(--accent))]"
                />
              </div>
              <p className="mt-3 text-xs text-muted">
                {progress.level.isMax
                  ? c.maxLevel
                  : fill(c.xpRule, { bonus: DAILY_BONUS_XP })}
              </p>
            </div>
          </div>
        </motion.section>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {stats.map((stat) =>
          loading ? (
            <Skeleton key={stat.label} className="h-24" />
          ) : (
            <div
              key={stat.label}
              className="rounded-2xl border border-border bg-surface p-4"
            >
              <stat.icon className="h-4.5 w-4.5 text-accent" />
              <p className="mt-2 text-xl font-semibold tabular-nums tracking-tight">
                {stat.value}
              </p>
              <p className="text-xs text-muted">{stat.label}</p>
            </div>
          ),
        )}
      </div>

      {/* Daily challenge */}
      <section className="relative overflow-hidden rounded-3xl border border-accent/50 bg-[linear-gradient(165deg,color-mix(in_srgb,var(--accent)_14%,transparent),transparent_65%)] p-6 sm:p-7">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-wide text-accent">
            {c.dailyTitle}
          </span>
          {!loading &&
            (progress.dailyDone ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-success/10 px-2.5 py-0.5 text-xs font-medium text-success">
                <Check className="h-3 w-3" />
                {c.dailyDone}
              </span>
            ) : (
              <span className="rounded-full bg-accent px-2.5 py-0.5 text-xs font-semibold text-white">
                {fill(c.dailyBonus, { bonus: DAILY_BONUS_XP })}
              </span>
            ))}
        </div>
        <div className="mt-4 flex flex-col gap-5 sm:flex-row sm:items-center">
          <div className="flex min-w-0 flex-1 items-start gap-4">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,var(--accent-hover),var(--accent))] text-white shadow-[0_8px_20px_-6px_var(--accent)]">
              <DailyIcon className="h-6 w-6" />
            </span>
            <div className="min-w-0">
              <h2 className="text-lg font-semibold tracking-tight">
                {c.types[daily.type].name}
              </h2>
              <p className="mt-1 text-sm leading-relaxed text-muted">
                {c.types[daily.type].description}
              </p>
            </div>
          </div>
          <Link
            href={`/challenges/play?type=${daily.type}${progress.dailyDone ? "" : "&daily=1"}`}
            className="shrink-0"
          >
            <Button size="lg" className="w-full sm:w-auto">
              {c.dailyCta}
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>

      {/* All challenge types */}
      <section>
        <h2 className="mb-3 text-sm font-medium text-muted">{c.chooseTitle}</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {CHALLENGE_TYPES.map((type) => {
            const Icon = CHALLENGE_ICONS[type];
            return (
              <Link
                key={type}
                href={`/challenges/play?type=${type}`}
                className="group flex flex-col rounded-2xl border border-border bg-surface p-5 transition-all duration-200 hover:-translate-y-0.5 hover:border-accent/40 hover:shadow-sm"
              >
                <span className="mb-3.5 flex h-11 w-11 items-center justify-center rounded-2xl bg-surface-muted text-muted transition-colors group-hover:bg-accent-soft group-hover:text-accent">
                  <Icon className="h-5.5 w-5.5" />
                </span>
                <span className="text-[15px] font-semibold leading-tight">
                  {c.types[type].name}
                </span>
                <span className="mt-1 flex-1 text-xs leading-relaxed text-muted">
                  {c.types[type].description}
                </span>
                <span className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-accent">
                  <Sparkles className="h-3 w-3" />
                  {c.surprise}
                </span>
              </Link>
            );
          })}
        </div>
      </section>

      <div className="grid gap-4 lg:grid-cols-[1fr_1.2fr]">
        {/* Path to mastery */}
        <section className="self-start rounded-2xl border border-border bg-surface p-6">
          <h2 className="text-sm font-medium text-muted">{c.pathTitle}</h2>
          <ol className="mt-4 space-y-1">
            {c.levels.map((name, index) => {
              const reached = progress.xp >= LEVEL_THRESHOLDS[index];
              const current = !loading && index === progress.level.index;
              return (
                <li
                  key={name}
                  className={cn(
                    "flex items-center gap-3 rounded-xl px-3 py-2.5",
                    current && "bg-accent-soft",
                  )}
                >
                  <span
                    className={cn(
                      "flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold",
                      reached
                        ? "bg-accent text-white"
                        : "bg-surface-muted text-muted",
                    )}
                  >
                    {reached ? (
                      index === LEVEL_THRESHOLDS.length - 1 ? (
                        <Crown className="h-3.5 w-3.5" />
                      ) : (
                        <Check className="h-3.5 w-3.5" />
                      )
                    ) : (
                      <Lock className="h-3 w-3" />
                    )}
                  </span>
                  <span
                    className={cn(
                      "flex-1 text-sm",
                      current ? "font-semibold text-accent" : reached ? "font-medium" : "text-muted",
                    )}
                  >
                    {name}
                  </span>
                  <span className="text-xs tabular-nums text-muted">
                    {LEVEL_THRESHOLDS[index]} XP
                  </span>
                </li>
              );
            })}
          </ol>
        </section>

        <div className="space-y-4">
          <ProgressChart trend={progress.scoreTrend} title={c.progressTitle} />
          <section>
            <h2 className="mb-3 text-sm font-medium text-muted">{c.recentTitle}</h2>
            {loading ? (
              <div className="space-y-3">
                {[0, 1].map((i) => (
                  <Skeleton key={i} className="h-20" />
                ))}
              </div>
            ) : progress.sessions.length === 0 ? (
              <p className="rounded-2xl border border-dashed border-border px-5 py-8 text-center text-sm text-muted">
                {c.recentEmpty}
              </p>
            ) : (
              <div className="space-y-3">
                {progress.sessions.slice(0, 5).map((session) => (
                  <SessionListItem key={session.id} session={toSummary(session)} />
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
