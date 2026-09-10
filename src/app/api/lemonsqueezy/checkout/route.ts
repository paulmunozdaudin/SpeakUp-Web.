import { NextResponse } from "next/server";
import { createCheckout } from "@lemonsqueezy/lemonsqueezy.js";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { ensureLemonSqueezyConfigured } from "@/lib/lemonsqueezy/client";
import {
  LEMONSQUEEZY_STORE_ID,
  LEMONSQUEEZY_VARIANT_ID_PRO,
} from "@/lib/lemonsqueezy/config";

export const runtime = "nodejs";

/**
 * POST /api/lemonsqueezy/checkout
 * Creates a Lemon Squeezy Checkout for the signed-in user to subscribe to
 * Pro, and returns its URL for the browser to redirect to. Requires auth —
 * practicing never requires an account, but paying for Pro does, since the
 * subscription has to be tied to a profile.
 */
export async function POST(request: Request) {
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
    return NextResponse.json(
      { error: "You need an account to upgrade to Pro." },
      { status: 401 },
    );
  }

  try {
    const origin = new URL(request.url).origin;

    const { data, error } = await createCheckout(
      LEMONSQUEEZY_STORE_ID,
      LEMONSQUEEZY_VARIANT_ID_PRO,
      {
        checkoutData: {
          email: user.email ?? undefined,
          // Read back in the webhook to tie the resulting subscription to
          // this Supabase user — the Lemon Squeezy equivalent of Stripe's
          // client_reference_id.
          custom: { supabase_user_id: user.id },
        },
        productOptions: {
          redirectUrl: `${origin}/profile?checkout=success`,
        },
      },
    );

    if (error || !data?.data.attributes.url) {
      return NextResponse.json(
        { error: error?.message ?? "Could not start checkout. Please try again." },
        { status: 502 },
      );
    }

    return NextResponse.json({ url: data.data.attributes.url });
  } catch (err) {
    const message =
      err instanceof Error
        ? err.message
        : "Could not start checkout. Please try again.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
