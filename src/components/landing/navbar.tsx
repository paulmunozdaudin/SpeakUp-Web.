"use client";

import Link from "next/link";
import { Logo } from "@/components/ui/logo";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { LanguageToggle } from "@/components/theme/language-toggle";
import { useDict } from "@/lib/i18n";

export function Navbar() {
  const d = useDict();

  const links = [
    { href: "#features", label: d.nav.features },
    { href: "#how-it-works", label: d.nav.howItWorks },
    { href: "#pricing", label: d.nav.pricing },
    { href: "#faq", label: d.nav.faq },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-xl">
      <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Logo />
        <div className="hidden items-center gap-8 md:flex">
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm text-muted transition-colors hover:text-foreground"
            >
              {link.label}
            </a>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <LanguageToggle />
          <ThemeToggle />
          <Link href="/login" className="hidden sm:block">
            <Button variant="ghost" size="sm">
              {d.common.logIn}
            </Button>
          </Link>
          <Link href="/signup">
            <Button size="sm">{d.common.startPracticing}</Button>
          </Link>
        </div>
      </nav>
    </header>
  );
}
