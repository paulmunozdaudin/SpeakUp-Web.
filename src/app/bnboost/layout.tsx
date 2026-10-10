import type { Metadata } from "next";
import { Inter } from "next/font/google";

/**
 * BNBoost is a standalone brand living at /bnboost inside this Next.js app.
 * It intentionally does not touch the root layout, globals.css or any
 * Eloq AI component: font, metadata and styling are all scoped here so the
 * rest of the app is completely unaffected.
 */
const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-bnboost",
});

export const metadata: Metadata = {
  title: {
    absolute: "BNBoost — Vídeos cinematográficos con IA para Airbnb",
  },
  description:
    "Convierte tu Airbnb en una propiedad irresistible. Vídeos cinematográficos creados con IA que aumentan la confianza y las reservas de tu alojamiento.",
  openGraph: {
    title: "BNBoost — Vídeos cinematográficos con IA para Airbnb",
    description:
      "Tu propiedad merece más que fotos. Merece reservas. Vídeos premium para Airbnb entregados en 48 horas.",
    siteName: "BNBoost",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "BNBoost — Vídeos cinematográficos con IA para Airbnb",
    description: "Tu propiedad merece más que fotos. Merece reservas.",
  },
};

export default function BnboostLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      className={`${inter.variable} bg-white text-neutral-900 antialiased`}
      style={{ fontFamily: "var(--font-bnboost), Inter, system-ui, sans-serif" }}
    >
      {children}
    </div>
  );
}
