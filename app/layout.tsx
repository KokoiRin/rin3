import type { Metadata } from "next";
import "katex/dist/katex.min.css";
import "./globals.css";
import { assetPath } from "@/lib/site/sections";

export const metadata: Metadata = {
  title: "RIN III",
  description: "A personal archive for mathematics, computer science, and software engineering.",
  icons: {
    icon: assetPath("/entrance/math-sakura.webp"),
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
