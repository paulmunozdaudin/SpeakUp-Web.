import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

/**
 * POST /api/account/delete — permanently deletes the signed-in user's
 * account. Deleting the auth user cascades to their profile and every
 * practice session (see migration 00001). Required by the App Store for
 * any app that lets people create an account.
 */
export async function POST() {
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

  const admin = getSupabaseAdminClient();
  if (!admin) {
    return NextResponse.json(
      { error: "SUPABASE_SERVICE_ROLE_KEY is not configured" },
      { status: 503 },
    );
  }

  const { error } = await admin.auth.admin.deleteUser(user.id);
  if (error) {
    console.error("[account/delete] failed:", error.message);
    return NextResponse.json({ error: "Could not delete the account." }, { status: 500 });
  }

  // Clears the session cookies for this browser too.
  await serverClient.auth.signOut().catch(() => {});
  return NextResponse.json({ ok: true });
}
