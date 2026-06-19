"use client";

import React, { Suspense } from "react";
import { Header } from "@/shared/components/layout/header";
import { Footer } from "@/shared/components/layout/footer";
import { ScrollToTop } from "@/shared/components/layout/scroll-to-top";
import { useSearchParams } from "next/navigation";
import { cn } from "@/shared/lib/utils";

function MainLayoutContent({ children }: { children: React.ReactNode }) {
  const searchParams = useSearchParams();
  const search = searchParams.get('search');

  return (
    <main className={cn(
      "flex-1 w-full mx-auto px-4 py-8",
      search ? "max-w-4xl" : "max-w-7xl"
    )}>
      {children}
    </main>
  );
}

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground relative">
      <Suspense fallback={<div className="h-16 border-b bg-background" />}>
        <Header />
      </Suspense>
      <Suspense fallback={<div className="flex-1 w-full max-w-7xl mx-auto px-4 py-8 animate-pulse" />}>
        <MainLayoutContent>{children}</MainLayoutContent>
      </Suspense>
      <Footer />
    </div>
  );
}
