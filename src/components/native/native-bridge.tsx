"use client";

import { useEffect } from "react";
import { isNativeApp, NATIVE_AUTH_CALLBACK } from "@/lib/native";

/**
 * Native-app glue, mounted once in the root layout (renders nothing):
 * when Google sign-in finishes in the system browser it redirects to
 * com.eloqoral.app://auth/callback?code=… — this catches that, closes the
 * browser sheet and finishes the login through the normal /auth/callback
 * route inside the app's web view (which holds the PKCE verifier cookie).
 * It also routes taps on the daily-reminder notification.
 */
export function NativeBridge() {
  useEffect(() => {
    if (!isNativeApp()) return;
    let remove: (() => void) | undefined;
    (async () => {
      const [{ App }, { Browser }, { LocalNotifications }] = await Promise.all([
        import("@capacitor/app"),
        import("@capacitor/browser"),
        import("@capacitor/local-notifications"),
      ]);
      const handle = await App.addListener("appUrlOpen", ({ url }) => {
        if (!url.startsWith(NATIVE_AUTH_CALLBACK)) return;
        Browser.close().catch(() => {});
        const query = url.slice(NATIVE_AUTH_CALLBACK.length);
        window.location.href = `/auth/callback${query}`;
      });
      // Tapping the daily reminder opens the challenges page.
      const tap = await LocalNotifications.addListener(
        "localNotificationActionPerformed",
        ({ notification }) => {
          const path = (notification.extra as { path?: string } | undefined)?.path;
          if (path) window.location.href = path;
        },
      );
      remove = () => {
        handle.remove();
        tap.remove();
      };
    })();
    return () => remove?.();
  }, []);

  return null;
}
