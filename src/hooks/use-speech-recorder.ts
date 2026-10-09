"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { SpeechLanguage } from "@/types";
import { isIOS } from "@/utils/platform";

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
  | "network-error"
  /** Brave ships the SpeechRecognition constructor (so isSupported is
   *  true) but blocks the Google speech service it depends on by default
   *  — for privacy, since that service would otherwise send audio to
   *  Google. It always fails with a "network" error immediately, even
   *  with a perfectly good connection, so this gets its own error code
   *  instead of the generic "check your internet" message. */
  | "network-error-brave";

export interface PauseEvent {
  /** Seconds into the recording when the silence started. */
  timestampSeconds: number;
  durationSeconds: number;
}

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
  /** Long mid-speech silences ("going blank"), measured from the real mic
   *  signal. `null` until `stop()` finalizes the list, and stays `null`
   *  (not `[]`) if the browser couldn't monitor audio for real. */
  pauses: PauseEvent[] | null;
  /** False when there's no live in-browser transcription for this take
   *  (unsupported browser, iOS, or the speech service failed mid-way) —
   *  the recorded audio is then transcribed server-side after Stop. */
  liveActive: boolean;
  /** The recorded audio, once `status` is "stopped" (null if the browser
   *  couldn't record it). */
  getAudioBlob: () => Blob | null;
  start: () => Promise<void>;
  pause: () => void;
  resume: () => void;
  stop: () => void;
  reset: () => void;
}

const BCP47: Record<SpeechLanguage, string> = {
  es: "es-ES",
  en: "en-US",
  fr: "fr-FR",
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
/** RMS level (0–1, from raw time-domain samples) below which the mic is
 *  considered silent — a conservative heuristic noise floor, not a precise
 *  VAD model. Real background noise varies, but a sustained drop below
 *  this is a reliable enough signal that the speaker has gone quiet. */
const SILENCE_RMS_THRESHOLD = 0.02;
/** A silence has to last at least this long mid-speech to count as
 *  "going blank" rather than a normal breath/punctuation pause. */
const BLANK_PAUSE_MIN_MS = 2200;
const AUDIO_MONITOR_INTERVAL_MS = 100;
/** Low bitrate on purpose: plenty for speech recognition, and keeps a
 *  10-minute take (~2.4 MB) under Vercel's ~4.5 MB request body limit. */
const AUDIO_BITS_PER_SECOND = 32_000;

function pickAudioMimeType(): string | undefined {
  const candidates = ["audio/webm;codecs=opus", "audio/mp4", "audio/ogg;codecs=opus", "audio/webm"];
  return candidates.find((type) => MediaRecorder.isTypeSupported?.(type));
}

/**
 * Records the microphone two ways at once:
 *  - the raw audio, via MediaRecorder (works in every modern browser),
 *    which is transcribed server-side after Stop — the reliable source;
 *  - a live transcript via the browser's SpeechRecognition API (Chrome,
 *    Edge, Android) for on-screen feedback while speaking, and as the
 *    fallback if server transcription fails.
 *
 * When live recognition isn't available (Firefox, in-app browsers), is
 * unreliable (iOS), or its speech service fails mid-take (network, Brave,
 * denied speech permission), recording simply continues audio-only instead
 * of erroring out. Only a genuine microphone failure stops the take.
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
  const [liveSupported] = useState(() => {
    if (typeof window === "undefined") return true; // resolved again on the client
    return Boolean(window.SpeechRecognition ?? window.webkitSpeechRecognition);
  });
  const [canRecordAudio] = useState(() => {
    if (typeof window === "undefined") return true;
    return Boolean(window.MediaRecorder && navigator.mediaDevices?.getUserMedia);
  });
  const isSupported = liveSupported || canRecordAudio;
  const [liveActive, setLiveActive] = useState(true);
  const liveActiveRef = useRef(true);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioBlobRef = useRef<Blob | null>(null);
  const stoppingRef = useRef(false);

  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const finalChunksRef = useRef<string[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const restartTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const silenceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const shouldRunRef = useRef(false);
  const streamRef = useRef<MediaStream | null>(null);
  const consecutiveFailuresRef = useRef(0);
  const hasCapturedAnyWordsRef = useRef(false);
  const isBraveRef = useRef(false);

  // null = never measured this session (API unavailable/blocked); an array
  // (possibly empty) = the mic was genuinely monitored for real silences.
  // Collapsing these would mean claiming "no blanks" when we simply
  // couldn't check — exactly the fabrication this app avoids elsewhere.
  const [pauses, setPauses] = useState<PauseEvent[] | null>(null);
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

  useEffect(() => {
    navigator.brave
      ?.isBrave()
      .then((isBrave) => {
        isBraveRef.current = isBrave;
      })
      .catch(() => {});
  }, []);

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
    if (duration * 1000 >= BLANK_PAUSE_MIN_MS && hasCapturedAnyWordsRef.current) {
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

  /** Measures real mic volume via the Web Audio API to detect long silences
   *  — entirely separate from SpeechRecognition, which has no concept of
   *  "how quiet was it", only "did it recognize words". Never fabricated:
   *  if the API is unavailable/blocked, this just silently does nothing
   *  and `pauses` stays empty, same as any other "couldn't measure it for
   *  real" case elsewhere in the app. */
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
            // Without a live transcript, real sound on the mic is the only
            // signal that the speaker has started — it arms pause tracking
            // and clears the "still listening" warning.
            if (!liveActiveRef.current && !hasCapturedAnyWordsRef.current) {
              hasCapturedAnyWordsRef.current = true;
              setIsSilentTooLong(false);
            }
            flushPendingPause(now);
          }
        }, AUDIO_MONITOR_INTERVAL_MS);
      } catch {
        // Web Audio API unavailable or blocked — pause detection just
        // doesn't run; never invent pause data to fill the gap.
      }
    },
    [currentMonitorElapsed, flushPendingPause],
  );

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

  /** Live recognition is gone for this take, but the audio is still being
   *  recorded — keep going audio-only and transcribe server-side later. */
  const switchToAudioOnly = useCallback(() => {
    shouldRunRef.current = false;
    clearRestartTimer();
    const recognition = recognitionRef.current;
    recognitionRef.current = null;
    if (recognition) {
      recognition.onend = null;
      recognition.onerror = null;
      try {
        recognition.stop();
      } catch {
        // Already stopped.
      }
    }
    liveActiveRef.current = false;
    setLiveActive(false);
    setInterimTranscript("");
  }, [clearRestartTimer]);

  /** Gives up on live recognition. Falls back to audio-only recording
   *  whenever the audio is still being recorded — the mic demonstrably works
   *  then, whatever the speech engine claims; otherwise stops and surfaces
   *  a real error. */
  const failPermanently = useCallback((code: RecorderErrorCode) => {
    const recorder = mediaRecorderRef.current;
    if (recorder && recorder.state !== "inactive") {
      switchToAudioOnly();
      return;
    }
    shouldRunRef.current = false;
    clearTimer();
    clearRestartTimer();
    clearSilenceTimer();
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setStatus("error");
    // Brave always fails the speech service with "network", regardless of
    // actual connectivity — swap in the Brave-specific message instead of
    // telling someone with a fine connection to go check it.
    setError(code === "network-error" && isBraveRef.current ? "network-error-brave" : code);
  }, [clearTimer, clearRestartTimer, clearSilenceTimer, switchToAudioOnly]);

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

  const startAudioRecording = useCallback((stream: MediaStream): boolean => {
    if (!canRecordAudio) return false;
    try {
      const mimeType = pickAudioMimeType();
      const recorder = new MediaRecorder(stream, {
        ...(mimeType ? { mimeType } : {}),
        audioBitsPerSecond: AUDIO_BITS_PER_SECOND,
      });
      audioChunksRef.current = [];
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) audioChunksRef.current.push(event.data);
      };
      recorder.start(1000);
      mediaRecorderRef.current = recorder;
      return true;
    } catch {
      mediaRecorderRef.current = null;
      return false;
    }
  }, [canRecordAudio]);

  const start = useCallback(async () => {
    setError(null);
    setTranscript("");
    setInterimTranscript("");
    setIsSilentTooLong(false);
    finalChunksRef.current = [];
    consecutiveFailuresRef.current = 0;
    hasCapturedAnyWordsRef.current = false;
    pauseEventsRef.current = [];
    audioMonitorActiveRef.current = false;
    audioBlobRef.current = null;
    stoppingRef.current = false;
    setPauses(null);
    setElapsedSeconds(0);
    setStatus("requesting");

    if (!isSupported) {
      setStatus("error");
      setError("not-supported");
      return;
    }

    let stream: MediaStream;
    try {
      // Explicit permission prompt up front, and keep the stream so we can
      // show a real "mic is live" state and release it cleanly on stop.
      stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch (e) {
      setStatus("error");
      setError(
        e instanceof DOMException && e.name === "NotAllowedError"
          ? "mic-denied"
          : "mic-unavailable",
      );
      return;
    }
    streamRef.current = stream;
    const recordingAudio = startAudioRecording(stream);

    // iOS's speech engine is unreliable and can fight MediaRecorder for the
    // mic, so iPhones/iPads go audio-only from the start.
    const recognition = !isIOS() || !recordingAudio ? buildRecognition() : null;
    let live = false;
    if (recognition) {
      try {
        recognitionRef.current = recognition;
        shouldRunRef.current = true;
        recognition.start();
        live = true;
      } catch {
        recognitionRef.current = null;
        shouldRunRef.current = false;
      }
    }

    if (!live && !recordingAudio) {
      setStatus("error");
      setError("not-supported");
      stream.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
      return;
    }

    liveActiveRef.current = live;
    setLiveActive(live);
    setStatus("recording");
    startTimer();
    armSilenceWarning();
    startAudioMonitor(stream, 0);
  }, [buildRecognition, isSupported, startAudioRecording, startTimer, armSilenceWarning, startAudioMonitor]);

  const pause = useCallback(() => {
    if (status !== "recording") return;
    shouldRunRef.current = false;
    clearRestartTimer();
    clearSilenceTimer();
    recognitionRef.current?.stop();
    if (mediaRecorderRef.current?.state === "recording") mediaRecorderRef.current.pause();
    clearTimer();
    stopAudioMonitor();
    setInterimTranscript("");
    setIsSilentTooLong(false);
    setStatus("paused");
  }, [status, clearTimer, clearRestartTimer, clearSilenceTimer, stopAudioMonitor]);

  const resume = useCallback(() => {
    if (status !== "paused") return;
    if (mediaRecorderRef.current?.state === "paused") mediaRecorderRef.current.resume();
    if (liveActiveRef.current) {
      const recognition = buildRecognition();
      if (!recognition) {
        failPermanently("not-supported");
      } else {
        try {
          recognitionRef.current = recognition;
          shouldRunRef.current = true;
          consecutiveFailuresRef.current = 0;
          recognition.start();
        } catch {
          failPermanently("network-error");
        }
      }
    }
    if (!mediaRecorderRef.current && !liveActiveRef.current) return;
    startTimer();
    armSilenceWarning();
    if (streamRef.current) startAudioMonitor(streamRef.current, elapsedSeconds);
    setStatus("recording");
  }, [
    status,
    buildRecognition,
    startTimer,
    armSilenceWarning,
    failPermanently,
    startAudioMonitor,
    elapsedSeconds,
  ]);

  const releaseStream = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  }, []);

  /** Stops MediaRecorder without keeping its audio (reset/unmount). */
  const discardAudioRecording = useCallback(() => {
    const recorder = mediaRecorderRef.current;
    mediaRecorderRef.current = null;
    audioChunksRef.current = [];
    audioBlobRef.current = null;
    if (recorder && recorder.state !== "inactive") {
      recorder.onstop = null;
      recorder.ondataavailable = null;
      try {
        recorder.stop();
      } catch {
        // Already stopped.
      }
    }
  }, []);

  const stop = useCallback(() => {
    if (stoppingRef.current) return;
    stoppingRef.current = true;
    shouldRunRef.current = false;
    clearRestartTimer();
    clearSilenceTimer();
    recognitionRef.current?.stop();
    clearTimer();
    stopAudioMonitor();
    setPauses(audioMonitorActiveRef.current ? pauseEventsRef.current : null);
    setInterimTranscript("");
    setIsSilentTooLong(false);

    const recorder = mediaRecorderRef.current;
    const finish = () => {
      releaseStream();
      setStatus("stopped");
    };
    if (!recorder || recorder.state === "inactive") {
      finish();
      return;
    }
    // "stopped" is only reported once the final audio chunk has landed, so
    // the caller always gets the complete recording from getAudioBlob().
    recorder.onstop = () => {
      const chunks = audioChunksRef.current;
      audioBlobRef.current = chunks.length
        ? new Blob(chunks, { type: recorder.mimeType || chunks[0].type })
        : null;
      finish();
    };
    try {
      recorder.stop();
    } catch {
      finish();
    }
  }, [clearTimer, clearRestartTimer, clearSilenceTimer, stopAudioMonitor, releaseStream]);

  const getAudioBlob = useCallback(() => audioBlobRef.current, []);

  const reset = useCallback(() => {
    shouldRunRef.current = false;
    clearRestartTimer();
    clearSilenceTimer();
    recognitionRef.current?.stop();
    recognitionRef.current = null;
    clearTimer();
    stopAudioMonitor();
    discardAudioRecording();
    releaseStream();
    stoppingRef.current = false;
    liveActiveRef.current = true;
    setLiveActive(true);
    finalChunksRef.current = [];
    consecutiveFailuresRef.current = 0;
    hasCapturedAnyWordsRef.current = false;
    pauseEventsRef.current = [];
    audioMonitorActiveRef.current = false;
    setPauses(null);
    setTranscript("");
    setInterimTranscript("");
    setIsSilentTooLong(false);
    setElapsedSeconds(0);
    setError(null);
    setStatus("idle");
  }, [clearTimer, clearRestartTimer, clearSilenceTimer, stopAudioMonitor, discardAudioRecording, releaseStream]);

  useEffect(() => {
    return () => {
      shouldRunRef.current = false;
      clearRestartTimer();
      clearSilenceTimer();
      recognitionRef.current?.stop();
      clearTimer();
      stopAudioMonitor();
      discardAudioRecording();
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, [clearTimer, clearRestartTimer, clearSilenceTimer, stopAudioMonitor, discardAudioRecording]);

  return {
    status,
    elapsedSeconds,
    transcript,
    interimTranscript,
    error,
    isSupported,
    isSilentTooLong,
    pauses,
    liveActive,
    getAudioBlob,
    start,
    pause,
    resume,
    stop,
    reset,
  };
}
