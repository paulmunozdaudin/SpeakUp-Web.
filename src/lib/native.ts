"use client";

/**
 * Helpers for when the site runs inside the native iOS app (Capacitor,
 * see capacitor.config.ts). Everything here is a no-op on the regular web,
 * so callers never need their own platform checks beyond isNativeApp().
 */

import { Capacitor } from "@capacitor/core";

/** Custom URL scheme registered in ios/App/App/Info.plist — OAuth
 *  redirects back into the app through it. */
export const APP_URL_SCHEME = "com.eloqoral.app";
export const NATIVE_AUTH_CALLBACK = `${APP_URL_SCHEME}://auth/callback`;

export function isNativeApp(): boolean {
  return typeof window !== "undefined" && Capacitor.isNativePlatform();
}

/** Light tap feedback — silently skipped on the web. */
export async function hapticSuccess(): Promise<void> {
  if (!isNativeApp()) return;
  try {
    const { Haptics, NotificationType } = await import("@capacitor/haptics");
    await Haptics.notification({ type: NotificationType.Success });
  } catch {
    // Haptics unavailable — never worth surfacing.
  }
}

export async function hapticTap(): Promise<void> {
  if (!isNativeApp()) return;
  try {
    const { Haptics, ImpactStyle } = await import("@capacitor/haptics");
    await Haptics.impact({ style: ImpactStyle.Light });
  } catch {
    // Haptics unavailable — never worth surfacing.
  }
}

/** Native share sheet in the app, Web Share API (or clipboard) on the web.
 *  Resolves to "copied" when it fell back to copying the text. */
export async function shareText(text: string, url: string): Promise<"shared" | "copied" | "failed"> {
  try {
    if (isNativeApp()) {
      const { Share } = await import("@capacitor/share");
      await Share.share({ text, url });
      return "shared";
    }
    if (navigator.share) {
      await navigator.share({ text, url });
      return "shared";
    }
    await navigator.clipboard.writeText(`${text} ${url}`);
    return "copied";
  } catch {
    return "failed";
  }
}
