"use client";

import { useEffect } from "react";

/**
 * Registers the service worker after the page has fully loaded, so it
 * never competes with the initial page load for bandwidth/CPU. Renders
 * nothing — this is a side-effect-only component.
 */
export function RegisterServiceWorker() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    const register = () => {
      navigator.serviceWorker.register("/sw.js").catch(() => {
        // Installability/offline support is a nice-to-have — a failed
        // registration (unsupported browser, blocked storage, etc.)
        // should never break the app itself.
      });
    };

    if (document.readyState === "complete") {
      register();
    } else {
      window.addEventListener("load", register);
      return () => window.removeEventListener("load", register);
    }
  }, []);

  return null;
}
