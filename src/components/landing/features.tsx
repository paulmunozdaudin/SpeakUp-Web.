"use client";

import {
  BarChart3,
  Brain,
  GaugeCircle,
  Mic,
  Target,
  TrendingUp,
} from "lucide-react";
import { Section } from "./section";
import { useDict } from "@/lib/i18n";

const ICONS = [Mic, Brain, GaugeCircle, Target, TrendingUp, BarChart3];

export function Features() {
  const d = useDict();

  return (
    <Section
      id="features"
      eyebrow={d.landing.featuresEyebrow}
      title={d.landing.featuresTitle}
      description={d.landing.featuresDescription}
    >
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {d.landing.features.map((feature, index) => {
          const Icon = ICONS[index];
          return (
            <div
              key={feature.title}
              className="group rounded-2xl border border-border bg-surface p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-black/5"
            >
              <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-accent-soft text-accent transition-transform duration-300 group-hover:scale-110">
                <Icon className="h-5.5 w-5.5" />
              </div>
              <h3 className="font-semibold">{feature.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">
                {feature.description}
              </p>
            </div>
          );
        })}
      </div>
    </Section>
  );
}
