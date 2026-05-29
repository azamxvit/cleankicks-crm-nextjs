"use client";

import * as React from "react";
import Link from "next/link";

import { OrderStatusBadge } from "@/components/widgets/OrderStatusBadge";
import { Button } from "@/components/shared/button";
import { Label } from "@/components/shared/label";
import { PhoneInput } from "@/components/shared/phone-input";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/shared/card";
import { formatPhoneDisplay } from "@/lib/crm/phone";
import { useOrders } from "@/lib/crm/orders-context";

export function PickupSearchPanel() {
  const { findOrdersByPhoneQuery, hydrated } = useOrders();
  const [query, setQuery] = React.useState("");
  const results = React.useMemo(
    () => findOrdersByPhoneQuery(query),
    [findOrdersByPhoneQuery, query]
  );

  if (!hydrated) {
    return <p className="text-sm text-muted-foreground">Загрузка…</p>;
  }

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <div className="space-y-2">
        <Label htmlFor="pickup-phone">Телефон клиента</Label>
        <PhoneInput
          id="pickup-phone"
          value={query}
          onValueChange={setQuery}
          placeholder="777-123-45-67"
        />
      </div>

      {query.trim() && results.length === 0 ? (
        <p className="text-sm text-muted-foreground">Ничего не найдено.</p>
      ) : null}

      {results.length > 0 ? (
        <ul className="space-y-3" aria-live="polite">
          {results.map((order) => (
            <li key={order.id}>
              <Card>
                <CardHeader className="flex flex-row flex-wrap items-start justify-between gap-2">
                  <div>
                    <CardTitle className="text-base">{order.ticketCode}</CardTitle>
                    <CardDescription>
                      {order.clientName} · {formatPhoneDisplay(order.clientPhone)}
                    </CardDescription>
                  </div>
                  <OrderStatusBadge status={order.status} />
                </CardHeader>
                <div className="flex flex-wrap gap-2 px-4 pb-4">
                  <Button asChild size="sm">
                    <Link href={`/orders/${order.id}`}>Открыть заказ</Link>
                  </Button>
                  <p className="w-full text-xs text-muted-foreground">
                    Сверьте фото пар на странице заказа перед выдачей.
                  </p>
                </div>
              </Card>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
