import Link from "next/link";

import { Button } from "@/components/shared/button";

export function HomeHeroSection() {
  return (
    <main className="mx-auto flex max-w-5xl flex-1 flex-col justify-center gap-8 px-4 pt-6 pb-10 max-[767px]:pb-12 sm:px-5 md:flex-row md:items-center md:py-24">
      <div className="flex-1 space-y-5">
        <h1 className="font-heading text-balance text-2xl font-semibold tracking-tight sm:text-3xl md:text-4xl">
          CleanKicks CRM — приёмка и выдача без путаницы
        </h1>
        <p className="max-w-xl text-base text-muted-foreground sm:text-lg">
          Фото каждой пары, контакт клиента и статусы заказа в одной панели. Подключение к Supabase
          и SMS можно добавить позже — сейчас интерфейс работает в демо-режиме в браузере.
        </p>
        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          <Button asChild size="lg" className="min-h-12 w-full sm:w-auto sm:min-h-11">
            <Link href="/intake">Открыть приёмку</Link>
          </Button>
          <Button
            asChild
            variant="outline"
            size="lg"
            className="min-h-12 w-full sm:w-auto sm:min-h-11"
          >
            <Link href="/orders">Список заказов</Link>
          </Button>
        </div>
      </div>
      <aside
        className="flex-1 rounded-2xl border bg-card p-5 text-sm shadow-sm sm:p-6"
        aria-label="Кратко о процессе"
      >
        <h2 className="mb-3 font-medium">Как пользоваться</h2>
        <ol className="list-decimal space-y-2 pl-5 text-muted-foreground">
          <li>На приёмке введите клиента и каждую пару с фото.</li>
          <li>Меняйте статус по мере мойки.</li>
          <li>На выдаче найдите заказ по телефону и сверьте снимки.</li>
        </ol>
      </aside>
    </main>
  );
}
