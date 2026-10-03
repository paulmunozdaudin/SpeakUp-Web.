/**
 * Eloq AI brand mark: a pulse/signal icon — concentric rings around a dot,
 * representing a voice being picked up and analyzed in real time. Pure
 * vector (currentColor strokes/fill) so it stays crisp at any size and
 * matches whatever text color wraps it.
 */
export function EloqMark({ className }: { className?: string }) {
  return (
    <svg aria-hidden viewBox="0 0 24 24" fill="none" className={className}>
      <circle cx="12" cy="12" r="7.3" stroke="currentColor" strokeOpacity="0.4" strokeWidth="1.3" />
      <circle cx="12" cy="12" r="4.6" stroke="currentColor" strokeOpacity="0.85" strokeWidth="1.3" />
      <circle cx="12" cy="12" r="2.3" fill="currentColor" />
    </svg>
  );
}
