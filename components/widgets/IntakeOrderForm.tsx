"use client";

import * as React from "react";
import { useRouter } from "next/navigation";

import { ShoeLineFields, type ShoeDraft } from "@/components/widgets/ShoeLineFields";
import { Button } from "@/components/shared/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/shared/card";
import { Input } from "@/components/shared/input";
import { Label } from "@/components/shared/label";
import { MAX_SHOES_PER_ORDER } from "@/lib/crm/constants";
import { useOrders } from "@/lib/crm/orders-context";

function emptyShoe(): ShoeDraft {
  return { brand: "", model: "", color: "", notes: "", photoUrls: [] };
}

export function IntakeOrderForm() {
  const router = useRouter();
  const { dispatch, hydrated } = useOrders();
  const [clientName, setClientName] = React.useState("");
  const [clientPhone, setClientPhone] = React.useState("");
  const [items, setItems] = React.useState<ShoeDraft[]>([emptyShoe()]);
  const [error, setError] = React.useState<string | null>(null);

  const addShoe = () => {
    if (items.length >= MAX_SHOES_PER_ORDER) {
      return;
    }
    setItems((prev) => [...prev, emptyShoe()]);
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!clientName.trim() || !clientPhone.trim()) {
      setError("Укажите имя и телефон клиента.");
      return;
    }
    const cleaned = items.map((s) => ({
      ...s,
      brand: s.brand.trim(),
      model: s.model.trim(),
      color: s.color.trim(),
      notes: s.notes.trim(),
    }));
    const invalid = cleaned.some((s) => !s.brand || !s.model);
    if (invalid) {
      setError("Для каждой пары укажите бренд и модель.");
      return;
    }
    const noPhotos = cleaned.some((s) => s.photoUrls.length === 0);
    if (noPhotos) {
      setError("Добавьте хотя бы одно фото каждой пары — так проще выдать без путаницы.");
      return;
    }
    dispatch({
      type: "CREATE_ORDER",
      payload: {
        clientName: clientName.trim(),
        clientPhone: clientPhone.trim(),
        items: cleaned,
      },
    });
    setClientName("");
    setClientPhone("");
    setItems([emptyShoe()]);
    router.push("/orders");
  };

  if (!hydrated) {
    return (
      <p className="text-sm text-muted-foreground" role="status">
        Загрузка локальных заказов…
      </p>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-6" noValidate>
      <Card>
        <CardHeader>
          <CardTitle>Клиент</CardTitle>
          <CardDescription>Контакты для связи и поиска при выдаче.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="client-name">Имя</Label>
            <Input
              id="client-name"
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              autoComplete="name"
              placeholder="Иван"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="client-phone">Телефон</Label>
            <Input
              id="client-phone"
              type="tel"
              inputMode="tel"
              value={clientPhone}
              onChange={(e) => setClientPhone(e.target.value)}
              autoComplete="tel"
              placeholder="+7 900 000-00-00"
            />
          </div>
        </CardContent>
      </Card>

      <section aria-labelledby="shoes-heading" className="space-y-3">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <div>
            <h2 id="shoes-heading" className="text-base font-semibold">
              Обувь
            </h2>
            <p className="text-sm text-muted-foreground">Можно несколько пар в одном заказе.</p>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addShoe}
            disabled={items.length >= MAX_SHOES_PER_ORDER}
          >
            Добавить пару
          </Button>
        </div>
        <div className="space-y-4">
          {items.map((row, index) => (
            <ShoeLineFields
              key={index}
              index={index}
              value={row}
              onChange={(next) => setItems((prev) => prev.map((p, i) => (i === index ? next : p)))}
              onRemove={() => setItems((prev) => prev.filter((_, i) => i !== index))}
              canRemove={items.length > 1}
            />
          ))}
        </div>
      </section>

      {error ? (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}

      <div className="flex justify-end border-t pt-4">
        <Button type="submit" size="lg">
          Создать заказ
        </Button>
      </div>
    </form>
  );
}
