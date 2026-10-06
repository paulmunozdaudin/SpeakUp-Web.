import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

/**
 * POST /api/referral/attach
 * Called once by the signed-in user themselves, right after login, to
 * attach whatever referral code is sitting in their browser's localStorage
 * (see src/lib/referral.ts) to their own profile. This is the one
 * mechanism that works the same for email/password and Google (or any
 * future OAuth provider) sign-ins, instead of threading the code through
 * each provider's own redirect flow. Only ever writes the caller's own
 * row, and only when referred_by is still empty — protect_billing_columns
 * (migration 00006) would silently revert anything else anyway.
 */
export async function POST(request: Request) {
  const serverClient = await getSupabaseServerClient();
  if (!serverClient) {
    return NextResponse.json({ error: "Not configured" }, { status: 503 });
  }

  const {
    data: { user },
  } = await serverClient.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }

  let body: { code?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const code = body.code?.trim();
  if (!code) {
    return NextResponse.json({ error: "Missing code" }, { status: 400 });
  }

  const admin = getSupabaseAdminClient();
  if (!admin) {
    return NextResponse.json(
      { error: "SUPABASE_SERVICE_ROLE_KEY is not configured" },
      { status: 503 },
    );
  }

  const { data: profile } = await admin
    .from("profiles")
    .select("referred_by")
    .eq("id", user.id)
    .maybeSingle();

  if (profile && !profile.referred_by) {
    await admin
      .from("profiles")
      .update({ referred_by: code })
      .eq("id", user.id);
  }

  return NextResponse.json({ ok: true });
}
