"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Mic } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useDict } from "@/lib/i18n";

export function CtaBanner() {
  const d = useDict();

  return (
    <section className="py-20 sm:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="relative overflow-hidden rounded-3xl bg-accent px-6 py-16 text-center text-white sm:px-16"
        >
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_70%_20%,rgba(255,255,255,0.18),transparent_50%)]"
          />
          <h2 className="relative text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
            {d.landing.ctaTitle}
          </h2>
          <p className="relative mx-auto mt-4 max-w-md text-white/80">
            {d.landing.ctaSubtitle}
          </p>
          <Link href="/signup" className="relative mt-8 inline-block">
            <Button
              size="lg"
              className="bg-white text-accent hover:bg-white/90"
            >
              <Mic className="h-4.5 w-4.5" />
              {d.common.startPracticing}
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
