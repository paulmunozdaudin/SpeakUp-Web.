"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export type RecorderStatus =
  | "idle"
  | "requesting"
  | "recording"
  | "paused"
  | "stopped"
  | "error";

export type RecorderErrorCode = "mic-denied" | "mic-unavailable" | "not-supported";

export interface PauseEvent {
  /** Seconds into the recording when the silence started. */
  timestampSeconds: number;
  durationSeconds: number;
}

interface StopResult {
  /** The recorded audio, or null if nothing was captured — callers send
   *  this off for server-side transcription (see transcription.service). */
  blob: Blob | null;
  /** Long mid-speech silences, timestamped from the real mic signal.
   *  `null` if the browser couldn't monitor audio for real — never
   *  fabricated to fill the gap. */
  pauses: PauseEvent[] | null;
}

interface UseSpeechRecorderResult {
  status: RecorderStatus;
  elapsedSeconds: number;
  error: RecorderErrorCode | null;
  isSupported: boolean;
  /** True once we've gone a while into "recording" with zero real sound
   *  detected — surfaced so the UI can proactively warn instead of
   *  staying silent. */
  isSilentTooLong: boolean;
  start: () => Promise<void>;
  pause: () => void;
  resume: () => void;
  stop: () => Promise<StopResult>;
  reset: () => void;
}

/** How long "recording" with literally no real sound detected yet counts
 *  as suspiciously silent (mic muted, wrong input device…). */
const SILENCE_WARNING_MS = 7000;
/** RMS level (0–1, from raw time-domain samples) below which the mic is
 *  considered silent — a conservative heuristic noise floor, not a precise
 *  VAD model. Real background noise varies, but a sustained drop below
 *  this is a reliable enough signal that the speaker has gone quiet. */
const SILENCE_RMS_THRESHOLD = 0.02;
/** A silence has to last at least this long mid-speech to count as
 *  "going blank" rather than a normal breath/punctuation pause. */
const BLANK_PAUSE_MIN_MS = 2200;
const AUDIO_MONITOR_INTERVAL_MS = 100;

/**
 * Records plain audio via MediaRecorder — no in-browser live
 * transcription. The resulting blob is sent to /api/transcribe afterwards
 * and transcribed server-side with an AI model, which is what makes this
 * work the same on every browser and device: the previous approach
 * depended on each browser's own SpeechRecognition engine, which doesn't
 * exist at all in Firefox and is unreliable on iOS even with every
 * permission granted. MediaRecorder + getUserMedia, by contrast, are
 * universally supported.
 *
 * Pause/silence detection still runs client-side in real time, straight
 * off the raw mic signal via the Web Audio API — entirely independent of
 * transcription, so it works identically regardless of how (or whether)
 * the recording ends up transcribed.
 */
export function useSpeechRecorder(): UseSpeechRecorderResult {
  const [status, setStatus] = useState<RecorderStatus>("idle");
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [error, setError] = useState<RecorderErrorCode | null>(null);
  const [isSilentTooLong, setIsSilentTooLong] = useState(false);
  // Feature detection is a stable browser fact, not reactive state — a lazy
  // initializer avoids the post-mount setState this used to require.
  const [isSupported] = useState(() => {
    if (typeof window === "undefined") return true; // resolved again on the client
    return Boolean(window.MediaRecorder && navigator.mediaDevices?.getUserMedia);
  });

  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const silenceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hasHeardSoundRef = useRef(false);

  const audioContextRef = useRef<AudioContext | null>(null);
  const audioMonitorTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const audioMonitorActiveRef = useRef(false);
  const pauseEventsRef = useRef<PauseEvent[]>([]);
  const pauseStartElapsedRef = useRef<number | null>(null);
  /** performance.now()-based clock so pause timing has sub-second
   *  precision — the `elapsedSeconds` state only ticks once a second,
   *  far too coarse for telling a 2s blank from a normal breath. */
  const monitorBaseElapsedRef = useRef(0);
  const monitorStartPerfRef = useRef(0);

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const clearSilenceTimer = useCallback(() => {
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }
  }, []);

  const currentMonitorElapsed = useCallback(() => {
    return (
      monitorBaseElapsedRef.current +
      (performance.now() - monitorStartPerfRef.current) / 1000
    );
  }, []);

  /** Closes out whatever silence is in progress, recording it as a pause
   *  event only if it was long enough — called both on every "sound
   *  resumed" tick and when monitoring stops, so a blank that's still
   *  going when the user hits Stop is still captured. */
  const flushPendingPause = useCallback((nowElapsed: number) => {
    const start = pauseStartElapsedRef.current;
    if (start === null) return;
    const duration = nowElapsed - start;
    if (duration * 1000 >= BLANK_PAUSE_MIN_MS && hasHeardSoundRef.current) {
      pauseEventsRef.current = [
        ...pauseEventsRef.current,
        { timestampSeconds: Math.round(start), durationSeconds: Math.round(duration * 10) / 10 },
      ];
    }
    pauseStartElapsedRef.current = null;
  }, []);

  const stopAudioMonitor = useCallback(() => {
    if (audioMonitorTimerRef.current) {
      clearInterval(audioMonitorTimerRef.current);
      audioMonitorTimerRef.current = null;
    }
    flushPendingPause(currentMonitorElapsed());
    audioContextRef.current?.close().catch(() => {});
    audioContextRef.current = null;
  }, [flushPendingPause, currentMonitorElapsed]);

  /** Measures real mic volume via the Web Audio API to detect long
   *  silences and to know whether the speaker has made any real sound at
   *  all. Never fabricated: if the API is unavailable/blocked, this just
   *  silently does nothing and pauses stays empty, same as any other
   *  "couldn't measure it for real" case elsewhere in the app. */
  const startAudioMonitor = useCallback(
    (stream: MediaStream, resumeFromElapsed: number) => {
      try {
        const AudioContextCtor = window.AudioContext ?? window.webkitAudioContext;
        if (!AudioContextCtor) return;
        const ctx = new AudioContextCtor();
        const source = ctx.createMediaStreamSource(stream);
        const analyser = ctx.createAnalyser();
        analyser.fftSize = 2048;
        source.connect(analyser);
        audioContextRef.current = ctx;
        audioMonitorActiveRef.current = true;

        monitorBaseElapsedRef.current = resumeFromElapsed;
        monitorStartPerfRef.current = performance.now();
        pauseStartElapsedRef.current = null;

        const data = new Uint8Array(analyser.fftSize);
        audioMonitorTimerRef.current = setInterval(() => {
          analyser.getByteTimeDomainData(data);
          let sumSquares = 0;
          for (let i = 0; i < data.length; i++) {
            const v = (data[i] - 128) / 128;
            sumSquares += v * v;
          }
          const rms = Math.sqrt(sumSquares / data.length);
          const now = currentMonitorElapsed();

          if (rms < SILENCE_RMS_THRESHOLD) {
            if (pauseStartElapsedRef.current === null) {
              pauseStartElapsedRef.current = now;
            }
          } else {
            flushPendingPause(now);
            if (!hasHeardSoundRef.current) {
              hasHeardSoundRef.current = true;
              setIsSilentTooLong(false);
              clearSilenceTimer();
            }
          }
        }, AUDIO_MONITOR_INTERVAL_MS);
      } catch {
        // Web Audio API unavailable or blocked — pause detection just
        // doesn't run; never invent pause data to fill the gap.
      }
    },
    [currentMonitorElapsed, flushPendingPause, clearSilenceTimer],
  );

  const armSilenceWarning = useCallback(() => {
    clearSilenceTimer();
    setIsSilentTooLong(false);
    silenceTimerRef.current = setTimeout(() => {
      if (!hasHeardSoundRef.current) setIsSilentTooLong(true);
    }, SILENCE_WARNING_MS);
  }, [clearSilenceTimer]);

  const startTimer = useCallback(() => {
    clearTimer();
    timerRef.current = setInterval(() => setElapsedSeconds((s) => s + 1), 1000);
  }, [clearTimer]);

  const releaseStream = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  }, []);

  const start = useCallback(async () => {
    setError(null);
    setIsSilentTooLong(false);
    chunksRef.current = [];
    hasHeardSoundRef.current = false;
    pauseEventsRef.current = [];
    audioMonitorActiveRef.current = false;
    setElapsedSeconds(0);
    setStatus("requesting");

    if (!isSupported) {
      setStatus("error");
      setError("not-supported");
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      // iOS Safari only records mp4/aac; Chromium-based browsers only
      // record webm/opus — neither supports the other, so pick whichever
      // the browser actually offers instead of hardcoding one.
      const mimeType = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
        ? "audio/webm;codecs=opus"
        : MediaRecorder.isTypeSupported("audio/mp4")
          ? "audio/mp4"
          : "";
      const recorder = mimeType
        ? new MediaRecorder(stream, { mimeType })
        : new MediaRecorder(stream);
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) chunksRef.current.push(event.data);
      };
      recorderRef.current = recorder;
      recorder.start();

      setStatus("recording");
      startTimer();
      armSilenceWarning();
      startAudioMonitor(stream, 0);
    } catch (e) {
      setStatus("error");
      setError(
        e instanceof DOMException && e.name === "NotAllowedError"
          ? "mic-denied"
          : "mic-unavailable",
      );
    }
  }, [isSupported, startTimer, armSilenceWarning, startAudioMonitor]);

  const pause = useCallback(() => {
    if (status !== "recording") return;
    recorderRef.current?.pause();
    clearTimer();
    clearSilenceTimer();
    stopAudioMonitor();
    setIsSilentTooLong(false);
    setStatus("paused");
  }, [status, clearTimer, clearSilenceTimer, stopAudioMonitor]);

  const resume = useCallback(() => {
    if (status !== "paused") return;
    recorderRef.current?.resume();
    startTimer();
    armSilenceWarning();
    if (streamRef.current) startAudioMonitor(streamRef.current, elapsedSeconds);
    setStatus("recording");
  }, [status, startTimer, armSilenceWarning, startAudioMonitor, elapsedSeconds]);

  const stop = useCallback((): Promise<StopResult> => {
    clearTimer();
    clearSilenceTimer();
    return new Promise((resolve) => {
      const recorder = recorderRef.current;
      stopAudioMonitor();
      const pauses = audioMonitorActiveRef.current ? pauseEventsRef.current : null;
      setIsSilentTooLong(false);

      if (!recorder || recorder.state === "inactive") {
        releaseStream();
        setStatus("stopped");
        resolve({ blob: null, pauses });
        return;
      }
      recorder.onstop = () => {
        const blob = chunksRef.current.length
          ? new Blob(chunksRef.current, { type: recorder.mimeType })
          : null;
        chunksRef.current = [];
        releaseStream();
        setStatus("stopped");
        resolve({ blob, pauses });
      };
      recorder.stop();
    });
  }, [clearTimer, clearSilenceTimer, stopAudioMonitor, releaseStream]);

  const reset = useCallback(() => {
    recorderRef.current = null;
    chunksRef.current = [];
    clearTimer();
    clearSilenceTimer();
    stopAudioMonitor();
    releaseStream();
    hasHeardSoundRef.current = false;
    pauseEventsRef.current = [];
    audioMonitorActiveRef.current = false;
    setIsSilentTooLong(false);
    setElapsedSeconds(0);
    setError(null);
    setStatus("idle");
  }, [clearTimer, clearSilenceTimer, stopAudioMonitor, releaseStream]);

  // Safety net: release the mic if the component unmounts mid-recording
  // (e.g. the user navigates away) instead of leaving it live.
  useEffect(() => {
    return () => {
      clearTimer();
      clearSilenceTimer();
      stopAudioMonitor();
      releaseStream();
    };
  }, [clearTimer, clearSilenceTimer, stopAudioMonitor, releaseStream]);

  return {
    status,
    elapsedSeconds,
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
