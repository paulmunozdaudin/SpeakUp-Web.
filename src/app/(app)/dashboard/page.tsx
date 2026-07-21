"use client";

import Link from "next/link";
import { ArrowRight, Mic, Sparkles } from "lucide-react";
import { useUser } from "@/hooks/use-user";
import { useSessions } from "@/hooks/use-sessions";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { StatsCards } from "@/components/dashboard/stats-cards";
import { ProgressChart } from "@/components/dashboard/progress-chart";
import { SessionListItem } from "@/components/dashboard/session-list-item";
import { toSummary } from "@/services/sessions.service";

export default function DashboardPage() {
  const { user } = useUser();
  const { sessions, stats, loading } = useSessions();

  const firstName =
    (user?.user_metadata?.full_name as string | undefined)?.split(" ")[0] ??
    "there";
  const recent = sessions.slice(0, 4);

  // Latest session vs. the average of the ones before it → "recent improvement".
  const improvement =
    sessions.length >= 2
      ? sessions[0].analysis.overallScore -
        Math.round(
          sessions
            .slice(1)
            .reduce((sum, s) => sum + s.analysis.overallScore, 0) /
            (sessions.length - 1),
        )
      : null;

  return (
    <div className="space-y-8">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            Welcome back, {firstName}
          </h1>
          <p className="mt-1 text-sm text-muted">
            {stats.totalSessions === 0
              ? "Ready for your first practice?"
              : "Here's how your speaking is evolving."}
          </p>
        </div>
        <Link href="/practice">
          <Button size="lg">
            <Mic className="h-4.5 w-4.5" />
            Start new practice
          </Button>
        </Link>
      </div>

      {improvement !== null && improvement > 0 && (
        <div className="flex items-center gap-3 rounded-2xl border border-success/30 bg-success/10 px-5 py-4 text-sm">
          <Sparkles className="h-5 w-5 shrink-0 text-success" />
          <p>
            <span className="font-semibold text-success">
              +{improvement} points
            </span>{" "}
            — your last practice beat your previous average. Keep going!
          </p>
        </div>
      )}

      <StatsCards stats={stats} loading={loading} />

      <div className="grid gap-4 lg:grid-cols-[1.2fr_1fr]">
        <ProgressChart trend={stats.scoreTrend} />

        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-medium text-muted">Recent sessions</h2>
            {sessions.length > 0 && (
              <Link
                href="/history"
                className="inline-flex items-center gap-1 text-sm text-accent hover:underline"
              >
                View all
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            )}
          </div>
          {loading ? (
            <div className="space-y-3">
              {[0, 1, 2].map((i) => (
                <Skeleton key={i} className="h-20" />
              ))}
            </div>
          ) : recent.length === 0 ? (
            <EmptyState
              icon={Mic}
              title="No sessions yet"
              description="Record your first presentation and get instant AI feedback."
              action={
                <Link href="/practice">
                  <Button>Start practicing</Button>
                </Link>
              }
            />
          ) : (
            <div className="space-y-3">
              {recent.map((session) => (
                <SessionListItem key={session.id} session={toSummary(session)} />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
