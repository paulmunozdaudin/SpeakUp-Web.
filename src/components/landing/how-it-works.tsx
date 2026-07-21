import { Mic, ScanLine, TrendingUp } from "lucide-react";
import { Section } from "./section";

const steps = [
  {
    icon: Mic,
    step: "01",
    title: "Practice",
    description:
      "Pick a mode, hit record and deliver your presentation as if the room were full.",
  },
  {
    icon: ScanLine,
    step: "02",
    title: "Analyze",
    description:
      "Our AI listens like a coach: pacing, clarity, structure, filler words, confidence.",
  },
  {
    icon: TrendingUp,
    step: "03",
    title: "Improve",
    description:
      "Get a detailed report with personalized tips and exercises. Repeat and watch your score rise.",
  },
];

export function HowItWorks() {
  return (
    <Section
      id="how-it-works"
      eyebrow="How it works"
      title="Three steps to a stronger delivery"
    >
      <div className="grid gap-4 md:grid-cols-3">
        {steps.map((item) => (
          <div
            key={item.step}
            className="relative rounded-2xl border border-border bg-surface p-8"
          >
            <span className="absolute right-6 top-6 text-4xl font-semibold text-surface-muted">
              {item.step}
            </span>
            <div className="mb-5 inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-accent text-white">
              <item.icon className="h-5.5 w-5.5" />
            </div>
            <h3 className="text-lg font-semibold">{item.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted">
              {item.description}
            </p>
          </div>
        ))}
      </div>
    </Section>
  );
}
