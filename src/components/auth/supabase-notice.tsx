"use client";

import { Info } from "lucide-react";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { useDict } from "@/lib/i18n";

/**
 * Friendly banner shown while Supabase env vars are missing,
 * so the project works out of the box in demo mode.
 */
export function SupabaseNotice() {
  const d = useDict();

  if (isSupabaseConfigured) return null;

  return (
    <div className="mb-4 flex items-start gap-2.5 rounded-2xl border border-warning/30 bg-warning/10 p-4 text-sm text-warning">
      <Info className="mt-0.5 h-4 w-4 shrink-0" />
      <p>
        {d.auth.supabaseNotice}{" "}
        <a href="/dashboard" className="underline">
          {d.auth.supabaseNoticeLink}
        </a>
        .
      </p>
    </div>
  );
}
