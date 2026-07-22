"use client";

import Link from "next/link";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Section } from "./section";
import { useDict } from "@/lib/i18n";
import { cn } from "@/utils/cn";

/* TODO(stripe): wire plans to Stripe Checkout. Plan IDs live in env vars. */
const HIGHLIGHTED_INDEX = 1; // "Pro"

export function Pricing() {
  const d = useDict();

  return (
    <Section
      id="pricing"
      eyebrow={d.landing.pricingEyebrow}
      title={d.landing.pricingTitle}
      description={d.landing.pricingDescription}
    >
      <div className="grid gap-4 md:grid-cols-3">
        {d.landing.plans.map((plan, index) => {
          const highlighted = index === HIGHLIGHTED_INDEX;
          return (
            <div
              key={plan.name}
              className={cn(
                "relative flex flex-col rounded-2xl border bg-surface p-8",
                highlighted
                  ? "border-accent shadow-xl shadow-accent/10"
                  : "border-border",
              )}
            >
              {highlighted && (
                <Badge
                  tone="accent"
                  className="absolute -top-3 left-1/2 -translate-x-1/2"
                >
                  {d.landing.mostPopular}
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
                  <li
                    key={feature}
                    className="flex items-start gap-2.5 text-sm"
                  >
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                    {feature}
                  </li>
                ))}
              </ul>
              <Link href="/signup" className="mt-8">
                <Button
                  variant={highlighted ? "primary" : "secondary"}
                  className="w-full"
                >
                  {plan.cta}
                </Button>
              </Link>
            </div>
          );
        })}
      </div>
    </Section>
  );
}
