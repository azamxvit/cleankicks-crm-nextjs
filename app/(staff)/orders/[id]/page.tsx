import { OrderDetailPageSection } from "@/components/sections/OrderDetailPageSection";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function OrderDetailPage({ params }: Props) {
  const { id } = await params;
  return <OrderDetailPageSection orderId={id} />;
}
