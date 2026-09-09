import { useId } from "react";

/**
 * Eloq AI brand mark: a voice waveform, in the brand's indigo→violet
 * gradient. useId() keeps the gradient id collision-free when the icon
 * renders more than once on a page (e.g. desktop sidebar + mobile top bar).
 */
export function WaveIcon({ className }: { className?: string }) {
  const gradientId = `eloq-wave-${useId()}`;
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden>
      <defs>
        <linearGradient
          id={gradientId}
          x1="2.5"
          y1="7"
          x2="21.5"
          y2="19"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0" stopColor="#8b7cf6" />
          <stop offset="1" stopColor="#4f46e5" />
        </linearGradient>
      </defs>
      <path
        d="M2.5,13 C4.2,6.5 7.3,6.5 9,13 C10.7,19.5 13.8,19.5 15.5,13 C17.2,6.5 20.3,6.5 21.5,13"
        stroke={`url(#${gradientId})`}
        strokeWidth="2.3"
        strokeLinecap="round"
      />
    </svg>
  );
}
