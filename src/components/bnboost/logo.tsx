import { cn } from "@/utils/cn";

/**
 * Flat vector redraw of the client's "BN" monogram (spine + wedge bowl +
 * diagonal flared arm + a detached accent square), in a single flat color
 * instead of the source's brushed-metal 3D render. Swap for the original
 * file directly if the exact 3D artwork is ever needed.
 */
export function BnboostLogo({
  className,
  variant = "dark",
}: {
  className?: string;
  variant?: "dark" | "light";
}) {
  const ink = variant === "dark" ? "#0a0a0a" : "#ffffff";
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <svg
        width="30"
        height="30"
        viewBox="0 0 64 64"
        fill="none"
        aria-hidden
        className="shrink-0"
      >
        <rect x="10" y="8" width="10" height="38" rx="1.5" fill={ink} />
        <polygon points="20,8 36,8 44,17 36,26 20,26" fill={ink} />
        <polygon points="36,8 48,8 64,58 44,58" fill={ink} />
        <rect x="9" y="50" width="9" height="9" rx="1.5" fill={ink} />
      </svg>
      <span
        className="text-[19px] font-bold tracking-tight"
        style={{ color: ink }}
      >
        BNBoost
      </span>
    </span>
  );
}
