import { IntakeOrderForm } from "@/components/widgets/IntakeOrderForm";

export function IntakePageSection() {
  return (
    <section aria-labelledby="intake-title" className="mx-auto max-w-3xl space-y-2">
      <header>
        <h1 id="intake-title" className="font-heading text-2xl font-semibold tracking-tight">
          Приёмка обуви
        </h1>
        <p className="text-sm text-muted-foreground">
          Зафиксируйте клиента, пары и фото — дальше заказ попадёт в список и в выдачу по телефону.
        </p>
      </header>
      <IntakeOrderForm />
    </section>
  );
}
