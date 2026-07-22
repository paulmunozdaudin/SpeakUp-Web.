"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Mic, Search, SearchX, Trash2 } from "lucide-react";
import type { PracticeMode } from "@/types";
import { useSessions } from "@/hooks/use-sessions";
import { toSummary } from "@/services/sessions.service";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { SessionListItem } from "@/components/dashboard/session-list-item";
import { useDict } from "@/lib/i18n";
import { cn } from "@/utils/cn";

type ModeFilter = PracticeMode | "all";

export default function HistoryPage() {
  const d = useDict();
  const { sessions, loading, error, remove } = useSessions();
  const [query, setQuery] = useState("");
  const [modeFilter, setModeFilter] = useState<ModeFilter>("all");
  const [confirmingId, setConfirmingId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return sessions.filter((session) => {
      if (modeFilter !== "all" && session.mode !== modeFilter) return false;
      if (q && !session.topic.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [sessions, query, modeFilter]);

  const modesInUse = useMemo(
    () => Array.from(new Set(sessions.map((s) => s.mode))),
    [sessions],
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
          {d.history.title}
        </h1>
        <p className="mt-1 text-sm text-muted">{d.history.subtitle}</p>
      </div>

      {/* Search + mode filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          <input
            type="search"
            placeholder={d.history.searchPlaceholder}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            className="h-10 w-full rounded-xl border border-border bg-surface pl-10 pr-3.5 text-sm placeholder:text-muted/60 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
          />
        </div>
        {modesInUse.length > 1 && (
          <div className="flex flex-wrap gap-1.5">
            {(["all", ...modesInUse] as ModeFilter[]).map((mode) => (
              <button
                key={mode}
                type="button"
                onClick={() => setModeFilter(mode)}
                className={cn(
                  "cursor-pointer rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
                  modeFilter === mode
                    ? "bg-accent text-white"
                    : "bg-surface-muted text-muted hover:text-foreground",
                )}
              >
                {mode === "all" ? d.history.all : d.modes[mode]}
              </button>
            ))}
          </div>
        )}
      </div>

      {error && (
        <p className="rounded-xl bg-danger/10 px-4 py-3 text-sm text-danger">
          {error}
        </p>
      )}

      {loading ? (
        <div className="space-y-3">
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-20" />
          ))}
        </div>
      ) : sessions.length === 0 ? (
        <EmptyState
          icon={Mic}
          title={d.history.emptyTitle}
          description={d.history.emptyDescription}
          action={
            <Link href="/practice">
              <Button>{d.common.startPracticing}</Button>
            </Link>
          }
        />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={SearchX}
          title={d.history.noResultsTitle}
          description={d.history.noResultsDescription}
        />
      ) : (
        <div className="space-y-3">
          {filtered.map((session) => (
            <SessionListItem key={session.id} session={toSummary(session)}>
              {confirmingId === session.id ? (
                <span className="flex items-center gap-1.5">
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => {
                      remove(session.id);
                      setConfirmingId(null);
                    }}
                  >
                    {d.common.delete}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setConfirmingId(null)}
                  >
                    {d.common.cancel}
                  </Button>
                </span>
              ) : (
                <button
                  type="button"
                  aria-label={`${d.history.deleteAria} ${session.topic}`}
                  onClick={() => setConfirmingId(session.id)}
                  className="cursor-pointer rounded-lg p-2 text-muted transition-colors hover:bg-danger/10 hover:text-danger"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
            </SessionListItem>
          ))}
        </div>
      )}
    </div>
  );
}
