import Link from "next/link";

import { ThemeModeToggle } from "@/components/widgets/ThemeModeToggle";
import { Button } from "@/components/shared/button";

export function MarketingShellLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="flex min-h-[100dvh] flex-col"
      style={{ paddingTop: "env(safe-area-inset-top)" }}
    >
      <header className="border-b bg-card shadow-page">
        <div className="mx-auto flex max-w-5xl flex-col gap-3 px-4 py-3 min-[420px]:flex-row min-[420px]:items-center min-[420px]:justify-between sm:px-5">
          <Link href="/" className="font-heading text-base font-semibold tracking-tight">
            CleanKicks CRM
          </Link>
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <ThemeModeToggle />
            <Button
              asChild
              className="min-h-11 w-full min-[420px]:w-auto sm:h-9 sm:px-3 sm:text-sm"
            >
              <Link href="/intake">К панели приёма</Link>
            </Button>
          </div>
        </div>
      </header>
      {children}
      <footer className="mt-auto border-t bg-muted/40 py-6 text-center text-xs text-muted-foreground">
        Демо-режим: данные заказов хранятся в браузере (localStorage), без сервера.
      </footer>
    </div>
  );
}
