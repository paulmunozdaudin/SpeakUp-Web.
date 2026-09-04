"use client";

import { Section } from "./section";
import { useDict } from "@/lib/i18n";

/** Honest, verifiable product facts — not attributed testimonials. */
export function Testimonials() {
  const d = useDict();

  return (
    <Section
      eyebrow={d.landing.testimonialsEyebrow}
      title={d.landing.testimonialsTitle}
    >
      <div className="grid gap-4 md:grid-cols-3">
        {d.landing.testimonials.map((item) => (
          <div
            key={item.title}
            className="flex flex-col rounded-2xl border border-border bg-surface p-6"
          >
            <span className="text-3xl font-semibold tracking-tight text-accent">
              {item.stat}
            </span>
            <p className="mt-3 text-sm font-medium">{item.title}</p>
            <p className="mt-1.5 text-sm leading-relaxed text-muted">
              {item.description}
            </p>
          </div>
        ))}
      </div>
    </Section>
  );
}
