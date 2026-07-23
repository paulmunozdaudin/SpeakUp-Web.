import Link from "next/link";
import { TorchIcon } from "./torch-icon";
import { cn } from "@/utils/cn";

export function Logo({
  href = "/",
  className,
}: {
  href?: string;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={cn("inline-flex items-center gap-2 font-semibold", className)}
    >
      <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-accent text-white">
        <TorchIcon className="h-4.5 w-4.5" />
      </span>
      <span className="text-lg tracking-tight">Eloq AI</span>
    </Link>
  );
}
