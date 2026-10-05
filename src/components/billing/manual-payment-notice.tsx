"use client";

import { useDict } from "@/lib/i18n";
import { CopyButton } from "@/components/ui/copy-button";

const SUPPORT_EMAIL = "paulmunozdaudin@gmail.com";

/**
 * Shown in place of the checkout error when Lemon Squeezy isn't configured
 * yet: tells the user to email us so we can activate Pro for them manually
 * via /admin. Same message in every locale for now — a Bizum option for
 * Spain can come back once there's a PayPal equivalent for everyone else.
 */
export function ManualPaymentNotice() {
  const d = useDict();

  return (
    <div className="mt-2 flex flex-col items-center gap-1.5 text-center">
      <p className="text-xs text-muted">{d.billing.manualPaymentEmailIntro}</p>
      <CopyButton
        text={SUPPORT_EMAIL}
        copyLabel={SUPPORT_EMAIL}
        copiedLabel={d.profile.supportEmailCopied}
      />
    </div>
  );
}
