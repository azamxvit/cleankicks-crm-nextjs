import { ORDERS_STORAGE_KEY } from "@/lib/crm/constants";
import { normalizePhone } from "@/lib/crm/phone";
import type { CreateOrderInput, Order, OrderStatus } from "@/lib/crm/types";

export type OrdersState = {
  orders: Order[];
};

export type OrdersAction =
  | { type: "HYDRATE"; orders: Order[] }
  | { type: "CREATE_ORDER"; payload: CreateOrderInput }
  | { type: "SET_STATUS"; orderId: string; status: OrderStatus };

function ticketCode(existing: Order[]): string {
  for (let i = 0; i < 20; i += 1) {
    const code = `CK-${String(Math.floor(10000 + Math.random() * 90000))}`;
    if (!existing.some((o) => o.ticketCode === code)) {
      return code;
    }
  }
  return `CK-${Date.now().toString(36).toUpperCase()}`;
}

export function ordersReducer(state: OrdersState, action: OrdersAction): OrdersState {
  switch (action.type) {
    case "HYDRATE":
      return { orders: action.orders };
    case "CREATE_ORDER": {
      const now = new Date().toISOString();
      const order: Order = {
        id: crypto.randomUUID(),
        ticketCode: ticketCode(state.orders),
        clientName: action.payload.clientName.trim(),
        clientPhone: normalizePhone(action.payload.clientPhone),
        status: "received",
        items: action.payload.items.map((item) => ({
          id: crypto.randomUUID(),
          brand: item.brand.trim(),
          model: item.model.trim(),
          color: item.color.trim(),
          notes: item.notes.trim(),
          photoUrls: [...item.photoUrls],
        })),
        createdAt: now,
        updatedAt: now,
      };
      return { orders: [order, ...state.orders] };
    }
    case "SET_STATUS": {
      const now = new Date().toISOString();
      return {
        orders: state.orders.map((o) =>
          o.id === action.orderId ? { ...o, status: action.status, updatedAt: now } : o
        ),
      };
    }
    default:
      return state;
  }
}

export function loadOrdersFromStorage(): Order[] | null {
  if (typeof window === "undefined") {
    return null;
  }
  try {
    const raw = localStorage.getItem(ORDERS_STORAGE_KEY);
    if (!raw) {
      return null;
    }
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) {
      return null;
    }
    return parsed as Order[];
  } catch {
    return null;
  }
}

export function saveOrdersToStorage(orders: Order[]) {
  if (typeof window === "undefined") {
    return;
  }
  localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(orders));
}
