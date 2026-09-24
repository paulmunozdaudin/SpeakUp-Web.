"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export type VideoRecorderStatus =
  | "idle"
  | "requesting"
  | "recording"
  | "stopped"
  | "error";

export type VideoRecorderErrorCode =
  | "camera-denied"
  | "camera-unavailable"
  | "not-supported";

interface UseVideoRecorderResult {
  status: VideoRecorderStatus;
  /** The live camera stream — hand this to a <video> element's srcObject
   *  for the self-preview. Only set while recording. */
  stream: MediaStream | null;
  error: VideoRecorderErrorCode | null;
  isSupported: boolean;
  start: () => Promise<void>;
  /** Stops capture and resolves with the recorded video blob (or null if
   *  nothing was captured). Never uploads or persists it — callers are
   *  expected to extract frames and then let the blob go. */
  stop: () => Promise<Blob | null>;
  reset: () => void;
}

/**
 * Camera-only capture for the "voice + camera" analysis mode. Deliberately
 * separate from useSpeechRecorder (which keeps handling the live
 * transcript via the Web Speech API through its own mic access) — this
 * hook only ever touches the camera, so a denied/unavailable camera never
 * breaks transcription, and vice versa.
 */
export function useVideoRecorder(): UseVideoRecorderResult {
  const [status, setStatus] = useState<VideoRecorderStatus>("idle");
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<VideoRecorderErrorCode | null>(null);
  const [isSupported] = useState(() => {
    if (typeof window === "undefined") return true;
    return Boolean(window.MediaRecorder && navigator.mediaDevices?.getUserMedia);
  });

  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);

  const releaseStream = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setStream(null);
  }, []);

  const start = useCallback(async () => {
    setError(null);
    chunksRef.current = [];
    setStatus("requesting");

    if (!isSupported) {
      setStatus("error");
      setError("not-supported");
      return;
    }

    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user" },
      });
      streamRef.current = mediaStream;
      setStream(mediaStream);

      const recorder = new MediaRecorder(mediaStream, {
        mimeType: MediaRecorder.isTypeSupported("video/webm;codecs=vp9")
          ? "video/webm;codecs=vp9"
          : "video/webm",
      });
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) chunksRef.current.push(event.data);
      };
      recorderRef.current = recorder;
      recorder.start();
      setStatus("recording");
    } catch (e) {
      setStatus("error");
      setError(
        e instanceof DOMException && e.name === "NotAllowedError"
          ? "camera-denied"
          : "camera-unavailable",
      );
    }
  }, [isSupported]);

  const stop = useCallback((): Promise<Blob | null> => {
    return new Promise((resolve) => {
      const recorder = recorderRef.current;
      if (!recorder || recorder.state === "inactive") {
        releaseStream();
        setStatus("stopped");
        resolve(null);
        return;
      }
      recorder.onstop = () => {
        const blob = chunksRef.current.length
          ? new Blob(chunksRef.current, { type: recorder.mimeType })
          : null;
        chunksRef.current = [];
        releaseStream();
        setStatus("stopped");
        resolve(blob);
      };
      recorder.stop();
    });
  }, [releaseStream]);

  // Safety net: release the camera if the component unmounts mid-recording
  // (e.g. the user navigates away) instead of leaving it live.
  useEffect(() => {
    return () => {
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  const reset = useCallback(() => {
    recorderRef.current = null;
    chunksRef.current = [];
    releaseStream();
    setError(null);
    setStatus("idle");
  }, [releaseStream]);

  return { status, stream, error, isSupported, start, stop, reset };
}
