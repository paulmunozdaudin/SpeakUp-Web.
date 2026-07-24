import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { getStripeClient } from "@/lib/stripe/server";
import { isStripeConfigured, STRIPE_WEBHOOK_SECRET } from "@/lib/stripe/config";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

/** Subscription statuses that count as an active Pro plan. */
const ACTIVE_STATUSES = new Set<Stripe.Subscription.Status>([
  "active",
  "trialing",
]);

async function syncSubscription(subscription: Stripe.Subscription) {
  const admin = getSupabaseAdminClient();
  if (!admin) return;

  const customerId =
    typeof subscription.customer === "string"
      ? subscription.customer
      : subscription.customer.id;

  const status = ACTIVE_STATUSES.has(subscription.status) ? "pro" : "free";
  const periodEndSeconds = subscription.items.data[0]?.current_period_end;

  await admin
    .from("profiles")
    .update({
      subscription_status: status,
      stripe_subscription_id: subscription.id,
      current_period_end: periodEndSeconds
        ? new Date(periodEndSeconds * 1000).toISOString()
        : null,
    })
    .eq("stripe_customer_id", customerId);
}

/**
 * POST /api/stripe/webhook
 * Stripe calls this whenever a checkout completes or a subscription's
 * status changes. This is the ONLY place `profiles.subscription_status`
 * gets written to "pro" — the client never sets it directly.
 */
export async function POST(request: Request) {
  if (!isStripeConfigured) {
    return NextResponse.json({ error: "Not configured" }, { status: 503 });
  }

  const stripe = getStripeClient();
  if (!stripe) {
    return NextResponse.json({ error: "Not configured" }, { status: 503 });
  }

  const signature = request.headers.get("stripe-signature");
  const rawBody = await request.text();

  let event: Stripe.Event;
  try {
    if (!signature) throw new Error("Missing stripe-signature header");
    event = stripe.webhooks.constructEvent(
      rawBody,
      signature,
      STRIPE_WEBHOOK_SECRET,
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Invalid signature";
    return NextResponse.json({ error: message }, { status: 400 });
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const userId = session.client_reference_id;
      const customerId =
        typeof session.customer === "string"
          ? session.customer
          : session.customer?.id;

      if (userId && customerId) {
        const admin = getSupabaseAdminClient();
        await admin
          ?.from("profiles")
          .update({ stripe_customer_id: customerId })
          .eq("id", userId);
      }

      if (typeof session.subscription === "string") {
        const subscription = await stripe.subscriptions.retrieve(
          session.subscription,
        );
        await syncSubscription(subscription);
      }
      break;
    }

    case "customer.subscription.updated":
    case "customer.subscription.deleted": {
      const subscription = event.data.object as Stripe.Subscription;
      await syncSubscription(subscription);
      break;
    }

    default:
      break;
  }

  return NextResponse.json({ received: true });
}
