import { NextResponse } from "next/server";
import { getSubscription } from "@lemonsqueezy/lemonsqueezy.js";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { ensureLemonSqueezyConfigured } from "@/lib/lemonsqueezy/client";

export const runtime = "nodejs";

/**
 * POST /api/lemonsqueezy/portal
 * Returns the Lemon Squeezy Customer Portal URL for the signed-in Pro user,
 * so they can update their card, view invoices, or cancel — without
 * emailing us to do it. Unlike Stripe, Lemon Squeezy doesn't create a
 * portal "session" — the pre-signed URL just lives on the subscription
 * itself, so we fetch it fresh each time (it expires after 24h).
 */
export async function POST() {
  if (!ensureLemonSqueezyConfigured()) {
    return NextResponse.json(
      { error: "Billing is not configured yet." },
      { status: 503 },
    );
  }

  const supabase = await getSupabaseServerClient();
  const {
    data: { user },
  } = (await supabase?.auth.getUser()) ?? { data: { user: null } };

  if (!supabase || !user) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }

  try {
    const { data: profile } = await supabase
      .from("profiles")
      .select("lemonsqueezy_subscription_id")
      .eq("id", user.id)
      .maybeSingle();

    const subscriptionId = profile?.lemonsqueezy_subscription_id as
      | string
      | undefined;
    if (!subscriptionId) {
      return NextResponse.json(
        { error: "No active subscription found." },
        { status: 404 },
      );
    }

    const { data, error } = await getSubscription(subscriptionId);
    const url = data?.data.attributes.urls.customer_portal;

    if (error || !url) {
      return NextResponse.json(
        {
          error:
            error?.message ?? "Could not open the billing portal. Please try again.",
        },
        { status: 502 },
      );
    }

    return NextResponse.json({ url });
  } catch (err) {
    const message =
      err instanceof Error
        ? err.message
        : "Could not open the billing portal. Please try again.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
