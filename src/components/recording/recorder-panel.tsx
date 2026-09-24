"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, Ear, Mic, Pause, Play, Square, Video } from "lucide-react";
import { useSpeechRecorder } from "@/hooks/use-speech-recorder";
import type { RecorderErrorCode } from "@/hooks/use-speech-recorder";
import { useVideoRecorder } from "@/hooks/use-video-recorder";
import type { VideoRecorderErrorCode } from "@/hooks/use-video-recorder";
import { extractSampledFrames, type CapturedFrame } from "@/utils/video-frames";
import { Button } from "@/components/ui/button";
import { useDict } from "@/lib/i18n";
import type { Dictionary } from "@/lib/i18n/translations";
import { formatDuration } from "@/utils/format";
import { cn } from "@/utils/cn";
import type { AnalysisMode, SpeechLanguage, TargetDuration } from "@/types";

interface RecorderPanelProps {
  language: SpeechLanguage;
  targetDurationMinutes: TargetDuration;
  /** "voice" (default) uses only the mic; "video" also captures the camera
   *  and hands sampled frames back through onFinish. */
  analysisMode?: AnalysisMode;
  onFinish: (
    transcript: string,
    durationSeconds: number,
    frames?: CapturedFrame[],
  ) => void;
  disabled?: boolean;
}

/** Grace period after Stop, so the recognizer's last async result lands
 *  before we read the final transcript and hand off to analysis. */
const STOP_GRACE_MS = 500;

/** Every RecorderErrorCode must resolve to a message — the TS mapped type
 *  makes it impossible to add a new code without wiring up its copy here. */
function errorMessages(d: Dictionary): Record<RecorderErrorCode, string> {
  return {
    "mic-denied": d.practice.micDenied,
    "mic-unavailable": d.practice.micUnavailable,
    "not-supported": d.practice.notSupportedBody,
    "network-error": d.practice.networkError,
    "network-error-brave": d.practice.networkErrorBrave,
  };
}

function videoErrorMessages(d: Dictionary): Record<VideoRecorderErrorCode, string> {
  return {
    "camera-denied": d.practice.cameraDenied,
    "camera-unavailable": d.practice.cameraUnavailable,
    "not-supported": d.practice.cameraNotSupported,
  };
}

/**
 * Live recording surface: big start/stop control, elapsed timer, elegant
 * recording animation, and an auto-scrolling live transcript — the user
 * never types or pastes anything, the text appears as they speak.
 * Pressing Stop finalizes the recording and automatically hands the
 * transcript off for analysis, with no extra confirmation step.
 *
 * In "video" mode this also drives useVideoRecorder in parallel: the
 * camera stream feeds a live self-preview, and on Stop the recorded blob
 * is sampled into a handful of JPEG frames (see utils/video-frames) and
 * immediately discarded — nothing about the video itself is ever uploaded
 * or persisted, only those small frames travel to the analyze API.
 */
export function RecorderPanel({
  language,
  targetDurationMinutes,
  analysisMode = "voice",
  onFinish,
  disabled,
}: RecorderPanelProps) {
  const d = useDict();
  const recorder = useSpeechRecorder(language);
  const videoRecorder = useVideoRecorder();
  const isVideoMode = analysisMode === "video";
  const transcriptBoxRef = useRef<HTMLDivElement>(null);
  const previewRef = useRef<HTMLVideoElement>(null);
  const latestTranscriptRef = useRef(recorder.transcript);
  const framesRef = useRef<CapturedFrame[] | undefined>(undefined);
  const [videoProcessing, setVideoProcessing] = useState(false);
  useEffect(() => {
    latestTranscriptRef.current = recorder.transcript;
  }, [recorder.transcript]);

  useEffect(() => {
    if (previewRef.current) previewRef.current.srcObject = videoRecorder.stream;
  }, [videoRecorder.stream]);

  // Safety net: if the camera started fine but the mic then fails (e.g.
  // denied separately), release the camera instead of leaving it running
  // with no way to stop it — otherwise a retry would open a second stream
  // on top of the still-live first one.
  useEffect(() => {
    if (recorder.status === "error" && videoRecorder.status === "recording") {
      videoRecorder.stop();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [recorder.status, videoRecorder.status]);

  const isRecording = recorder.status === "recording";
  const isPaused = recorder.status === "paused";
  const isActive = isRecording || isPaused;
  const targetSeconds = targetDurationMinutes * 60;
  const targetReached = recorder.elapsedSeconds >= targetSeconds;
  const fullTranscript = [recorder.transcript, recorder.interimTranscript]
    .filter(Boolean)
    .join(" ");

  useEffect(() => {
    if (transcriptBoxRef.current) {
      transcriptBoxRef.current.scrollTop = transcriptBoxRef.current.scrollHeight;
    }
  }, [fullTranscript]);

  async function handleStop() {
    recorder.stop();
    if (!isVideoMode) return;
    setVideoProcessing(true);
    try {
      const blob = await videoRecorder.stop();
      framesRef.current = blob ? await extractSampledFrames(blob) : undefined;
    } catch {
      // Never fabricate video analysis — if sampling fails, the session
      // just proceeds as voice-only feedback instead.
      framesRef.current = undefined;
    } finally {
      setVideoProcessing(false);
    }
  }

  async function handleStart() {
    if (isVideoMode) {
      // Use the resolved value, not videoRecorder.error read right after —
      // that field comes from this render's closure and is stale until
      // the next one, so it would never reflect what start() just did.
      const cameraStarted = await videoRecorder.start();
      if (!cameraStarted) return; // error is surfaced below via cameraErrorMessage
    }
    recorder.start();
  }

  // Stop finalizes AND auto-analyzes — no separate "finish" click. Gated on
  // videoProcessing too, so frame sampling has a chance to finish before we
  // hand off (voice mode never sets it, so this is a no-op there).
  useEffect(() => {
    if (recorder.status !== "stopped") return;
    if (isVideoMode && videoProcessing) return;
    const elapsed = recorder.elapsedSeconds;
    const timer = setTimeout(() => {
      onFinish(latestTranscriptRef.current, elapsed, framesRef.current);
    }, STOP_GRACE_MS);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [recorder.status, isVideoMode, videoProcessing]);

  const errorMessage = recorder.error ? errorMessages(d)[recorder.error] : null;
  const cameraErrorMessage = videoRecorder.error
    ? videoErrorMessages(d)[videoRecorder.error]
    : null;

  if (!recorder.isSupported || (isVideoMode && !videoRecorder.isSupported)) {
    return (
      <div className="flex flex-col items-center rounded-3xl border border-warning/30 bg-warning/10 px-6 py-12 text-center">
        <AlertTriangle className="h-8 w-8 text-warning" />
        <h3 className="mt-4 text-base font-semibold">
          {d.practice.notSupportedTitle}
        </h3>
        <p className="mt-1.5 max-w-sm text-sm text-muted">
          {recorder.isSupported ? d.practice.cameraNotSupported : d.practice.notSupportedBody}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col items-center rounded-3xl border border-border bg-surface px-6 py-10">
        {/* Camera self-preview — only in "video" mode. Mirrored like a
            mirror/selfie camera so it feels natural to look at while
            speaking. */}
        {isVideoMode && (
          <div className="relative mb-6 w-full max-w-sm overflow-hidden rounded-2xl bg-black">
            <video
              ref={previewRef}
              autoPlay
              muted
              playsInline
              className="aspect-video w-full -scale-x-100 object-cover"
            />
            {!videoRecorder.stream && (
              <div className="absolute inset-0 flex items-center justify-center bg-surface-muted">
                <Video className="h-8 w-8 text-muted" />
              </div>
            )}
            {isRecording && (
              <span className="absolute left-3 top-3 flex items-center gap-1.5 rounded-full bg-black/60 px-2.5 py-1 text-xs font-medium text-white backdrop-blur">
                <span className="h-2 w-2 rounded-full bg-danger" />
                REC
              </span>
            )}
          </div>
        )}

        {/* Timer */}
        <div className="flex items-baseline gap-2">
          <p
            className={cn(
              "font-mono text-5xl font-medium tabular-nums tracking-tight",
              isRecording ? "text-foreground" : "text-muted",
            )}
            aria-live="polite"
          >
            {formatDuration(recorder.elapsedSeconds)}
          </p>
          <p className="text-lg font-mono text-muted/50 tabular-nums">
            / {formatDuration(targetSeconds)}
          </p>
        </div>

        {/* Progress toward target */}
        <div className="mt-3 h-1 w-48 overflow-hidden rounded-full bg-surface-muted">
          <motion.div
            className={cn(
              "h-full rounded-full",
              targetReached ? "bg-success" : "bg-accent",
            )}
            animate={{
              width: `${Math.min(100, (recorder.elapsedSeconds / targetSeconds) * 100)}%`,
            }}
            transition={{ duration: 0.3 }}
          />
        </div>

        <div className="mt-3 flex h-6 items-center gap-2 text-sm">
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
          {recorder.status === "requesting" && (
            <span className="text-muted">{d.practice.requestingMic}</span>
          )}
          {(recorder.status === "idle" || recorder.status === "error") && (
            <span className="text-muted">{d.practice.pressStartToBegin}</span>
          )}
          {recorder.status === "stopped" && (
            <span className="text-muted">{d.practice.analyzing}</span>
          )}
          {targetReached && isActive && (
            <span className="font-medium text-success">
              {d.practice.targetReached}
            </span>
          )}
        </div>

        {/* Main control: Start when idle, Stop while active (recording or paused) */}
        <div className="relative mt-8">
          <AnimatePresence>
            {isRecording && (
              <>
                <motion.span
                  initial={{ opacity: 0, scale: 1 }}
                  animate={{ opacity: [0.5, 0], scale: [1, 1.6] }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 1.8, repeat: Infinity, ease: "easeOut" }}
                  className="absolute inset-0 rounded-full bg-danger/25"
                />
                <motion.span
                  initial={{ opacity: 0, scale: 1 }}
                  animate={{ opacity: [0.4, 0], scale: [1, 1.9] }}
                  exit={{ opacity: 0 }}
                  transition={{
                    duration: 1.8,
                    repeat: Infinity,
                    ease: "easeOut",
                    delay: 0.5,
                  }}
                  className="absolute inset-0 rounded-full bg-danger/15"
                />
              </>
            )}
          </AnimatePresence>
          <button
            type="button"
            disabled={
              disabled ||
              recorder.status === "requesting" ||
              recorder.status === "stopped" ||
              (isVideoMode && videoRecorder.status === "requesting")
            }
            onClick={() => {
              if (recorder.status === "idle" || recorder.status === "error") {
                handleStart();
              } else if (isActive) {
                handleStop();
              }
            }}
            aria-label={isActive ? d.practice.stop : d.practice.start}
            className={cn(
              "relative flex h-24 w-24 cursor-pointer items-center justify-center rounded-full text-white shadow-lg transition-all duration-300 active:scale-95 disabled:opacity-50",
              isActive
                ? "bg-danger shadow-danger/30"
                : "bg-accent shadow-accent/30 hover:bg-accent-hover",
            )}
          >
            {isActive ? (
              <Square className="h-8 w-8 fill-current" />
            ) : (
              <Mic className="h-9 w-9" />
            )}
          </button>
        </div>

        {/* Pause/resume: a secondary affordance, independent from Stop.
            Not offered in video mode — pausing the mic but not the camera
            (or vice versa) would leave the two out of sync. */}
        {!isVideoMode && (
          <div className="mt-8 flex min-h-10 items-center gap-3">
            {isRecording && (
              <Button variant="secondary" size="sm" onClick={recorder.pause}>
                <Pause className="h-4 w-4" />
                {d.practice.pause}
              </Button>
            )}
            {isPaused && (
              <Button variant="secondary" size="sm" onClick={recorder.resume}>
                <Play className="h-4 w-4" />
                {d.practice.resume}
              </Button>
            )}
          </div>
        )}

        {errorMessage && (
          <p className="mt-4 max-w-sm rounded-xl bg-danger/10 px-4 py-2.5 text-center text-sm text-danger">
            {errorMessage}
          </p>
        )}

        {cameraErrorMessage && (
          <p className="mt-4 max-w-sm rounded-xl bg-danger/10 px-4 py-2.5 text-center text-sm text-danger">
            {cameraErrorMessage}
          </p>
        )}

        {!errorMessage && isRecording && recorder.isSilentTooLong && !fullTranscript && (
          <p className="mt-4 flex max-w-sm items-center gap-2 rounded-xl bg-warning/10 px-4 py-2.5 text-center text-sm text-warning">
            <Ear className="h-4 w-4 shrink-0" />
            {d.practice.stillListening}
          </p>
        )}
      </div>

      {/* Live transcript */}
      <div className="rounded-3xl border border-border bg-surface p-5">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-medium text-muted">
            {d.practice.liveTranscript}
          </h3>
          {fullTranscript && (
            <span className="text-xs tabular-nums text-muted">
              {fullTranscript.trim().split(/\s+/).filter(Boolean).length} {d.results.words}
            </span>
          )}
        </div>
        <div
          ref={transcriptBoxRef}
          className="max-h-40 min-h-20 overflow-y-auto text-sm leading-relaxed"
        >
          {fullTranscript ? (
            <p>
              <span className="text-foreground">{recorder.transcript}</span>{" "}
              <span className="text-muted">{recorder.interimTranscript}</span>
            </p>
          ) : (
            <p className="italic text-muted/60">
              {d.practice.liveTranscriptEmpty}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
