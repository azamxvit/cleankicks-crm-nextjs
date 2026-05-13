import { OrderDetailPanel } from "@/components/widgets/OrderDetailPanel";

type Props = {
  orderId: string;
};

export function OrderDetailPageSection({ orderId }: Props) {
  return (
    <section aria-label="Карточка заказа" className="mx-auto max-w-3xl">
      <OrderDetailPanel key={orderId} orderId={orderId} />
    </section>
  );
}
