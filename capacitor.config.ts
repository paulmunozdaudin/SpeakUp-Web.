import type { CapacitorConfig } from "@capacitor/cli";

/**
 * Native iOS app shell. It loads the live site (eloq-oral.com) instead of
 * a bundled copy, so every web deploy reaches the app immediately — the
 * app only needs a new App Store release when native code changes.
 * capacitor-www/ is just the offline fallback page.
 */
const config: CapacitorConfig = {
  appId: "com.eloqoral.app",
  appName: "Eloq",
  webDir: "capacitor-www",
  server: {
    url: "https://eloq-oral.com",
    errorPath: "index.html",
  },
  ios: {
    contentInset: "never",
    backgroundColor: "#09090b",
  },
  plugins: {
    LocalNotifications: {
      iconColor: "#6366f1",
    },
  },
};

export default config;
