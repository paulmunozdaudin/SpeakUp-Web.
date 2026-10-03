import { EloqMark } from "./eloq-mark";
import { cn } from "@/utils/cn";

export function Logo({
  href = "/",
  className,
}: {
  href?: string;
  className?: string;
}) {
  return (
    // Plain <a>, not next/link — clicking the logo does a full page
    // reload (requested behavior), not a client-side route transition.
    <a
      href={href}
      className={cn("inline-flex items-center gap-2 font-semibold", className)}
    >
      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[linear-gradient(135deg,#8b7cf6_0%,#4f46e5_100%)] text-white shadow-[0_6px_16px_-4px_rgba(79,70,229,0.45)]">
        <EloqMark className="h-5 w-5" />
      </span>
      <span className="text-lg tracking-tight">Eloq AI</span>
    </a>
  );
}
