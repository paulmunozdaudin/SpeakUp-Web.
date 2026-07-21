"use client";

import { useCallback, useEffect, useState } from "react";
import type { PracticeSession, UserStats } from "@/types";
import {
  computeStats,
  deleteSession,
  listSessions,
} from "@/services/sessions.service";

interface UseSessionsResult {
  sessions: PracticeSession[];
  stats: UserStats;
  loading: boolean;
  error: string | null;
  remove: (id: string) => Promise<void>;
  refresh: () => Promise<void>;
}

/** Loads the user's practice sessions plus derived stats. */
export function useSessions(): UseSessionsResult {
  const [sessions, setSessions] = useState<PracticeSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Promise-chained (no synchronous setState) so it is effect-safe.
  const refresh = useCallback(() => {
    return listSessions()
      .then((data) => {
        setSessions(data);
        setError(null);
      })
      .catch((e: unknown) => {
        setError(e instanceof Error ? e.message : "Failed to load sessions");
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const remove = useCallback(
    async (id: string) => {
      // Optimistic delete with rollback on failure.
      const previous = sessions;
      setSessions((current) => current.filter((s) => s.id !== id));
      try {
        await deleteSession(id);
      } catch (e) {
        setSessions(previous);
        setError(e instanceof Error ? e.message : "Failed to delete session");
      }
    },
    [sessions],
  );

  return {
    sessions,
    stats: computeStats(sessions),
    loading,
    error,
    remove,
    refresh,
  };
}
