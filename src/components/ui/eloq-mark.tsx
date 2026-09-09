/**
 * Eloq AI brand mark: the lowercase "e." wordmark glyph, set in Poppins
 * ExtraBold with the brand's indigo→violet gradient. Renders as real text
 * (not a hand-drawn path) so it stays crisp at any size and always matches
 * whatever "e." looks like in Poppins.
 */
export function EloqMark({ className }: { className?: string }) {
  return (
    <span
      aria-hidden
      className={className}
      style={{
        fontFamily: "var(--font-logo)",
        fontWeight: 800,
        lineHeight: 1,
        backgroundImage: "linear-gradient(135deg, #8b7cf6 0%, #4f46e5 100%)",
        backgroundClip: "text",
        WebkitBackgroundClip: "text",
        color: "transparent",
      }}
    >
      e.
    </span>
  );
}
