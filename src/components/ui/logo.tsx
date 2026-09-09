import { WaveIcon } from "./wave-icon";
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
        <WaveIcon className="h-4.5 w-4.5" />
      </span>
      <span className="text-lg tracking-tight">Eloq AI</span>
    </a>
  );
}
