"use client";

import { useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Mic, Pause, Play, RotateCcw, Square, Upload } from "lucide-react";
import { useRecorder } from "@/hooks/use-recorder";
import { Button } from "@/components/ui/button";
import { useDict } from "@/lib/i18n";
import { formatDuration } from "@/utils/format";
import { cn } from "@/utils/cn";

interface RecorderPanelProps {
  /** Called with the finished audio (recorded or uploaded) and its duration. */
  onFinish: (audio: Blob, durationSeconds: number) => void;
  disabled?: boolean;
}

/** Big-mic recording surface with timer, pause/resume/stop and file upload. */
export function RecorderPanel({ onFinish, disabled }: RecorderPanelProps) {
  const d = useDict();
  const recorder = useRecorder();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isRecording = recorder.status === "recording";
  const isPaused = recorder.status === "paused";
  const isActive = isRecording || isPaused;
  const isDone = recorder.status === "stopped" && recorder.audioBlob !== null;

  const errorMessage =
    recorder.error === "mic-denied"
      ? d.practice.micDenied
      : recorder.error === "mic-unavailable"
        ? d.practice.micUnavailable
        : null;

  function handleUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    // Read the real duration from the audio file metadata.
    const url = URL.createObjectURL(file);
    const probe = new Audio(url);
    probe.onloadedmetadata = () => {
      const duration = Number.isFinite(probe.duration)
        ? Math.round(probe.duration)
        : 60;
      URL.revokeObjectURL(url);
      onFinish(file, duration);
    };
    probe.onerror = () => {
      URL.revokeObjectURL(url);
      onFinish(file, 60); // fall back to a sane default
    };
  }

  return (
    <div className="flex flex-col items-center rounded-3xl border border-border bg-surface px-6 py-12">
      {/* Timer */}
      <p
        className={cn(
          "font-mono text-5xl font-medium tabular-nums tracking-tight",
          isRecording ? "text-foreground" : "text-muted",
        )}
        aria-live="polite"
      >
        {formatDuration(recorder.elapsedSeconds)}
      </p>
      <div className="mt-2 flex h-6 items-center gap-2 text-sm">
        {isRecording && (
          <>
            <span className="relative flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-danger opacity-75" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-danger" />
            </span>
            <span className="font-medium text-danger">
              {d.practice.recording}
            </span>
          </>
        )}
        {isPaused && (
          <span className="font-medium text-warning">{d.practice.paused}</span>
        )}
        {isDone && (
          <span className="inline-flex items-center gap-1.5 font-medium text-success">
            <Check className="h-4 w-4" />
            {d.practice.recordingReady}
          </span>
        )}
        {recorder.status === "idle" && (
          <span className="text-muted">{d.practice.pressMic}</span>
        )}
      </div>

      {/* Main mic button */}
      <div className="relative mt-8">
        <AnimatePresence>
          {isRecording && (
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1, scale: [1, 1.35, 1] }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.6, repeat: Infinity }}
              className="absolute inset-0 rounded-full bg-danger/20"
            />
          )}
        </AnimatePresence>
        <button
          type="button"
          disabled={disabled || recorder.status === "requesting"}
          onClick={() => {
            if (recorder.status === "idle" || recorder.status === "error") {
              recorder.start();
            } else if (isRecording) {
              recorder.stop();
            } else if (isPaused) {
              recorder.resume();
            }
          }}
          aria-label={isRecording ? d.practice.stop : d.practice.recording}
          className={cn(
            "relative flex h-24 w-24 cursor-pointer items-center justify-center rounded-full text-white shadow-lg transition-all duration-300 active:scale-95 disabled:opacity-50",
            isRecording
              ? "bg-danger shadow-danger/30"
              : "bg-accent shadow-accent/30 hover:bg-accent-hover",
          )}
        >
          {isRecording ? (
            <Square className="h-8 w-8 fill-current" />
          ) : (
            <Mic className="h-9 w-9" />
          )}
        </button>
      </div>

      {/* Secondary controls */}
      <div className="mt-8 flex min-h-10 items-center gap-3">
        {isRecording && (
          <Button variant="secondary" size="sm" onClick={recorder.pause}>
            <Pause className="h-4 w-4" />
            {d.practice.pause}
          </Button>
        )}
        {isPaused && (
          <>
            <Button variant="secondary" size="sm" onClick={recorder.resume}>
              <Play className="h-4 w-4" />
              {d.practice.resume}
            </Button>
            <Button variant="danger" size="sm" onClick={recorder.stop}>
              <Square className="h-4 w-4" />
              {d.practice.stop}
            </Button>
          </>
        )}
        {isDone && (
          <>
            <Button
              size="sm"
              onClick={() =>
                onFinish(recorder.audioBlob!, recorder.elapsedSeconds)
              }
              disabled={disabled}
            >
              <Check className="h-4 w-4" />
              {d.practice.analyzeRecording}
            </Button>
            <Button variant="secondary" size="sm" onClick={recorder.reset}>
              <RotateCcw className="h-4 w-4" />
              {d.practice.retake}
            </Button>
          </>
        )}
      </div>

      {errorMessage && (
        <p className="mt-4 max-w-sm rounded-xl bg-danger/10 px-4 py-2.5 text-center text-sm text-danger">
          {errorMessage}
        </p>
      )}

      {/* Upload alternative */}
      {!isActive && !isDone && (
        <div className="mt-8 flex flex-col items-center border-t border-border pt-6">
          <p className="text-xs text-muted">{d.practice.or}</p>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={disabled}
            className="mt-2 inline-flex cursor-pointer items-center gap-2 text-sm font-medium text-accent hover:underline disabled:opacity-50"
          >
            <Upload className="h-4 w-4" />
            {d.practice.uploadFile}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="audio/*"
            className="hidden"
            onChange={handleUpload}
          />
        </div>
      )}
    </div>
  );
}
