"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { ThemeModeToggle } from "@/components/widgets/ThemeModeToggle";
import { Button } from "@/components/shared/button";
import { useOrders } from "@/lib/crm/orders-context";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/intake", label: "Приёмка" },
  { href: "/orders", label: "Заказы" },
  { href: "/pickup", label: "Выдача" },
] as const;

export function AppShellLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { storageError, clearStorageError } = useOrders();

  return (
    <div className="flex min-h-full flex-col md:flex-row">
      <header className="border-b bg-card shadow-page md:h-[calc(100dvh)] md:w-56 md:shrink-0 md:border-r md:border-b-0 md:overflow-y-auto">
        <div className="flex flex-col gap-1 p-4">
          <p className="font-heading text-base font-semibold tracking-tight">CleanKicks</p>
          <p className="text-xs text-muted-foreground">Мойка обуви · панель приёма</p>
          <nav
            aria-label="Основное меню"
            className="mt-4 flex flex-wrap gap-2 md:flex-col md:gap-1"
          >
            {NAV.map((item) => {
              const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                    active
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
          <div className="mt-4 border-t pt-4">
            <p className="mb-2 text-xs font-medium text-muted-foreground">Тема</p>
            <ThemeModeToggle className="w-full justify-center" />
          </div>
        </div>
      </header>
      <div className="flex min-h-0 flex-1 flex-col">
        <main id="main-content" className="flex-1 space-y-4 p-4 md:p-6">
          {storageError ? (
            <div
              role="alert"
              className="flex flex-col gap-2 rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive sm:flex-row sm:items-center sm:justify-between"
            >
              <span>{storageError}</span>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="shrink-0 border-destructive/50"
                onClick={clearStorageError}
              >
                Понятно
              </Button>
            </div>
          ) : null}
          {children}
        </main>
      </div>
    </div>
  );
}
