/**
 * Stripe environment configuration.
 * Billing degrades gracefully when Stripe isn't configured: upgrade buttons
 * are hidden/disabled instead of the app crashing, mirroring how Supabase
 * and OpenAI are handled elsewhere.
 */

export const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY ?? "";
export const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET ?? "";
export const STRIPE_PRICE_ID_PRO = process.env.STRIPE_PRICE_ID_PRO ?? "";

export const isStripeConfigured =
  STRIPE_SECRET_KEY.length > 0 && STRIPE_PRICE_ID_PRO.length > 0;
