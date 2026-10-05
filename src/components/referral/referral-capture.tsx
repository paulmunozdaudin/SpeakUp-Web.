"use client";

import { useEffect } from "react";
import { captureReferralCode } from "@/lib/referral";

/** Mounted once in the root layout — reads `?ref=<code>` on first load so
 *  it's remembered for signup even if the visitor lands on a deep page. */
export function ReferralCapture() {
  useEffect(() => {
    captureReferralCode(window.location.search);
  }, []);

  return null;
}
