"use client";

import * as React from "react";
import { Laptop, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

import { Button } from "@/components/shared/button";
import { cn } from "@/lib/utils";

const modes = [
  { value: "light" as const, label: "Светлая", icon: Sun },
  { value: "dark" as const, label: "Тёмная", icon: Moon },
  { value: "system" as const, label: "Как в системе", icon: Laptop },
];

export function ThemeModeToggle({ className }: { className?: string }) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    const id = requestAnimationFrame(() => {
      setMounted(true);
    });
    return () => cancelAnimationFrame(id);
  }, []);

  if (!mounted) {
    return (
      <div
        className={cn(
          "flex h-8 gap-1 rounded-lg border border-transparent bg-muted/50 p-0.5",
          className
        )}
        aria-hidden
      >
        <span className="size-7 rounded-md bg-muted" />
        <span className="size-7 rounded-md bg-muted" />
        <span className="size-7 rounded-md bg-muted" />
      </div>
    );
  }

  const active = theme ?? "system";

  return (
    <div
      role="group"
      aria-label="Тема оформления"
      className={cn(
        "inline-flex gap-0.5 rounded-lg border border-border bg-muted/40 p-0.5 shadow-inner",
        className
      )}
    >
      {modes.map(({ value, label, icon: Icon }) => {
        const isActive = active === value;
        return (
          <Button
            key={value}
            type="button"
            size="icon-sm"
            variant={isActive ? "secondary" : "ghost"}
            className={cn("size-8 shrink-0 rounded-md", isActive && "shadow-sm")}
            onClick={() => setTheme(value)}
            aria-pressed={isActive}
            title={label}
          >
            <Icon className="size-4" aria-hidden />
            <span className="sr-only">{label}</span>
          </Button>
        );
      })}
    </div>
  );
}
