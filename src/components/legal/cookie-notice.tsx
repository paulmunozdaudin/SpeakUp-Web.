"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Cookie, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useDict } from "@/lib/i18n";

const STORAGE_KEY = "eloq-cookie-notice-dismissed";

/**
 * Purely informational — we only use a necessary session cookie plus
 * local storage for preferences, neither of which requires opt-in consent
 * under GDPR/CNIL guidance (see /cookies). This just discloses that, once,
 * rather than asking for a choice that isn't actually there to make.
 */
export function CookieNotice() {
  const d = useDict();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (!localStorage.getItem(STORAGE_KEY)) setVisible(true);
    } catch {
      // localStorage unavailable (private mode, etc.) — skip silently.
    }
  }, []);

  function dismiss() {
    setVisible(false);
    try {
      localStorage.setItem(STORAGE_KEY, "1");
    } catch {
      // Ignore — worst case the notice reappears next visit.
    }
  }

  if (!visible) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-surface/95 px-4 py-4 backdrop-blur sm:px-6">
      <div className="mx-auto flex max-w-4xl flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-2.5 text-sm text-muted">
          <Cookie className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
          <p>
            {d.cookieNotice.text}{" "}
            <Link href="/cookies" className="underline hover:text-foreground">
              {d.cookieNotice.link}
            </Link>
          </p>
        </div>
        <Button size="sm" onClick={dismiss} className="w-full shrink-0 sm:w-auto">
          {d.cookieNotice.dismiss}
        </Button>
        <button
          aria-label={d.cookieNotice.dismiss}
          onClick={dismiss}
          className="absolute right-3 top-3 text-muted hover:text-foreground sm:hidden"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
