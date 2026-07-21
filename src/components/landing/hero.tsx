"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Mic, Play, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Hero() {
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
          Your personal speaking coach, available 24/7
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.08 }}
          className="text-balance text-5xl font-semibold tracking-tight sm:text-6xl md:text-7xl"
        >
          Practice presentations with AI.
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.16 }}
          className="mt-6 max-w-xl text-pretty text-lg text-muted"
        >
          Get instant feedback on your clarity, confidence, pacing and
          delivery.
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
              Start practicing
            </Button>
          </Link>
          {/* TODO(demo): link to a real product demo video. */}
          <Link href="#how-it-works">
            <Button variant="secondary" size="lg">
              <Play className="h-4.5 w-4.5" />
              See demo
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
                <p className="text-sm font-medium">Startup pitch — take 3</p>
                <p className="text-xs text-muted">Analyzed just now</p>
              </div>
              <span className="rounded-full bg-success/10 px-3 py-1 text-sm font-semibold text-success">
                86
              </span>
            </div>
            <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {[
                { label: "Clarity", value: 88 },
                { label: "Confidence", value: 82 },
                { label: "Pacing", value: 79 },
                { label: "Structure", value: 91 },
              ].map((metric) => (
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
