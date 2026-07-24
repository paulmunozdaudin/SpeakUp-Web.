import Stripe from "stripe";
import { isStripeConfigured, STRIPE_SECRET_KEY } from "./config";

let client: Stripe | null = null;

/** Server-side Stripe client (singleton). Null when Stripe isn't configured. */
export function getStripeClient(): Stripe | null {
  if (!isStripeConfigured) return null;
  if (!client) client = new Stripe(STRIPE_SECRET_KEY);
  return client;
}
