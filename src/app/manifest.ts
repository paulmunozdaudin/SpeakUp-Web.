import type { MetadataRoute } from "next";

/**
 * PWA manifest — served at /manifest.webmanifest. Next.js wires the
 * <link rel="manifest"> tag automatically from this file, no manual head
 * entry needed.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Eloq AI",
    short_name: "Eloq AI",
    description:
      "Learn to communicate for real: 1-minute daily speaking challenges, presentation practice and instant AI feedback on clarity, confidence and delivery.",
    start_url: "/",
    display: "standalone",
    background_color: "#09090b",
    theme_color: "#09090b",
    orientation: "portrait-primary",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icons/maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
