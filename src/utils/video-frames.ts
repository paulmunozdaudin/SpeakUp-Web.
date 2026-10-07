"use client";

export interface CapturedFrame {
  timestampSeconds: number;
  /** JPEG data URL, already downscaled — small enough to send a handful of
   *  these to the vision model without ever uploading the actual video. */
  dataUrl: string;
}

// Sized for gpt-4o at "high" detail (see openai-provider.ts) — sharp
// enough to actually make out posture/gestures, not just a silhouette.
const FRAME_WIDTH = 768;
const JPEG_QUALITY = 0.8;
const MIN_FRAMES = 3;
const MAX_FRAMES = 14;
/** Roughly one sample every 12s of footage, clamped to [MIN_FRAMES, MAX_FRAMES]
 *  so a 3-minute take gets dense-enough coverage to track how presence
 *  changes over the talk, and a 30s one still gets a few distinct moments. */
const TARGET_SECONDS_PER_FRAME = 12;

/** Bounds how long a single seek/metadata wait can take — without this, a
 *  browser that never fires the expected event (corrupted blob, odd codec
 *  edge case) would hang extractSampledFrames forever, leaving the
 *  "Analyzing…" screen stuck. Callers already treat a rejection here as
 *  "skip video analysis, keep the voice feedback" — never a fabricated
 *  result — so timing out is safe. */
const EVENT_TIMEOUT_MS = 8000;

/**
 * Chromium-based browsers (Chrome/Edge — exactly what this app targets)
 * report `duration` as Infinity for a <video> loaded from a MediaRecorder
 * blob, because the WebM muxer can't write the Cues/Duration element while
 * still recording. The documented workaround is to seek past the end once:
 * the browser then back-fills the real duration and fires "timeupdate".
 * Without this, every voice+camera take would silently sample zero frames
 * on Chrome/Edge.
 */
async function resolveDuration(video: HTMLVideoElement): Promise<number> {
  if (Number.isFinite(video.duration) && video.duration > 0) return video.duration;

  video.currentTime = Number.MAX_SAFE_INTEGER;
  await waitForEvent(video, "timeupdate").catch(() => undefined);
  video.currentTime = 0;
  await waitForEvent(video, "seeked").catch(() => undefined);

  return Number.isFinite(video.duration) && video.duration > 0 ? video.duration : 0;
}

function waitForEvent(target: HTMLVideoElement, event: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const onEvent = () => {
      cleanup();
      resolve();
    };
    const onError = () => {
      cleanup();
      reject(new Error(`video element error while waiting for "${event}"`));
    };
    const timer = setTimeout(() => {
      cleanup();
      reject(new Error(`Timed out waiting for "${event}"`));
    }, EVENT_TIMEOUT_MS);
    const cleanup = () => {
      clearTimeout(timer);
      target.removeEventListener(event, onEvent);
      target.removeEventListener("error", onError);
    };
    target.addEventListener(event, onEvent, { once: true });
    target.addEventListener("error", onError, { once: true });
  });
}

/**
 * Samples N representative frames out of a recorded video blob — entirely
 * in the browser, via an offscreen <video> + <canvas>. The source blob is
 * never uploaded anywhere; only these small downscaled JPEGs leave the
 * device (as part of the analyze request), and the object URL created here
 * is revoked before this function returns.
 */
export async function extractSampledFrames(blob: Blob): Promise<CapturedFrame[]> {
  const url = URL.createObjectURL(blob);
  const video = document.createElement("video");
  video.muted = true;
  video.playsInline = true;
  video.preload = "auto";
  video.src = url;

  try {
    await waitForEvent(video, "loadedmetadata");
    const duration = await resolveDuration(video);
    if (duration <= 0) return [];

    const frameCount = Math.max(
      MIN_FRAMES,
      Math.min(MAX_FRAMES, Math.round(duration / TARGET_SECONDS_PER_FRAME)),
    );

    // Evenly spaced, skipping the very first/last ~5% (often a blank frame
    // or a mid-blink moment right as recording starts/stops).
    const margin = duration * 0.05;
    const usableSpan = Math.max(0, duration - margin * 2);
    const timestamps = Array.from({ length: frameCount }, (_, i) =>
      frameCount === 1
        ? duration / 2
        : margin + (usableSpan * i) / (frameCount - 1),
    );

    const canvas = document.createElement("canvas");
    const aspect = video.videoWidth > 0 ? video.videoHeight / video.videoWidth : 9 / 16;
    canvas.width = FRAME_WIDTH;
    canvas.height = Math.round(FRAME_WIDTH * aspect);
    const ctx = canvas.getContext("2d");
    if (!ctx) return [];

    const frames: CapturedFrame[] = [];
    for (const timestampSeconds of timestamps) {
      // Frames must be seeked sequentially — one shared <video> element.
      video.currentTime = timestampSeconds;
      await waitForEvent(video, "seeked");
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      frames.push({
        timestampSeconds: Math.round(timestampSeconds),
        dataUrl: canvas.toDataURL("image/jpeg", JPEG_QUALITY),
      });
    }
    return frames;
  } finally {
    video.src = "";
    URL.revokeObjectURL(url);
  }
}
