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
import { PhoneInput } from "@/components/shared/phone-input";
import { MAX_SHOES_PER_ORDER } from "@/lib/crm/constants";
import { useOrders } from "@/lib/crm/orders-context";
import { dataUrlByteSize } from "@/lib/crm/compress-image";
import { isValidKzPhone, normalizePhone } from "@/lib/crm/phone";

const MAX_ORDER_PHOTOS_BYTES = 3.5 * 1024 * 1024;

function emptyShoe(): ShoeDraft {
  return { brand: "", model: "", color: "", notes: "", photoUrls: [] };
}

export function IntakeOrderForm() {
  const router = useRouter();
  const { dispatch, hydrated, useSupabaseOrders, createOrderRemote } = useOrders();
  const [clientName, setClientName] = React.useState("");
  const [clientPhone, setClientPhone] = React.useState("");
  const [items, setItems] = React.useState<ShoeDraft[]>([emptyShoe()]);
  const [error, setError] = React.useState<string | null>(null);
  const [submitting, setSubmitting] = React.useState(false);

  const addShoe = () => {
    if (items.length >= MAX_SHOES_PER_ORDER) {
      return;
    }
    setItems((prev) => [...prev, emptyShoe()]);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!clientName.trim() || !clientPhone.trim()) {
      setError("Укажите имя и телефон клиента.");
      return;
    }
    if (!isValidKzPhone(clientPhone)) {
      setError("Укажите полный номер в формате 777-123-45-67.");
      return;
    }
    const phoneDigits = normalizePhone(clientPhone);
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
    const photoBytes = cleaned.reduce(
      (sum, item) => sum + item.photoUrls.reduce((s, url) => s + dataUrlByteSize(url), 0),
      0
    );
    if (photoBytes > MAX_ORDER_PHOTOS_BYTES) {
      setError("Слишком много фото в заказе. Уменьшите число пар или снимков.");
      return;
    }

    if (useSupabaseOrders) {
      setSubmitting(true);
      const res = await createOrderRemote({
        clientName: clientName.trim(),
        clientPhone: phoneDigits,
        items: cleaned,
      });
      setSubmitting(false);
      if (!res.ok) {
        setError(res.error);
        return;
      }
      setClientName("");
      setClientPhone("");
      setItems([emptyShoe()]);
      router.push("/orders");
      return;
    }

    dispatch({
      type: "CREATE_ORDER",
      payload: {
        clientName: clientName.trim(),
        clientPhone: phoneDigits,
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
        Загрузка…
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
            <PhoneInput
              id="client-phone"
              value={clientPhone}
              onValueChange={setClientPhone}
              aria-invalid={clientPhone.length > 0 && !isValidKzPhone(clientPhone)}
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
        <Button type="submit" size="lg" disabled={submitting}>
          {submitting ? "Сохранение…" : "Создать заказ"}
        </Button>
      </div>
    </form>
  );
}
