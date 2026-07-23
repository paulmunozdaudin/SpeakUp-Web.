/**
 * Eloq AI brand mark: a torch in two colors, matching the brand reference —
 * the flame is always the indigo gradient (brand-constant, never themed),
 * the cup and column use currentColor so they adapt to the badge they sit
 * on (white on the dark navy badge, dark on a light badge).
 */
export function TorchIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <defs>
        <linearGradient
          id="eloq-torch-flame"
          x1="8.7"
          y1="2"
          x2="15.3"
          y2="12"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0" stopColor="#8b7cf6" />
          <stop offset="1" stopColor="#4f46e5" />
        </linearGradient>
      </defs>
      <path
        fill="url(#eloq-torch-flame)"
        d="M12 2C10.2 4.3 8.7 6.4 8.7 8.6c0 2.3 1.4 3.4 3.3 3.4s3.3-1.1 3.3-3.4c0-1.4-.7-2.6-1.6-3.7-.1 1.1-.6 1.9-1.3 2.6.1-1.4.1-3.2-.4-5.5Z"
      />
      <path fill="currentColor" d="M9.3 12h5.4l-1.1 2h-3.2Z" />
      <path fill="currentColor" d="M10.4 14h3.2v5.5L12 21.5l-1.6-2Z" />
    </svg>
  );
}
