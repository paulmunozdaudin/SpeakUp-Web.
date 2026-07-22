"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Logo } from "@/components/ui/logo";
import { SupabaseNotice } from "@/components/auth/supabase-notice";
import { LanguageToggle } from "@/components/theme/language-toggle";
import { useDict } from "@/lib/i18n";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const d = useDict();

  return (
    <main className="relative flex flex-1 flex-col items-center justify-center px-4 py-16">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-[400px] bg-[radial-gradient(ellipse_at_top,var(--accent-soft),transparent_65%)]"
      />
      <Link
        href="/"
        className="absolute left-4 top-4 inline-flex items-center gap-1.5 text-sm text-muted transition-colors hover:text-foreground sm:left-6 sm:top-6"
      >
        <ArrowLeft className="h-4 w-4" />
        {d.common.home}
      </Link>
      <div className="absolute right-4 top-4 sm:right-6 sm:top-6">
        <LanguageToggle />
      </div>
      <div className="relative w-full max-w-md">
        <div className="mb-8 flex justify-center">
          <Logo />
        </div>
        <SupabaseNotice />
        <div className="rounded-3xl border border-border bg-surface p-8 shadow-xl shadow-black/5">
          {children}
        </div>
      </div>
    </main>
  );
}
