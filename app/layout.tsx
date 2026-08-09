import type { Metadata, Viewport } from "next";
import { Oswald, IBM_Plex_Sans, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";

// next/font downloads and self-hosts these at build time instead of
// fetching from Google Fonts at runtime — faster load, and it works even
// if the phone is offline once cached, which matters for a PWA.
const oswald = Oswald({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["500", "600", "700"],
});
const plexSans = IBM_Plex_Sans({
  subsets: ["latin"],
  variable: "--font-body",
  weight: ["400", "500", "600"],
});
const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: "Grainline",
  description: "A fabric library and study tool for fashion design students.",
  manifest: "/manifest.json",
  icons: {
    icon: "/icons/icon-512.png",
    apple: "/apple-touch-icon.png",
  },
  appleWebApp: {
    // These three lines are what make "Add to Home Screen" open full-screen
    // with no Safari chrome, instead of just bookmarking the page.
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Grainline",
  },
};

export const viewport: Viewport = {
  themeColor: "#1C1A18",
  // viewport-fit=cover lets the app draw under the iPhone's notch/home
  // indicator area, which is part of what makes it feel native rather than
  // like a browser tab — combine with CSS env(safe-area-inset-*) in
  // components that sit at the very top/bottom of the screen.
  viewportFit: "cover",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${oswald.variable} ${plexSans.variable} ${plexMono.variable}`}>
      <body>{children}</body>
    </html>
  );
}
