import {
  BarChart3,
  Brain,
  GaugeCircle,
  Mic,
  Target,
  TrendingUp,
} from "lucide-react";
import { Section } from "./section";

const features = [
  {
    icon: Mic,
    title: "Record anywhere",
    description:
      "Practice straight from your browser or upload an existing recording. No setup, no downloads.",
  },
  {
    icon: Brain,
    title: "AI-powered analysis",
    description:
      "Advanced speech AI evaluates clarity, confidence, structure, vocabulary and persuasiveness.",
  },
  {
    icon: GaugeCircle,
    title: "Pacing & filler words",
    description:
      "Know exactly when you rush, drag, or lean on “um” and “like” — down to the word.",
  },
  {
    icon: Target,
    title: "Actionable feedback",
    description:
      "Not just scores: concrete strengths, weaknesses and personalized tips after every session.",
  },
  {
    icon: TrendingUp,
    title: "Track your progress",
    description:
      "Every practice is saved. Watch your scores climb week after week, like a fitness app for speaking.",
  },
  {
    icon: BarChart3,
    title: "Practice modes",
    description:
      "Interviews, startup pitches, school presentations, TED-style talks and more — each with tailored criteria.",
  },
];

export function Features() {
  return (
    <Section
      id="features"
      eyebrow="Features"
      title="Everything you need to become a better speaker"
      description="One focused workflow: practice, analyze, improve. Designed to make progress visible."
    >
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {features.map((feature) => (
          <div
            key={feature.title}
            className="group rounded-2xl border border-border bg-surface p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-black/5"
          >
            <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-accent-soft text-accent transition-transform duration-300 group-hover:scale-110">
              <feature.icon className="h-5.5 w-5.5" />
            </div>
            <h3 className="font-semibold">{feature.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted">
              {feature.description}
            </p>
          </div>
        ))}
      </div>
    </Section>
  );
}
