"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export type RecorderStatus =
  | "idle"
  | "requesting" // waiting for mic permission
  | "recording"
  | "paused"
  | "stopped"
  | "error";

interface UseRecorderResult {
  status: RecorderStatus;
  /** Elapsed recording time in seconds (pauses excluded). */
  elapsedSeconds: number;
  audioBlob: Blob | null;
  error: string | null;
  start: () => Promise<void>;
  pause: () => void;
  resume: () => void;
  stop: () => void;
  reset: () => void;
}

/**
 * Microphone recording built on the MediaRecorder API.
 * Handles permission errors, pause/resume and elapsed-time tracking.
 */
export function useRecorder(): UseRecorderResult {
  const [status, setStatus] = useState<RecorderStatus>("idle");
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [error, setError] = useState<string | null>(null);

  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const startTimer = useCallback(() => {
    clearTimer();
    timerRef.current = setInterval(
      () => setElapsedSeconds((s) => s + 1),
      1000,
    );
  }, [clearTimer]);

  const start = useCallback(async () => {
    setError(null);
    setAudioBlob(null);
    setElapsedSeconds(0);
    setStatus("requesting");

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
      });
      const recorder = new MediaRecorder(stream);
      recorderRef.current = recorder;
      chunksRef.current = [];

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) chunksRef.current.push(event.data);
      };
      recorder.onstop = () => {
        setAudioBlob(
          new Blob(chunksRef.current, {
            type: recorder.mimeType || "audio/webm",
          }),
        );
        // Release the microphone.
        stream.getTracks().forEach((track) => track.stop());
      };

      recorder.start();
      setStatus("recording");
      startTimer();
    } catch (e) {
      setStatus("error");
      // Error codes (not copy) so the UI can localize the message.
      setError(
        e instanceof DOMException && e.name === "NotAllowedError"
          ? "mic-denied"
          : "mic-unavailable",
      );
    }
  }, [startTimer]);

  const pause = useCallback(() => {
    if (recorderRef.current?.state === "recording") {
      recorderRef.current.pause();
      clearTimer();
      setStatus("paused");
    }
  }, [clearTimer]);

  const resume = useCallback(() => {
    if (recorderRef.current?.state === "paused") {
      recorderRef.current.resume();
      startTimer();
      setStatus("recording");
    }
  }, [startTimer]);

  const stop = useCallback(() => {
    const recorder = recorderRef.current;
    if (recorder && recorder.state !== "inactive") {
      recorder.stop();
      clearTimer();
      setStatus("stopped");
    }
  }, [clearTimer]);

  const reset = useCallback(() => {
    clearTimer();
    recorderRef.current = null;
    chunksRef.current = [];
    setAudioBlob(null);
    setElapsedSeconds(0);
    setError(null);
    setStatus("idle");
  }, [clearTimer]);

  // Cleanup on unmount: stop recorder + timer, release mic.
  useEffect(() => {
    return () => {
      clearTimer();
      const recorder = recorderRef.current;
      if (recorder && recorder.state !== "inactive") {
        recorder.stream.getTracks().forEach((track) => track.stop());
        recorder.stop();
      }
    };
  }, [clearTimer]);

  return {
    status,
    elapsedSeconds,
    audioBlob,
    error,
    start,
    pause,
    resume,
    stop,
    reset,
  };
}
