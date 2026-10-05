"use client";

import { useEffect, useRef } from "react";

const BAR_COUNT = 64;
const BAR_GAP = 3;

function hexToRgb(hex: string): [number, number, number] {
  const clean = hex.replace("#", "").trim();
  const value = parseInt(clean, 16);
  return [(value >> 16) & 255, (value >> 8) & 255, value & 255];
}

/**
 * Decorative audio-waveform strip behind the hero. A static pattern (each
 * bar's height is a fixed function of its index, not of time or pointer
 * position) — purely cosmetic (aria-hidden, pointer-events-none) and
 * self-contained in a canvas so it never affects hero layout or text
 * contrast.
 */
export function WaveformBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    let width = 0;
    let height = 0;
    let rgb: [number, number, number] = [99, 102, 241];

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
        const shape = Math.sin(i * 0.35) * 0.5 + 0.5;

        const amplitude = (0.1 + shape * 0.16) * height;
        const barHeight = Math.max(3, amplitude);

        ctx!.fillStyle = `rgba(${r}, ${g}, ${b}, 0.08)`;
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

    readAccentColor();
    resize();

    window.addEventListener("resize", resize);

    // Dark/light toggling flips the `.dark` class on <html>, which changes
    // --accent — re-read it so the waveform matches the active theme.
    const themeObserver = new MutationObserver(() => {
      readAccentColor();
      drawFrame();
    });
    themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => {
      themeObserver.disconnect();
      window.removeEventListener("resize", resize);
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
