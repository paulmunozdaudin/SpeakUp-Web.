import { Section } from "./section";

/* TODO(content): replace placeholder testimonials with real customer quotes. */
const testimonials = [
  {
    quote:
      "I rehearsed my seed round pitch 14 times with SpeakUp. By demo day I wasn't nervous — I was ready.",
    name: "Sofia M.",
    role: "Startup founder",
  },
  {
    quote:
      "My filler-word count dropped from 42 to 6 in three weeks. My students noticed before I did.",
    name: "Daniel R.",
    role: "University lecturer",
  },
  {
    quote:
      "It's like having a speaking coach in my pocket. I practice on my commute before every client meeting.",
    name: "Amara K.",
    role: "Sales lead",
  },
];

export function Testimonials() {
  return (
    <Section
      eyebrow="Testimonials"
      title="Loved by speakers at every level"
    >
      <div className="grid gap-4 md:grid-cols-3">
        {testimonials.map((t) => (
          <figure
            key={t.name}
            className="flex flex-col justify-between rounded-2xl border border-border bg-surface p-6"
          >
            <blockquote className="text-sm leading-relaxed">
              “{t.quote}”
            </blockquote>
            <figcaption className="mt-6 flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-accent-soft text-sm font-semibold text-accent">
                {t.name[0]}
              </div>
              <div>
                <p className="text-sm font-medium">{t.name}</p>
                <p className="text-xs text-muted">{t.role}</p>
              </div>
            </figcaption>
          </figure>
        ))}
      </div>
    </Section>
  );
}
