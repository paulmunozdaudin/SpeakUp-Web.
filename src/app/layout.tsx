import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { ThemeProvider, themeInitScript } from "@/components/theme/theme-provider";
import { LocaleHtmlLang } from "@/components/theme/locale-html-lang";
import { RegisterServiceWorker } from "@/components/pwa/register-service-worker";
import { CookieNotice } from "@/components/legal/cookie-notice";
import { ErrorReporter } from "@/components/monitoring/error-reporter";
import { ReferralCapture } from "@/components/referral/referral-capture";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://eloq-oral.com"),
  title: {
    default: "Eloq AI — Learn to communicate for real",
    template: "%s · Eloq AI",
  },
  description:
    "1-minute daily speaking challenges and instant AI feedback on your clarity, confidence and filler words. Level up your communication — and rehearse presentations, pitches and interviews.",
  applicationName: "Eloq AI",
  openGraph: {
    title: "Eloq AI — Learn to communicate for real",
    description:
      "1-minute daily speaking challenges and instant AI feedback on how you speak. Level up your communication.",
    siteName: "Eloq AI",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Eloq AI — Learn to communicate for real",
    description:
      "1-minute daily speaking challenges and instant AI feedback on how you speak. Level up your communication.",
  },
  // manifest.webmanifest is auto-linked by Next.js from src/app/manifest.ts.
  icons: {
    apple: "/icons/apple-touch-icon.png",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Eloq AI",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fafafa" },
    { media: "(prefers-color-scheme: dark)", color: "#09090b" },
  ],
  // Lets content draw edge-to-edge under the notch/status bar and home
  // indicator — required for env(safe-area-inset-*) below to do anything.
  // Matters most as an installed PWA (statusBarStyle: black-translucent).
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className="flex min-h-full flex-col">
        <LocaleHtmlLang />
        <ThemeProvider>{children}</ThemeProvider>
        <Analytics />
        <RegisterServiceWorker />
        <CookieNotice />
        <ErrorReporter />
        <ReferralCapture />
      </body>
    </html>
  );
}
