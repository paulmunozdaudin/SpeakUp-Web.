import { cn } from "@/utils/cn";

/**
 * Placeholder geometric mark — swap the <svg> below for the client's real
 * logo file whenever it's available. Kept minimal/monochrome on purpose so
 * it drops in cleanly regardless of the final asset's exact shape.
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
        width="28"
        height="28"
        viewBox="0 0 28 28"
        fill="none"
        aria-hidden
        className="shrink-0"
      >
        <rect
          x="1"
          y="1"
          width="26"
          height="26"
          rx="8"
          stroke={ink}
          strokeWidth="1.4"
        />
        <path d="M11 8.5L19.5 14L11 19.5V8.5Z" fill={ink} />
      </svg>
      <span
        className="text-[17px] font-semibold tracking-tight"
        style={{ color: ink }}
      >
        BNBoost
      </span>
    </span>
  );
}
