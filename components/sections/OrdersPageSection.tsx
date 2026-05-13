import { OrdersListCards } from "@/components/widgets/OrdersListCards";

export function OrdersPageSection() {
  return (
    <section aria-labelledby="orders-title" className="space-y-4">
      <header>
        <h1 id="orders-title" className="font-heading text-2xl font-semibold tracking-tight">
          Заказы
        </h1>
        <p className="text-sm text-muted-foreground">
          Все активные и завершённые приёмы в этом браузере.
        </p>
      </header>
      <OrdersListCards />
    </section>
  );
}
