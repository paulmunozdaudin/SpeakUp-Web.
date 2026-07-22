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
  | "not-supported"
  | "network-error";

interface UseSpeechRecorderResult {
  status: RecorderStatus;
  elapsedSeconds: number;
  /** Finalized text (stable across renders) plus the current in-flight guess. */
  transcript: string;
  interimTranscript: string;
  error: RecorderErrorCode | null;
  isSupported: boolean;
  /** True once we've gone a while into "recording" with zero words captured
   *  — surfaced so the UI can proactively warn instead of staying silent. */
  isSilentTooLong: boolean;
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

/** After this many consecutive failed (re)starts, stop retrying and surface
 *  a real error instead of looping silently forever. */
const MAX_CONSECUTIVE_FAILURES = 4;
/** Delay before restarting after the engine's own natural stop — starting
 *  synchronously inside `onend` throws InvalidStateError in Chrome. */
const RESTART_DELAY_MS = 300;
/** How long "recording" with literally nothing captured yet counts as
 *  suspiciously silent (mic muted, wrong input device, blocked network…). */
const SILENCE_WARNING_MS = 7000;

/**
 * Live microphone transcription via the browser's SpeechRecognition API
 * (Web Speech API — Chrome/Edge, on-device or via the browser's speech
 * service). Runs entirely client-side: audio never has to be uploaded to
 * transcribe it, and the user never types or pastes anything — the
 * transcript accumulates automatically as they talk.
 *
 * Recognition auto-restarts on the engine's natural pauses. Network hiccups,
 * permission issues and dead microphones are all surfaced as a real error
 * after a bounded number of retries — this never fails silently.
 */
export function useSpeechRecorder(language: SpeechLanguage): UseSpeechRecorderResult {
  const [status, setStatus] = useState<RecorderStatus>("idle");
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [transcript, setTranscript] = useState("");
  const [interimTranscript, setInterimTranscript] = useState("");
  const [error, setError] = useState<RecorderErrorCode | null>(null);
  const [isSilentTooLong, setIsSilentTooLong] = useState(false);
  // Feature detection is a stable browser fact, not reactive state — a lazy
  // initializer avoids the post-mount setState this used to require.
  const [isSupported] = useState(() => {
    if (typeof window === "undefined") return true; // resolved again on the client
    return Boolean(window.SpeechRecognition ?? window.webkitSpeechRecognition);
  });

  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const finalChunksRef = useRef<string[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const restartTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const silenceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const shouldRunRef = useRef(false);
  const streamRef = useRef<MediaStream | null>(null);
  const consecutiveFailuresRef = useRef(0);
  const hasCapturedAnyWordsRef = useRef(false);

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const clearRestartTimer = useCallback(() => {
    if (restartTimerRef.current) {
      clearTimeout(restartTimerRef.current);
      restartTimerRef.current = null;
    }
  }, []);

  const clearSilenceTimer = useCallback(() => {
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }
  }, []);

  const armSilenceWarning = useCallback(() => {
    clearSilenceTimer();
    setIsSilentTooLong(false);
    silenceTimerRef.current = setTimeout(() => {
      if (!hasCapturedAnyWordsRef.current) setIsSilentTooLong(true);
    }, SILENCE_WARNING_MS);
  }, [clearSilenceTimer]);

  const startTimer = useCallback(() => {
    clearTimer();
    timerRef.current = setInterval(() => setElapsedSeconds((s) => s + 1), 1000);
  }, [clearTimer]);

  /** Gives up permanently: stops retrying and surfaces a real error. */
  const failPermanently = useCallback((code: RecorderErrorCode) => {
    shouldRunRef.current = false;
    clearTimer();
    clearRestartTimer();
    clearSilenceTimer();
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setStatus("error");
    setError(code);
  }, [clearTimer, clearRestartTimer, clearSilenceTimer]);

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
      let gotFinal = false;
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        const text = result[0]?.transcript ?? "";
        if (result.isFinal) {
          if (text.trim()) {
            finalChunksRef.current.push(text.trim());
            setTranscript(finalChunksRef.current.join(" "));
            gotFinal = true;
          }
        } else if (text.trim()) {
          interim += text;
        }
      }
      setInterimTranscript(interim);
      if (interim || gotFinal) {
        // Real audio is being recognized — the connection works, reset
        // both the failure circuit breaker and the silence watchdog.
        consecutiveFailuresRef.current = 0;
        hasCapturedAnyWordsRef.current = true;
        setIsSilentTooLong(false);
        clearSilenceTimer();
      }
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      if (event.error === "not-allowed" || event.error === "service-not-allowed") {
        failPermanently("mic-denied");
        return;
      }
      if (event.error === "audio-capture") {
        failPermanently("mic-unavailable");
        return;
      }
      if (event.error === "no-speech" || event.error === "aborted") {
        // Benign: the engine just didn't hear anything in this pass, or we
        // stopped it ourselves. onend's restart handles it; the silence
        // watchdog (not this handler) is what tells the user if it's stuck.
        return;
      }
      // "network" and anything else: count toward the circuit breaker —
      // this is the Web Speech API's single most common real-world failure
      // (it depends on a live connection to the browser's speech service).
      consecutiveFailuresRef.current += 1;
      if (consecutiveFailuresRef.current >= MAX_CONSECUTIVE_FAILURES) {
        failPermanently("network-error");
      }
      // Otherwise let onend's restart retry — transient network blips
      // shouldn't kill a whole practice session over one hiccup.
    };

    recognition.onend = () => {
      if (!shouldRunRef.current) return;
      // Starting synchronously inside `onend` throws InvalidStateError in
      // Chrome; a short delay avoids that race.
      clearRestartTimer();
      restartTimerRef.current = setTimeout(() => {
        if (!shouldRunRef.current) return;
        try {
          recognition.start();
        } catch {
          consecutiveFailuresRef.current += 1;
          if (consecutiveFailuresRef.current >= MAX_CONSECUTIVE_FAILURES) {
            failPermanently("network-error");
          }
        }
      }, RESTART_DELAY_MS);
    };

    return recognition;
  }, [language, failPermanently, clearRestartTimer, clearSilenceTimer]);

  const start = useCallback(async () => {
    setError(null);
    setTranscript("");
    setInterimTranscript("");
    setIsSilentTooLong(false);
    finalChunksRef.current = [];
    consecutiveFailuresRef.current = 0;
    hasCapturedAnyWordsRef.current = false;
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
      armSilenceWarning();
    } catch (e) {
      setStatus("error");
      setError(
        e instanceof DOMException && e.name === "NotAllowedError"
          ? "mic-denied"
          : "mic-unavailable",
      );
    }
  }, [buildRecognition, isSupported, startTimer, armSilenceWarning]);

  const pause = useCallback(() => {
    if (status !== "recording") return;
    shouldRunRef.current = false;
    clearRestartTimer();
    clearSilenceTimer();
    recognitionRef.current?.stop();
    clearTimer();
    setInterimTranscript("");
    setIsSilentTooLong(false);
    setStatus("paused");
  }, [status, clearTimer, clearRestartTimer, clearSilenceTimer]);

  const resume = useCallback(() => {
    if (status !== "paused") return;
    const recognition = buildRecognition();
    if (!recognition) {
      failPermanently("not-supported");
      return;
    }
    try {
      recognitionRef.current = recognition;
      shouldRunRef.current = true;
      consecutiveFailuresRef.current = 0;
      recognition.start();
      startTimer();
      armSilenceWarning();
      setStatus("recording");
    } catch {
      failPermanently("network-error");
    }
  }, [status, buildRecognition, startTimer, armSilenceWarning, failPermanently]);

  const stop = useCallback(() => {
    shouldRunRef.current = false;
    clearRestartTimer();
    clearSilenceTimer();
    recognitionRef.current?.stop();
    clearTimer();
    setInterimTranscript("");
    setIsSilentTooLong(false);
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setStatus("stopped");
  }, [clearTimer, clearRestartTimer, clearSilenceTimer]);

  const reset = useCallback(() => {
    shouldRunRef.current = false;
    clearRestartTimer();
    clearSilenceTimer();
    recognitionRef.current?.stop();
    recognitionRef.current = null;
    clearTimer();
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    finalChunksRef.current = [];
    consecutiveFailuresRef.current = 0;
    hasCapturedAnyWordsRef.current = false;
    setTranscript("");
    setInterimTranscript("");
    setIsSilentTooLong(false);
    setElapsedSeconds(0);
    setError(null);
    setStatus("idle");
  }, [clearTimer, clearRestartTimer, clearSilenceTimer]);

  useEffect(() => {
    return () => {
      shouldRunRef.current = false;
      clearRestartTimer();
      clearSilenceTimer();
      recognitionRef.current?.stop();
      clearTimer();
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, [clearTimer, clearRestartTimer, clearSilenceTimer]);

  return {
    status,
    elapsedSeconds,
    transcript,
    interimTranscript,
    error,
    isSupported,
    isSilentTooLong,
    start,
    pause,
    resume,
    stop,
    reset,
  };
}
