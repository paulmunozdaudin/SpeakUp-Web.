import { NextResponse } from "next/server";

/**
 * TEMPORARY debug route — reports (without exposing secrets) whether the
 * Stripe/Supabase env vars are present and what they look like, to
 * diagnose a persistent "Invalid API Key" error without more screenshots.
 * Delete this file once billing is confirmed working.
 */
export async function GET() {
  function describe(name: string) {
    const value = process.env[name] ?? "";
    if (!value) return { set: false };
    return {
      set: true,
      length: value.length,
      prefix: value.slice(0, 12),
      suffix: value.slice(-6),
      hasWhitespace: /\s/.test(value),
    };
  }

  return NextResponse.json({
    STRIPE_SECRET_KEY: describe("STRIPE_SECRET_KEY"),
    STRIPE_WEBHOOK_SECRET: describe("STRIPE_WEBHOOK_SECRET"),
    STRIPE_PRICE_ID_PRO: describe("STRIPE_PRICE_ID_PRO"),
    SUPABASE_SERVICE_ROLE_KEY: describe("SUPABASE_SERVICE_ROLE_KEY"),
  });
}
