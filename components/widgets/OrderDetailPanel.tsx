"use client";

import Link from "next/link";
import NextImage from "next/image";
import * as React from "react";

import { OrderStatusBadge } from "@/components/widgets/OrderStatusBadge";
import { Button } from "@/components/shared/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/shared/card";
import { Label } from "@/components/shared/label";
import { ORDER_STATUS_FLOW, orderStatusLabel } from "@/lib/crm/status-i18n";
import { formatPhoneDisplay } from "@/lib/crm/phone";
import { useOrders } from "@/lib/crm/orders-context";
import type { OrderStatus } from "@/lib/crm/types";

type Props = {
  orderId: string;
};

export function OrderDetailPanel({ orderId }: Props) {
  const { getOrder, dispatch, hydrated, useSupabaseOrders, updateStatusRemote } = useOrders();
  const order = getOrder(orderId);
  const [statusError, setStatusError] = React.useState<string | null>(null);

  if (!hydrated) {
    return <p className="text-sm text-muted-foreground">Загрузка…</p>;
  }

  if (!order) {
    return (
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">Заказ не найден.</p>
        <Button asChild variant="outline">
          <Link href="/orders">К списку заказов</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-heading text-2xl font-semibold tracking-tight">{order.ticketCode}</h1>
          <p className="text-sm text-muted-foreground">
            Создан {new Date(order.createdAt).toLocaleString("ru-RU")}
          </p>
        </div>
        <OrderStatusBadge status={order.status} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Клиент</CardTitle>
          <CardDescription>Данные для связи и выдачи.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-1 text-sm">
          <p>
            <span className="text-muted-foreground">Имя: </span>
            {order.clientName}
          </p>
          <p>
            <span className="text-muted-foreground">Телефон: </span>
            {formatPhoneDisplay(order.clientPhone)}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Статус заказа</CardTitle>
          <CardDescription>
            Переводите по этапам по мере работы — сохраняется сразу.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap items-end gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="order-status">Статус</Label>
            <select
              id="order-status"
              aria-label="Статус заказа"
              className="h-10 min-w-48 rounded-lg border border-input bg-transparent px-3 text-base focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
              value={order.status}
              onChange={async (e) => {
                setStatusError(null);
                const next = e.target.value as OrderStatus;
                if (useSupabaseOrders) {
                  const r = await updateStatusRemote(order.id, next);
                  if (!r.ok) {
                    setStatusError(r.error);
                  }
                  return;
                }
                dispatch({ type: "SET_STATUS", orderId: order.id, status: next });
              }}
            >
              {ORDER_STATUS_FLOW.map((s) => (
                <option key={s} value={s}>
                  {orderStatusLabel(s)}
                </option>
              ))}
            </select>
          </div>
          {statusError ? (
            <p className="w-full text-sm text-destructive" role="alert">
              {statusError}
            </p>
          ) : null}
        </CardContent>
      </Card>

      <section aria-labelledby="items-heading">
        <h2 id="items-heading" className="mb-3 text-base font-semibold">
          Пары в заказе
        </h2>
        <ol className="space-y-4">
          {order.items.map((item, idx) => (
            <li key={item.id}>
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">
                    Пара {idx + 1}: {item.brand} {item.model}
                  </CardTitle>
                  <CardDescription>
                    Цвет: {item.color || "—"}
                    {item.notes ? (
                      <>
                        <br />
                        Приметы: {item.notes}
                      </>
                    ) : null}
                  </CardDescription>
                </CardHeader>
                {item.photoUrls.length > 0 ? (
                  <CardContent>
                    <ul className="flex flex-wrap gap-2" aria-label={`Фото пары ${idx + 1}`}>
                      {item.photoUrls.map((src, i) => (
                        <li key={`${item.id}-ph-${i}`}>
                          <NextImage
                            src={src}
                            alt={`${item.brand} ${item.model}, фото ${i + 1}`}
                            width={128}
                            height={128}
                            unoptimized
                            className="h-32 w-32 rounded-lg border object-cover"
                          />
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                ) : null}
              </Card>
            </li>
          ))}
        </ol>
      </section>

      <Button asChild variant="ghost">
        <Link href="/orders">← Назад к списку</Link>
      </Button>
    </div>
  );
}
