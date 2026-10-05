const STORAGE_KEY = "eloq-referral-code";

/**
 * Reads `?ref=<code>` from a URL's search string and remembers it in
 * localStorage, so a creator's referral link still gets credited even if
 * the visitor browses around before signing up.
 */
export function captureReferralCode(search: string): void {
  const code = new URLSearchParams(search).get("ref");
  if (!code) return;
  try {
    localStorage.setItem(STORAGE_KEY, code);
  } catch {
    // Storage unavailable (private mode, blocked) — nothing to recover.
  }
}

/** Read back by auth.service's signUp() and attached to the new profile
 *  via the handle_new_user trigger (see migration 00006). */
export function getStoredReferralCode(): string | null {
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}
