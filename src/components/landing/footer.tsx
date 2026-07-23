"use client";

import Link from "next/link";
import { Logo } from "@/components/ui/logo";
import { useDict } from "@/lib/i18n";

export function Footer() {
  const d = useDict();

  const columns = [
    {
      title: d.landing.footerProduct,
      links: [
        { label: d.nav.features, href: "#features" },
        { label: d.nav.pricing, href: "#pricing" },
        { label: d.nav.faq, href: "#faq" },
      ],
    },
    {
      title: d.landing.footerCompany,
      links: [
        { label: d.landing.footerAbout, href: "#" },
        { label: d.landing.footerBlog, href: "#" },
        { label: d.landing.footerContact, href: "#" },
      ],
    },
    {
      title: d.landing.footerLegal,
      links: [
        { label: d.landing.footerPrivacy, href: "#" },
        { label: d.landing.footerTerms, href: "#" },
      ],
    },
  ];

  return (
    <footer className="border-t border-border bg-surface">
      <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
        <div className="grid gap-10 md:grid-cols-[1.5fr_1fr_1fr_1fr]">
          <div>
            <Logo />
            <p className="mt-4 max-w-xs text-sm text-muted">
              {d.landing.footerTagline}
            </p>
          </div>
          {columns.map((column) => (
            <div key={column.title}>
              <h4 className="text-sm font-semibold">{column.title}</h4>
              <ul className="mt-4 space-y-2.5">
                {column.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted transition-colors hover:text-foreground"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-12 border-t border-border pt-6 text-xs text-muted">
          © {new Date().getFullYear()} Eloq AI. {d.landing.footerRights}
        </div>
      </div>
    </footer>
  );
}
