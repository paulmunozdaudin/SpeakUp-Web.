"use client";

/**
 * Pro waitlist: captures interest while Stripe checkout is disabled
 * (PRO_CHECKOUT_ENABLED in billing.service.ts). Never requires an account —
 * joining is a single insert into `pro_waitlist`, readable only by the
 * founder via the Supabase dashboard, never back through the app.
 */

import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { track } from "@vercel/analytics";

export interface WaitlistResult {
  ok: boolean;
  error?: string;
}

const NOT_CONFIGURED_ERROR =
  "Supabase is not configured yet. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to your environment.";

/** Postgres unique-violation code — someone already on the list isn't an
 *  error from the visitor's point of view, it's still a success. */
const UNIQUE_VIOLATION = "23505";

export async function joinProWaitlist(email: string): Promise<WaitlistResult> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) return { ok: false, error: NOT_CONFIGURED_ERROR };

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { error } = await supabase
    .from("pro_waitlist")
    .insert({ email: email.trim().toLowerCase(), user_id: user?.id ?? null });

  if (error && error.code !== UNIQUE_VIOLATION) {
    return { ok: false, error: error.message };
  }

  track("pro_waitlist_joined");
  return { ok: true };
}
