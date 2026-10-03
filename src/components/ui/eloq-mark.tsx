/**
 * Eloq AI brand mark: a dense target/pulse ring icon — a voice signal
 * radiating outward, captured and analyzed. White rings on a near-black
 * badge with a brand-purple core, for strong contrast in both themes.
 */
export function EloqMark({ className }: { className?: string }) {
  return (
    <svg aria-hidden viewBox="0 0 24 24" fill="none" className={className}>
      <circle cx="12" cy="12" r="10.5" stroke="#ffffff" strokeOpacity="0.85" strokeWidth="1.1" />
      <circle cx="12" cy="12" r="8" stroke="#ffffff" strokeOpacity="0.85" strokeWidth="1.1" />
      <circle cx="12" cy="12" r="5.3" stroke="#ffffff" strokeOpacity="0.85" strokeWidth="1.1" />
      <circle cx="12" cy="12" r="2.6" stroke="#a996fb" strokeWidth="1.3" />
      <circle cx="12" cy="12" r="1" fill="#a996fb" />
    </svg>
  );
}
