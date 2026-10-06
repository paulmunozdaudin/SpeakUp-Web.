"use client";

import { useDict } from "@/lib/i18n";
import { CopyButton } from "@/components/ui/copy-button";

/** Stopgap until Lemon Squeezy is fully set up (~Oct 18) — PayPal works
 *  internationally, unlike Bizum, so it's shown in every locale. Once
 *  Lemon Squeezy is configured, this notice stops appearing on its own
 *  (the API no longer returns "not configured"), so there's nothing here
 *  to revert by hand. */
const PAYPAL_NUMBER = "639582602";

/**
 * Shown in place of the checkout error when Lemon Squeezy isn't configured
 * yet: tells the user to send a PayPal payment so we can activate Pro for
 * them manually via /admin.
 */
export function ManualPaymentNotice() {
  const d = useDict();

  return (
    <div className="mt-2 flex flex-col items-center gap-1.5 text-center">
      <p className="text-xs text-muted">{d.billing.manualPaymentIntro}</p>
      <CopyButton
        text={PAYPAL_NUMBER}
        copyLabel={PAYPAL_NUMBER}
        copiedLabel={d.profile.supportEmailCopied}
      />
    </div>
  );
}
