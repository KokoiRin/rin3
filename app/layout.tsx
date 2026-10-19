import type { Metadata, Viewport } from "next";
import "katex/dist/katex.min.css";
import "./globals.css";
import { assetPath } from "@/lib/site/sections";
import ThemeControl from "@/components/theme-control";

export const metadata: Metadata = {
  title: "RIN III",
  description: "A personal archive for mathematics, computer science, and software engineering.",
  manifest: assetPath("/manifest.webmanifest"),
  appleWebApp: {
    capable: true,
    title: "RIN III",
    statusBarStyle: "default",
  },
  icons: {
    icon: assetPath("/entrance/math-sakura.webp"),
    apple: assetPath("/icons/apple-touch-icon.png"),
  },
};

export const viewport: Viewport = {
  themeColor: "#121713",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="stylesheet" href={assetPath("/theme.css")} />
        {/* Apply saved appearance before the first paint, including static exports. */}
        {/* eslint-disable-next-line @next/next/no-sync-scripts */}
        <script src={assetPath("/theme.js")} />
      </head>
      <body>
        {children}
        <ThemeControl />
      </body>
    </html>
  );
}
