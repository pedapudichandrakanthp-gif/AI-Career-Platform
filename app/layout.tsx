import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";

import "./globals.css";

import Navbar from "@/components/Navbar";
import ThemeProvider from "@/components/ThemeProvider";

export const metadata: Metadata = {
  title: {
    default: "AI Career Platform",
    template: "%s | AI Career Platform",
  },
  description:
    "A production-ready AI career platform foundation for government and private job matching.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

interface RootLayoutProps {
  readonly children: ReactNode;
}

export default function RootLayout({
  children,
}: RootLayoutProps) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-white text-slate-900 antialiased transition-colors dark:bg-slate-950 dark:text-white">
        <ThemeProvider>
          <Navbar />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
