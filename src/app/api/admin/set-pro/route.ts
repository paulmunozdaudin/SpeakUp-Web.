import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { isAdminEmail } from "@/lib/admin";

export const runtime = "nodejs";

interface SetProBody {
  email: string;
  pro: boolean;
}

/**
 * POST /api/admin/set-pro
 * Founder-only manual override: flips a user's subscription_status without
 * going through Lemon Squeezy, for payments collected by hand (Bizum,
 * PayPal, etc.) while that integration isn't configured yet. Mirrors the
 * exact same write the Lemon Squeezy webhook makes — nothing downstream
 * needs to know which path set it.
 */
export async function POST(request: Request) {
  const serverClient = await getSupabaseServerClient();
  if (!serverClient) {
    return NextResponse.json({ error: "Not configured" }, { status: 503 });
  }

  const {
    data: { user },
  } = await serverClient.auth.getUser();

  if (!isAdminEmail(user?.email)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const admin = getSupabaseAdminClient();
  if (!admin) {
    return NextResponse.json(
      { error: "SUPABASE_SERVICE_ROLE_KEY is not configured" },
      { status: 503 },
    );
  }

  let body: SetProBody;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const email = body.email?.trim().toLowerCase();
  if (!email) {
    return NextResponse.json({ error: "Missing email" }, { status: 400 });
  }

  // Admin API doesn't expose a direct "get user by email" — list and match.
  // Fine at this scale; revisit (RPC against auth.users) if the user base
  // grows past a page.
  const { data: usersPage, error: listError } =
    await admin.auth.admin.listUsers({ page: 1, perPage: 1000 });
  if (listError) {
    return NextResponse.json({ error: listError.message }, { status: 500 });
  }

  const targetUser = usersPage.users.find(
    (u) => u.email?.toLowerCase() === email,
  );
  if (!targetUser) {
    return NextResponse.json(
      { error: "No account found with that email" },
      { status: 404 },
    );
  }

  const { error: updateError } = await admin
    .from("profiles")
    .update({ subscription_status: body.pro ? "pro" : "free" })
    .eq("id", targetUser.id);

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  return NextResponse.json({
    ok: true,
    userId: targetUser.id,
    email: targetUser.email,
    subscriptionStatus: body.pro ? "pro" : "free",
  });
}
