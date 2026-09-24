"use client";

import { AlertTriangle, CheckCircle2, XCircle } from "lucide-react";
import type { FactCheckClaim, FactCheckVerdict } from "@/types";
import { Card, CardTitle } from "@/components/ui/card";
import { useDict } from "@/lib/i18n";
import { cn } from "@/utils/cn";

const VERDICT_ICON: Record<FactCheckVerdict, typeof CheckCircle2> = {
  correct: CheckCircle2,
  to_verify: AlertTriangle,
  incorrect: XCircle,
};

const VERDICT_COLOR: Record<FactCheckVerdict, string> = {
  correct: "text-success",
  to_verify: "text-warning",
  incorrect: "text-danger",
};

/**
 * "Tu contenido" — factual claims detected in the transcript, each checked
 * against the model's own knowledge (see openai-provider.ts). Only ever
 * rendered when there's at least one claim — an empty array (heuristic
 * provider, or simply no checkable claims in the speech) renders nothing
 * rather than an empty placeholder card.
 */
export function FactCheckCard({ claims }: { claims: FactCheckClaim[] | undefined }) {
  const d = useDict();
  // Defensive: sessions saved before this field existed have no factCheck
  // in their stored JSON at all, not just an empty array.
  if (!claims || claims.length === 0) return null;

  return (
    <Card>
      <CardTitle>{d.results.factCheckTitle}</CardTitle>
      <ul className="mt-4 space-y-4">
        {claims.map((claim, i) => {
          const Icon = VERDICT_ICON[claim.verdict];
          return (
            <li key={i} className="flex items-start gap-3 text-sm leading-relaxed">
              <Icon className={cn("mt-0.5 h-4 w-4 shrink-0", VERDICT_COLOR[claim.verdict])} />
              <div className="min-w-0">
                <p>
                  <span className={cn("font-medium", VERDICT_COLOR[claim.verdict])}>
                    {d.results.factCheckVerdict[claim.verdict]}
                  </span>{" "}
                  — “{claim.claim}”
                </p>
                {claim.correction && (
                  <p className="mt-1 text-muted">
                    <span className="font-medium">{d.results.factCheckCorrection}</span>{" "}
                    {claim.correction}
                  </p>
                )}
                <p className="mt-1 text-muted">{claim.explanation}</p>
                {claim.source && (
                  <p className="mt-1 text-xs text-muted/70">
                    {d.results.factCheckSource}: {claim.source}
                  </p>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </Card>
  );
}
