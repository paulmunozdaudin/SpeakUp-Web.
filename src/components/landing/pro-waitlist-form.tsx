"use client";

import { useState } from "react";
import { Check, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { joinProWaitlist } from "@/services/waitlist.service";
import { useDict } from "@/lib/i18n";

/** Shown instead of the checkout button while PRO_CHECKOUT_ENABLED is
 *  false — captures interest so it can be converted once Stripe goes live,
 *  instead of losing everyone who was ready to pay today. */
export function ProWaitlistForm() {
  const d = useDict();
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "pending" | "done">("idle");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!email.trim()) return;
    setError(null);
    setStatus("pending");
    const result = await joinProWaitlist(email);
    if (!result.ok) {
      setError(result.error ?? d.billing.waitlistError);
      setStatus("idle");
      return;
    }
    setStatus("done");
  }

  if (status === "done") {
    return (
      <div className="mt-8 flex items-center justify-center gap-2 rounded-full border border-success/30 bg-success/10 px-4 py-2.5 text-center text-sm font-medium text-success">
        <Check className="h-4 w-4 shrink-0" />
        {d.billing.waitlistSuccess}
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mt-8 space-y-2">
      <div className="flex gap-2">
        <div className="flex-1">
          <Input
            type="email"
            name="waitlist-email"
            placeholder={d.billing.waitlistPlaceholder}
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
        </div>
        <Button type="submit" loading={status === "pending"}>
          <Mail className="h-4 w-4" />
          {d.billing.waitlistCta}
        </Button>
      </div>
      {error && <p className="text-xs text-danger">{error}</p>}
      <p className="text-xs text-muted">{d.billing.waitlistNote}</p>
    </form>
  );
}
