import type { Metadata } from "next";
import { Outfit, Playfair_Display } from "next/font/google";
import "./globals.css";
import { Toaster } from "react-hot-toast";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  display: "swap",
  preload: true,
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Menuwo - Digital Menu Solutions",
  description: "Modern QR-based digital menu for restaurants, cafes, and hotels.",
  icons: {
    icon: "/menuwo.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${outfit.variable} ${playfair.variable} font-sans antialiased`}
        suppressHydrationWarning
      >
        {/* AuthProvider removed from root layout — only loaded in (dashboard) routes.
            Public menu pages (QR scans) no longer trigger Firebase Auth on load. */}
        {children}
        <Toaster position="bottom-right" />
      </body>
    </html>
  );
}
