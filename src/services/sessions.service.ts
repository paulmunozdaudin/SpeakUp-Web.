"use client";

/**
 * Sessions service: the single data-access layer for practice sessions.
 *
 * Storage strategy:
 *  - Supabase (table `practice_sessions`, RLS-protected) when configured.
 *  - localStorage fallback ("demo mode") so the product works end-to-end
 *    before any backend is provisioned.
 *
 * All pages/hooks consume THIS module — never Supabase directly — so the
 * storage backend can evolve without touching UI code.
 */

import type {
  AnalysisResult,
  PracticeMode,
  PracticeSession,
  PracticeSessionSummary,
  UserStats,
} from "@/types";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

const LOCAL_KEY = "speakup-sessions";
const DEMO_USER_ID = "demo-user";

export interface CreateSessionInput {
  topic: string;
  mode: PracticeMode;
  durationSeconds: number;
  analysis: AnalysisResult;
}

/* ── localStorage backend (demo mode) ────────────────────────────────── */

function readLocal(): PracticeSession[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(LOCAL_KEY) ?? "[]");
  } catch {
    return [];
  }
}

function writeLocal(sessions: PracticeSession[]) {
  localStorage.setItem(LOCAL_KEY, JSON.stringify(sessions));
}

/* ── Supabase backend ────────────────────────────────────────────────── */

interface SessionRow {
  id: string;
  user_id: string;
  topic: string;
  mode: PracticeMode;
  duration_seconds: number;
  created_at: string;
  analysis: AnalysisResult;
}

function rowToSession(row: SessionRow): PracticeSession {
  return {
    id: row.id,
    userId: row.user_id,
    topic: row.topic,
    mode: row.mode,
    durationSeconds: row.duration_seconds,
    createdAt: row.created_at,
    analysis: row.analysis,
  };
}

/* ── Public API ──────────────────────────────────────────────────────── */

export async function listSessions(): Promise<PracticeSession[]> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) {
    return readLocal().sort(
      (a, b) => +new Date(b.createdAt) - +new Date(a.createdAt),
    );
  }

  const { data, error } = await supabase
    .from("practice_sessions")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return (data as SessionRow[]).map(rowToSession);
}

export async function getSession(id: string): Promise<PracticeSession | null> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) {
    return readLocal().find((s) => s.id === id) ?? null;
  }

  const { data, error } = await supabase
    .from("practice_sessions")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data ? rowToSession(data as SessionRow) : null;
}

export async function createSession(
  input: CreateSessionInput,
): Promise<PracticeSession> {
  const supabase = getSupabaseBrowserClient();

  if (!supabase) {
    const session: PracticeSession = {
      id: crypto.randomUUID(),
      userId: DEMO_USER_ID,
      createdAt: new Date().toISOString(),
      ...input,
    };
    writeLocal([session, ...readLocal()]);
    return session;
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data, error } = await supabase
    .from("practice_sessions")
    .insert({
      user_id: user.id,
      topic: input.topic,
      mode: input.mode,
      duration_seconds: input.durationSeconds,
      analysis: input.analysis,
    })
    .select("*")
    .single();

  if (error) throw new Error(error.message);
  return rowToSession(data as SessionRow);
}

export async function deleteSession(id: string): Promise<void> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) {
    writeLocal(readLocal().filter((s) => s.id !== id));
    return;
  }

  const { error } = await supabase
    .from("practice_sessions")
    .delete()
    .eq("id", id);
  if (error) throw new Error(error.message);
}

/* ── Derived data ────────────────────────────────────────────────────── */

export function toSummary(session: PracticeSession): PracticeSessionSummary {
  return {
    id: session.id,
    topic: session.topic,
    mode: session.mode,
    durationSeconds: session.durationSeconds,
    createdAt: session.createdAt,
    overallScore: session.analysis.overallScore,
  };
}

/** Aggregate stats for dashboard & profile, computed client-side. */
export function computeStats(sessions: PracticeSession[]): UserStats {
  const sorted = [...sessions].sort(
    (a, b) => +new Date(a.createdAt) - +new Date(b.createdAt),
  );

  const averageScore =
    sorted.length === 0
      ? 0
      : Math.round(
          sorted.reduce((sum, s) => sum + s.analysis.overallScore, 0) /
            sorted.length,
        );

  // Streak: consecutive days (ending today or yesterday) with ≥1 practice.
  const days = new Set(
    sorted.map((s) => new Date(s.createdAt).toDateString()),
  );
  let streak = 0;
  const cursor = new Date();
  if (!days.has(cursor.toDateString())) cursor.setDate(cursor.getDate() - 1);
  while (days.has(cursor.toDateString())) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }

  return {
    totalSessions: sorted.length,
    averageScore,
    currentStreakDays: streak,
    scoreTrend: sorted.map((s) => ({
      date: s.createdAt,
      score: s.analysis.overallScore,
    })),
  };
}
