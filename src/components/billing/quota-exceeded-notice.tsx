"use client";

import Link from "next/link";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useDict } from "@/lib/i18n";
import type { Dictionary } from "@/lib/i18n/translations";

/**
 * Shown instead of the generic error banner when checkFreeQuota() rejects
 * a free-plan user over their weekly session cap — a dead-end error isn't
 * useful here, a way to fix it is.
 *
 * `dict` is optional: exam/page.tsx hardcodes the French dictionary (the
 * French exam formats are only ever shown in French, regardless of the
 * visitor's UI locale) and needs this notice to match rather than follow
 * useDict()'s usual locale.
 */
export function QuotaExceededNotice({ dict }: { dict?: Dictionary }) {
  const activeDict = useDict();
  const d = dict ?? activeDict;

  return (
    <div className="flex flex-col items-start gap-3 rounded-xl border border-accent/30 bg-accent-soft px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-start gap-2.5 text-sm text-foreground">
        <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
        <p>{d.billing.quotaExceeded}</p>
      </div>
      <Link href="/profile" className="w-full shrink-0 sm:w-auto">
        <Button size="sm" className="w-full sm:w-auto">
          {d.profile.upgradeToPro}
        </Button>
      </Link>
    </div>
  );
}
