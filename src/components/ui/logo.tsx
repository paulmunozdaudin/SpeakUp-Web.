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
      <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#161042]">
        <EloqMark className="text-xl" />
      </span>
      <span className="text-lg tracking-tight">Eloq AI</span>
    </a>
  );
}
