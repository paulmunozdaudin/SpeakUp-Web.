import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { isAdminEmail } from "@/lib/admin";

export const runtime = "nodejs";

/**
 * GET /api/admin/referrals?code=xxx
 * Founder-only: lists everyone who signed up through a given referral code
 * (eloq-oral.com/?ref=code), for crediting creator affiliate commissions.
 */
export async function GET(request: Request) {
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

  const code = new URL(request.url).searchParams.get("code")?.trim();
  if (!code) {
    return NextResponse.json({ error: "Missing code" }, { status: 400 });
  }

  const { data: profiles, error: profilesError } = await admin
    .from("profiles")
    .select("id, created_at, subscription_status")
    .eq("referred_by", code)
    .order("created_at", { ascending: false });

  if (profilesError) {
    return NextResponse.json({ error: profilesError.message }, { status: 500 });
  }

  if (!profiles || profiles.length === 0) {
    return NextResponse.json({ referrals: [] });
  }

  // Same "list and match" approach as /api/admin/set-pro — profiles has no
  // email column, so emails only live in the Admin Auth API.
  const { data: usersPage, error: listError } =
    await admin.auth.admin.listUsers({ page: 1, perPage: 1000 });
  if (listError) {
    return NextResponse.json({ error: listError.message }, { status: 500 });
  }

  const emailById = new Map(usersPage.users.map((u) => [u.id, u.email ?? ""]));

  const referrals = profiles.map((p) => ({
    email: emailById.get(p.id) || "(unknown)",
    createdAt: p.created_at as string,
    subscriptionStatus: p.subscription_status as string,
  }));

  return NextResponse.json({ referrals });
}
