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
