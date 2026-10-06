"use client";

import { useEffect } from "react";
import { useUser } from "@/hooks/use-user";
import {
  captureReferralCode,
  clearStoredReferralCode,
  getStoredReferralCode,
} from "@/lib/referral";

/**
 * Mounted once in the root layout. Does two things:
 * 1. Reads `?ref=<code>` on first load and remembers it for signup.
 * 2. Once a session exists (any sign-in method), self-reports that stored
 *    code to /api/referral/attach — covers Google sign-ins, which never go
 *    through signUp()'s options.data the way email/password does.
 */
export function ReferralCapture() {
  const { user } = useUser();

  useEffect(() => {
    captureReferralCode(window.location.search);
  }, []);

  useEffect(() => {
    if (!user) return;
    const code = getStoredReferralCode();
    if (!code) return;

    fetch("/api/referral/attach", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code }),
    })
      .then((res) => {
        if (res.ok) clearStoredReferralCode();
      })
      .catch(() => {
        // Network error — code stays stored, we'll retry on the next load.
      });
  }, [user]);

  return null;
}
