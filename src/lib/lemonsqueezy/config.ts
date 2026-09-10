/**
 * Lemon Squeezy environment configuration.
 * Billing degrades gracefully when Lemon Squeezy isn't configured: upgrade
 * buttons are hidden/disabled instead of the app crashing, mirroring how
 * Supabase and OpenAI are handled elsewhere.
 */

export const LEMONSQUEEZY_API_KEY = process.env.LEMONSQUEEZY_API_KEY ?? "";
export const LEMONSQUEEZY_STORE_ID = process.env.LEMONSQUEEZY_STORE_ID ?? "";
export const LEMONSQUEEZY_WEBHOOK_SECRET =
  process.env.LEMONSQUEEZY_WEBHOOK_SECRET ?? "";
export const LEMONSQUEEZY_VARIANT_ID_PRO =
  process.env.LEMONSQUEEZY_VARIANT_ID_PRO ?? "";

export const isLemonSqueezyConfigured =
  LEMONSQUEEZY_API_KEY.length > 0 &&
  LEMONSQUEEZY_STORE_ID.length > 0 &&
  LEMONSQUEEZY_VARIANT_ID_PRO.length > 0;
