import { Info } from "lucide-react";
import { isSupabaseConfigured } from "@/lib/supabase/config";

/**
 * Friendly banner shown while Supabase env vars are missing,
 * so the project works out of the box in demo mode.
 */
export function SupabaseNotice() {
  if (isSupabaseConfigured) return null;

  return (
    <div className="mb-4 flex items-start gap-2.5 rounded-2xl border border-warning/30 bg-warning/10 p-4 text-sm text-warning">
      <Info className="mt-0.5 h-4 w-4 shrink-0" />
      <p>
        Supabase is not configured. Auth is disabled — you can still explore the
        app in <strong>demo mode</strong> from the{" "}
        <a href="/dashboard" className="underline">
          dashboard
        </a>
        .
      </p>
    </div>
  );
}
