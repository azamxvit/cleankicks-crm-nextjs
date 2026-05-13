import { Badge } from "@/components/shared/badge";
import { orderStatusLabel } from "@/lib/crm/status-i18n";
import type { OrderStatus } from "@/lib/crm/types";

const VARIANT: Record<OrderStatus, "default" | "secondary" | "outline"> = {
  received: "secondary",
  in_progress: "default",
  ready: "outline",
  completed: "outline",
};

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  return <Badge variant={VARIANT[status]}>{orderStatusLabel(status)}</Badge>;
}
