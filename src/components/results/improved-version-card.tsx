"use client";

import { Sparkles } from "lucide-react";
import { Card } from "@/components/ui/card";
import { CopyButton } from "@/components/ui/copy-button";
import { useDict } from "@/lib/i18n";

export function ImprovedVersionCard({ improvedVersion }: { improvedVersion: string }) {
  const d = useDict();

  return (
    <Card className="border-accent/30 bg-accent-soft/40">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-accent" />
            <h3 className="text-sm font-semibold">{d.results.improvedTitle}</h3>
          </div>
          <p className="mt-1 text-xs text-muted">{d.results.improvedSubtitle}</p>
        </div>
        <CopyButton
          text={improvedVersion}
          copyLabel={d.results.improvedCopy}
          copiedLabel={d.results.transcriptCopied}
          className="shrink-0 border-accent/30 bg-surface"
        />
      </div>
      <p className="mt-4 whitespace-pre-wrap text-sm leading-relaxed text-foreground">
        {improvedVersion}
      </p>
    </Card>
  );
}
