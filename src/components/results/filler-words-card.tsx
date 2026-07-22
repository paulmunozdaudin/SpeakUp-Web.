"use client";

import { motion } from "framer-motion";
import { MessageSquareOff } from "lucide-react";
import type { AnalysisResult } from "@/types";
import { Card, CardTitle } from "@/components/ui/card";
import { useDict } from "@/lib/i18n";

export function FillerWordsCard({
  fillerWords,
}: {
  fillerWords: AnalysisResult["fillerWords"];
}) {
  const d = useDict();
  const maxCount = fillerWords.top[0]?.count ?? 1;

  return (
    <Card>
      <div className="flex items-center justify-between">
        <CardTitle>{d.results.fillerWordsTitle}</CardTitle>
      </div>

      {fillerWords.total === 0 ? (
        <div className="mt-4 flex items-center gap-2.5 text-sm text-success">
          <MessageSquareOff className="h-4 w-4" />
          {d.results.noFillers}
        </div>
      ) : (
        <>
          <div className="mt-3 flex items-baseline gap-4">
            <div>
              <span className="text-3xl font-semibold tabular-nums">
                {fillerWords.total}
              </span>
              <span className="ml-1.5 text-xs text-muted">
                {d.results.fillerTotal}
              </span>
            </div>
            <div>
              <span className="text-3xl font-semibold tabular-nums">
                {fillerWords.perMinute}
              </span>
              <span className="ml-1.5 text-xs text-muted">
                {d.results.fillerPerMinute}
              </span>
            </div>
          </div>
          <div className="mt-5 space-y-2.5">
            {fillerWords.top.map((entry, index) => (
              <div key={entry.word} className="flex items-center gap-3">
                <span className="w-24 shrink-0 truncate text-sm font-medium">
                  “{entry.word}”
                </span>
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-surface-muted">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(entry.count / maxCount) * 100}%` }}
                    transition={{ duration: 0.6, delay: index * 0.05, ease: "easeOut" }}
                    className="h-full rounded-full bg-warning"
                  />
                </div>
                <span className="w-6 shrink-0 text-right text-sm tabular-nums text-muted">
                  {entry.count}
                </span>
              </div>
            ))}
          </div>
        </>
      )}
    </Card>
  );
}
