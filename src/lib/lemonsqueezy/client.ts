import { lemonSqueezySetup } from "@lemonsqueezy/lemonsqueezy.js";
import { isLemonSqueezyConfigured, LEMONSQUEEZY_API_KEY } from "./config";

let configured = false;

/**
 * Wires up the Lemon Squeezy SDK with our API key (idempotent — the SDK
 * config is a module-level singleton, so this only needs to run once per
 * server process). Returns false when Lemon Squeezy isn't configured, so
 * callers can degrade gracefully like the other API routes.
 */
export function ensureLemonSqueezyConfigured(): boolean {
  if (!isLemonSqueezyConfigured) return false;
  if (!configured) {
    lemonSqueezySetup({ apiKey: LEMONSQUEEZY_API_KEY });
    configured = true;
  }
  return true;
}
