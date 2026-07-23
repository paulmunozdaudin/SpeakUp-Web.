import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ThemeProvider, themeInitScript } from "@/components/theme/theme-provider";
import { LocaleHtmlLang } from "@/components/theme/locale-html-lang";
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
  title: {
    default: "Eloq AI — Practice presentations with AI",
    template: "%s · Eloq AI",
  },
  description:
    "Get instant AI feedback on your clarity, confidence, pacing and delivery. Your personal public speaking coach, available 24/7.",
  applicationName: "Eloq AI",
  openGraph: {
    title: "Eloq AI — Practice presentations with AI",
    description:
      "Get instant AI feedback on your clarity, confidence, pacing and delivery.",
    siteName: "Eloq AI",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Eloq AI — Practice presentations with AI",
    description:
      "Get instant AI feedback on your clarity, confidence, pacing and delivery.",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fafafa" },
    { media: "(prefers-color-scheme: dark)", color: "#09090b" },
  ],
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
      </body>
    </html>
  );
}
