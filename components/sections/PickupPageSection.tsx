import { PickupSearchPanel } from "@/components/widgets/PickupSearchPanel";

export function PickupPageSection() {
  return (
    <section aria-labelledby="pickup-title" className="space-y-4">
      <header>
        <h1 id="pickup-title" className="font-heading text-2xl font-semibold tracking-tight">
          Выдача
        </h1>
        <p className="text-sm text-muted-foreground">
          Найдите заказ по телефону, откройте карточку и сверьте фото перед тем как отдать обувь.
        </p>
      </header>
      <PickupSearchPanel />
    </section>
  );
}
