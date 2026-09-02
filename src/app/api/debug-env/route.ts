import { NextResponse } from "next/server";
import { createHash } from "node:crypto";

/**
 * TEMPORARY debug route — reports (without exposing secrets) whether the
 * Stripe/Supabase env vars are present and what they look like, to
 * diagnose a persistent "Invalid API Key" error without more screenshots.
 * Delete this file once billing is confirmed working.
 */

// SHA-256 of the verified-correct STRIPE_SECRET_KEY, computed offline.
// Comparing hashes catches a corrupted middle character that a
// prefix/suffix/length check would miss, without ever displaying the
// secret itself.
const KNOWN_GOOD_STRIPE_SECRET_KEY_SHA256 =
  "54aa734f3274f5893d633c2b97133a42280dccf864c979d52aa4e2902bc02e37";

export async function GET() {
  function sha256(value: string) {
    return createHash("sha256").update(value).digest("hex");
  }

  function describe(name: string) {
    const value = process.env[name] ?? "";
    if (!value) return { set: false };
    return {
      set: true,
      length: value.length,
      prefix: value.slice(0, 12),
      suffix: value.slice(-6),
      hasWhitespace: /\s/.test(value),
      sha256: sha256(value),
    };
  }

  // Live reachability check: does the Supabase project actually respond?
  // A paused free-tier project, a DNS issue, or a genuinely wrong URL would
  // all fail here the same way the browser's "Failed to fetch" does — but
  // from the server, without depending on a visitor's browser/extensions.
  async function checkSupabase() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!url || !anonKey) return { reachable: false, reason: "missing env vars" };

    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 8000);
      const res = await fetch(`${url}/auth/v1/health`, {
        headers: { apikey: anonKey },
        signal: controller.signal,
      });
      clearTimeout(timeout);
      const body = await res.text();
      return {
        reachable: true,
        status: res.status,
        statusText: res.statusText,
        body: body.slice(0, 300),
      };
    } catch (err) {
      return {
        reachable: false,
        errorName: err instanceof Error ? err.name : typeof err,
        errorMessage: err instanceof Error ? err.message : String(err),
      };
    }
  }

  const stripeSecretKeyHash = sha256(process.env.STRIPE_SECRET_KEY ?? "");

  return NextResponse.json({
    STRIPE_SECRET_KEY: describe("STRIPE_SECRET_KEY"),
    STRIPE_SECRET_KEY_MATCHES_KNOWN_GOOD:
      stripeSecretKeyHash === KNOWN_GOOD_STRIPE_SECRET_KEY_SHA256,
    STRIPE_WEBHOOK_SECRET: describe("STRIPE_WEBHOOK_SECRET"),
    STRIPE_PRICE_ID_PRO: describe("STRIPE_PRICE_ID_PRO"),
    SUPABASE_SERVICE_ROLE_KEY: describe("SUPABASE_SERVICE_ROLE_KEY"),
    // These two are NEXT_PUBLIC_ — already embedded in the client bundle,
    // so showing them here (partial) exposes nothing new.
    NEXT_PUBLIC_SUPABASE_URL: describe("NEXT_PUBLIC_SUPABASE_URL"),
    NEXT_PUBLIC_SUPABASE_ANON_KEY: describe("NEXT_PUBLIC_SUPABASE_ANON_KEY"),
    supabaseLiveCheck: await checkSupabase(),
  });
}
