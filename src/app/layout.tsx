import type { Metadata } from "next";

import { AppShell } from "@/components/app-shell";

import "./globals.css";

const themeScript = `
(() => {
  try {
    const theme = window.localStorage.getItem("you-deserve-theme");
    if (theme) {
      document.documentElement.dataset.theme = theme;
    }
  } catch (_) {}
})();
`;

export const metadata: Metadata = {
  title: "You Deserve | 双非上岸八股学习站",
  description: "面向双非本科同学的清晰八股文学习站，公开阅读，后续支持收藏、掌握状态和复习节奏。"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html data-theme="ocean" lang="zh-CN" suppressHydrationWarning>
      <head>
        <meta name="theme-color" content="#f6f9ff" />
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
