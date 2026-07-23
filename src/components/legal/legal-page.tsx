"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Logo } from "@/components/ui/logo";
import { LanguageToggle } from "@/components/theme/language-toggle";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { useLocale } from "@/lib/i18n";
import type { LegalContent } from "@/content/legal/types";

/** Shared reading layout for /privacy and /terms — follows the site's
 *  language toggle, so switching EN/ES anywhere carries over here too. */
export function LegalPage({ content }: { content: LegalContent }) {
  const { locale } = useLocale();
  const doc = content[locale];

  return (
    <main className="mx-auto max-w-2xl px-4 py-12 sm:px-6 sm:py-16">
      <div className="mb-10 flex items-center justify-between">
        <Logo />
        <div className="flex items-center gap-1">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 px-2 text-sm text-muted transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            {locale === "es" ? "Inicio" : "Home"}
          </Link>
          <LanguageToggle />
          <ThemeToggle />
        </div>
      </div>

      <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
        {doc.title}
      </h1>
      <p className="mt-2 text-sm text-muted">{doc.updated}</p>
      <p className="mt-6 text-base leading-relaxed text-muted">{doc.intro}</p>

      <div className="mt-10 space-y-8">
        {doc.sections.map((section) => (
          <section key={section.heading}>
            <h2 className="text-lg font-semibold tracking-tight">
              {section.heading}
            </h2>
            <div className="mt-2.5 space-y-3">
              {section.paragraphs.map((paragraph, i) => (
                <p key={i} className="text-sm leading-relaxed text-muted">
                  {paragraph}
                </p>
              ))}
            </div>
          </section>
        ))}
      </div>
    </main>
  );
}
