import Link from "next/link";
import { AudioLines } from "lucide-react";
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
        <AudioLines className="h-4.5 w-4.5" />
      </span>
      <span className="text-lg tracking-tight">SpeakUp</span>
    </Link>
  );
}
