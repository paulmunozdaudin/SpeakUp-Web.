"use client";

import { Section } from "./section";
import { useDict } from "@/lib/i18n";

/** Real, attributed quotes from early users — kept to people who gave
 *  explicit permission to use their first name publicly. */
export function UserTestimonials() {
  const d = useDict();

  return (
    <Section
      eyebrow={d.landing.userTestimonialsEyebrow}
      title={d.landing.userTestimonialsTitle}
    >
      <div className="grid gap-4 md:grid-cols-3">
        {d.landing.userTestimonials.map((item) => (
          <div
            key={item.name}
            className="flex flex-col rounded-2xl border border-border bg-surface p-6"
          >
            <p className="text-sm leading-relaxed text-foreground">
              “{item.quote}”
            </p>
            <div className="mt-5 flex items-center gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent-soft text-sm font-semibold text-accent">
                {item.name.charAt(0)}
              </div>
              <div>
                <p className="text-sm font-medium">{item.name}</p>
                <p className="text-xs text-muted">{item.role}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Section>
  );
}
