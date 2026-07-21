import Link from "next/link";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Section } from "./section";
import { cn } from "@/utils/cn";

/* TODO(stripe): wire plans to Stripe Checkout. Plan IDs live in env vars. */
const plans = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    description: "Perfect for trying SpeakUp.",
    features: [
      "3 practice sessions per month",
      "Core AI feedback",
      "Session history",
    ],
    cta: "Start for free",
    highlighted: false,
  },
  {
    name: "Pro",
    price: "$12",
    period: "per month",
    description: "For serious speakers who practice weekly.",
    features: [
      "Unlimited practice sessions",
      "Full AI analysis & tips",
      "Progress tracking & trends",
      "All practice modes",
      "Downloadable reports",
    ],
    cta: "Go Pro",
    highlighted: true,
  },
  {
    name: "Teams",
    price: "Custom",
    period: "per seat",
    description: "For schools, bootcamps and sales teams.",
    features: [
      "Everything in Pro",
      "Team dashboards",
      "Shared exercises",
      "Priority support",
    ],
    cta: "Contact us",
    highlighted: false,
  },
];

export function Pricing() {
  return (
    <Section
      id="pricing"
      eyebrow="Pricing"
      title="Simple pricing that scales with you"
      description="Start free. Upgrade when practice becomes a habit."
    >
      <div className="grid gap-4 md:grid-cols-3">
        {plans.map((plan) => (
          <div
            key={plan.name}
            className={cn(
              "relative flex flex-col rounded-2xl border bg-surface p-8",
              plan.highlighted
                ? "border-accent shadow-xl shadow-accent/10"
                : "border-border",
            )}
          >
            {plan.highlighted && (
              <Badge tone="accent" className="absolute -top-3 left-1/2 -translate-x-1/2">
                Most popular
              </Badge>
            )}
            <h3 className="font-semibold">{plan.name}</h3>
            <div className="mt-4 flex items-baseline gap-1.5">
              <span className="text-4xl font-semibold tracking-tight">
                {plan.price}
              </span>
              <span className="text-sm text-muted">{plan.period}</span>
            </div>
            <p className="mt-2 text-sm text-muted">{plan.description}</p>
            <ul className="mt-6 flex-1 space-y-3">
              {plan.features.map((feature) => (
                <li key={feature} className="flex items-start gap-2.5 text-sm">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                  {feature}
                </li>
              ))}
            </ul>
            <Link href="/signup" className="mt-8">
              <Button
                variant={plan.highlighted ? "primary" : "secondary"}
                className="w-full"
              >
                {plan.cta}
              </Button>
            </Link>
          </div>
        ))}
      </div>
    </Section>
  );
}
