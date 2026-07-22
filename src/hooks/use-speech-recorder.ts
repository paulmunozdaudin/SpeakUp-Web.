"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { SpeechLanguage } from "@/types";

export type RecorderStatus =
  | "idle"
  | "requesting"
  | "recording"
  | "paused"
  | "stopped"
  | "error";

export type RecorderErrorCode =
  | "mic-denied"
  | "mic-unavailable"
  | "not-supported";

interface UseSpeechRecorderResult {
  status: RecorderStatus;
  elapsedSeconds: number;
  /** Finalized text (stable across renders) plus the current in-flight guess. */
  transcript: string;
  interimTranscript: string;
  error: RecorderErrorCode | null;
  isSupported: boolean;
  start: () => Promise<void>;
  pause: () => void;
  resume: () => void;
  stop: () => void;
  reset: () => void;
}

const BCP47: Record<SpeechLanguage, string> = {
  es: "es-ES",
  en: "en-US",
};

/**
 * Live microphone transcription via the browser's SpeechRecognition API
 * (Web Speech API — Chrome/Edge/Safari). Runs entirely client-side: audio
 * never has to be uploaded to transcribe it, and the user never types or
 * pastes anything — the transcript accumulates automatically as they talk.
 *
 * Recognition auto-restarts on the engine's natural pauses (`onend` fires
 * every ~60s of silence-free speech in most browsers) so long sessions keep
 * capturing without the user noticing any interruption.
 */
export function useSpeechRecorder(language: SpeechLanguage): UseSpeechRecorderResult {
  const [status, setStatus] = useState<RecorderStatus>("idle");
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [transcript, setTranscript] = useState("");
  const [interimTranscript, setInterimTranscript] = useState("");
  const [error, setError] = useState<RecorderErrorCode | null>(null);
  // Feature detection is a stable browser fact, not reactive state — a lazy
  // initializer avoids the post-mount setState this used to require.
  const [isSupported] = useState(() => {
    if (typeof window === "undefined") return true; // resolved again on the client
    return Boolean(window.SpeechRecognition ?? window.webkitSpeechRecognition);
  });

  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const finalChunksRef = useRef<string[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const shouldRunRef = useRef(false);
  const streamRef = useRef<MediaStream | null>(null);

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const startTimer = useCallback(() => {
    clearTimer();
    timerRef.current = setInterval(() => setElapsedSeconds((s) => s + 1), 1000);
  }, [clearTimer]);

  const buildRecognition = useCallback((): SpeechRecognition | null => {
    const SpeechRecognitionCtor =
      window.SpeechRecognition ?? window.webkitSpeechRecognition;
    if (!SpeechRecognitionCtor) return null;

    const recognition = new SpeechRecognitionCtor();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = BCP47[language];

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let interim = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        const text = result[0]?.transcript ?? "";
        if (result.isFinal) {
          finalChunksRef.current.push(text.trim());
          setTranscript(finalChunksRef.current.join(" "));
        } else {
          interim += text;
        }
      }
      setInterimTranscript(interim);
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      if (event.error === "not-allowed" || event.error === "service-not-allowed") {
        shouldRunRef.current = false;
        setStatus("error");
        setError("mic-denied");
      }
      // "no-speech" / "aborted" are transient — onend handles restart.
    };

    recognition.onend = () => {
      // The engine stops periodically even mid-session; restart seamlessly
      // if the user hasn't paused/stopped.
      if (shouldRunRef.current) {
        try {
          recognition.start();
        } catch {
          // Already starting — ignore.
        }
      }
    };

    return recognition;
  }, [language]);

  const start = useCallback(async () => {
    setError(null);
    setTranscript("");
    setInterimTranscript("");
    finalChunksRef.current = [];
    setElapsedSeconds(0);
    setStatus("requesting");

    if (!isSupported) {
      setStatus("error");
      setError("not-supported");
      return;
    }

    try {
      // Explicit permission prompt up front, and keep the stream so we can
      // show a real "mic is live" state and release it cleanly on stop.
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const recognition = buildRecognition();
      if (!recognition) {
        setStatus("error");
        setError("not-supported");
        stream.getTracks().forEach((t) => t.stop());
        return;
      }
      recognitionRef.current = recognition;
      shouldRunRef.current = true;
      recognition.start();

      setStatus("recording");
      startTimer();
    } catch (e) {
      setStatus("error");
      setError(
        e instanceof DOMException && e.name === "NotAllowedError"
          ? "mic-denied"
          : "mic-unavailable",
      );
    }
  }, [buildRecognition, isSupported, startTimer]);

  const pause = useCallback(() => {
    if (status !== "recording") return;
    shouldRunRef.current = false;
    recognitionRef.current?.stop();
    clearTimer();
    setInterimTranscript("");
    setStatus("paused");
  }, [status, clearTimer]);

  const resume = useCallback(() => {
    if (status !== "paused") return;
    const recognition = buildRecognition();
    if (!recognition) return;
    recognitionRef.current = recognition;
    shouldRunRef.current = true;
    recognition.start();
    startTimer();
    setStatus("recording");
  }, [status, buildRecognition, startTimer]);

  const stop = useCallback(() => {
    shouldRunRef.current = false;
    recognitionRef.current?.stop();
    clearTimer();
    setInterimTranscript("");
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setStatus("stopped");
  }, [clearTimer]);

  const reset = useCallback(() => {
    shouldRunRef.current = false;
    recognitionRef.current?.stop();
    recognitionRef.current = null;
    clearTimer();
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    finalChunksRef.current = [];
    setTranscript("");
    setInterimTranscript("");
    setElapsedSeconds(0);
    setError(null);
    setStatus("idle");
  }, [clearTimer]);

  useEffect(() => {
    return () => {
      shouldRunRef.current = false;
      recognitionRef.current?.stop();
      clearTimer();
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, [clearTimer]);

  return {
    status,
    elapsedSeconds,
    transcript,
    interimTranscript,
    error,
    isSupported,
    start,
    pause,
    resume,
    stop,
    reset,
  };
}
