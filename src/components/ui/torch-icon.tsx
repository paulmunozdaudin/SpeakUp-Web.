"use client";

import { useId } from "react";

/**
 * Eloq AI brand mark: a torch in two colors, matching the brand reference —
 * the flame is always the indigo gradient (brand-constant, never themed),
 * the cup and column use currentColor so they adapt to the badge they sit
 * on (white on the dark navy badge, dark on a light badge).
 *
 * Flame treatment: "Núcleo Blanco" — a soft blurred aura behind a fuller,
 * rounder flame with an almost-white hot core, instead of a single flat
 * gradient shape. IDs are per-instance (useId) since the navbar and footer
 * both render this on the same page.
 */
export function TorchIcon({ className }: { className?: string }) {
  const uid = useId();
  const gradientId = `eloq-torch-flame-${uid}`;
  const glowId = `eloq-torch-glow-${uid}`;
  const coreId = `eloq-torch-core-${uid}`;

  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <defs>
        <linearGradient
          id={gradientId}
          x1="8.3"
          y1="1.7"
          x2="15.7"
          y2="12.6"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0" stopColor="#a89bff" />
          <stop offset="1" stopColor="#4f46e5" />
        </linearGradient>
        <radialGradient id={coreId} cx="50%" cy="38%" r="55%">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="1" stopColor="#d9d4ff" stopOpacity="0" />
        </radialGradient>
        <filter id={glowId} x="-80%" y="-80%" width="260%" height="260%">
          <feGaussianBlur stdDeviation="1.4" />
        </filter>
      </defs>
      <path
        filter={`url(#${glowId})`}
        opacity="0.55"
        fill="#8b7cf6"
        d="M12 1.7c-2.1 2.6-3.7 4.9-3.7 7.1 0 2.5 1.5 3.9 3.7 3.9s3.7-1.4 3.7-3.9c0-2.2-1.6-4.5-3.7-7.1Z"
      />
      <path
        fill={`url(#${gradientId})`}
        d="M12 1.7c-2.1 2.6-3.7 4.9-3.7 7.1 0 2.5 1.5 3.9 3.7 3.9s3.7-1.4 3.7-3.9c0-2.2-1.6-4.5-3.7-7.1Z"
      />
      <path
        fill={`url(#${coreId})`}
        d="M12 4c-1.2 1.8-2.1 3.4-2.1 4.9 0 1.5.9 2.3 2.1 2.3s2.1-.8 2.1-2.3c0-1.5-.9-3.1-2.1-4.9Z"
      />
      <path fill="currentColor" d="M9.3 12h5.4l-1.1 2h-3.2Z" />
      <path fill="currentColor" d="M10.4 14h3.2v5.5L12 21.5l-1.6-2Z" />
    </svg>
  );
}
