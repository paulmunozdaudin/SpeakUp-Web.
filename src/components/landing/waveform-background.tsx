"use client";

import { useEffect, useRef } from "react";

const BAR_COUNT = 64;
const BAR_GAP = 3;
/** How far (in px) the pointer's influence reaches before a bar stops
 *  reacting — keeps the effect feeling local, like nudging a mixer fader. */
const POINTER_RADIUS = 220;

function hexToRgb(hex: string): [number, number, number] {
  const clean = hex.replace("#", "").trim();
  const value = parseInt(clean, 16);
  return [(value >> 16) & 255, (value >> 8) & 255, value & 255];
}

/**
 * Decorative audio-waveform strip behind the hero — bars near the cursor
 * swell, echoing the product's own recording visualizer. Purely cosmetic
 * (aria-hidden, pointer-events-none) and self-contained in a canvas so it
 * never affects hero layout or text contrast.
 *
 * Respects prefers-reduced-motion: the ambient idle animation is skipped,
 * though bars still redraw on pointer move since that's a direct response
 * to user input rather than unprompted motion.
 */
export function WaveformBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    let width = 0;
    let height = 0;
    let rgb: [number, number, number] = [99, 102, 241];
    let pointer: { x: number; y: number } | null = null;
    let raf = 0;
    let t = 0;

    function readAccentColor() {
      const hex = getComputedStyle(document.documentElement)
        .getPropertyValue("--accent")
        .trim();
      if (hex) rgb = hexToRgb(hex);
    }

    function drawFrame() {
      ctx!.clearRect(0, 0, width, height);
      const barWidth = Math.max(1, width / BAR_COUNT - BAR_GAP);
      const midY = height / 2;
      const [r, g, b] = rgb;

      for (let i = 0; i < BAR_COUNT; i++) {
        const x = i * (barWidth + BAR_GAP);
        const idle = reduceMotion
          ? 0.5
          : Math.sin(t * 0.0018 + i * 0.35) * 0.5 + 0.5;

        let boost = 0;
        if (pointer) {
          const barCenterX = x + barWidth / 2;
          const dist = Math.abs(barCenterX - pointer.x);
          const influence = Math.max(0, 1 - dist / POINTER_RADIUS);
          boost = influence * influence;
        }

        const amplitude = (0.1 + idle * 0.16 + boost * 0.6) * height;
        const barHeight = Math.max(3, amplitude);
        const alpha = 0.08 + boost * 0.38;

        ctx!.fillStyle = `rgba(${r}, ${g}, ${b}, ${alpha})`;
        ctx!.fillRect(x, midY - barHeight / 2, barWidth, barHeight);
      }
    }

    function resize() {
      const rect = canvas!.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      canvas!.width = width * dpr;
      canvas!.height = height * dpr;
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
      drawFrame();
    }

    function handlePointerMove(e: PointerEvent) {
      const rect = canvas!.getBoundingClientRect();
      pointer = { x: e.clientX - rect.left, y: e.clientY - rect.top };
      if (reduceMotion) drawFrame();
    }

    function handlePointerLeave() {
      pointer = null;
      if (reduceMotion) drawFrame();
    }

    readAccentColor();
    resize();

    window.addEventListener("resize", resize);
    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerleave", handlePointerLeave);

    // Dark/light toggling flips the `.dark` class on <html>, which changes
    // --accent — re-read it so the waveform matches the active theme.
    const themeObserver = new MutationObserver(() => {
      readAccentColor();
      if (reduceMotion) drawFrame();
    });
    themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    function loop() {
      t += 16;
      drawFrame();
      raf = requestAnimationFrame(loop);
    }
    if (!reduceMotion) {
      raf = requestAnimationFrame(loop);
    }

    return () => {
      cancelAnimationFrame(raf);
      themeObserver.disconnect();
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerleave", handlePointerLeave);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className="pointer-events-none absolute inset-x-0 top-0 block h-[520px] w-full"
    />
  );
}
