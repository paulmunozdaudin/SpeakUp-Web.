"use client";

import { Section } from "./section";
import { useDict } from "@/lib/i18n";

/* TODO(content): replace placeholder testimonials with real customer quotes. */
export function Testimonials() {
  const d = useDict();

  return (
    <Section
      eyebrow={d.landing.testimonialsEyebrow}
      title={d.landing.testimonialsTitle}
    >
      <div className="grid gap-4 md:grid-cols-3">
        {d.landing.testimonials.map((t) => (
          <figure
            key={t.name}
            className="flex flex-col justify-between rounded-2xl border border-border bg-surface p-6"
          >
            <blockquote className="text-sm leading-relaxed">
              “{t.quote}”
            </blockquote>
            <figcaption className="mt-6 flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-accent-soft text-sm font-semibold text-accent">
                {t.name[0]}
              </div>
              <div>
                <p className="text-sm font-medium">{t.name}</p>
                <p className="text-xs text-muted">{t.role}</p>
              </div>
            </figcaption>
          </figure>
        ))}
      </div>
    </Section>
  );
}
