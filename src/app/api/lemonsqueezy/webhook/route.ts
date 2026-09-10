import { createHmac, timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import {
  isLemonSqueezyConfigured,
  LEMONSQUEEZY_WEBHOOK_SECRET,
} from "@/lib/lemonsqueezy/config";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

/** Subscription statuses that count as an active Pro plan. */
const ACTIVE_STATUSES = new Set(["active", "on_trial"]);

interface SubscriptionEventPayload {
  meta: {
    event_name: string;
    custom_data?: Record<string, unknown>;
  };
  data: {
    id: string;
    attributes: {
      customer_id: number;
      status: string;
      renews_at: string | null;
      ends_at: string | null;
    };
  };
}

function verifySignature(rawBody: string, signature: string | null): boolean {
  if (!signature) return false;
  const digest = createHmac("sha256", LEMONSQUEEZY_WEBHOOK_SECRET)
    .update(rawBody)
    .digest("hex");
  const digestBuffer = Buffer.from(digest, "hex");
  const signatureBuffer = Buffer.from(signature, "hex");
  return (
    digestBuffer.length === signatureBuffer.length &&
    timingSafeEqual(digestBuffer, signatureBuffer)
  );
}

async function syncSubscription(
  subscription: SubscriptionEventPayload["data"],
  customData: Record<string, unknown> | undefined,
) {
  const admin = getSupabaseAdminClient();
  if (!admin) return;

  const { attributes } = subscription;
  const patch = {
    subscription_status: ACTIVE_STATUSES.has(attributes.status)
      ? "pro"
      : "free",
    lemonsqueezy_subscription_id: subscription.id,
    lemonsqueezy_customer_id: String(attributes.customer_id),
    current_period_end: attributes.renews_at ?? attributes.ends_at,
  };

  // On the very first event (subscription_created) we only know which
  // Supabase user this is via the custom data passed into the checkout —
  // every later event matches on the subscription id saved just above.
  const supabaseUserId = customData?.supabase_user_id;
  if (typeof supabaseUserId === "string") {
    await admin.from("profiles").update(patch).eq("id", supabaseUserId);
    return;
  }

  await admin
    .from("profiles")
    .update(patch)
    .eq("lemonsqueezy_subscription_id", subscription.id);
}

/**
 * POST /api/lemonsqueezy/webhook
 * Lemon Squeezy calls this whenever a subscription is created or its status
 * changes. This is the ONLY place `profiles.subscription_status` gets
 * written to "pro" — the client never sets it directly.
 */
export async function POST(request: Request) {
  if (!isLemonSqueezyConfigured) {
    return NextResponse.json({ error: "Not configured" }, { status: 503 });
  }

  const rawBody = await request.text();
  const signature = request.headers.get("x-signature");

  if (!verifySignature(rawBody, signature)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const payload = JSON.parse(rawBody) as SubscriptionEventPayload;
  const { event_name, custom_data } = payload.meta;

  if (event_name.startsWith("subscription_")) {
    await syncSubscription(payload.data, custom_data);
  }

  return NextResponse.json({ received: true });
}
