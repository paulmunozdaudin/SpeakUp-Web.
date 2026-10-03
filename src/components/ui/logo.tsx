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
      <span className="flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-[#0f0a1f]">
        <EloqMark className="h-5 w-5" />
      </span>
      <span className="text-lg tracking-tight">Eloq AI</span>
    </a>
  );
}
