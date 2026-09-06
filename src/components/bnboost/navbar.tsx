"use client";

import { useEffect, useState } from "react";
import { BnboostLogo } from "./logo";
import { BnboostButton } from "./button";

const links = [
  { href: "#como-funciona", label: "Cómo funciona" },
  { href: "#resultados", label: "Resultados" },
  { href: "#ejemplos", label: "Ejemplos" },
  { href: "#testimonios", label: "Testimonios" },
];

export function BnboostNavbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 border-b transition-colors duration-300 ${
        scrolled
          ? "border-neutral-200 bg-white/80 backdrop-blur-xl"
          : "border-transparent bg-white/0"
      }`}
    >
      <nav className="mx-auto flex h-20 max-w-6xl items-center justify-between px-6 sm:px-8">
        <BnboostLogo />
        <div className="hidden items-center gap-9 md:flex">
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm text-neutral-500 transition-colors hover:text-neutral-900"
            >
              {link.label}
            </a>
          ))}
        </div>
        <a href="#cta">
          <BnboostButton size="md">Solicitar un vídeo</BnboostButton>
        </a>
      </nav>
    </header>
  );
}
