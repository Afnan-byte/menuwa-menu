import type { Metadata } from "next";
import { Outfit, Playfair_Display } from "next/font/google";
import Script from "next/script";
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
        {process.env.NEXT_PUBLIC_CLARITY_PROJECT_ID && (
          <Script
            id="microsoft-clarity"
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{
              __html: `
                (function(c,l,a,r,i,t,y){
                    c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
                    t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
                    y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
                })(window, document, "clarity", "script", "${process.env.NEXT_PUBLIC_CLARITY_PROJECT_ID}");
              `,
            }}
          />
        )}
        {/* AuthProvider removed from root layout — only loaded in (dashboard) routes.
            Public menu pages (QR scans) no longer trigger Firebase Auth on load. */}
        {children}
        <Toaster position="bottom-right" />
      </body>
    </html>
  );
}
