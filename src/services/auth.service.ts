"use client";

/**
 * Auth service: thin, typed wrapper around Supabase Auth.
 * All UI components talk to this layer, never to Supabase directly,
 * so swapping/extending the auth backend stays a one-file change.
 */

import { track } from "@vercel/analytics";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

export interface AuthResult {
  ok: boolean;
  error?: string;
  /** True when Supabase requires email confirmation before first login. */
  needsEmailConfirmation?: boolean;
}

const NOT_CONFIGURED_ERROR =
  "Supabase is not configured yet. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to your environment.";

export async function signUp(
  fullName: string,
  email: string,
  password: string,
): Promise<AuthResult> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) return { ok: false, error: NOT_CONFIGURED_ERROR };

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName },
      emailRedirectTo: `${window.location.origin}/auth/callback`,
    },
  });

  if (error) return { ok: false, error: error.message };
  track("signup_completed");
  return {
    ok: true,
    needsEmailConfirmation: data.user !== null && data.session === null,
  };
}

/** Redirects the browser to Google's consent screen; on success the user
 *  lands back on /auth/callback, which exchanges the code for a session.
 *  Only resolves here if something goes wrong before the redirect even
 *  starts (e.g. the Google provider isn't enabled in Supabase yet). */
export async function signInWithGoogle(): Promise<AuthResult> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) return { ok: false, error: NOT_CONFIGURED_ERROR };

  const { error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
      // Without this, Google silently reuses whatever account is already
      // signed in on the device instead of letting people pick — a problem
      // for anyone with more than one Google account (e.g. personal +
      // school).
      queryParams: { prompt: "select_account" },
    },
  });
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

export async function signIn(
  email: string,
  password: string,
): Promise<AuthResult> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) return { ok: false, error: NOT_CONFIGURED_ERROR };

  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

export async function signOut(): Promise<AuthResult> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) return { ok: false, error: NOT_CONFIGURED_ERROR };

  const { error } = await supabase.auth.signOut();
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

export async function requestPasswordReset(email: string): Promise<AuthResult> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) return { ok: false, error: NOT_CONFIGURED_ERROR };

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/reset-password`,
  });
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

export async function updatePassword(newPassword: string): Promise<AuthResult> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) return { ok: false, error: NOT_CONFIGURED_ERROR };

  const { error } = await supabase.auth.updateUser({ password: newPassword });
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}
