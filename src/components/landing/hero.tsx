"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { MessageSquareWarning, Presentation, Sparkles, Trophy, User, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { WaveformBackground } from "@/components/landing/waveform-background";
import { useUser } from "@/hooks/use-user";
import { useDict } from "@/lib/i18n";

export function Hero() {
  const d = useDict();
  const { user } = useUser();

  const previewMetrics = [
    { label: d.landing.previewMetrics.clarity, value: 82 },
    { label: d.landing.previewMetrics.confidence, value: 76 },
    { label: d.landing.previewMetrics.pacing, value: 74 },
    { label: d.landing.previewMetrics.structure, value: 80 },
  ];

  return (
    <section className="relative overflow-hidden">
      {/* Soft radial glow behind the headline */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-[520px] bg-[radial-gradient(ellipse_at_top,var(--accent-soft),transparent_65%)]"
      />
      <WaveformBackground />
      <div className="relative mx-auto flex max-w-4xl flex-col items-center px-4 pb-24 pt-24 text-center sm:pt-32">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3.5 py-1.5 text-xs font-medium text-muted"
        >
          <Sparkles className="h-3.5 w-3.5 text-accent" />
          {d.landing.heroBadge}
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.08 }}
          className="text-balance text-5xl font-semibold tracking-tight sm:text-6xl md:text-7xl"
        >
          {d.landing.heroTitle}
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.16 }}
          className="mt-6 max-w-xl text-pretty text-lg text-muted"
        >
          {d.landing.heroSubtitle}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.24 }}
          className="mt-10 flex flex-col items-center gap-3 sm:flex-row"
        >
          <Link href="/challenges/play?type=improvise">
            <Button size="lg">
              <Zap className="h-4.5 w-4.5" />
              {d.landing.heroCtaChallenge}
            </Button>
          </Link>
          <Link href="/practice?section=presentation">
            <Button variant="secondary" size="lg">
              <Presentation className="h-4.5 w-4.5" />
              {d.landing.heroCtaPresentation}
            </Button>
          </Link>
          {user && (
            <Link href="/profile">
              <Button variant="secondary" size="lg">
                <User className="h-4.5 w-4.5" />
                {d.nav.profile}
              </Button>
            </Link>
          )}
        </motion.div>

        {/* Stylised product preview */}
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.36 }}
          className="mt-20 w-full"
        >
          <div className="mx-auto max-w-3xl rounded-3xl border border-border bg-surface p-6 shadow-xl shadow-black/5 sm:p-8">
            <div className="flex items-center justify-between gap-4">
              <div className="flex min-w-0 items-center gap-3 text-left">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[linear-gradient(135deg,var(--accent-hover),var(--accent))] text-white">
                  <Zap className="h-5 w-5" />
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-medium">{d.landing.previewTitle}</p>
                  <p className="text-xs text-muted">{d.landing.previewSubtitle}</p>
                </div>
              </div>
              <span className="shrink-0 rounded-full bg-success/10 px-3 py-1 text-sm font-semibold text-success">
                78
              </span>
            </div>
            <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-5">
              {previewMetrics.map((metric) => (
                <div
                  key={metric.label}
                  className="rounded-2xl bg-surface-muted p-4 text-left"
                >
                  <p className="text-xs text-muted">{metric.label}</p>
                  <p className="mt-1 text-xl font-semibold tabular-nums">
                    {metric.value}
                  </p>
                  <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-border">
                    <motion.div
                      initial={{ width: 0 }}
                      whileInView={{ width: `${metric.value}%` }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.8, delay: 0.2 }}
                      className="h-full rounded-full bg-accent"
                    />
                  </div>
                </div>
              ))}
              <div className="col-span-2 rounded-2xl bg-warning/10 p-4 text-left sm:col-span-1">
                <p className="flex items-center gap-1.5 text-xs text-warning">
                  <MessageSquareWarning className="h-3.5 w-3.5" />
                  {d.landing.previewMetrics.fillerWords}
                </p>
                <p className="mt-1 text-xl font-semibold tabular-nums text-warning">
                  2
                </p>
                <p className="mt-2 text-xs text-muted">
                  {d.landing.previewFillerExample}
                </p>
              </div>
            </div>

            {/* Level-up strip — shows the XP/level system at a glance. */}
            <div className="mt-4 flex items-center gap-4 rounded-2xl border border-accent/30 bg-accent-soft/60 p-4 text-left">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,var(--accent-hover),var(--accent))] text-white shadow-[0_8px_20px_-8px_var(--accent)]">
                <Trophy className="h-5.5 w-5.5" />
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-3">
                  <p className="truncate text-sm font-semibold">{d.landing.previewLevel}</p>
                  <span className="shrink-0 rounded-full bg-accent px-2.5 py-0.5 text-xs font-semibold text-white">
                    {d.landing.previewXp}
                  </span>
                </div>
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-border">
                  <motion.div
                    initial={{ width: "38%" }}
                    whileInView={{ width: "48%" }}
                    viewport={{ once: true }}
                    transition={{ duration: 1, delay: 0.6, ease: "easeOut" }}
                    className="h-full rounded-full bg-[linear-gradient(90deg,var(--accent-hover),var(--accent))]"
                  />
                </div>
                <p className="mt-1.5 text-xs text-muted">{d.landing.previewNextLevel}</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
