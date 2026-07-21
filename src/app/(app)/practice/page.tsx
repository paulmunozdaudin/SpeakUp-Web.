"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { PracticeMode } from "@/types";
import { Input } from "@/components/ui/input";
import { ModeSelector } from "@/components/recording/mode-selector";
import { RecorderPanel } from "@/components/recording/recorder-panel";
import { AnalyzingOverlay } from "@/components/recording/analyzing-overlay";
import { analyzeAndSave } from "@/services/analysis.service";

export default function PracticePage() {
  const router = useRouter();
  const [topic, setTopic] = useState("");
  const [mode, setMode] = useState<PracticeMode>("presentation");
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFinish(audio: Blob, durationSeconds: number) {
    setError(null);
    setAnalyzing(true);
    try {
      const session = await analyzeAndSave({
        audio,
        topic: topic.trim() || "Untitled practice",
        mode,
        durationSeconds: Math.max(durationSeconds, 1),
      });
      router.push(`/results/${session.id}`);
    } catch (e) {
      setAnalyzing(false);
      setError(e instanceof Error ? e.message : "Something went wrong.");
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
          New practice
        </h1>
        <p className="mt-1 text-sm text-muted">
          Set the stage, hit record, and speak like the room is full.
        </p>
      </div>

      <div className="space-y-6">
        <Input
          label="What are you presenting?"
          name="topic"
          placeholder="e.g. Q3 results, thesis defense, seed pitch…"
          value={topic}
          onChange={(event) => setTopic(event.target.value)}
          maxLength={120}
        />

        <div className="space-y-2">
          <span className="block text-sm font-medium">Practice mode</span>
          <ModeSelector value={mode} onChange={setMode} />
        </div>

        <RecorderPanel onFinish={handleFinish} disabled={analyzing} />

        {error && (
          <p className="rounded-xl bg-danger/10 px-4 py-3 text-sm text-danger">
            {error}
          </p>
        )}
      </div>

      {analyzing && <AnalyzingOverlay />}
    </div>
  );
}
