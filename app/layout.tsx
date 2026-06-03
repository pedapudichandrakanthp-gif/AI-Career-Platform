import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";

import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "AI Career Platform",
    template: "%s | AI Career Platform"
  },
  description:
    "A production-ready AI career platform foundation for government and private job matching.",
  applicationName: "AI Career Platform",
  keywords: [
    "AI career platform",
    "job recommendations",
    "government jobs",
    "private jobs",
    "resume analysis"
  ],
  authors: [{ name: "AI Career Platform" }],
  creator: "AI Career Platform"
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  colorScheme: "light dark",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f8fafc" },
    { media: "(prefers-color-scheme: dark)", color: "#0f172a" }
  ]
};

interface RootLayoutProps {
  readonly children: ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
