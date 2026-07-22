"use client";

import { Mic, ScanLine, TrendingUp } from "lucide-react";
import { Section } from "./section";
import { useDict } from "@/lib/i18n";

const ICONS = [Mic, ScanLine, TrendingUp];

export function HowItWorks() {
  const d = useDict();

  return (
    <Section
      id="how-it-works"
      eyebrow={d.landing.howEyebrow}
      title={d.landing.howTitle}
    >
      <div className="grid gap-4 md:grid-cols-3">
        {d.landing.howSteps.map((item, index) => {
          const Icon = ICONS[index];
          return (
            <div
              key={item.title}
              className="relative rounded-2xl border border-border bg-surface p-8"
            >
              <span className="absolute right-6 top-6 text-4xl font-semibold text-surface-muted">
                {String(index + 1).padStart(2, "0")}
              </span>
              <div className="mb-5 inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-accent text-white">
                <Icon className="h-5.5 w-5.5" />
              </div>
              <h3 className="text-lg font-semibold">{item.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">
                {item.description}
              </p>
            </div>
          );
        })}
      </div>
    </Section>
  );
}
