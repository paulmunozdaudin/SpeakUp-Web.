import { MessageSquareOff } from "lucide-react";
import type { AnalysisResult } from "@/types";
import { Card, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export function FillerWordsCard({
  fillerWords,
}: {
  fillerWords: AnalysisResult["fillerWords"];
}) {
  return (
    <Card>
      <div className="flex items-center justify-between">
        <CardTitle>Filler words</CardTitle>
        <span className="text-xl font-semibold tabular-nums">
          {fillerWords.score}
        </span>
      </div>
      {fillerWords.count === 0 ? (
        <div className="mt-4 flex items-center gap-2.5 text-sm text-success">
          <MessageSquareOff className="h-4 w-4" />
          No filler words detected — impressive!
        </div>
      ) : (
        <>
          <p className="mt-3 text-sm text-muted">
            {fillerWords.count} filler word{fillerWords.count === 1 ? "" : "s"}{" "}
            detected in this session:
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {fillerWords.words.map((entry) => (
              <Badge key={entry.word} tone="warning">
                “{entry.word}” × {entry.count}
              </Badge>
            ))}
          </div>
        </>
      )}
    </Card>
  );
}
