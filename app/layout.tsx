import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "铃有三剑",
  description: "以樱花、莲花与枫叶为引，记录数学、计算机与软件工程的学习札记。",
  icons: {
    icon: "/entrance/math-sakura.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
