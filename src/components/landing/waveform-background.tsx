"use client";

import { useEffect, useRef } from "react";

const TICK_COUNT = 48;
const BASE_RADIUS = 70;
const TICK_LENGTH_MIN = 6;
const TICK_LENGTH_MAX = 34;
/** Lower = the glow trails the cursor more, like it has a bit of inertia
 *  instead of teleporting straight to the pointer every frame. */
const FOLLOW_EASE = 0.12;
const FADE_EASE = 0.08;

function hexToRgb(hex: string): [number, number, number] {
  const clean = hex.replace("#", "").trim();
  const value = parseInt(clean, 16);
  return [(value >> 16) & 255, (value >> 8) & 255, value & 255];
}

/**
 * Decorative glow that follows the cursor across the hero — a soft radial
 * light with a ring of waveform ticks pulsing around it, like a circular
 * audio visualizer. Purely cosmetic (aria-hidden, pointer-events-none);
 * invisible until the pointer first moves over the hero, and fades out
 * again when it leaves, since there's nothing to follow otherwise.
 *
 * Desktop/tablet only (hidden below the `sm` breakpoint, and the effect
 * itself doesn't run there — no cursor to track on touch devices anyway).
 * Under prefers-reduced-motion the glow still follows the pointer (direct
 * response to input) but skips the idle tick-pulsing animation.
 */
export function WaveformBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    if (!window.matchMedia("(min-width: 640px)").matches) return;

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    let width = 0;
    let height = 0;
    let rgb: [number, number, number] = [99, 102, 241];
    let target: { x: number; y: number } | null = null;
    let current = { x: 0, y: 0 };
    let visible = 0;
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
      if (visible <= 0.01) return;

      const [r, g, b] = rgb;
      const { x, y } = current;

      const glow = ctx!.createRadialGradient(
        x,
        y,
        0,
        x,
        y,
        BASE_RADIUS * 2.4,
      );
      glow.addColorStop(0, `rgba(${r}, ${g}, ${b}, ${0.16 * visible})`);
      glow.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0)`);
      ctx!.fillStyle = glow;
      ctx!.fillRect(
        x - BASE_RADIUS * 2.4,
        y - BASE_RADIUS * 2.4,
        BASE_RADIUS * 4.8,
        BASE_RADIUS * 4.8,
      );

      for (let i = 0; i < TICK_COUNT; i++) {
        const angle = (i / TICK_COUNT) * Math.PI * 2;
        const wobble = reduceMotion
          ? 0.5
          : Math.sin(t * 0.0022 + i * 0.6) * 0.5 + 0.5;
        const len = TICK_LENGTH_MIN + wobble * (TICK_LENGTH_MAX - TICK_LENGTH_MIN);
        const innerR = BASE_RADIUS;
        const outerR = BASE_RADIUS + len;

        ctx!.strokeStyle = `rgba(${r}, ${g}, ${b}, ${(0.12 + wobble * 0.3) * visible})`;
        ctx!.lineWidth = 2.5;
        ctx!.lineCap = "round";
        ctx!.beginPath();
        ctx!.moveTo(x + Math.cos(angle) * innerR, y + Math.sin(angle) * innerR);
        ctx!.lineTo(x + Math.cos(angle) * outerR, y + Math.sin(angle) * outerR);
        ctx!.stroke();
      }
    }

    function resize() {
      const rect = canvas!.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      canvas!.width = width * dpr;
      canvas!.height = height * dpr;
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
      if (!target) current = { x: width / 2, y: height * 0.38 };
      drawFrame();
    }

    function handlePointerMove(e: PointerEvent) {
      const rect = canvas!.getBoundingClientRect();
      target = { x: e.clientX - rect.left, y: e.clientY - rect.top };
      if (reduceMotion) {
        current = target;
        visible = 1;
        drawFrame();
      }
    }

    function handlePointerLeave() {
      target = null;
      if (reduceMotion) {
        visible = 0;
        drawFrame();
      }
    }

    readAccentColor();
    resize();

    window.addEventListener("resize", resize);
    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerleave", handlePointerLeave);

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
      if (target) {
        current.x += (target.x - current.x) * FOLLOW_EASE;
        current.y += (target.y - current.y) * FOLLOW_EASE;
        visible += (1 - visible) * FADE_EASE;
      } else {
        visible += (0 - visible) * FADE_EASE;
      }
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
      className="pointer-events-none absolute inset-x-0 top-0 hidden h-[520px] w-full sm:block"
    />
  );
}
