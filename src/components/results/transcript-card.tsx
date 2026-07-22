"use client";

import { Card, CardTitle } from "@/components/ui/card";
import { CopyButton } from "@/components/ui/copy-button";
import { useDict } from "@/lib/i18n";

export function TranscriptCard({ transcript }: { transcript: string }) {
  const d = useDict();

  return (
    <Card>
      <div className="flex items-center justify-between">
        <CardTitle>{d.results.transcriptTitle}</CardTitle>
        <CopyButton
          text={transcript}
          copyLabel={d.results.transcriptCopy}
          copiedLabel={d.results.transcriptCopied}
        />
      </div>
      <p className="mt-4 whitespace-pre-wrap text-sm leading-relaxed text-foreground">
        {transcript}
      </p>
    </Card>
  );
}
