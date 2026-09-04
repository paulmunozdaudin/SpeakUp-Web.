"use client";

/**
 * Billing service: thin wrapper around our Stripe API routes.
 * Components never call /api/stripe/* directly, so the request/response
 * shape stays a one-file change.
 */

export interface BillingResult {
  ok: boolean;
  error?: string;
}

/**
 * Stripe is still in test mode — real payments aren't legally possible yet
 * (pending the founder's majority + auto-entrepreneur registration in
 * October). Upgrade CTAs read this instead of starting a checkout a real
 * visitor could actually land in, so nobody hits a broken/test payment
 * flow. Flip to true once Stripe goes live for real.
 */
export const PRO_CHECKOUT_ENABLED = false;

async function startFlow(path: string): Promise<BillingResult> {
  const response = await fetch(path, { method: "POST" });
  const body = await response.json().catch(() => null);

  if (!response.ok) {
    return { ok: false, error: body?.error ?? "Something went wrong." };
  }

  if (typeof body?.url === "string") {
    window.location.href = body.url;
    return { ok: true };
  }

  return { ok: false, error: "Something went wrong." };
}

/** Redirects the browser to Stripe Checkout for the Pro plan. */
export function startProCheckout(): Promise<BillingResult> {
  return startFlow("/api/stripe/checkout");
}

/** Redirects the browser to the Stripe Billing Portal. */
export function openBillingPortal(): Promise<BillingResult> {
  return startFlow("/api/stripe/portal");
}
