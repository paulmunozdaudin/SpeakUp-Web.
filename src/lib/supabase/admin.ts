import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { SUPABASE_URL } from "./config";

const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";

export const isSupabaseAdminConfigured =
  SUPABASE_URL.length > 0 && SERVICE_ROLE_KEY.length > 0;

let client: SupabaseClient | null = null;

/**
 * Service-role Supabase client. Bypasses Row Level Security — server-only,
 * never import from a "use client" file. Used by the Stripe webhook to
 * update a user's subscription status without a browser session.
 */
export function getSupabaseAdminClient(): SupabaseClient | null {
  if (!isSupabaseAdminConfigured) return null;
  if (!client) {
    client = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
      auth: { autoRefreshToken: false, persistSession: false },
    });
  }
  return client;
}
