"use client";

import { useDict, useLocale } from "@/lib/i18n";
import { CopyButton } from "@/components/ui/copy-button";

/** Only usable within Spain, so it's shown for the es locale only — other
 *  locales fall back to email, which works for anyone. */
const BIZUM_NUMBER = "659 66 08 63";
const SUPPORT_EMAIL = "paulmunozdaudin@gmail.com";

/**
 * Shown in place of the checkout error when Lemon Squeezy isn't configured
 * yet: tells the user how to pay by hand (Bizum in Spain, email elsewhere)
 * so we can activate Pro for them manually via /admin.
 */
export function ManualPaymentNotice() {
  const d = useDict();
  const { locale } = useLocale();

  if (locale === "es") {
    return (
      <div className="mt-2 flex flex-col items-center gap-1.5 text-center">
        <p className="text-xs text-muted">{d.billing.manualPaymentBizumIntro}</p>
        <CopyButton
          text={BIZUM_NUMBER}
          copyLabel={BIZUM_NUMBER}
          copiedLabel={d.profile.supportEmailCopied}
        />
      </div>
    );
  }

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
