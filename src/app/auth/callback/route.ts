import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

/**
 * OAuth / email-confirmation callback.
 * Supabase redirects here with a `code` we exchange for a session cookie.
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/dashboard";
  const ref = searchParams.get("ref");

  if (code) {
    const supabase = await getSupabaseServerClient();
    if (supabase) {
      const { data, error } = await supabase.auth.exchangeCodeForSession(code);
      if (!error) {
        if (ref && data.user) {
          await attachReferralIfMissing(data.user.id, ref);
        }
        return NextResponse.redirect(`${origin}${next}`);
      }
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`);
}

/**
 * Google sign-ups skip signUp()'s options.data (see auth.service.ts), so
 * the referral code arrives here instead and gets attached with the admin
 * client — the only way to write referred_by, since the protect trigger
 * (migration 00006) blocks the user's own session from touching it. Only
 * sets it if still empty, so a stale code left over in a returning user's
 * browser can't overwrite a real referral on a later login.
 */
async function attachReferralIfMissing(userId: string, ref: string) {
  const admin = getSupabaseAdminClient();
  if (!admin) return;

  const { data: profile } = await admin
    .from("profiles")
    .select("referred_by")
    .eq("id", userId)
    .maybeSingle();

  if (profile && !profile.referred_by) {
    await admin.from("profiles").update({ referred_by: ref }).eq("id", userId);
  }
}
