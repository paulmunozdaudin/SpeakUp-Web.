"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Mic, Play, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useDict } from "@/lib/i18n";

export function Hero() {
  const d = useDict();

  const previewMetrics = [
    { label: d.landing.previewMetrics.clarity, value: 88 },
    { label: d.landing.previewMetrics.confidence, value: 82 },
    { label: d.landing.previewMetrics.pacing, value: 79 },
    { label: d.landing.previewMetrics.structure, value: 91 },
  ];

  return (
    <section className="relative overflow-hidden">
      {/* Soft radial glow behind the headline */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-[520px] bg-[radial-gradient(ellipse_at_top,var(--accent-soft),transparent_65%)]"
      />
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
          <Link href="/signup">
            <Button size="lg">
              <Mic className="h-4.5 w-4.5" />
              {d.common.startPracticing}
            </Button>
          </Link>
          {/* TODO(demo): link to a real product demo video. */}
          <Link href="#how-it-works">
            <Button variant="secondary" size="lg">
              <Play className="h-4.5 w-4.5" />
              {d.common.seeDemo}
            </Button>
          </Link>
        </motion.div>

        {/* Stylised product preview */}
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.36 }}
          className="mt-20 w-full"
        >
          <div className="mx-auto max-w-3xl rounded-3xl border border-border bg-surface p-6 shadow-xl shadow-black/5 sm:p-8">
            <div className="flex items-center justify-between">
              <div className="text-left">
                <p className="text-sm font-medium">{d.landing.previewTitle}</p>
                <p className="text-xs text-muted">{d.landing.previewSubtitle}</p>
              </div>
              <span className="rounded-full bg-success/10 px-3 py-1 text-sm font-semibold text-success">
                86
              </span>
            </div>
            <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
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
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
