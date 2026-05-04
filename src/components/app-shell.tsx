"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

import { SiteHeader } from "@/components/site-header";
import { StudyProvider } from "@/components/study-provider";

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  if (pathname?.startsWith("/admin")) {
    return <>{children}</>;
  }

  return (
    <StudyProvider>
      <SiteHeader />
      {children}
    </StudyProvider>
  );
}
