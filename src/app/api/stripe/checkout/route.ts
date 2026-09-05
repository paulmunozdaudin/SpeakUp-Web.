import { NextResponse } from "next/server";
import Stripe from "stripe";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { getStripeClient } from "@/lib/stripe/server";
import { isStripeConfigured, STRIPE_PRICE_ID_PRO } from "@/lib/stripe/config";

export const runtime = "nodejs";

/**
 * POST /api/stripe/checkout
 * Creates a Stripe Checkout session for the signed-in user to subscribe to
 * Pro, and returns its URL for the browser to redirect to. Requires auth —
 * practicing never requires an account, but paying for Pro does, since the
 * subscription has to be tied to a profile.
 */
export async function POST(request: Request) {
  if (!isStripeConfigured) {
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

  const stripe = getStripeClient();
  if (!stripe) {
    return NextResponse.json(
      { error: "Billing is not configured yet." },
      { status: 503 },
    );
  }

  try {
    const { data: profile } = await supabase
      .from("profiles")
      .select("stripe_customer_id")
      .eq("id", user.id)
      .maybeSingle();

    // Supabase returns an unset column as null, not undefined — passing
    // `customer: null` alongside `customer_email` explicitly sends both
    // keys, which Stripe rejects ("You may only specify one of these
    // parameters"). Only include whichever one actually applies.
    const existingCustomerId = profile?.stripe_customer_id as
      | string
      | null
      | undefined;
    const origin = new URL(request.url).origin;

    const baseParams: Stripe.Checkout.SessionCreateParams = {
      mode: "subscription",
      line_items: [{ price: STRIPE_PRICE_ID_PRO, quantity: 1 }],
      client_reference_id: user.id,
      subscription_data: { metadata: { supabase_user_id: user.id } },
      success_url: `${origin}/profile?checkout=success`,
      cancel_url: `${origin}/profile?checkout=cancelled`,
      // The account uses Managed Payments (Stripe as merchant of record) so
      // VAT/sales tax across the EU is calculated and remitted automatically
      // — the Pro product carries the SaaS tax code this requires.
      managed_payments: { enabled: true },
    };

    let session: Stripe.Checkout.Session;
    try {
      session = await stripe.checkout.sessions.create(
        existingCustomerId
          ? { ...baseParams, customer: existingCustomerId }
          : { ...baseParams, customer_email: user.email ?? undefined },
      );
    } catch (err) {
      // A customer ID saved while Stripe was in test mode doesn't exist once
      // the account goes live (test and live are separate universes) — fall
      // back to creating a fresh customer instead of failing the checkout.
      const isStaleCustomer =
        existingCustomerId &&
        err instanceof Stripe.errors.StripeInvalidRequestError &&
        err.param === "customer";
      if (!isStaleCustomer) throw err;

      session = await stripe.checkout.sessions.create({
        ...baseParams,
        customer_email: user.email ?? undefined,
      });
    }

    if (!session.url) {
      return NextResponse.json(
        { error: "Could not start checkout. Please try again." },
        { status: 502 },
      );
    }

    return NextResponse.json({ url: session.url });
  } catch (err) {
    const message =
      err instanceof Stripe.errors.StripeError
        ? err.message
        : err instanceof Error
          ? err.message
          : "Could not start checkout. Please try again.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
