"use client";

import * as React from "react";

import { Button } from "@/components/shared/button";
import { Input } from "@/components/shared/input";
import { Label } from "@/components/shared/label";
import { Textarea } from "@/components/shared/textarea";
import { MAX_PHOTOS_PER_SHOE } from "@/lib/crm/constants";
import type { ShoeLine } from "@/lib/crm/types";

export type ShoeDraft = Omit<ShoeLine, "id">;

type Props = {
  index: number;
  value: ShoeDraft;
  onChange: (next: ShoeDraft) => void;
  onRemove: () => void;
  canRemove: boolean;
};

function readFilesAsDataUrls(files: FileList | null): Promise<string[]> {
  if (!files?.length) {
    return Promise.resolve([]);
  }
  const list = Array.from(files).slice(0, MAX_PHOTOS_PER_SHOE);
  return Promise.all(
    list.map(
      (file) =>
        new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(String(reader.result));
          reader.onerror = () => reject(reader.error);
          reader.readAsDataURL(file);
        })
    )
  );
}

export function ShoeLineFields({ index, value, onChange, onRemove, canRemove }: Props) {
  const inputId = `shoe-photos-${index}`;

  return (
    <fieldset className="space-y-3 rounded-xl border bg-muted/30 p-4">
      <legend className="px-1 text-sm font-medium text-foreground">Пара {index + 1}</legend>
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor={`brand-${index}`}>Бренд</Label>
          <Input
            id={`brand-${index}`}
            value={value.brand}
            onChange={(e) => onChange({ ...value, brand: e.target.value })}
            placeholder="Nike"
            autoComplete="off"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor={`model-${index}`}>Модель</Label>
          <Input
            id={`model-${index}`}
            value={value.model}
            onChange={(e) => onChange({ ...value, model: e.target.value })}
            placeholder="Air Force 1"
            autoComplete="off"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor={`color-${index}`}>Цвет</Label>
          <Input
            id={`color-${index}`}
            value={value.color}
            onChange={(e) => onChange({ ...value, color: e.target.value })}
            placeholder="Белый"
            autoComplete="off"
          />
        </div>
        <div className="space-y-1.5 sm:col-span-2">
          <Label htmlFor={`notes-${index}`}>Особые приметы / дефекты</Label>
          <Textarea
            id={`notes-${index}`}
            value={value.notes}
            onChange={(e) => onChange({ ...value, notes: e.target.value })}
            placeholder="Пятна, царапины до приёмки…"
            rows={2}
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor={inputId}>Фото (до {MAX_PHOTOS_PER_SHOE} шт.)</Label>
        <Input
          id={inputId}
          type="file"
          accept="image/*"
          multiple
          className="cursor-pointer"
          onChange={async (e) => {
            const urls = await readFilesAsDataUrls(e.target.files);
            onChange({ ...value, photoUrls: urls });
            e.target.value = "";
          }}
        />
        {value.photoUrls.length > 0 ? (
          <ul className="flex flex-wrap gap-2" aria-label={`Превью фото пары ${index + 1}`}>
            {value.photoUrls.map((src, i) => (
              <li key={`${src.slice(0, 40)}-${i}`} className="relative">
                {/* eslint-disable-next-line @next/next/no-img-element -- data URLs from intake */}
                <img
                  src={src}
                  alt={`Фото пары ${index + 1}, кадр ${i + 1}`}
                  className="size-20 rounded-lg border object-cover"
                />
                <Button
                  type="button"
                  size="icon-xs"
                  variant="destructive"
                  className="absolute -right-1 -top-1"
                  onClick={() =>
                    onChange({
                      ...value,
                      photoUrls: value.photoUrls.filter((_, j) => j !== i),
                    })
                  }
                  aria-label={`Удалить фото ${i + 1}`}
                >
                  ×
                </Button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-xs text-muted-foreground">
            Фото помогут не перепутать пару при выдаче.
          </p>
        )}
      </div>
      {canRemove ? (
        <div className="flex justify-end border-t pt-3">
          <Button type="button" variant="ghost" size="sm" onClick={onRemove}>
            Убрать пару
          </Button>
        </div>
      ) : null}
    </fieldset>
  );
}
