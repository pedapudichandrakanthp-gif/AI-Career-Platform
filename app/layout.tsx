import type { Metadata, Viewport } from "next";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import type { ReactNode } from "react";

import "./globals.css";

import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import ThemeProvider from "@/components/ThemeProvider";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "AvsarGrid — AI-Powered Career Intelligence",
    template: "%s | AvsarGrid",
  },
  description:
    "AvsarGrid — AI-Powered Career Intelligence Platform. Find better opportunities faster with resume analysis, job matching, and personalized recommendations.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

interface RootLayoutProps {
  readonly children: ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${plusJakarta.variable} min-h-screen bg-[var(--background)] font-sans text-[var(--foreground)] antialiased transition-colors`}
      >
        <ThemeProvider>
          <Navbar />
          <div className="animate-fade-in">{children}</div>
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  );
}
