"use client";

import Link from "next/link";

import { OrderStatusBadge } from "@/components/widgets/OrderStatusBadge";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/shared/card";
import { formatPhoneDisplay } from "@/lib/crm/phone";
import { useOrders } from "@/lib/crm/orders-context";

export function OrdersListCards() {
  const { orders, hydrated } = useOrders();

  if (!hydrated) {
    return <p className="text-sm text-muted-foreground">Загрузка…</p>;
  }

  if (!orders.length) {
    return (
      <p className="rounded-xl border border-dashed bg-muted/30 p-6 text-sm text-muted-foreground">
        Заказов пока нет. Создайте первый на странице «Приёмка».
      </p>
    );
  }

  return (
    <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {orders.map((order) => (
        <li key={order.id}>
          <Link
            href={`/orders/${order.id}`}
            className="block h-full rounded-xl ring-offset-background focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
          >
            <Card className="h-full transition-shadow hover:shadow-md">
              <CardHeader>
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="text-base">{order.ticketCode}</CardTitle>
                  <OrderStatusBadge status={order.status} />
                </div>
                <CardDescription>
                  {order.clientName} · {formatPhoneDisplay(order.clientPhone)}
                </CardDescription>
                <p className="text-xs text-muted-foreground">
                  Пар: {order.items.length} · {new Date(order.createdAt).toLocaleString("ru-RU")}
                </p>
              </CardHeader>
            </Card>
          </Link>
        </li>
      ))}
    </ul>
  );
}
