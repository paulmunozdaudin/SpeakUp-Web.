"use client";

import { motion } from "framer-motion";
import { useDict } from "@/lib/i18n";

/** Real, attributed quotes from early users — kept to people who gave
 *  explicit permission to use their first name publicly. The first one is
 *  the featured quote; the rest sit underneath, smaller. No cards. */
export function UserTestimonials() {
  const d = useDict();
  const [featured, ...rest] = d.landing.userTestimonials;

  return (
    <section className="py-24 sm:py-32">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <motion.figure
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5 }}
        >
          <p className="mb-6 text-sm font-semibold uppercase tracking-wider text-accent">
            {d.landing.userTestimonialsEyebrow}
          </p>
          <span
            aria-hidden
            className="block h-16 font-serif text-[120px] leading-none text-accent"
          >
            “
          </span>
          <blockquote className="max-w-4xl text-balance text-4xl font-semibold leading-[1.1] tracking-tight sm:text-6xl">
            {featured.quote}
          </blockquote>
          <figcaption className="mt-8 text-sm">
            <span className="font-semibold">{featured.name}</span>
            <span className="text-muted"> — {featured.role}</span>
          </figcaption>
        </motion.figure>

        <div className="mt-20 grid gap-12 border-t border-border pt-12 md:grid-cols-2">
          {rest.map((item, index) => (
            <motion.figure
              key={item.name}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <blockquote className="text-pretty text-2xl font-medium leading-snug tracking-tight">
                “{item.quote}”
              </blockquote>
              <figcaption className="mt-5 text-sm">
                <span className="font-semibold">{item.name}</span>
                <span className="text-muted"> — {item.role}</span>
              </figcaption>
            </motion.figure>
          ))}
        </div>
      </div>
    </section>
  );
}
