"use client";

import { motion } from "framer-motion";
import { cn } from "@/utils/cn";

export function BnboostSection({
  id,
  eyebrow,
  title,
  description,
  children,
  className,
  containerClassName,
}: {
  id?: string;
  eyebrow?: string;
  title?: React.ReactNode;
  description?: string;
  children?: React.ReactNode;
  className?: string;
  containerClassName?: string;
}) {
  return (
    <section
      id={id}
      className={cn("scroll-mt-24 py-24 sm:py-32", className)}
    >
      <div
        className={cn(
          "mx-auto max-w-6xl px-6 sm:px-8",
          containerClassName,
        )}
      >
        {(eyebrow || title || description) && (
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="mx-auto max-w-2xl text-center"
          >
            {eyebrow && (
              <p className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-blue-600">
                {eyebrow}
              </p>
            )}
            {title && (
              <h2 className="text-balance text-3xl font-semibold tracking-tight text-neutral-900 sm:text-4xl md:text-5xl">
                {title}
              </h2>
            )}
            {description && (
              <p className="mt-5 text-pretty text-lg text-neutral-500">
                {description}
              </p>
            )}
          </motion.div>
        )}
        {children && <div className="mt-16">{children}</div>}
      </div>
    </section>
  );
}
