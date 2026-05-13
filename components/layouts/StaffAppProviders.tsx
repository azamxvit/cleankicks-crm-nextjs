"use client";

import { AppShellLayout } from "@/components/layouts/AppShellLayout";
import { OrdersProvider } from "@/lib/crm/orders-context";

export function StaffAppProviders({ children }: { children: React.ReactNode }) {
  return (
    <OrdersProvider>
      <AppShellLayout>{children}</AppShellLayout>
    </OrdersProvider>
  );
}
