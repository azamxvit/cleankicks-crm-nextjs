import type { OrderStatus } from "@/lib/crm/types";

const LABELS: Record<OrderStatus, string> = {
  received: "Принят",
  in_progress: "В работе",
  ready: "Готов к выдаче",
  completed: "Выдан",
};

export function orderStatusLabel(status: OrderStatus): string {
  return LABELS[status];
}

export const ORDER_STATUS_FLOW: OrderStatus[] = ["received", "in_progress", "ready", "completed"];
