import type { Metadata } from "next";

import { SiteHeader } from "@/components/site-header";
import { StudyProvider } from "@/components/study-provider";

import "./globals.css";

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
    <html lang="zh-CN" suppressHydrationWarning>
      <body>
        <StudyProvider>
          <SiteHeader />
          {children}
        </StudyProvider>
      </body>
    </html>
  );
}
